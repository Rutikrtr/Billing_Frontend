// src/pages/fuel/components/FuelDeleteModal.js
import React from 'react';

const FuelDeleteModal = ({
  showDeleteModal,
  fuelEntryToDelete,
  deleteConfirmText,
  setDeleteConfirmText,
  confirmDeleteFuelEntry,
  cancelDelete,
  deleteLoading,
  isMultipleDelete,
  selectedEntries
}) => {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {isMultipleDelete ? 'Delete Selected Entries' : 'Delete Fuel Entry'}
          </h3>

          <div className="space-y-4 mb-6">
            {isMultipleDelete ? (
              <>
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete {selectedEntries.length} selected fuel entries?
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  This action cannot be undone.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this fuel entry?
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {fuelEntryToDelete?.petrolPump?.name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(fuelEntryToDelete?.date)}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type "DELETE" to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={cancelDelete}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteFuelEntry}
              disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {deleteLoading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default FuelDeleteModal;