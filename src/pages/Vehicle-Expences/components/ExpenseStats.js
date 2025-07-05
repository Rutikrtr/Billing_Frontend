import React, { useState, useEffect } from 'react';
import api from '../../../utils/axiosSetup';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Car, Calendar, Loader2 } from 'lucide-react';

const ExpenseStats = () => {
  const [stats, setStats] = useState({
    monthlyStats: [],
    expenseByType: [],
    topVehicles: [],
    yearlyData: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  // Fetch expense statistics using the new endpoints
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data from multiple endpoints
        const [
          chartDataResponse,
          monthlyDataResponse,
          regularStatsResponse
        ] = await Promise.all([
          api.get(`/user/expenses/chart-data?year=${selectedYear}`),
          api.get(`/user/expenses/monthly-data?year=${selectedYear}`),
          api.get('/user/vehicle-expense/stats')
        ]);

        // Process chart data for monthly stats
        const monthlyStats = chartDataResponse.data.success 
          ? chartDataResponse.data.data.map(item => ({
              _id: { year: item.year, month: getMonthNumber(item.month) },
              totalAmount: item.totalExpenseAmount,
              count: 1, // We don't have transaction count from chart data
              month: item.label
            }))
          : [];

        // Process yearly data for additional insights
        const yearlyData = monthlyDataResponse.data.success 
          ? monthlyDataResponse.data.data 
          : null;

        // Use regular stats for expense by type and top vehicles (these are current data)
        const regularStats = regularStatsResponse.data.success 
          ? regularStatsResponse.data.data 
          : { expenseByType: [], topVehicles: [] };

        // If we have yearly data, we can also extract expense by type from it
        let expenseByType = regularStats.expenseByType;
        
        if (yearlyData && yearlyData.monthlyExpensesByType) {
          // Aggregate expense types across all months from yearly data
          const typeAggregation = {};
          
          Object.values(yearlyData.monthlyExpensesByType).forEach(monthData => {
            Object.entries(monthData).forEach(([type, amount]) => {
              if (!typeAggregation[type]) {
                typeAggregation[type] = { totalAmount: 0, count: 0 };
              }
              typeAggregation[type].totalAmount += amount;
              typeAggregation[type].count += 1;
            });
          });

          // Convert to the expected format and use it if we have data
          if (Object.keys(typeAggregation).length > 0) {
            expenseByType = Object.entries(typeAggregation).map(([type, data]) => ({
              _id: type,
              totalAmount: data.totalAmount,
              count: data.count
            })).sort((a, b) => b.totalAmount - a.totalAmount);
          }
        }

        setStats({
          monthlyStats,
          expenseByType,
          topVehicles: regularStats.topVehicles,
          yearlyData
        });
        
      } catch (error) {
        console.error('Error fetching expense stats:', error);
        setError('Failed to load expense statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedYear]);

  // Helper function to get month number from month name
  const getMonthNumber = (monthName) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(monthName) + 1;
  };

  // Generate year options for dropdown
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

  // Format month for display
  const formatMonth = (monthData) => {
    if (monthData.month) {
      return monthData.month;
    }
    // Fallback to creating from _id
    const date = new Date(monthData._id.year, monthData._id.month - 1);
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Amount: {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload.count && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Expenses: {payload[0].payload.count}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{data._id}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Amount: {formatCurrency(data.totalAmount)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Expenses: {data.count}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center py-12">
          <div className="text-red-500 mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unable to load statistics</h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Year Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Statistics Overview</h3>
          <div className="flex items-center gap-2">
            <label htmlFor="year-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Year:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {generateYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Yearly Summary */}
        {stats.yearlyData && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Expenses</h4>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(stats.yearlyData.totalExpenseAmount)}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Total Transactions</h4>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {stats.yearlyData.totalTransactions}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200">Active Months</h4>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {Object.keys(stats.yearlyData.monthlyExpenses).length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Expenses Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Monthly Expenses - {selectedYear}
          </h3>
        </div>
        
        {stats.monthlyStats.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyStats.map(month => ({
                ...month,
                month: formatMonth(month)
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                />
                <YAxis 
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalAmount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No monthly data available for {selectedYear}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Type */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Expenses by Type - {selectedYear}
            </h3>
          </div>
          
          {stats.expenseByType.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.expenseByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalAmount"
                  >
                    {stats.expenseByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No expense type data available for {selectedYear}
            </div>
          )}
        </div>

        {/* Top Vehicles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Spending Vehicles</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">(Current Data)</span>
          </div>
          
          {stats.topVehicles.length > 0 ? (
            <div className="space-y-4">
              {stats.topVehicles.map((vehicle, index) => (
                <div key={vehicle._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {vehicle.vehicle.vehicleType}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {vehicle.vehicle.vehicleNumber}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(vehicle.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.count} expenses
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No vehicle data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseStats;