import React from 'react';
import { UserIcon } from '../../icons';
import ClientTableRow from './ClientTableRow';

const ClientList = ({ 
  clients, 
  loading, 
  handleEditClient, 
  handleDeleteClient 
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Client List</h3>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No clients found. Add your first client!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Address</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Mobile</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <ClientTableRow 
                  key={client._id || index} 
                  client={client} 
                  handleEditClient={handleEditClient} 
                  handleDeleteClient={handleDeleteClient} 
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientList;