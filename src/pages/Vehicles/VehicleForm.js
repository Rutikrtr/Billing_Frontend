import React, { useState, useCallback } from 'react';
import { Car, X } from 'lucide-react';
import api from '../../utils/axiosSetup';
import toast from 'react-hot-toast';

const VehicleForm = ({ 
  editingVehicle, 
  onCancel, 
  onVehicleAdd, 
  onVehicleUpdate, 
  onError, 
  vehicles, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    vehicleType: editingVehicle?.vehicleType || '',
    vehicleNumber: editingVehicle?.vehicleNumber || '',
    unit: editingVehicle?.unit || 'Day',
    rate: editingVehicle?.rate?.toString() || ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Vehicle number format validation
  const validateVehicleNumber = useCallback((vehicleNumber) => {
    const vehicleNumberRegex = /^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/;
    return vehicleNumberRegex.test(vehicleNumber);
  }, []);

  // Format vehicle number as user types
  const formatVehicleNumber = useCallback((value) => {
    let cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    let formatted = '';
    
    if (cleaned.length > 0) {
      formatted += cleaned.slice(0, 2).replace(/[0-9]/g, '');
    }
    
    if (cleaned.length > 2) {
      const digits = cleaned.slice(2).replace(/[A-Z]/g, '');
      if (digits.length > 0) {
        formatted += '-' + digits.slice(0, 2);
      }
    }
    
    if (cleaned.length > 4) {
      const letters = cleaned.slice(4).replace(/[0-9]/g, '');
      if (letters.length > 0) {
        formatted += '-' + letters.slice(0, 2);
      }
    }
    
    if (cleaned.length > 6) {
      const finalDigits = cleaned.slice(6).replace(/[A-Z]/g, '');
      if (finalDigits.length > 0) {
        formatted += '-' + finalDigits.slice(0, 4);
      }
    }
    
    return formatted;
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'vehicleNumber') {
      const formattedValue = formatVehicleNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [formatVehicleNumber, errors]);

  // Add or update vehicle with optimistic updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.vehicleType.trim()) newErrors.vehicleType = 'Vehicle type is required';
    
    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required';
    } else if (!validateVehicleNumber(formData.vehicleNumber)) {
      newErrors.vehicleNumber = 'Vehicle number must be in format: MH-12-CD-1222 (State-District-Series-Number)';
    }
    
    if (!formData.rate || formData.rate <= 0) {
      newErrors.rate = 'Price per unit must be greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitLoading(true);
    
    // Store original vehicles state for potential rollback
    const originalVehicles = [...vehicles];
    
    try {
      let response;
      let optimisticVehicle;
      
      if (editingVehicle) {
        // Create optimistic updated vehicle
        optimisticVehicle = {
          ...editingVehicle,
          ...formData,
          rate: parseFloat(formData.rate)
        };
        
        // Update UI optimistically
        onVehicleUpdate(optimisticVehicle);
        
        // Make API call
        response = await api.patch(`/user/vehicle/${editingVehicle._id}`, formData);
        
        // Update with server response
        const serverVehicle = response.data.data || response.data;
        if (serverVehicle && serverVehicle._id) {
          onVehicleUpdate(serverVehicle);
        }
        
        toast.success('Vehicle updated successfully!');
      } else {
        // Create optimistic new vehicle (temporary ID until server response)
        optimisticVehicle = {
          _id: `temp_${Date.now()}`, // Temporary ID
          ...formData,
          rate: parseFloat(formData.rate),
          date: new Date().toISOString()
        };
        
        // Add to UI optimistically
        onVehicleAdd(optimisticVehicle);
        
        // Make API call
        response = await api.post('/user/vehicle', formData);
        
        // Replace temporary vehicle with server response
        const serverVehicle = response.data.data || response.data;
        if (serverVehicle && serverVehicle._id) {
          // Remove temporary vehicle and add real one
          onVehicleUpdate({
            ...serverVehicle,
            tempId: optimisticVehicle._id // Mark for replacement
          });
          
          // Clean up by replacing the temp vehicle
          setTimeout(() => {
            onVehicleUpdate(serverVehicle);
          }, 0);
        }
        
        toast.success('Vehicle added successfully!');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      
      // Revert optimistic update on error
      onError(originalVehicles);
      
      if (error.response?.status === 409) {
        toast.error('Vehicle number already exists. Please use a different number.');
        setErrors({ vehicleNumber: 'This vehicle number is already registered.' });
      } else if (error.response?.status === 422) {
        toast.error('Please check your input data and try again.');
      } else {
        toast.error(`Error ${editingVehicle ? 'updating' : 'adding'} vehicle. Please try again.`);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Type *
            </label>
            <div className="relative">
              <input
                type="text"
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                placeholder="e.g., Car, Truck, Motorcycle"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors ${
                  errors.vehicleType ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.vehicleType && (
              <p className="mt-1 text-sm text-red-600">{errors.vehicleType}</p>
            )}
          </div>

          <div>
            <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Number *
            </label>
            <div className="relative">
              <input
                type="text"
                id="vehicleNumber"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                placeholder="MH-12-CD-1222"
                maxLength={13}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors ${
                  errors.vehicleNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            {errors.vehicleNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Format: MH-12-CD-1222 (State-District-Series-Number)
            </p>
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unit *
            </label>
            <div className="relative">
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors"
              >
                <option value="Day">Day</option>
                <option value="Hours">Hours</option>
                <option value="Trip">Trip</option>
              </select>
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price Per Unit *
            </label>
            <div className="relative">
              <input
                type="number"
                id="rate"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors ${
                  errors.rate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            {errors.rate && (
              <p className="mt-1 text-sm text-red-600">{errors.rate}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {submitLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {editingVehicle ? 'Updating...' : 'Adding...'}
              </div>
            ) : (
              editingVehicle ? 'Update Vehicle' : 'Add Vehicle'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitLoading}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;