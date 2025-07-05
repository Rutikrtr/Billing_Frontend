import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/axiosSetup';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmationModal from './components/ConfirmationModal';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseStats from './components/ExpenseStats';
import { Plus, TrendingUp, Filter, Search, Calendar, DollarSign } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, expense: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [filters, setFilters] = useState({
    vehicleId: '',
    expenseType: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalExpenses: 0,
    hasNext: false,
    hasPrev: false
  });
  const [totalAmount, setTotalAmount] = useState(0);

  // Fetch vehicles for dropdown
  const fetchVehicles = useCallback(async () => {
    try {
      const response = await api.get('/user/vehicle');
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Error fetching vehicles');
    }
  }, []);

  // Fetch expenses with filters and pagination
  const fetchExpenses = useCallback(async (page = 1, retryCount = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/user/vehicle-expense?${params.toString()}`);
      const { expenses: expenseData, pagination: paginationData, totalAmount: total } = response.data.data;
      
      setExpenses(expenseData || []);
      setPagination(paginationData || {});
      setTotalAmount(total || 0);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      
      // Retry logic for network errors
      if (retryCount < 2 && error.code === 'NETWORK_ERROR') {
        setTimeout(() => fetchExpenses(page, retryCount + 1), 1000);
        return;
      }
      
      toast.error('Error fetching expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Optimistically add new expense to the list
  const handleExpenseAdd = useCallback((newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
    setTotalAmount(prev => prev + newExpense.amount);
  }, []);

  // Optimistically update existing expense in the list
  const handleExpenseUpdate = useCallback((updatedExpense) => {
    setExpenses(prev => {
      const oldExpense = prev.find(exp => exp._id === updatedExpense._id);
      const amountDiff = updatedExpense.amount - (oldExpense?.amount || 0);
      setTotalAmount(prevTotal => prevTotal + amountDiff);
      
      return prev.map(expense => 
        expense._id === updatedExpense._id ? updatedExpense : expense
      );
    });
  }, []);

  // Handle API errors by reverting optimistic updates
  const handleExpenseError = useCallback((originalExpenses, originalTotal) => {
    setExpenses(originalExpenses);
    setTotalAmount(originalTotal);
  }, []);

  // Open delete confirmation modal
  const openDeleteModal = useCallback((expense) => {
    setDeleteModal({ isOpen: true, expense });
  }, []);

  // Close delete confirmation modal
  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, expense: null });
  }, []);

  // Delete expense with improved optimistic updates
  const handleDelete = async () => {
    const expenseToDelete = deleteModal.expense;
    if (!expenseToDelete) return;

    setDeleteLoading(true);
    
    // Store original state for rollback
    const originalExpenses = [...expenses];
    const originalTotal = totalAmount;
    
    // Optimistically remove the expense from the list
    setExpenses(prev => prev.filter(exp => exp._id !== expenseToDelete._id));
    setTotalAmount(prev => prev - expenseToDelete.amount);
    
    try {
      await api.delete(`/user/vehicle-expense/${expenseToDelete._id}`);
      toast.success('Expense deleted successfully!');
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting expense:', error);
      
      // Revert the optimistic update
      setExpenses(originalExpenses);
      setTotalAmount(originalTotal);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        toast.error('Expense not found. It may have been already deleted.');
        // Remove from local state anyway
        setExpenses(prev => prev.filter(exp => exp._id !== expenseToDelete._id));
        setTotalAmount(prev => prev - expenseToDelete.amount);
        closeDeleteModal();
      } else {
        toast.error('Error deleting expense. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Start editing expense
  const handleEdit = useCallback((expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditingExpense(null);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      vehicleId: '',
      expenseType: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      search: ''
    });
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    fetchExpenses(page);
  }, [fetchExpenses]);

  // Load initial data on component mount
  useEffect(() => {
    fetchVehicles();
    fetchExpenses();
  }, [fetchVehicles, fetchExpenses]);

  return (
    <div className="space-y-6">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense of ₹${deleteModal.expense?.amount}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteLoading}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Expenses</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your vehicle expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <TrendingUp className="w-4 h-4" />
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Stats Section */}
      {showStats && (
        <ExpenseStats />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.totalExpenses}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Page</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.currentPage} / {pagination.totalPages}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Filter className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Vehicle Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle</label>
            <select
              value={filters.vehicleId}
              onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Vehicles</option>
              {vehicles.map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.vehicleType} - {vehicle.vehicleNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Expense Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expense Type</label>
            <input
              type="text"
              value={filters.expenseType}
              onChange={(e) => handleFilterChange('expenseType', e.target.value)}
              placeholder="e.g., Fuel, Maintenance"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Min Amount Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Amount</label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Max Amount Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Amount</label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              placeholder="999999"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Search Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search description..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Expense Form */}
      {showForm && (
        <ExpenseForm
          editingExpense={editingExpense}
          vehicles={vehicles}
          onCancel={resetForm}
          onExpenseAdd={handleExpenseAdd}
          onExpenseUpdate={handleExpenseUpdate}
          onError={handleExpenseError}
          expenses={expenses}
          totalAmount={totalAmount}
          onSuccess={resetForm}
        />
      )}

      {/* Expenses List */}
      <ExpenseList
        expenses={expenses}
        loading={loading}
        onEdit={handleEdit}
        onDelete={openDeleteModal}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Expenses;