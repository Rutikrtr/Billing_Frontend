// src/pages/billing/BillList.js
import React, { useState } from 'react';

const BillList = ({
  bills,
  loading,
  filterStatus,
  searchTerm,
  onFilterChange,
  onSearchChange,
  onPaymentClick,
  onShowClick
}) => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedBillTransactions, setSelectedBillTransactions] = useState(null);

  // Process bills to ensure consistent structure
  const processedBills = bills.map(bill => {
    // If bill has vehicles array, aggregate the information
    if (bill.vehicles && bill.vehicles.length > 0) {
      const vehicleNumbers = bill.vehicles.map(v => v.vehicleNumber).join(', ');
      const vehicleTypes = [...new Set(bill.vehicles.map(v => v.vehicleType))].join(', ');
      const driverNames = [...new Set(bill.vehicles.map(v => v.driverName))].join(', ');
      const routes = [...new Set(bill.vehicles.map(v =>
        v.from && v.to ? `${v.from} → ${v.to}` : v.unit ? `${v.unit} basis` : ''
      ))].filter(Boolean).join('; ');
      const quantities = bill.vehicles.map(v =>
        v.quantity ? `${v.quantity} ${v.unit || ''}` : v.unit || ''
      ).join(', ');

      return {
        ...bill,
        vehicleNumber: vehicleNumbers,
        vehicleType: vehicleTypes,
        driverName: driverNames,
        routeInfo: routes,
        quantityInfo: quantities,
        vehicleCount: bill.vehicles.length
      };
    } else {
      // Handle old format bills (single vehicle per bill)
      const routeInfo = bill.from && bill.to ? `${bill.from} → ${bill.to}` : bill.unit ? `${bill.unit} basis` : 'N/A';
      const quantityInfo = bill.quantity ? `${bill.quantity} ${bill.unit || ''}` : bill.unit || 'N/A';

      return {
        ...bill,
        routeInfo,
        quantityInfo,
        vehicleCount: 1
      };
    }
  });

  // FIXED SEARCH LOGIC
  const search = (searchTerm || '').toLowerCase().trim();

  const filteredBills = processedBills.filter(bill => {
    // Status filter
    const statusFilter = filterStatus === 'All' || bill.status === filterStatus;

    // Enhanced search filter - check multiple fields
    const searchFilter = search === '' || [
      bill.billNo,
      bill.vehicleNumber,
      bill.driverName,
      bill.vehicleType,
      bill.routeInfo,
      bill.quantityInfo,
      bill.status, // Add status to search
      // Also search in individual vehicle data if available
      ...(bill.vehicles ? bill.vehicles.flatMap(v => [
        v.vehicleNumber,
        v.driverName,
        v.vehicleType,
        v.from,
        v.to,
        v.unit
      ]) : [])
    ].some(field => {
      // Safe null check and string conversion
      if (field === null || field === undefined || field === '') return false;
      return field.toString().toLowerCase().includes(search);
    });

    return statusFilter && searchFilter;
  });
  const handleTransactionClick = (bill) => {
    setSelectedBillTransactions(bill);
    setShowTransactionModal(true);
  };

  const getTotalPaidAmount = (transactions = []) => {
    return transactions.reduce((total, transaction) => total + (transaction.amount || 0), 0);
  };

  // Transaction Modal Component
  const TransactionModal = () => {
    if (!selectedBillTransactions) return null;

    const transactions = selectedBillTransactions.transactions || [];
    const totalPaid = getTotalPaidAmount(transactions);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Transaction History - {selectedBillTransactions.billNo}
              </h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Bill Summary */}
            <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Amount</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  ₹{(selectedBillTransactions.netAmount || 0).toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Paid</div>
                <div className="text-lg font-semibold text-green-600">
                  ₹{totalPaid.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
                <div className="text-lg font-semibold text-red-600">
                  ₹{(selectedBillTransactions.pendingAmount || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-96">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Payment History ({transactions.length} transaction{transactions.length !== 1 ? 's' : ''})
                </h4>
                {transactions.map((transaction, index) => (
                  <div key={transaction._id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Payment #{index + 1}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date || transaction.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              ₹{(transaction.amount || 0).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Method:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {transaction.method || 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        {transaction.reference && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Reference:</span>
                            <span className="ml-2 text-gray-900 dark:text-white font-mono">
                              {transaction.reference}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
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

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTransactionModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              {(selectedBillTransactions.pendingAmount || 0) > 0 && (
                <button
                  onClick={() => {
                    setShowTransactionModal(false);
                    onPaymentClick(selectedBillTransactions);
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">Bills</h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by bill no, vehicle, driver..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white w-64"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <select
              value={filterStatus}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Search Info */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredBills.length > 0 
              ? `Found ${filteredBills.length} bill${filteredBills.length !== 1 ? 's' : ''} matching "${searchTerm}"`
              : `No bills found matching "${searchTerm}"`
            }
            <button 
              onClick={() => onSearchChange('')}
              className="ml-2 text-blue-600 hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {searchTerm ? (
              <>
                <p className="text-lg">No bills found matching your search</p>
                <p className="text-sm">Try searching with different keywords</p>
              </>
            ) : (
              <>
                <p className="text-lg">No bills found</p>
                <p className="text-sm">Create your first bill to get started!</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Bill No.</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Vehicle(s)</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Driver(s)</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Route/Unit</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Quantity</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => {
                  const transactionCount = bill.transactions ? bill.transactions.length : 0;
                  const totalPaid = getTotalPaidAmount(bill.transactions);
                  
                  return (
                    <tr key={bill._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {bill.billNo}
                        </div>
                        {bill.vehicleCount > 1 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            {bill.vehicleCount} vehicles
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-600 dark:text-gray-400">
                          <div className="font-medium text-sm max-w-40 truncate" title={bill.vehicleNumber}>
                            {bill.vehicleNumber || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {bill.vehicleType || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-600 dark:text-gray-400 text-sm max-w-32 truncate" title={bill.driverName}>
                          {bill.driverName || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-600 dark:text-gray-400 text-sm max-w-40 truncate" title={bill.routeInfo}>
                          {bill.routeInfo || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-600 dark:text-gray-400 text-sm max-w-32 truncate" title={bill.quantityInfo}>
                          {bill.quantityInfo || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-900 dark:text-white font-medium">
                          ₹{(bill.netAmount || 0).toLocaleString()}
                        </div>
                        {bill.cashDiscount > 0 && (
                          <div className="text-sm text-gray-500">
                            (₹{(bill.totalAmount || 0).toLocaleString()} - ₹{(bill.cashDiscount || 0).toLocaleString()})
                          </div>
                        )}
                      </td>
                      
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                        {bill.date ? new Date(bill.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          
                          <button
                            onClick={() => onShowClick(bill)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Show
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

      {/* Transaction Modal */}
      {showTransactionModal && <TransactionModal />}
    </>
  );
};

export default BillList;