// src/pages/billing/BillForm.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const BillForm = ({ customers, vehicles, selectedCustomer, onSubmit, onCancel }) => {
  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    customerId: selectedCustomer || '',
    comment: '',
    date: getTodayDate(),
    extraCharges: [],
    entries: [
      {
        vehicleNumber: '',
        driverName: '',
        unit: 'Day',
        quantity: 1,
        rate: '',
        cashDiscount: 0,
        from: '',
        to: '',
        product: ''
      }
    ]
  });
  
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });

  // State for customer dropdown
  const [customerDropdown, setCustomerDropdown] = useState({
    isOpen: false,
    searchTerm: ''
  });

  // State for vehicle dropdown
  const [vehicleDropdown, setVehicleDropdown] = useState({
    openIndex: null,
    searchTerm: ''
  });

  // Calculate total summary for all entries
  const calculateTotalSummary = () => {
    const entriesTotal = formData.entries.reduce((acc, entry) => {
      const quantity = parseFloat(entry.quantity) || 0;
      const rate = parseFloat(entry.rate) || 0;
      const discount = parseFloat(entry.cashDiscount) || 0;

      const totalAmount = quantity * rate;
      const netAmount = totalAmount - discount;

      return {
        totalAmount: acc.totalAmount + totalAmount,
        totalDiscount: acc.totalDiscount + discount,
        netAmount: acc.netAmount + netAmount
      };
    }, { totalAmount: 0, totalDiscount: 0, netAmount: 0 });

    // Add extra charges calculation
    const totalExtraCharges = formData.extraCharges.reduce((sum, charge) => {
      return sum + (parseFloat(charge.amount) || 0);
    }, 0);

    return {
      ...entriesTotal,
      totalExtraCharges,
      finalNetAmount: entriesTotal.netAmount + totalExtraCharges
    };
  };

  // Calculate summary for individual entry
  const calculateEntrySummary = (entry) => {
    const quantity = parseFloat(entry.quantity) || 0;
    const rate = parseFloat(entry.rate) || 0;
    const discount = parseFloat(entry.cashDiscount) || 0;

    const totalAmount = quantity * rate;
    const netAmount = totalAmount - discount;

    return { totalAmount, netAmount };
  };

  // Enhanced customer filtering function
  const filterCustomers = (searchTerm) => {
    if (!searchTerm.trim()) return customers;

    const term = searchTerm.toLowerCase().trim();

    return customers.filter(customer => {
      const nameMatch = customer.customerName.toLowerCase().includes(term);
      const phoneMatch = customer.phone?.toLowerCase().includes(term);
      const emailMatch = customer.email?.toLowerCase().includes(term);
      const addressMatch = customer.address?.toLowerCase().includes(term);

      return nameMatch || phoneMatch || emailMatch || addressMatch;
    });
  };

  // Get selected customer name
  const getSelectedCustomerName = () => {
    const customer = customers.find(c => c._id === formData.customerId);
    return customer ? customer.customerName : '';
  };

  // Customer dropdown handlers
  const toggleCustomerDropdown = () => {
    setCustomerDropdown(prev => ({
      isOpen: !prev.isOpen,
      searchTerm: prev.isOpen ? '' : prev.searchTerm
    }));
  };

  const handleCustomerSearch = (e) => {
    setCustomerDropdown(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({ ...prev, customerId: customer._id }));
    setCustomerDropdown({ isOpen: false, searchTerm: '' });

    if (errors.customerId) {
      setErrors(prev => ({ ...prev, customerId: '' }));
    }
  };

  // Vehicle dropdown handlers
  const toggleVehicleDropdown = (index) => {
    if (vehicleDropdown.openIndex === index) {
      setVehicleDropdown({ openIndex: null, searchTerm: '' });
    } else {
      setVehicleDropdown({ openIndex: index, searchTerm: '' });
    }
  };

  const handleVehicleSearch = (e) => {
    setVehicleDropdown(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close customer dropdown
      if (customerDropdown.isOpen && !event.target.closest('.customer-dropdown')) {
        setCustomerDropdown({ isOpen: false, searchTerm: '' });
      }

      // Close vehicle dropdown
      if (vehicleDropdown.openIndex !== null && !event.target.closest('.vehicle-dropdown')) {
        setVehicleDropdown({ openIndex: null, searchTerm: '' });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [customerDropdown.isOpen, vehicleDropdown.openIndex]);

  const handleCommentChange = (e) => {
    setFormData(prev => ({
      ...prev,
      comment: e.target.value
    }));
  };

  // Add date change handler
  const handleDateChange = (e) => {
    setFormData(prev => ({
      ...prev,
      date: e.target.value
    }));
    
    // Clear date error if exists
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '' }));
    }
  };

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...formData.entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    };

    // Auto-fill rate and lock unit when vehicle is selected
    if (field === 'vehicleNumber') {
      const selectedVehicle = vehicles.find(v => v.vehicleNumber === value);
      if (selectedVehicle) {
        updatedEntries[index] = {
          ...updatedEntries[index],
          rate: selectedVehicle.rate,
          unit: selectedVehicle.unit
        };
      }
    }

    setFormData(prev => ({
      ...prev,
      entries: updatedEntries
    }));

    // Clear error when user starts typing
    if (errors.entryErrors && errors.entryErrors[index] && errors.entryErrors[index][field]) {
      const updatedEntryErrors = [...(errors.entryErrors || [])];
      updatedEntryErrors[index] = {
        ...updatedEntryErrors[index],
        [field]: ''
      };
      setErrors(prev => ({
        ...prev,
        entryErrors: updatedEntryErrors
      }));
    }
  };

  const addEntry = () => {
    setFormData(prev => ({
      ...prev,
      entries: [
        ...prev.entries,
        {
          vehicleNumber: '',
          driverName: '',
          unit: 'Day',
          quantity: 1,
          rate: '',
          cashDiscount: 0,
          from: '',
          to: '',
          product: ''
        }
      ]
    }));
  };

  const removeEntry = (index) => {
    if (formData.entries.length > 1) {
      const updatedEntries = formData.entries.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        entries: updatedEntries
      }));

      // Remove errors for this entry
      if (errors.entryErrors && errors.entryErrors[index]) {
        const updatedEntryErrors = errors.entryErrors.filter((_, i) => i !== index);
        setErrors(prev => ({
          ...prev,
          entryErrors: updatedEntryErrors
        }));
      }
    }
  };

  // Extra charges handlers
  const addExtraCharge = () => {
    setFormData(prev => ({
      ...prev,
      extraCharges: [
        ...prev.extraCharges,
        { description: '', amount: '' }
      ]
    }));
  };

  const removeExtraCharge = (index) => {
    setFormData(prev => ({
      ...prev,
      extraCharges: prev.extraCharges.filter((_, i) => i !== index)
    }));
  };

  const handleExtraChargeChange = (index, field, value) => {
    const updatedExtraCharges = [...formData.extraCharges];
    updatedExtraCharges[index] = {
      ...updatedExtraCharges[index],
      [field]: value
    };

    setFormData(prev => ({
      ...prev,
      extraCharges: updatedExtraCharges
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const result = await onSubmit(formData);

    if (result.success) {
      // Reset form on success
      setFormData({
        customerId: selectedCustomer || '',
        comment: '',
        date: getTodayDate(), // Reset date to today
        extraCharges: [],
        entries: [
          {
            vehicleNumber: '',
            driverName: '',
            unit: 'Day',
            quantity: 1,
            rate: '',
            cashDiscount: 0,
            from: '',
            to: '',
            product: ''
          }
        ]
      });
      setErrors({});
      setSubmitStatus({ success: true, message: 'Bill created successfully!' });
      toast.success('Bill created successfully!');
    } else {
      if (result.errors) {
        setErrors(result.errors);
      }
      setSubmitStatus({ success: false, message: result.message || 'Error creating bill' });
      toast.error(result.message || 'Error creating bill');
    }

    setSubmitLoading(false);
  };

  const totalSummary = calculateTotalSummary();
  const filteredCustomers = filterCustomers(customerDropdown.searchTerm);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create Bill with Multiple Entries</h3>

      {submitStatus.message && (
        <div className={`mb-4 p-3 rounded-lg ${submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {submitStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          {/* Customer Selection with Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Customer *
            </label>
            <div className="relative customer-dropdown">
              <button
                type="button"
                onClick={toggleCustomerDropdown}
                className={`w-full px-4 py-3 border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                  errors.customerId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {getSelectedCustomerName() ? (
                  <div className="flex justify-between items-center">
                    <span>{getSelectedCustomerName()}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${customerDropdown.isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Select customer...</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${customerDropdown.isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Customer Dropdown */}
              {customerDropdown.isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {/* Search Input */}
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search customers..."
                        value={customerDropdown.searchTerm}
                        onChange={handleCustomerSearch}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        autoFocus
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Customer Options */}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer._id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <div className="font-medium">{customer.customerName}</div>
                        {(customer.phone || customer.email) && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {customer.phone && <span>{customer.phone}</span>}
                            {customer.phone && customer.email && <span> | </span>}
                            {customer.email && <span>{customer.email}</span>}
                          </div>
                        )}
                      </div>
                    ))}

                    {filteredCustomers.length === 0 && (
                      <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                        No customers found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bill Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={handleDateChange}
              max={getTodayDate()} // Prevent selecting future dates
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select the date for this bill
            </p>
          </div>
        </div>

        {/* Vehicle Entries */}
        <div className="space-y-8">
          {formData.entries.map((entry, index) => {
            const entrySummary = calculateEntrySummary(entry);
            const entryErrors = errors.entryErrors && errors.entryErrors[index] ? errors.entryErrors[index] : {};
            const selectedVehicle = vehicles.find(v => v.vehicleNumber === entry.vehicleNumber);
            const isUnitLocked = !!selectedVehicle;

            return (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Vehicle Entry #{index + 1}
                  </h4>
                  {formData.entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(index)}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Vehicle Selection with Searchable Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vehicle *
                    </label>
                    <div className="relative vehicle-dropdown">
                      <button
                        type="button"
                        onClick={() => toggleVehicleDropdown(index)}
                        className={`w-full px-3 py-2 border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${entryErrors.vehicleNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                      >
                        {entry.vehicleNumber ? (
                          <div className="flex justify-between items-center">
                            <span>
                              {entry.vehicleNumber}
                              {selectedVehicle ? ` - ${selectedVehicle.vehicleType}` : ''}
                            </span>
                            <svg
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${vehicleDropdown.openIndex === index ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Select vehicle...</span>
                            <svg
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${vehicleDropdown.openIndex === index ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        )}
                      </button>

                      {/* Vehicle Dropdown */}
                      {vehicleDropdown.openIndex === index && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {/* Search Input */}
                          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search vehicles..."
                                value={vehicleDropdown.searchTerm}
                                onChange={handleVehicleSearch}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                autoFocus
                              />
                              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>

                          {/* Vehicle Options */}
                          <div className="max-h-48 overflow-y-auto">
                            {vehicles
                              .filter(vehicle =>
                                !vehicleDropdown.searchTerm ||
                                vehicle.vehicleNumber.toLowerCase().includes(vehicleDropdown.searchTerm.toLowerCase()) ||
                                vehicle.vehicleType.toLowerCase().includes(vehicleDropdown.searchTerm.toLowerCase())
                              )
                              .map(vehicle => (
                                <div
                                  key={vehicle._id}
                                  onClick={() => {
                                    handleEntryChange(index, 'vehicleNumber', vehicle.vehicleNumber);
                                    setVehicleDropdown({ openIndex: null, searchTerm: '' });
                                  }}
                                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                  <div className="font-medium">{vehicle.vehicleNumber}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {vehicle.vehicleType} | ₹{vehicle.rate}/{vehicle.unit?.toLowerCase() || 'day'}
                                  </div>
                                </div>
                              ))
                            }

                            {vehicles.filter(v =>
                              !vehicleDropdown.searchTerm ||
                              v.vehicleNumber.toLowerCase().includes(vehicleDropdown.searchTerm.toLowerCase()) ||
                              v.vehicleType.toLowerCase().includes(vehicleDropdown.searchTerm.toLowerCase())
                            ).length === 0 && (
                                <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                                  No vehicles found
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                    {entryErrors.vehicleNumber && (
                      <p className="mt-1 text-sm text-red-600">{entryErrors.vehicleNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Chalan Name *
                    </label>
                    <input
                      type="text"
                      value={entry.driverName}
                      onChange={(e) => handleEntryChange(index, 'driverName', e.target.value)}
                      placeholder="Enter driver name"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${entryErrors.driverName ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {entryErrors.driverName && (
                      <p className="mt-1 text-sm text-red-600">{entryErrors.driverName}</p>
                    )}
                  </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product
                    </label>
                    <input
                      type="text"
                      value={entry.product}
                      onChange={(e) => handleEntryChange(index, 'product', e.target.value)}
                      placeholder="Enter product name"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${entryErrors.product ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {entryErrors.product && (
                      <p className="mt-1 text-sm text-red-600">{entryErrors.product}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit *
                    </label>
                    <select
                      value={entry.unit}
                      onChange={(e) => handleEntryChange(index, 'unit', e.target.value)}
                      disabled={isUnitLocked}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isUnitLocked ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                        }`}
                    >
                      <option value="Day">Day</option>
                      <option value="Hours">Hours</option>
                      <option value="Trip">Trip</option>
                    </select>
                    {isUnitLocked && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Unit locked to vehicle type
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={entry.quantity}
                      onChange={(e) => handleEntryChange(index, 'quantity', e.target.value)}
                      placeholder="Enter quantity"
                      min="1"
                      step="any"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${entryErrors.quantity ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {entryErrors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{entryErrors.quantity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rate *
                    </label>
                    <input
                      type="number"
                      value={entry.rate}
                      onChange={(e) => handleEntryChange(index, 'rate', e.target.value)}
                      placeholder="Enter rate"
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${entryErrors.rate ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {entryErrors.rate && (
                      <p className="mt-1 text-sm text-red-600">{entryErrors.rate}</p>
                    )}
                  </div>


                  {entry.unit === 'Trip' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          From *
                        </label>
                        <input
                          type="text"
                          value={entry.from}
                          onChange={(e) => handleEntryChange(index, 'from', e.target.value)}
                          placeholder="Starting location"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${entryErrors.from ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {entryErrors.from && (
                          <p className="mt-1 text-sm text-red-600">{entryErrors.from}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          To *
                        </label>
                        <input
                          type="text"
                          value={entry.to}
                          onChange={(e) => handleEntryChange(index, 'to', e.target.value)}
                          placeholder="Destination"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${entryErrors.to ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {entryErrors.to && (
                          <p className="mt-1 text-sm text-red-600">{entryErrors.to}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Entry Summary */}
                {(entry.rate && entry.quantity) && (
                  <div className="mt-4 bg-white dark:bg-gray-700 p-3 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entry Summary</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total:</span>
                        <span className="ml-2 font-semibold">₹{entrySummary.totalAmount}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">Net Amount:</span>
                        <span className="ml-2 font-semibold text-green-600">₹{entrySummary.netAmount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Entry Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={addEntry}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another Vehicle Entry
          </button>
        </div>
        {/* Extra Charges Section */}
        {formData.extraCharges.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Extra Charges</h4>
            {formData.extraCharges.map((charge, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-md font-medium text-gray-700 dark:text-gray-300">
                    Extra Charge #{index + 1}
                  </h5>
                  <button
                    type="button"
                    onClick={() => removeExtraCharge(index)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={charge.description}
                      onChange={(e) => handleExtraChargeChange(index, 'description', e.target.value)}
                      placeholder="Enter charge description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount *
                    </label>
                    <input
                      type="number"
                      value={charge.amount}
                      onChange={(e) => handleExtraChargeChange(index, 'amount', e.target.value)}
                      placeholder="Enter amount"
                      min="0.01"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Extra Charge Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={addExtraCharge}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Extra Charge
          </button>
        </div>

        {/* Bill Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bill Comment
          </label>
          <textarea
            value={formData.comment}
            onChange={handleCommentChange}
            placeholder="Additional notes for the entire bill..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Total Summary */}
        {formData.entries.length > 0 && totalSummary.totalAmount > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Bill Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Entries</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formData.entries.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-600 dark:text-blue-400">Entries Amount</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">₹{totalSummary.netAmount.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-600 dark:text-blue-400">Extra Charges</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{totalSummary.totalExtraCharges.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-600 dark:text-blue-400">Final Amount</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{totalSummary.finalNetAmount.toFixed(2)}</p>
              </div>
            </div>
            {totalSummary.totalDiscount > 0 && (
              <div className="mt-2 text-center">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Total Discount: ₹{totalSummary.totalDiscount.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitLoading || formData.entries.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {submitLoading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {submitLoading ? 'Creating Bill...' : `Create Bill with ${formData.entries.length} Entries`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillForm;