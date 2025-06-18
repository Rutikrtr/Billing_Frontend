// src/pages/billing/components/BillingSummaryChart.js
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const BillingSummaryChart = ({ data, activeTab = 'all' }) => {
  // Transform data for chart based on active tab
  const chartData = data.map(customer => {
    let amount = 0;
    let billsCount = 0;
    
    switch (activeTab) {
      case 'all':
        amount = customer.allBillsAmount || 0;
        billsCount = customer.allBills?.length || 0;
        break;
      case 'pending':
        amount = customer.pendingAmount || 0;
        billsCount = customer.pendingBills?.length || 0;
        break;
      case 'unpaid':
        amount = customer.unpaidAmount || 0;
        billsCount = customer.unpaidBills?.length || 0;
        break;
      default:
        amount = customer.allBillsAmount || 0;
        billsCount = customer.allBills?.length || 0;
    }

    return {
      name: customer.customerName || customer.name || 'Unknown Customer',
      amount: amount,
      billsCount: billsCount,
      customerId: customer._id || customer.id
    };
  }).filter(item => item.amount > 0 || item.billsCount > 0); // Only show customers with data

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {entry.dataKey === 'amount' 
                  ? `Amount: ₹${entry.value.toLocaleString('en-IN')}`
                  : `Bills Count: ${entry.value}`
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom label formatter for X-axis
  const formatXAxisLabel = (value) => {
    // Truncate long names
    return value.length > 15 ? `${value.substring(0, 15)}...` : value;
  };

  // Custom tick formatter for Y-axis (amount)
  const formatYAxisAmount = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  // Get colors based on active tab
  const getColors = () => {
    switch (activeTab) {
      case 'pending':
        return {
          amount: '#dc2626', // red-600
          count: '#ef4444'   // red-500
        };
      case 'unpaid':
        return {
          amount: '#ea580c', // orange-600
          count: '#f97316'   // orange-500
        };
      default:
        return {
          amount: '#2563eb', // blue-600
          count: '#3b82f6'   // blue-500
        };
    }
  };

  const colors = getColors();

  // Get chart title based on active tab
  const getChartTitle = () => {
    switch (activeTab) {
      case 'pending':
        return 'Pending Bills Analysis';
      case 'unpaid':
        return 'Unpaid Bills Analysis';
      default:
        return 'All Bills Analysis';
    }
  };

  return (
    <div className="w-full">
      {/* Chart Title */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          {getChartTitle()}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {activeTab === 'all' && 'Complete overview of all customer bills'}
          {activeTab === 'pending' && 'Bills with pending payment status'}
          {activeTab === 'unpaid' && 'Bills with outstanding amounts'}
        </p>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.amount }}></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {activeTab === 'all' ? 'Total Amount (₹)' : 
             activeTab === 'pending' ? 'Pending Amount (₹)' : 'Unpaid Amount (₹)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.count }}></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Bills Count
          </span>
        </div>
      </div>

      {/* Chart Container */}
      {chartData.length > 0 ? (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60
              }}
              barCategoryGap="20%"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                className="dark:stroke-gray-600"
              />
              
              <XAxis
                dataKey="name"
                tick={{ 
                  fontSize: 12, 
                  fill: '#6b7280',
                  textAnchor: 'middle'
                }}
                tickFormatter={formatXAxisLabel}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              
              {/* Left Y-Axis for Amount */}
              <YAxis
                yAxisId="amount"
                orientation="left"
                tick={{ 
                  fontSize: 12, 
                  fill: colors.amount
                }}
                tickFormatter={formatYAxisAmount}
                label={{ 
                  value: 'Amount (₹)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: colors.amount, fontSize: '12px' }
                }}
              />
              
              {/* Right Y-Axis for Count */}
              <YAxis
                yAxisId="count"
                orientation="right"
                tick={{ 
                  fontSize: 12, 
                  fill: colors.count
                }}
                label={{ 
                  value: 'Bills Count', 
                  angle: 90, 
                  position: 'insideRight',
                  style: { textAnchor: 'middle', fill: colors.count, fontSize: '12px' }
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Amount Bar */}
              <Bar
                yAxisId="amount"
                dataKey="amount"
                fill={colors.amount}
                name="Amount"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
              
              {/* Count Bar */}
              <Bar
                yAxisId="count"
                dataKey="billsCount"
                fill={colors.count}
                name="Bills Count"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No data available</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No {activeTab === 'all' ? 'bills' : activeTab === 'pending' ? 'pending bills' : 'unpaid bills'} found for the selected date range.
            </p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${
            activeTab === 'pending' ? 'bg-red-50 dark:bg-red-900/20' :
            activeTab === 'unpaid' ? 'bg-orange-50 dark:bg-orange-900/20' :
            'bg-blue-50 dark:bg-blue-900/20'
          }`}>
            <div className={
              activeTab === 'pending' ? 'text-red-800 dark:text-red-200' :
              activeTab === 'unpaid' ? 'text-orange-800 dark:text-orange-200' :
              'text-blue-800 dark:text-blue-200'
            }>
              <p className="text-sm font-medium">Highest Amount</p>
              <p className="text-lg font-bold">
                ₹{Math.max(...chartData.map(d => d.amount)).toLocaleString('en-IN')}
              </p>
              <p className={`text-xs ${
                activeTab === 'pending' ? 'text-red-600 dark:text-red-400' :
                activeTab === 'unpaid' ? 'text-orange-600 dark:text-orange-400' :
                'text-blue-600 dark:text-blue-400'
              }`}>
                {chartData.find(d => d.amount === Math.max(...chartData.map(d => d.amount)))?.name}
              </p>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${
            activeTab === 'pending' ? 'bg-red-50 dark:bg-red-900/20' :
            activeTab === 'unpaid' ? 'bg-orange-50 dark:bg-orange-900/20' :
            'bg-blue-50 dark:bg-blue-900/20'
          }`}>
            <div className={
              activeTab === 'pending' ? 'text-red-800 dark:text-red-200' :
              activeTab === 'unpaid' ? 'text-orange-800 dark:text-orange-200' :
              'text-blue-800 dark:text-blue-200'
            }>
              <p className="text-sm font-medium">Most Bills</p>
              <p className="text-lg font-bold">
                {Math.max(...chartData.map(d => d.billsCount))} bills
              </p>
              <p className={`text-xs ${
                activeTab === 'pending' ? 'text-red-600 dark:text-red-400' :
                activeTab === 'unpaid' ? 'text-orange-600 dark:text-orange-400' :
                'text-blue-600 dark:text-blue-400'
              }`}>
                {chartData.find(d => d.billsCount === Math.max(...chartData.map(d => d.billsCount)))?.name}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-gray-800 dark:text-gray-200">
              <p className="text-sm font-medium">Average Amount</p>
              <p className="text-lg font-bold">
                ₹{chartData.length > 0 ? Math.round(chartData.reduce((sum, d) => sum + d.amount, 0) / chartData.length).toLocaleString('en-IN') : '0'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                per customer
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSummaryChart;