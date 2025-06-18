// src/pages/billing/Billing.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosSetup';
import CustomerSelect from './CustomerSelect';
import BillForm from './BillForm';
import BillList from './BillList';
import PaymentModal from './PaymentModal';
import InvoicePrint from './invoice/InvoicePrint';
import { Toaster } from 'react-hot-toast';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBillForm, setShowBillForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState(null);
  const [selectedCustomerForPrint, setSelectedCustomerForPrint] = useState(null);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await api.get(
        '/customer'
      );
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const response = await api.get(
        '/user/vehicle'
      );
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // Fetch bills for selected customer
  const fetchBills = async (customerId) => {
    if (!customerId) {
      setBills([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        '/bill/all',
        { customerId }
      );
      setBills(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle customer selection change
  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
    fetchBills(customerId);
  };

  // Handle bill form submission
  const handleBillSubmit = async (formData) => {
    const newErrors = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required';
    }

    // Validate entries instead of bills
    if (!formData.entries || formData.entries.length === 0) {
      newErrors.entries = 'At least one vehicle entry is required';
    }

    // Validate each entry
    const entryErrors = [];
    formData.entries.forEach((entry, index) => {
      const entryError = {};

      if (!entry.vehicleNumber) entryError.vehicleNumber = 'Vehicle is required';
      if (!entry.driverName?.trim()) entryError.driverName = 'Driver name is required';
      if (!entry.quantity || entry.quantity <= 0) entryError.quantity = 'Quantity must be at least 1';
      if (!entry.rate || entry.rate <= 0) entryError.rate = 'Rate must be greater than 0';
      if (entry.unit === 'Trip' && (!entry.from?.trim() || !entry.to?.trim())) {
        entryError.from = 'From location is required for Trip units';
        entryError.to = 'To location is required for Trip units';
      }
      if (entry.cashDiscount < 0) entryError.cashDiscount = 'Discount cannot be negative';

      if (Object.keys(entryError).length > 0) {
        entryErrors[index] = entryError;
      }
    });

    if (entryErrors.length > 0) {
      newErrors.entryErrors = entryErrors;
    }

    if (Object.keys(newErrors).length > 0) {
      return { success: false, errors: newErrors };
    }

    try {
      await api.post(
        '/bill/addbill',
        formData
      );

      // Refresh bills and customers (to update pending amounts)
      await fetchBills(formData.customerId);
      await fetchCustomers();
      setShowBillForm(false);
      return { success: true };

    } catch (error) {
      console.error('Error adding bill:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error adding bill. Please try again.'
      };
    }
  };

  // Handle payment
 const handlePaymentSubmit = async (bill, amountPaid, method, reference) => {
  if (!amountPaid || amountPaid <= 0) {
    return { success: false, message: 'Please enter a valid payment amount' };
  }

  if (parseFloat(amountPaid) > bill.pendingAmount) {
    return { success: false, message: 'Payment amount cannot exceed pending amount' };
  }

  try {
    await api.post(
      '/bill/update-payment',
      {
        customerId: selectedCustomer,
        billNo: bill.billNo,
        amountPaid: parseFloat(amountPaid),
        method,
        reference: reference.trim()
      }
    );
    
    // Refresh bills and customers
    await fetchBills(selectedCustomer);
    await fetchCustomers();
    return { success: true };
  } catch (error) {
    console.error('Error updating payment:', error);
    return { success: false, message: 'Error updating payment. Please try again.' };
  }
};

  // Handle pay all pending bills
  const handlePayAllPending = async (customerId) => {
    try {
      const response = await api.post(
        '/bill/pay-all-pending',
        { customerId }
      );

      if (response.data.success) {
        // Refresh bills and customers
        await fetchBills(customerId);
        await fetchCustomers();
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Error paying all pending bills:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error processing payment. Please try again.'
      };
    }
  };

  // Reset bill form
  const resetBillForm = () => {
    setShowBillForm(false);
  };

  // Open invoice print modal
  const handlePrintInvoice = (bill) => {
    setSelectedBillForPrint(bill);
    setSelectedCustomerForPrint(
      customers.find(c => c._id === selectedCustomer)
    );
    setShowInvoicePrint(true);
  };

 const calculateTotals = () => {
  const filteredBills = bills.filter(bill => {
    const statusFilter = filterStatus === 'All' || bill.status === filterStatus;
    
    // Enhanced search filter with proper null checks
    const searchFilter = searchTerm === '' || [
      bill.billNo,
      bill.vehicleNumber,
      bill.driverName,
      bill.vehicleType,
      bill.status,
      // Handle vehicles array if present
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
      return field.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });

    return statusFilter && searchFilter;
  });

  const totalAmount = filteredBills.reduce((sum, bill) => sum + (bill.netAmount || 0), 0);
  const pendingAmount = filteredBills.reduce((sum, bill) => sum + (bill.pendingAmount || 0), 0);
  const pendingBillsCount = filteredBills.filter(bill => (bill.pendingAmount || 0) > 0).length;

  return {
    billCount: filteredBills.length,
    totalAmount,
    pendingAmount,
    pendingBillsCount,
  };
};
  // Load initial data
  useEffect(() => {
    fetchCustomers();
    fetchVehicles();
  }, []);

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <Toaster />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage customer bills</p>
        </div>
        <button
          onClick={() => setShowBillForm(!showBillForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Bills
        </button>
      </div>

      <CustomerSelect
        customers={customers}
        selectedCustomer={selectedCustomer}
        onCustomerChange={handleCustomerChange}
        pendingBillsCount={totals.pendingBillsCount}
        totalAmount={totals.totalAmount}
        pendingAmount={totals.pendingAmount}
        bills={bills} // Pass bills to show detailed pending bills
        onPayFullAmount={handlePayAllPending} // Pass pay all pending handler
        onRefreshBills={fetchBills} // Pass refresh handler
      />

      {showBillForm && (
        <BillForm
          customers={customers}
          vehicles={vehicles}
          selectedCustomer={selectedCustomer}
          onSubmit={handleBillSubmit}
          onCancel={resetBillForm}
        />
      )}

      {selectedCustomer && (
        <BillList
          bills={bills}
          loading={loading}
          filterStatus={filterStatus}
          searchTerm={searchTerm}
          onFilterChange={setFilterStatus}
          onSearchChange={setSearchTerm}
          onPaymentClick={(bill) => {
            setSelectedBill(bill);
            setShowPaymentModal(true);
          }}
          onShowClick={handlePrintInvoice}
        />
      )}

      {showPaymentModal && selectedBill && (
        <PaymentModal
          bill={selectedBill}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handlePaymentSubmit}
        />
      )}

      {showInvoicePrint && selectedBillForPrint && selectedCustomerForPrint && (
        <InvoicePrint
          bill={selectedBillForPrint}
          customer={selectedCustomerForPrint}
          onClose={() => setShowInvoicePrint(false)}
        />
      )}
    </div>
  );
};

export default Billing;