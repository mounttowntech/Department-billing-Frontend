import React, { useEffect, useMemo, useState } from "react";
import {
  Receipt,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  Calendar,
  CheckCheck,
  Ban,
  Repeat,
} from "lucide-react";

import {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  getExpenseSummary,
} from "../../services/expenseService";

import { getStores } from "../../services/storeService";
import { getSuppliers } from "../../services/supplierService";
import "./Expenses.css";

const EXPENSE_CATEGORIES = [
  "Store Rent",
  "Electricity & Utilities",
  "Staff Salary & Wages",
  "Logistics & Freight",
  "Maintenance & Repairs",
  "Office Supplies",
  "Packaging & Consumables",
  "Marketing & Ads",
  "Tea & Refreshments",
  "Miscellaneous",
];

const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Card",
  "Bank Transfer",
  "Cheque",
  "Wallet",
];

const RECURRING_FREQUENCIES = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Yearly",
];

const generateExpenseNumber = () => {
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `EXP-${randomSuffix}`;
};

const emptyForm = {
  expenseNumber: "",
  expenseCategory: "Store Rent",
  expenseDate: new Date().toISOString().split("T")[0],
  store: "",
  supplier: "",
  amount: "",
  taxAmount: 0,
  paymentMethod: "UPI",
  receiptNumber: "",
  description: "",
  isRecurring: false,
  frequency: "Monthly",
  nextDueDate: "",
};

