import React from 'react';
import { Edit } from 'lucide-react';

const VehicleListItem = ({ vehicle, onEdit, onDelete }) => {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="py-3 px-4 text-gray-900 dark:text-white">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0M9 17h6" />
          </svg>
          {vehicle.vehicleType}
        </div>
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {vehicle.vehicleNumber}
        </div>
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {vehicle.unit}
        </span>
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          ₹ {vehicle.rate}
        </div>
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
        {vehicle.date ? new Date(vehicle.date).toLocaleDateString() : 'N/A'}
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => onEdit(vehicle)}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(vehicle)}
            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default VehicleListItem;