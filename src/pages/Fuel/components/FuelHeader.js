// src/pages/fuel/components/FuelHeader.js
import React from 'react';
import { DollarSign } from 'lucide-react';

const FuelHeader = ({ setShowFuelForm, setShowPetrolPumpForm, setShowPayByPetrolPumpModal }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fuel Management</h1>
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
  );
};

export default FuelHeader;