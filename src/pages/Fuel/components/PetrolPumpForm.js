// src/pages/fuel/components/PetrolPumpForm.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../utils/axiosSetup';

const PetrolPumpForm = ({ petrolPumpData, setPetrolPumpData, setShowPetrolPumpForm, fetchPetrolPumps }) => {
  const [petrolPumpErrors, setPetrolPumpErrors] = useState({});
  const [petrolPumpLoading, setPetrolPumpLoading] = useState(false);

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
      await api.post('/fuel/addPetrolPump', petrolPumpData);

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

  return (
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${petrolPumpErrors.name ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${petrolPumpErrors.contactNumber ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${petrolPumpErrors.address ? 'border-red-500' : 'border-gray-300'}`}
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
  );
};

export default PetrolPumpForm;