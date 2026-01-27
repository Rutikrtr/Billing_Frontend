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

  // ✅ Get only pending bills
  const getBillsToDisplay = (customer) => {
    const allBills = customer.allBills || [];
    return allBills.filter(bill => bill.pendingAmount > 0);
  };

  // ✅ Calculate totals from pending bills only
  const getCustomerSummary = (customer) => {
    const pendingBills = getBillsToDisplay(customer);
    
    const totalAmount = pendingBills.reduce((sum, bill) => sum + (bill.netAmount || 0), 0);
    const pendingAmount = pendingBills.reduce((sum, bill) => sum + (bill.pendingAmount || 0), 0);
    const paidAmount = totalAmount - pendingAmount;
    
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

  // Generate bill details
  const generateBillDetails = (bill) => {
    let details = [];
    
    if (bill.vehicles && bill.vehicles.length > 0) {
      bill.vehicles.forEach((vehicle, index) => {
        const vehicleInfo = [];
        if (vehicle.vehicleNumber) vehicleInfo.push(`${vehicle.vehicleNumber}`);
        if (vehicle.vehicleType) vehicleInfo.push(`${vehicle.vehicleType}`);
        if (vehicle.product) vehicleInfo.push(`${vehicle.product}`);
        
        details.push(`
          <div style="margin-bottom: 4px; padding-bottom: 4px; ${index < bill.vehicles.length - 1 ? 'border-bottom: 1px solid #fca5a5;' : ''}">
            <div style="font-size: 7.5pt; line-height: 1.4;">
              ${vehicleInfo.join(' - ')}
            </div>
          </div>
        `);
      });
    } else {
      const vehicleInfo = [];
      if (bill.vehicleNumber) vehicleInfo.push(`${bill.vehicleNumber}`);
      if (bill.vehicleType) vehicleInfo.push(`${bill.vehicleType}`);
      if (bill.product) vehicleInfo.push(`${bill.product}`);
      
      if (vehicleInfo.length > 0) {
        details.push(`
          <div style="font-size: 7.5pt; line-height: 1.4;">
            ${vehicleInfo.join(' - ')}
          </div>
        `);
      }
    }
    
    if (bill.extraCharges && bill.extraCharges.length > 0) {
      details.push(`
        <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #dc2626;">
          <div style="font-weight: 700; color: #dc2626; margin-bottom: 2px; font-size: 7pt;">अतिरिक्त शुल्क:</div>
          ${bill.extraCharges.map(charge => `
            <div style="display: flex; justify-content: space-between; font-size: 7pt; margin-bottom: 1px;">
              <span style="color: #374151;">${charge.description}</span>
              <span style="font-weight: 600; color: #dc2626;">₹${charge.amount.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      `);
    }
    
    return details.join('');
  };

  const getBillQuantity = (bill) => {
    if (bill.vehicles && bill.vehicles.length > 0) {
      return bill.vehicles.reduce((sum, vehicle) => sum + (vehicle.quantity || 0), 0);
    }
    return bill.quantity || 0;
  };

  const getBillRate = (bill) => {
    if (bill.vehicles && bill.vehicles.length > 0) {
      const totalAmount = bill.vehicles.reduce((sum, vehicle) => 
        sum + ((vehicle.quantity || 0) * (vehicle.rate || 0)), 0
      );
      const totalQuantity = bill.vehicles.reduce((sum, vehicle) => 
        sum + (vehicle.quantity || 0), 0
      );
      return totalQuantity > 0 ? totalAmount / totalQuantity : 0;
    }
    return bill.rate || 0;
  };

  // 🎯 Centralized logo location
  const getLogoUrl = (logoType = 'primary') => {
    return logoType === 'secondary'
      ? `${window.location.origin}/logo1.png`
      : `${window.location.origin}/logo2.png`;
  };


  // Generate PDF-ready HTML content
  const generateCustomerPDFContent = (customer) => {
    const bills = getBillsToDisplay(customer);
    const customerName = customer.customerName || customer.name || 'Unknown Customer';
    const reportDate = formatDate(new Date());
    const summary = getCustomerSummary(customer);

    const totalBillAmount = summary.totalAmount;
    const paidAmount = summary.paidAmount;
    const netPayable = summary.pendingAmount;

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

          /* Header Section - RED THEME */
          .header {
            border: 3px solid #dc2626;
            padding: 8px 10px;
            flex-shrink: 0;
            background: linear-gradient(to bottom, #fef2f2 0%, #ffffff 100%);
          }

          .header-grid {
            display: grid;
            grid-template-columns: 80px 1fr 80px;
            align-items: center;
            column-gap: 15px;
          }

          .logo { 
            width: 70px; 
            height: 70px; 
            object-fit: contain;
            border: 2px solid #dc2626;
            border-radius: 4px;
            padding: 2px;
            background: #fff;
          }

          .header-left {
            display: flex;
            justify-content: flex-start;
          }

          .header-right-logo {
            display: flex;
            justify-content: flex-end;
          }

          .header-center { 
            text-align: center;
            padding: 0 10px;
          }
          
          .marathi-title { 
            font-size: 10pt; 
            font-weight: bold; 
            margin-bottom: 3px;
            color: #dc2626;
          }
          
          .firm-name { 
            font-size: 16pt; 
            font-weight: bold; 
            letter-spacing: 0.8px; 
            margin-bottom: 3px;
            color: #b91c1c;
            text-transform: uppercase;
          }
          
          .firm-address { 
            font-size: 8.5pt; 
            margin-bottom: 2px;
            color: #991b1b;
          }
          
          .firm-services { 
            font-size: 7.5pt; 
            line-height: 1.3;
            color: #7f1d1d;
          }

          .firm-contact-info {
            font-size: 8.5pt;
            line-height: 1.5;
            margin-top: 4px;
            color: #991b1b;
          }
          
          .firm-contact-info strong {
            color: #dc2626;
          }

          /* Customer Info - RED THEME */
          .customer-info { 
            border-left: 3px solid #dc2626;
            border-right: 3px solid #dc2626;
            border-bottom: 3px solid #dc2626;
            font-size: 8.5pt; 
            flex-shrink: 0;
            background: #fefefe;
          }
          .ci-row { display: grid; grid-template-columns: 1.2fr 1.2fr 0.8fr; }
          .ci-cell {
            border-right: 1px solid #fca5a5;
            border-bottom: 1px solid #fca5a5;
            padding: 5px 8px;
            min-height: 38px;
          }
          .ci-row:last-child .ci-cell { border-bottom: none; }
          .ci-cell:last-child { border-right: none; }
          .ci-label { font-size: 7.5pt; color: #991b1b; font-weight: 600; }
          .ci-value { font-size: 9.5pt; font-weight: bold; margin-top: 3px; color: #1f2937; }

          /* Items Table - RED THEME */
          .table-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            border-left: 3px solid #dc2626;
            border-right: 3px solid #dc2626;
          }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5pt;
            height: 100%;
          }

          .items-table thead th {
            background: linear-gradient(to bottom, #fee2e2 0%, #fecaca 100%);
            font-weight: bold;
            text-align: center;
            padding: 8px 5px;
            font-size: 8.5pt;
            border-bottom: 2px solid #dc2626;
            border-left: 1px solid #fca5a5;
            color: #991b1b;
          }

          .items-table thead th:first-child { border-left: none; }
          .items-table thead th:last-child { border-right: none; }

          .items-table tbody td {
            padding: 8px 6px;
            font-size: 9pt;
            text-align: center;
            border-left: 1px solid #fca5a5;
            vertical-align: top;
          }

          .items-table tbody td:first-child { border-left: none; }
          .items-table tbody td:last-child { border-right: none; }
          .items-table tbody tr:last-child td { border-bottom: 2px solid #dc2626; }

          .items-table .text-left { text-align: left; padding-left: 8px; }
          .items-table .text-right { text-align: right; padding-right: 10px; font-weight: bold; }
          .items-table tbody td:nth-child(2) { font-weight: bold; line-height: 1.4; }
          .items-table tbody td:last-child { font-size: 9.5pt; }

          .items-table .details-cell {
            text-align: left;
            padding: 6px;
            font-size: 7.5pt;
            line-height: 1.4;
          }

          .items-table tbody tr.empty-row td {
            padding: 8px 6px;
            color: transparent;
          }

          /* Amount in Words - RED THEME */
          .amount-words {
            padding: 10px 12px;
            font-size: 9.5pt;
            border-left: 3px solid #dc2626;
            border-right: 3px solid #dc2626;
            border-bottom: 3px solid #dc2626;
            flex-shrink: 0;
            background: #fef2f2;
          }
          .amount-words-label { font-weight: bold; color: #991b1b; }
          .amount-words-value { margin-left: 10px; text-transform: uppercase; font-weight: bold; color: #dc2626; }

          /* Summary Section - RED THEME */
          .summary-section { 
            padding: 10px 0;
            border-left: 3px solid #dc2626;
            border-right: 3px solid #dc2626;
            border-bottom: 3px solid #dc2626;
            flex-shrink: 0;
            background: #fefefe;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 7px 12px;
            font-size: 10pt;
            border-bottom: 1px solid #fca5a5;
          }
          .summary-row:last-child { border-bottom: none; }
          .summary-label { flex: 1; color: #991b1b; font-weight: 500; }
          .summary-value { min-width: 130px; text-align: right; font-weight: bold; color: #1f2937; }

          .summary-row.net {
            margin-top: 6px;
            padding: 10px 12px;
            font-size: 11.5pt;
            font-weight: bold;
            border-top: 2px solid #dc2626;
            border-bottom: none;
            background: linear-gradient(to bottom, #fee2e2 0%, #fecaca 100%);
          }
          
          .summary-row.net .summary-label {
            color: #7f1d1d;
          }
          
          .summary-row.net .summary-value {
            color: #dc2626;
          }

          /* Signature Section - RED THEME */
          .signature-section {
            margin-top: 20px;
            padding: 0 12px;
            display: flex;
            justify-content: space-between;
            font-size: 9.5pt;
            flex-shrink: 0;
          }
          .signature-line { 
            border-top: 2px solid #dc2626; 
            padding-top: 5px; 
            min-width: 200px;
            color: #991b1b;
            font-weight: 500;
          }
          .signature-name { 
            font-weight: bold; 
            text-align: right;
            color: #b91c1c;
            font-size: 10.5pt;
          }

          /* Footer - RED THEME */
          .footer { 
            margin-top: auto;
            padding-top: 12px;
            text-align: center; 
            font-size: 8pt; 
            color: #991b1b;
            flex-shrink: 0;
            font-style: italic;
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
          <!-- Header with Two Logos -->
          <div class="header">
            <div class="header-grid">
              <!-- Left Logo -->
              <div class="header-left">
                <img src="${getLogoUrl('primary')}" class="logo" alt="Logo" />
              </div>

              <!-- Center Content -->
              <div class="header-center">
                <div class="marathi-title">॥ जय मातादी प्रसन्न ॥</div>
                <div class="firm-name">${user?.firmName || 'LAKSHMI SUPPLIERS'}</div>
                <div class="firm-address">${user?.address || 'भोलेगांव, अहिल्यानगर - 414111'}</div>
                <div class="firm-services">${user?.description || ''}</div>
                <div class="firm-contact-info">
                  <div><strong>प्रो.</strong> ${user?.proprietor || user?.fullname || '—'} • <strong>मो.</strong> ${user?.phoneNumbers?.primary || '—'}${user?.phoneNumbers?.secondary ? ' / ' + user.phoneNumbers.secondary : ''}</div>
                  <div><strong>GSTIN:</strong> ${user?.gstNo || user?.jstNo || '—'}</div>
                </div>
              </div>

              <!-- Right Logo -->
              <div class="header-right-logo">
                <img src="${getLogoUrl('secondary')}" class="logo" alt="Logo" />
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

          <!-- Items Table - PENDING BILLS ONLY -->
          <div class="table-wrapper">
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width:4%;">अ.क्र.</th>
                  <th style="width:12%;">बिल क्रमांक</th>
                  <th style="width:8%;">दिनांक</th>
                  <th style="width:20%;">तपशील</th>
                  <th style="width:8%;">संख्या</th>
                  <th style="width:10%;">दर</th>
                  <th style="width:12%;">एकूण रक्कम</th>
                  <th style="width:12%;">वसूल रक्कम</th>
                  <th style="width:14%;">बाकी रक्कम</th>
                </tr>
              </thead>
              <tbody>
                ${bills.length > 0 ? bills.map((bill, index) => {
                  const quantity = getBillQuantity(bill);
                  const rate = getBillRate(bill);
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td class="text-left"><strong>${bill.billNo}</strong></td>
                      <td>${formatDate(bill.date)}</td>
                      <td class="details-cell">
                        ${generateBillDetails(bill)}
                      </td>
                      <td>${quantity}</td>
                      <td class="text-right">${rate.toFixed(2)}</td>
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
                    <td>-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                  </tr>
                `).join('')}
                ${bills.length === 0 ? `
                  <tr>
                    <td colspan="9" style="text-align: center; padding: 40px; color: #dc2626; font-size: 10pt;">
                      No pending bills found
                    </td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>

          <!-- Amount in Words -->
          <div class="amount-words">
            <span class="amount-words-label">निव्वळ देय रक्कम अक्षरशः :</span>
            <span class="amount-words-value">${numberToWords(netPayable)}</span>
          </div>

          <!-- Summary Section -->
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