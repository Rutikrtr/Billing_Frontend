// src/pages/fuel/Fuel.js
import React, { useState, useEffect } from 'react';
import PayByPetrolPumpModal from './PayByPetrolPumpModal';
import api from '../../utils/axiosSetup';
import toast, { Toaster } from 'react-hot-toast';
import { DollarSign } from 'lucide-react';

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
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showPayByPetrolPumpModal, setShowPayByPetrolPumpModal] = useState(false);

  // Petrol Pump Form state
  const [petrolPumpData, setPetrolPumpData] = useState({
    name: '',
    contactNumber: '',
    address: ''
  });
  const [petrolPumpErrors, setPetrolPumpErrors] = useState({});
  const [petrolPumpLoading, setPetrolPumpLoading] = useState(false);

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
  const [fuelFormErrors, setFuelFormErrors] = useState({});

  // Payment state
  const [paymentData, setPaymentData] = useState({ paidAmount: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handlePaymentSuccess = () => {
  fetchFuelEntries();
  fetchPetrolPumps();
};
  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const response = await api.get('/user/vehicle');
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to fetch vehicles');
    }
  };

  // Fetch petrol pumps
  const fetchPetrolPumps = async () => {
    try {
      const response = await api.get('/fuel/getPetrolPumps');
      setPetrolPumps(response.data.data || []);
    } catch (error) {
      console.error('Error fetching petrol pumps:', error);
      toast.error('Failed to fetch petrol pumps');
    }
  };

  // Fetch fuel entries
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

  // Add Petrol Pump
  const handlePetrolPumpSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!petrolPumpData.name.trim()) errors.name = 'Petrol pump name is required';
    if (!petrolPumpData.contactNumber.trim()) errors.contactNumber = 'Contact number is required';
    if (!petrolPumpData.address.trim()) errors.address = 'Address is required';

    if (Object.keys(errors).length > 0) {
      setPetrolPumpErrors(errors);
      return;
    }

    setPetrolPumpLoading(true);
    try {
      await api.post('/fuel/addPetrolPump',
        petrolPumpData
      );

      toast.success('Petrol pump added successfully!');
      setPetrolPumpData({ name: '', contactNumber: '', address: '' });
      setPetrolPumpErrors({});
      setShowPetrolPumpForm(false);
      await fetchPetrolPumps();
    } catch (error) {
      console.error('Error adding petrol pump:', error);
      toast.error(error.response?.data?.message || 'Error adding petrol pump');
    } finally {
      setPetrolPumpLoading(false);
    }
  };

  // Handle vehicle selection for fuel entries
  const handleVehicleChange = (index, vehicleNumber) => {
    const selectedVehicle = vehicles.find(v => v.vehicleNumber === vehicleNumber);
    const updatedEntries = [...fuelFormData.fuelEntries];

    updatedEntries[index] = {
      ...updatedEntries[index],
      vehicleNumber: vehicleNumber,
      driverName: selectedVehicle ? selectedVehicle.driverName || '' : ''
    };

    setFuelFormData(prev => ({
      ...prev,
      fuelEntries: updatedEntries
    }));

    // Clear errors
    if (fuelFormErrors[`fuelEntries.${index}.vehicleNumber`]) {
      const newErrors = { ...fuelFormErrors };
      delete newErrors[`fuelEntries.${index}.vehicleNumber`];
      setFuelFormErrors(newErrors);
    }
  };

  // Handle fuel entry input changes
  const handleFuelEntryChange = (index, field, value) => {
    const updatedEntries = [...fuelFormData.fuelEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    };

    setFuelFormData(prev => ({
      ...prev,
      fuelEntries: updatedEntries
    }));

    // Clear errors
    if (fuelFormErrors[`fuelEntries.${index}.${field}`]) {
      const newErrors = { ...fuelFormErrors };
      delete newErrors[`fuelEntries.${index}.${field}`];
      setFuelFormErrors(newErrors);
    }
  };

  // Add new fuel entry row
  const addFuelEntry = () => {
    setFuelFormData(prev => ({
      ...prev,
      fuelEntries: [
        ...prev.fuelEntries,
        { vehicleNumber: '', driverName: '', fuelAmount: '' }
      ]
    }));
  };

  // Remove fuel entry row
  const removeFuelEntry = (index) => {
    if (fuelFormData.fuelEntries.length > 1) {
      const updatedEntries = fuelFormData.fuelEntries.filter((_, i) => i !== index);
      setFuelFormData(prev => ({
        ...prev,
        fuelEntries: updatedEntries
      }));
    }
  };

  // Validate fuel form
  const validateFuelForm = () => {
    const errors = {};

    if (!fuelFormData.petrolPumpId) {
      errors.petrolPumpId = 'Please select a petrol pump';
    }

    fuelFormData.fuelEntries.forEach((entry, index) => {
      if (!entry.vehicleNumber.trim()) {
        errors[`fuelEntries.${index}.vehicleNumber`] = 'Vehicle number is required';
      }
      if (!entry.driverName.trim()) {
        errors[`fuelEntries.${index}.driverName`] = 'Driver name is required';
      }
      if (!entry.fuelAmount || parseFloat(entry.fuelAmount) <= 0) {
        errors[`fuelEntries.${index}.fuelAmount`] = 'Fuel amount must be greater than 0';
      }
    });

    return errors;
  };

  // Handle fuel form submission
  const handleFuelSubmit = async (e) => {
    e.preventDefault();

    const errors = validateFuelForm();
    if (Object.keys(errors).length > 0) {
      setFuelFormErrors(errors);
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        ...fuelFormData,
        fuelEntries: fuelFormData.fuelEntries.map(entry => ({
          ...entry,
          fuelAmount: parseFloat(entry.fuelAmount)
        }))
      };

      await api.post(
        '/fuel/addFuel',
        payload
      );

      toast.success('Fuel entries added successfully!');
      setFuelFormData({
        petrolPumpId: '',
        status: 'Pending',
        fuelEntries: [{ vehicleNumber: '', driverName: '', fuelAmount: '' }]
      });
      setFuelFormErrors({});
      setShowFuelForm(false);
      await fetchFuelEntries();
    } catch (error) {
      console.error('Error adding fuel entries:', error);
      toast.error(error.response?.data?.message || 'Error adding fuel entries');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (!paymentData.paidAmount || parseFloat(paymentData.paidAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setPaymentLoading(true);
    try {
      await api.post(
        '/fuel/payFuelEntry',
        {
          fuelId: selectedFuelEntry._id,
          paidAmount: parseFloat(paymentData.paidAmount)
        }
      );

      setShowPaymentModal(false);
      toast.success('Payment processed successfully!');
      setPaymentData({ paidAmount: '' });
      await fetchFuelEntries();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Error processing payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  // First, add this helper function after your existing helper functions (like formatDate)
  const flattenFuelEntries = (fuelEntries) => {
    return fuelEntries.flatMap(entryGroup =>
      entryGroup.fuelEntries.map(fuelEntry => ({
        ...fuelEntry,
        petrolPump: entryGroup.petrolPump,
        status: entryGroup.status,
        paidAmount: entryGroup.paidAmount,
        createdAt: entryGroup.date,
        groupId: entryGroup._id,
        totalGroupAmount: entryGroup.fuelEntries.reduce((sum, entry) => sum + entry.fuelAmount, 0)
      }))
    );
  };

  // Update the filtering logic before the return statement
  const flattenedFuelEntries = flattenFuelEntries(fuelEntries);

  const filteredFuelEntries = flattenedFuelEntries.filter(entry => {
    const matchesSearch =
      entry.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.petrolPump?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      '';
    const matchesStatus = filterStatus === 'All' || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });


  // Calculate totals
  const calculateTotals = () => {
    const totalAmount = filteredFuelEntries.reduce((sum, entry) => sum + (entry.fuelAmount || 0), 0);
    const paidAmount = fuelEntries.reduce((sum, group) => sum + (group.paidAmount || 0), 0);
    const pendingAmount = fuelEntries.reduce((sum, group) => {
      return sum + (group.status === 'Pending' ? group.fuelEntries.reduce((entrySum, entry) => entrySum + entry.fuelAmount, 0) : 0);
    }, 0);

    return {
      entryCount: filteredFuelEntries.length,
      totalAmount,
      paidAmount,
      pendingAmount
    };
  };


  // Load initial data
  useEffect(() => {
    fetchVehicles();
    fetchPetrolPumps();
    fetchFuelEntries();
  }, []);

  const totals = calculateTotals();

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fuel Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage fuel expenses across multiple petrol pumps</p>
        </div>
        <div className="flex gap-3">
          
          <button
            onClick={() => setShowPayByPetrolPumpModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            <DollarSign className="h-4 w-4" />
            Pay By Petrol Pump
          </button>
          <button
            onClick={() => setShowPetrolPumpForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Add Petrol Pump
          </button>

          <button
            onClick={() => setShowFuelForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Fuel Entry
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totals.entryCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totals.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{totals.paidAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{totals.pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {showFuelForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Add Fuel Entries</h3>

          <form onSubmit={handleFuelSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Petrol Pump *
              </label>
              <select
                value={fuelFormData.petrolPumpId}
                onChange={(e) => setFuelFormData(prev => ({ ...prev, petrolPumpId: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${fuelFormErrors.petrolPumpId ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Select petrol pump...</option>
                {petrolPumps.map(pump => (
                  <option key={pump._id} value={pump._id}>
                    {pump.name} - {pump.address}
                  </option>
                ))}
              </select>
              {fuelFormErrors.petrolPumpId && (
                <p className="mt-1 text-sm text-red-600">{fuelFormErrors.petrolPumpId}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Vehicle Entries</h4>
                <button
                  type="button"
                  onClick={addFuelEntry}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Entry
                </button>
              </div>

              <div className="space-y-4">
                {fuelFormData.fuelEntries.map((entry, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Entry #{index + 1}
                      </span>
                      {fuelFormData.fuelEntries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFuelEntry(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Vehicle Number *
                        </label>
                        <select
                          value={entry.vehicleNumber}
                          onChange={(e) => handleVehicleChange(index, e.target.value)}
                          className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${fuelFormErrors[`fuelEntries.${index}.vehicleNumber`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                          <option value="">Select vehicle...</option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle._id} value={vehicle.vehicleNumber}>
                              {vehicle.vehicleNumber}
                            </option>
                          ))}
                        </select>
                        {fuelFormErrors[`fuelEntries.${index}.vehicleNumber`] && (
                          <p className="mt-1 text-sm text-red-600">{fuelFormErrors[`fuelEntries.${index}.vehicleNumber`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Driver Name *
                        </label>
                        <input
                          type="text"
                          value={entry.driverName}
                          onChange={(e) => handleFuelEntryChange(index, 'driverName', e.target.value)}
                          placeholder="Driver name"
                          className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${fuelFormErrors[`fuelEntries.${index}.driverName`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {fuelFormErrors[`fuelEntries.${index}.driverName`] && (
                          <p className="mt-1 text-sm text-red-600">{fuelFormErrors[`fuelEntries.${index}.driverName`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Fuel Amount (₹) *
                        </label>
                        <input
                          type="number"
                          value={entry.fuelAmount}
                          onChange={(e) => handleFuelEntryChange(index, 'fuelAmount', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${fuelFormErrors[`fuelEntries.${index}.fuelAmount`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {fuelFormErrors[`fuelEntries.${index}.fuelAmount`] && (
                          <p className="mt-1 text-sm text-red-600">{fuelFormErrors[`fuelEntries.${index}.fuelAmount`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => {
                  setShowFuelForm(false);
                  setFuelFormData({
                    petrolPumpId: '',
                    status: 'Pending',
                    fuelEntries: [{ vehicleNumber: '', driverName: '', fuelAmount: '' }]
                  });
                  setFuelFormErrors({});
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitLoading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {submitLoading ? 'Adding...' : 'Add Fuel Entries'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Petrol Pump Form Modal */}
      {showPetrolPumpForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Add New Petrol Pump</h3>

              <form onSubmit={handlePetrolPumpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Petrol Pump Name *
                  </label>
                  <input
                    type="text"
                    value={petrolPumpData.name}
                    onChange={(e) => setPetrolPumpData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter petrol pump name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${petrolPumpErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {petrolPumpErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{petrolPumpErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={petrolPumpData.contactNumber}
                    onChange={(e) => setPetrolPumpData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    placeholder="Enter contact number"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${petrolPumpErrors.contactNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {petrolPumpErrors.contactNumber && (
                    <p className="mt-1 text-sm text-red-600">{petrolPumpErrors.contactNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={petrolPumpData.address}
                    onChange={(e) => setPetrolPumpData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter full address"
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${petrolPumpErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {petrolPumpErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{petrolPumpErrors.address}</p>
                  )}
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPetrolPumpForm(false);
                      setPetrolPumpData({ name: '', contactNumber: '', address: '' });
                      setPetrolPumpErrors({});
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={petrolPumpLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {petrolPumpLoading && (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {petrolPumpLoading ? 'Adding...' : 'Add Petrol Pump'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Entries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fuel Entries</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredFuelEntries.length} entries
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="px-6 py-4 flex flex-col md:flex-row gap-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Entries
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by vehicle, driver, or petrol pump..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex-1 md:flex-none md:w-48">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        {loading ? (
          // ... (keep the loading state as is)
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600 dark:text-gray-400">Loading fuel entries...</span>
            </div>
          </div>
        ) : filteredFuelEntries.length === 0 ? (
          // ... (keep the empty state as is, but update the message to reflect search/filter)
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No fuel entries found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterStatus !== 'All'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first fuel entry'}
            </p>
            {!searchTerm && filterStatus === 'All' && (
              <button
                onClick={() => setShowFuelForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add First Entry
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vehicles & Drivers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Petrol Pump
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {fuelEntries
                  .filter(entry => {
                    const matchesStatus = filterStatus === 'All' || entry.status === filterStatus;
                    const matchesSearch = searchTerm === '' ||
                      entry.petrolPump?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      entry.fuelEntries.some(fuel =>
                        fuel.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        fuel.driverName.toLowerCase().includes(searchTerm.toLowerCase())
                      );
                    return matchesStatus && matchesSearch;
                  })
                  .map((entry, index) => {
                    const totalAmount = entry.fuelEntries.reduce((sum, fuel) => sum + (fuel.fuelAmount || 0), 0);

                    return (
                      <tr key={entry._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="space-y-3">
                            {entry.fuelEntries.map((fuel, fuelIndex) => (
                              <div key={fuelIndex} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {fuel.vehicleNumber}
                                      </div>
                                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {fuel.driverName}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-shrink-0 ml-4">
                                  <div className="text-sm font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                                    ₹{fuel.fuelAmount?.toLocaleString() || '0'}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Total Summary for Multiple Entries */}
                            {entry.fuelEntries.length > 1 && (
                              <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Total ({entry.fuelEntries.length} vehicles)
                                  </div>
                                  <div className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                    ₹{totalAmount.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {entry.petrolPump?.name || 'N/A'}
                              </div>
                              {entry.petrolPump?.address && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                                  {entry.petrolPump.address}
                                </div>
                              )}
                              {entry.petrolPump?.contactNumber && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  📞 {entry.petrolPump.contactNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            ₹{totalAmount.toLocaleString()}
                          </div>
                          {entry.paidAmount > 0 && (
                            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                              Paid: ₹{entry.paidAmount.toLocaleString()}
                            </div>
                          )}
                          {entry.paidAmount > 0 && entry.paidAmount < totalAmount && (
                            <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                              Balance: ₹{(totalAmount - entry.paidAmount).toLocaleString()}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${entry.status === 'Paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                            {entry.status}
                          </span>
                          {entry.fuelEntries.length > 1 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Mixed Entry
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(entry.date)}
                        </td>

                        <td className="px-6 py-4">
                          {entry.status === 'Pending' && (
                            <button
                              onClick={() => {
                                setSelectedFuelEntry(entry);
                                setShowPaymentModal(true);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              Pay Now
                            </button>
                          )}
                          {entry.status === 'Paid' && (
                            <span className="inline-flex items-center gap-1 px-3 py-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-lg text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )
        }
      </div>


      {/* Payment Modal */}
      {showPaymentModal && selectedFuelEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Process Payment</h3>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Petrol Pump:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedFuelEntry.petrolPump?.name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Date:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedFuelEntry.date)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Vehicle Details ({selectedFuelEntry.fuelEntries.length} {selectedFuelEntry.fuelEntries.length > 1 ? 'vehicles' : 'vehicle'}):
                    </h4>
                    <div className="space-y-3">
                      {selectedFuelEntry.fuelEntries.map((fuel, index) => (
                        <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded border">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {fuel.vehicleNumber}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Driver: {fuel.driverName}
                              </div>
                            </div>
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            ₹{fuel.fuelAmount?.toLocaleString() || '0'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                    <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Amount:</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{selectedFuelEntry.fuelEntries.reduce((sum, fuel) => sum + (fuel.fuelAmount || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={paymentData.paidAmount}
                    onChange={(e) => setPaymentData({ paidAmount: e.target.value })}
                    placeholder="Enter payment amount"
                    min="0"
                    step="0.01"
                    max={selectedFuelEntry.fuelEntries.reduce((sum, fuel) => sum + (fuel.fuelAmount || 0), 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Maximum: ₹{selectedFuelEntry.fuelEntries.reduce((sum, fuel) => sum + (fuel.fuelAmount || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedFuelEntry(null);
                    setPaymentData({ paidAmount: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={paymentLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {paymentLoading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {paymentLoading ? 'Processing...' : 'Process Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PayByPetrolPumpModal
  isOpen={showPayByPetrolPumpModal}
  onClose={() => setShowPayByPetrolPumpModal(false)}
  onPaymentSuccess={handlePaymentSuccess}
/>
    </div>
  );
};

export default Fuel;