import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../utils/axiosSetup";
import CustomerSelect from "./CustomerSelect";
import BillForm from "./BillForm";
import BillList from "./BillList";
import InvoicePrint from "./invoice/InvoicePrint";
import CustomerPaymentModal from "./CustomerPaymentModal";
import CustomerTransactionHistoryModal from "./CustomerTransactionHistoryModal";
import { Toaster, toast } from "react-hot-toast";
import { getLogoUrl } from "../../utils/logoUtils";


const Billing = () => {
  const { user } = useSelector((state) => state.auth);
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBillForm, setShowBillForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [challanNumber, setChallanNumber] = useState("");
  const [pendingCustomerForPrint, setPendingCustomerForPrint] = useState(null);

  const [showInvoicePrint, setShowInvoicePrint] = useState(false);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState(null);
  const [selectedCustomerForPrint, setSelectedCustomerForPrint] =
    useState(null);
  console.log("cus",customers)
  const [showCustomerPaymentModal, setShowCustomerPaymentModal] =
    useState(false);

  const [showTransactionHistoryModal, setShowTransactionHistoryModal] =
    useState(false);
  const [customerTransactions, setCustomerTransactions] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customer");
      setCustomers(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch customers");
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get("/user/vehicle");
      setVehicles(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch vehicles");
    }
  };

  const fetchBills = async (customerId) => {
    if (!customerId) {
      setBills([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/bill/all", { customerId });
      const fetchedBills = response.data.data || [];
      setBills(fetchedBills);
    } catch (error) {
      setBills([]);
      toast.error("Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerTransactions = async (customerId) => {
    if (!customerId) {
      toast.error("Please select a customer first");
      return;
    }

    try {
      const response = await api.post("/customer/transactions", {
        customerId,
      });
      if (response.data.success) {
        setCustomerTransactions(response.data.data);
        setShowTransactionHistoryModal(true);
      } else {
        toast.error("Failed to fetch transaction history");
      }
    } catch (error) {
      toast.error("Failed to fetch transaction history");
    }
  };

  const handlePrintCustomerBill = (customerId) => {
    if (!customerId) {
      toast.error("Please select a customer first");
      return;
    }

    const customer = customers.find((c) => c._id === customerId);
    if (!customer) {
      toast.error("Customer not found");
      return;
    }

    const pendingBills = bills.filter((bill) => bill.pendingAmount > 0);

    if (pendingBills.length === 0) {
      toast.error("No pending bills to print");
      return;
    }

    const customerWithBills = {
      ...customer,
      allBills: bills,
    };

    // instead of printing immediately, ask for challan number first
    setPendingCustomerForPrint(customerWithBills);
    setChallanNumber("");
    setShowChallanModal(true);
  };

  const handleChallanSkip = () => {
    setShowChallanModal(false);
    generateAndPrintCustomerBill(pendingCustomerForPrint, "");
    setPendingCustomerForPrint(null);
  };

  const handleChallanConfirm = () => {
    setShowChallanModal(false);
    generateAndPrintCustomerBill(pendingCustomerForPrint, challanNumber.trim());
    setPendingCustomerForPrint(null);
  };
  const generateAndPrintCustomerBill = async (customer, challanNo = "") => {
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const formatCurrency = (amount) => {
      return `₹${amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const getBillsToDisplay = (customer) => {
      const allBills = customer.allBills || [];
      return allBills.filter((bill) => bill.pendingAmount > 0);
    };

    const getCustomerSummary = (customer) => {
      const pendingBills = getBillsToDisplay(customer);

      const totalAmount = pendingBills.reduce(
        (sum, bill) => sum + (bill.netAmount || 0),
        0,
      );
      const pendingAmount = pendingBills.reduce(
        (sum, bill) => sum + (bill.pendingAmount || 0),
        0,
      );
      const paidAmount = totalAmount - pendingAmount;

      return {
        totalAmount,
        paidAmount,
        pendingAmount,
        billsCount: pendingBills.length,
      };
    };

    const numberToWords = (num) => {
      if (num === 0) return "ZERO ONLY";

      const ones = [
        "",
        "ONE",
        "TWO",
        "THREE",
        "FOUR",
        "FIVE",
        "SIX",
        "SEVEN",
        "EIGHT",
        "NINE",
      ];
      const tens = [
        "",
        "",
        "TWENTY",
        "THIRTY",
        "FORTY",
        "FIFTY",
        "SIXTY",
        "SEVENTY",
        "EIGHTY",
        "NINETY",
      ];
      const teens = [
        "TEN",
        "ELEVEN",
        "TWELVE",
        "THIRTEEN",
        "FOURTEEN",
        "FIFTEEN",
        "SIXTEEN",
        "SEVENTEEN",
        "EIGHTEEN",
        "NINETEEN",
      ];

      let words = "";
      const crores = Math.floor(num / 10000000);
      const lakhs = Math.floor((num % 10000000) / 100000);
      const thousands = Math.floor((num % 100000) / 1000);
      const hundreds = Math.floor((num % 1000) / 100);
      const remainder = Math.floor(num % 100);

      if (crores > 0) words += ones[crores] + " CRORE ";
      if (lakhs > 0)
        words +=
          (lakhs < 10
            ? ones[lakhs]
            : tens[Math.floor(lakhs / 10)] + " " + ones[lakhs % 10]) + " LAKH ";
      if (thousands > 0)
        words +=
          (thousands < 10
            ? ones[thousands]
            : tens[Math.floor(thousands / 10)] + " " + ones[thousands % 10]) +
          " THOUSAND ";
      if (hundreds > 0) words += ones[hundreds] + " HUNDRED ";
      if (remainder >= 10 && remainder < 20)
        words += teens[remainder - 10] + " ";
      else if (remainder >= 20)
        words +=
          tens[Math.floor(remainder / 10)] + " " + ones[remainder % 10] + " ";
      else if (remainder > 0) words += ones[remainder] + " ";

      return "RS. " + words.trim() + " ONLY";
    };

    const generateBillDetails = (bill) => {
      let details = [];

      if (bill.vehicles && bill.vehicles.length > 0) {
        bill.vehicles.forEach((vehicle, index) => {
          const vehicleInfo = [];
          if (vehicle.vehicleNumber)
            vehicleInfo.push(`${vehicle.vehicleNumber}`);
          if (vehicle.vehicleType) vehicleInfo.push(`${vehicle.vehicleType}`);
          if (vehicle.product) vehicleInfo.push(`${vehicle.product}`);

          details.push(`
            <div style="margin-bottom: 4px; padding-bottom: 4px; ${index < bill.vehicles.length - 1 ? "border-bottom: 1px solid #fca5a5;" : ""}">
              <div style="font-size: 7.5pt; line-height: 1.4;">
                ${vehicleInfo.join(" - ")}
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
              ${vehicleInfo.join(" - ")}
            </div>
          `);
        }
      }

      return details.join("");
    };

    const pendingBills = getBillsToDisplay(customer);
    const customerName =
      customer.customerName || customer.name || "Unknown Customer";
    const reportDate = formatDate(new Date());
    const summary = getCustomerSummary(customer);

    const totalBillAmount = summary.totalAmount;
    const paidAmount = summary.paidAmount;
    const netPayable = summary.pendingAmount;

    const minRows = 10;
    const emptyRowsNeeded = Math.max(0, minRows - pendingBills.length);

    const htmlContent = `
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
            border: 2px solid #dc2626;
            border-radius: 4px;
            padding: 2px;
            background: #fff;
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
          <div class="header">
            <div class="header-grid">
              <div class="header-left">
                <img src="${getLogoUrl("primary")}" class="logo" alt="Logo" />
              </div>

              <div class="header-center">
                <div class="marathi-title">॥ जय मातादी प्रसन्न ॥</div>
                <div class="firm-name">${user?.firmName || "LAKSHMI SUPPLIERS"}</div>
                <div class="firm-address">${user?.address || "भोलेगांव, अहिल्यानगर - 414111"}</div>
                <div class="firm-services">${user?.description || ""}</div>
                <div class="firm-contact-info">
                  <div><strong>प्रो.</strong> ${user?.proprietor || user?.fullname || "—"} • <strong>मो.</strong> ${user?.phoneNumbers?.primary || "—"}${user?.phoneNumbers?.secondary ? " / " + user.phoneNumbers.secondary : ""}</div>
                  <div><strong>GSTIN:</strong> ${user?.gstNo || user?.jstNo || "—"}</div>
                </div>
              </div>

              <div class="header-right-logo">
                <img src="${getLogoUrl("secondary")}" class="logo" alt="Logo" />
              </div>
            </div>
          </div>

                    <div class="customer-info">
            <!-- Row 1 -->
            <div class="ci-row">
              <div class="ci-cell">
                <div class="ci-label">ग्राहकाचे नाव</div>
                <div class="ci-value">
                  ${customerName}
                </div>
              </div>

              <div class="ci-cell">
                <div class="ci-label">पत्ता</div>
                <div class="ci-value">
                  ${customer.customerAddress || customer.address || "—"}
                </div>
              </div>

              <div class="ci-cell">
                <div class="ci-label">GST No.</div>
                <div class="ci-value">
                  ${customer.gstNo || customer.jstNo || "—"}
                </div>
              </div>
            </div>

            <!-- Row 2 -->
            <div class="ci-row">
              <div class="ci-cell">
                <div class="ci-label">चलन क्रमांक</div>
                <div class="ci-value">
                  ${challanNo || "—"}
                </div>
              </div>

              <div class="ci-cell">
                <div class="ci-label">बिल नं.</div>
                <div class="ci-value">
                  PENDING-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}
                </div>
              </div>

              <div class="ci-cell">
                <div class="ci-label">बिल दिनांक</div>
                <div class="ci-value">
                  ${reportDate}
                </div>
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
                ${
                  pendingBills.length > 0
                    ? pendingBills
                        .map((bill, index) => {
                          const totalQuantity =
                            bill.vehicles && bill.vehicles.length > 0
                              ? bill.vehicles.reduce(
                                  (sum, v) => sum + (v.quantity || 0),
                                  0,
                                )
                              : bill.quantity || 0;

                          const avgRate =
                            bill.vehicles &&
                            bill.vehicles.length > 0 &&
                            totalQuantity > 0
                              ? bill.netAmount / totalQuantity
                              : bill.rate || 0;

                          return `
                    <tr>
                      <td>${index + 1}</td>
                      <td class="text-left"><strong>${bill.billNo}</strong></td>
                      <td>${formatDate(bill.date)}</td>
                      <td class="details-cell">
                        ${generateBillDetails(bill)}
                      </td>
                      <td class="text-right">${totalQuantity.toFixed(0)}</td>
                      <td class="text-right">${avgRate.toFixed(2)}</td>
                      <td class="text-right">${(bill.netAmount || 0).toFixed(2)}</td>
                      <td class="text-right" style="color: #16a34a;">${((bill.netAmount || 0) - (bill.pendingAmount || 0)).toFixed(2)}</td>
                      <td class="text-right" style="color: #dc2626;"><strong>${(bill.pendingAmount || 0).toFixed(2)}</strong></td>
                    </tr>
                  `;
                        })
                        .join("")
                    : ""
                }
                ${Array(emptyRowsNeeded)
                  .fill(0)
                  .map(
                    (_, i) => `
                  <tr class="empty-row">
                    <td>${pendingBills.length + i + 1}</td>
                    <td class="text-left">-</td>
                    <td>-</td>
                    <td>-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                  </tr>
                `,
                  )
                  .join("")}
                ${
                  pendingBills.length === 0
                    ? `
                  <tr>
                    <td colspan="9" style="text-align: center; padding: 40px; color: #dc2626; font-size: 10pt;">
                      No pending bills found
                    </td>
                  </tr>
                `
                    : ""
                }
              </tbody>
            </table>
          </div>

          <div class="amount-words">
            <span class="amount-words-label">निव्वळ देय रक्कम अक्षरशः :</span>
            <span class="amount-words-value">${numberToWords(netPayable)}</span>
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
            <div class="summary-row net">
              <div class="summary-label">निव्वळ देय रक्कम / Net Payable Amount</div>
              <div class="summary-value" style="color: #dc2626;">${formatCurrency(netPayable)}</div>
            </div>
          </div>

          <div class="signature-section">
            <div class="signature-line">ग्राहकाची सही / Customer Signature</div>
            <div class="signature-name">${user?.firmName || "लक्ष्मी सप्लायर्स"}</div>
          </div>

          <div class="footer">This is a computer generated bill • Pending Bills Report • Page 1 of 1</div>
        </div>
      </body>
      </html>`;

    const customerNameClean = (
      customer.customerName ||
      customer.name ||
      "Unknown_Customer"
    ).replace(/[^a-zA-Z0-9]/g, "_");
    const firmName = (user?.firmName || "Report").replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${firmName}_PendingBills_${customerNameClean}_${new Date().toISOString().split("T")[0]}`;

    // Check if running in Electron
    const isElectron = window.electronAPI?.isElectron;

    if (isElectron) {
      // ✅ Electron: Save HTML file
      try {
        const result = await window.electronAPI.savePdfHtml({
          filename: `${fileName}.html`,
          htmlContent: htmlContent,
          customerName: customerNameClean,
        });

        if (result.success) {
          toast.success(`Bill saved: ${result.filename}`, {
            duration: 4000,
            icon: "✅",
          });

          // Show file in folder after 500ms
          setTimeout(() => {
            window.electronAPI.showFileInFolder(result.path);
          }, 500);
        } else {
          toast.error(`Failed to save: ${result.error}`);
        }
      } catch (error) {
        console.error("Error saving PDF:", error);
        toast.error("Error saving PDF file");
      }
    } else {
      // ✅ Browser: Open print dialog (existing code)
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      const newWindow = window.open(url, "_blank");
      if (newWindow) {
        newWindow.document.title = fileName;
        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print();
            URL.revokeObjectURL(url);
          }, 500);
        };
      } else {
        toast.error("Please allow popups to print the bill");
      }
    }
  };

  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
    fetchBills(customerId);
  };

  const handleBillSubmit = async (formData) => {
    const newErrors = {};

    if (!formData.customerId) {
      newErrors.customerId = "Customer is required";
    }

    if (!formData.entries || formData.entries.length === 0) {
      newErrors.entries = "At least one vehicle entry is required";
    }

    const entryErrors = [];
    formData.entries.forEach((entry, index) => {
      const entryError = {};

      if (!entry.vehicleNumber)
        entryError.vehicleNumber = "Vehicle is required";
      if (!entry.driverName?.trim())
        entryError.driverName = "Driver name is required";
      if (!entry.quantity || entry.quantity <= 0)
        entryError.quantity = "Quantity must be at least 1";
      if (!entry.rate || entry.rate <= 0)
        entryError.rate = "Rate must be greater than 0";
      if (entry.unit === "Trip" && (!entry.from?.trim() || !entry.to?.trim())) {
        entryError.from = "From location is required for Trip units";
        entryError.to = "To location is required for Trip units";
      }
      if (entry.cashDiscount < 0)
        entryError.cashDiscount = "Discount cannot be negative";

      if (Object.keys(entryError).length > 0) {
        entryErrors[index] = entryError;
      }
    });

    if (entryErrors.length > 0) {
      newErrors.entryErrors = entryErrors;
    }

    if (Object.keys(newErrors).length > 0) {
      return { success: false, errors: newErrors };
    }

    try {
      await api.post("/bill/addbill", formData);
      await fetchBills(formData.customerId);
      await fetchCustomers();
      setShowBillForm(false);
      toast.success("Bill created successfully!");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error adding bill. Please try again.";
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const handleCustomerPaymentSubmit = async (
    amountPaid,
    method,
    reference,
    isFullAmount = false,
  ) => {
    if (!amountPaid || amountPaid <= 0) {
      return { success: false, message: "Please enter a valid payment amount" };
    }

    const actualPending = bills.reduce(
      (sum, bill) => sum + (bill.pendingAmount || 0),
      0,
    );

    if (!isFullAmount && parseFloat(amountPaid) > actualPending) {
      return {
        success: false,
        message: "Payment amount cannot exceed total pending amount",
      };
    }

    try {
      const requestData = {
        customerId: selectedCustomer,
        amountPaid: parseFloat(amountPaid),
        method,
        reference: reference.trim(),
      };

      const response = await api.post("/bill/update-payment", requestData);

      if (response.data.success) {
        await fetchBills(selectedCustomer);
        await fetchCustomers();
        toast.success("Payment collected successfully!");
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error collecting payment. Please try again.";
      toast.error(errorMessage);

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const resetBillForm = () => {
    setShowBillForm(false);
  };

  const handlePrintInvoice = (bill) => {
    setSelectedBillForPrint(bill);
    setSelectedCustomerForPrint(
      customers.find((c) => c._id === selectedCustomer),
    );
    setShowInvoicePrint(true);
  };

  const calculateTotals = () => {
    const filteredBills = bills.filter((bill) => {
      const statusFilter =
        filterStatus === "All" || bill.status === filterStatus;

      const searchFilter =
        searchTerm === "" ||
        [
          bill.billNo,
          bill.vehicleNumber,
          bill.driverName,
          bill.vehicleType,
          bill.status,
          ...(bill.vehicles
            ? bill.vehicles.flatMap((v) => [
                v.vehicleNumber,
                v.driverName,
                v.vehicleType,
                v.from,
                v.to,
                v.unit,
              ])
            : []),
        ].some((field) => {
          if (field === null || field === undefined || field === "")
            return false;
          return field
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        });

      return statusFilter && searchFilter;
    });

    const totalAmount = filteredBills.reduce(
      (sum, bill) => sum + (bill.netAmount || 0),
      0,
    );
    const pendingAmount = filteredBills.reduce(
      (sum, bill) => sum + (bill.pendingAmount || 0),
      0,
    );
    const pendingBillsCount = filteredBills.filter(
      (bill) => (bill.pendingAmount || 0) > 0,
    ).length;

    return {
      billCount: filteredBills.length,
      totalAmount,
      pendingAmount,
      pendingBillsCount,
    };
  };

  const getSelectedCustomerData = () => {
    if (!selectedCustomer) return null;

    const customer = customers.find((c) => c._id === selectedCustomer);
    if (!customer) return null;

    return {
      _id: customer._id,
      name: customer.customerName,
      customerName: customer.customerName,
      phone: customer.phone || customer.customerMobile,
      customerMobile: customer.phone || customer.customerMobile,
      address: customer.address || customer.customerAddress,
      customerAddress: customer.address || customer.customerAddress,
    };
  };

  useEffect(() => {
    fetchCustomers();
    fetchVehicles();
  }, []);

  const totals = calculateTotals();
  const selectedCustomerData = getSelectedCustomerData();

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Billing Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage customer bills
          </p>
        </div>
        <button
          onClick={() => setShowBillForm(!showBillForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Bills
        </button>
      </div>

      <CustomerSelect
        customers={customers}
        selectedCustomer={selectedCustomer}
        onCustomerChange={handleCustomerChange}
        pendingBillsCount={totals.pendingBillsCount}
        totalAmount={totals.totalAmount}
        pendingAmount={totals.pendingAmount}
        bills={bills}
        onCollectPayment={() => setShowCustomerPaymentModal(true)}
        onViewTransactions={() => fetchCustomerTransactions(selectedCustomer)}
        onPrintBill={() => handlePrintCustomerBill(selectedCustomer)}
      />

      {showBillForm && (
        <BillForm
          customers={customers}
          vehicles={vehicles}
          selectedCustomer={selectedCustomer}
          onSubmit={handleBillSubmit}
          onCancel={resetBillForm}
        />
      )}

      {selectedCustomer && (
        <BillList
          bills={bills}
          loading={loading}
          filterStatus={filterStatus}
          searchTerm={searchTerm}
          onFilterChange={setFilterStatus}
          onSearchChange={setSearchTerm}
          onShowClick={handlePrintInvoice}
        />
      )}

      {showCustomerPaymentModal && selectedCustomerData && (
        <CustomerPaymentModal
          customer={selectedCustomerData}
          pendingAmount={totals.pendingAmount}
          onClose={() => setShowCustomerPaymentModal(false)}
          onSubmit={handleCustomerPaymentSubmit}
        />
      )}

      {showChallanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Enter Challan Number
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Do you want to add a challan number to this bill?
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Challan Number
              </label>
              <input
                type="text"
                value={challanNumber}
                onChange={(e) => setChallanNumber(e.target.value)}
                placeholder="e.g. CH-1234"
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end gap-3">
              <button
                onClick={handleChallanSkip}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200"
              >
                Skip (Don't add challan)
              </button>
              <button
                onClick={handleChallanConfirm}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransactionHistoryModal &&
        customerTransactions &&
        selectedCustomerData && (
          <CustomerTransactionHistoryModal
            customer={selectedCustomerData}
            transactions={customerTransactions}
            onClose={() => setShowTransactionHistoryModal(false)}
          />
        )}

      {showInvoicePrint && selectedBillForPrint && selectedCustomerForPrint && (
        <InvoicePrint
          bill={selectedBillForPrint}
          customer={selectedCustomerForPrint}
          onClose={() => setShowInvoicePrint(false)}
        />
      )}
    </div>
  );
};

export default Billing;
