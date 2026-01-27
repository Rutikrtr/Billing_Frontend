// src/pages/billing/PaymentModal.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const PaymentModal = ({ bill, onClose, onSubmit }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [method, setMethod] = useState('Cash');
  const [reference, setReference] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    const result = await onSubmit(bill, amountPaid, method, reference);

    if (result.success) {
      setSubmitStatus({ success: true, message: 'Payment updated successfully!' });
      toast.success('Payment Received!');
      onClose();
    } else {
      setSubmitStatus({ success: false, message: result.message });
    }
    
    setSubmitLoading(false);
  };

  


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Make a Payment</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Bill No: <strong>{bill.billNo}</strong><br />
          Pending Amount: <strong>₹{bill.pendingAmount.toLocaleString()}</strong>
        </p>

        {submitStatus.message && (
          <div className={`p-3 rounded-lg ${submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              min="0"
              max={bill.pendingAmount}
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reference
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder={
                method === 'Online' ? 'Transaction ID (optional)' : 
                method === 'Cheque' ? 'Cheque Number (optional)' : 
                'Reference (optional)'
              }
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitLoading}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitLoading ? 'Processing...' : 'Submit Payment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;