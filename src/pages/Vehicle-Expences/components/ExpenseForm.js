import React, { useState, useEffect } from 'react';
import api from '../../../utils/axiosSetup';
import toast from 'react-hot-toast';
import { X, Save, Loader2 } from 'lucide-react';

const ExpenseForm = ({
  editingExpense,
  vehicles,
  onCancel,
  onExpenseAdd,
  onExpenseUpdate,
  onError,
  expenses,
  totalAmount,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    expenseType: '',
    description: '',
    amount: '',
    expenseDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Common expense types for suggestions
  const expenseTypes = [
    'Fuel',
    'Maintenance',
    'Insurance',
    'Registration',
    'Repair',
    'Oil Change',
    'Tire Replacement',
    'Service',
    'Toll',
    'Parking',
    'Cleaning',
    'Other'
  ];

  // Initialize form data
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        vehicleId: editingExpense.vehicleId._id || editingExpense.vehicleId,
        expenseType: editingExpense.expenseType || '',
        description: editingExpense.description || '',
        amount: editingExpense.amount?.toString() || '',
        expenseDate: editingExpense.expenseDate ? 
          new Date(editingExpense.expenseDate).toISOString().split('T')[0] : ''
      });
    } else {
      // Set current date as default
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        vehicleId: '',
        expenseType: '',
        description: '',
        amount: '',
        expenseDate: today
      });
    }
  }, [editingExpense]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Vehicle is required';
    }

    if (!formData.expenseType.trim()) {
      newErrors.expenseType = 'Expense type is required';
    } else if (formData.expenseType.length > 50) {
      newErrors.expenseType = 'Expense type cannot exceed 50 characters';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > 999999) {
      newErrors.amount = 'Amount cannot exceed 999,999';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Expense date is required';
    } else {
      const selectedDate = new Date(formData.expenseDate);
      const today = new Date();
      const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      
      if (selectedDate > maxDate) {
        newErrors.expenseDate = 'Expense date cannot be more than 1 year in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        vehicleId: formData.vehicleId,
        expenseType: formData.expenseType.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        expenseDate: formData.expenseDate
      };

      if (editingExpense) {
        // Update existing expense
        const response = await api.patch(`/user/vehicle-expense/${editingExpense._id}`, submitData);
        
        if (response.data.success) {
          onExpenseUpdate(response.data.data);
          toast.success('Expense updated successfully!');
          onSuccess();
        }
      } else {
        // Add new expense
        const response = await api.post('/user/vehicle-expense', submitData);
        
        if (response.data.success) {
          onExpenseAdd(response.data.data);
          toast.success('Expense added successfully!');
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      
      // Handle specific errors
      if (error.response?.status === 404) {
        toast.error('Vehicle not found. Please select a valid vehicle.');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid data provided');
      } else {
        toast.error('Error saving expense. Please try again.');
        
        // Revert optimistic updates on error
        if (onError) {
          onError(expenses, totalAmount);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vehicle Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vehicle <span className="text-red-500">*</span>
            </label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.vehicleId 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={loading}
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.vehicleType} - {vehicle.vehicleNumber}
                </option>
              ))}
            </select>
            {errors.vehicleId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.vehicleId}</p>
            )}
          </div>

          {/* Expense Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expense Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="expenseType"
              value={formData.expenseType}
              onChange={handleChange}
              list="expenseTypes"
              placeholder="e.g., Fuel, Maintenance"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.expenseType 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              maxLength={50}
              disabled={loading}
            />
            <datalist id="expenseTypes">
              {expenseTypes.map(type => (
                <option key={type} value={type} />
              ))}
            </datalist>
            {errors.expenseType && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expenseType}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              max="999999"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.amount 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={loading}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
            )}
          </div>

          {/* Expense Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expense Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="expenseDate"
              value={formData.expenseDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.expenseDate 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={loading}
            />
            {errors.expenseDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expenseDate}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description or notes about this expense"
            rows={3}
            maxLength={500}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none ${
              errors.description 
                ? 'border-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={loading}
          />
          <div className="flex justify-between mt-1">
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
              {formData.description.length}/500
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {editingExpense ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;