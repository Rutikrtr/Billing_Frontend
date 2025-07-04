import React from 'react';
import { UserIcon } from '../../icons';

const ClientForm = ({ 
  formData, 
  errors, 
  handleInputChange, 
  handleSubmit, 
  submitLoading, 
  editingClient, 
  resetForm 
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {editingClient ? 'Edit Client' : 'Add New Client'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Customer Name *
          </label>
          <div className="relative">
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              placeholder="Enter customer name"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.customerName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
          )}
        </div>

        <div>
          <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Customer Address *
          </label>
          <div className="relative">
            <input
              type="text"
              id="customerAddress"
              name="customerAddress"
              value={formData.customerAddress}
              onChange={handleInputChange}
              placeholder="Enter customer address"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.customerAddress ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          {errors.customerAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.customerAddress}</p>
          )}
        </div>

        <div>
          <label htmlFor="customerMobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Customer Mobile (Optional)
          </label>
          <div className="relative">
            <input
              type="tel"
              id="customerMobile"
              name="customerMobile"
              value={formData.customerMobile}
              onChange={handleInputChange}
              placeholder="Enter 10-digit mobile number"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.customerMobile ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength="10"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          {errors.customerMobile && (
            <p className="mt-1 text-sm text-red-600">{errors.customerMobile}</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitLoading ? (editingClient ? 'Updating...' : 'Adding...') : (editingClient ? 'Update Client' : 'Add Client')}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;