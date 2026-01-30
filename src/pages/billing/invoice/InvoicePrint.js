import React from 'react';
import { useSelector } from 'react-redux';
import { Printer, X, FileText } from 'lucide-react';

const InvoicePrint = ({ bill, customer, onClose }) => {
  const { user } = useSelector((state) => state.auth);

  // 🎯 Centralized logo location - SINGLE SOURCE OF TRUTH
  const getLogoUrl = (logoType = 'primary') => {
    return logoType === 'secondary'
      ? `${window.location.origin}/logo1.png`
      : `${window.location.origin}/logo2.png`;
  };

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

  const totalQuantity = bill.vehicles ? bill.vehicles.reduce((sum, v) => sum + v.quantity, 0) : bill.quantity || 0;

  const printBill = () => {
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${bill.billNo}</title>
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

        .invoice-container {
          width: 210mm;
          min-height: 297mm;
          margin: 0;
          border: none;
          padding: 8mm;
          background: #fff;
        }

        /* Header Section - RED THEME */
        .header {
          border: 3px solid #dc2626;
          padding: 8px 10px;
          background: linear-gradient(to bottom, #fef2f2 0%, #ffffff 100%);
          margin-bottom: 0;
        }

        .header-grid {
          display: grid;
          grid-template-columns: 80px 1fr 80px;
          align-items: center;
          column-gap: 15px;
        }

        .logo {
          width: 150px;
          height: auto;
          border: none;
          outline: none;
          box-shadow: none;
          object-fit: contain;
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

        /* Traditional Border Pattern */
        .traditional-border {
          height: 10px;
          background: repeating-linear-gradient(
            45deg,
            #dc2626,
            #dc2626 5px,
            #f87171 5px,
            #f87171 10px
          );
          border-left: 3px solid #dc2626;
          border-right: 3px solid #dc2626;
        }

        /* Customer Info - RED THEME */
        .customer-info { 
          border-left: 3px solid #dc2626;
          border-right: 3px solid #dc2626;
          border-bottom: 3px solid #dc2626;
          font-size: 8.5pt; 
          background: #fefefe;
        }
        .ci-row { display: grid; grid-template-columns: 1fr 1fr; }
        .ci-cell {
          border-right: 1px solid #fca5a5;
          border-bottom: 1px solid #fca5a5;
          padding: 6px 10px;
        }
        .ci-row:last-child .ci-cell { border-bottom: none; }
        .ci-cell:last-child { border-right: none; }
        .ci-label { font-size: 7.5pt; color: #991b1b; font-weight: 600; text-transform: uppercase; }
        .ci-value { font-size: 9.5pt; font-weight: bold; margin-top: 3px; color: #1f2937; }

        /* Main Vehicle Table - RED THEME */
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          border-left: 3px solid #dc2626;
          border-right: 3px solid #dc2626;
          border-bottom: 3px solid #dc2626;
          font-size: 9pt;
        }
        .invoice-table th {
          background: linear-gradient(to bottom, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          padding: 6px 4px;
          text-align: center;
          font-weight: 700;
          font-size: 7.5pt;
          border: 1px solid #fca5a5;
        }
        .invoice-table td {
          border: 1px solid #fca5a5;
          padding: 6px 4px;
          text-align: center;
          vertical-align: middle;
          font-size: 8pt;
        }
        .invoice-table .service-details {
          text-align: left;
          padding-left: 8px;
          font-size: 7.5pt;
          line-height: 1.5;
        }
        .invoice-table .amount-cell {
          text-align: right;
          font-weight: 700;
          padding-right: 8px;
          color: #374151;
        }
        .invoice-table .total-row {
          background: #fef2f2;
          font-weight: bold;
          font-size: 9pt;
          border-top: 2px solid #dc2626;
        }
        .vehicle-name {
          font-weight: 700;
          color: #7f1d1d;
        }

        /* Extra Charges Table */
        .extra-charges-table {
          width: 100%;
          border-collapse: collapse;
          border-left: 3px solid #dc2626;
          border-right: 3px solid #dc2626;
          border-bottom: 3px solid #dc2626;
          margin-top: 0;
          font-size: 9pt;
        }
        .extra-charges-table th {
          background: linear-gradient(to bottom, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          padding: 6px 6px;
          text-align: center;
          font-weight: 700;
          font-size: 7.5pt;
          border: 1px solid #fca5a5;
        }
        .extra-charges-table td {
          border: 1px solid #fca5a5;
          padding: 6px;
          text-align: center;
          vertical-align: middle;
          font-size: 8pt;
        }
        .extra-charges-table .description-cell {
          text-align: left;
          padding-left: 12px;
        }
        .extra-charges-table .amount-cell {
          text-align: right;
          font-weight: 700;
          padding-right: 12px;
          color: #374151;
        }
        .extra-charges-table .extra-total-row {
          background: #fef2f2;
          font-weight: bold;
          font-size: 9pt;
          border-top: 2px solid #dc2626;
        }

        /* Amount in Words - RED THEME */
        .amount-words {
          padding: 10px 12px;
          font-size: 9pt;
          border-left: 3px solid #dc2626;
          border-right: 3px solid #dc2626;
          border-bottom: 3px solid #dc2626;
          background: #fef2f2;
        }
        .amount-words-label { font-weight: bold; color: #991b1b; }
        .amount-words-value { margin-left: 10px; text-transform: uppercase; font-weight: bold; color: #dc2626; }

        /* Summary Section */
        .totals-section {
          border-left: 3px solid #dc2626;
          border-right: 3px solid #dc2626;
          border-bottom: 3px solid #dc2626;
          display: flex;
          justify-content: flex-end;
        }
        .totals-box {
          background: #fef2f2;
          width: 50%;
          min-width: 300px;
        }
        .total-line {
          display: flex;
          justify-content: space-between;
          padding: 8px 15px;
          font-size: 9pt;
          border-bottom: 1px solid #fca5a5;
        }
        .total-line:last-child {
          border-bottom: none;
        }
        .total-line.final {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          font-weight: bold;
          font-size: 11pt;
          border-bottom: none;
        }
        .total-label {
          font-weight: 700;
          color: #7f1d1d;
        }
        .total-line.final .total-label {
          color: white;
        }

        /* Signature Section */
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          padding: 0 20px 12px 20px;
          border-left: 3px solid #dc2626;
          border-right: 3px solid #dc2626;
          border-bottom: 3px solid #dc2626;
        }
        .signature-box {
          width: 45%;
          text-align: center;
        }
        .signature-line {
          border-top: 2px solid #dc2626;
          height: 35px;
          margin-bottom: 6px;
        }
        .signature-label {
          font-weight: 700;
          font-size: 8pt;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #7f1d1d;
        }

        /* Footer */
        .footer {
          margin-top: 8px;
          text-align: center;
          font-size: 7pt;
          color: #991b1b;
          font-style: italic;
        }

        @media print {
          body { 
            margin: 0; 
            padding: 10px;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .invoice-container { 
            max-width: none;
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
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

        <!-- Traditional Border -->
        <div class="traditional-border"></div>

        <!-- Customer & Bill Info -->
        <div class="customer-info">
          <div class="ci-row">
            <div class="ci-cell">
              <div class="ci-label">ग्राहकाचे नाव / Customer Name</div>
              <div class="ci-value">${customer?.customerName || 'Customer'}</div>
            </div>
            <div class="ci-cell">
              <div class="ci-label">बिल क्रमांक / Bill Number</div>
              <div class="ci-value">${bill.billNo}</div>
            </div>
          </div>

          <div class="ci-row">
            <div class="ci-cell">
              <div class="ci-label">पत्ता / Address</div>
              <div class="ci-value">${customer?.customerAddress || customer?.address || '—'}</div>
            </div>
            <div class="ci-cell">
              <div class="ci-label">दिनांक / Date</div>
              <div class="ci-value">${formatDate(bill.date)}</div>
            </div>
          </div>

          <div class="ci-row">
            <div class="ci-cell">
              <div class="ci-label">फोन / Phone</div>
              <div class="ci-value">${customer?.customerMobile || 'N/A'}</div>
            </div>
            <div class="ci-cell">
              <div class="ci-label">GST No.</div>
              <div class="ci-value">${customer?.customerGST || '—'}</div>
            </div>
          </div>
        </div>

        <!-- Main Vehicle Table -->
        <table class="invoice-table">
          <thead>
            <tr>
              <th style="width: 4%;">अ.क्र.<br/>S.No</th>
              <th style="width: 12%;">वाहन क्रमांक<br/>Vehicle No</th>
              <th style="width: 10%;">प्रकार<br/>Type</th>
              <th style="width: 12%;">चालक<br/>Driver</th>
              <th style="width: 22%;">तपशील<br/>Service Details</th>
              <th style="width: 10%;">उत्पादन<br/>Product</th>
              <th style="width: 8%;">संख्या<br/>Qty</th>
              <th style="width: 10%;">दर<br/>Rate</th>
              <th style="width: 12%;">रक्कम<br/>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${bill.vehicles && bill.vehicles.length > 0 ?
              bill.vehicles.map((vehicle, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong class="vehicle-name">${vehicle.vehicleNumber}</strong></td>
                  <td class="vehicle-name">${vehicle.vehicleType || 'Truck'}</td>
                  <td>${vehicle.driverName}</td>
                  <td class="service-details">
                    ${vehicle.from ? `<strong>पासून / From:</strong> ${vehicle.from}<br>` : ''}
                    ${vehicle.to ? `<strong>पर्यंत / To:</strong> ${vehicle.to}<br>` : ''}
                    <strong>एकक / Unit:</strong> ${vehicle.unit || 'Trip'}
                    ${vehicle.comment ? `<br><em>टिप / Note: ${vehicle.comment}</em>` : ''}
                  </td>
                  <td>${vehicle.product || '—'}</td>
                  <td>${vehicle.quantity}</td>
                  <td class="amount-cell">₹${vehicle.rate.toLocaleString('en-IN')}</td>
                  <td class="amount-cell">₹${(vehicle.quantity * vehicle.rate).toLocaleString('en-IN')}</td>
                </tr>
              `).join('') :
              `<tr>
                <td>1</td>
                <td><strong class="vehicle-name">${bill.vehicleNumber || 'N/A'}</strong></td>
                <td class="vehicle-name">${bill.vehicleType || 'Truck'}</td>
                <td>${bill.driverName || 'N/A'}</td>
                <td class="service-details">
                  ${bill.from ? `<strong>पासून / From:</strong> ${bill.from}<br>` : ''}
                  ${bill.to ? `<strong>पर्यंत / To:</strong> ${bill.to}<br>` : ''}
                  <strong>एकक / Unit:</strong> ${bill.unit || 'Trip'}
                  ${bill.comment ? `<br><em>टिप / Note: ${bill.comment}</em>` : ''}
                </td>
                <td>${bill.product || '—'}</td>
                <td>${bill.quantity || 0}</td>
                <td class="amount-cell">₹${(bill.rate || 0).toLocaleString('en-IN')}</td>
                <td class="amount-cell">₹${((bill.quantity || 0) * (bill.rate || 0)).toLocaleString('en-IN')}</td>
              </tr>`
            }
            
            <!-- Subtotal Row -->
            <tr class="total-row">
              <td colspan="6" style="text-align: right; padding-right: 12px;"><strong>उप एकूण / SUBTOTAL</strong></td>
              <td><strong>${totalQuantity}</strong></td>
              <td></td>
              <td class="amount-cell"><strong>₹${bill.totalAmount.toLocaleString('en-IN')}</strong></td>
            </tr>
          </tbody>
        </table>

        <!-- Extra Charges Table (Only show if extra charges exist) -->
        ${bill.extraCharges && bill.extraCharges.length > 0 ? `
        <table class="extra-charges-table">
          <thead>
            <tr>
              <th style="width: 10%;">अ.क्र.<br/>S.No</th>
              <th style="width: 70%;">अतिरिक्त शुल्क तपशील<br/>Additional Charges Description</th>
              <th style="width: 20%;">रक्कम<br/>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${bill.extraCharges.map((charge, index) => `
            <tr>
              <td>${index + 1}</td>
              <td class="description-cell">${charge.description}</td>
              <td class="amount-cell">₹${charge.amount.toLocaleString('en-IN')}</td>
            </tr>
            `).join('')}
            
            <!-- Extra Charges Total Row -->
            <tr class="extra-total-row">
              <td colspan="2" style="text-align: right; padding-right: 12px;"><strong>अतिरिक्त शुल्क एकूण / ADDITIONAL CHARGES TOTAL</strong></td>
              <td class="amount-cell"><strong>₹${bill.totalExtraCharges.toLocaleString('en-IN')}</strong></td>
            </tr>
          </tbody>
        </table>
        ` : ''}

        <!-- Amount in Words -->
        <div class="amount-words">
          <span class="amount-words-label">निव्वळ देय रक्कम अक्षरशः / Net Amount in Words:</span>
          <span class="amount-words-value">${numberToWords(bill.netAmount)}</span>
        </div>

        <!-- Summary Section -->
        <div class="totals-section">
          <div class="totals-box">
            <div class="total-line">
              <span class="total-label">वाहन शुल्क / VEHICLE CHARGES</span>
              <span>₹${bill.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            ${bill.totalExtraCharges > 0 ? `
            <div class="total-line">
              <span class="total-label">अतिरिक्त शुल्क / ADDITIONAL CHARGES</span>
              <span>₹${bill.totalExtraCharges.toLocaleString('en-IN')}</span>
            </div>
            ` : ''}
            ${bill.cashDiscount > 0 ? `
            <div class="total-line">
              <span class="total-label">सवलत / DISCOUNT</span>
              <span>-₹${bill.cashDiscount.toLocaleString('en-IN')}</span>
            </div>
            ` : ''}
            <div class="total-line">
              <span class="total-label">कर / TAX</span>
              <span>0.00%</span>
            </div>
            <div class="total-line final">
              <span class="total-label">एकूण रक्कम / TOTAL AMOUNT</span>
              <span>₹${bill.netAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">अधिकृत स्वाक्षरी<br/>Authorized Signature</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">${user?.firmName || 'Company Name'}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          This is a computer generated invoice • धन्यवाद / Thank you for your business!
        </div>
      </div>
    </body>
    </html>
  `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Invoice Preview - {bill.billNo}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-800 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Invoice Preview - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-5xl mx-auto bg-white shadow-xl">
            {/* Header with Two Logos */}
            <div className="border-3 border-red-600 p-4 bg-gradient-to-b from-red-50 to-white">
              <div className="grid grid-cols-[80px_1fr_80px] gap-4 items-center">
                {/* Left Logo */}
                <div className="flex justify-start">
                  <img src={getLogoUrl('primary')} className="w-20 h-20 object-contain" alt="Logo" />
                </div>

                {/* Center Content */}
                <div className="text-center">
                  <div className="text-sm font-bold text-red-600 mb-1">॥ जय मातादी प्रसन्न ॥</div>
                  <div className="text-2xl font-bold text-red-800 mb-1 uppercase tracking-wide">
                    {user?.firmName || 'LAKSHMI SUPPLIERS'}
                  </div>
                  <div className="text-sm text-red-700 mb-1">{user?.address || 'भोलेगांव, अहिल्यानगर - 414111'}</div>
                  <div className="text-xs text-red-800">{user?.description || ''}</div>
                  <div className="text-sm text-red-700 mt-2">
                    <div><strong>प्रो.</strong> {user?.proprietor || user?.fullname || '—'} • <strong>मो.</strong> {user?.phoneNumbers?.primary || '—'}</div>
                    <div><strong>GSTIN:</strong> {user?.gstNo || user?.jstNo || '—'}</div>
                  </div>
                </div>

                {/* Right Logo */}
                <div className="flex justify-end">
                  <img src={getLogoUrl('secondary')} className="w-20 h-20 object-contain" alt="Logo" />
                </div>
              </div>
            </div>

            {/* Traditional Border */}
            <div className="h-3 bg-gradient-to-r from-red-600 via-red-400 to-red-600 border-l-3 border-r-3 border-red-600"></div>

            {/* Customer & Bill Info */}
            <div className="border-l-3 border-r-3 border-b-3 border-red-600">
              <div className="grid grid-cols-2 border-b border-red-200">
                <div className="p-3 border-r border-red-200">
                  <div className="text-xs text-red-800 font-semibold uppercase">ग्राहकाचे नाव / Customer Name</div>
                  <div className="text-sm font-bold mt-1">{customer.customerName || customer.name}</div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-red-800 font-semibold uppercase">बिल क्रमांक / Bill Number</div>
                  <div className="text-sm font-bold mt-1">{bill.billNo}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-red-200">
                <div className="p-3 border-r border-red-200">
                  <div className="text-xs text-red-800 font-semibold uppercase">पत्ता / Address</div>
                  <div className="text-sm font-bold mt-1">{customer.customerAddress || customer.address || '—'}</div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-red-800 font-semibold uppercase">दिनांक / Date</div>
                  <div className="text-sm font-bold mt-1">{formatDate(bill.date)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="p-3 border-r border-red-200">
                  <div className="text-xs text-red-800 font-semibold uppercase">फोन / Phone</div>
                  <div className="text-sm font-bold mt-1">{customer.customerMobile || 'N/A'}</div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-red-800 font-semibold uppercase">GST No.</div>
                  <div className="text-sm font-bold mt-1">{customer.customerGST || '—'}</div>
                </div>
              </div>
            </div>

            {/* Vehicle Details Table */}
            <div className="border-l-3 border-r-3 border-b-3 border-red-600">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-b from-red-100 to-red-200 border-b-2 border-red-600">
                    <th className="text-xs text-center py-2 px-1 text-red-900 border-l border-red-300 font-semibold">अ.क्र.<br/>S.No</th>
                    <th className="text-xs text-center py-2 px-1 text-red-900 border-l border-red-300 font-semibold">वाहन क्रमांक<br/>Vehicle No</th>
                    <th className="text-xs text-center py-2 px-1 text-red-900 border-l border-red-300 font-semibold">प्रकार<br/>Type</th>
                    <th className="text-xs text-center py-2 px-1 text-red-900 border-l border-red-300 font-semibold">चालक<br/>Driver</th>
                    <th className="text-xs text-center py-2 px-1 text-red-900 border-l border-red-300 font-semibold">तपशील<br/>Service Details</th>
                    <th className="text-xs text-center py-2 px-1 text-red-900 border-l border-red-300 font-semibold">उत्पादन<br/>Product</th>
                    <th className="text-xs text-center py-2 px-1 text-red-900 border-l border-red-300 font-semibold">संख्या<br/>Qty</th>
                    <th className="text-xs text-center py-2 px-1 text-red-900 border-l border-red-300 font-semibold">दर<br/>Rate</th>
                    <th className="text-xs text-center py-2 px-1 text-red-900 border-l border-red-300 font-semibold">रक्कम<br/>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.vehicles && bill.vehicles.length > 0 ? (
                    bill.vehicles.map((vehicle, index) => (
                      <tr key={index} className="border-b border-red-200 hover:bg-red-50">
                        <td className="border-l border-red-200 p-2 text-xs text-center">{index + 1}</td>
                        <td className="border-l border-red-200 p-2 text-xs font-semibold text-red-900">{vehicle.vehicleNumber}</td>
                        <td className="border-l border-red-200 p-2 text-xs text-red-900">{vehicle.vehicleType}</td>
                        <td className="border-l border-red-200 p-2 text-xs">{vehicle.driverName}</td>
                        <td className="border-l border-red-200 p-2 text-xs text-left">
                          {vehicle.from && <div><strong>From:</strong> {vehicle.from}</div>}
                          {vehicle.to && <div><strong>To:</strong> {vehicle.to}</div>}
                          <div><strong>Unit:</strong> {vehicle.unit}</div>
                          {vehicle.comment && <div className="italic text-gray-600">Note: {vehicle.comment}</div>}
                        </td>
                        <td className="border-l border-red-200 p-2 text-xs text-center">{vehicle.product || '—'}</td>
                        <td className="border-l border-red-200 p-2 text-xs text-center">{vehicle.quantity}</td>
                        <td className="border-l border-red-200 p-2 text-xs text-right font-semibold">₹{vehicle.rate.toLocaleString('en-IN')}</td>
                        <td className="border-l border-red-200 p-2 text-xs text-right font-semibold">₹{vehicle.totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-red-200">
                      <td className="border-l border-red-200 p-2 text-xs text-center">1</td>
                      <td className="border-l border-red-200 p-2 text-xs font-semibold text-red-900">{bill.vehicleNumber}</td>
                      <td className="border-l border-red-200 p-2 text-xs text-red-900">{bill.vehicleType}</td>
                      <td className="border-l border-red-200 p-2 text-xs">{bill.driverName}</td>
                      <td className="border-l border-red-200 p-2 text-xs text-left">
                        {bill.from && <div><strong>From:</strong> {bill.from}</div>}
                        {bill.to && <div><strong>To:</strong> {bill.to}</div>}
                        <div><strong>Unit:</strong> {bill.unit}</div>
                        {bill.comment && <div className="italic text-gray-600">Note: {bill.comment}</div>}
                      </td>
                      <td className="border-l border-red-200 p-2 text-xs text-center">{bill.product || '—'}</td>
                      <td className="border-l border-red-200 p-2 text-xs text-center">{bill.quantity}</td>
                      <td className="border-l border-red-200 p-2 text-xs text-right font-semibold">₹{(bill.rate || 0).toLocaleString('en-IN')}</td>
                      <td className="border-l border-red-200 p-2 text-xs text-right font-semibold">₹{((bill.quantity || 0) * (bill.rate || 0)).toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  
                  {/* Subtotal Row */}
                  <tr className="bg-red-50 border-t-2 border-red-600">
                    <td colSpan="6" className="p-2 text-xs text-right font-bold border-l border-red-200">उप एकूण / SUBTOTAL</td>
                    <td className="p-2 text-xs text-center font-bold border-l border-red-200">{totalQuantity}</td>
                    <td className="border-l border-red-200"></td>
                    <td className="p-2 text-xs text-right font-bold border-l border-red-200">₹{bill.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Extra Charges */}
            {bill.extraCharges && bill.extraCharges.length > 0 && (
              <div className="border-l-3 border-r-3 border-b-3 border-red-600">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-b from-red-100 to-red-200 border-b border-red-300">
                      <th className="text-xs text-center py-2 px-2 text-red-900 border-l border-red-300 font-semibold">अ.क्र.<br/>S.No</th>
                      <th className="text-xs text-center py-2 px-2 text-red-900 border-l border-red-300 font-semibold">अतिरिक्त शुल्क तपशील<br/>Additional Charges</th>
                      <th className="text-xs text-center py-2 px-2 text-red-900 border-l border-red-300 font-semibold">रक्कम<br/>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.extraCharges.map((charge, index) => (
                      <tr key={index} className="border-b border-red-200 hover:bg-red-50">
                        <td className="border-l border-red-200 p-2 text-xs text-center">{index + 1}</td>
                        <td className="border-l border-red-200 p-2 text-xs text-left">{charge.description}</td>
                        <td className="border-l border-red-200 p-2 text-xs text-right font-semibold">₹{charge.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    <tr className="bg-red-50 border-t-2 border-red-600">
                      <td colSpan="2" className="p-2 text-xs text-right font-bold border-l border-red-200">अतिरिक्त शुल्क एकूण / ADDITIONAL TOTAL</td>
                      <td className="p-2 text-xs text-right font-bold border-l border-red-200">₹{bill.totalExtraCharges.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Amount in Words */}
            <div className="border-l-3 border-r-3 border-b-3 border-red-600 p-3 bg-red-50">
              <span className="text-xs font-bold text-red-800">निव्वळ देय रक्कम अक्षरशः / Net Amount in Words: </span>
              <span className="text-xs font-bold text-red-600">{numberToWords(bill.netAmount)}</span>
            </div>

            {/* Summary Section */}
            <div className="border-l-3 border-r-3 border-b-3 border-red-600 flex justify-end">
              <div className="bg-red-50 w-1/2 min-w-[300px]">
                <div className="flex justify-between p-2 border-b border-red-200 text-xs">
                  <span className="font-semibold text-red-900">वाहन शुल्क / VEHICLE CHARGES</span>
                  <span className="font-bold">₹{bill.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                {bill.totalExtraCharges > 0 && (
                  <div className="flex justify-between p-2 border-b border-red-200 text-xs">
                    <span className="font-semibold text-red-900">अतिरिक्त शुल्क / ADDITIONAL CHARGES</span>
                    <span className="font-bold">₹{bill.totalExtraCharges.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {bill.cashDiscount > 0 && (
                  <div className="flex justify-between p-2 border-b border-red-200 text-xs text-green-700">
                    <span className="font-semibold">सवलत / DISCOUNT</span>
                    <span className="font-bold">-₹{bill.cashDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between p-2 border-b border-red-200 text-xs">
                  <span className="font-semibold text-red-900">कर / TAX</span>
                  <span className="font-bold">0.00%</span>
                </div>
                <div className="flex justify-between p-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm">
                  <span className="font-bold">एकूण रक्कम / TOTAL AMOUNT</span>
                  <span className="font-bold">₹{bill.netAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="border-l-3 border-r-3 border-b-3 border-red-600 p-6">
              <div className="flex justify-between mt-4">
                <div className="text-center">
                  <div className="border-t-2 border-red-600 pt-2 min-w-[180px] mb-2"></div>
                  <div className="text-xs font-semibold text-red-900 uppercase">अधिकृत स्वाक्षरी<br/>Authorized Signature</div>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-red-600 pt-2 min-w-[180px] mb-2"></div>
                  <div className="text-xs font-semibold text-red-900">{user?.firmName || 'Company Name'}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center p-2 text-xs text-red-700 italic">
              This is a computer generated invoice • धन्यवाद / Thank you for your business!
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex gap-4 flex-shrink-0">
          <button
            onClick={printBill}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <Printer className="w-5 h-5" />
            Print Invoice
          </button>
          <button
            onClick={onClose}
            className="px-8 py-3 border-2 border-red-600 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;