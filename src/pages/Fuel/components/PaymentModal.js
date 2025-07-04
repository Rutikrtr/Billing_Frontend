// src/pages/fuel/components/PaymentModal.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../utils/axiosSetup';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const PaymentModal = ({ selectedFuelEntry, paymentData, setPaymentData, setShowPaymentModal, fetchFuelEntries }) => {
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handlePaymentSubmit = async () => {
    if (!paymentData.paidAmount || parseFloat(paymentData.paidAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setPaymentLoading(true);
    try {
      await api.post('/fuel/payFuelEntry', {
        fuelId: selectedFuelEntry._id,
        paidAmount: parseFloat(paymentData.paidAmount)
      });

      setShowPaymentModal(false);
      toast.success('Payment processed successfully!');
      setPaymentData({ paidAmount: '' });
      await fetchFuelEntries();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Error processing payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const totalAmount = selectedFuelEntry.fuelEntries.reduce((sum, fuel) => sum + (fuel.fuelAmount || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Process Payment</h3>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Petrol Pump:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {selectedFuelEntry.petrolPump?.name || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedFuelEntry.date)}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Vehicle Details ({selectedFuelEntry.fuelEntries.length} {selectedFuelEntry.fuelEntries.length > 1 ? 'vehicles' : 'vehicle'}):
                </h4>
                <div className="space-y-3">
                  {selectedFuelEntry.fuelEntries.map((fuel, index) => (
                    <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {fuel.vehicleNumber}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Driver: {fuel.driverName}
                          </div>
                        </div>
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        ₹{fuel.fuelAmount?.toLocaleString() || '0'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Amount:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Amount (₹) *
              </label>
              <input
                type="number"
                value={paymentData.paidAmount}
                onChange={(e) => setPaymentData({ paidAmount: e.target.value })}
                placeholder="Enter payment amount"
                min="0"
                step="0.01"
                max={totalAmount}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Maximum: ₹{totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentData({ paidAmount: '' });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handlePaymentSubmit}
              disabled={paymentLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {paymentLoading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {paymentLoading ? 'Processing...' : 'Process Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;