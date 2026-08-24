import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  CreditCard,
  Wallet,
  Banknote,
  CircleDollarSign,
  ArrowLeftRight,
  Eye,
} from "lucide-react";

import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
} from "../../../services/paymentService";

import { getCustomers } from "../../../services/customerService";
import { getSuppliers } from "../../../services/supplierService";
import { getStores } from "../../../services/storeService";
import { getSalesInvoices } from "../../../services/invoiceService";
import { getPurchases } from "../../../services/purchaseService";
import { getAllExpenses } from "../../../services/expenseService";

import "./Payments.css";

const PAYMENT_TYPES = [
  "Sales",
  "Purchase",
  "Expense",
  "Customer Payment",
  "Supplier Payment",
  "Advance",
  "Refund",
];

const PAYMENT_MODES = [
  "Cash",
  "Card",
  "UPI",
  "Bank Transfer",
  "Cheque",
  "Wallet",
];

const PAYMENT_STATUSES = [
  "Pending",
  "Partial",
  "Completed",
  "Failed",
  "Cancelled",
  "Refunded",
];

const emptyBankDetails = {
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  ifscCode: "",
  transactionId: "",
  chequeNumber: "",
  upiId: "",
  cardLastFourDigit: "",
  branchName: "",
};

const createEmptyForm = () => ({
  paymentType: "Sales",
  paymentMode: "Cash",
  invoice: "",
  purchase: "",
  expense: "",
  customer: "",
  supplier: "",
  amount: "",
  paidAmount: "",
  transactionDate: new Date().toISOString().slice(0, 10),
  bankDetails: { ...emptyBankDetails },
  remarks: "",
  store: "",
});

const getId = (item) => {
  if (!item) return "";

  if (typeof item === "string") {
    return item;
  }

  return item._id || item.id || "";
};

const getArrayData = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.data?.results)) {
    return response.data.results;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  if (Array.isArray(response.data?.docs)) {
    return response.data.docs;
  }

  if (Array.isArray(response.docs)) {
    return response.docs;
  }

  return [];
};

const getResponseObject = (response) => {
  if (!response) return null;

  return response.data?.data || response.data || response;
};