export default function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [stores, setStores] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

 
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadMasterData = async () => {
    try {
      const [storesRes, suppliersRes] = await Promise.allSettled([
        getStores(),
        getSuppliers ? getSuppliers() : Promise.resolve({ data: [] }),
      ]);

      if (storesRes.status === "fulfilled") {
        const data =
          storesRes.value?.data?.data ||
          storesRes.value?.data?.stores ||
          storesRes.value?.data ||
          storesRes.value?.stores ||
          [];
        setStores(Array.isArray(data) ? data : []);
      }

      if (suppliersRes.status === "fulfilled") {
        const data =
          suppliersRes.value?.data?.data ||
          suppliersRes.value?.data?.suppliers ||
          suppliersRes.value?.data ||
          suppliersRes.value?.suppliers ||
          [];
        setSuppliers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Master Data Load Error:", error);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (search) params.search = search;
      if (storeFilter) params.store = storeFilter;
      if (approvalFilter) params.approvalStatus = approvalFilter;
      if (paymentFilter) params.paymentMethod = paymentFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await getAllExpenses(params);

      const rawList =
        res?.data?.data ||
        res?.data?.expenses ||
        res?.data ||
        res?.expenses ||
        res ||
        [];

      setExpenses(Array.isArray(rawList) ? rawList : []);
    } catch (error) {
      console.error("Load Expenses Error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load expenses list"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [storeFilter, approvalFilter, paymentFilter, fromDate, toDate]);

  const getStoreName = (storeField) => {
    if (!storeField) return "—";
    if (typeof storeField === "object" && storeField !== null) {
      return storeField.storeName || storeField.name || "—";
    }
    const matched = stores.find(
      (s) => String(s._id || s.id) === String(storeField)
    );
    return matched?.storeName || matched?.name || storeField;
  };

  const getSupplierName = (suppField) => {
    if (!suppField) return "—";
    if (typeof suppField === "object" && suppField !== null) {
      return suppField.supplierName || suppField.name || "—";
    }
    const matched = suppliers.find(
      (s) => String(s._id || s.id) === String(suppField)
    );
    return matched?.supplierName || matched?.name || suppField;
  };

  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const clearFilters = () => {
    setSearch("");
    setStoreFilter("");
    setApprovalFilter("");
    setPaymentFilter("");
    setFromDate("");
    setToDate("");
  };

  const filteredExpenses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return expenses;

    return expenses.filter((e) => {
      const expNo = String(e.expenseNumber || "").toLowerCase();
      const cat = String(e.expenseCategory || "").toLowerCase();
      const receipt = String(e.receiptNumber || "").toLowerCase();
      const storeName = getStoreName(e.store).toLowerCase();
      const suppName = getSupplierName(e.supplier).toLowerCase();

      return (
        expNo.includes(term) ||
        cat.includes(term) ||
        receipt.includes(term) ||
        storeName.includes(term) ||
        suppName.includes(term)
      );
    });
  }, [expenses, search, stores, suppliers]);

  const summary = useMemo(() => {
    let totalSpend = 0;
    let approvedCount = 0;
    let pendingCount = 0;

    expenses.forEach((e) => {
      totalSpend += Number(e.totalAmount || e.amount || 0);
      if (e.approvalStatus === "Approved") approvedCount += 1;
      if (e.approvalStatus === "Pending" || !e.approvalStatus) pendingCount += 1;
    });

    return {
      totalEntries: expenses.length,
      totalSpend,
      approvedCount,
      pendingCount,
    };
  }, [expenses]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      expenseNumber: generateExpenseNumber(),
      store: stores[0]?._id || "",
    });
    setShowModal(true);
  };

  const openEditModal = async (expense) => {
    setEditingId(expense._id);
    try {
      const res = await getExpenseById(expense._id);
      const data = res?.data || res || expense;

      setForm({
        expenseNumber: data.expenseNumber || "",
        expenseCategory: data.expenseCategory || "Store Rent",
        expenseDate: data.expenseDate
          ? data.expenseDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        store: data.store?._id || data.store || "",
        supplier: data.supplier?._id || data.supplier || "",
        amount: data.amount ?? "",
        taxAmount: data.taxAmount ?? 0,
        paymentMethod: data.paymentMethod || "UPI",
        receiptNumber: data.receiptNumber || "",
        description: data.description || "",
        isRecurring: Boolean(data.recurring?.isRecurring),
        frequency: data.recurring?.frequency || "Monthly",
        nextDueDate: data.recurring?.nextDueDate
          ? data.recurring.nextDueDate.split("T")[0]
          : "",
      });
      setShowModal(true);
    } catch {
      setForm({
        expenseNumber: expense.expenseNumber || "",
        expenseCategory: expense.expenseCategory || "Store Rent",
        expenseDate: expense.expenseDate
          ? expense.expenseDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        store: expense.store?._id || expense.store || "",
        supplier: expense.supplier?._id || expense.supplier || "",
        amount: expense.amount ?? "",
        taxAmount: expense.taxAmount ?? 0,
        paymentMethod: expense.paymentMethod || "UPI",
        receiptNumber: expense.receiptNumber || "",
        description: expense.description || "",
        isRecurring: Boolean(expense.recurring?.isRecurring),
        frequency: expense.recurring?.frequency || "Monthly",
        nextDueDate: expense.recurring?.nextDueDate
          ? expense.recurring.nextDueDate.split("T")[0]
          : "",
      });
      setShowModal(true);
    }
  };

  const openViewModal = (expense) => {
    setViewingExpense(expense);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.expenseNumber.trim()) {
      alert("Expense number is required");
      return;
    }
    if (!form.store) {
      alert("Please select an assigned store");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      alert("Valid expense amount is required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        expenseNumber: form.expenseNumber.trim().toUpperCase(),
        expenseCategory: form.expenseCategory,
        expenseDate: form.expenseDate,
        store: form.store,
        supplier: form.supplier || undefined,
        amount: Number(form.amount),
        taxAmount: Number(form.taxAmount || 0),
        totalAmount: Number(form.amount) + Number(form.taxAmount || 0),
        paymentMethod: form.paymentMethod,
        receiptNumber: form.receiptNumber?.trim() || "",
        description: form.description?.trim() || "",
        recurring: {
          isRecurring: Boolean(form.isRecurring),
          frequency: form.frequency,
          nextDueDate: form.nextDueDate || undefined,
        },
      };

      if (editingId) {
        await updateExpense(editingId, payload);
        alert("Expense entry updated successfully");
      } else {
        await createExpense(payload);
        alert("Expense entry created successfully");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadExpenses();
    } catch (error) {
      console.error("Save Expense Error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save expense"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (expense) => {
    if (!window.confirm(`Approve expense ${expense.expenseNumber}?`)) return;

    try {
      setActionLoading(true);
      await approveExpense(expense._id);
      alert("Expense approved successfully");
      await loadExpenses();
    } catch (error) {
      console.error("Approve Expense Error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to approve expense"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (expense) => {
    if (!window.confirm(`Reject expense ${expense.expenseNumber}?`)) return;

    try {
      setActionLoading(true);
      await rejectExpense(expense._id);
      alert("Expense marked as rejected");
      await loadExpenses();
    } catch (error) {
      console.error("Reject Expense Error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reject expense"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (expense) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel/delete expense ${expense.expenseNumber}?`
      )
    )
      return;

    try {
      setActionLoading(true);
      await deleteExpense(expense._id);
      alert("Expense record removed successfully");
      await loadExpenses();
    } catch (error) {
      console.error("Delete Expense Error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete expense"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const computedTotal = Number(form.amount || 0) + Number(form.taxAmount || 0);

  return (
    <div className="expense-page">
      <div className="expense-content">

        <div className="expense-page-header">
          <div>
            <h2>Expense Management</h2>
            <p>
              Log operating costs, tax-adjusted outlays, and multi-tier approval
              audits
            </p>
          </div>

          <button className="expense-primary-btn" onClick={openCreateModal}>
            <Plus size={18} />
            Record Expense
          </button>
        </div>

        <div className="expense-toolbar">
          <div className="expense-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search expense #, category, receipt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="expense-clear-search"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="expense-filter-select"
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
          >
            <option value="">All Stores</option>
            {stores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.storeName || s.name}
              </option>
            ))}
          </select>

          <select
            className="expense-filter-select"
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
          >
            <option value="">All Approvals</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="expense-filter-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">All Payment Methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="expense-date-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            title="From Date"
          />

          <input
            type="date"
            className="expense-date-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            title="To Date"
          />

          {(search ||
            storeFilter ||
            approvalFilter ||
            paymentFilter ||
            fromDate ||
            toDate) && (
            <button
              type="button"
              className="expense-clear-btn"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}


        </div>
       <div className="expense-summary-grid">
          <div className="expense-summary-card card-amber">
            <div className="expense-summary-icon">
              <IndianRupee size={22} />
            </div>
            <div>
              <h2>{formatCurrency(summary.totalSpend)}</h2>
              <p>Total Recorded Outflow</p>
            </div>
          </div>

          <div className="expense-summary-card card-blue">
            <div className="expense-summary-icon">
              <Receipt size={22} />
            </div>
            <div>
              <h2>{summary.totalEntries}</h2>
              <p>Total Expense Entries</p>
            </div>
          </div>

          <div className="expense-summary-card card-green">
            <div className="expense-summary-icon">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h2>{summary.approvedCount}</h2>
              <p>Approved Expenses</p>
            </div>
          </div>

          <div className="expense-summary-card card-purple">
            <div className="expense-summary-icon">
              <Clock size={22} />
            </div>
            <div>
              <h2>{summary.pendingCount}</h2>
              <p>Pending Approvals</p>
            </div>
          </div>
        </div>
  
        <div className="expense-table-card">
          <table className="expense-table">
            <thead>
              <tr>
                <th style={{ width: "12%" }}>Expense #</th>
                <th style={{ width: "11%" }}>Date</th>
                <th style={{ width: "15%" }}>Category</th>
                <th style={{ width: "13%" }}>Store</th>
                <th style={{ width: "10%" }}>Method</th>
                <th style={{ width: "13%" }}>Total Amount</th>
                <th style={{ width: "11%" }}>Approval</th>
                <th style={{ width: "15%" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="expense-empty-row">
                    <RefreshCw size={20} className="expense-spin" />
                    <span>Loading expenses...</span>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="expense-empty-row">
                    No expense entries found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const isPending =
                    exp.approvalStatus === "Pending" || !exp.approvalStatus;

                  return (
                    <tr key={exp._id}>
                      <td>
                        <strong className="expense-code-badge">
                          {exp.expenseNumber}
                        </strong>
                      </td>

                      <td>
                        <div className="expense-date-cell">
                          <span>
                            {exp.expenseDate
                              ? new Date(exp.expenseDate).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "—"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="expense-cat-text">
                          {exp.expenseCategory}
                        </span>
                        {exp.recurring?.isRecurring && (
                          <span
                            className="expense-recur-pill"
                            title={`Recurring: ${exp.recurring.frequency}`}
                          >
                            <Repeat size={10} />
                          </span>
                        )}
                      </td>

                      <td title={getStoreName(exp.store)}>
                        {getStoreName(exp.store)}
                      </td>

                      <td>
                        <span className="expense-method-pill">
                          {exp.paymentMethod || "Cash"}
                        </span>
                      </td>

                      <td>
                        <strong className="expense-amount-text">
                          {formatCurrency(exp.totalAmount || exp.amount)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            exp.approvalStatus === "Approved"
                              ? "paid"
                              : exp.approvalStatus === "Rejected"
                              ? "pending"
                              : "partial"
                          }`}
                        >
                          {exp.approvalStatus || "Pending"}
                        </span>
                      </td>

                      <td>
                        <div className="expense-actions">
   
                          <button
                            type="button"
                            className="expense-action-btn view-btn"
                            title="View Details"
                            onClick={() => openViewModal(exp)}
                          >
                            <Eye size={15} />
                          </button>

                
                          <button
                            type="button"
                            className="expense-action-btn edit-btn"
                            title="Edit Expense"
                            onClick={() => openEditModal(exp)}
                          >
                            <Edit size={15} />
                          </button>

             
                          {isPending && (
                            <button
                              type="button"
                              className="expense-action-btn activate-btn"
                              title="Approve Expense"
                              disabled={actionLoading}
                              onClick={() => handleApprove(exp)}
                            >
                              <CheckCheck size={15} />
                            </button>
                          )}

                 
                          {isPending && (
                            <button
                              type="button"
                              className="expense-action-btn block-btn"
                              title="Reject Expense"
                              disabled={actionLoading}
                              onClick={() => handleReject(exp)}
                            >
                              <Ban size={15} />
                            </button>
                          )}

                       
                          <button
                            type="button"
                            className="expense-action-btn delete-btn"
                            title="Cancel / Delete Expense"
                            disabled={actionLoading}
                            onClick={() => handleDelete(exp)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>


      {showModal && (
        <div
          className="expense-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) setShowModal(false);
          }}
        >
          <div className="expense-modal">
            <div className="expense-modal-header">
              <h3>{editingId ? "Edit Expense Voucher" : "Record New Expense"}</h3>
              <button
                className="expense-close-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="expense-modal-form-wrapper">
              <div className="expense-modal-body">
                <h4 className="expense-section-title">General Info</h4>

                <div className="expense-form-grid">
                  <div className="expense-form-group">
                    <label>Expense Number *</label>
                    <input
                      type="text"
                      value={form.expenseNumber}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          expenseNumber: e.target.value.toUpperCase(),
                        })
                      }
                      required
                    />
                  </div>

                  <div className="expense-form-group">
                    <label>Store Location *</label>
                    <select
                      value={form.store}
                      onChange={(e) => setForm({ ...form, store: e.target.value })}
                      required
                    >
                      <option value="">Select Store</option>
                      {stores.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.storeName || s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="expense-form-group">
                    <label>Expense Category *</label>
                    <select
                      value={form.expenseCategory}
                      onChange={(e) =>
                        setForm({ ...form, expenseCategory: e.target.value })
                      }
                      required
                    >
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="expense-form-group">
                    <label>Expense Date *</label>
                    <input
                      type="date"
                      value={form.expenseDate}
                      onChange={(e) =>
                        setForm({ ...form, expenseDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <h4 className="expense-section-title">Financial & Payment</h4>

                <div className="expense-form-grid">
                  <div className="expense-form-group">
                    <label>Base Amount (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 5000"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="expense-form-group">
                    <label>Tax Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 900"
                      value={form.taxAmount}
                      onChange={(e) =>
                        setForm({ ...form, taxAmount: e.target.value })
                      }
                    />
                  </div>

                  <div className="expense-form-group">
                    <label>Total Calculated Expense</label>
                    <input
                      type="text"
                      className="expense-readonly-input"
                      value={formatCurrency(computedTotal)}
                      readOnly
                    />
                  </div>

                  <div className="expense-form-group">
                    <label>Payment Method *</label>
                    <select
                      value={form.paymentMethod}
                      onChange={(e) =>
                        setForm({ ...form, paymentMethod: e.target.value })
                      }
                      required
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="expense-form-group">
                    <label>Supplier / Payee (Optional)</label>
                    <select
                      value={form.supplier}
                      onChange={(e) =>
                        setForm({ ...form, supplier: e.target.value })
                      }
                    >
                      <option value="">No Associated Supplier</option>
                      {suppliers.map((sup) => (
                        <option key={sup._id} value={sup._id}>
                          {sup.supplierName || sup.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="expense-form-group">
                    <label>Receipt / Voucher #</label>
                    <input
                      type="text"
                      placeholder="e.g. BILL-9921"
                      value={form.receiptNumber}
                      onChange={(e) =>
                        setForm({ ...form, receiptNumber: e.target.value })
                      }
                    />
                  </div>
                </div>

                <h4 className="expense-section-title">Schedule & Notes</h4>

                <div className="expense-form-grid">
                  <div className="expense-form-group expense-checkbox-group">
                    <label className="expense-checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.isRecurring}
                        onChange={(e) =>
                          setForm({ ...form, isRecurring: e.target.checked })
                        }
                      />
                      <span>Mark as Recurring Operating Expense</span>
                    </label>
                  </div>

                  {form.isRecurring && (
                    <>
                      <div className="expense-form-group">
                        <label>Frequency</label>
                        <select
                          value={form.frequency}
                          onChange={(e) =>
                            setForm({ ...form, frequency: e.target.value })
                          }
                        >
                          {RECURRING_FREQUENCIES.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="expense-form-group">
                        <label>Next Due Date</label>
                        <input
                          type="date"
                          value={form.nextDueDate}
                          onChange={(e) =>
                            setForm({ ...form, nextDueDate: e.target.value })
                          }
                        />
                      </div>
                    </>
                  )}

                  <div className="expense-form-group expense-full">
                    <label>Expense Description / Audit Remarks</label>
                    <textarea
                      rows="2"
                      placeholder="Provide notes on the purpose, approver reference, or breakdown..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="expense-modal-footer">
                <button
                  type="button"
                  className="expense-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="expense-save-btn"
                  disabled={saving}
                >
                  <Save size={18} />
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Expense"
                    : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showViewModal && viewingExpense && (
        <div
          className="expense-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowViewModal(false);
          }}
        >
          <div className="expense-modal expense-view-modal">
            <div className="expense-modal-header">
              <h3>Expense Dossier — {viewingExpense.expenseNumber}</h3>
              <button
                className="expense-close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="expense-modal-body">
              <div className="expense-detail-grid">
                <div>
                  <span>Expense Number</span>
                  <strong className="expense-code-badge">
                    {viewingExpense.expenseNumber}
                  </strong>
                </div>

                <div>
                  <span>Approval Status</span>
                  <strong>
                    <span
                      className={`badge ${
                        viewingExpense.approvalStatus === "Approved"
                          ? "paid"
                          : viewingExpense.approvalStatus === "Rejected"
                          ? "pending"
                          : "partial"
                      }`}
                    >
                      {viewingExpense.approvalStatus || "Pending"}
                    </span>
                  </strong>
                </div>

                <div>
                  <span>Store</span>
                  <strong>{getStoreName(viewingExpense.store)}</strong>
                </div>

                <div>
                  <span>Category</span>
                  <strong>{viewingExpense.expenseCategory}</strong>
                </div>

                <div>
                  <span>Base Amount</span>
                  <strong>{formatCurrency(viewingExpense.amount)}</strong>
                </div>

                <div>
                  <span>Tax Portion</span>
                  <strong>{formatCurrency(viewingExpense.taxAmount || 0)}</strong>
                </div>

                <div>
                  <span>Total Expense</span>
                  <strong className="expense-amount-text">
                    {formatCurrency(
                      viewingExpense.totalAmount || viewingExpense.amount
                    )}
                  </strong>
                </div>

                <div>
                  <span>Payment Mode</span>
                  <strong>{viewingExpense.paymentMethod || "Cash"}</strong>
                </div>

                <div>
                  <span>Supplier</span>
                  <strong>{getSupplierName(viewingExpense.supplier)}</strong>
                </div>

                <div>
                  <span>Receipt #</span>
                  <strong>{viewingExpense.receiptNumber || "—"}</strong>
                </div>

                <div>
                  <span>Expense Date</span>
                  <strong>
                    {viewingExpense.expenseDate
                      ? new Date(viewingExpense.expenseDate).toLocaleDateString(
                          "en-IN"
                        )
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>Recurring Schedule</span>
                  <strong>
                    {viewingExpense.recurring?.isRecurring
                      ? `Yes (${viewingExpense.recurring.frequency})`
                      : "One-Time"}
                  </strong>
                </div>
              </div>

              {viewingExpense.description && (
                <div className="expense-notes-box">
                  <span>Notes / Description</span>
                  <p>{viewingExpense.description}</p>
                </div>
              )}
            </div>

            <div className="expense-modal-footer">
              <button
                type="button"
                className="expense-cancel-btn"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}