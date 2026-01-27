import React, { useState, useRef, useEffect } from 'react';

const CustomerSelect = ({
  customers,
  selectedCustomer,
  onCustomerChange,
  pendingBillsCount,
  pendingAmount,
  bills = [],
  onCollectPayment,
  onViewTransactions,
  onPrintBill
}) => {
  const [showPendingBillsModal, setShowPendingBillsModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const filteredCustomers = customers.filter(customer =>
    !dropdownSearchTerm ||
    customer.customerName.toLowerCase().includes(dropdownSearchTerm.toLowerCase()) ||
    (customer.customerNumber && customer.customerNumber.toLowerCase().includes(dropdownSearchTerm.toLowerCase()))
  );

  const pendingBills = bills.filter(bill => bill.pendingAmount > 0);

  const selectedCustomerDetails = customers.find(c => c._id === selectedCustomer);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setDropdownSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      setDropdownSearchTerm('');
    }
  };

  const handleCustomerSelect = (customerId) => {
    onCustomerChange(customerId);
    setIsDropdownOpen(false);
    setDropdownSearchTerm('');
  };

  const handleViewPendingBills = () => {
    if (selectedCustomer && pendingBillsCount > 0) {
      setShowPendingBillsModal(true);
    }
  };

  const handleDropdownSearch = (e) => {
    setDropdownSearchTerm(e.target.value);
  };

  const handleKeyDown = (e, customerId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCustomerSelect(customerId);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Customer</h3>
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={handleDropdownToggle}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-white text-left flex items-center justify-between"
              >
                <span className={selectedCustomerDetails ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                  {selectedCustomerDetails ?
                    `${selectedCustomerDetails.customerName}${selectedCustomerDetails.customerNumber ? ` - ${selectedCustomerDetails.customerNumber}` : ''}` :
                    'Select a customer...'
                  }
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search customers..."
                        value={dropdownSearchTerm}
                        onChange={handleDropdownSearch}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      <>
                        {selectedCustomer && (
                          <div
                            onClick={() => handleCustomerSelect('')}
                            onKeyDown={(e) => handleKeyDown(e, '')}
                            tabIndex={0}
                            className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 text-red-600 dark:text-red-400 text-sm"
                          >
                            Clear selection
                          </div>
                        )}
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer._id}
                            onClick={() => handleCustomerSelect(customer._id)}
                            onKeyDown={(e) => handleKeyDown(e, customer._id)}
                            tabIndex={0}
                            className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${selectedCustomer === customer._id ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{customer.customerName}</div>
                                {customer.customerNumber && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {customer.customerNumber}
                                  </div>
                                )}
                              </div>
                              {selectedCustomer === customer._id && (
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        {dropdownSearchTerm ? 'No customers found matching your search' : 'No customers available'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedCustomer && selectedCustomerDetails && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-sm text-red-600 dark:text-red-400 font-medium">Pending Amount</div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
                    ₹{pendingAmount.toLocaleString()}
                  </div>
                  {pendingBillsCount > 0 && (
                    <button
                      onClick={handleViewPendingBills}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline mt-1"
                    >
                      {pendingBillsCount} pending bill{pendingBillsCount !== 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={onCollectPayment}
                  disabled={pendingAmount <= 0}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                  title={pendingAmount <= 0 ? "No pending amount to collect" : "Collect payment from customer"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="hidden sm:inline">Collect Payment</span>
                  <span className="sm:hidden">Payment</span>
                </button>
                
                <button
                  onClick={onViewTransactions}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                  title="View customer transaction history"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">View Transactions</span>
                  <span className="sm:hidden">Transactions</span>
                </button>

                <button
                  onClick={onPrintBill}
                  disabled={pendingAmount <= 0}
                  className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                  title={pendingAmount <= 0 ? "No pending bills to print" : "Print pending bills report"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span className="hidden sm:inline">Print Bill</span>
                  <span className="sm:hidden">Print</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPendingBillsModal && (
        <PendingBillsModal
          customer={selectedCustomerDetails}
          pendingBills={pendingBills}
          totalPendingAmount={pendingAmount}
          onClose={() => setShowPendingBillsModal(false)}
        />
      )}
    </>
  );
};

const PendingBillsModal = ({
  customer,
  pendingBills,
  totalPendingAmount,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Pending Bills - {customer?.customerName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {pendingBills.length} pending bills • Total: ₹{totalPendingAmount.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {pendingBills.map((bill) => (
              <div
                key={bill.billNo}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Bill No: {bill.billNo}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Date: {new Date(bill.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      ₹{bill.pendingAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      of ₹{bill.netAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {bill.vehicles?.map((vehicle, index) => (
                    <div key={index} className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded">
                      <span className="font-medium">{vehicle.vehicleNumber}</span>
                      <span className="mx-2">•</span>
                      <span>{vehicle.driverName}</span>
                      <span className="mx-2">•</span>
                      <span>{vehicle.quantity} {vehicle.unit}</span>
                      {vehicle.from && vehicle.to && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{vehicle.from} → {vehicle.to}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {bill.comment && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <strong>Comment:</strong> {bill.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Pending Amount: ₹{totalPendingAmount.toLocaleString()}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSelect;