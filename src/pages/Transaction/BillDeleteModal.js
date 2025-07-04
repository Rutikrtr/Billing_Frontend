import React, { useState, useEffect } from 'react';

const BillDeleteModal = ({ 
  showDeleteModal, 
  billToDelete, 
  onConfirm, 
  onCancel, 
  loading 
}) => {
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (!showDeleteModal) {
      setDeleteConfirmText('');
    }
  }, [showDeleteModal]);

  if (!showDeleteModal || !billToDelete) return null;

  const isConfirmValid = deleteConfirmText === billToDelete.billNo;

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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Bill</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            This will permanently delete bill <strong>{billToDelete.billNo}</strong> for customer <strong>{billToDelete.customerName}</strong> and all associated records including:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
            <li>Bill details and line items</li>
            <li>Vehicle assignments</li>
            <li>Payment records</li>
            <li>Transaction history</li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important Notice</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Bills can only be deleted within 48 hours of creation and if no payments have been made.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type <strong>{billToDelete.billNo}</strong> to confirm deletion:
          </label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={billToDelete.billNo}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
            disabled={loading}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={!isConfirmValid || loading}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              'Delete Bill'
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillDeleteModal;