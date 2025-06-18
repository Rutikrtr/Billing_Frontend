// src/pages/billing/Overview.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosSetup';
import DateRangeFilter from './components/DateRangeFilter';
import BillingSummaryChart from './components/BillingSummaryChart';
import CustomerBillTable from './components/CustomerBillTable';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

const Overview = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'unpaid'
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    toDate: new Date() // Today
  });

  // Fetch customers data
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/customer');
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on date range and category
  const filterDataByDateRange = () => {
    const filtered = customers.map(customer => {
      // Filter bills within date range
      const allBills = (customer.latestBills || []).filter(bill => {
        const billDate = new Date(bill.date);
        const fromDate = new Date(dateRange.fromDate);
        const toDate = new Date(dateRange.toDate);
        
        // Set time to start/end of day for accurate comparison
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        
        return billDate >= fromDate && billDate <= toDate;
      });

      // Categorize bills
      const pendingBills = allBills.filter(bill => bill.status === 'Pending');
      const unpaidBills = allBills.filter(bill => 
        bill.status === 'Pending' || 
        (bill.pendingAmount && bill.pendingAmount > 0)
      );
      const paidBills = allBills.filter(bill => bill.status === 'Paid');

      // Calculate totals
      const allBillsAmount = allBills.reduce((sum, bill) => sum + (bill.totalAmount || bill.amount || 0), 0);
      const pendingAmount = pendingBills.reduce((sum, bill) => sum + (bill.totalAmount || bill.amount || 0), 0);
      const unpaidAmount = unpaidBills.reduce((sum, bill) => sum + (bill.pendingAmount || bill.totalAmount || bill.amount || 0), 0);
      const paidAmount = paidBills.reduce((sum, bill) => sum + (bill.totalAmount || bill.amount || 0), 0);

      return {
        ...customer,
        allBills,
        pendingBills,
        unpaidBills,
        paidBills,
        allBillsAmount,
        pendingAmount,
        unpaidAmount,
        paidAmount,
        // For backward compatibility
        filteredBills: activeTab === 'all' ? allBills : 
                      activeTab === 'pending' ? pendingBills : unpaidBills,
        remainingAmount: activeTab === 'all' ? allBillsAmount : 
                        activeTab === 'pending' ? pendingAmount : unpaidAmount,
        pendingBills: activeTab === 'all' ? allBills.length : 
                     activeTab === 'pending' ? pendingBills.length : unpaidBills.length
      };
    }).filter(customer => {
      // Filter based on active tab
      switch (activeTab) {
        case 'all':
          return customer.allBills.length > 0;
        case 'pending':
          return customer.pendingBills.length > 0;
        case 'unpaid':
          return customer.unpaidBills.length > 0;
        default:
          return customer.allBills.length > 0;
      }
    });

    setFilteredData(filtered);
  };

  // Handle date range change
  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Calculate summary statistics
  const calculateSummaryStats = () => {
    const stats = {
      all: {
        totalCustomers: 0,
        totalBills: 0,
        totalAmount: 0
      },
      pending: {
        totalCustomers: 0,
        totalBills: 0,
        totalAmount: 0
      },
      unpaid: {
        totalCustomers: 0,
        totalBills: 0,
        totalAmount: 0
      },
      paid: {
        totalCustomers: 0,
        totalBills: 0,
        totalAmount: 0
      }
    };

    customers.forEach(customer => {
      const allBills = (customer.latestBills || []).filter(bill => {
        const billDate = new Date(bill.date);
        const fromDate = new Date(dateRange.fromDate);
        const toDate = new Date(dateRange.toDate);
        
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        
        return billDate >= fromDate && billDate <= toDate;
      });

      const pendingBills = allBills.filter(bill => bill.status === 'Pending');
      const unpaidBills = allBills.filter(bill => 
        bill.status === 'Pending' || 
        (bill.pendingAmount && bill.pendingAmount > 0)
      );
      const paidBills = allBills.filter(bill => bill.status === 'Paid');

      // All bills stats
      if (allBills.length > 0) {
        stats.all.totalCustomers++;
        stats.all.totalBills += allBills.length;
        stats.all.totalAmount += allBills.reduce((sum, bill) => sum + (bill.totalAmount || bill.amount || 0), 0);
      }

      // Pending bills stats
      if (pendingBills.length > 0) {
        stats.pending.totalCustomers++;
        stats.pending.totalBills += pendingBills.length;
        stats.pending.totalAmount += pendingBills.reduce((sum, bill) => sum + (bill.totalAmount || bill.amount || 0), 0);
      }

      // Unpaid bills stats
      if (unpaidBills.length > 0) {
        stats.unpaid.totalCustomers++;
        stats.unpaid.totalBills += unpaidBills.length;
        stats.unpaid.totalAmount += unpaidBills.reduce((sum, bill) => sum + (bill.pendingAmount || bill.totalAmount || bill.amount || 0), 0);
      }

      // Paid bills stats
      if (paidBills.length > 0) {
        stats.paid.totalCustomers++;
        stats.paid.totalBills += paidBills.length;
        stats.paid.totalAmount += paidBills.reduce((sum, bill) => sum + (bill.totalAmount || bill.amount || 0), 0);
      }
    });

    return stats;
  };

  // Load initial data
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter data when customers, date range, or active tab changes
  useEffect(() => {
    if (customers.length > 0) {
      filterDataByDateRange();
    }
  }, [customers, dateRange, activeTab]);

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const summaryStats = calculateSummaryStats();
  const currentStats = summaryStats[activeTab];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive billing analysis and management</p>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive billing analysis and management</p>
          </div>
        </div>
        <ErrorMessage message={error} onRetry={fetchCustomers} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive billing analysis and management</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleString('en-IN')}
        </div>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter 
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'all', label: 'All Bills', count: summaryStats.all.totalBills },
              { key: 'pending', label: 'Pending Bills', count: summaryStats.pending.totalBills },
              { key: 'unpaid', label: 'Unpaid Bills', count: summaryStats.unpaid.totalBills }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content Summary */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Customers</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{currentStats.totalCustomers}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${
              activeTab === 'pending' 
                ? 'bg-red-50 dark:bg-red-900/20' 
                : activeTab === 'unpaid'
                ? 'bg-orange-50 dark:bg-orange-900/20'
                : 'bg-green-50 dark:bg-green-900/20'
            }`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${
                  activeTab === 'pending' 
                    ? 'bg-red-100 dark:bg-red-900' 
                    : activeTab === 'unpaid'
                    ? 'bg-orange-100 dark:bg-orange-900'
                    : 'bg-green-100 dark:bg-green-900'
                }`}>
                  <svg className={`w-6 h-6 ${
                    activeTab === 'pending' 
                      ? 'text-red-600 dark:text-red-400' 
                      : activeTab === 'unpaid'
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-green-600 dark:text-green-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${
                    activeTab === 'pending' 
                      ? 'text-red-600 dark:text-red-400' 
                      : activeTab === 'unpaid'
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {activeTab === 'all' ? 'Total Bills' : 
                     activeTab === 'pending' ? 'Pending Bills' : 'Unpaid Bills'}
                  </p>
                  <p className={`text-2xl font-bold ${
                    activeTab === 'pending' 
                      ? 'text-red-900 dark:text-red-200' 
                      : activeTab === 'unpaid'
                      ? 'text-orange-900 dark:text-orange-200'
                      : 'text-green-900 dark:text-green-200'
                  }`}>
                    {currentStats.totalBills}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                    ₹{currentStats.totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Customer Bills Table */}
      {filteredData.length > 0 && (
        <CustomerBillTable 
          customers={filteredData}
          dateRange={dateRange}
          activeTab={activeTab}
        />
      )}

      {/* Overall Summary Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Overall Summary ({formatDate(dateRange.fromDate)} to {formatDate(dateRange.toDate)})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">All Bills</h4>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{summaryStats.all.totalBills} bills</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">₹{summaryStats.all.totalAmount.toLocaleString('en-IN')}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">{summaryStats.all.totalCustomers} customers</p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Pending Bills</h4>
            <p className="text-lg font-bold text-red-900 dark:text-red-100">{summaryStats.pending.totalBills} bills</p>
            <p className="text-sm text-red-700 dark:text-red-300">₹{summaryStats.pending.totalAmount.toLocaleString('en-IN')}</p>
            <p className="text-xs text-red-600 dark:text-red-400">{summaryStats.pending.totalCustomers} customers</p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">Unpaid Bills</h4>
            <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{summaryStats.unpaid.totalBills} bills</p>
            <p className="text-sm text-orange-700 dark:text-orange-300">₹{summaryStats.unpaid.totalAmount.toLocaleString('en-IN')}</p>
            <p className="text-xs text-orange-600 dark:text-orange-400">{summaryStats.unpaid.totalCustomers} customers</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Paid Bills</h4>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">{summaryStats.paid.totalBills} bills</p>
            <p className="text-sm text-green-700 dark:text-green-300">₹{summaryStats.paid.totalAmount.toLocaleString('en-IN')}</p>
            <p className="text-xs text-green-600 dark:text-green-400">{summaryStats.paid.totalCustomers} customers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;