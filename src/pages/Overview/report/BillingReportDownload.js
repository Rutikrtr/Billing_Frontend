// src/pages/billing/components/BillingReportDownload.js
import React from 'react';
import { useSelector } from 'react-redux';

const BillingReportDownload = ({ customers, dateRange, activeTab = 'all' }) => {
  const { user } = useSelector((state) => state.auth);

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Format phone numbers
  const formatPhoneNumbers = (phoneNumbers) => {
    if (!phoneNumbers) return '';
    const phones = [];
    if (phoneNumbers.primary) phones.push(phoneNumbers.primary);
    if (phoneNumbers.secondary1) phones.push(phoneNumbers.secondary1);
    if (phoneNumbers.secondary2) phones.push(phoneNumbers.secondary2);
    return phones.join(', ');
  };

  // Get bills to display based on active tab
  const getBillsToDisplay = (customer) => {
    switch (activeTab) {
      case 'pending':
        return customer.pendingBills || [];
      case 'unpaid':
        return customer.unpaidBills || [];
      default:
        return customer.allBills || [];
    }
  };

  // Get customer summary data based on active tab
  const getCustomerSummary = (customer) => {
    switch (activeTab) {
      case 'pending':
        return {
          amount: customer.pendingAmount || 0,
          billsCount: customer.pendingBills?.length || 0,
          label: 'Pending Amount'
        };
      case 'unpaid':
        return {
          amount: customer.unpaidAmount || 0,
          billsCount: customer.unpaidBills?.length || 0,
          label: 'Unpaid Amount'
        };
      default:
        return {
          amount: customer.allBillsAmount || 0,
          billsCount: customer.allBills?.length || 0,
          label: 'Total Amount'
        };
    }
  };

  // Get report title based on active tab
  const getReportTitle = () => {
    switch (activeTab) {
      case 'pending':
        return 'PENDING BILLS REPORT';
      case 'unpaid':
        return 'UNPAID BILLS REPORT';
      default:
        return 'ALL BILLS REPORT';
    }
  };

  // Generate PDF-ready HTML content for a single customer
  const generateCustomerPDFContent = (customer) => {
    const title = getReportTitle();
    const dateRangeText = dateRange ? 
      `From: ${formatDate(dateRange.startDate)} To: ${formatDate(dateRange.endDate)}` : 
      'All Dates';
    
    const bills = getBillsToDisplay(customer);
    const summary = getCustomerSummary(customer);
    const customerName = customer.customerName || customer.name || 'Unknown Customer';

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title} - ${customerName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Times New Roman', serif; 
            margin: 0; 
            padding: 20px;
            background-color: white;
            font-size: 14px;
            line-height: 1.4;
          }
          .report-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            border: 3px solid #dc2626;
            padding: 0;
            position: relative;
          }
          
          /* Decorative corners */
          .corner-decoration {
            position: absolute;
            width: 40px;
            height: 40px;
            border: 2px solid #dc2626;
          }
          .corner-top-left { top: 15px; left: 15px; border-right: none; border-bottom: none; }
          .corner-top-right { top: 15px; right: 15px; border-left: none; border-bottom: none; }
          .corner-bottom-left { bottom: 15px; left: 15px; border-right: none; border-top: none; }
          .corner-bottom-right { bottom: 15px; right: 15px; border-left: none; border-top: none; }

          /* Header */
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 25px;
            position: relative;
            text-align: center;
            border-bottom: 3px solid #dc2626;
          }
          .header h1 {
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 4px;
            margin-bottom: 8px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .firm-name {
            font-size: 14px;
            font-weight: 400;
            margin-bottom: 5px;
            letter-spacing: 2px;
          }
          .report-number {
            position: absolute;
            top: 5px;
            right: 5px;
            text-align: right;
            background: rgba(255,255,255,0.1);
            padding: 10px;
            border-radius: 8px;
            height: 50px;
            width: 140px;
          }
          .report-number .label {
            font-size: 12px;
            opacity: 0.9;
          }
          .report-number .number {
            font-size: 12px;
            font-weight: bold;
            margin-top: 5px;
          }
          .full-name {
            position: absolute;
            top: 5px;
            left: 5px;
            text-align: left;
            background: rgba(255,255,255,0.1);
            padding: 10px;
            border-radius: 8px;
            height: 50px;
            width: 140px;
          }
          .full-name .label {
            font-size: 12px;
            opacity: 0.9;
          }
          .full-name .name {
            font-size: 12px;
            font-weight: bold;
            margin-top: 5px;
          }
          .date-range {
            position: absolute;
            top: 55px;
            left: 5px;
            text-align: left;
            background: rgba(255,255,255,0.1);
            padding: 10px;
            border-radius: 8px;
            height: 50px;
            width: 140px;
          }
          .date-range .label {
            font-size: 12px;
            opacity: 0.9;
          }
          .date-range .range {
            font-size: 11px;
            font-weight: bold;
            margin-top: 5px;
          }

          /* Traditional Border Pattern */
          .traditional-border {
            height: 15px;
            background: repeating-linear-gradient(
              45deg,
              #dc2626,
              #dc2626 5px,
              #f87171 5px,
              #f87171 10px
            );
          }

          /* Contact Bar */
          .contact-bar {
            background: #fef2f2;
            border: 2px solid #dc2626;
            padding: 15px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0;
          }
          .contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #7f1d1d;
            font-weight: 600;
          }
          .contact-icon {
            width: 16px;
            height: 16px;
            fill: #dc2626;
          }

          /* Report Info */
          .report-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            margin: 0;
            border: 2px solid #dc2626;
            border-top: none;
          }
          .info-section {
            padding: 20px 25px;
            border-right: 2px solid #dc2626;
          }
          .info-section:last-child {
            border-right: none;
          }
          .info-section h3 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #7f1d1d;
            border-bottom: 2px solid #dc2626;
            padding-bottom: 8px;
          }
          .info-line {
            display: flex;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .info-label {
            font-weight: 700;
            width: 100px;
            flex-shrink: 0;
            color: #7f1d1d;
          }
          .info-value {
            flex: 1;
            color: #374151;
          }

          /* Summary Box */
          .summary-box {
            background: #fef2f2;
            border: 2px solid #dc2626;
            border-top: none;
            padding: 25px;
          }
          .summary-box h3 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #7f1d1d;
            text-align: center;
            border-bottom: 2px solid #dc2626;
            padding-bottom: 10px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          .summary-item {
            background: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 2px solid #dc2626;
          }
          .summary-item .value {
            font-size: 24px;
            font-weight: 800;
            color: #7f1d1d;
            margin-bottom: 8px;
            display: block;
          }
          .summary-item .label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
          }

          /* Bills Table */
          .bills-table {
            width: 100%;
            border-collapse: collapse;
            border: 3px solid #dc2626;
            margin: 0;
            font-size: 13px;
          }
          .bills-table th {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 15px 8px;
            text-align: center;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid #7f1d1d;
          }
          .bills-table td {
            border: 1px solid #dc2626;
            padding: 12px 8px;
            text-align: center;
            vertical-align: middle;
            font-size: 12px;
          }
          .bills-table .bill-details {
            text-align: left;
            padding-left: 12px;
            font-size: 11px;
            line-height: 1.5;
          }
          .bills-table .amount-cell {
            text-align: right;
            font-weight: 700;
            padding-right: 12px;
            color: #7f1d1d;
          }
          .bills-table .total-row {
            background: #fef2f2;
            font-weight: bold;
            font-size: 13px;
            border-top: 3px solid #dc2626;
          }
          .bill-number {
            font-weight: 700;
            color: #7f1d1d;
          }

          /* Status Badges */
          .status-badge {
            padding: 6px 10px;
            border-radius: 15px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-block;
          }
          .status-pending { background: #fef3c7; color: #92400e; border: 1px solid #f59e0b; }
          .status-paid { background: #d1fae5; color: #065f46; border: 1px solid #10b981; }
          .status-partial { background: #fde68a; color: #92400e; border: 1px solid #f59e0b; }
          .category-pending { background: #fee2e2; color: #dc2626; border: 1px solid #ef4444; }
          .category-unpaid { background: #fed7aa; color: #ea580c; border: 1px solid #f97316; }
          .category-paid { background: #dcfce7; color: #16a34a; border: 1px solid #22c55e; }

          /* No Bills Message */
          .no-bills {
            text-align: center;
            padding: 60px 20px;
            color: #7f1d1d;
            font-style: italic;
            font-size: 16px;
            background: #fef2f2;
            border: 2px solid #dc2626;
            margin: 0;
          }

          /* Signature Section */
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding: 25px;
            border: 2px solid #dc2626;
            border-top: none;
          }
          .signature-box {
            width: 45%;
            text-align: center;
          }
          .signature-line {
            border-bottom: 2px solid #dc2626;
            height: 60px;
            margin-bottom: 15px;
            position: relative;
          }
          .signature-label {
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #7f1d1d;
          }

          @media print {
            body { 
              margin: 0; 
              padding: 10px;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .no-print { display: none !important; }
            .report-container { 
              max-width: none;
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <!-- Decorative corners -->
          <div class="corner-decoration corner-top-left"></div>
          <div class="corner-decoration corner-top-right"></div>
          <div class="corner-decoration corner-bottom-left"></div>
          <div class="corner-decoration corner-bottom-right"></div>

          <!-- Header -->
          <div class="header">
            <div class="full-name">
              <div class="label">GENERATED BY</div>
              <div class="name">${user?.fullname || 'Admin'}</div>
            </div>
            
            <div class="report-number">
              <div class="label">REPORT #</div>
              <div class="number">RPT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}</div>
            </div>

            
            <h1>${user?.firmName || 'COMPANY NAME'}</h1>
            <div class="firm-name">${user?.discription || 'BILLING REPORTS'}</div>
            <div style="margin-top: 15px; font-size: 16px; font-weight: 600;">${title}</div>
          </div>

          <!-- Traditional Border -->
          <div class="traditional-border"></div>

          <!-- Contact Bar -->
          <div class="contact-bar">
            ${user?.phoneNumbers?.primary ? `
            <div class="contact-item">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span>${user?.phoneNumbers?.primary}</span>
            </div>
            ` : ''}
            ${user?.phoneNumbers?.secondary1 ? `
            <div class="contact-item">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span>${user?.phoneNumbers?.secondary1}</span>
            </div>
            ` : ''}
            <div class="contact-item">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>${user?.address || 'Company Address'}</span>
            </div>
            <div class="contact-item">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              <span>GST: ${user?.jstNo || 'N/A'}</span>
            </div>
          </div>

          <!-- Report Info -->
          <div class="report-info">
            <div class="info-section">
              <h3>Report Details</h3>
              <div class="info-line">
                <span class="info-label">Report Type:</span>
                <span class="info-value">${title}</span>
              </div>
              <div class="info-line">
                <span class="info-label">Generated By:</span>
                <span class="info-value">${user?.fullname || 'Admin'}</span>
              </div>
            </div>
            <div class="info-section">
              <h3>Customer Details</h3>
              <div class="info-line">
                <span class="info-label">Customer:</span>
                <span class="info-value">${customerName}</span>
              </div>
              <div class="info-line">
                <span class="info-label">Customer ID:</span>
                <span class="info-value">${customer._id || customer.id || 'N/A'}</span>
              </div>
              <div class="info-line">
                <span class="info-label">Mobile:</span>
                <span class="info-value">${customer.customerMobile || 'N/A'}</span>
              </div>
              <div class="info-line">
                <span class="info-label">Address:</span>
                <span class="info-value">${customer.customerAddress || customer.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          >`;

    // Bills table
    if (bills && bills.length > 0) {
      htmlContent += `
          <table class="bills-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Bill Number</th>
                <th>Date</th>
                <th>Total Amount</th>
                ${(activeTab === 'unpaid' || activeTab === 'all') ? '<th>Pending Amount</th>' : ''}
                <th>Status</th>
                ${activeTab === 'all' ? '<th>Category</th>' : ''}
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>`;

      bills.forEach((bill, index) => {
        let category = 'Paid';
        if (bill.status === 'Pending') {
          category = 'Pending';
        } else if (bill.pendingAmount && bill.pendingAmount > 0) {
          category = 'Unpaid';
        }

        const statusClass = bill.status?.toLowerCase() === 'pending' ? 'status-pending' : 
                           bill.status?.toLowerCase() === 'paid' ? 'status-paid' : 'status-partial';
        
        const categoryClass = category === 'Pending' ? 'category-pending' : 
                             category === 'Unpaid' ? 'category-unpaid' : 'category-paid';

        htmlContent += `
              <tr>
                <td>${index + 1}</td>
                <td><strong class="bill-number">${bill.billNo || '-'}</strong></td>
                <td>${formatDate(bill.date)}</td>
                <td class="amount-cell">₹${(bill.totalAmount || bill.amount || 0).toLocaleString('en-IN')}</td>
                ${(activeTab === 'unpaid' || activeTab === 'all') ? `<td class="amount-cell" style="color: #ea580c;">₹${(bill.pendingAmount || 0).toLocaleString('en-IN')}</td>` : ''}
                <td><span class="status-badge ${statusClass}">${bill.status || 'Unknown'}</span></td>
                ${activeTab === 'all' ? `<td><span class="status-badge ${categoryClass}">${category}</span></td>` : ''}
                <td class="bill-details">${bill.comment || bill.remarks || '-'}</td>
              </tr>`;
      });

      // Total row
      const totalAmount = bills.reduce((sum, bill) => sum + (bill.totalAmount || bill.amount || 0), 0);
      const totalPending = bills.reduce((sum, bill) => sum + (bill.pendingAmount || 0), 0);

      htmlContent += `
              <tr class="total-row">
                <td colspan="3" style="text-align: right; padding-right: 12px;"><strong>TOTAL</strong></td>
                <td class="amount-cell"><strong>₹${totalAmount.toLocaleString('en-IN')}</strong></td>
                ${(activeTab === 'unpaid' || activeTab === 'all') ? `<td class="amount-cell"><strong>₹${totalPending.toLocaleString('en-IN')}</strong></td>` : ''}
                <td colspan="${activeTab === 'all' ? '2' : '1'}"></td>
              </tr>
            </tbody>
          </table>`;
    } else {
      htmlContent += `
          <div class="no-bills">
            <p>📋 No bills found for this customer in the selected date range and category.</p>
          </div>`;
    }

    htmlContent += `
          <!-- Signature Section -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Customer Acknowledgment</div>
              <p style="margin-top: 10px; color: #64748b; font-size: 12px;">${customerName}</p>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Authorized by ${user?.firmName || 'Company'}</div>
              <p style="margin-top: 10px; color: #7f1d1d; font-size: 12px;">${user?.fullname || 'Authorized Person'}</p>
            </div>
          </div>
        </div>
      </body>
      </html>`;

    return htmlContent;
  };

  // Download PDF for a specific customer
  const downloadCustomerPDF = (customer) => {
    const htmlContent = generateCustomerPDFContent(customer);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const customerName = (customer.customerName || customer.name || 'Unknown_Customer').replace(/[^a-zA-Z0-9]/g, '_');
    const firmName = (user?.firmName || 'Report').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${firmName}_${getReportTitle().replace(/\s+/g, '_')}_${customerName}_${new Date().toISOString().split('T')[0]}`;
    
    // Open in new window for printing
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.document.title = fileName;
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
          URL.revokeObjectURL(url);
        }, 500);
      };
    }
  };

  if (!customers || customers.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {customers.map((customer) => {
        const customerName = customer.customerName || customer.name || 'Unknown Customer';
        const summary = getCustomerSummary(customer);
        
        return (
          <button
            key={customer._id || customer.id}
            onClick={() => downloadCustomerPDF(customer)}
            className="inline-flex items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-md"
            title={`Download PDF report for ${customerName}`}
          >
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-left">
              <div className="font-semibold">PDF - {customerName}</div>
              <div className="text-xs text-gray-500">
                {summary.billsCount} bills • {formatCurrency(summary.amount)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default BillingReportDownload;