import React from 'react';
import { useSelector } from 'react-redux';
import { Printer, X, Phone, MapPin, FileText } from 'lucide-react';

const InvoicePrint = ({ bill, customer, onClose }) => {
  const { user } = useSelector((state) => state.auth);

  const totalQuantity = bill.vehicles ? bill.vehicles.reduce((sum, v) => sum + v.quantity, 0) : bill.quantity || 0;

  const printBill = () => {
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${bill.billNo}</title>
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
        .invoice-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          border: 3px solid #dc2626;
          padding: 0;
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
        .invoice-number {
          position: absolute;
          top: 5px;
          right: 2px;
          text-align: right;
          background: rgba(255,255,255,0.1);
          padding: 10px;
          border-radius: 8px;
          Height: 50px;
          width: 140px;
        }
        .invoice-number .label {
          font-size: 12px;
          opacity: 0.9;
        }
        .invoice-number .number {
          font-size: 12px;
          font-weight: bold;
          margin-top: 5px;
        }
        .full-name {
          position: absolute;
          top: 5px;
          left: 2px;
          text-align: left;
          background: rgba(255,255,255,0.1);
          padding: 10px;
          border-radius: 8px;
          Height: 50px;
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
         .primary-number {
          position: absolute;
          top: 55px;
          left: 2px;
          text-align: left;
          background: rgba(255,255,255,0.1);
          padding: 10px;
          border-radius: 8px;
          Height: 50px;
          width: 140px;
        }
        .primary-number .label {
          font-size: 12px;
          opacity: 0.9;
        }
        .primary-number .number {
          font-size: 12px;
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

        /* Invoice Info */
        .invoice-info {
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
          width: 90px;
          flex-shrink: 0;
          color: #7f1d1d;
        }
        .info-value {
          flex: 1;
          color: #374151;
        }

        /* Main Table */
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          border: 3px solid #dc2626;
          margin: 0;
          font-size: 13px;
        }
        .invoice-table th {
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
        .invoice-table td {
          border: 1px solid #dc2626;
          padding: 12px 8px;
          text-align: center;
          vertical-align: middle;
          font-size: 12px;
        }
        .invoice-table .service-details {
          text-align: left;
          padding-left: 12px;
          font-size: 11px;
          line-height: 1.5;
        }
        .invoice-table .amount-cell {
          text-align: right;
          font-weight: 700;
          padding-right: 12px;
          color: #7f1d1d;
        }
        .invoice-table .total-row {
          background: #fef2f2;
          font-weight: bold;
          font-size: 13px;
          border-top: 3px solid #dc2626;
        }
        .vehicle-name {
          font-weight: 700;
          color: #7f1d1d;
        }

        /* Extra Charges Table */
        .extra-charges-table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid #dc2626;
          margin-top: 0;
          font-size: 13px;
        }
        .extra-charges-table th {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          padding: 12px 8px;
          text-align: center;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid #7f1d1d;
        }
        .extra-charges-table td {
          border: 1px solid #dc2626;
          padding: 10px 8px;
          text-align: center;
          vertical-align: middle;
          font-size: 12px;
        }
        .extra-charges-table .description-cell {
          text-align: left;
          padding-left: 12px;
          text-transform: capitalize;
        }
        .extra-charges-table .amount-cell {
          text-align: right;
          font-weight: 700;
          padding-right: 12px;
          color: #7f1d1d;
        }
        .extra-charges-table .extra-total-row {
          background: #fef2f2;
          font-weight: bold;
          font-size: 13px;
          border-top: 2px solid #dc2626;
        }

        /* Bottom Section */
        .bottom-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 0;
          border: 2px solid #dc2626;
          border-top: none;
        }

        /* Terms Section */
        .terms-section {
          padding: 25px;
          border-right: 2px solid #dc2626;
        }
        .terms-section h4 {
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          color: #7f1d1d;
          letter-spacing: 1px;
        }
        .terms-section p {
          font-size: 12px;
          line-height: 1.6;
          color: #374151;
        }

        /* Summary Section */
        .totals-box {
          background: #fef2f2;
        }
        .total-line {
          display: flex;
          justify-content: space-between;
          padding: 12px 20px;
          font-size: 14px;
          border-bottom: 1px solid #dc2626;
        }
        .total-line:last-child {
          border-bottom: none;
        }
        .total-line.final {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          font-weight: bold;
          font-size: 16px;
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
          margin-top: 40px;
          padding: 0 25px;
          border: 2px solid #dc2626;
          border-top: none;
          padding-bottom: 25px;
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
          .invoice-container { 
            max-width: none;
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Decorative corners -->
        <div class="corner-decoration corner-top-left"></div>
        <div class="corner-decoration corner-top-right"></div>
        <div class="corner-decoration corner-bottom-left"></div>
        <div class="corner-decoration corner-bottom-right"></div>

        <!-- Header -->
        <div class="header">
          <div class="full-name">
            <div class="name">${user?.fullname}</div>
            <div class="name">${user?.phoneNumbers?.primary || 'N/A'}</div>
          </div>
            
          <div class="invoice-number">
            <div class="label">INVOICE #</div>
            <div class="number">${bill.billNo}</div>
          </div>
          <h1>${user?.firmName}</h1>
          <div class="firm-name">${user?.discription || 'TRANSPORT COMPANY'}</div>
        </div>

        <!-- Traditional Border -->
        <div class="traditional-border"></div>

        <!-- Contact Bar -->
        <div class="contact-bar">
           ${user?.phoneNumbers?.secondary1 ? `
           <div class="contact-item">
            <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span>${user?.phoneNumbers?.secondary1 || 'N/A'}</span>
          </div>
           `: ''}
           ${user?.phoneNumbers?.secondary2 ? `
           <div class="contact-item">
            <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span>${user?.phoneNumbers?.secondary2 || 'N/A'}</span>
          </div>
           `: ''}
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

        <!-- Invoice Info -->
        <div class="invoice-info">
          <div class="info-section">
            <h3>Billing Details</h3>
            <div class="info-line">
              <span class="info-label">Date:</span>
              <span class="info-value">${new Date(bill.date).toLocaleDateString('en-GB')}</span>
            </div>
            <div class="info-line">
              <span class="info-label">GST No:</span>
              <span class="info-value">${user?.jstNo || 'N/A'}</span>
            </div>
            <div class="info-line">
              <span class="info-label">Address:</span>
              <span class="info-value">${user?.address || 'Company Address'}</span>
            </div>
          </div>
          <div class="info-section">
            <h3>Customer Details</h3>
            <div class="info-line">
              <span class="info-label">Customer:</span>
              <span class="info-value">${customer?.customerName || 'Customer'}</span>
            </div>
            <div class="info-line">
              <span class="info-label">Phone:</span>
              <span class="info-value">${customer?.customerMobile || 'N/A'}</span>
            </div>
            <div class="info-line">
              <span class="info-label">Address:</span>
              <span class="info-value">${customer?.customerAddress || customer?.address || 'Customer Address'}</span>
            </div>
          </div>
        </div>

        <!-- Main Table -->
        <table class="invoice-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Vehicle No</th>
              <th>Type</th>
              <th>Driver</th>
              <th>Service Details</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
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
                    ${vehicle.from ? `<strong>From:</strong> ${vehicle.from}<br>` : ''}
                    ${vehicle.to ? `<strong>To:</strong> ${vehicle.to}<br>` : ''}
                    <strong>Unit:</strong> ${vehicle.unit || 'Trip'}
                    ${vehicle.comment ? `<br><em>Note: ${vehicle.comment}</em>` : ''}
                  </td>

                   <td>${vehicle.product}</td>
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
                  ${bill.from ? `<strong>From:</strong> ${bill.from}<br>` : ''}
                  ${bill.to ? `<strong>To:</strong> ${bill.to}<br>` : ''}
                  <strong>Unit:</strong> ${bill.unit || 'Trip'}
                  ${bill.comment ? `<br><em>Note: ${bill.comment}</em>` : ''}
                </td>
                <td>${bill.product || 0}</td>
                <td>${bill.quantity || 0}</td>
                <td class="amount-cell">₹${(bill.rate || 0).toLocaleString('en-IN')}</td>
                <td class="amount-cell">₹${((bill.quantity || 0) * (bill.rate || 0)).toLocaleString('en-IN')}</td>
              </tr>`
      }
            
            <!-- Subtotal Row -->
            <tr class="total-row">
              <td colspan="5" style="text-align: right; padding-right: 12px;"><strong>SUBTOTAL</strong></td>
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
              <th style="width: 10%;">S.No</th>
              <th style="width: 70%;">Additional Charges Description</th>
              <th style="width: 20%;">Amount</th>
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
              <td colspan="2" style="text-align: right; padding-right: 12px;"><strong>ADDITIONAL CHARGES TOTAL</strong></td>
              <td class="amount-cell"><strong>₹${bill.totalExtraCharges.toLocaleString('en-IN')}</strong></td>
            </tr>
          </tbody>
        </table>
        ` : ''}

        <!-- Bottom Section -->
        <div class="bottom-section">
          <!-- Terms Section -->
          <div class="terms-section">
            <h4>Terms & Conditions:</h4>
            <p>In case of any damage to pipelines, cables, or other infrastructure during the work, the JCB and earthmovers will not be held responsible. Payment terms are net 30 days from invoice date.</p>
          </div>

          <!-- Summary Section -->
          <div class="totals-box">
            <div class="total-line">
              <span class="total-label">VEHICLE CHARGES</span>
              <span>₹${bill.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            ${bill.totalExtraCharges > 0 ? `
            <div class="total-line">
              <span class="total-label">ADDITIONAL CHARGES</span>
              <span>₹${bill.totalExtraCharges.toLocaleString('en-IN')}</span>
            </div>
            ` : ''}
            ${bill.cashDiscount > 0 ? `
            <div class="total-line">
              <span class="total-label">DISCOUNT</span>
              <span>-₹${bill.cashDiscount.toLocaleString('en-IN')}</span>
            </div>
            ` : ''}
            <div class="total-line">
              <span class="total-label">TAX</span>
              <span>0.00%</span>
            </div>
            <div class="total-line final">
              <span class="total-label">TOTAL AMOUNT</span>
              <span>₹${bill.netAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Authorized Signature</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">${user?.firmName || 'Company Name'}</div>
          </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-600" />
            Traditional Invoice Preview
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Invoice Preview */}
        <div className="p-6">
          <div className="bg-gray-50 p-6 rounded-lg mb-6 max-h-[70vh] overflow-y-auto">
            <div className="max-w-6xl mx-auto bg-white border-4 border-red-600 relative">
              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-red-600"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-red-600"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-red-600"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-red-600"></div>

              {/* Header */}
              <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6 relative text-center">
                <div className="absolute top-6 right-6 text-right bg-white bg-opacity-10 p-3 rounded">
                  <div className="text-xs opacity-90">INVOICE #</div>
                  <div className="text-lg font-bold">{bill.billNo}</div>
                </div>
                <h1 className="text-4xl font-bold tracking-widest mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  INVOICE
                </h1>
                <div className="text-lg font-semibold tracking-wider">{user?.firmName || 'TRANSPORT COMPANY'}</div>
              </div>

              {/* Traditional Border */}
              <div className="h-4 bg-gradient-to-r from-red-600 via-red-400 to-red-600"></div>

              {/* Contact Bar */}
              <div className="bg-red-50 border-y-2 border-red-600 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-red-800 font-semibold">
                  <Phone className="w-4 h-4 text-red-600" />
                  <span>{user?.phoneNumbers?.primary || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-red-800 font-semibold">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>{user?.address || 'Company Address'}</span>
                </div>
                <div className="flex items-center gap-2 text-red-800 font-semibold">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>GST: {user?.jstNo || 'N/A'}</span>
                </div>
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-2 border-b-2 border-red-600">
                <div className="p-6 border-r-2 border-red-600">
                  <h3 className="text-lg font-bold text-red-800 mb-3 border-b border-red-300 pb-2">BILL TO:</h3>
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">{customer.customerName || 'Customer Name'}</div>
                    <div className="text-gray-700">{customer.customerAddress || 'Customer Address'}</div>
                    <div className="text-gray-700">Phone: {customer.customerPhone || 'N/A'}</div>
                    <div className="text-gray-700">GST: {customer.customerGST || 'N/A'}</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-red-800 mb-3 border-b border-red-300 pb-2">INVOICE DETAILS:</h3>
                  <div className="space-y-2">
                    <div><span className="font-semibold">Date:</span> {new Date(bill.date).toLocaleDateString('en-IN')}</div>
                    <div><span className="font-semibold">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-sm font-semibold ${bill.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {bill.status}
                      </span>
                    </div>
                    <div><span className="font-semibold">Due Amount:</span> ₹{bill.pendingAmount.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>

              {/* Vehicle Details Table */}
              <div className="border-b-2 border-red-600">
                <div className="bg-red-600 text-white p-3">
                  <h3 className="text-lg font-bold text-center">VEHICLE SERVICES</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-red-50">
                      <tr className="border-b-2 border-red-600">
                        <th className="border-r border-red-300 p-3 text-left font-bold text-red-800">Vehicle No.</th>
                        <th className="border-r border-red-300 p-3 text-left font-bold text-red-800">Type</th>
                        <th className="border-r border-red-300 p-3 text-left font-bold text-red-800">Driver</th>
                        <th className="border-r border-red-300 p-3 text-left font-bold text-red-800">From - To</th>
                        <th className="border-r border-red-300 p-3 text-left font-bold text-red-800">Product</th>
                        <th className="border-r border-red-300 p-3 text-center font-bold text-red-800">Qty</th>
                        <th className="border-r border-red-300 p-3 text-center font-bold text-red-800">Unit</th>
                        <th className="border-r border-red-300 p-3 text-right font-bold text-red-800">Rate</th>
                        <th className="p-3 text-right font-bold text-red-800">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bill.vehicles.map((vehicle, index) => (
                        <tr key={index} className="border-b border-red-200 hover:bg-red-50">
                          <td className="border-r border-red-200 p-3 font-semibold">{vehicle.vehicleNumber}</td>
                          <td className="border-r border-red-200 p-3">{vehicle.vehicleType}</td>
                          <td className="border-r border-red-200 p-3">{vehicle.driverName}</td>
                          <td className="border-r border-red-200 p-3">
                            {vehicle.from && vehicle.to ? `${vehicle.from} - ${vehicle.to}` : '-'}
                          </td>
                          <td className="border-r border-red-200 p-3 text-center">{vehicle.product}</td>
                          <td className="border-r border-red-200 p-3 text-center">{vehicle.quantity}</td>
                          <td className="border-r border-red-200 p-3 text-center">{vehicle.unit}</td>
                          <td className="border-r border-red-200 p-3 text-right">₹{vehicle.rate.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right font-semibold">₹{vehicle.totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Extra Charges */}
              {bill.extraCharges && bill.extraCharges.length > 0 && (
                <div className="border-b-2 border-red-600">
                  <div className="bg-red-600 text-white p-3">
                    <h3 className="text-lg font-bold text-center">ADDITIONAL CHARGES</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-red-50">
                        <tr className="border-b border-red-300">
                          <th className="border-r border-red-300 p-3 text-left font-bold text-red-800">Description</th>
                          <th className="p-3 text-right font-bold text-red-800">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bill.extraCharges.map((charge, index) => (
                          <tr key={index} className="border-b border-red-200 hover:bg-red-50">
                            <td className="border-r border-red-200 p-3">{charge.description}</td>
                            <td className="p-3 text-right font-semibold">₹{charge.amount.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals Section */}
              <div className="bg-red-50 border-t-4 border-red-600">
                <div className="flex justify-end">
                  <div className="w-80 p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-red-200">
                        <span className="font-semibold text-red-800">Vehicle Services Total:</span>
                        <span className="font-bold">₹{bill.totalAmount.toLocaleString('en-IN')}</span>
                      </div>

                      {bill.totalExtraCharges > 0 && (
                        <div className="flex justify-between py-2 border-b border-red-200">
                          <span className="font-semibold text-red-800">Additional Charges:</span>
                          <span className="font-bold">₹{bill.totalExtraCharges.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {bill.cashDiscount > 0 && (
                        <div className="flex justify-between py-2 border-b border-red-200 text-green-700">
                          <span className="font-semibold">Cash Discount:</span>
                          <span className="font-bold">-₹{bill.cashDiscount.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      <div className="flex justify-between py-3 border-t-2 border-red-600 bg-red-600 text-white px-4 -mx-4">
                        <span className="text-lg font-bold">NET AMOUNT:</span>
                        <span className="text-xl font-bold">₹{bill.netAmount.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex justify-between py-2 bg-yellow-100 px-4 -mx-4 rounded">
                        <span className="font-semibold text-yellow-800">PENDING AMOUNT:</span>
                        <span className="font-bold text-yellow-800">₹{bill.pendingAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments */}
              {bill.comment && (
                <div className="border-t-2 border-red-600 p-6 bg-gray-50">
                  <h4 className="font-bold text-red-800 mb-2">Comments:</h4>
                  <p className="text-gray-700 italic">{bill.comment}</p>
                </div>
              )}

              {/* Footer */}
              <div className="bg-red-600 text-white p-6 text-center">
                <div className="text-sm opacity-90 mb-2">Thank you for your business!</div>
                <div className="text-xs opacity-75">
                  For any queries, please contact us at {user?.phoneNumbers?.primary || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={printBill}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-8 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold flex items-center justify-center gap-3 shadow-lg transform hover:scale-105"
            >
              <Printer className="w-5 h-5" />
              Print Traditional Invoice
            </button>
            <button
              onClick={onClose}
              className="px-8 py-4 border-2 border-red-600 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>


















  );
};

export default InvoicePrint;
