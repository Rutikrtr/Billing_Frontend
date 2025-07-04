// src/pages/fuel/components/FuelSummaryCards.js
import React from 'react';

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

const calculateTotals = (fuelEntries, filterStatus, searchTerm) => {
  const flattened = flattenFuelEntries(fuelEntries);
  
  const filtered = flattened.filter(entry => {
    const matchesSearch =
      entry.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.petrolPump?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      '';
    const matchesStatus = filterStatus === 'All' || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filtered.reduce((sum, entry) => sum + (entry.fuelAmount || 0), 0);
  const paidAmount = fuelEntries.reduce((sum, group) => sum + (group.paidAmount || 0), 0);
  const pendingAmount = fuelEntries.reduce((sum, group) => {
    return sum + (group.status === 'Pending' ? group.fuelEntries.reduce((entrySum, entry) => entrySum + entry.fuelAmount, 0) : 0);
  }, 0);

  return {
    entryCount: filtered.length,
    totalAmount,
    paidAmount,
    pendingAmount
  };
};

const FuelSummaryCards = ({ fuelEntries, filterStatus, searchTerm }) => {
  const totals = calculateTotals(fuelEntries, filterStatus, searchTerm);

  return (
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
  );
};

export default FuelSummaryCards;