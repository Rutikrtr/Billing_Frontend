// src/pages/billing/components/DateRangeFilter.js
import React, { useState } from 'react';

const DateRangeFilter = ({ dateRange, onDateRangeChange }) => {
  const [tempDateRange, setTempDateRange] = useState(dateRange);

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  // Handle date input change
  const handleDateChange = (field, value) => {
    setTempDateRange(prev => ({
      ...prev,
      [field]: new Date(value)
    }));
  };

  // Apply filter
  const handleApplyFilter = () => {
    // Validate date range
    if (tempDateRange.fromDate > tempDateRange.toDate) {
      alert('From date cannot be later than To date');
      return;
    }

    onDateRangeChange(tempDateRange);
  };

  // Reset to current month
  const handleResetToCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const newRange = {
      fromDate: firstDay,
      toDate: now
    };
    setTempDateRange(newRange);
    onDateRangeChange(newRange);
  };

  // Quick date range presets
  const handleQuickFilter = (days) => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    const newRange = {
      fromDate,
      toDate
    };
    setTempDateRange(newRange);
    onDateRangeChange(newRange);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Date Range Title */}
        <div className="lg:w-1/4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Select Date Range
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Filter bills by date range
          </p>
        </div>

        {/* Date Inputs */}
        <div className="lg:w-2/4 flex flex-col sm:flex-row gap-4">
          {/* From Date */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formatDateForInput(tempDateRange.fromDate)}
                onChange={(e) => handleDateChange('fromDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         dark:bg-gray-700 dark:text-white"
              />
              <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* To Date */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formatDateForInput(tempDateRange.toDate)}
                onChange={(e) => handleDateChange('toDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         dark:bg-gray-700 dark:text-white"
              />
              <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lg:w-1/4 flex flex-col gap-2">
          <button
            onClick={handleApplyFilter}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white 
                     rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Apply Filter
          </button>
          
          <button
            onClick={handleResetToCurrentMonth}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white 
                     rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Current Month
          </button>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Quick filters:</span>
        <button
          onClick={() => handleQuickFilter(7)}
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                   rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Last 7 days
        </button>
        <button
          onClick={() => handleQuickFilter(30)}
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                   rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Last 30 days
        </button>
        <button
          onClick={() => handleQuickFilter(90)}
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                   rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Last 90 days
        </button>
      </div>

      {/* Current Filter Info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-blue-800 dark:text-blue-300">
            Showing data from {new Date(dateRange.fromDate).toLocaleDateString('en-IN')} 
            to {new Date(dateRange.toDate).toLocaleDateString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;