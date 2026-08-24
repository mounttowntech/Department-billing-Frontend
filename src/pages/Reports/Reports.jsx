import React, { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Receipt,
  Scale,
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  IndianRupee,
  Layers,
  FileSpreadsheet,
  FileText,
  Download,
  ChevronDown,
} from "lucide-react";

import {
  getSalesReport,
  getPurchaseReport,
  getStockReport,
  getExpenseReport,
  getProfitLossReport,
} from "../../services/reportService";

import { getStores } from "../../services/storeService";
import "./Reports.css";

const TABS = [
  { id: "profit-loss", label: "Profit & Loss", icon: Scale },
  { id: "sales", label: "Sales Report", icon: ShoppingCart },
  { id: "purchases", label: "Purchase Report", icon: Package },
  { id: "stock", label: "Stock Ledger", icon: Layers },
  { id: "expenses", label: "Expense Report", icon: Receipt },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("profit-loss");
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  const [exportOpen, setExportOpen] = useState(false);
  const exportMenuRef = useRef(null);

  const [storeFilter, setStoreFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const [salesData, setSalesData] = useState({ summary: {}, invoices: [] });
  const [purchaseData, setPurchaseData] = useState({
    summary: {},
    purchases: [],
  });
  const [stockData, setStockData] = useState({ summary: {}, stock: [] });
  const [expenseData, setExpenseData] = useState({
    summary: {},
    expenses: [],
  });
  const [profitLossData, setProfitLossData] = useState({
    totalSales: 0,
    totalPurchase: 0,
    totalExpense: 0,
    grossProfit: 0,
    netProfit: 0,
  });

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const loadStores = async () => {
    try {
      const res = await getStores();
      const list = res?.data?.data || res?.data || res?.stores || [];
      setStores(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load stores:", error);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    const baseParams = {
      page,
      limit,
      store: storeFilter || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      search: search.trim() || undefined,
    };

    try {
      if (activeTab === "profit-loss") {
        const res = await getProfitLossReport({
          store: storeFilter || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        });
        const d = res?.data || res || {};
        setProfitLossData({
          totalSales: d.totalSales || 0,
          totalPurchase: d.totalPurchase || 0,
          totalExpense: d.totalExpense || 0,
          grossProfit: d.grossProfit || 0,
          netProfit: d.netProfit || 0,
        });
      } else if (activeTab === "sales") {
        const res = await getSalesReport({
          ...baseParams,
          paymentStatus: paymentStatusFilter || undefined,
        });
        const d = res?.data || res || {};
        setSalesData({
          summary: d.summary || {},
          invoices: Array.isArray(d.invoices) ? d.invoices : [],
        });
        if (d.pagination) setPagination(d.pagination);
      } else if (activeTab === "purchases") {
        const res = await getPurchaseReport({
          ...baseParams,
          paymentStatus: paymentStatusFilter || undefined,
        });
        const d = res?.data || res || {};
        setPurchaseData({
          summary: d.summary || {},
          purchases: Array.isArray(d.purchases) ? d.purchases : [],
        });
        if (d.pagination) setPagination(d.pagination);
      } else if (activeTab === "stock") {
        const res = await getStockReport({
          ...baseParams,
          transactionType: transactionTypeFilter || undefined,
        });
        const d = res?.data || res || {};
        setStockData({
          summary: d.summary || {},
          stock: Array.isArray(d.stock) ? d.stock : [],
        });
        if (d.pagination) setPagination(d.pagination);
      } else if (activeTab === "expenses") {
        const res = await getExpenseReport(baseParams);
        const d = res?.data || res || {};
        setExpenseData({
          summary: d.summary || {},
          expenses: Array.isArray(d.expenses) ? d.expenses : [],
        });
        if (d.pagination) setPagination(d.pagination);
      }
    } catch (error) {
      console.error("Load Report Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [
    activeTab,
    page,
    storeFilter,
    fromDate,
    toDate,
    paymentStatusFilter,
    transactionTypeFilter,
  ]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
    setSearch("");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadReportData();
  };

  const clearFilters = () => {
    setStoreFilter("");
    setFromDate("");
    setToDate("");
    setSearch("");
    setPaymentStatusFilter("");
    setTransactionTypeFilter("");
    setPage(1);
  };

  const formatCurrency = (val) =>
    `₹${Number(val || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const currentStore = useMemo(() => {
    return (
      stores.find((s) => String(s._id) === String(storeFilter)) ||
      stores[0] || {
        storeName: "Central Store",
        storeCode: "HQ-01",
        address: "Commercial Center",
        phone: "+91 98765 43210",
      }
    );
  }, [stores, storeFilter]);

  const handleExportExcel = () => {
    setExportOpen(false);
    let headers = [];
    let rows = [];
    const timestamp = new Date().toISOString().split("T")[0];
    let fileName = `${activeTab}_report_${timestamp}.csv`;

    if (activeTab === "profit-loss") {
      fileName = `profit_and_loss_${timestamp}.csv`;
      headers = ["Financial Component", "Amount (INR)"];
      rows = [
        ["Gross Sales Revenue (+)", profitLossData.totalSales],
        ["Direct Cost of Goods / Purchases (-)", profitLossData.totalPurchase],
        ["Gross Operating Margin", profitLossData.grossProfit],
        ["Operating Overhead / Expenses (-)", profitLossData.totalExpense],
        ["Net Bottom-Line Profit", profitLossData.netProfit],
      ];
    } else if (activeTab === "sales") {
      fileName = `sales_report_${timestamp}.csv`;
      headers = [
        "Invoice No",
        "Invoice Date",
        "Customer Name",
        "Phone",
        "Store",
        "Grand Total (INR)",
        "Paid Amount (INR)",
        "Due Amount (INR)",
        "Payment Status",
      ];
      rows = salesData.invoices.map((inv) => [
        inv.invoiceNo || "",
        formatDate(inv.invoiceDate || inv.createdAt),
        inv.customer?.customerName || "Walk-in Guest",
        inv.customer?.phone || "",
        inv.store?.storeName || "",
        inv.grandTotal || 0,
        inv.paidAmount || 0,
        inv.dueAmount || 0,
        inv.paymentStatus || "Unpaid",
      ]);
    } else if (activeTab === "purchases") {
      fileName = `purchase_report_${timestamp}.csv`;
      headers = [
        "Purchase No",
        "Purchase Date",
        "Supplier Name",
        "Mobile",
        "Store",
        "Grand Total (INR)",
        "Paid Amount (INR)",
        "Due Amount (INR)",
        "Payment Status",
      ];
      rows = purchaseData.purchases.map((pur) => [
        pur.purchaseNo || "",
        formatDate(pur.purchaseDate || pur.createdAt),
        pur.supplier?.supplierName || "",
        pur.supplier?.mobile || "",
        pur.store?.storeName || "",
        pur.grandTotal || 0,
        pur.paidAmount || 0,
        pur.dueAmount || 0,
        pur.paymentStatus || "Unpaid",
      ]);
    } else if (activeTab === "stock") {
      fileName = `stock_ledger_${timestamp}.csv`;
      headers = [
        "Txn Ref",
        "Date",
        "Product",
        "SKU",
        "Location",
        "Movement Type",
        "Quantity",
        "Balance Qty",
      ];
      rows = stockData.stock.map((stk) => [
        stk.transactionNo || "",
        formatDate(stk.createdAt),
        stk.product?.productName || "",
        stk.variant?.skuCode || "",
        stk.store?.storeName || stk.warehouse?.warehouseName || "",
        stk.transactionType || "",
        stk.quantity || 0,
        stk.balanceQuantity ?? "",
      ]);
    } else if (activeTab === "expenses") {
      fileName = `expense_report_${timestamp}.csv`;
      headers = [
        "Voucher No",
        "Expense Date",
        "Category",
        "Store",
        "Payment Method",
        "Total Amount (INR)",
      ];
      rows = expenseData.expenses.map((exp) => [
        exp.expenseNumber || exp.expenseNo || "",
        formatDate(exp.expenseDate || exp.createdAt),
        exp.expenseCategory || exp.category?.categoryName || "",
        exp.store?.storeName || "",
        exp.paymentMethod || "Cash",
        exp.totalAmount || exp.amount || 0,
      ]);
    }

    const csvContent =
      "\uFEFF" +
      [
        headers.map((h) => `"${h}"`).join(","),
        ...rows.map((row) =>
          row
            .map((cell) => {
              const str = String(cell ?? "");
              return `"${str.replace(/"/g, '""')}"`;
            })
            .join(",")
        ),
      ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReportPDF = () => {
    setExportOpen(false);
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const timestamp = new Date().toISOString().split("T")[0];
    const dateRangeStr =
      fromDate && toDate
        ? `${formatDate(fromDate)} to ${formatDate(toDate)}`
        : "Consolidated Lifetime";

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 595.28, 65, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(currentStore.storeName || "RETAIL ENTERPRISE", 40, 36);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `${currentStore.address || "Main Branch"} | Phone: ${currentStore.phone || "+91 98765 43210"}`,
      40,
      52
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 27, 58);
    doc.text(
      `${TABS.find((t) => t.id === activeTab)?.label.toUpperCase()} STATEMENT`,
      40,
      95
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(107, 114, 128);
    doc.text(`Period Scope: ${dateRangeStr} | Generated: ${formatDate(new Date())}`, 40, 110);

    if (activeTab === "profit-loss") {
      autoTable(doc, {
        startY: 130,
        head: [["Financial Accounting Item", "Amount (INR)"]],
        body: [
          ["Gross Sales Revenue (+)", formatCurrency(profitLossData.totalSales)],
          ["Less: Cost of Goods Sold / Purchases (-)", `- ${formatCurrency(profitLossData.totalPurchase)}`],
          ["Gross Operating Margin", formatCurrency(profitLossData.grossProfit)],
          ["Less: Operating Overhead & Expenses (-)", `- ${formatCurrency(profitLossData.totalExpense)}`],
          ["Net Bottom-Line Profit / (Loss)", formatCurrency(profitLossData.netProfit)],
        ],
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229], fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 8 },
        columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
      });
    } else if (activeTab === "sales") {
      autoTable(doc, {
        startY: 130,
        head: [["Invoice #", "Date", "Customer", "Store", "Total (INR)", "Paid", "Due", "Status"]],
        body: salesData.invoices.map((inv) => [
          inv.invoiceNo || "—",
          formatDate(inv.invoiceDate || inv.createdAt),
          inv.customer?.customerName || "Walk-in Guest",
          inv.store?.storeName || "—",
          Number(inv.grandTotal || 0).toFixed(2),
          Number(inv.paidAmount || 0).toFixed(2),
          Number(inv.dueAmount || 0).toFixed(2),
          inv.paymentStatus || "Unpaid",
        ]),
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8.5, cellPadding: 5 },
        columnStyles: { 4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" } },
      });
    } else if (activeTab === "purchases") {
      autoTable(doc, {
        startY: 130,
        head: [["PO / Bill #", "Date", "Supplier", "Store", "Total (INR)", "Paid", "Due", "Status"]],
        body: purchaseData.purchases.map((pur) => [
          pur.purchaseNo || "—",
          formatDate(pur.purchaseDate || pur.createdAt),
          pur.supplier?.supplierName || "—",
          pur.store?.storeName || "—",
          Number(pur.grandTotal || 0).toFixed(2),
          Number(pur.paidAmount || 0).toFixed(2),
          Number(pur.dueAmount || 0).toFixed(2),
          pur.paymentStatus || "Unpaid",
        ]),
        theme: "striped",
        headStyles: { fillColor: [124, 58, 237] },
        styles: { fontSize: 8.5, cellPadding: 5 },
        columnStyles: { 4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" } },
      });
    } else if (activeTab === "stock") {
      autoTable(doc, {
        startY: 130,
        head: [["Txn Ref", "Date", "Product / SKU", "Location", "Type", "Qty", "Balance Qty"]],
        body: stockData.stock.map((stk) => [
          stk.transactionNo || "—",
          formatDate(stk.createdAt),
          `${stk.product?.productName || "—"} (${stk.variant?.skuCode || "STD"})`,
          stk.store?.storeName || stk.warehouse?.warehouseName || "—",
          stk.transactionType || "—",
          stk.quantity > 0 ? `+${stk.quantity}` : stk.quantity,
          stk.balanceQuantity ?? "—",
        ]),
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8.5, cellPadding: 5 },
        columnStyles: { 5: { halign: "center" }, 6: { halign: "center" } },
      });
    } else if (activeTab === "expenses") {
      autoTable(doc, {
        startY: 130,
        head: [["Voucher #", "Date", "Category", "Store", "Payment Mode", "Total Amount (INR)"]],
        body: expenseData.expenses.map((exp) => [
          exp.expenseNumber || exp.expenseNo || "—",
          formatDate(exp.expenseDate || exp.createdAt),
          exp.expenseCategory || "—",
          exp.store?.storeName || "—",
          exp.paymentMethod || "Cash",
          Number(exp.totalAmount || exp.amount || 0).toFixed(2),
        ]),
        theme: "striped",
        headStyles: { fillColor: [217, 119, 6] },
        styles: { fontSize: 8.5, cellPadding: 5 },
        columnStyles: { 5: { halign: "right" } },
      });
    }

    doc.save(`${activeTab}_report_statement_${timestamp}.pdf`);
  };

  const handleDownloadSingleBillPDF = (bill, type) => {
    const isSales = type === "sales";
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const billNumber = bill.invoiceNo || bill.purchaseNo || "DOC-001";

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 595.28, 70, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(bill.store?.storeName || currentStore.storeName || "RETAIL OUTLET", 40, 36);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(
      `${bill.store?.address || "Commercial Center, City Square"} | Phone: ${bill.store?.phone || "+91 98765 43210"}`,
      40,
      52
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text(isSales ? "TAX INVOICE RECEIPT" : "PURCHASE VOUCHER BILL", 40, 105);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(40, 118, 515.28, 65, 6, 6, "FD");

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(isSales ? "BILLED TO (CUSTOMER):" : "VENDOR / SUPPLIER:", 52, 134);
    doc.text("DOCUMENT DETAILS:", 340, 134);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 27, 58);
    doc.text(
      isSales
        ? bill.customer?.customerName || "Walk-in Guest"
        : bill.supplier?.supplierName || "Direct Supplier",
      52,
      149
    );
    doc.text(`Ref No: ${billNumber}`, 340, 149);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Phone: ${bill.customer?.phone || bill.supplier?.mobile || "N/A"}`,
      52,
      163
    );
    doc.text(
      `Date: ${formatDate(bill.invoiceDate || bill.purchaseDate || bill.createdAt)} | Status: ${bill.paymentStatus || "PAID"}`,
      340,
      163
    );

    const tableItems =
      bill.items && bill.items.length > 0
        ? bill.items.map((it, idx) => {
            const rate = it.unitPrice || it.purchasePrice || 0;
            const lineTotal = it.total || it.subTotal || it.quantity * rate;
            return [
              idx + 1,
              `${it.product?.productName || "Product Item"}\n${it.variant?.skuCode ? `SKU: ${it.variant.skuCode}` : ""}`,
              it.quantity,
              Number(rate).toFixed(2),
              Number(lineTotal).toFixed(2),
            ];
          })
        : [
            [
              1,
              "Consolidated Ledger Bill Amount\nDirect Counter Sale",
              1,
              Number(bill.grandTotal || 0).toFixed(2),
              Number(bill.grandTotal || 0).toFixed(2),
            ],
          ];

    autoTable(doc, {
      startY: 198,
      head: [["#", "Item Description", "Qty", "Rate (INR)", "Amount (INR)"]],
      body: tableItems,
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229], fontStyle: "bold" },
      styles: { fontSize: 9.5, cellPadding: 7 },
      columnStyles: {
        0: { halign: "center", cellWidth: 30 },
        2: { halign: "center", cellWidth: 50 },
        3: { halign: "right", cellWidth: 80 },
        4: { halign: "right", cellWidth: 90 },
      },
    });

    const finalY = doc.lastAutoTable.finalY + 16;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(340, finalY, 215.28, 75, 6, 6, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Sub Total:", 352, finalY + 18);
    doc.text("Amount Settled:", 352, finalY + 36);
    doc.text("Balance Due:", 352, finalY + 54);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 27, 58);
    doc.text(formatCurrency(bill.grandTotal), 540, finalY + 18, { align: "right" });
    doc.text(formatCurrency(bill.paidAmount || bill.grandTotal), 540, finalY + 36, { align: "right" });

    doc.setTextColor(217, 119, 6);
    doc.text(formatCurrency(bill.dueAmount || 0), 540, finalY + 54, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Terms: Goods once sold can be exchanged against original bill within 7 days.", 40, finalY + 100);
    doc.text("This is an official computer-generated PDF document.", 40, finalY + 112);

    doc.setDrawColor(203, 213, 225);
    doc.line(40, finalY + 155, 180, finalY + 155);
    doc.line(415, finalY + 155, 555, finalY + 155);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Customer Signature", 75, finalY + 168);
    doc.text("Authorized Signatory", 445, finalY + 168);

    doc.save(`${isSales ? "Tax_Invoice" : "Purchase_Bill"}_${billNumber}.pdf`);
  };

  return (
    <div className="reports-page">
      <div className="reports-content">

        <div className="reports-page-header">
          <div>
            <h2>Financial & Inventory Audits</h2>
            <p>
              Consolidated intelligence on revenue, expenditures, stock velocity,
              and margin analysis
            </p>
          </div>

          <div className="reports-header-actions">

            <div className="reports-dropdown-wrapper" ref={exportMenuRef}>
              <button
                type="button"
                className="reports-download-btn"
                onClick={() => setExportOpen((prev) => !prev)}
              >
                <Download size={16} />
                <span>Download Report</span>
                <ChevronDown
                  size={14}
                  className={exportOpen ? "rotate-180" : ""}
                />
              </button>

              {exportOpen && (
                <div className="reports-dropdown-menu">
                  <button
                    type="button"
                    className="reports-dropdown-item"
                    onClick={handleExportExcel}
                  >
                    <div className="reports-item-icon green">
                      <FileSpreadsheet size={16} />
                    </div>
                    <div>
                      <strong>Download Excel (.CSV)</strong>
                      <small>Export tabular sheet of current tab</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="reports-dropdown-item"
                    onClick={handleDownloadReportPDF}
                  >
                    <div className="reports-item-icon purple">
                      <FileText size={16} />
                    </div>
                    <div>
                      <strong>Download Statement PDF (.PDF)</strong>
                      <small>Official formatted PDF document</small>
                    </div>
                  </button>
                </div>
              )}
            </div>


          </div>
        </div>

        <div className="reports-tabs-bar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`reports-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="reports-toolbar">
          {activeTab !== "profit-loss" && (
            <form onSubmit={handleSearchSubmit} className="reports-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search invoice, SKU, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="reports-clear-search"
                  onClick={() => setSearch("")}
                >
                  <X size={14} />
                </button>
              )}
            </form>
          )}

          <select
            className="reports-filter-select"
            value={storeFilter}
            onChange={(e) => {
              setStoreFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Stores</option>
            {stores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.storeName || s.name}
              </option>
            ))}
          </select>

          {(activeTab === "sales" || activeTab === "purchases") && (
            <select
              className="reports-filter-select"
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
            </select>
          )}

          {activeTab === "stock" && (
            <select
              className="reports-filter-select"
              value={transactionTypeFilter}
              onChange={(e) => {
                setTransactionTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Transaction Types</option>
              <option value="Purchase">Purchase (Inward)</option>
              <option value="Sale">Sale (Outward)</option>
              <option value="Adjustment">Adjustment</option>
              <option value="Transfer">Transfer</option>
              <option value="Return">Return</option>
            </select>
          )}

          <div className="reports-date-group">
            <input
              type="date"
              className="reports-date-input"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              title="From Date"
            />
            <span className="reports-date-sep">to</span>
            <input
              type="date"
              className="reports-date-input"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              title="To Date"
            />
          </div>

          {(storeFilter ||
            fromDate ||
            toDate ||
            search ||
            paymentStatusFilter ||
            transactionTypeFilter) && (
            <button
              type="button"
              className="reports-clear-btn"
              onClick={clearFilters}
            >
              Reset Filters
            </button>
          )}
        </div>

        {activeTab === "profit-loss" && (
          <div className="pl-container">
            <div className="pl-summary-grid">
              <div className="reports-summary-card card-blue">
                <div className="reports-summary-icon">
                  <ShoppingCart size={22} />
                </div>
                <div>
                  <h2>{formatCurrency(profitLossData.totalSales)}</h2>
                  <p>Gross Sales Revenue</p>
                </div>
              </div>

              <div className="reports-summary-card card-purple">
                <div className="reports-summary-icon">
                  <Package size={22} />
                </div>
                <div>
                  <h2>{formatCurrency(profitLossData.totalPurchase)}</h2>
                  <p>Cost of Goods (Purchases)</p>
                </div>
              </div>

              <div className="reports-summary-card card-amber">
                <div className="reports-summary-icon">
                  <Receipt size={22} />
                </div>
                <div>
                  <h2>{formatCurrency(profitLossData.totalExpense)}</h2>
                  <p>Operating Expenses</p>
                </div>
              </div>

              <div
                className={`reports-summary-card ${
                  profitLossData.netProfit >= 0 ? "card-green" : "card-red"
                }`}
              >
                <div className="reports-summary-icon">
                  {profitLossData.netProfit >= 0 ? (
                    <TrendingUp size={22} />
                  ) : (
                    <TrendingDown size={22} />
                  )}
                </div>
                <div>
                  <h2>{formatCurrency(profitLossData.netProfit)}</h2>
                  <p>Net Calculated Profit</p>
                </div>
              </div>
            </div>

            <div className="pl-breakdown-card">
              <div className="pl-breakdown-header">
                <h3>Statement of Profit & Loss</h3>
                <span>
                  {fromDate && toDate
                    ? `${formatDate(fromDate)} — ${formatDate(toDate)}`
                    : "Consolidated Lifetime"}
                </span>
              </div>

              <div className="pl-breakdown-body">
                <div className="pl-line-item positive">
                  <span>Gross Sales Income (+)</span>
                  <strong>{formatCurrency(profitLossData.totalSales)}</strong>
                </div>

                <div className="pl-line-item negative">
                  <span>Less: Direct Cost of Goods / Purchases (-)</span>
                  <strong>
                    - {formatCurrency(profitLossData.totalPurchase)}
                  </strong>
                </div>

                <div className="pl-line-subtotal">
                  <span>Gross Operating Margin</span>
                  <strong
                    className={
                      profitLossData.grossProfit >= 0
                        ? "text-green"
                        : "text-red"
                    }
                  >
                    {formatCurrency(profitLossData.grossProfit)}
                  </strong>
                </div>

                <div className="pl-line-item negative">
                  <span>Less: Operating Overhead & Expenses (-)</span>
                  <strong>
                    - {formatCurrency(profitLossData.totalExpense)}
                  </strong>
                </div>

                <div className="pl-line-total">
                  <span>Net Bottom-Line Profit / (Loss)</span>
                  <strong
                    className={
                      profitLossData.netProfit >= 0 ? "text-green" : "text-red"
                    }
                  >
                    {formatCurrency(profitLossData.netProfit)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === "sales" && (
          <>
            <div className="reports-summary-grid">
              <div className="reports-summary-card card-blue">
                <div className="reports-summary-icon">
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h2>{salesData.summary?.totalInvoices || 0}</h2>
                  <p>Invoices Issued</p>
                </div>
              </div>

              <div className="reports-summary-card card-green">
                <div className="reports-summary-icon">
                  <IndianRupee size={22} />
                </div>
                <div>
                  <h2>{formatCurrency(salesData.summary?.totalSales)}</h2>
                  <p>Total Invoiced Value</p>
                </div>
              </div>

              <div className="reports-summary-card card-purple">
                <div className="reports-summary-icon">
                  <ArrowDownLeft size={22} />
                </div>
                <div>
                  <h2>{formatCurrency(salesData.summary?.totalPaid)}</h2>
                  <p>Settled Collections</p>
                </div>
              </div>

              <div className="reports-summary-card card-amber">
                <div className="reports-summary-icon">
                  <ArrowUpRight size={22} />
                </div>
                <div>
                  <h2>{formatCurrency(salesData.summary?.totalDue)}</h2>
                  <p>Outstanding Receivables</p>
                </div>
              </div>
            </div>

            <div className="reports-table-card">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th style={{ width: "13%" }}>Invoice #</th>
                    <th style={{ width: "11%" }}>Date</th>
                    <th style={{ width: "17%" }}>Customer</th>
                    <th style={{ width: "13%" }}>Store</th>
                    <th style={{ width: "12%" }}>Grand Total</th>
                    <th style={{ width: "13%" }}>Paid / Due</th>
                    <th style={{ width: "11%" }}>Status</th>
                    <th style={{ width: "10%" }}>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="reports-empty-row">
                        <RefreshCw size={20} className="reports-spin" />
                        <span>Loading sales ledger...</span>
                      </td>
                    </tr>
                  ) : salesData.invoices.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="reports-empty-row">
                        No sales invoices matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    salesData.invoices.map((inv) => (
                      <tr key={inv._id}>
                        <td>
                          <strong className="reports-code-badge">
                            {inv.invoiceNo}
                          </strong>
                        </td>
                        <td>{formatDate(inv.invoiceDate || inv.createdAt)}</td>
                        <td>
                          <div className="reports-cell-stack">
                            <strong>
                              {inv.customer?.customerName || "Walk-in Guest"}
                            </strong>
                            <small>{inv.customer?.phone || ""}</small>
                          </div>
                        </td>
                        <td>{inv.store?.storeName || "—"}</td>
                        <td>
                          <strong className="text-blue">
                            {formatCurrency(inv.grandTotal)}
                          </strong>
                        </td>
                        <td>
                          <div className="reports-cell-stack">
                            <span>Paid: {formatCurrency(inv.paidAmount)}</span>
                            <small className="text-amber">
                              Due: {formatCurrency(inv.dueAmount)}
                            </small>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              inv.paymentStatus === "Paid"
                                ? "paid"
                                : inv.paymentStatus === "Partial"
                                ? "partial"
                                : "pending"
                            }`}
                          >
                            {inv.paymentStatus || "Unpaid"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="reports-view-bill-btn"
                            title="Download Tax Invoice PDF"
                            onClick={() =>
                              handleDownloadSingleBillPDF(inv, "sales")
                            }
                          >
                            <Download size={13} /> PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "purchases" && (
          <>
            <div className="reports-summary-grid">
              <div className="reports-summary-card card-purple">
                <div className="reports-summary-icon">
                  <Package size={22} />
                </div>
                <div>
                  <h2>{purchaseData.summary?.totalPurchases || 0}</h2>
                  <p>Purchase Bills</p>
                </div>
              </div>

              <div className="reports-summary-card card-blue">
                <div className="reports-summary-icon">
                  <IndianRupee size={22} />
                </div>
                <div>
                  <h2>{formatCurrency(purchaseData.summary?.totalPurchase)}</h2>
                  <p>Total Purchase Billed</p>
                </div>
              </div>

              <div className="reports-summary-card card-green">
                <div className="reports-summary-icon">
                  <ArrowUpRight size={22} />
                </div>
                <div>
                  <h2>{formatCurrency(purchaseData.summary?.totalPaid)}</h2>
                  <p>Vendor Payments Paid</p>
                </div>
              </div>

              <div className="reports-summary-card card-amber">
                <div className="reports-summary-icon">
                  <ArrowDownLeft size={22} />
                </div>
                <div>
                  <h2>{formatCurrency(purchaseData.summary?.totalDue)}</h2>
                  <p>Payables Outstanding</p>
                </div>
              </div>
            </div>

            <div className="reports-table-card">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th style={{ width: "13%" }}>PO / Bill #</th>
                    <th style={{ width: "11%" }}>Date</th>
                    <th style={{ width: "17%" }}>Supplier</th>
                    <th style={{ width: "13%" }}>Store</th>
                    <th style={{ width: "12%" }}>Total Amount</th>
                    <th style={{ width: "13%" }}>Paid / Due</th>
                    <th style={{ width: "11%" }}>Status</th>
                    <th style={{ width: "10%" }}>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="reports-empty-row">
                        <RefreshCw size={20} className="reports-spin" />
                        <span>Loading purchase ledger...</span>
                      </td>
                    </tr>
                  ) : purchaseData.purchases.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="reports-empty-row">
                        No purchase bills matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    purchaseData.purchases.map((pur) => (
                      <tr key={pur._id}>
                        <td>
                          <strong className="reports-code-badge">
                            {pur.purchaseNo}
                          </strong>
                        </td>
                        <td>{formatDate(pur.purchaseDate || pur.createdAt)}</td>
                        <td>
                          <div className="reports-cell-stack">
                            <strong>
                              {pur.supplier?.supplierName || "—"}
                            </strong>
                            <small>{pur.supplier?.mobile || ""}</small>
                          </div>
                        </td>
                        <td>{pur.store?.storeName || "—"}</td>
                        <td>
                          <strong className="text-purple">
                            {formatCurrency(pur.grandTotal)}
                          </strong>
                        </td>
                        <td>
                          <div className="reports-cell-stack">
                            <span>Paid: {formatCurrency(pur.paidAmount)}</span>
                            <small className="text-amber">
                              Due: {formatCurrency(pur.dueAmount)}
                            </small>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              pur.paymentStatus === "Paid"
                                ? "paid"
                                : pur.paymentStatus === "Partial"
                                ? "partial"
                                : "pending"
                            }`}
                          >
                            {pur.paymentStatus || "Unpaid"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="reports-view-bill-btn"
                            title="Download Purchase Bill PDF"
                            onClick={() =>
                              handleDownloadSingleBillPDF(pur, "purchase")
                            }
                          >
                            <Download size={13} /> PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
        {activeTab === "stock" && (
          <>
            <div className="reports-summary-grid">
              <div className="reports-summary-card card-blue">
                <div className="reports-summary-icon">
                  <Layers size={22} />
                </div>
                <div>
                  <h2>{stockData.summary?.totalTransactions || 0}</h2>
                  <p>Stock Movements</p>
                </div>
              </div>

              <div className="reports-summary-card card-green">
                <div className="reports-summary-icon">
                  <ArrowDownLeft size={22} />
                </div>
                <div>
                  <h2>+{stockData.summary?.totalInward || 0} units</h2>
                  <p>Inward Inventory</p>
                </div>
              </div>

              <div className="reports-summary-card card-amber">
                <div className="reports-summary-icon">
                  <ArrowUpRight size={22} />
                </div>
                <div>
                  <h2>-{stockData.summary?.totalOutward || 0} units</h2>
                  <p>Outward Dispatch</p>
                </div>
              </div>

              <div className="reports-summary-card card-purple">
                <div className="reports-summary-icon">
                  <Package size={22} />
                </div>
                <div>
                  <h2>
                    {(stockData.summary?.totalInward || 0) -
                      (stockData.summary?.totalOutward || 0)}{" "}
                    units
                  </h2>
                  <p>Net Quantity Balance</p>
                </div>
              </div>
            </div>

            <div className="reports-table-card">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th style={{ width: "13%" }}>Txn Ref</th>
                    <th style={{ width: "12%" }}>Date</th>
                    <th style={{ width: "22%" }}>Product Details</th>
                    <th style={{ width: "14%" }}>Location</th>
                    <th style={{ width: "13%" }}>Movement Type</th>
                    <th style={{ width: "12%" }}>Quantity</th>
                    <th style={{ width: "14%" }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="reports-empty-row">
                        <RefreshCw size={20} className="reports-spin" />
                        <span>Loading stock movements...</span>
                      </td>
                    </tr>
                  ) : stockData.stock.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="reports-empty-row">
                        No stock records found for this period.
                      </td>
                    </tr>
                  ) : (
                    stockData.stock.map((stk) => (
                      <tr key={stk._id}>
                        <td>
                          <strong className="reports-code-badge">
                            {stk.transactionNo || "—"}
                          </strong>
                        </td>
                        <td>{formatDate(stk.createdAt)}</td>
                        <td>
                          <div className="reports-cell-stack">
                            <strong>{stk.product?.productName || "—"}</strong>
                            <small>{stk.variant?.skuCode || ""}</small>
                          </div>
                        </td>
                        <td>
                          {stk.store?.storeName ||
                            stk.warehouse?.warehouseName ||
                            "—"}
                        </td>
                        <td>
                          <span className="reports-type-tag">
                            {stk.transactionType}
                          </span>
                        </td>
                        <td>
                          <strong
                            className={
                              stk.quantity > 0 ? "text-green" : "text-red"
                            }
                          >
                            {stk.quantity > 0
                              ? `+${stk.quantity}`
                              : stk.quantity}
                          </strong>
                        </td>
                        <td>
                          <span className="font-semibold">
                            {stk.balanceQuantity ?? "—"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "expenses" && (
          <>
            <div className="reports-summary-grid">
              <div className="reports-summary-card card-amber">
                <div className="reports-summary-icon">
                  <IndianRupee size={22} />
                </div>
                <div>
                  <h2>{formatCurrency(expenseData.summary?.totalExpense)}</h2>
                  <p>Total Recorded Expenses</p>
                </div>
              </div>

              <div className="reports-summary-card card-blue">
                <div className="reports-summary-icon">
                  <Receipt size={22} />
                </div>
                <div>
                  <h2>{expenseData.summary?.totalRecords || 0}</h2>
                  <p>Expense Entries</p>
                </div>
              </div>
            </div>

            <div className="reports-table-card">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th style={{ width: "15%" }}>Voucher #</th>
                    <th style={{ width: "13%" }}>Date</th>
                    <th style={{ width: "18%" }}>Category</th>
                    <th style={{ width: "16%" }}>Store</th>
                    <th style={{ width: "14%" }}>Payment Mode</th>
                    <th style={{ width: "24%" }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="reports-empty-row">
                        <RefreshCw size={20} className="reports-spin" />
                        <span>Loading expense audit logs...</span>
                      </td>
                    </tr>
                  ) : expenseData.expenses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="reports-empty-row">
                        No expense records found.
                      </td>
                    </tr>
                  ) : (
                    expenseData.expenses.map((exp) => (
                      <tr key={exp._id}>
                        <td>
                          <strong className="reports-code-badge">
                            {exp.expenseNumber || exp.expenseNo || "—"}
                          </strong>
                        </td>
                        <td>{formatDate(exp.expenseDate || exp.createdAt)}</td>
                        <td>
                          <strong>{exp.expenseCategory || "—"}</strong>
                        </td>
                        <td>{exp.store?.storeName || "—"}</td>
                        <td>{exp.paymentMethod || "Cash"}</td>
                        <td>
                          <strong className="text-amber">
                            {formatCurrency(exp.totalAmount || exp.amount)}
                          </strong>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab !== "profit-loss" && pagination.totalPages > 1 && (
          <div className="reports-pagination">
            <span>
              Showing Page <strong>{pagination.page}</strong> of{" "}
              <strong>{pagination.totalPages}</strong> ({pagination.totalRecords}{" "}
              Records)
            </span>

            <div className="reports-page-btns">
              <button
                type="button"
                disabled={pagination.page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}