// src/pages/billing/CustomerTransactionHistoryModal.js
import React from 'react';

const CustomerTransactionHistoryModal = ({ customer, transactions, onClose }) => {
  // Safely extract data with fallbacks
  const totalPaid = transactions?.totalPaid || 0;
  const pendingAmount = transactions?.pendingAmount || customer?.pendingAmount || 0;
  const transactionList = transactions?.transactions || [];
  const transactionCount = transactions?.transactionCount || transactionList.length || 0;
  
  const customerName = customer?.name || customer?.customerName || 'Customer';
  const customerPhone = customer?.phone || customer?.customerMobile || 'N/A';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Transaction History
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {customerName} - {customerPhone}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Summary Cards */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Paid</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                ₹{totalPaid.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-sm text-red-600 dark:text-red-400 font-medium">Remaining Balance</div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
                ₹{pendingAmount.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Transactions</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {transactionCount}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="p-6 overflow-y-auto max-h-96">
          {transactionList.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm mt-1">Payment history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactionList.map((transaction, index) => (
                <div 
                  key={transaction._id || index} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Payment #{transactionCount - index}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date || transaction.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Amount Paid:</span>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                            ₹{(transaction.amount || 0).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Payment Method:</span>
                          <div className="text-base font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                            {transaction.method === 'Cash' && (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            )}
                            {transaction.method || 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      {transaction.reference && (
                        <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Reference:</span>
                          <div className="text-sm text-gray-900 dark:text-white font-mono mt-1">
                            {transaction.reference}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.date || transaction.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTransactionHistoryModal;