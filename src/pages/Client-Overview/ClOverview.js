import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosSetup';
import { useSelector } from 'react-redux';
import { Search, User, Phone, MapPin, Truck, FileText, DollarSign, Calendar, X, AlertCircle, CheckCircle, Clock, Eye, Printer } from 'lucide-react';
import { getLogoUrl } from '../../utils/logoUtils';


const ClOverview = () => {
  const { user } = useSelector((state) => state.auth);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printingBills, setPrintingBills] = useState(false);

  // Fetch clients from API
  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/customer');
      if (response.data.success) {
        setClients(response.data.data || []);
        setFilteredClients(response.data.data || []);
      } else {
        throw new Error('Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load client data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchClients();
  }, []);

  // Filter clients based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const results = clients.filter(client =>
      client.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.customerAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.customerMobile?.includes(searchTerm) ||
      client.customerMobile2?.includes(searchTerm)
    );
    setFilteredClients(results);
  }, [searchTerm, clients]);

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

  const generateBillDetailsHtml = (bill) => {
    let details = [];
    if (bill.vehicles && bill.vehicles.length > 0) {
      bill.vehicles.forEach((vehicle, index) => {
        const info = [];
        if (vehicle.vehicleNumber) info.push(vehicle.vehicleNumber);
        if (vehicle.vehicleType) info.push(vehicle.vehicleType);
        if (vehicle.product) info.push(vehicle.product);
        details.push(`
          <div style="margin-bottom:4px;padding-bottom:4px;${index < bill.vehicles.length - 1 ? 'border-bottom:1px solid #fca5a5;' : ''}">
            <div style="font-size:7.5pt;line-height:1.4;">${info.join(' - ')}</div>
          </div>
        `);
      });
    } else {
      const info = [];
      if (bill.vehicleNumber) info.push(bill.vehicleNumber);
      if (bill.vehicleType) info.push(bill.vehicleType);
      if (bill.product) info.push(bill.product);
      if (info.length > 0) {
        details.push(`<div style="font-size:7.5pt;line-height:1.4;">${info.join(' - ')}</div>`);
      }
    }
    return details.join('');
  };

  // View client details
  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { 
        bg: 'bg-red-100 dark:bg-red-900/20', 
        text: 'text-red-800 dark:text-red-200',
        icon: <Clock className="w-3 h-3" />
      },
      'Paid': { 
        bg: 'bg-green-100 dark:bg-green-900/20', 
        text: 'text-green-800 dark:text-green-200',
        icon: <CheckCircle className="w-3 h-3" />
      },
      'Overdue': { 
        bg: 'bg-orange-100 dark:bg-orange-900/20', 
        text: 'text-orange-800 dark:text-orange-200',
        icon: <AlertCircle className="w-3 h-3" />
      }
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  // Calculate summary statistics
  const calculateSummaryStats = () => {
    return {
      totalClients: clients.length,
      totalPendingBills: clients.reduce((sum, client) => sum + (client.totalRemainBills || 0), 0),
      totalPendingAmount: clients.reduce((sum, client) => sum + (client.totalAmountRemain || 0), 0)
    };
  };

  const handlePrintAllBills = async (client) => {
    if (!client?._id) {
      return;
    }

    setPrintingBills(true);
    try {
      const response = await api.post('/bill/all', { customerId: client._id });
      const allBills = response.data.data || [];

      if (allBills.length === 0) {
        setPrintingBills(false);
        alert('No bills found for this client');
        return;
      }

      const formatDatePrint = (date) =>
        new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const formatCurrencyPrint = (amount) =>
        `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      const customerName = client.customerName || client.name || 'Unknown Customer';
      const reportDate = formatDatePrint(new Date());

      const totalAmount = allBills.reduce((sum, b) => sum + (b.netAmount || 0), 0);
      const pendingAmount = allBills.reduce((sum, b) => sum + (b.pendingAmount || 0), 0);
      const paidAmount = totalAmount - pendingAmount;

      const minRows = 10;
      const emptyRowsNeeded = Math.max(0, minRows - allBills.length);

      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>All Bills - ${customerName}</title>
        <style>
          @page { size: A4; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Noto Sans Devanagari', 'Arial Unicode MS', Arial, sans-serif;
            font-size: 11pt; line-height: 1.4; color: #000; background: #fff;
            width: 210mm; margin: 0 auto; padding: 0;
          }
          .bill-container { width: 210mm; margin: 0; padding: 12mm; background: #fff; }
          .header { border: 3px solid #dc2626; padding: 8px 10px; background: linear-gradient(to bottom, #fef2f2 0%, #ffffff 100%); }
          .header-grid { display: grid; grid-template-columns: 80px 1fr 80px; align-items: center; column-gap: 15px; }
          .logo { width: 70px; height: 70px; border: 2px solid #dc2626; border-radius: 4px; padding: 2px; background: #fff; object-fit: contain; }
          .header-left { display: flex; justify-content: flex-start; }
          .header-right-logo { display: flex; justify-content: flex-end; }
          .header-center { text-align: center; padding: 0 10px; }
          .marathi-title { font-size: 10pt; font-weight: bold; margin-bottom: 3px; color: #dc2626; }
          .firm-name { font-size: 16pt; font-weight: bold; letter-spacing: 0.8px; margin-bottom: 3px; color: #b91c1c; text-transform: uppercase; }
          .firm-address { font-size: 8.5pt; margin-bottom: 2px; color: #991b1b; }
          .firm-services { font-size: 7.5pt; line-height: 1.3; color: #7f1d1d; }
          .firm-contact-info { font-size: 8.5pt; line-height: 1.5; margin-top: 4px; color: #991b1b; }
          .firm-contact-info strong { color: #dc2626; }
          .customer-info { border-left: 3px solid #dc2626; border-right: 3px solid #dc2626; border-bottom: 3px solid #dc2626; font-size: 8.5pt; background: #fefefe; }
          .ci-row { display: grid; grid-template-columns: 1.2fr 1.2fr 0.8fr; }
          .ci-cell { border-right: 1px solid #fca5a5; border-bottom: 1px solid #fca5a5; padding: 5px 8px; min-height: 38px; }
          .ci-row:last-child .ci-cell { border-bottom: none; }
          .ci-cell:last-child { border-right: none; }
          .ci-label { font-size: 7.5pt; color: #991b1b; font-weight: 600; }
          .ci-value { font-size: 9.5pt; font-weight: bold; margin-top: 3px; color: #1f2937; }
          .items-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; border-left: 3px solid #dc2626; border-right: 3px solid #dc2626; }
          .items-table thead th {
            background: linear-gradient(to bottom, #fee2e2 0%, #fecaca 100%);
            font-weight: bold; text-align: center; padding: 8px 5px; font-size: 8pt;
            border-bottom: 2px solid #dc2626; border-left: 1px solid #fca5a5; color: #991b1b;
          }
          .items-table thead th:first-child { border-left: none; }
          .items-table tbody td {
            padding: 7px 5px; font-size: 8.5pt; text-align: center;
            border-left: 1px solid #fca5a5; vertical-align: top;
          }
          .items-table tbody td:first-child { border-left: none; }
          .items-table tbody tr:last-child td { border-bottom: 2px solid #dc2626; }
          .items-table .text-left { text-align: left; padding-left: 8px; }
          .items-table .text-right { text-align: right; padding-right: 8px; font-weight: bold; }
          .items-table .details-cell { text-align: left; padding: 6px; font-size: 7.5pt; line-height: 1.4; }
          .items-table tbody tr.empty-row td { color: transparent; }
          .status-paid { color: #16a34a; font-weight: bold; }
          .status-pending { color: #dc2626; font-weight: bold; }
          .amount-words {
            padding: 10px 12px; font-size: 9.5pt; border-left: 3px solid #dc2626; border-right: 3px solid #dc2626;
            border-bottom: 3px solid #dc2626; background: #fef2f2;
          }
          .amount-words-label { font-weight: bold; color: #991b1b; }
          .amount-words-value { margin-left: 10px; text-transform: uppercase; font-weight: bold; color: #dc2626; }
          .summary-section {
            padding: 10px 0; border-left: 3px solid #dc2626; border-right: 3px solid #dc2626;
            border-bottom: 3px solid #dc2626; background: #fefefe;
          }
          .summary-row { display: flex; justify-content: space-between; padding: 7px 12px; font-size: 10pt; border-bottom: 1px solid #fca5a5; }
          .summary-row:last-child { border-bottom: none; }
          .summary-label { flex: 1; color: #991b1b; font-weight: 500; }
          .summary-value { min-width: 130px; text-align: right; font-weight: bold; color: #1f2937; }
          .summary-row.net {
            margin-top: 6px; padding: 10px 12px; font-size: 11.5pt; font-weight: bold;
            border-top: 2px solid #dc2626; background: linear-gradient(to bottom, #fee2e2 0%, #fecaca 100%);
          }
          .summary-row.net .summary-label { color: #7f1d1d; }
          .summary-row.net .summary-value { color: #dc2626; }
          .signature-section { margin-top: 20px; padding: 0 12px; display: flex; justify-content: space-between; font-size: 9.5pt; }
          .signature-line { border-top: 2px solid #dc2626; padding-top: 5px; min-width: 200px; color: #991b1b; font-weight: 500; }
          .signature-name { font-weight: bold; text-align: right; color: #b91c1c; font-size: 10.5pt; }
          .footer { margin-top: 12px; padding-top: 12px; text-align: center; font-size: 8pt; color: #991b1b; font-style: italic; }
          @media print { body { margin: 0; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="bill-container">
          <div class="header">
            <div class="header-grid">
              <div class="header-left"><img src="${getLogoUrl('primary')}" class="logo" alt="Logo" /></div>
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
              <div class="header-right-logo"><img src="${getLogoUrl('secondary')}" class="logo" alt="Logo" /></div>
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
                <div class="ci-value">${client.customerAddress || client.address || '—'}</div>
              </div>
              <div class="ci-cell">
                <div class="ci-label">GST No.</div>
                <div class="ci-value">${client.gstNo || '—'}</div>
              </div>
            </div>
            <div class="ci-row">
              <div class="ci-cell">
                <div class="ci-label">मोबाईल</div>
                <div class="ci-value">${client.customerMobile || '—'}</div>
              </div>
              <div class="ci-cell">
                <div class="ci-label">एकूण बिले</div>
                <div class="ci-value">${allBills.length}</div>
              </div>
              <div class="ci-cell">
                <div class="ci-label">रिपोर्ट दिनांक</div>
                <div class="ci-value">${reportDate}</div>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width:4%;">अ.क्र.</th>
                <th style="width:12%;">बिल क्रमांक</th>
                <th style="width:8%;">दिनांक</th>
                <th style="width:19%;">तपशील</th>
                <th style="width:7%;">संख्या</th>
                <th style="width:9%;">दर</th>
                <th style="width:11%;">एकूण रक्कम</th>
                <th style="width:11%;">वसूल रक्कम</th>
                <th style="width:11%;">बाकी रक्कम</th>
                <th style="width:8%;">स्थिती</th>
              </tr>
            </thead>
            <tbody>
              ${allBills
                .map((bill, index) => {
                  const totalQuantity =
                    bill.vehicles && bill.vehicles.length > 0
                      ? bill.vehicles.reduce((sum, v) => sum + (v.quantity || 0), 0)
                      : bill.quantity || 0;
                  const avgRate =
                    bill.vehicles && bill.vehicles.length > 0 && totalQuantity > 0
                      ? bill.netAmount / totalQuantity
                      : bill.rate || 0;
                  const isPaid = (bill.pendingAmount || 0) <= 0;
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td class="text-left"><strong>${bill.billNo}</strong></td>
                      <td>${formatDatePrint(bill.date)}</td>
                      <td class="details-cell">${generateBillDetailsHtml(bill)}</td>
                      <td class="text-right">${totalQuantity.toFixed(0)}</td>
                      <td class="text-right">${avgRate.toFixed(2)}</td>
                      <td class="text-right">${(bill.netAmount || 0).toFixed(2)}</td>
                      <td class="text-right" style="color:#16a34a;">${((bill.netAmount || 0) - (bill.pendingAmount || 0)).toFixed(2)}</td>
                      <td class="text-right" style="color:#dc2626;">${(bill.pendingAmount || 0).toFixed(2)}</td>
                      <td class="${isPaid ? 'status-paid' : 'status-pending'}">${isPaid ? 'पेड' : 'पेंडिंग'}</td>
                    </tr>
                  `;
                })
                .join('')}
              ${Array(emptyRowsNeeded)
                .fill(0)
                .map(
                  (_, i) => `
                <tr class="empty-row">
                  <td>${allBills.length + i + 1}</td>
                  <td class="text-left">-</td><td>-</td><td>-</td>
                  <td class="text-right">-</td><td class="text-right">-</td>
                  <td class="text-right">-</td><td class="text-right">-</td>
                  <td class="text-right">-</td><td>-</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>

          <div class="amount-words">
            <span class="amount-words-label">निव्वळ देय रक्कम अक्षरशः :</span>
            <span class="amount-words-value">${numberToWords(pendingAmount)}</span>
          </div>

          <div class="summary-section">
            <div class="summary-row">
              <div class="summary-label">एकूण बिल रक्कम / Total Bill Amount</div>
              <div class="summary-value">${formatCurrencyPrint(totalAmount)}</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">वसूल केलेली रक्कम / Amount Paid</div>
              <div class="summary-value" style="color:#16a34a;">${formatCurrencyPrint(paidAmount)}</div>
            </div>
            <div class="summary-row net">
              <div class="summary-label">बाकी रक्कम / Pending Amount</div>
              <div class="summary-value" style="color:#dc2626;">${formatCurrencyPrint(pendingAmount)}</div>
            </div>
          </div>

          <div class="signature-section">
            <div class="signature-line">ग्राहकाची सही / Customer Signature</div>
            <div class="signature-name">${user?.firmName || 'लक्ष्मी सप्लायर्स'}</div>
          </div>

          <div class="footer">This is a computer generated report • All Bills Report (Paid & Pending) • Page 1 of 1</div>
        </div>
      </body>
      </html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            URL.revokeObjectURL(url);
          }, 500);
        };
      } else {
        alert('Please allow popups to print bills');
      }
    } catch (err) {
      console.error('Error printing all bills:', err);
      alert('Failed to fetch bills for printing');
    } finally {
      setPrintingBills(false);
    }
  };

  const summaryStats = calculateSummaryStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and view all your clients</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and view all your clients</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 shadow-sm text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error loading clients</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchClients}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and view all your clients</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleString('en-IN')}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Clients</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{summaryStats.totalClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Pending Bills</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-200">{summaryStats.totalPendingBills}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Pending Amount</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                ₹{summaryStats.totalPendingAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Client List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients by name, address, or mobile..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Client List */}
        <div className="overflow-x-auto">
          {filteredClients.length === 0 ? (
            <div className="text-center py-16">
              <User className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {searchTerm ? 'No clients found' : 'No clients available'}
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {searchTerm 
                  ? 'Try adjusting your search terms to find what you\'re looking for.'
                  : 'Start by adding your first client to get started.'
                }
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pending Bills
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pending Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {client.customerName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate max-w-xs">
                              {client.customerAddress || 'Address not provided'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {client.customerMobile && (
                          <div className="text-sm text-gray-900 dark:text-white flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {client.customerMobile}
                          </div>
                        )}
                        {client.customerMobile2 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {client.customerMobile2}
                          </div>
                        )}
                        {!client.customerMobile && !client.customerMobile2 && (
                          <span className="text-sm text-gray-400">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {client.totalRemainBills || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{(client.totalAmountRemain || 0).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(client)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Client Details Modal */}
      {isModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-white" id="modal-title">
                        {selectedClient.customerName}
                      </h3>
                      <p className="text-blue-100 text-sm">Client Details</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bg-white bg-opacity-20 rounded-md text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white p-2"
                    onClick={closeModal}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h4>
                    
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedClient.customerAddress || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    {selectedClient.customerMobile && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Mobile</p>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedClient.customerMobile}</p>
                        </div>
                      </div>
                    )}

                    {selectedClient.customerMobile2 && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Secondary Mobile</p>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedClient.customerMobile2}</p>
                        </div>
                      </div>
                    )}
                    {selectedClient.gstNo && (
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            GST No.
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {selectedClient.gstNo}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Client Since</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(selectedClient.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Business Summary</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <div className="flex items-center">
                          <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <div className="ml-2">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Vehicles</p>
                            <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
                              {selectedClient.totalVehicles || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                          <div className="ml-2">
                            <p className="text-xs font-medium text-red-600 dark:text-red-400">Pending Bills</p>
                            <p className="text-lg font-bold text-red-900 dark:text-red-200">
                              {selectedClient.totalRemainBills || 0}
                            </p>
                          </div>
                        </div>
                      </div> 

                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg col-span-2">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <div className="ml-2">
                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Pending Amount</p>
                            <p className="text-xl font-bold text-purple-900 dark:text-purple-200">
                              ₹{(selectedClient.totalAmountRemain || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Latest Bills */}
                {selectedClient.latestBills && selectedClient.latestBills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recent Bills</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-gray-600">
                      {selectedClient.latestBills.slice(0, 5).map((bill) => (
                        <div key={bill._id} className="flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-600/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-gray-900 dark:text-white truncate">{bill.billNo}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">{formatDate(bill.date)}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">{bill.vehicles?.length || 0} vehicle(s)</span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              ₹{(bill.totalAmount || 0).toLocaleString('en-IN')}
                            </span>
                            {getStatusBadge(bill.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={printingBills}
                  onClick={() => handlePrintAllBills(selectedClient)}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Printer className="w-4 h-4" />
                  {printingBills ? 'Preparing...' : 'Print All Bills'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClOverview;