import React, { useState, useEffect } from 'react';
import { X, Fuel, DollarSign, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import api from '../../utils/axiosSetup';
import { toast } from 'react-hot-toast'; // or your toast library

const PayByPetrolPumpModal = ({ isOpen, onClose, onPaymentSuccess }) => {
  const [petrolPumps, setPetrolPumps] = useState([]);
  const [selectedPump, setSelectedPump] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
 

  // Fetch petrol pumps when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPetrolPumps();
    }
  }, [isOpen]);

  // Fetch petrol pumps with totals
  const fetchPetrolPumps = async () => {
    setLoading(true);
    try {
      const response = await api.get('/fuel/getPetrolPumps');
      const pumpsData = response.data.data || [];
      
      // Calculate pending amounts from existing transaction data
      const pumpsWithPending = pumpsData.map((pump) => {
        let pendingAmount = 0;
        let hasPendingTransactions = false;
        
        // Calculate pending amount from transactions
        if (pump.transactions && pump.transactions.length > 0) {
          pump.transactions.forEach(transaction => {
            if (transaction.status === 'Pending') {
              const transactionTotal = transaction.fuelEntries.reduce(
                (sum, entry) => sum + entry.fuelAmount, 
                0
              );
              pendingAmount += transactionTotal;
              hasPendingTransactions = true;
            }
          });
        }
        
        return {
          ...pump,
          pendingAmount,
          hasPendingTransactions
        };
      });
      
      setPetrolPumps(pumpsWithPending);
    } catch (error) {
      console.error('Error fetching petrol pumps:', error);
      toast.error('Failed to fetch petrol pumps');
      setPetrolPumps([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle pump selection
  const handlePumpSelect = (pump) => {
    setSelectedPump(pump);
    setDropdownOpen(false);
  };

  // Handle payment
  const handlePayment = async () => {
    if (!selectedPump) {
      toast.error('Please select a petrol pump');
      return;
    }

    if (selectedPump.pendingAmount <= 0) {
      toast.error('No pending amount for this petrol pump');
      return;
    }

    setPaying(true);
    try {
      const response = await api.post('/fuel/payAllPendingForPetrolPump', {
        petrolPumpId: selectedPump._id
      });

      if (response.data.success) {
        toast.success(response.data.message);
        
        // Call success callback to refresh data
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
        
        // Close modal
        onClose();
        
        // Reset state
        setSelectedPump(null);
      } else {
        toast.error(response.data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  // Close modal and reset state
  const handleClose = () => {
    setSelectedPump(null);
    setDropdownOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pay by Petrol Pump</h2>
              <p className="text-sm text-gray-500">Pay pending transactions</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Content - Made scrollable and flexible */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading...</span>
              </div>
            ) : (
              <>
                {/* Dropdown for Petrol Pump Selection */}
                <div className="space-y-3">
                  <label className="text-base font-medium text-gray-700">Select Petrol Pump</label>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full p-3 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Fuel className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          <span className={`${selectedPump ? 'text-gray-900' : 'text-gray-500'} text-base truncate`}>
                            {selectedPump ? selectedPump.name : 'Choose a petrol pump...'}
                          </span>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    
                    {dropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {petrolPumps.length === 0 ? (
                          <div className="p-6 text-center text-gray-500">
                            <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-base">No petrol pumps found</p>
                          </div>
                        ) : (
                          petrolPumps.map((pump) => (
                            <div
                              key={pump._id}
                              onClick={() => handlePumpSelect(pump)}
                              className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-base truncate">{pump.name}</p>
                                  <p className="text-sm text-gray-500 truncate">{pump.address}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  {pump.hasPendingTransactions ? (
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="h-4 w-4 text-orange-500" />
                                      <span className="text-sm font-medium text-orange-600">
                                        ₹{pump.pendingAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      <span className="text-sm text-green-600">Paid</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Pump Details */}
                {selectedPump && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3 text-base">Payment Summary</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-start gap-3">
                        <span className="text-blue-700 flex-shrink-0">Petrol Pump:</span>
                        <span className="font-medium text-blue-900 text-right break-words">{selectedPump.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Total Filled:</span>
                        <span className="font-medium text-blue-900">₹{selectedPump.totalFilled?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Pending Amount:</span>
                        <span className="font-medium text-blue-900">₹{selectedPump.pendingAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Status */}
                {selectedPump && selectedPump.pendingAmount <= 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-base text-green-700">All transactions are paid for this petrol pump</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-base text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={!selectedPump || selectedPump.pendingAmount <= 0 || paying}
            className={`px-6 py-2 text-base rounded-lg font-medium transition-colors flex items-center gap-2 ${
              selectedPump && selectedPump.pendingAmount > 0 && !paying
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {paying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                Pay ₹{selectedPump ? selectedPump.pendingAmount.toFixed(2) : '0.00'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayByPetrolPumpModal;