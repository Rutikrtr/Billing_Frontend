import React, { useState, useEffect } from 'react';

const BillEditModal = ({ 
  showEditModal, 
  billToEdit, 
  onSave, 
  onCancel, 
  loading 
}) => {
  const [formData, setFormData] = useState({
    comment: '',
    entries: [],
    extraCharges: [],
    product: ''
  });
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (billToEdit && showEditModal) {
      setFormData({
        comment: billToEdit.comment || '',
        entries: billToEdit.vehicles?.map(vehicle => ({
          vehicleNumber: vehicle.vehicleNumber || '',
          vehicleType: vehicle.vehicleType || '',
          driverName: vehicle.driverName || '',
          unit: vehicle.unit || 'Day',
          quantity: vehicle.quantity || 1,
          rate: vehicle.rate || 0,
          from: vehicle.from || '',
          to: vehicle.to || '',
          product: vehicle.product || ''
        })) || [],
        extraCharges: billToEdit.extraCharges || [],
        product: billToEdit.product || ''
      });
      setErrors({});
    }
  }, [billToEdit, showEditModal]);

  // Handle basic input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle vehicle entry changes
  const handleEntryChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  // Handle extra charge changes
  const handleExtraChargeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      extraCharges: prev.extraCharges.map((charge, i) => 
        i === index ? { ...charge, [field]: value } : charge
      )
    }));
  };

  // Add new extra charge
  const addExtraCharge = () => {
    setFormData(prev => ({
      ...prev,
      extraCharges: [...prev.extraCharges, { description: '', amount: 0 }]
    }));
  };

  // Remove extra charge
  const removeExtraCharge = (index) => {
    setFormData(prev => ({
      ...prev,
      extraCharges: prev.extraCharges.filter((_, i) => i !== index)
    }));
  };

  // Add new vehicle entry
  const addVehicleEntry = () => {
    setFormData(prev => ({
      ...prev,
      entries: [...prev.entries, {
        vehicleNumber: '',
        vehicleType: '',
        driverName: '',
        unit: 'Day',
        quantity: 1,
        rate: 0,
        from: '',
        to: '',
        product: ''
      }]
    }));
  };

  // Remove vehicle entry
  const removeVehicleEntry = (index) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.filter((_, i) => i !== index)
    }));
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (formData.entries.length === 0) {
      newErrors.entries = 'At least one vehicle entry is required';
    }

    formData.entries.forEach((entry, index) => {
      if (!entry.vehicleNumber.trim()) {
        newErrors[`entry_${index}_vehicleNumber`] = 'Vehicle number is required';
      }
      if (entry.quantity <= 0) {
        newErrors[`entry_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (entry.rate === undefined || entry.rate === null || entry.rate === '') {
        newErrors[`entry_${index}_rate`] = 'Rate is required';
      }
      if (entry.unit === 'Trip' && (!entry.from || !entry.to)) {
        newErrors[`entry_${index}_from`] = 'From and To are required for Trip units';
        newErrors[`entry_${index}_to`] = 'From and To are required for Trip units';
      }
    });

    formData.extraCharges.forEach((charge, index) => {
      if (!charge.description.trim()) {
        newErrors[`charge_${index}_description`] = 'Description is required';
      }
      if (charge.amount === undefined || charge.amount === null || charge.amount === '' || charge.amount <= 0) {
        newErrors[`charge_${index}_amount`] = 'Amount must be a positive number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate totals
  const calculateTotals = () => {
    const vehicleTotal = formData.entries.reduce((sum, entry) => {
      return sum + (entry.quantity * entry.rate);
    }, 0);

    const extraChargesTotal = formData.extraCharges.reduce((sum, charge) => {
      return sum + (parseFloat(charge.amount) || 0);
    }, 0);

    const netAmount = vehicleTotal + extraChargesTotal;

    return {
      vehicleTotal,
      extraChargesTotal,
      netAmount
    };
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const submissionData = {
      customerId: billToEdit.customerId || billToEdit._id,
      billNo: billToEdit.billNo,
      entries: formData.entries,
      extraCharges: formData.extraCharges,
      comment: formData.comment,
      product: formData.product
    };

    onSave(submissionData);
  };

  if (!showEditModal) return null;

  const totals = calculateTotals();
  const validUnits = ['Day', 'Hours', 'Trip'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl dark:bg-gray-800">
          {/* Header */}
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                Edit Bill - {billToEdit?.billNo}
              </h3>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'basic'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Basic Details
                </button>
                <button
                  onClick={() => setActiveTab('vehicles')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'vehicles'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Vehicles ({formData.entries.length})
                </button>
                <button
                  onClick={() => setActiveTab('charges')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'charges'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Extra Charges ({formData.extraCharges.length})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6 max-h-96 overflow-y-auto">
              {/* Basic Details Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Product
                      </label>
                      <input
                        type="text"
                        value={formData.product}
                        onChange={(e) => handleInputChange('product', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter product name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Comment
                    </label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => handleInputChange('comment', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter any comments..."
                    />
                  </div>
                </div>
              )}

              {/* Vehicles Tab */}
              {activeTab === 'vehicles' && (
                <div className="space-y-4">
                  {formData.entries.map((entry, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Vehicle {index + 1}
                        </h4>
                        <button
                          onClick={() => removeVehicleEntry(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Vehicle Number *
                          </label>
                          <input
                            type="text"
                            value={entry.vehicleNumber}
                            onChange={(e) => handleEntryChange(index, 'vehicleNumber', e.target.value)}
                            className={`mt-1 block w-full rounded-md border shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              errors[`entry_${index}_vehicleNumber`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors[`entry_${index}_vehicleNumber`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`entry_${index}_vehicleNumber`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Driver Name
                          </label>
                          <input
                            type="text"
                            value={entry.driverName}
                            onChange={(e) => handleEntryChange(index, 'driverName', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Unit *
                          </label>
                          <select
                            value={entry.unit}
                            onChange={(e) => handleEntryChange(index, 'unit', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            {validUnits.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={entry.quantity}
                            onChange={(e) => handleEntryChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            className={`mt-1 block w-full rounded-md border shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              errors[`entry_${index}_quantity`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors[`entry_${index}_quantity`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`entry_${index}_quantity`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Rate *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={entry.rate}
                            onChange={(e) => handleEntryChange(index, 'rate', parseFloat(e.target.value) || 0)}
                            className={`mt-1 block w-full rounded-md border shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              errors[`entry_${index}_rate`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors[`entry_${index}_rate`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`entry_${index}_rate`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Product
                          </label>
                          <input
                            type="text"
                            value={entry.product}
                            onChange={(e) => handleEntryChange(index, 'product', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        
                        {entry.unit === 'Trip' && (
                          <>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                From *
                              </label>
                              <input
                                type="text"
                                value={entry.from}
                                onChange={(e) => handleEntryChange(index, 'from', e.target.value)}
                                className={`mt-1 block w-full rounded-md border shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                  errors[`entry_${index}_from`] ? 'border-red-300' : 'border-gray-300'
                                }`}
                              />
                              {errors[`entry_${index}_from`] && (
                                <p className="mt-1 text-xs text-red-600">{errors[`entry_${index}_from`]}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                To *
                              </label>
                              <input
                                type="text"
                                value={entry.to}
                                onChange={(e) => handleEntryChange(index, 'to', e.target.value)}
                                className={`mt-1 block w-full rounded-md border shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                  errors[`entry_${index}_to`] ? 'border-red-300' : 'border-gray-300'
                                }`}
                              />
                              {errors[`entry_${index}_to`] && (
                                <p className="mt-1 text-xs text-red-600">{errors[`entry_${index}_to`]}</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="mt-3 text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Amount: ₹{(entry.quantity * entry.rate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addVehicleEntry}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500"
                  >
                    <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Vehicle
                  </button>
                  
                  {errors.entries && (
                    <p className="text-sm text-red-600">{errors.entries}</p>
                  )}
                </div>
              )}

              {/* Extra Charges Tab */}
              {activeTab === 'charges' && (
                <div className="space-y-4">
                  {formData.extraCharges.map((charge, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Charge {index + 1}
                        </h4>
                        <button
                          onClick={() => removeExtraCharge(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Description *
                          </label>
                          <input
                            type="text"
                            value={charge.description}
                            onChange={(e) => handleExtraChargeChange(index, 'description', e.target.value)}
                            className={`mt-1 block w-full rounded-md border shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              errors[`charge_${index}_description`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Loading charges"
                          />
                          {errors[`charge_${index}_description`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`charge_${index}_description`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Amount *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={charge.amount}
                            onChange={(e) => handleExtraChargeChange(index, 'amount', parseFloat(e.target.value) || 0)}
                            className={`mt-1 block w-full rounded-md border shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              errors[`charge_${index}_amount`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors[`charge_${index}_amount`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`charge_${index}_amount`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addExtraCharge}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500"
                  >
                    <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Extra Charge
                  </button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
              <h4 className="text-sm font-medium text-gray-900 mb-3 dark:text-white">Bill Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Vehicle Total:</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{totals.vehicleTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Extra Charges:</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{totals.extraChargesTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-600">
                  <span className="font-medium text-gray-900 dark:text-white">Net Amount:</span>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">₹{totals.netAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-700">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillEditModal;