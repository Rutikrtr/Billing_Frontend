import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart3, DollarSign, TrendingDown, Calculator, RefreshCw } from 'lucide-react';
import api from '../../../utils/axiosSetup';

const MonthlyProfitChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalFuelCost, setTotalFuelCost] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthsShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Process customer data to get monthly sales
  const processMonthlyData = useCallback((customersData) => {
    const monthlyTotals = new Array(12).fill(0);
    
    if (!customersData || !Array.isArray(customersData)) {
      return monthlyTotals;
    }
    
    customersData.forEach(customer => {
      if (customer.latestBills && Array.isArray(customer.latestBills)) {
        customer.latestBills.forEach(bill => {
          if ((bill.status === "Paid" || bill.status === "Pending") && bill.date) {
            try {
              const billDate = new Date(bill.date);
              const month = billDate.getMonth();
              const year = billDate.getFullYear();
              
              if (year === selectedYear && month >= 0 && month < 12) {
                monthlyTotals[month] += bill.netAmount || 0;
              }
            } catch (dateError) {
              console.warn('Invalid date format in bill:', bill.date);
            }
          }
        });
      }
    });
    
    return monthlyTotals;
  }, [selectedYear]);

  // Extract available years from the data
  const extractAvailableYears = useCallback((customersData, fuelData, expenseData) => {
    const yearsSet = new Set();
    
    // Extract years from customer data
    if (customersData && Array.isArray(customersData)) {
      customersData.forEach(customer => {
        if (customer.latestBills && Array.isArray(customer.latestBills)) {
          customer.latestBills.forEach(bill => {
            if ((bill.status === "Paid" || bill.status === "Pending") && bill.date) {
              try {
                const billDate = new Date(bill.date);
                const year = billDate.getFullYear();
                if (year > 2000 && year <= new Date().getFullYear() + 1) {
                  yearsSet.add(year);
                }
              } catch (dateError) {
                console.warn('Invalid date format in bill:', bill.date);
              }
            }
          });
        }
      });
    }
    
    // Extract years from fuel data
    if (fuelData && Array.isArray(fuelData)) {
      fuelData.forEach(item => {
        if (item.year && item.year > 2000 && item.year <= new Date().getFullYear() + 1) {
          yearsSet.add(item.year);
        }
      });
    }
    
    // Extract years from expense data
    if (expenseData && Array.isArray(expenseData)) {
      expenseData.forEach(item => {
        if (item.year && item.year > 2000 && item.year <= new Date().getFullYear() + 1) {
          yearsSet.add(item.year);
        }
      });
    }
    
    // Always include current year
    yearsSet.add(new Date().getFullYear());
    
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, []);

  const fetchProfitData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data with proper error handling
      const requests = [
        api.get('/customer').catch(err => ({ data: { success: false, error: err.message } })),
        api.get('/fuel/getFuelChartData', { params: { year: selectedYear } }).catch(err => ({ data: { success: false, error: err.message } })),
        api.get('/user/expenses/chart-data', { params: { year: selectedYear } }).catch(err => ({ data: { success: false, error: err.message } }))
      ];

      const [salesResponse, fuelResponse, expenseResponse] = await Promise.all(requests);

      // Check for API errors
      const errors = [];
      if (!salesResponse.data?.success) errors.push('Sales data');
      if (!fuelResponse.data?.success) errors.push('Fuel data');
      if (!expenseResponse.data?.success) errors.push('Expense data');

      if (errors.length === 3) {
        throw new Error('Failed to fetch all required data');
      }

      // Use fallback data for failed requests
      const customersData = salesResponse.data?.success ? salesResponse.data.data || [] : [];
      const fuelData = fuelResponse.data?.success ? fuelResponse.data.data || [] : [];
      const expenseData = expenseResponse.data?.success ? expenseResponse.data.data || [] : [];

      // Extract available years from all data sources
      const years = extractAvailableYears(customersData, fuelData, expenseData);
      setAvailableYears(years);
      
      // Set default year to the most recent available year if current selection is not available
      if (years.length > 0 && !years.includes(selectedYear)) {
        setSelectedYear(years[0]);
        return; // This will trigger another fetch with the new year
      }
      
      const salesData = processMonthlyData(customersData);

      // Create maps for fuel and expense data
      const fuelMap = {};
      const expenseMap = {};

      // Process fuel data
      if (Array.isArray(fuelData)) {
        fuelData.forEach(item => {
          const monthIndex = monthsShort.indexOf(item.month);
          if (monthIndex !== -1) {
            fuelMap[monthIndex] = item.totalFuelAmount || 0;
          }
        });
      }

      // Process expense data
      if (Array.isArray(expenseData)) {
        expenseData.forEach(item => {
          const monthIndex = monthsShort.indexOf(item.month);
          if (monthIndex !== -1) {
            expenseMap[monthIndex] = item.totalExpenseAmount || 0;
          }
        });
      }

      // Calculate profit for each month
      const profitData = salesData.map((sales, index) => {
        const fuel = fuelMap[index] || 0;
        const expenses = expenseMap[index] || 0;
        const totalCosts = fuel + expenses;
        const profit = sales - totalCosts;
        
        return {
          month: monthsShort[index],
          sales: sales,
          fuel: fuel,
          expenses: expenses,
          totalCosts: totalCosts,
          profit: profit,
          profitMargin: sales > 0 ? parseFloat(((profit / sales) * 100).toFixed(1)) : 0
        };
      });

      setChartData(profitData);
      
      // Calculate totals for the year
      const totals = profitData.reduce((acc, item) => ({
        profit: acc.profit + item.profit,
        expenses: acc.expenses + item.expenses,
        fuel: acc.fuel + item.fuel,
        sales: acc.sales + item.sales
      }), { profit: 0, expenses: 0, fuel: 0, sales: 0 });
      
      setTotalProfit(totals.profit);
      setTotalExpenses(totals.expenses);
      setTotalFuelCost(totals.fuel);
      setTotalSales(totals.sales);

      // Show warning if some data sources failed
      if (errors.length > 0) {
        setError(`Warning: Could not load ${errors.join(', ')}. Showing partial data.`);
      }

    } catch (err) {
      console.error('Error fetching profit data:', err);
      setError(err.message || 'Failed to fetch profit data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedYear, processMonthlyData, extractAvailableYears]);

  useEffect(() => {
    fetchProfitData();
  }, [fetchProfitData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfitData();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-64">
          <p className="font-semibold text-gray-800 mb-3 text-center border-b pb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-blue-600 font-medium">Sales:</span>
              <span className="text-blue-600 font-bold">{formatCurrency(data.sales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-600 font-medium">Fuel:</span>
              <span className="text-red-600 font-bold">{formatCurrency(data.fuel)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-600 font-medium">Expenses:</span>
              <span className="text-purple-600 font-bold">{formatCurrency(data.expenses)}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-gray-600 font-medium">Total Costs:</span>
              <span className="text-gray-600 font-bold">{formatCurrency(data.totalCosts)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`font-bold ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Net Profit:</span>
              <span className={`font-bold ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.profit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Margin:</span>
              <span className={`font-bold ${data.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.profitMargin}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-300 rounded w-48"></div>
            <div className="h-8 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Enhanced Profit Analysis
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Year {selectedYear} - Net Profit: {formatCurrency(totalProfit)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          
          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1 ml-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-md transition-all duration-200 ${
                chartType === 'line' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Line Chart"
            >
              <TrendingUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md transition-all duration-200 ${
                chartType === 'bar' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className={`mb-4 p-3 rounded-lg ${
          error.includes('Warning') 
            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Sales</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalSales)}
              </p>
            </div>
            <div className="text-blue-600 bg-blue-200 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Fuel Costs</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalFuelCost)}
              </p>
            </div>
            <div className="text-red-600 bg-red-200 p-2 rounded-lg">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Other Expenses</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="text-purple-600 bg-purple-200 p-2 rounded-lg">
              <Calculator className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className={`bg-gradient-to-r p-4 rounded-lg border ${
          totalProfit >= 0 
            ? 'from-green-50 to-green-100 border-green-200' 
            : 'from-red-50 to-red-100 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${totalProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                Net Profit
              </p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalProfit)}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${
              totalProfit >= 0 
                ? 'text-green-600 bg-green-200' 
                : 'text-red-600 bg-red-200'
            }`}>
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-sm"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                className="text-sm"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Sales"
              />
              <Line
                type="monotone"
                dataKey="fuel"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                name="Fuel Cost"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
                name="Other Expenses"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#10B981', strokeWidth: 2 }}
                name="Net Profit"
              />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-sm"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                className="text-sm"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="sales"
                fill="#3B82F6"
                name="Sales"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="fuel"
                fill="#EF4444"
                name="Fuel Cost"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="#8B5CF6"
                name="Other Expenses"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="profit"
                fill="#10B981"
                name="Net Profit"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Enhanced Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex flex-col gap-1">
            <p className="font-medium">
              Formula: Net Profit = Sales - (Fuel + Other Expenses)
            </p>
            <p>Year: {selectedYear} | Average Monthly Profit: {formatCurrency(totalProfit / 12)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className={`font-bold text-base ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Overall Margin: {totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs">
              Total Costs: {formatCurrency(totalFuelCost + totalExpenses)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyProfitChart;