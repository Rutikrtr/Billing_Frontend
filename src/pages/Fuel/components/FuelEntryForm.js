// src/pages/fuel/components/FuelEntryForm.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../utils/axiosSetup';

const FuelEntryForm = ({ fuelFormData, setFuelFormData, setShowFuelForm, petrolPumps, vehicles, fetchFuelEntries }) => {
  const [fuelFormErrors, setFuelFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [vehicleDropdown, setVehicleDropdown] = useState({ openIndex: null, searchTerm: '' });

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

    if (fuelFormErrors[`fuelEntries.${index}.vehicleNumber`]) {
      const newErrors = { ...fuelFormErrors };
      delete newErrors[`fuelEntries.${index}.vehicleNumber`];
      setFuelFormErrors(newErrors);
    }
  };

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

    if (fuelFormErrors[`fuelEntries.${index}.${field}`]) {
      const newErrors = { ...fuelFormErrors };
      delete newErrors[`fuelEntries.${index}.${field}`];
      setFuelFormErrors(newErrors);
    }
  };

  const handleVehicleSearch = (e) => {
    setVehicleDropdown(prev => ({
      ...prev,
      searchTerm: e.target.value
    }));
  };

  const handleVehicleDropdownToggle = (index) => {
    setVehicleDropdown(prev => ({
      ...prev,
      openIndex: prev.openIndex === index ? null : index,
      searchTerm: ''
    }));
  };

  const addFuelEntry = () => {
    setFuelFormData(prev => ({
      ...prev,
      fuelEntries: [
        ...prev.fuelEntries,
        { vehicleNumber: '', driverName: '', fuelAmount: '' }
      ]
    }));
  };

  const removeFuelEntry = (index) => {
    if (fuelFormData.fuelEntries.length > 1) {
      const updatedEntries = fuelFormData.fuelEntries.filter((_, i) => i !== index);
      setFuelFormData(prev => ({
        ...prev,
        fuelEntries: updatedEntries
      }));
    }
  };

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

      await api.post('/fuel/addFuel', payload);

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

  return (
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
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${fuelFormErrors.petrolPumpId ? 'border-red-500' : 'border-gray-300'}`}
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
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => handleVehicleDropdownToggle(index)}
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white text-left flex items-center justify-between ${fuelFormErrors[`fuelEntries.${index}.vehicleNumber`] ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <span className={entry.vehicleNumber ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                          {entry.vehicleNumber || 'Select vehicle...'}
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Vehicle Dropdown */}
                      {vehicleDropdown.openIndex === index && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {/* Search Input */}
                          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search vehicles..."
                                value={vehicleDropdown.searchTerm}
                                onChange={handleVehicleSearch}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                autoFocus
                              />
                              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>

                          {/* Vehicle Options */}
                          <div className="max-h-48 overflow-y-auto">
                            {vehicles
                              .filter(vehicle =>
                                !vehicleDropdown.searchTerm ||
                                vehicle.vehicleNumber.toLowerCase().includes(vehicleDropdown.searchTerm.toLowerCase()) ||
                                (vehicle.vehicleType && vehicle.vehicleType.toLowerCase().includes(vehicleDropdown.searchTerm.toLowerCase()))
                              )
                              .map(vehicle => (
                                <div
                                  key={vehicle._id}
                                  onClick={() => {
                                    handleVehicleChange(index, vehicle.vehicleNumber);
                                    setVehicleDropdown({ openIndex: null, searchTerm: '' });
                                  }}
                                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                  <div className="font-medium">{vehicle.vehicleNumber}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {vehicle.vehicleType && `${vehicle.vehicleType} | `}
                                    {vehicle.rate && `₹${vehicle.rate}`}
                                    {vehicle.unit && `/${vehicle.unit.toLowerCase()}`}
                                  </div>
                                </div>
                              ))
                            }

                            {vehicles.filter(v =>
                              !vehicleDropdown.searchTerm ||
                              v.vehicleNumber.toLowerCase().includes(vehicleDropdown.searchTerm.toLowerCase()) ||
                              (v.vehicleType && v.vehicleType.toLowerCase().includes(vehicleDropdown.searchTerm.toLowerCase()))
                            ).length === 0 && (
                                <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                                  No vehicles found
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
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
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${fuelFormErrors[`fuelEntries.${index}.driverName`] ? 'border-red-500' : 'border-gray-300'}`}
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
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${fuelFormErrors[`fuelEntries.${index}.fuelAmount`] ? 'border-red-500' : 'border-gray-300'}`}
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
  );
};

export default FuelEntryForm;