export default function Payment() {
  const [payments, setPayments] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stores, setStores] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [masterLoading, setMasterLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [viewingPayment, setViewingPayment] = useState(null);

  const [form, setForm] = useState(createEmptyForm());

  const loadPayments = async () => {
    try {
      setLoading(true);

      const response = await getAllPayments({
        search: search || undefined,
        paymentType: paymentType || undefined,
        paymentMode: paymentMode || undefined,
        paymentStatus: paymentStatus || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      const paymentData = getArrayData(response);

      setPayments(paymentData);
    } catch (error) {
      console.error("Load payments error:", error);

      alert(error?.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const loadMasterData = async () => {
    try {
      setMasterLoading(true);

      const results = await Promise.allSettled([
        getCustomers(),
        getSuppliers(),
        getStores(),
        getSalesInvoices(),
        getPurchases(),
        getAllExpenses(),
      ]);

      if (results[0].status === "fulfilled") {
        const data = getArrayData(results[0].value);

        console.log("Customers loaded:", data);

        setCustomers(data);
      } else {
        console.error("Customers loading failed:", results[0].reason);

        setCustomers([]);
      }

      if (results[1].status === "fulfilled") {
        const data = getArrayData(results[1].value);

        console.log("Suppliers loaded:", data);

        setSuppliers(data);
      } else {
        console.error("Suppliers loading failed:", results[1].reason);

        setSuppliers([]);
      }

      if (results[2].status === "fulfilled") {
        const data = getArrayData(results[2].value);

        console.log("Stores loaded:", data);

        setStores(data);
      } else {
        console.error("Stores loading failed:", results[2].reason);

        setStores([]);
      }

      if (results[3].status === "fulfilled") {
        const data = getArrayData(results[3].value);

        console.log("Sales invoices loaded:", data);

        setInvoices(data);
      } else {
        console.error("Sales invoices loading failed:", results[3].reason);

        setInvoices([]);
      }

      if (results[4].status === "fulfilled") {
        const data = getArrayData(results[4].value);

        console.log("Purchases loaded:", data);

        setPurchases(data);
      } else {
        console.error("Purchases loading failed:", results[4].reason);

        setPurchases([]);
      }

      if (results[5].status === "fulfilled") {
        const data = getArrayData(results[5].value);

        console.log("Expenses loaded:", data);

        setExpenses(data);
      } else {
        console.error("Expenses loading failed:", results[5].reason);

        setExpenses([]);
      }
    } catch (error) {
      console.error("Master data loading error:", error);
    } finally {
      setMasterLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPayments();
    }, 400);

    return () => clearTimeout(timer);
  }, [search, paymentType, paymentMode, paymentStatus, fromDate, toDate]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateBankField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value,
      },
    }));
  };

  const amount = Number(form.amount || 0);
  const paidAmount = Number(form.paidAmount || 0);

  const balanceAmount = Math.max(amount - paidAmount, 0);

  const returnAmount = Math.max(paidAmount - amount, 0);

  const summary = useMemo(() => {
    const completed = payments.filter(
      (p) => p.paymentStatus === "Completed",
    ).length;

    const partial = payments.filter(
      (p) => p.paymentStatus === "Partial",
    ).length;

    const totalAmount = payments.reduce(
      (sum, p) => sum + Number(p.paidAmount || 0),
      0,
    );

    return {
      completed,
      partial,
      totalAmount,
    };
  }, [payments]);

  const openCreate = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setModalOpen(true);
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const openEdit = async (id) => {
    try {
      setSaving(true);

      const response = await getPaymentById(id);

      const payment = getResponseObject(response);

      if (!payment) {
        throw new Error("Payment data not found");
      }

      setEditingId(id);

      setForm({
        paymentType: payment.paymentType || "Sales",

        paymentMode: payment.paymentMode || "Cash",

        invoice: getId(payment.invoice),

        purchase: getId(payment.purchase),

        expense: getId(payment.expense),

        customer: getId(payment.customer),

        supplier: getId(payment.supplier),

        amount: payment.amount ?? "",

        paidAmount: payment.paidAmount ?? "",

        transactionDate: payment.transactionDate
          ? new Date(payment.transactionDate).toISOString().slice(0, 10)
          : "",

        bankDetails: {
          ...emptyBankDetails,
          ...(payment.bankDetails || {}),
        },

        remarks: payment.remarks || "",

        store: getId(payment.store),
      });

      setModalOpen(true);
    } catch (error) {
      console.error("Load payment error:", error);

      alert(error?.response?.data?.message || "Unable to load payment");
    } finally {
      setSaving(false);
    }
  };

  const openView = async (id) => {
    try {
      const response = await getPaymentById(id);

      const payment = getResponseObject(response);

      setViewingPayment(payment);
      setViewOpen(true);
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Unable to load payment");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?",
    );

    if (!confirmed) return;

    try {
      await deletePayment(id);

      alert("Payment deleted successfully");

      await loadPayments();
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Failed to delete payment");
    }
  };

  const validateForm = () => {
    if (!form.paymentType) {
      alert("Payment Type is required");
      return false;
    }

    if (!form.paymentMode) {
      alert("Payment Mode is required");
      return false;
    }

    if (!form.store) {
      alert("Store is required");
      return false;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      alert("Amount must be greater than zero");
      return false;
    }

    if (
      form.paidAmount === "" ||
      form.paidAmount === null ||
      form.paidAmount === undefined
    ) {
      alert("Paid Amount is required");
      return false;
    }

    if (Number(form.paidAmount) < 0) {
      alert("Paid Amount cannot be negative");
      return false;
    }

    if (Number(form.paidAmount) > Number(form.amount)) {
      alert("Paid Amount cannot be greater than Amount");
      return false;
    }

    if (form.paymentType === "Sales" && !form.invoice) {
      alert("Sales Invoice is required");
      return false;
    }

    if (form.paymentType === "Purchase" && !form.purchase) {
      alert("Purchase is required");
      return false;
    }

    if (
      form.paymentType === "Purchase" ||
      form.paymentType === "Supplier Payment"
    ) {
      if (!form.supplier) {
        alert("Supplier is required");
        return false;
      }
    }

    if (form.paymentType === "Expense" && !form.expense) {
      alert("Expense is required");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        paymentType: form.paymentType,

        paymentMode: form.paymentMode,

        invoice: form.invoice || undefined,

        purchase: form.purchase || undefined,

        expense: form.expense || undefined,

        customer: form.customer || undefined,

        supplier: form.supplier || undefined,

        amount: Number(form.amount),

        paidAmount: Number(form.paidAmount),

        transactionDate: form.transactionDate || undefined,

        bankDetails: form.bankDetails,

        remarks: form.remarks,

        store: form.store || undefined,
      };

      console.log("Payment payload:", payload);

      if (editingId) {
        await updatePayment(editingId, payload);

        alert("Payment updated successfully");
      } else {
        await createPayment(payload);

        alert("Payment created successfully");
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(createEmptyForm());

      await loadPayments();
    } catch (error) {
      console.error("Save payment error:", error);

      alert(error?.response?.data?.message || "Failed to save payment");
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setPaymentType("");
    setPaymentMode("");
    setPaymentStatus("");
    setFromDate("");
    setToDate("");
  };

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("en-IN");
  };

  const getCustomerName = (customer) => {
    if (!customer) return "-";

    if (typeof customer === "object") {
      return (
        customer.customerName || customer.name || customer.customerCode || "-"
      );
    }

    const found = customers.find((c) => getId(c) === customer);

    return found?.customerName || found?.name || found?.customerCode || "-";
  };

  const getSupplierName = (supplier) => {
    if (!supplier) return "-";

    if (typeof supplier === "object") {
      return (
        supplier.supplierName || supplier.name || supplier.supplierCode || "-"
      );
    }

    const found = suppliers.find((s) => getId(s) === supplier);

    return found?.supplierName || found?.name || found?.supplierCode || "-";
  };

  const getStoreName = (store) => {
    if (!store) return "-";

    if (typeof store === "object") {
      return store.storeName || store.storeCode || store.name || "-";
    }

    const found = stores.find((s) => getId(s) === store);

    return found?.storeName || found?.storeCode || found?.name || "-";
  };

  const handlePaymentTypeChange = (value) => {
    setForm((prev) => ({
      ...prev,

      paymentType: value,

      invoice: "",
      purchase: "",
      expense: "",

      customer:
        value === "Sales" ||
        value === "Customer Payment" ||
        value === "Advance" ||
        value === "Refund"
          ? prev.customer
          : "",

      supplier:
        value === "Purchase" || value === "Supplier Payment"
          ? prev.supplier
          : "",
    }));
  };

  const showBankDetails = form.paymentMode === "Bank Transfer";

  const showCheque = form.paymentMode === "Cheque";

  const showUPI = form.paymentMode === "UPI";

  const showCard = form.paymentMode === "Card";

  return (
    <div className="payment-page">
      <div className="payment-content">
        <div className="payment-page-header">
          <div>
            <h2>Payments</h2>

            <p>Manage customer, supplier and business payments</p>
          </div>

          <button className="payment-primary-btn" onClick={openCreate}>
            <Plus size={18} />
            New Payment
          </button>
        </div>

        <div className="payment-summary-grid">
          <div className="payment-summary-card card-blue">
            <div className="payment-summary-icon">
              <CreditCard size={22} />
            </div>

            <div>
              <h2>{payments.length}</h2>
              <p>Total Payments</p>
            </div>
          </div>

          <div className="payment-summary-card card-green">
            <div className="payment-summary-icon">
              <CircleDollarSign size={22} />
            </div>

            <div>
              <h2>{formatCurrency(summary.totalAmount)}</h2>

              <p>Paid Amount</p>
            </div>
          </div>

          <div className="payment-summary-card card-purple">
            <div className="payment-summary-icon">
              <ArrowLeftRight size={22} />
            </div>

            <div>
              <h2>{summary.completed}</h2>

              <p>Completed</p>
            </div>
          </div>

          <div className="payment-summary-card card-amber">
            <div className="payment-summary-icon">
              <Wallet size={22} />
            </div>

            <div>
              <h2>{summary.partial}</h2>

              <p>Partial Payments</p>
            </div>
          </div>
        </div>

        <div className="payment-toolbar">
          <div className="payment-search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search payment number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                className="payment-clear-search"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="payment-filter-select"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="">All Payment Types</option>

            {PAYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            className="payment-filter-select"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="">All Modes</option>

            {PAYMENT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>

          <select
            className="payment-filter-select"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            <option value="">All Status</option>

            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="payment-date-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            type="date"
            className="payment-date-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          {(search ||
            paymentType ||
            paymentMode ||
            paymentStatus ||
            fromDate ||
            toDate) && (
            <button className="payment-clear-btn" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>

        <div className="payment-table-card">
          <div className="payment-table-heading">
            <div>
              <h3>Payment Transactions</h3>

              <span>
                {payments.length} payment
                {payments.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="payment-loading-state">
              <RefreshCw size={20} className="payment-spin" />
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="payment-empty-state">
              <Banknote size={44} />

              <h3>No payments found</h3>

              <p>Create your first payment to see it here.</p>

              <button className="payment-primary-btn" onClick={openCreate}>
                <Plus size={16} />
                Create Payment
              </button>
            </div>
          ) : (
            <div className="payment-table-wrapper">
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Payment No</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Customer / Supplier</th>
                    <th>Mode</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => {
                    const id = payment._id || payment.id;

                    const party = payment.customer
                      ? getCustomerName(payment.customer)
                      : payment.supplier
                        ? getSupplierName(payment.supplier)
                        : "-";

                    return (
                      <tr key={id}>
                        <td>
                          <span className="payment-number">
                            {payment.paymentNumber}
                          </span>
                        </td>

                        <td>{formatDate(payment.transactionDate)}</td>

                        <td>
                          <span className="payment-type-pill">
                            {payment.paymentType}
                          </span>
                        </td>

                        <td className="payment-party-cell" title={party}>
                          {party}
                        </td>

                        <td>
                          <span className="payment-mode-pill">
                            {payment.paymentMode}
                          </span>
                        </td>

                        <td>{formatCurrency(payment.amount)}</td>

                        <td className="payment-paid">
                          {formatCurrency(payment.paidAmount)}
                        </td>

                        <td>
                          <span
                            className={`payment-status-pill payment-status-${String(
                              payment.paymentStatus || "",
                            )
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {payment.paymentStatus}
                          </span>
                        </td>

                        <td>
                          <div className="payment-action-btns">
                            <button
                              className="payment-view-btn"
                              title="View"
                              onClick={() => openView(id)}
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              className="payment-edit-btn"
                              title="Edit"
                              onClick={() => openEdit(id)}
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              className="payment-delete-btn"
                              title="Delete"
                              onClick={() => handleDelete(id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-header">
              <div>
                <h3>{editingId ? "Edit Payment" : "Create Payment"}</h3>

                <p>Enter payment transaction details</p>
              </div>

              <button
                className="payment-close-btn"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <div className="payment-modal-body">
              <div className="payment-section-title">Payment Details</div>

              <div className="payment-form-grid">
                <div className="payment-form-group">
                  <label>Payment Type *</label>

                  <select
                    value={form.paymentType}
                    onChange={(e) => handlePaymentTypeChange(e.target.value)}
                  >
                    {PAYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="payment-form-group">
                  <label>Payment Mode *</label>

                  <select
                    value={form.paymentMode}
                    onChange={(e) => updateField("paymentMode", e.target.value)}
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="payment-form-group">
                  <label>Transaction Date *</label>

                  <input
                    type="date"
                    value={form.transactionDate}
                    onChange={(e) =>
                      updateField("transactionDate", e.target.value)
                    }
                  />
                </div>

                <div className="payment-form-group">
                  <label>Store *</label>

                  <select
                    value={form.store}
                    onChange={(e) => updateField("store", e.target.value)}
                  >
                    <option value="">
                      {masterLoading ? "Loading stores..." : "Select Store"}
                    </option>

                    {stores.map((store) => (
                      <option key={getId(store)} value={getId(store)}>
                        {store.storeName ||
                          store.name ||
                          store.storeCode ||
                          getId(store)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.paymentType === "Sales" && (
                <>
                  <div className="payment-section-title">Sales Details</div>

                  <div className="payment-form-grid">
                    <div className="payment-form-group">
                      <label>Sales Invoice *</label>

                      <select
                        value={form.invoice}
                        onChange={(e) => updateField("invoice", e.target.value)}
                      >
                        <option value="">
                          {masterLoading
                            ? "Loading invoices..."
                            : "Select Invoice"}
                        </option>

                        {invoices.map((invoice) => (
                          <option key={getId(invoice)} value={getId(invoice)}>
                            {invoice.invoiceNo ||
                              invoice.invoiceNumber ||
                              invoice.invoice_code ||
                              getId(invoice)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="payment-form-group">
                      <label>Customer</label>

                      <select
                        value={form.customer}
                        onChange={(e) =>
                          updateField("customer", e.target.value)
                        }
                      >
                        <option value="">
                          {masterLoading
                            ? "Loading customers..."
                            : "Select Customer"}
                        </option>

                        {customers.map((customer) => (
                          <option key={getId(customer)} value={getId(customer)}>
                            {customer.customerName ||
                              customer.name ||
                              customer.customerCode ||
                              getId(customer)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {form.paymentType === "Purchase" && (
                <>
                  <div className="payment-section-title">Purchase Details</div>

                  <div className="payment-form-grid">
                    <div className="payment-form-group">
                      <label>Purchase *</label>

                      <select
                        value={form.purchase}
                        onChange={(e) =>
                          updateField("purchase", e.target.value)
                        }
                      >
                        <option value="">
                          {masterLoading
                            ? "Loading purchases..."
                            : "Select Purchase"}
                        </option>

                        {purchases.map((purchase) => (
                          <option key={getId(purchase)} value={getId(purchase)}>
                            {purchase.purchaseNo ||
                              purchase.purchaseNumber ||
                              getId(purchase)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="payment-form-group">
                      <label>Supplier *</label>

                      <select
                        value={form.supplier}
                        onChange={(e) =>
                          updateField("supplier", e.target.value)
                        }
                      >
                        <option value="">
                          {masterLoading
                            ? "Loading suppliers..."
                            : "Select Supplier"}
                        </option>

                        {suppliers.map((supplier) => (
                          <option key={getId(supplier)} value={getId(supplier)}>
                            {supplier.supplierName ||
                              supplier.name ||
                              supplier.supplierCode ||
                              getId(supplier)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {form.paymentType === "Expense" && (
                <>
                  <div className="payment-section-title">Expense Details</div>

                  <div className="payment-form-grid">
                    <div className="payment-form-group">
                      <label>Expense *</label>

                      <select
                        value={form.expense}
                        onChange={(e) => updateField("expense", e.target.value)}
                      >
                        <option value="">
                          {masterLoading
                            ? "Loading expenses..."
                            : "Select Expense"}
                        </option>

                        {expenses.map((expense) => (
                          <option key={getId(expense)} value={getId(expense)}>
                            {expense.expenseNumber ||
                              expense.expenseTitle ||
                              expense.title ||
                              getId(expense)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {(form.paymentType === "Customer Payment" ||
                form.paymentType === "Advance" ||
                form.paymentType === "Refund") && (
                <>
                  <div className="payment-section-title">Customer Details</div>

                  <div className="payment-form-grid">
                    <div className="payment-form-group">
                      <label>Customer</label>

                      <select
                        value={form.customer}
                        onChange={(e) =>
                          updateField("customer", e.target.value)
                        }
                      >
                        <option value="">
                          {masterLoading
                            ? "Loading customers..."
                            : "Select Customer"}
                        </option>

                        {customers.map((customer) => (
                          <option key={getId(customer)} value={getId(customer)}>
                            {customer.customerName ||
                              customer.name ||
                              customer.customerCode ||
                              getId(customer)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {form.paymentType === "Supplier Payment" && (
                <>
                  <div className="payment-section-title">Supplier Details</div>

                  <div className="payment-form-grid">
                    <div className="payment-form-group">
                      <label>Supplier *</label>

                      <select
                        value={form.supplier}
                        onChange={(e) =>
                          updateField("supplier", e.target.value)
                        }
                      >
                        <option value="">
                          {masterLoading
                            ? "Loading suppliers..."
                            : "Select Supplier"}
                        </option>

                        {suppliers.map((supplier) => (
                          <option key={getId(supplier)} value={getId(supplier)}>
                            {supplier.supplierName ||
                              supplier.name ||
                              supplier.supplierCode ||
                              getId(supplier)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="payment-section-title">Amount Details</div>

              <div className="payment-form-grid">
                <div className="payment-form-group">
                  <label>Amount *</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                  />
                </div>

                <div className="payment-form-group">
                  <label>Paid Amount *</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.paidAmount}
                    onChange={(e) => updateField("paidAmount", e.target.value)}
                  />
                </div>
              </div>

              <div className="payment-calculation-card">
                <div>
                  <span>Amount</span>

                  <strong>{formatCurrency(amount)}</strong>
                </div>

                <div>
                  <span>Paid</span>

                  <strong>{formatCurrency(paidAmount)}</strong>
                </div>

                <div>
                  <span>Balance</span>

                  <strong className="payment-balance-value">
                    {formatCurrency(balanceAmount)}
                  </strong>
                </div>

                <div>
                  <span>Return</span>

                  <strong className="payment-return-value">
                    {formatCurrency(returnAmount)}
                  </strong>
                </div>
              </div>

              {(showBankDetails || showCheque || showUPI || showCard) && (
                <>
                  <div className="payment-section-title">
                    Payment Mode Details
                  </div>

                  <div className="payment-form-grid">
                    {(showBankDetails || showCheque) && (
                      <>
                        <div className="payment-form-group">
                          <label>Bank Name</label>

                          <input
                            type="text"
                            value={form.bankDetails.bankName}
                            onChange={(e) =>
                              updateBankField("bankName", e.target.value)
                            }
                          />
                        </div>

                        <div className="payment-form-group">
                          <label>Account Holder</label>

                          <input
                            type="text"
                            value={form.bankDetails.accountHolder}
                            onChange={(e) =>
                              updateBankField("accountHolder", e.target.value)
                            }
                          />
                        </div>

                        <div className="payment-form-group">
                          <label>Account Number</label>

                          <input
                            type="text"
                            value={form.bankDetails.accountNumber}
                            onChange={(e) =>
                              updateBankField("accountNumber", e.target.value)
                            }
                          />
                        </div>

                        <div className="payment-form-group">
                          <label>IFSC Code</label>

                          <input
                            type="text"
                            value={form.bankDetails.ifscCode}
                            onChange={(e) =>
                              updateBankField("ifscCode", e.target.value)
                            }
                          />
                        </div>

                        {showBankDetails && (
                          <div className="payment-form-group">
                            <label>Transaction ID</label>

                            <input
                              type="text"
                              value={form.bankDetails.transactionId}
                              onChange={(e) =>
                                updateBankField("transactionId", e.target.value)
                              }
                            />
                          </div>
                        )}

                        {showCheque && (
                          <div className="payment-form-group">
                            <label>Cheque Number</label>

                            <input
                              type="text"
                              value={form.bankDetails.chequeNumber}
                              onChange={(e) =>
                                updateBankField("chequeNumber", e.target.value)
                              }
                            />
                          </div>
                        )}

                        <div className="payment-form-group">
                          <label>Branch Name</label>

                          <input
                            type="text"
                            value={form.bankDetails.branchName}
                            onChange={(e) =>
                              updateBankField("branchName", e.target.value)
                            }
                          />
                        </div>
                      </>
                    )}

                    {showUPI && (
                      <div className="payment-form-group">
                        <label>UPI ID</label>

                        <input
                          type="text"
                          placeholder="example@upi"
                          value={form.bankDetails.upiId}
                          onChange={(e) =>
                            updateBankField("upiId", e.target.value)
                          }
                        />
                      </div>
                    )}

                    {showCard && (
                      <div className="payment-form-group">
                        <label>Card Last 4 Digits</label>

                        <input
                          type="text"
                          maxLength={4}
                          placeholder="1234"
                          value={form.bankDetails.cardLastFourDigit}
                          onChange={(e) =>
                            updateBankField("cardLastFourDigit", e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="payment-section-title">
                Additional Information
              </div>

              <div className="payment-form-grid">
                <div className="payment-form-group payment-form-group-full">
                  <label>Remarks</label>

                  <textarea
                    rows="3"
                    placeholder="Enter remarks..."
                    value={form.remarks}
                    onChange={(e) => updateField("remarks", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="payment-modal-footer">
              <button
                className="payment-cancel-btn"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="payment-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw size={16} className="payment-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />

                    {editingId ? "Update Payment" : "Save Payment"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewOpen && viewingPayment && (
        <div className="payment-modal-overlay">
          <div className="payment-view-modal">
            <div className="payment-modal-header">
              <div>
                <h3>Payment Details</h3>

                <p>{viewingPayment.paymentNumber}</p>
              </div>

              <button
                className="payment-close-btn"
                onClick={() => setViewOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="payment-view-body">
              <div className="payment-detail-grid">
                <div>
                  <span>Payment Number</span>

                  <strong>{viewingPayment.paymentNumber}</strong>
                </div>

                <div>
                  <span>Payment Type</span>

                  <strong>{viewingPayment.paymentType}</strong>
                </div>

                <div>
                  <span>Payment Mode</span>

                  <strong>{viewingPayment.paymentMode}</strong>
                </div>

                <div>
                  <span>Transaction Date</span>

                  <strong>{formatDate(viewingPayment.transactionDate)}</strong>
                </div>

                <div>
                  <span>Amount</span>

                  <strong>{formatCurrency(viewingPayment.amount)}</strong>
                </div>

                <div>
                  <span>Paid Amount</span>

                  <strong>{formatCurrency(viewingPayment.paidAmount)}</strong>
                </div>

                <div>
                  <span>Balance Amount</span>

                  <strong>
                    {formatCurrency(viewingPayment.balanceAmount)}
                  </strong>
                </div>

                <div>
                  <span>Return Amount</span>

                  <strong>{formatCurrency(viewingPayment.returnAmount)}</strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong>{viewingPayment.paymentStatus}</strong>
                </div>

                <div>
                  <span>Store</span>

                  <strong>{getStoreName(viewingPayment.store)}</strong>
                </div>

                <div>
                  <span>Customer</span>

                  <strong>
                    {viewingPayment.customer
                      ? getCustomerName(viewingPayment.customer)
                      : "-"}
                  </strong>
                </div>

                <div>
                  <span>Supplier</span>

                  <strong>
                    {viewingPayment.supplier
                      ? getSupplierName(viewingPayment.supplier)
                      : "-"}
                  </strong>
                </div>
              </div>

              {viewingPayment.remarks && (
                <div className="payment-remarks-box">
                  <span>Remarks</span>

                  <p>{viewingPayment.remarks}</p>
                </div>
              )}
            </div>

            <div className="payment-modal-footer">
              <button
                className="payment-cancel-btn"
                onClick={() => setViewOpen(false)}
              >
                Close
              </button>

              <button
                className="payment-save-btn"
                onClick={() => {
                  setViewOpen(false);

                  openEdit(viewingPayment._id || viewingPayment.id);
                }}
              >
                <Edit size={16} />
                Edit Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
