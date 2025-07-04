// src/pages/fuel/Fuel.js
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import api from '../../utils/axiosSetup';
import toast from 'react-hot-toast';
import PayByPetrolPumpModal from './components/PayByPetrolPumpModal';
import FuelHeader from './components/FuelHeader';
import FuelSummaryCards from './components/FuelSummaryCards';
import FuelEntryForm from './components/FuelEntryForm';
import PetrolPumpForm from './components/PetrolPumpForm';
import FuelEntriesTable from './components/FuelEntriesTable';
import PaymentModal from './components/PaymentModal';
import FuelDeleteModal from './components/FuelDeleteModal';

const Fuel = () => {
  const [fuelEntries, setFuelEntries] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [petrolPumps, setPetrolPumps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showPetrolPumpForm, setShowPetrolPumpForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFuelEntry, setSelectedFuelEntry] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayByPetrolPumpModal, setShowPayByPetrolPumpModal] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fuelEntryToDelete, setFuelEntryToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isMultipleDelete, setIsMultipleDelete] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState([]);

  // Petrol Pump Form state
  const [petrolPumpData, setPetrolPumpData] = useState({
    name: '',
    contactNumber: '',
    address: ''
  });

  // Fuel Form state
  const [fuelFormData, setFuelFormData] = useState({
    petrolPumpId: '',
    status: 'Pending',
    fuelEntries: [
      {
        vehicleNumber: '',
        driverName: '',
        fuelAmount: ''
      }
    ]
  });

  // Payment state
  const [paymentData, setPaymentData] = useState({ paidAmount: '' });

  const handlePaymentSuccess = () => {
    fetchFuelEntries();
    fetchPetrolPumps();
  };

  // Fetch data functions
  const fetchVehicles = async () => {
    try {
      const response = await api.get('/user/vehicle');
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to fetch vehicles');
    }
  };

  const fetchPetrolPumps = async () => {
    try {
      const response = await api.get('/fuel/getPetrolPumps');
      setPetrolPumps(response.data.data || []);
    } catch (error) {
      console.error('Error fetching petrol pumps:', error);
      toast.error('Failed to fetch petrol pumps');
    }
  };

  const fetchFuelEntries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/fuel/getFuelEntries');
      setFuelEntries(response.data.data || []);
    } catch (error) {
      console.error('Error fetching fuel entries:', error);
      setFuelEntries([]);
      toast.error('Failed to fetch fuel entries');
    } finally {
      setLoading(false);
    }
  };

  // Delete functions
  const confirmDeleteFuelEntry = async () => {
    if (!fuelEntryToDelete && !isMultipleDelete) return;

    setDeleteLoading(true);
    try {
      if (isMultipleDelete) {
        // Delete multiple entries
        const fuelIds = selectedEntries.map(entry => entry.groupId);
        
        const response = await api.delete('/fuel/deleteMultipleFuelEntries', {
          data: { fuelIds }
        });

        if (response.data.success) {
          toast.success(`Successfully deleted ${response.data.data.deletedCount} fuel entries`);
          setSelectedEntries([]);
          setSelectAll(false);
          fetchFuelEntries();
          fetchPetrolPumps();
        } else {
          toast.error(response.data.message || 'Failed to delete fuel entries');
        }
      } else {
        // Delete single entry
        const response = await api.delete(`/fuel/deleteFuelEntry/${fuelEntryToDelete._id}`);
        
        if (response.data.success) {
          toast.success('Fuel entry deleted successfully');
          fetchFuelEntries();
          fetchPetrolPumps();
        } else {
          toast.error(response.data.message || 'Failed to delete fuel entry');
        }
      }
      
      // Reset modal state
      setShowDeleteModal(false);
      setFuelEntryToDelete(null);
      setDeleteConfirmText('');
      setIsMultipleDelete(false);
    } catch (error) {
      console.error('Error deleting fuel entry:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete fuel entry');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFuelEntryToDelete(null);
    setDeleteConfirmText('');
    setIsMultipleDelete(false);
    setDeleteLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
    fetchPetrolPumps();
    fetchFuelEntries();
  }, []);

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Toaster position="top-right" />

      <FuelHeader 
        setShowFuelForm={setShowFuelForm}
        setShowPetrolPumpForm={setShowPetrolPumpForm}
        setShowPayByPetrolPumpModal={setShowPayByPetrolPumpModal}
      />

      <FuelSummaryCards fuelEntries={fuelEntries} filterStatus={filterStatus} searchTerm={searchTerm} />

      {showFuelForm && (
        <FuelEntryForm
          fuelFormData={fuelFormData}
          setFuelFormData={setFuelFormData}
          setShowFuelForm={setShowFuelForm}
          petrolPumps={petrolPumps}
          vehicles={vehicles}
          fetchFuelEntries={fetchFuelEntries}
        />
      )}

      {showPetrolPumpForm && (
        <PetrolPumpForm
          petrolPumpData={petrolPumpData}
          setPetrolPumpData={setPetrolPumpData}
          setShowPetrolPumpForm={setShowPetrolPumpForm}
          fetchPetrolPumps={fetchPetrolPumps}
        />
      )}

      <FuelEntriesTable
        fuelEntries={fuelEntries}
        loading={loading}
        filterStatus={filterStatus}
        searchTerm={searchTerm}
        setFilterStatus={setFilterStatus}
        setSearchTerm={setSearchTerm}
        setSelectedFuelEntry={setSelectedFuelEntry}
        setShowPaymentModal={setShowPaymentModal}
        setShowFuelForm={setShowFuelForm}
        setShowDeleteModal={setShowDeleteModal}
        setFuelEntryToDelete={setFuelEntryToDelete}
        selectedEntries={selectedEntries}
        setSelectedEntries={setSelectedEntries}
        setIsMultipleDelete={setIsMultipleDelete}
        selectAll={selectAll}
        setSelectAll={setSelectAll}
      />

      {showPaymentModal && selectedFuelEntry && (
        <PaymentModal
          selectedFuelEntry={selectedFuelEntry}
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          setShowPaymentModal={setShowPaymentModal}
          fetchFuelEntries={fetchFuelEntries}
        />
      )}

      <FuelDeleteModal
        showDeleteModal={showDeleteModal}
        fuelEntryToDelete={fuelEntryToDelete}
        deleteConfirmText={deleteConfirmText}
        setDeleteConfirmText={setDeleteConfirmText}
        confirmDeleteFuelEntry={confirmDeleteFuelEntry}
        cancelDelete={cancelDelete}
        deleteLoading={deleteLoading}
        isMultipleDelete={isMultipleDelete}
        selectedEntries={selectedEntries}
      />

      <PayByPetrolPumpModal
        isOpen={showPayByPetrolPumpModal}
        onClose={() => setShowPayByPetrolPumpModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Fuel;