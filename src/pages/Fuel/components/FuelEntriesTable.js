// src/pages/fuel/components/FuelEntriesTable.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';

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

const FuelEntriesTable = ({
  fuelEntries,
  loading,
  filterStatus,
  searchTerm,
  setFilterStatus,
  setSearchTerm,
  setSelectedFuelEntry,
  setShowPaymentModal,
  setShowFuelForm,
  setShowDeleteModal,
  setFuelEntryToDelete,
  selectedEntries,
  setSelectedEntries,
  setIsMultipleDelete,
  selectAll,
  setSelectAll
}) => {
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

  const handleSelectAll = () => {
  const newSelectAll = !selectAll;
  setSelectAll(newSelectAll);

  if (newSelectAll) {
    // Select all entries currently shown in the table
    setSelectedEntries(filteredFuelEntries);
  } else {
    setSelectedEntries([]);
  }
};


  const handleSelectEntry = (entry) => {
    if (entry.status === 'Paid') return;
    
    const isSelected = selectedEntries.some(selected => selected._id === entry._id);
    
    if (isSelected) {
      setSelectedEntries(selectedEntries.filter(selected => selected._id !== entry._id));
    } else {
      setSelectedEntries([...selectedEntries, entry]);
    }
    
    // Update selectAll checkbox if needed
    if (selectAll && selectedEntries.length === fuelEntries.filter(e => e.status === 'Pending').length ) {
      setSelectAll(false);
    }
  };

  const handleSingleDelete = (entry) => {
    setFuelEntryToDelete(entry);
    setIsMultipleDelete(false);
    setShowDeleteModal(true);
  };

  const handleMultipleDelete = () => {
    if (selectedEntries.length === 0) {
      toast.error('Please select at least one entry to delete');
      return;
    }
    setIsMultipleDelete(true);
    setShowDeleteModal(true);
  };

  const pendingEntries = fuelEntries.filter(entry => entry.status === 'Pending');
  const hasSelectedEntries = selectedEntries.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fuel Entries</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredFuelEntries.length} entries
            </p>
          </div>
          {hasSelectedEntries && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedEntries.length} selected
              </span>
              <button
                onClick={handleMultipleDelete}
                className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

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
                <th className="px-6 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Select
                    </span>
                  </div>
                </th>
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
                .map((entry) => {
                  const totalAmount = entry.fuelEntries.reduce((sum, fuel) => sum + (fuel.fuelAmount || 0), 0);
                  const isSelected = selectedEntries.some(selected => selected._id === entry._id);
                  const canSelect = entry.status === 'Pending';

                  return (
                    <tr key={entry._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectEntry(entry)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </td>

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
                        <div className="flex flex-col gap-2">
                          {entry.status === 'Pending' && (
                            <button
                              onClick={() => {
                                setSelectedFuelEntry(entry);
                                setShowPaymentModal(true);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm"
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
                          <button
                            onClick={() => handleSingleDelete(entry)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FuelEntriesTable;