import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/axiosSetup';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmationModal from './ConfirmationModal';
import VehicleForm from './VehicleForm';
import VehicleList from './VehicleList';
import { Plus } from 'lucide-react';

const Vehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, vehicle: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  // Optimistically add new vehicle to the list
  const handleVehicleAdd = useCallback((newVehicle) => {
    setVehicles(prev => [newVehicle, ...prev]);
  }, []);

  // Optimistically update existing vehicle in the list
  const handleVehicleUpdate = useCallback((updatedVehicle) => {
    setVehicles(prev => 
      prev.map(vehicle => 
        vehicle._id === updatedVehicle._id ? updatedVehicle : vehicle
      )
    );
  }, []);

  // Handle API errors by reverting optimistic updates
  const handleVehicleError = useCallback((originalVehicles) => {
    setVehicles(originalVehicles);
  }, []);

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
    setShowForm(true);
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditingVehicle(null);
  }, []);

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
        <VehicleForm
          editingVehicle={editingVehicle}
          onCancel={resetForm}
          onVehicleAdd={handleVehicleAdd}
          onVehicleUpdate={handleVehicleUpdate}
          onError={handleVehicleError}
          vehicles={vehicles}
          onSuccess={resetForm}
        />
      )}

      {/* Vehicles List */}
      <VehicleList
        vehicles={vehicles}
        loading={loading}
        onEdit={handleEdit}
        onDelete={openDeleteModal}
      />
    </div>
  );
};

export default Vehicle;