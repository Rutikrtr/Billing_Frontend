// src/pages/billing/components/CustomerBillTable.js
import React, { useState } from 'react';
import BillingReportDownload from '../report/BillingReportDownload';

const CustomerBillTable = ({ customers, dateRange, activeTab = 'all' }) => {
  const [expandedCustomers, setExpandedCustomers] = useState(new Set());

  // Toggle customer expansion
  const toggleCustomer = (customerId) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Get bills to display based on active tab
  const getBillsToDisplay = (customer) => {
    switch (activeTab) {
      case 'pending':
        return customer.pendingBills || [];
      case 'unpaid':
        return customer.unpaidBills || [];
      default:
        return customer.allBills || [];
    }
  };

  // Get customer summary data based on active tab
  const getCustomerSummary = (customer) => {
    switch (activeTab) {
      case 'pending':
        return {
          amount: customer.pendingAmount || 0,
          billsCount: customer.pendingBills?.length || 0,
          label: 'Pending Amount'
        };
      case 'unpaid':
        return {
          amount: customer.unpaidAmount || 0,
          billsCount: customer.unpaidBills?.length || 0,
          label: 'Unpaid Amount'
        };
      default:
        return {
          amount: customer.allBillsAmount || 0,
          billsCount: customer.allBills?.length || 0,
          label: 'Total Amount'
        };
    }
  };

  // Get table title based on active tab
  const getTableTitle = () => {
    switch (activeTab) {
      case 'pending':
        return 'Pending Bills Details';
      case 'unpaid':
        return 'Unpaid Bills Details';
      default:
        return 'All Bills Details';
    }
  };

  // Get table description based on active tab
  const getTableDescription = () => {
    switch (activeTab) {
      case 'pending':
        return 'Bills with pending payment status for the selected date range';
      case 'unpaid':
        return 'Bills with outstanding amounts for the selected date range';
      default:
        return 'All customer bills for the selected date range';
    }
  };

  if (!customers || customers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Header with Download Options */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getTableTitle()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {getTableDescription()}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {customers.map((customer) => {
          const bills = getBillsToDisplay(customer);
          const summary = getCustomerSummary(customer);
          
          return (
            <div key={customer._id || customer.id} className="p-6">
              {/* Customer Header */}
              <div className="flex items-center justify-between p-3 rounded-lg">
                <div 
                  className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors flex-1"
                  onClick={() => toggleCustomer(customer._id || customer.id)}
                >
                  {/* Expand/Collapse Icon */}
                  <div className="flex-shrink-0">
                    {expandedCustomers.has(customer._id || customer.id) ? (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {customer.customerName || customer.name || 'Unknown Customer'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {summary.billsCount} {activeTab === 'all' ? 'bills' : activeTab === 'pending' ? 'pending bills' : 'unpaid bills'} in selected range
                    </p>
                  </div>

                  {/* Customer Summary */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        activeTab === 'pending' ? 'text-red-600 dark:text-red-400' :
                        activeTab === 'unpaid' ? 'text-orange-600 dark:text-orange-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                        {formatCurrency(summary.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {summary.label}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        activeTab === 'pending' ? 'text-red-600 dark:text-red-400' :
                        activeTab === 'unpaid' ? 'text-orange-600 dark:text-orange-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                        {summary.billsCount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Bills Count
                      </p>
                    </div>
                  </div>
                </div>

                {/* Individual Customer Download Button */}
                <div className="ml-4 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <BillingReportDownload 
                      customers={[customer]} 
                      dateRange={dateRange} 
                      activeTab={activeTab}
                      customerName={customer.customerName || customer.name}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Bill Details */}
              {expandedCustomers.has(customer._id || customer.id) && (
                <div className="mt-4 ml-8">
                  {bills && bills.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Bill No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Total Amount
                            </th>
                            {(activeTab === 'unpaid' || activeTab === 'all') && (
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Pending Amount
                              </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            {activeTab === 'all' && (
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Category
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {bills.map((bill, index) => {
                            // Determine bill category for "all" tab
                            let category = 'Paid';
                            if (bill.status === 'Pending') {
                              category = 'Pending';
                            } else if (bill.pendingAmount && bill.pendingAmount > 0) {
                              category = 'Unpaid';
                            }

                            return (
                              <tr key={bill.billNo || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {bill.billNo || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                  {formatDate(bill.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                  {formatCurrency(bill.totalAmount || bill.amount || 0)}
                                </td>
                                {(activeTab === 'unpaid' || activeTab === 'all') && (
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600 dark:text-orange-400">
                                    {formatCurrency(bill.pendingAmount || 0)}
                                  </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(bill.status)}`}>
                                    {bill.status || 'Unknown'}
                                  </span>
                                </td>
                                {activeTab === 'all' && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      category === 'Pending' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                      category === 'Unpaid' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    }`}>
                                      {category}
                                    </span>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Bill Summary for this customer */}
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activeTab === 'all' ? 'Total Bills' : 
                               activeTab === 'pending' ? 'Pending Bills' : 'Unpaid Bills'}
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {bills.length}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activeTab === 'all' ? 'Total Amount' : 
                               activeTab === 'pending' ? 'Pending Amount' : 'Unpaid Amount'}
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(summary.amount)}
                            </p>
                          </div>
                          {activeTab === 'all' && (
                            <>
                              <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
                                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                  {formatCurrency(customer.pendingAmount || 0)}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Unpaid Amount</p>
                                <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                                  {formatCurrency(customer.unpaidAmount || 0)}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        No bills found for this customer in the selected range.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerBillTable;