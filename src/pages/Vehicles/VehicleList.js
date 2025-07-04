import React from 'react';
import VehicleListItem from './VehicleListItem';

const VehicleList = ({ vehicles, loading, onEdit, onDelete }) => {
  return (
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
              {vehicles.map((vehicle) => (
                <VehicleListItem 
                  key={vehicle._id} 
                  vehicle={vehicle} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VehicleList;