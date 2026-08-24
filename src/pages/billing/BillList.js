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
      bill.status,
      ...(bill.vehicles ? bill.vehicles.flatMap(v => [
        v.vehicleNumber,
        v.driverName,
        v.vehicleType,
        v.from,
        v.to,
        v.unit
      ]) : [])
    ].some(field => {
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

  // Generate bill details matching the print format
  const generateBillDetails = (bill) => {
    let details = [];
    
    if (bill.vehicles && bill.vehicles.length > 0) {
      bill.vehicles.forEach((vehicle, index) => {
        const vehicleInfo = [];
        if (vehicle.vehicleNumber) vehicleInfo.push(vehicle.vehicleNumber);
        if (vehicle.vehicleType) vehicleInfo.push(vehicle.vehicleType);
        if (vehicle.product) vehicleInfo.push(vehicle.product);
        
        details.push(
          <div 
            key={index}
            className={`text-xs leading-tight ${index < bill.vehicles.length - 1 ? 'mb-1 pb-1 border-b border-red-200 dark:border-red-900' : ''}`}
          >
            <div className="font-normal text-gray-700 dark:text-gray-300">
              {vehicleInfo.join(' - ')}
            </div>
          </div>
        );
      });
    } else {
      const vehicleInfo = [];
      if (bill.vehicleNumber) vehicleInfo.push(bill.vehicleNumber);
      if (bill.vehicleType) vehicleInfo.push(bill.vehicleType);
      if (bill.product) vehicleInfo.push(bill.product);
      
      if (vehicleInfo.length > 0) {
        details.push(
          <div key="single" className="text-xs leading-tight">
            <div className="font-normal text-gray-700 dark:text-gray-300">
              {vehicleInfo.join(' - ')}
            </div>
          </div>
        );
      }
    }
    
    // Add extra charges if present
    if (bill.extraCharges && bill.extraCharges.length > 0) {
      details.push(
        <div key="extra-charges" className="mt-1 pt-1 border-t border-red-300 dark:border-red-800">
          <div className="text-xs font-semibold text-red-600 dark:text-red-500 mb-0.5">
            अतिरिक्त शुल्क:
          </div>
          {bill.extraCharges.map((charge, idx) => (
            <div key={idx} className="flex justify-between text-xs mb-0.5">
              <span className="text-gray-600 dark:text-gray-400">{charge.description}</span>
              <span className="font-semibold text-red-600 dark:text-red-500">
                ₹{charge.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    return details;
  };

  // Get bill quantity (matching print format)
  const getBillQuantity = (bill) => {
    if (bill.vehicles && bill.vehicles.length > 0) {
      return bill.vehicles.reduce((sum, vehicle) => sum + (vehicle.quantity || 0), 0);
    }
    return bill.quantity || 0;
  };

  // Get bill rate (matching print format)
  const getBillRate = (bill) => {
    if (bill.vehicles && bill.vehicles.length > 0) {
      const totalAmount = bill.vehicles.reduce((sum, vehicle) => 
        sum + ((vehicle.quantity || 0) * (vehicle.rate || 0)), 0
      );
      const totalQuantity = bill.vehicles.reduce((sum, vehicle) => 
        sum + (vehicle.quantity || 0), 0
      );
      return totalQuantity > 0 ? totalAmount / totalQuantity : 0;
    }
    return bill.rate || 0;
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
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-b from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-b-2 border-red-600 dark:border-red-700">
                  <th className="text-center py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 text-xs border-l border-red-200 dark:border-red-800" style={{width: '4%'}}>
                    अ.क्र.<br/><span className="text-[10px] font-normal">Sr. No.</span>
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 text-xs border-l border-red-200 dark:border-red-800" style={{width: '12%'}}>
                    बिल क्रमांक<br/><span className="text-[10px] font-normal">Bill No.</span>
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 text-xs border-l border-red-200 dark:border-red-800" style={{width: '8%'}}>
                    दिनांक<br/><span className="text-[10px] font-normal">Date</span>
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 text-xs border-l border-red-200 dark:border-red-800" style={{width: '20%'}}>
                    तपशील<br/><span className="text-[10px] font-normal">Details</span>
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 text-xs border-l border-red-200 dark:border-red-800" style={{width: '8%'}}>
                    संख्या<br/><span className="text-[10px] font-normal">Quantity</span>
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 text-xs border-l border-red-200 dark:border-red-800" style={{width: '10%'}}>
                    दर<br/><span className="text-[10px] font-normal">Rate</span>
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 text-xs border-l border-red-200 dark:border-red-800" style={{width: '12%'}}>
                    एकूण रक्कम<br/><span className="text-[10px] font-normal">Total Amount</span>
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 text-xs border-l border-red-200 dark:border-red-800" style={{width: '12%'}}>
                    वसूल रक्कम<br/><span className="text-[10px] font-normal">Paid Amount</span>
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 text-xs border-l border-red-200 dark:border-red-800" style={{width: '14%'}}>
                    बाकी रक्कम<br/><span className="text-[10px] font-normal">Pending Amount</span>
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-800 dark:text-gray-200 text-xs border-l border-red-200 dark:border-red-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill, index) => {
                  const transactionCount = bill.transactions ? bill.transactions.length : 0;
                  const totalPaid = (bill.netAmount || 0) - (bill.pendingAmount || 0);
                  const quantity = getBillQuantity(bill);
                  const rate = getBillRate(bill);
                  
                  return (
                    <tr 
                      key={bill._id} 
                      className="border-b border-red-100 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      {/* Sr. No. */}
                      <td className="py-3 px-2 text-center text-sm text-gray-700 dark:text-gray-300 border-l border-red-100 dark:border-red-900">
                        {index + 1}
                      </td>

                      {/* Bill No. */}
                      <td className="py-3 px-2 text-left border-l border-red-100 dark:border-red-900">
                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                          {bill.billNo}
                        </div>
                        {bill.vehicleCount > 1 && (
                          <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                            {bill.vehicleCount} vehicles
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-2 text-center text-sm text-gray-700 dark:text-gray-300 border-l border-red-100 dark:border-red-900">
                        {bill.date ? new Date(bill.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : '—'}
                      </td>

                      {/* Details */}
                      <td className="py-3 px-2 text-left border-l border-red-100 dark:border-red-900">
                        <div className="max-w-xs">
                          {generateBillDetails(bill)}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-2 text-center text-sm font-medium text-gray-900 dark:text-white border-l border-red-100 dark:border-red-900">
                        {bill.vehicles && bill.vehicles.length > 0
                          ? bill.vehicles.map((v, i) => (
                              <div key={i} className={`py-0.5 ${i < bill.vehicles.length - 1 ? 'border-b border-red-100 dark:border-red-900' : ''}`}>
                                {v.quantity ?? '-'}
                              </div>
                            ))
                          : quantity.toFixed(0)
                        }
                      </td>

                      {/* Rate */}
                      <td className="py-3 px-2 text-right text-sm font-bold text-gray-900 dark:text-white border-l border-red-100 dark:border-red-900">
                        {bill.vehicles && bill.vehicles.length > 0
                          ? bill.vehicles.map((v, i) => (
                              <div key={i} className={`py-0.5 ${i < bill.vehicles.length - 1 ? 'border-b border-red-100 dark:border-red-900' : ''}`}>
                                {v.rate != null ? Number(v.rate).toFixed(2) : '-'}
                              </div>
                            ))
                          : rate.toFixed(2)
                        }
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-2 text-right border-l border-red-100 dark:border-red-900">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {(bill.netAmount || 0).toFixed(2)}
                        </div>
                      </td>

                      {/* Paid Amount */}
                      <td className="py-3 px-2 text-right text-sm font-bold text-green-600 dark:text-green-500 border-l border-red-100 dark:border-red-900">
                        {totalPaid.toFixed(2)}
                      </td>

                      {/* Pending Amount */}
                      <td className="py-3 px-2 text-right border-l border-red-100 dark:border-red-900">
                        <div className="text-sm font-bold text-red-600 dark:text-red-500">
                          {(bill.pendingAmount || 0).toFixed(2)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-2 border-l border-red-100 dark:border-red-900">
                        <div className="flex gap-1.5 justify-center">
                          <button
                            onClick={() => onShowClick(bill)}
                            className="px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 transition-colors"
                            title="View Bill"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {transactionCount > 0 && (
                            <button
                              onClick={() => handleTransactionClick(bill)}
                              className="px-2.5 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 transition-colors"
                              title={`${transactionCount} payment${transactionCount !== 1 ? 's' : ''}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <span className="text-[10px]">{transactionCount}</span>
                            </button>
                          )}
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