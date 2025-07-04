import React from 'react';

const ClientDeleteModal = ({ 
  showDeleteModal, 
  clientToDelete, 
  deleteConfirmText, 
  setDeleteConfirmText, 
  confirmDeleteClient, 
  cancelDelete, 
  deleteLoading 
}) => {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Client</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            This will permanently delete <strong>{clientToDelete?.customerName}</strong> and all associated records including:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
            <li>All bills and invoices</li>
            <li>Payment history</li>
            <li>Transaction records</li>
            <li>Customer data</li>
          </ul>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type <strong>{clientToDelete?.customerName}</strong> to confirm deletion:
          </label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={clientToDelete?.customerName}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={confirmDeleteClient}
            disabled={deleteConfirmText !== clientToDelete?.customerName || deleteLoading}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {deleteLoading ? 'Deleting...' : 'Delete Client'}
          </button>
          <button
            onClick={cancelDelete}
            disabled={deleteLoading}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDeleteModal;