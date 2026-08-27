import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Coins,
  Receipt,
  User,
} from "lucide-react";

import {
  getLoyaltyPoints,
  createLoyaltyPoints,
  updateLoyaltyPoints,
  deleteLoyaltyPoints,
} from "../../../services/loyaltypointsService";

import { getStores } from "../../../services/storeService";
import { getCustomers } from "../../../services/customerService";

import "./Loyaltypoints.css";

const TRANSACTION_TYPES = [
  { value: "earn", label: "Earn (+)" },
  { value: "redeem", label: "Redeem (-)" },
  { value: "adjust", label: "Adjustment (±)" },
];

const emptyForm = {
  customer: "",
  store: "",
  points: "",
  type: "earn",
  invoiceNo: "",
  expiryDate: "",
  remarks: "",
};

export default function LoyaltyPoints() {
  const [records, setRecords] = useState([]);
  const [stores, setStores] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);


  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadMasterData = async () => {
    try {
      const [storesRes, customersRes] = await Promise.allSettled([
        getStores(),
        getCustomers(),
      ]);

      if (storesRes.status === "fulfilled") {
        const d =
          storesRes.value?.data?.data ||
          storesRes.value?.data?.stores ||
          storesRes.value?.data ||
          [];
        setStores(Array.isArray(d) ? d : []);
      }

      if (customersRes.status === "fulfilled") {
        const d =
          customersRes.value?.data?.data ||
          customersRes.value?.data?.customers ||
          customersRes.value?.data ||
          [];
        setCustomers(Array.isArray(d) ? d : []);
      }
    } catch (error) {
      console.error("Master Data Load Error:", error);
    }
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (storeFilter) params.store = storeFilter;
      if (customerFilter) params.customer = customerFilter;
      if (typeFilter) params.type = typeFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await getLoyaltyPoints(params);
      const data =
        res?.data?.data?.data ||
        res?.data?.data ||
        res?.data?.loyaltyPoints ||
        res?.data ||
        [];

      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Loyalty Records Error:", error);
      alert(error?.response?.data?.message || "Failed to load loyalty points ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadRecords();
  }, [storeFilter, customerFilter, typeFilter, fromDate, toDate]);

  const getStoreName = (storeField) => {
    if (!storeField) return "—";
    if (typeof storeField === "object" && storeField !== null) {
      return storeField.storeName || storeField.name || "—";
    }
    const matched = stores.find((s) => String(s._id || s.id) === String(storeField));
    return matched?.storeName || matched?.name || storeField;
  };

  const getCustomerName = (custField) => {
    if (!custField) return "—";
    if (typeof custField === "object" && custField !== null) {
      return custField.customerName || custField.name || "—";
    }
    const matched = customers.find((c) => String(c._id || c.id) === String(custField));
    return matched?.customerName || matched?.name || custField;
  };

  const getCustomerPhone = (custField) => {
    if (!custField || typeof custField !== "object") return "";
    return custField.phone || custField.mobileNumber || "";
  };

  const clearFilters = () => {
    setSearch("");
    setStoreFilter("");
    setCustomerFilter("");
    setTypeFilter("");
    setFromDate("");
    setToDate("");
  };

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return records;

    return records.filter((r) => {
      const custName = getCustomerName(r.customer).toLowerCase();
      const phone = getCustomerPhone(r.customer).toLowerCase();
      const invoice = String(r.invoiceNo || "").toLowerCase();
      const remarks = String(r.remarks || "").toLowerCase();
      const storeName = getStoreName(r.store).toLowerCase();

      return (
        custName.includes(term) ||
        phone.includes(term) ||
        invoice.includes(term) ||
        remarks.includes(term) ||
        storeName.includes(term)
      );
    });
  }, [records, search, customers, stores]);

  const summary = useMemo(() => {
    let earned = 0;
    let redeemed = 0;
    let adjusted = 0;

    records.forEach((r) => {
      const pts = Number(r.points || 0);
      if (r.type === "earn") earned += pts;
      if (r.type === "redeem") redeemed += pts;
      if (r.type === "adjust") adjusted += pts;
    });

    const netPoints = earned + adjusted - redeemed;

    return {
      totalTransactions: records.length,
      totalEarned: earned,
      totalRedeemed: redeemed,
      netActiveBalance: netPoints,
    };
  }, [records]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (rec) => {
    setEditingId(rec._id);
    setForm({
      customer: rec.customer?._id || rec.customer || "",
      store: rec.store?._id || rec.store || "",
      points: rec.points ?? "",
      type: rec.type || "earn",
      invoiceNo: rec.invoiceNo || "",
      expiryDate: rec.expiryDate ? rec.expiryDate.split("T")[0] : "",
      remarks: rec.remarks || "",
    });
    setShowModal(true);
  };

  const openViewModal = (rec) => {
    setViewingRecord(rec);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.store) {
      alert("Store selection is required");
      return;
    }
    if (!form.customer) {
      alert("Customer selection is required");
      return;
    }
    if (!form.points || Number(form.points) <= 0) {
      alert("Points must be greater than 0");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        store: form.store,
        customer: form.customer,
        points: Number(form.points),
        type: form.type,
        invoiceNo: form.invoiceNo?.trim() || undefined,
        expiryDate: form.expiryDate || undefined,
        remarks: form.remarks?.trim() || "",
      };

      if (editingId) {
        await updateLoyaltyPoints(editingId, payload);
        alert("Loyalty point transaction updated successfully");
      } else {
        await createLoyaltyPoints(payload);
        alert("Loyalty point entry posted successfully");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadRecords();
    } catch (error) {
      console.error("Save Loyalty Record Error:", error);
      alert(error?.response?.data?.message || "Failed to process loyalty transaction");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rec) => {
    const confirmed = window.confirm(
      `Delete loyalty transaction of ${rec.points} points for ${getCustomerName(rec.customer)}?`
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteLoyaltyPoints(rec._id);
      alert("Loyalty transaction deleted successfully");
      await loadRecords();
    } catch (error) {
      console.error("Delete Loyalty Error:", error);
      alert(error?.response?.data?.message || "Failed to delete loyalty entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="loyalty-page">
      <div className="loyalty-content">
    
        <div className="loyalty-page-header">
          <div>
            <h2>Loyalty Points Ledger</h2>
            <p>Track reward accruals, bill redemptions, and manual point adjustments</p>
          </div>

          <button className="loyalty-primary-btn" onClick={openCreateModal}>
            <Plus size={18} />
            New Entry
          </button>
        </div>

    
        <div className="loyalty-toolbar">
          <div className="loyalty-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search customer, invoice, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="loyalty-clear-search" onClick={() => setSearch("")}>
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="loyalty-filter-select"
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
            className="loyalty-filter-select"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.customerName} ({c.phone || c.mobileNumber})
              </option>
            ))}
          </select>

          <select
            className="loyalty-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {TRANSACTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="loyalty-date-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            type="date"
            className="loyalty-date-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          {(search || storeFilter || customerFilter || typeFilter || fromDate || toDate) && (
            <button type="button" className="loyalty-clear-btn" onClick={clearFilters}>
              Clear
            </button>
          )}

        </div>
       <div className="loyalty-summary-grid">
          <div className="loyalty-summary-card card-blue">
            <div className="loyalty-summary-icon">
              <Award size={22} />
            </div>
            <div>
              <h2>{summary.totalTransactions}</h2>
              <p>Total Transactions</p>
            </div>
          </div>

          <div className="loyalty-summary-card card-green">
            <div className="loyalty-summary-icon">
              <ArrowDownLeft size={22} />
            </div>
            <div>
              <h2>+{summary.totalEarned.toLocaleString()}</h2>
              <p>Points Earned</p>
            </div>
          </div>

          <div className="loyalty-summary-card card-amber">
            <div className="loyalty-summary-icon">
              <ArrowUpRight size={22} />
            </div>
            <div>
              <h2>-{summary.totalRedeemed.toLocaleString()}</h2>
              <p>Points Redeemed</p>
            </div>
          </div>

          <div className="loyalty-summary-card card-purple">
            <div className="loyalty-summary-icon">
              <Coins size={22} />
            </div>
            <div>
              <h2>{summary.netActiveBalance.toLocaleString()}</h2>
              <p>Net Active Ledger</p>
            </div>
          </div>
        </div>

        <div className="loyalty-table-card">
          <table className="loyalty-table">
            <thead>
              <tr>
                <th style={{ width: "13%" }}>Date & Time</th>
                <th style={{ width: "18%" }}>Customer</th>
                <th style={{ width: "12%" }}>Store</th>
                <th style={{ width: "11%" }}>Invoice No</th>
                <th style={{ width: "10%" }}>Type</th>
                <th style={{ width: "11%" }}>Points</th>
                <th style={{ width: "13%" }}>Post Balance</th>
                <th style={{ width: "14%" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="loyalty-empty-row">
                    <RefreshCw size={20} className="loyalty-spin" />
                    <span>Loading loyalty ledger entries...</span>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="loyalty-empty-row">
                    No loyalty point records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="loyalty-date-cell">
                        <span>
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                        <small>
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </small>
                      </div>
                    </td>

                    <td title={getCustomerName(r.customer)}>
                      <div className="loyalty-customer-cell">
                        <strong>{getCustomerName(r.customer)}</strong>
                        <small>{getCustomerPhone(r.customer)}</small>
                      </div>
                    </td>

                    <td title={getStoreName(r.store)}>{getStoreName(r.store)}</td>

                    <td>
                      <strong className="loyalty-invoice-no">
                        {r.invoiceNo || r.invoice?.invoiceNo || "—"}
                      </strong>
                    </td>

                    <td>
                      <span className={`loyalty-type-pill pill-${r.type}`}>
                        {r.type}
                      </span>
                    </td>

                    <td>
                      <strong
                        className={
                          r.type === "earn" || r.type === "adjust"
                            ? "loyalty-green-text"
                            : "loyalty-red-text"
                        }
                      >
                        {r.type === "earn"
                          ? `+${r.points}`
                          : r.type === "redeem"
                          ? `-${r.points}`
                          : `±${r.points}`}
                      </strong>
                    </td>

                    <td>
                      <span className="loyalty-balance-text">
                        {Number(r.balanceAfterTransaction || 0).toLocaleString()} pts
                      </span>
                    </td>

                    <td>
                      <div className="loyalty-actions">
                        <button
                          type="button"
                          className="loyalty-action-btn view-btn"
                          title="View Transaction"
                          onClick={() => openViewModal(r)}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          className="loyalty-action-btn edit-btn"
                          title="Edit Entry"
                          onClick={() => openEditModal(r)}
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          type="button"
                          className="loyalty-action-btn delete-btn"
                          title="Delete Entry"
                          onClick={() => handleDelete(r)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="loyalty-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) setShowModal(false);
          }}
        >
          <div className="loyalty-modal">
            <div className="loyalty-modal-header">
              <h3>{editingId ? "Edit Loyalty Transaction" : "New Loyalty Point Entry"}</h3>
              <button
                className="loyalty-close-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="loyalty-modal-form-wrapper">
              <div className="loyalty-modal-body">
                <h4 className="loyalty-section-title">Party & Location</h4>

                <div className="loyalty-form-grid">
                  <div className="loyalty-form-group">
                    <label>Store *</label>
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

                  <div className="loyalty-form-group">
                    <label>Customer *</label>
                    <select
                      value={form.customer}
                      onChange={(e) => setForm({ ...form, customer: e.target.value })}
                      required
                    >
                      <option value="">Select Customer</option>
                      {customers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.customerName} ({c.phone || c.mobileNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <h4 className="loyalty-section-title">Transaction Values</h4>

                <div className="loyalty-form-grid">
                  <div className="loyalty-form-group">
                    <label>Transaction Type *</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      required
                    >
                      {TRANSACTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="loyalty-form-group">
                    <label>Points Amount *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 50"
                      value={form.points}
                      onChange={(e) => setForm({ ...form, points: e.target.value })}
                      required
                    />
                  </div>

                  <div className="loyalty-form-group">
                    <label>Invoice Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. INV-2026-001"
                      value={form.invoiceNo}
                      onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
                    />
                  </div>

                  <div className="loyalty-form-group">
                    <label>Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={form.expiryDate}
                      onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="loyalty-form-group loyalty-full">
                  <label>Remarks</label>
                  <textarea
                    rows="2"
                    placeholder="Enter reason, promo tag, or redemption reference..."
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="loyalty-modal-footer">
                <button
                  type="button"
                  className="loyalty-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" className="loyalty-save-btn" disabled={saving}>
                  <Save size={18} />
                  {saving ? "Saving..." : editingId ? "Update Entry" : "Post Loyalty Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showViewModal && viewingRecord && (
        <div
          className="loyalty-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowViewModal(false);
          }}
        >
          <div className="loyalty-modal loyalty-view-modal">
            <div className="loyalty-modal-header">
              <h3>Loyalty Point Audit Record</h3>
              <button
                className="loyalty-close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="loyalty-modal-body">
              <div className="loyalty-detail-grid">
                <div>
                  <span>Customer</span>
                  <strong>{getCustomerName(viewingRecord.customer)}</strong>
                </div>

                <div>
                  <span>Transaction Type</span>
                  <strong>
                    <span className={`loyalty-type-pill pill-${viewingRecord.type}`}>
                      {viewingRecord.type}
                    </span>
                  </strong>
                </div>

                <div>
                  <span>Store</span>
                  <strong>{getStoreName(viewingRecord.store)}</strong>
                </div>

                <div>
                  <span>Invoice Number</span>
                  <strong>{viewingRecord.invoiceNo || viewingRecord.invoice?.invoiceNo || "Manual Direct"}</strong>
                </div>

                <div>
                  <span>Points Value</span>
                  <strong
                    className={
                      viewingRecord.type === "earn" || viewingRecord.type === "adjust"
                        ? "loyalty-green-text"
                        : "loyalty-red-text"
                    }
                  >
                    {viewingRecord.type === "earn"
                      ? `+${viewingRecord.points}`
                      : viewingRecord.type === "redeem"
                      ? `-${viewingRecord.points}`
                      : `±${viewingRecord.points}`}
                  </strong>
                </div>

                <div>
                  <span>Balance After Trans.</span>
                  <strong>{Number(viewingRecord.balanceAfterTransaction || 0).toLocaleString()} Points</strong>
                </div>

                <div>
                  <span>Logged Date</span>
                  <strong>
                    {viewingRecord.createdAt
                      ? new Date(viewingRecord.createdAt).toLocaleString("en-IN")
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>Expiry Date</span>
                  <strong>
                    {viewingRecord.expiryDate
                      ? new Date(viewingRecord.expiryDate).toLocaleDateString("en-IN")
                      : "No Expiry"}
                  </strong>
                </div>
              </div>

              {viewingRecord.remarks && (
                <div className="loyalty-notes">
                  <span>Remarks</span>
                  <p>{viewingRecord.remarks}</p>
                </div>
              )}
            </div>

            <div className="loyalty-modal-footer">
              <button
                type="button"
                className="loyalty-cancel-btn"
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