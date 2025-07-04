import React from 'react';
import { UserIcon } from '../../icons';

const ClientTableRow = ({ client, handleEditClient, handleDeleteClient }) => {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="py-3 px-4 text-gray-900 dark:text-white">
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-gray-400" />
          {client.customerName}
        </div>
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {client.customerAddress}
        </div>
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {client.customerMobile || 'N/A'}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <button 
            onClick={() => handleEditClient(client)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button 
            onClick={() => handleDeleteClient(client)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ClientTableRow;