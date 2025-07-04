import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/axiosSetup';
import toast, { Toaster } from 'react-hot-toast';
import { Trash2, Edit, X, AlertTriangle, Plus, Car } from 'lucide-react';

// Modern Confirmation Modal Component with improved UX
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete", 
  cancelText = "Cancel", 
  loading = false 
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={!loading ? onClose : undefined}
        />
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {confirmText}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 sm:mt-0 sm:w-auto transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Vehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleNumber: '',
    unit: 'Day',
    rate: ''
  });
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, vehicle: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Vehicle number format validation
  const validateVehicleNumber = useCallback((vehicleNumber) => {
    // Format: MH-12-AB-1001 (State-District-Series-Number)
    const vehicleNumberRegex = /^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/;
    return vehicleNumberRegex.test(vehicleNumber);
  }, []);

  // Format vehicle number as user types
  const formatVehicleNumber = useCallback((value) => {
    // Remove all non-alphanumeric characters
    let cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    
    // Ensure proper format: ST(2 letters)-DD(2 digits)-LL(2 letters)-NNNN(4 digits)
    let formatted = '';
    
    // First part: State code (2 letters)
    if (cleaned.length > 0) {
      formatted += cleaned.slice(0, 2).replace(/[0-9]/g, ''); // Only letters
    }
    
    // Second part: District code (2 digits)
    if (cleaned.length > 2) {
      const digits = cleaned.slice(2).replace(/[A-Z]/g, ''); // Extract digits only
      if (digits.length > 0) {
        formatted += '-' + digits.slice(0, 2);
      }
    }
    
    // Third part: Series code (2 letters)
    if (cleaned.length > 4) {
      const letters = cleaned.slice(4).replace(/[0-9]/g, ''); // Extract letters only
      if (letters.length > 0) {
        formatted += '-' + letters.slice(0, 2);
      }
    }
    
    // Fourth part: Number (4 digits)
    if (cleaned.length > 6) {
      const finalDigits = cleaned.slice(6).replace(/[A-Z]/g, ''); // Extract digits only
      if (finalDigits.length > 0) {
        formatted += '-' + finalDigits.slice(0, 4);
      }
    }
    
    return formatted;
  }, []);

  // Fetch vehicles from API with retry logic
  const fetchVehicles = useCallback(async (retryCount = 0) => {
    setLoading(true);
    try {
      const response = await api.get('/user/vehicle');
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      
      // Retry logic for network errors
      if (retryCount < 2 && error.code === 'NETWORK_ERROR') {
        setTimeout(() => fetchVehicles(retryCount + 1), 1000);
        return;
      }
      
      toast.error('Error fetching vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add or update vehicle with improved optimistic updates
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
    
    // Store original state for rollback
    const originalVehicles = [...vehicles];
    
    try {
      let response;
      
      if (editingVehicle) {
        // Optimistically update the vehicle in the list
        const updatedVehicle = { 
          ...editingVehicle, 
          ...formData, 
          rate: parseFloat(formData.rate) 
        };
        setVehicles(prev => prev.map(v => v._id === editingVehicle._id ? updatedVehicle : v));
        
        // Update existing vehicle
        response = await api.patch(`/user/vehicle/${editingVehicle._id}`, formData);
        
        // Update with server response
        setVehicles(prev => prev.map(v => 
          v._id === editingVehicle._id ? { ...v, ...response.data } : v
        ));
        
        toast.success('Vehicle updated successfully!');
      } else {
        // Create temporary ID for optimistic update
        const tempId = `temp_${Date.now()}`;
        const newVehicle = {
          _id: tempId,
          ...formData,
          rate: parseFloat(formData.rate),
          date: new Date().toISOString()
        };
        
        // Optimistically add the new vehicle
        setVehicles(prev => [newVehicle, ...prev]);
        
        // Add new vehicle
        response = await api.post('/user/vehicle', formData);
        
        // Replace temporary vehicle with server response
        const serverVehicle = {
          ...response.data,
          date: response.data.date || new Date().toISOString()
        };
        
        setVehicles(prev => prev.map(v => 
          v._id === tempId ? serverVehicle : v
        ));
        
        toast.success('Vehicle added successfully!');
      }
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('Error saving vehicle:', error);
      
      // Revert optimistic update on error
      setVehicles(originalVehicles);
      
      // Handle specific error cases
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

  // Open delete confirmation modal
  const openDeleteModal = useCallback((vehicle) => {
    setDeleteModal({ isOpen: true, vehicle });
  }, []);

  // Close delete confirmation modal
  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, vehicle: null });
  }, []);

  // Delete vehicle with improved optimistic updates
  const handleDelete = async () => {
    const vehicleToDelete = deleteModal.vehicle;
    if (!vehicleToDelete) return;

    setDeleteLoading(true);
    
    // Store original state for rollback
    const originalVehicles = [...vehicles];
    
    // Optimistically remove the vehicle from the list
    setVehicles(prev => prev.filter(v => v._id !== vehicleToDelete._id));
    
    try {
      await api.delete(`/user/vehicle/${vehicleToDelete._id}`);
      toast.success('Vehicle deleted successfully!');
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      
      // Revert the optimistic update
      setVehicles(originalVehicles);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        toast.error('Vehicle not found. It may have been already deleted.');
        // Remove from local state anyway
        setVehicles(prev => prev.filter(v => v._id !== vehicleToDelete._id));
        closeDeleteModal();
      } else {
        toast.error('Error deleting vehicle. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Start editing vehicle
  const handleEdit = useCallback((vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleType: vehicle.vehicleType,
      vehicleNumber: vehicle.vehicleNumber,
      unit: vehicle.unit,
      rate: vehicle.rate.toString()
    });
    setShowForm(true);
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      vehicleType: '',
      vehicleNumber: '',
      unit: 'Day',
      rate: ''
    });
    setErrors({});
    setShowForm(false);
    setEditingVehicle(null);
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'vehicleNumber') {
      // Format vehicle number as user types
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [formatVehicleNumber, errors]);

  // Load vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <div className="space-y-6">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message={`Are you sure you want to delete ${deleteModal.vehicle?.vehicleType} (${deleteModal.vehicle?.vehicleNumber})? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteLoading}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicles</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your vehicle fleet</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Add/Edit Vehicle Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h3>
            <button
              onClick={resetForm}
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
                onClick={resetForm}
                disabled={submitLoading}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
{/* Vehicles List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle List</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0M9 17h6" />
            </svg>
            <p>No vehicles found. Add your first vehicle!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Unit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Date Added</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle, index) => (
                  <tr key={vehicle._id || index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0M9 17h6" />
                        </svg>
                        {vehicle.vehicleType}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {vehicle.vehicleNumber}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {vehicle.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        ₹ {vehicle.rate}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {vehicle.date ? new Date(vehicle.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(vehicle)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicle;