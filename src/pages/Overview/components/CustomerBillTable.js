// src/pages/billing/components/CustomerBillTable.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const CustomerBillTable = ({ customers, dateRange, activeTab = 'all' }) => {
  const [expandedCustomers, setExpandedCustomers] = useState(new Set());
  const [selectedBills, setSelectedBills] = useState(new Set());
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [challanNumber, setChallanNumber] = useState('');
  const { user } = useSelector((state) => state.auth);

  const toggleCustomer = (customerId) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  const toggleBillSelection = (billId, customerId) => {
    const newSelected = new Set();
    const key = `${customerId}-${billId}`;
    if (selectedCustomerId && selectedCustomerId !== customerId) {
      newSelected.add(key);
      setSelectedCustomerId(customerId);
    } else {
      selectedBills.forEach(selectedKey => { newSelected.add(selectedKey); });
      if (newSelected.has(key)) {
        newSelected.delete(key);
      } else {
        newSelected.add(key);
      }
      if (newSelected.size === 0) {
        setSelectedCustomerId(null);
      } else {
        setSelectedCustomerId(customerId);
      }
    }
    setSelectedBills(newSelected);
  };

  const toggleAllBillsForCustomer = (customer, bills) => {
    const customerId = customer._id || customer.id;
    const newSelected = new Set();
    if (selectedCustomerId && selectedCustomerId !== customerId) {
      bills.forEach(bill => { newSelected.add(`${customerId}-${bill.billNo}`); });
      setSelectedCustomerId(customerId);
    } else {
      const allSelected = bills.every(bill => selectedBills.has(`${customerId}-${bill.billNo}`));
      if (allSelected) {
        setSelectedCustomerId(null);
      } else {
        bills.forEach(bill => { newSelected.add(`${customerId}-${bill.billNo}`); });
        setSelectedCustomerId(customerId);
      }
    }
    setSelectedBills(newSelected);
  };

  const clearAllSelections = () => {
    setSelectedBills(new Set());
    setSelectedCustomerId(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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

  const generateBillDetails = (bill) => {
    let details = [];
    if (bill.vehicles && bill.vehicles.length > 0) {
      bill.vehicles.forEach((vehicle, index) => {
        const vehicleInfo = [];
        if (vehicle.vehicleNumber) vehicleInfo.push(`${vehicle.vehicleNumber}`);
        if (vehicle.vehicleType) vehicleInfo.push(`${vehicle.vehicleType}`);
        if (vehicle.product) vehicleInfo.push(`${vehicle.product}`);
        details.push(`
          <div style="margin-bottom: 2px; padding-bottom: 2px; ${index < bill.vehicles.length - 1 ? 'border-bottom: 1px solid #fca5a5;' : ''}">
            <div style="font-size: 7pt; line-height: 1.3;">${vehicleInfo.join(' - ')}</div>
          </div>
        `);
      });
    } else {
      const vehicleInfo = [];
      if (bill.vehicleNumber) vehicleInfo.push(`${bill.vehicleNumber}`);
      if (bill.vehicleType) vehicleInfo.push(`${bill.vehicleType}`);
      if (bill.product) vehicleInfo.push(`${bill.product}`);
      if (vehicleInfo.length > 0) {
        details.push(`<div style="font-size: 7pt; line-height: 1.3;">${vehicleInfo.join(' - ')}</div>`);
      }
    }
    if (bill.extraCharges && bill.extraCharges.length > 0) {
      details.push(`
        <div style="margin-top: 2px; padding-top: 2px; border-top: 1px solid #dc2626;">
          <div style="font-weight: 700; color: #dc2626; margin-bottom: 1px; font-size: 6.5pt;">अतिरिक्त शुल्क:</div>
          ${bill.extraCharges.map(charge => `
            <div style="display: flex; justify-content: space-between; font-size: 6.5pt; margin-bottom: 1px;">
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
      const totalAmount = bill.vehicles.reduce((sum, vehicle) => sum + ((vehicle.quantity || 0) * (vehicle.rate || 0)), 0);
      const totalQuantity = bill.vehicles.reduce((sum, vehicle) => sum + (vehicle.quantity || 0), 0);
      return totalQuantity > 0 ? totalAmount / totalQuantity : 0;
    }
    return bill.rate || 0;
  };

  const getSelectedBillsForCustomer = (customer) => {
    const customerId = customer._id || customer.id;
    const bills = getBillsToDisplay(customer);
    return bills.filter(bill => selectedBills.has(`${customerId}-${bill.billNo}`));
  };

  // ─── NEW: open the challan-number popup instead of printing straight away ──
  const handlePrintButtonClick = () => {
    if (selectedBills.size === 0) { alert('Please select at least one bill to print'); return; }
    setChallanNumber('');
    setShowChallanModal(true);
  };

  const handleChallanSkip = () => {
    setShowChallanModal(false);
    generateSelectedBillsPDF('');
  };

  const handleChallanConfirm = () => {
    setShowChallanModal(false);
    generateSelectedBillsPDF(challanNumber.trim());
  };
  // ────────────────────────────────────────────────────────────────────────────

  const generateSelectedBillsPDF = (challanNo = '') => {
    if (selectedBills.size === 0) { alert('Please select at least one bill to print'); return; }
    const customerBills = customers.map(customer => ({
      customer,
      bills: getSelectedBillsForCustomer(customer)
    })).filter(item => item.bills.length > 0);
    if (customerBills.length === 0) { alert('No bills selected'); return; }
    customerBills.forEach(({ customer, bills }) => {
      const htmlContent = generateCustomerPDFContent(customer, bills, challanNo);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const customerName = (customer.customerName || customer.name || 'Unknown_Customer').replace(/[^a-zA-Z0-9]/g, '_');
      const firmName = (user?.firmName || 'Report').replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${firmName}_SelectedBills_${customerName}_${new Date().toISOString().split('T')[0]}`;
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        newWindow.document.title = fileName;
        newWindow.onload = () => { setTimeout(() => { newWindow.print(); URL.revokeObjectURL(url); }, 500); };
      }
    });
  };

  const getLogoUrl = (logoType = 'primary') => {
    const base = window.location.origin;
    return logoType === 'secondary' ? `${base}/logo1.png` : `${base}/logo2.png`;
  };

  // ─── UPDATED: compact PDF layout ───────────────────────────────────────────
  const generateCustomerPDFContent = (customer, selectedBillsList, challanNo = '') => {
    const customerName = customer.customerName || customer.name || 'Unknown Customer';
    const reportDate = formatDate(new Date());

    const totalBillAmount = selectedBillsList.reduce((sum, bill) => sum + (bill.netAmount || bill.totalAmount || bill.amount || 0), 0);
    const paidAmount = selectedBillsList.reduce((sum, bill) => {
      const netAmount = bill.netAmount || bill.totalAmount || bill.amount || 0;
      const pending = bill.pendingAmount || 0;
      return sum + (netAmount - pending);
    }, 0);
    const baseNetPayable = selectedBillsList.reduce((sum, bill) => sum + (bill.pendingAmount || 0), 0);

    const cgstAmount = gstEnabled ? baseNetPayable * 0.09 : 0;
    const sgstAmount = gstEnabled ? baseNetPayable * 0.09 : 0;
    const netPayable = baseNetPayable + cgstAmount + sgstAmount;

    const minRows = 10;
    const emptyRowsNeeded = Math.max(0, minRows - selectedBillsList.length);

    const gstSummaryRows = gstEnabled ? `
      <div class="summary-row">
        <div class="summary-label">बाकी रक्कम (Base Pending Amount)</div>
        <div class="summary-value">${formatCurrency(baseNetPayable)}</div>
      </div>
      <div class="summary-row gst-row">
        <div class="summary-label">CGST @ 9%</div>
        <div class="summary-value" style="color: #7c3aed;">${formatCurrency(cgstAmount)}</div>
      </div>
      <div class="summary-row gst-row">
        <div class="summary-label">SGST @ 9%</div>
        <div class="summary-value" style="color: #7c3aed;">${formatCurrency(sgstAmount)}</div>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bill - ${customerName}</title>
        <style>
          @page { size: A4; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: 'Noto Sans Devanagari', 'Arial Unicode MS', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.3;
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
            padding: 10mm;
            background: #fff;
            display: flex;
            flex-direction: column;
          }

          /* ── Header ── */
          .header {
            border: 3px solid #dc2626;
            padding: 6px 8px;
            flex-shrink: 0;
            background: linear-gradient(to bottom, #fef2f2 0%, #ffffff 100%);
          }
          .header-grid {
            display: grid;
            grid-template-columns: 80px 1fr 80px;
            align-items: center;
            column-gap: 12px;
          }
          .logo { width: 140px; height: auto; object-fit: contain; }
          .header-left { display: flex; justify-content: flex-start; }
          .header-right-logo { display: flex; justify-content: flex-end; }
          .header-center { text-align: center; padding: 0 8px; }
          .marathi-title { font-size: 9pt; font-weight: bold; margin-bottom: 2px; color: #dc2626; }
          .firm-name { font-size: 14pt; font-weight: bold; letter-spacing: 0.6px; margin-bottom: 2px; color: #b91c1c; text-transform: uppercase; }
          .firm-address { font-size: 8pt; margin-bottom: 1px; color: #991b1b; }
          .firm-services { font-size: 7pt; line-height: 1.3; color: #7f1d1d; }
          .firm-contact-info { font-size: 8pt; line-height: 1.4; margin-top: 3px; color: #991b1b; }
          .firm-contact-info strong { color: #dc2626; }

          /* ── Customer Info ── */
          .customer-info {
            border-left: 3px solid #dc2626;
            border-right: 3px solid #dc2626;
            border-bottom: 3px solid #dc2626;
            font-size: 8pt;
            flex-shrink: 0;
            background: #fefefe;
          }
          .ci-row { display: grid; grid-template-columns: 1.2fr 1.2fr 0.8fr; }
          .ci-cell {
            border-right: 1px solid #fca5a5;
            border-bottom: 1px solid #fca5a5;
            padding: 3px 7px;        /* ↓ was 5px 8px */
            min-height: 26px;        /* ↓ was 38px */
          }
          .ci-row:last-child .ci-cell { border-bottom: none; }
          .ci-cell:last-child { border-right: none; }
          .ci-label { font-size: 6.5pt; color: #991b1b; font-weight: 600; }   /* ↓ was 7.5pt */
          .ci-value { font-size: 8.5pt; font-weight: bold; margin-top: 1px; color: #1f2937; } /* ↓ was 9.5pt, 3px */

          /* ── Items Table ── */
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
            font-size: 8pt;          /* ↓ was 9.5pt */
            height: 100%;
          }
          .items-table thead th {
            background: linear-gradient(to bottom, #fee2e2 0%, #fecaca 100%);
            font-weight: bold;
            text-align: center;
            padding: 4px 4px;        /* ↓ was 8px 5px */
            font-size: 7.5pt;        /* ↓ was 8.5pt */
            border-bottom: 2px solid #dc2626;
            border-left: 1px solid #fca5a5;
            color: #991b1b;
          }
          .items-table thead th:first-child { border-left: none; }
          .items-table thead th:last-child { border-right: none; }

          .items-table tbody td {
            padding: 4px 5px;        /* ↓ was 8px 6px */
            font-size: 8pt;          /* ↓ was 9pt */
            text-align: center;
            border-left: 1px solid #fca5a5;
            vertical-align: top;
          }
          .items-table tbody td:first-child { border-left: none; }
          .items-table tbody td:last-child { border-right: none; }
          .items-table tbody tr:last-child td { border-bottom: 2px solid #dc2626; }
          .items-table .text-left { text-align: left; padding-left: 6px; }
          .items-table .text-right { text-align: right; padding-right: 8px; font-weight: bold; }
          .items-table tbody td:nth-child(2) { font-weight: bold; line-height: 1.3; }

          .items-table .details-cell {
            text-align: left;
            padding: 3px 5px;        /* ↓ was 6px */
            font-size: 7pt;          /* ↓ was 7.5pt */
            line-height: 1.3;
          }
          .items-table tbody tr.empty-row td { padding: 4px 5px; color: transparent; }

          /* ── Amount in Words ── */
          .amount-words {
            padding: 5px 10px;       /* ↓ was 10px 12px */
            font-size: 8.5pt;        /* ↓ was 9.5pt */
            border-left: 3px solid #dc2626;
            border-right: 3px solid #dc2626;
            border-bottom: 3px solid #dc2626;
            flex-shrink: 0;
            background: #fef2f2;
          }
          .amount-words-label { font-weight: bold; color: #991b1b; }
          .amount-words-value { margin-left: 8px; text-transform: uppercase; font-weight: bold; color: #dc2626; }

          /* ── Summary ── */
          .summary-section {
            padding: 5px 0;          /* ↓ was 10px 0 */
            border-left: 3px solid #dc2626;
            border-right: 3px solid #dc2626;
            border-bottom: 3px solid #dc2626;
            flex-shrink: 0;
            background: #fefefe;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 10px;       /* ↓ was 7px 12px */
            font-size: 8.5pt;        /* ↓ was 10pt */
            border-bottom: 1px solid #fca5a5;
          }
          .summary-row:last-child { border-bottom: none; }
          .summary-label { flex: 1; color: #991b1b; font-weight: 500; }
          .summary-value { min-width: 120px; text-align: right; font-weight: bold; color: #1f2937; }
          .summary-row.gst-row { background: #f5f3ff; }
          .summary-row.gst-row .summary-label { color: #5b21b6; }
          .summary-row.net {
            margin-top: 4px;
            padding: 6px 10px;       /* ↓ was 10px 12px */
            font-size: 10pt;         /* ↓ was 11.5pt */
            font-weight: bold;
            border-top: 2px solid #dc2626;
            border-bottom: none;
            background: linear-gradient(to bottom, #fee2e2 0%, #fecaca 100%);
          }
          .summary-row.net .summary-label { color: #7f1d1d; }
          .summary-row.net .summary-value { color: #dc2626; }

          /* ── Signature ── */
          .signature-section {
            margin-top: 10px;        /* ↓ was 20px */
            padding: 0 10px;
            display: flex;
            justify-content: space-between;
            font-size: 8.5pt;        /* ↓ was 9.5pt */
            flex-shrink: 0;
          }
          .signature-line {
            border-top: 2px solid #dc2626;
            padding-top: 4px;
            min-width: 180px;
            color: #991b1b;
            font-weight: 500;
          }
          .signature-name { font-weight: bold; text-align: right; color: #b91c1c; font-size: 9.5pt; }

          /* ── Footer ── */
          .footer {
            margin-top: auto;
            padding-top: 6px;        /* ↓ was 12px */
            text-align: center;
            font-size: 7.5pt;        /* ↓ was 8pt */
            color: #991b1b;
            flex-shrink: 0;
            font-style: italic;
          }

          @media print {
            body { margin: 0; padding: 0; width: 210mm; height: 297mm; }
            .bill-container { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="bill-container">

          <div class="header">
            <div class="header-grid">
              <div class="header-left">
                <img src="${getLogoUrl('primary')}" class="logo" alt="Logo" />
              </div>
              <div class="header-center">
                <div class="marathi-title">॥ ${user?.firmNameMarathi || 'श्री गणेशाय नमः'} ॥</div>
                <div class="firm-name">${user?.firmName || 'LAKSHMI SUPPLIERS'}</div>
                <div class="firm-address">${user?.address || 'भोलेगांव, अहिल्यानगर - 414111'}</div>
                <div class="firm-services">${user?.description || ''}</div>
                <div class="firm-contact-info">
                  <div><strong>प्रो.</strong> ${user?.proprietor || user?.fullname || '—'}</div>
                  <div><strong>मो.</strong> ${user?.phoneNumbers?.primary || '—'} ${user?.phoneNumbers?.secondary ? '• ' + user.phoneNumbers.secondary : ''}</div>
                  <div><strong>GSTIN:</strong> ${user?.gstNo || user?.jstNo || '—'}</div>
                </div>
              </div>
              <div class="header-right-logo">
                <img src="${getLogoUrl('secondary')}" class="logo" alt="Logo" />
              </div>
            </div>
          </div>

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
              <div class="ci-cell">
                   <div class="ci-label">GST-IN</div>
                <div class="ci-value">${customer.gstNo}</div>
              </div>
            </div>
            <div class="ci-row">
              <div class="ci-cell">
                <div class="ci-label">चलन नं.</div>
                <div class="ci-value">${challanNo || '—'}</div>
              </div>
              <div class="ci-cell">
                <div class="ci-label">बिल नं.</div>
                <div class="ci-value">SELECTED-${new Date().toISOString().slice(0,10).replace(/-/g,'')}</div>
              </div>
              <div class="ci-cell">
                <div class="ci-label">बिल दिनांक</div>
                <div class="ci-value">${reportDate}</div>
              </div>
            </div>
          </div>

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
                ${selectedBillsList.map((bill, index) => {
                  const netAmount = bill.netAmount || bill.totalAmount || bill.amount || 0;
                  const pendingAmount = bill.pendingAmount || 0;
                  const paidAmt = netAmount - pendingAmount;
                  const quantity = getBillQuantity(bill);
                  const rate = getBillRate(bill);
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td class="text-left"><strong>${bill.billNo}</strong></td>
                      <td>${formatDate(bill.date)}</td>
                      <td class="details-cell">${generateBillDetails(bill)}</td>
                      <td style="text-align:left; padding: 3px 4px;">
                        ${bill.vehicles && bill.vehicles.length > 0
                          ? bill.vehicles.map(v => `<div style="font-size:7pt; line-height:1.4; border-bottom:1px solid #fca5a5;">${v.quantity ?? '-'}</div>`).join('')
                          : quantity}
                      </td>
                      <td class="text-right" style="padding: 3px 4px;">
                        ${bill.vehicles && bill.vehicles.length > 0
                          ? bill.vehicles.map(v => `<div style="font-size:7pt; line-height:1.4; border-bottom:1px solid #fca5a5;">₹${v.rate != null ? Number(v.rate).toFixed(2) : '-'}</div>`).join('')
                          : rate.toFixed(2)}
                      </td>
                      <td class="text-right">${netAmount.toFixed(2)}</td>
                      <td class="text-right" style="color: #16a34a;">${paidAmt.toFixed(2)}</td>
                      <td class="text-right" style="color: #dc2626;"><strong>${pendingAmount.toFixed(2)}</strong></td>
                    </tr>
                  `;
                }).join('')}
                ${Array(emptyRowsNeeded).fill(0).map((_, i) => `
                  <tr class="empty-row">
                    <td>${selectedBillsList.length + i + 1}</td>
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
              </tbody>
            </table>
          </div>

          <div class="amount-words">
            <span class="amount-words-label">निव्वळ देय रक्कम अक्षरशः :</span>
            <span class="amount-words-value">${numberToWords(Math.round(netPayable))}</span>
          </div>

          <div class="summary-section">
            <div class="summary-row">
              <div class="summary-label">एकूण बिल रक्कम / Total Bill Amount</div>
              <div class="summary-value">${formatCurrency(totalBillAmount)}</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">वसूल केलेली रक्कम / Amount Paid</div>
              <div class="summary-value" style="color: #16a34a;">${formatCurrency(paidAmount)}</div>
            </div>
            ${gstSummaryRows}
            <div class="summary-row net">
              <div class="summary-label">निव्वळ देय रक्कम / Net Pay${gstEnabled ? ' (GST Inclusive)' : ''}</div>
              <div class="summary-value" style="color: #dc2626;">${formatCurrency(netPayable)}</div>
            </div>
          </div>

          <div class="signature-section">
            <div class="signature-line">ग्राहकाची सही / Customer Signature</div>
            <div class="signature-name">${user?.firmName || 'लक्ष्मी सप्लायर्स'}</div>
          </div>

          <div class="footer">This is a computer generated bill • Selected Bills Report • Page 1 of 1${gstEnabled ? ' • GST @ 18% Applied' : ''}</div>
        </div>
      </body>
      </html>`;
  };
  // ───────────────────────────────────────────────────────────────────────────

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'partial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getBillsToDisplay = (customer) => {
    switch (activeTab) {
      case 'pending': return customer.pendingBills || [];
      case 'unpaid': return customer.unpaidBills || [];
      default: return customer.allBills || [];
    }
  };

  const getCustomerSummary = (customer) => {
    switch (activeTab) {
      case 'pending': return { amount: customer.pendingAmount || 0, billsCount: customer.pendingBills?.length || 0, label: 'Pending Amount' };
      case 'unpaid': return { amount: customer.unpaidAmount || 0, billsCount: customer.unpaidBills?.length || 0, label: 'Unpaid Amount' };
      default: return { amount: customer.allBillsAmount || 0, billsCount: customer.allBills?.length || 0, label: 'Total Amount' };
    }
  };

  const getTableTitle = () => {
    switch (activeTab) {
      case 'pending': return 'Pending Bills Details';
      case 'unpaid': return 'Unpaid Bills Details';
      default: return 'All Bills Details';
    }
  };

  const getTableDescription = () => {
    switch (activeTab) {
      case 'pending': return 'Bills with pending payment status for the selected date range';
      case 'unpaid': return 'Bills with outstanding amounts for the selected date range';
      default: return 'All customer bills for the selected date range';
    }
  };

  const getVehicleDetails = (bill) => {
    if (bill.vehicles && bill.vehicles.length > 0) {
      return bill.vehicles.map(v => {
        const parts = [];
        if (v.vehicleNumber) parts.push(v.vehicleNumber);
        if (v.vehicleType) parts.push(v.vehicleType);
        if (v.product) parts.push(v.product);
        return parts.join(' • ');
      }).join('\n');
    }
    const parts = [];
    if (bill.vehicleNumber) parts.push(bill.vehicleNumber);
    if (bill.vehicleType) parts.push(bill.vehicleType);
    if (bill.product) parts.push(bill.product);
    return parts.join(' • ') || '-';
  };

  if (!customers || customers.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getTableTitle()}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getTableDescription()}</p>
            {selectedCustomerId && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Selecting bills for one customer at a time</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <input
                type="checkbox"
                checked={gstEnabled}
                onChange={(e) => setGstEnabled(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
              />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Apply GST</span>
              {gstEnabled && (
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 rounded">
                  CGST 9% + SGST 9%
                </span>
              )}
            </label>

            {selectedBills.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedBills.size} bill{selectedBills.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={clearAllSelections}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handlePrintButtonClick}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Selected Bills
                  {gstEnabled && (
                    <span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded font-semibold">+GST</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {gstEnabled && (
          <div className="mt-4 flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">GST will be applied on the printed bill</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                Net Payable Amount + CGST (9%) + SGST (9%) = Total with GST (18%). This applies only to the pending/payable amount, not the already-paid amount.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── NEW: Challan number popup ───────────────────────────────────────── */}
      {showChallanModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowChallanModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Add Challan Number
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              This will print on the bill in place of the customer number.
            </p>

            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              style={{ fontFamily: "'Noto Sans Devanagari', 'Arial Unicode MS', Arial, sans-serif" }}
            >
              चलन क्रमांक (Challan Number)
            </label>
            <input
              type="text"
              autoFocus
              value={challanNumber}
              onChange={(e) => setChallanNumber(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleChallanConfirm(); }}
              placeholder="Enter challan number"
              style={{ fontFamily: "'Noto Sans Devanagari', 'Arial Unicode MS', Arial, sans-serif" }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleChallanSkip}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleChallanConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ──────────────────────────────────────────────────────────────────────── */}

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {customers.map((customer) => {
          const bills = getBillsToDisplay(customer);
          const summary = getCustomerSummary(customer);
          const customerId = customer._id || customer.id;
          const allBillsSelected = bills.length > 0 && bills.every(bill => selectedBills.has(`${customerId}-${bill.billNo}`));
          const isDisabled = selectedCustomerId && selectedCustomerId !== customerId;

          return (
            <div key={customerId} className="p-6">
              <div className="flex items-center gap-4 p-3 rounded-lg">
                <div
                  className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors flex-1"
                  onClick={() => toggleCustomer(customerId)}
                >
                  <div className="flex-shrink-0">
                    {expandedCustomers.has(customerId) ? (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {customer.customerName || customer.name || 'Unknown Customer'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {summary.billsCount} {activeTab === 'all' ? 'bills' : activeTab === 'pending' ? 'pending bills' : 'unpaid bills'} in selected range
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`text-sm font-medium ${activeTab === 'pending' ? 'text-red-600 dark:text-red-400' : activeTab === 'unpaid' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {formatCurrency(summary.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{summary.label}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${activeTab === 'pending' ? 'text-red-600 dark:text-red-400' : activeTab === 'unpaid' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {summary.billsCount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Bills Count</p>
                    </div>
                  </div>
                </div>

                {bills.length > 0 && (
                  <div className="flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleAllBillsForCustomer(customer, bills); }}
                      disabled={isDisabled}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        isDisabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                          : allBillsSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {allBillsSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                )}
              </div>

              {expandedCustomers.has(customerId) && (
                <div className="mt-4 ml-8">
                  {bills && bills.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            {['Select', 'Bill No', 'Date', 'Details (वाहन/उत्पादन)', 'संख्या', 'दर', 'Total Amount',
                              ...(activeTab === 'unpaid' || activeTab === 'all' ? ['Pending Amount'] : []),
                              'Status',
                              ...(activeTab === 'all' ? ['Category'] : [])
                            ].map(col => (
                              <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {bills.map((bill, index) => {
                            let category = 'Paid';
                            if (bill.status === 'Pending') category = 'Pending';
                            else if (bill.pendingAmount && bill.pendingAmount > 0) category = 'Unpaid';

                            const billKey = `${customerId}-${bill.billNo}`;
                            const isSelected = selectedBills.has(billKey);
                            const quantity = getBillQuantity(bill);
                            const rate = getBillRate(bill);
                            const checkboxDisabled = selectedCustomerId && selectedCustomerId !== customerId;

                            return (
                              <tr key={bill.billNo || index} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleBillSelection(bill.billNo, customerId)}
                                    disabled={checkboxDisabled}
                                    className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${checkboxDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-[9px] font-medium text-gray-900 dark:text-white break-all whitespace-normal max-w-[70px] block">
                                    {bill.billNo || '-'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatDate(bill.date)}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                                  <div className="whitespace-pre-line text-xs leading-relaxed">{getVehicleDetails(bill)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">₹{rate.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatCurrency(bill.totalAmount || bill.amount || 0)}</td>
                                {(activeTab === 'unpaid' || activeTab === 'all') && (
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600 dark:text-orange-400">{formatCurrency(bill.pendingAmount || 0)}</td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(bill.status)}`}>
                                    {bill.status || 'Unknown'}
                                  </span>
                                </td>
                                {activeTab === 'all' && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      category === 'Pending' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                      category === 'Unpaid' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    }`}>
                                      {category}
                                    </span>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activeTab === 'all' ? 'Total Bills' : activeTab === 'pending' ? 'Pending Bills' : 'Unpaid Bills'}
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{bills.length}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activeTab === 'all' ? 'Total Amount' : activeTab === 'pending' ? 'Pending Amount' : 'Unpaid Amount'}
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(summary.amount)}</p>
                          </div>
                          {activeTab === 'all' && (
                            <>
                              <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
                                <p className="text-lg font-semibold text-red-600 dark:text-red-400">{formatCurrency(customer.pendingAmount || 0)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Unpaid Amount</p>
                                <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(customer.unpaidAmount || 0)}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">No bills found for this customer in the selected range.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerBillTable;