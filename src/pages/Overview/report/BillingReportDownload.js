// src/pages/billing/components/BillingReportDownload.js
import React from 'react';
import { useSelector } from 'react-redux';

const BillingReportDownload = ({ customers, activeTab = 'all' }) => {
  const { user } = useSelector((state) => state.auth);

  // Format date for display (DD/MM/YYYY format)
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // ✅ FIXED: Get only pending bills
  const getBillsToDisplay = (customer) => {
    // Get all bills and filter only pending ones
    const allBills = customer.allBills || [];
    return allBills.filter(bill => bill.pendingAmount > 0);
  };

  // ✅ FIXED: Calculate totals from pending bills only
  const getCustomerSummary = (customer) => {
    const pendingBills = getBillsToDisplay(customer);
    
    const totalAmount = pendingBills.reduce((sum, bill) => sum + (bill.netAmount || 0), 0);
    const pendingAmount = pendingBills.reduce((sum, bill) => sum + (bill.pendingAmount || 0), 0);
    const paidAmount = totalAmount - pendingAmount; // Calculate paid as total - pending
    
    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      billsCount: pendingBills.length,
      label: 'Net Payable'
    };
  };

  // Helper function to convert number to words
  const numberToWords = (num) => {
    if (num === 0) return 'ZERO ONLY';
    
    const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
    
    let words = '';
    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const hundreds = Math.floor((num % 1000) / 100);
    const remainder = Math.floor(num % 100);
    
    if (crores > 0) words += ones[crores] + ' CRORE ';
    if (lakhs > 0) words += (lakhs < 10 ? ones[lakhs] : tens[Math.floor(lakhs / 10)] + ' ' + ones[lakhs % 10]) + ' LAKH ';
    if (thousands > 0) words += (thousands < 10 ? ones[thousands] : tens[Math.floor(thousands / 10)] + ' ' + ones[thousands % 10]) + ' THOUSAND ';
    if (hundreds > 0) words += ones[hundreds] + ' HUNDRED ';
    if (remainder >= 10 && remainder < 20) words += teens[remainder - 10] + ' ';
    else if (remainder >= 20) words += tens[Math.floor(remainder / 10)] + ' ' + ones[remainder % 10] + ' ';
    else if (remainder > 0) words += ones[remainder] + ' ';
    
    return 'RS. ' + words.trim() + ' ONLY';
  };

  // Generate bill details for the new column
  const generateBillDetails = (bill) => {
    let details = [];
    
    // Add vehicle details
    if (bill.vehicles && bill.vehicles.length > 0) {
      bill.vehicles.forEach((vehicle, index) => {
        details.push(`
          <div style="margin-bottom: 6px; padding-bottom: 6px; ${index < bill.vehicles.length - 1 ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
            <div style="font-weight: 600; color: #374151; margin-bottom: 3px; font-size: 8pt;">
              ${vehicle.vehicleType || 'Truck'}
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; font-size: 7.5pt;">
              <div><strong>संख्या:</strong> ${vehicle.quantity}</div>
              <div><strong>दर:</strong> ₹${vehicle.rate.toFixed(2)}</div>
            </div>
            ${vehicle.product ? `<div style="font-size: 7pt; color: #6b7280; margin-top: 2px;">उत्पादन: ${vehicle.product}</div>` : ''}
          </div>
        `);
      });
    } else {
      // Single vehicle bill
      details.push(`
        <div style="margin-bottom: 6px;">
          <div style="font-weight: 600; color: #374151; margin-bottom: 3px; font-size: 8pt;">
            ${bill.vehicleType || 'Truck'}
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; font-size: 7.5pt;">
            <div><strong>संख्या:</strong> ${bill.quantity || 0}</div>
            <div><strong>दर:</strong> ₹${(bill.rate || 0).toFixed(2)}</div>
          </div>
          ${bill.product ? `<div style="font-size: 7pt; color: #6b7280; margin-top: 2px;">उत्पादन: ${bill.product}</div>` : ''}
        </div>
      `);
    }
    
    // Add extra charges if any
    if (bill.extraCharges && bill.extraCharges.length > 0) {
      details.push(`
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #dc2626;">
          <div style="font-weight: 700; color: #dc2626; margin-bottom: 4px; font-size: 7.5pt;">अतिरिक्त शुल्क:</div>
          ${bill.extraCharges.map(charge => `
            <div style="display: flex; justify-content: space-between; font-size: 7pt; margin-bottom: 2px;">
              <span style="color: #374151;">${charge.description}</span>
              <span style="font-weight: 600; color: #dc2626;">₹${charge.amount.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      `);
    }
    
    return details.join('');
  };

  // Generate PDF-ready HTML content
  const generateCustomerPDFContent = (customer) => {
    const bills = getBillsToDisplay(customer);
    const customerName = customer.customerName || customer.name || 'Unknown Customer';
    const reportDate = formatDate(new Date());
    const summary = getCustomerSummary(customer);

    // ✅ FIXED: Use calculated summary amounts
    const totalBillAmount = summary.totalAmount;
    const paidAmount = summary.paidAmount;
    const netPayable = summary.pendingAmount;

    // Calculate minimum rows to fill the page (at least 10 rows for good A4 fill)
    const minRows = 10;
    const emptyRowsNeeded = Math.max(0, minRows - bills.length);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bill - ${customerName}</title>
        <style>
          @page { 
            size: A4;
            margin: 0;
          }
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: 'Noto Sans Devanagari', 'Arial Unicode MS', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            padding: 0;
          }

          .bill-container {
            width: 210mm;
            height: 297mm;
            margin: 0;
            border: none;
            padding: 12mm;
            background: #fff;
            display: flex;
            flex-direction: column;
          }

          /* Header Section */
          .header {
            border: 2px solid #000;
            padding: 8px 10px;
            flex-shrink: 0;
          }

          .header-grid {
            display: grid;
            grid-template-columns: 65px 1fr 180px;
            align-items: center;
            column-gap: 10px;
          }

          .logo { width: 60px; height: auto; }

          .header-center { text-align: center; }
          .marathi-title { font-size: 9.5pt; font-weight: bold; margin-bottom: 2px; }
          .firm-name { font-size: 14pt; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 2px; }
          .firm-address { font-size: 8.5pt; margin-bottom: 2px; }
          .firm-services { font-size: 7.5pt; line-height: 1.3; }

          .header-right { text-align: right; font-size: 8.5pt; line-height: 1.5; }

          /* Customer Info */
          .customer-info { 
            border-left: 2px solid #000;
            border-right: 2px solid #000;
            border-bottom: 2px solid #000;
            font-size: 8.5pt; 
            flex-shrink: 0;
          }
          .ci-row { display: grid; grid-template-columns: 1.2fr 1.2fr 0.8fr; }
          .ci-cell {
            border-right: 1px solid #ccc;
            border-bottom: 1px solid #ccc;
            padding: 5px 8px;
            min-height: 38px;
          }
          .ci-row:last-child .ci-cell { border-bottom: none; }
          .ci-cell:last-child { border-right: none; }
          .ci-label { font-size: 7.5pt; color: #333; }
          .ci-value { font-size: 9.5pt; font-weight: bold; margin-top: 3px; }

          /* Items Table - Flexible height to fill page */
          .table-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            border-left: 2px solid #000;
            border-right: 2px solid #000;
          }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5pt;
            height: 100%;
          }

          .items-table thead th {
            background: #f5f5f5;
            font-weight: bold;
            text-align: center;
            padding: 8px 5px;
            font-size: 8.5pt;
            border-bottom: 2px solid #000;
            border-left: 1px solid #ccc;
          }

          .items-table thead th:first-child { border-left: none; }
          .items-table thead th:last-child { border-right: none; }

          .items-table tbody td {
            padding: 8px 6px;
            font-size: 9pt;
            text-align: center;
            border-left: 1px solid #ccc;
            vertical-align: top;
          }

          .items-table tbody td:first-child { border-left: none; }
          .items-table tbody td:last-child { border-right: none; }
          .items-table tbody tr:last-child td { border-bottom: 2px solid #000; }

          .items-table .text-left { text-align: left; padding-left: 8px; }
          .items-table .text-right { text-align: right; padding-right: 10px; font-weight: bold; }
          .items-table tbody td:nth-child(2) { font-weight: bold; line-height: 1.4; }
          .items-table tbody td:last-child { font-size: 9.5pt; }

          /* Details column styling */
          .items-table .details-cell {
            text-align: left;
            padding: 6px;
            font-size: 7.5pt;
            line-height: 1.4;
          }

          /* Empty row styling */
          .items-table tbody tr.empty-row td {
            padding: 8px 6px;
            color: transparent;
          }

          /* Amount in Words */
          .amount-words {
            padding: 10px 12px;
            font-size: 9.5pt;
            border-left: 2px solid #000;
            border-right: 2px solid #000;
            border-bottom: 2px solid #000;
            flex-shrink: 0;
          }
          .amount-words-label { font-weight: bold; }
          .amount-words-value { margin-left: 10px; text-transform: uppercase; font-weight: bold; }

          /* Summary Section */
          .summary-section { 
            padding: 10px 0;
            border-left: 2px solid #000;
            border-right: 2px solid #000;
            border-bottom: 2px solid #000;
            flex-shrink: 0;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 7px 12px;
            font-size: 10pt;
            border-bottom: 1px solid #e0e0e0;
          }
          .summary-row:last-child { border-bottom: none; }
          .summary-label { flex: 1; }
          .summary-value { min-width: 130px; text-align: right; font-weight: bold; }

          .summary-row.net {
            margin-top: 6px;
            padding: 10px 12px;
            font-size: 11.5pt;
            font-weight: bold;
            border-top: 2px solid #000;
            border-bottom: none;
            background: #f0f0f0;
          }

          /* Signature Section */
          .signature-section {
            margin-top: 20px;
            padding: 0 12px;
            display: flex;
            justify-content: space-between;
            font-size: 9.5pt;
            flex-shrink: 0;
          }
          .signature-line { border-top: 1px solid #000; padding-top: 5px; min-width: 200px; }
          .signature-name { font-weight: bold; text-align: right; }

          /* Footer */
          .footer { 
            margin-top: auto;
            padding-top: 12px;
            text-align: center; 
            font-size: 8pt; 
            color: #666;
            flex-shrink: 0;
          }

          @media print {
            body { 
              margin: 0; 
              padding: 0;
              width: 210mm;
              height: 297mm;
            }
            .bill-container {
              page-break-after: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="bill-container">
          <!-- Header -->
          <div class="header">
            <div class="header-grid">
              <div class="header-left">
                <img src="${user?.logo || 'logo.png'}" class="logo" alt="Logo" />
              </div>

              <div class="header-center">
                <div class="marathi-title">॥ ${user?.firmNameMarathi || 'श्री गणेशाय नमः'} ॥</div>
                <div class="firm-name">${user?.firmName || 'LAKSHMI SUPPLIERS'}</div>
                <div class="firm-address">${user?.address || 'भोलेगांव, अहिल्यानगर - 414111'}</div>
                <div class="firm-services">${user?.description || ''}</div>
              </div>

              <div class="header-right">
                <div><strong>प्रो.</strong> ${user?.proprietor || user?.fullname || '—'}</div>
                <div><strong>मो.</strong> ${user?.phoneNumbers?.primary || '—'}</div>
                <div><strong>GSTIN:</strong> ${user?.gstNo || user?.jstNo || '—'}</div>
              </div>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="customer-info">
            <div class="ci-row">
              <div class="ci-cell">
                <div class="ci-label">ग्राहकाचे नाव</div>
                <div class="ci-value">${customerName}</div>
              </div>
              <div class="ci-cell">
                <div class="ci-label">पत्ता</div>
                <div class="ci-value">${customer.customerAddress || customer.address || '—'}</div>
              </div>
              <div class="ci-cell"></div>
            </div>

            <div class="ci-row">
              <div class="ci-cell">
                <div class="ci-label">कस्टमर नं.</div>
                <div class="ci-value">${customer.customerMobile || '—'}</div>
              </div>
              <div class="ci-cell">
                <div class="ci-label">बिल नं.</div>
                <div class="ci-value">PENDING-${new Date().toISOString().slice(0,10).replace(/-/g,'')}</div>
              </div>
              <div class="ci-cell">
                <div class="ci-label">बिल दिनांक</div>
                <div class="ci-value">${reportDate}</div>
              </div>
            </div>
          </div>

          <!-- Items Table with flexible height - PENDING BILLS ONLY -->
          <div class="table-wrapper">
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width:4%;">अ.क्र.</th>
                  <th style="width:15%;">बिल क्रमांक</th>
                  <th style="width:8%;">दिनांक</th>
                  <th style="width:20%;">तपशील</th>
                  <th style="width:13%;">एकूण रक्कम</th>
                  <th style="width:13%;">वसूल रक्कम</th>
                  <th style="width:14%;">बाकी रक्कम</th>
                </tr>
              </thead>
              <tbody>
                ${bills.length > 0 ? bills.map((bill, index) => {
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td class="text-left"><strong>${bill.billNo}</strong></td>
                      <td>${formatDate(bill.date)}</td>
                      <td class="details-cell">
                        ${generateBillDetails(bill)}
                      </td>
                      <td class="text-right">${(bill.netAmount || 0).toFixed(2)}</td>
                      <td class="text-right" style="color: #16a34a;">${((bill.netAmount || 0) - (bill.pendingAmount || 0)).toFixed(2)}</td>
                      <td class="text-right" style="color: #dc2626;"><strong>${(bill.pendingAmount || 0).toFixed(2)}</strong></td>
                    </tr>
                  `;
                }).join('') : ''}
                ${Array(emptyRowsNeeded).fill(0).map((_, i) => `
                  <tr class="empty-row">
                    <td>${bills.length + i + 1}</td>
                    <td class="text-left">-</td>
                    <td>-</td>
                    <td>-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                  </tr>
                `).join('')}
                ${bills.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #999; font-size: 10pt;">
                      No pending bills found
                    </td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>

          <!-- Amount in Words - NET PAYABLE -->
          <div class="amount-words">
            <span class="amount-words-label">निव्वळ देय रक्कम अक्षरशः :</span>
            <span class="amount-words-value">${numberToWords(netPayable)}</span>
          </div>

          <!-- Summary Section - SHOWS ALL THREE AMOUNTS -->
          <div class="summary-section">
            <div class="summary-row">
              <div class="summary-label">एकूण बिल रक्कम / Total Bill Amount</div>
              <div class="summary-value">${formatCurrency(totalBillAmount)}</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">वसूल केलेली रक्कम / Amount Paid</div>
              <div class="summary-value" style="color: #16a34a;">${formatCurrency(paidAmount)}</div>
            </div>
            <div class="summary-row net">
              <div class="summary-label">निव्वळ देय रक्कम / Net Payable Amount</div>
              <div class="summary-value" style="color: #dc2626;">${formatCurrency(netPayable)}</div>
            </div>
          </div>

          <!-- Signature Section -->
          <div class="signature-section">
            <div class="signature-line">ग्राहकाची सही / Customer Signature</div>
            <div class="signature-name">${user?.firmName || 'लक्ष्मी सप्लायर्स'}</div>
          </div>

          <!-- Footer -->
          <div class="footer">This is a computer generated bill • Pending Bills Report • Page 1 of 1</div>
        </div>
      </body>
      </html>`;
  };

  // Download PDF for a specific customer
  const downloadCustomerPDF = (customer) => {
    const htmlContent = generateCustomerPDFContent(customer);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const customerName = (customer.customerName || customer.name || 'Unknown_Customer')
      .replace(/[^a-zA-Z0-9]/g, '_');
    const firmName = (user?.firmName || 'Report').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${firmName}_PendingBills_${customerName}_${new Date().toISOString().split('T')[0]}`;
    
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
        
        // Only show button if customer has pending bills
        if (summary.billsCount === 0) {
          return null;
        }
        
        return (
          <button
            key={customer._id || customer.id}
            onClick={() => downloadCustomerPDF(customer)}
            className="inline-flex items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-md"
            title={`Download pending bills PDF for ${customerName}`}
          >
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-left">
              <div className="font-semibold">PDF - {customerName}</div>
              <div className="text-xs text-gray-500">
                {summary.billsCount} pending • Net: {formatCurrency(summary.pendingAmount)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default BillingReportDownload;