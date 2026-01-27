// src/pages/billing/CustomerPaymentModal.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const CustomerPaymentModal = ({ customer, pendingAmount, onClose, onSubmit }) => {
  const [collectType, setCollectType] = useState(null); // 'manual' or 'full'
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);

  // Use the pendingAmount prop passed from parent
  const actualPendingAmount = pendingAmount || 0;
  const customerName = customer?.name || customer?.customerName || 'Customer';
  const customerPhone = customer?.phone || customer?.customerMobile || 'N/A';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amountToCollect = collectType === 'full' 
      ? actualPendingAmount 
      : parseFloat(amount);

    if (!amountToCollect || amountToCollect <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountToCollect > actualPendingAmount) {
      toast.error('Payment amount cannot exceed pending amount');
      return;
    }

    setLoading(true);
    const result = await onSubmit(
      amountToCollect,
      paymentMethod, 
      reference,
      collectType === 'full'
    );
    setLoading(false);

    if (result.success) {
      toast.success('Payment collected successfully!');
      onClose();
    } else {
      toast.error(result.message || 'Failed to collect payment');
    }
  };

  const handleBack = () => {
    setCollectType(null);
    setAmount('');
    setReference('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Collect Payment from Customer
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Customer Info */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">Customer:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{customerName}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">Phone:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{customerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Pending:</span>
            <span className="font-semibold text-red-600 dark:text-red-400">₹{actualPendingAmount.toFixed(2)}</span>
          </div>
        </div>

        {!collectType ? (
          /* Collection Type Selection */
          <div className="space-y-3">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Choose collection type:</p>
            <button
              onClick={() => setCollectType('manual')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Manual Amount
            </button>
            <button
              onClick={() => {
                setCollectType('full');
                setAmount(actualPendingAmount.toString());
              }}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Collect Full Amount (₹{actualPendingAmount.toFixed(2)})
            </button>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount to Collect
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={collectType === 'full'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                placeholder="Enter amount"
                required
                max={actualPendingAmount}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This amount will be distributed across pending bills
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reference/Note (Optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Transaction ID, Cheque No, etc."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Collect Payment'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CustomerPaymentModal;