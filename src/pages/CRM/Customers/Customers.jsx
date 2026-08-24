import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  UserCheck,
  Award,
  IndianRupee,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus,
} from "../../../services/customerService";

import { getStores } from "../../../services/storeService";
import "./Customers.css";

const CUSTOMER_TYPES = [
  { value: "regular", label: "Regular" },
  { value: "walk_in", label: "Walk-In" },
  { value: "wholesale", label: "Wholesale" },
];

const CUSTOMER_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
];

const generateCustomerCode = () => {
  const time = String(Date.now()).slice(-5);
  return `CUST-${time}`;
};

const emptyForm = {
  customerCode: "",
  customerName: "",
  store: "",
  phone: "",
  alternatePhone: "",
  email: "",
  gstNumber: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  customerType: "regular",
  status: "active",
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadStores = async () => {
    try {
      const response = await getStores();
      const storeData =
        response?.data?.data ||
        response?.data?.stores ||
        response?.data ||
        [];
      setStores(Array.isArray(storeData) ? storeData : []);
    } catch (error) {
      console.error("Load Stores Error:", error);
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (storeFilter) params.store = storeFilter;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.customerType = typeFilter;

      const res = await getCustomers(params);
      const data =
        res?.data?.data ||
        res?.data?.customers ||
        res?.data ||
        [];

      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Customers Error:", error);
      alert(error?.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [storeFilter, statusFilter, typeFilter]);

  const getStoreName = (storeField) => {
    if (!storeField) return "—";
    if (typeof storeField === "object" && storeField !== null) {
      return storeField.storeName || storeField.name || "—";
    }
    const matched = stores.find((s) => String(s._id || s.id) === String(storeField));
    return matched?.storeName || matched?.name || storeField;
  };

  const formatMoney = (val) => {
    return `₹${Number(val || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const clearFilters = () => {
    setSearch("");
    setStoreFilter("");
    setStatusFilter("");
    setTypeFilter("");
  };

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter((c) => {
      const code = String(c.customerCode || "").toLowerCase();
      const name = String(c.customerName || "").toLowerCase();
      const phone = String(c.phone || "").toLowerCase();
      const email = String(c.email || "").toLowerCase();
      const gst = String(c.gstNumber || "").toLowerCase();
      const store = getStoreName(c.store).toLowerCase();

      return (
        code.includes(term) ||
        name.includes(term) ||
        phone.includes(term) ||
        email.includes(term) ||
        gst.includes(term) ||
        store.includes(term)
      );
    });
  }, [customers, search, stores]);

  const summary = useMemo(() => {
    const activeCount = customers.filter((c) => c.status === "active").length;
    const wholesaleCount = customers.filter((c) => c.customerType === "wholesale").length;
    const totalDue = customers.reduce((sum, c) => sum + Number(c.dueAmount || 0), 0);

    return {
      total: customers.length,
      active: activeCount,
      wholesale: wholesaleCount,
      totalDue,
    };
  }, [customers]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      customerCode: generateCustomerCode(),
    });
    setShowModal(true);
  };

  const openEditModal = async (customer) => {
    setEditingId(customer._id);
    try {
      const res = await getCustomerById(customer._id);
      const data = res?.data?.data || res?.data || customer;

      setForm({
        customerCode: data.customerCode || "",
        customerName: data.customerName || "",
        store: data.store?._id || data.store || "",
        phone: data.phone || "",
        alternatePhone: data.alternatePhone || "",
        email: data.email || "",
        gstNumber: data.gstNumber || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "India",
        pincode: data.pincode || "",
        customerType: data.customerType || "regular",
        status: data.status || "active",
      });
      setShowModal(true);
    } catch {
      setForm({
        customerCode: customer.customerCode || "",
        customerName: customer.customerName || "",
        store: customer.store?._id || customer.store || "",
        phone: customer.phone || "",
        alternatePhone: customer.alternatePhone || "",
        email: customer.email || "",
        gstNumber: customer.gstNumber || "",
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        country: customer.country || "India",
        pincode: customer.pincode || "",
        customerType: customer.customerType || "regular",
        status: customer.status || "active",
      });
      setShowModal(true);
    }
  };

  const openViewModal = (customer) => {
    setViewingCustomer(customer);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.store) {
      alert("Store is required");
      return;
    }
    if (!form.customerName.trim()) {
      alert("Customer name is required");
      return;
    }
    if (!form.phone.trim()) {
      alert("Phone number is required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        customerCode: form.customerCode.trim().toUpperCase(),
        customerName: form.customerName.trim(),
        store: form.store,
        phone: form.phone.trim(),
        alternatePhone: form.alternatePhone?.trim() || "",
        email: form.email?.trim().toLowerCase() || "",
        gstNumber: form.gstNumber?.trim().toUpperCase() || "",
        address: form.address?.trim() || "",
        city: form.city?.trim() || "",
        state: form.state?.trim() || "",
        country: form.country || "India",
        pincode: form.pincode?.trim() || "",
        customerType: form.customerType,
        status: form.status,
      };

      if (editingId) {
        await updateCustomer(editingId, payload);
        alert("Customer updated successfully");
      } else {
        await createCustomer(payload);
        alert("Customer created successfully");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadCustomers();
    } catch (error) {
      console.error("Save Customer Error:", error);
      alert(error?.response?.data?.message || "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (customer) => {
    const nextStatus = customer.status === "active" ? "inactive" : "active";
    const promptMessage = `Are you sure you want to change status to ${nextStatus} for ${customer.customerName}?`;

    if (!window.confirm(promptMessage)) return;

    try {
      setSaving(true);
      await toggleCustomerStatus(customer._id);
      alert(`Customer status changed to ${nextStatus} successfully`);
      await loadCustomers();
    } catch (error) {
      console.error("Toggle Status Error:", error);
      alert(error?.response?.data?.message || "Failed to change customer status");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Permanently delete customer ${customer.customerName}? This action cannot be undone.`)) return;

    try {
      setSaving(true);
      await deleteCustomer(customer._id);
      alert("Customer permanently deleted successfully");
      await loadCustomers();
    } catch (error) {
      console.error("Delete Customer Error:", error);
      alert(error?.response?.data?.message || "Failed to delete customer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="customer-page">
      <div className="customer-content">
        <div className="customer-page-header">
          <div>
            <h2>Customer Management</h2>
            <p>Maintain customer profiles, credit ledger balance, and loyalty metrics</p>
          </div>

          <button className="customer-primary-btn" onClick={openCreateModal}>
            <Plus size={18} />
            New Customer
          </button>
        </div>

        <div className="customer-toolbar">
          <div className="customer-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search code, name, phone, GST..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="customer-clear-search" onClick={() => setSearch("")}>
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="customer-filter-select"
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
            className="customer-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {CUSTOMER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            className="customer-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {CUSTOMER_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>

          {(search || storeFilter || typeFilter || statusFilter) && (
            <button type="button" className="customer-clear-btn" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>

        <div className="customer-summary-grid">
          <div className="customer-summary-card card-blue">
            <div className="customer-summary-icon">
              <Users size={22} />
            </div>
            <div>
              <h2>{summary.total}</h2>
              <p>Total Customers</p>
            </div>
          </div>

          <div className="customer-summary-card card-green">
            <div className="customer-summary-icon">
              <UserCheck size={22} />
            </div>
            <div>
              <h2>{summary.active}</h2>
              <p>Active Profiles</p>
            </div>
          </div>

          <div className="customer-summary-card card-purple">
            <div className="customer-summary-icon">
              <Award size={22} />
            </div>
            <div>
              <h2>{summary.wholesale}</h2>
              <p>Wholesale Accounts</p>
            </div>
          </div>

          <div className="customer-summary-card card-amber">
            <div className="customer-summary-icon">
              <IndianRupee size={22} />
            </div>
            <div>
              <h2>{formatMoney(summary.totalDue)}</h2>
              <p>Total Outstanding Due</p>
            </div>
          </div>
        </div>

        <div className="customer-table-card">
          <table className="customer-table">
            <thead>
              <tr>
                <th style={{ width: "11%" }}>Code</th>
                <th style={{ width: "16%" }}>Customer Name</th>
                <th style={{ width: "12%" }}>Phone</th>
                <th style={{ width: "12%" }}>Store</th>
                <th style={{ width: "10%" }}>Type</th>
                <th style={{ width: "10%" }}>Due Amount</th>
                <th style={{ width: "8%" }}>Loyalty</th>
                <th style={{ width: "9%" }}>Status</th>
                <th style={{ width: "12%" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="customer-empty-row">
                    <RefreshCw size={20} className="customer-spin" />
                    <span>Loading customers...</span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="customer-empty-row">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <strong className="customer-code">{c.customerCode}</strong>
                    </td>

                    <td className="customer-name-cell" title={c.customerName}>
                      {c.customerName}
                    </td>

                    <td>{c.phone || "—"}</td>

                    <td title={getStoreName(c.store)}>{getStoreName(c.store)}</td>

                    <td>
                      <span className={`customer-type-pill pill-${c.customerType}`}>
                        {c.customerType?.replace("_", " ")}
                      </span>
                    </td>

                    <td>
                      <strong
                        className={
                          Number(c.dueAmount || 0) > 0
                            ? "customer-red-text"
                            : "customer-green-text"
                        }
                      >
                        {formatMoney(c.dueAmount)}
                      </strong>
                    </td>

                    <td>{c.loyaltyPoints ?? 0} pts</td>

                    <td>
                      <span
                        className={`badge ${
                          c.status === "active"
                            ? "paid"
                            : c.status === "blocked"
                            ? "pending"
                            : "partial"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td>
                      <div className="customer-actions">
                        <button
                          type="button"
                          className="customer-action-btn view-btn"
                          title="View Profile"
                          onClick={() => openViewModal(c)}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          className="customer-action-btn edit-btn"
                          title="Edit Customer"
                          onClick={() => openEditModal(c)}
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          type="button"
                          className={`customer-action-btn ${
                            c.status === "active" ? "block-btn" : "activate-btn"
                          }`}
                          title={c.status === "active" ? "Deactivate Customer" : "Activate Customer"}
                          onClick={() => handleToggleStatus(c)}
                        >
                          {c.status === "active" ? (
                            <ShieldAlert size={15} />
                          ) : (
                            <ShieldCheck size={15} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="customer-action-btn delete-btn"
                          title="Permanently Delete Customer"
                          onClick={() => handleDelete(c)}
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
          className="customer-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) setShowModal(false);
          }}
        >
          <div className="customer-modal">
            <div className="customer-modal-header">
              <h3>{editingId ? "Edit Customer Profile" : "New Customer Profile"}</h3>
              <button
                className="customer-close-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="customer-modal-form-wrapper">
              <div className="customer-modal-body">
                <h4 className="customer-section-title">Identity & Account</h4>

                <div className="customer-form-grid">
                  <div className="customer-form-group">
                    <label>Customer Code *</label>
                    <input
                      type="text"
                      value={form.customerCode}
                      onChange={(e) =>
                        setForm({ ...form, customerCode: e.target.value.toUpperCase() })
                      }
                      required
                    />
                  </div>

                  <div className="customer-form-group">
                    <label>Assigned Store *</label>
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

                  <div className="customer-form-group">
                    <label>Customer Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="customer-form-group">
                    <label>Customer Type *</label>
                    <select
                      value={form.customerType}
                      onChange={(e) => setForm({ ...form, customerType: e.target.value })}
                      required
                    >
                      {CUSTOMER_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <h4 className="customer-section-title">Contact & Tax Info</h4>

                <div className="customer-form-grid">
                  <div className="customer-form-group">
                    <label>Primary Phone *</label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="customer-form-group">
                    <label>Alternate Phone</label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={form.alternatePhone}
                      onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                    />
                  </div>

                  <div className="customer-form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="customer-form-group">
                    <label>GST Number</label>
                    <input
                      type="text"
                      placeholder="GSTIN (15 Digits)"
                      value={form.gstNumber}
                      onChange={(e) =>
                        setForm({ ...form, gstNumber: e.target.value.toUpperCase() })
                      }
                    />
                  </div>
                </div>

                <h4 className="customer-section-title">Address Details</h4>

                <div className="customer-form-grid">
                  <div className="customer-form-group customer-full">
                    <label>Street Address</label>
                    <textarea
                      rows="2"
                      placeholder="Building, street, locality..."
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>

                  <div className="customer-form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>

                  <div className="customer-form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                    />
                  </div>

                  <div className="customer-form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                    />
                  </div>

                  <div className="customer-form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="customer-modal-footer">
                <button
                  type="button"
                  className="customer-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" className="customer-save-btn" disabled={saving}>
                  <Save size={18} />
                  {saving ? "Saving..." : editingId ? "Update Customer" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewingCustomer && (
        <div
          className="customer-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowViewModal(false);
          }}
        >
          <div className="customer-modal customer-view-modal">
            <div className="customer-modal-header">
              <h3>Customer Dossier — {viewingCustomer.customerName}</h3>
              <button
                className="customer-close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="customer-modal-body">
              <div className="customer-detail-grid">
                <div>
                  <span>Customer Code</span>
                  <strong className="customer-code">{viewingCustomer.customerCode}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    <span
                      className={`badge ${
                        viewingCustomer.status === "active"
                          ? "paid"
                          : viewingCustomer.status === "blocked"
                          ? "pending"
                          : "partial"
                      }`}
                    >
                      {viewingCustomer.status}
                    </span>
                  </strong>
                </div>

                <div>
                  <span>Store Location</span>
                  <strong>{getStoreName(viewingCustomer.store)}</strong>
                </div>

                <div>
                  <span>Account Type</span>
                  <strong>{viewingCustomer.customerType?.replace("_", " ")}</strong>
                </div>

                <div>
                  <span>Primary Phone</span>
                  <strong>{viewingCustomer.phone || "—"}</strong>
                </div>

                <div>
                  <span>Alternate Phone</span>
                  <strong>{viewingCustomer.alternatePhone || "—"}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{viewingCustomer.email || "—"}</strong>
                </div>

                <div>
                  <span>GST Number</span>
                  <strong>{viewingCustomer.gstNumber || "—"}</strong>
                </div>

                <div>
                  <span>Total Purchases</span>
                  <strong className="customer-green-text">
                    {formatMoney(viewingCustomer.totalPurchaseAmount)}
                  </strong>
                </div>

                <div>
                  <span>Due Balance</span>
                  <strong
                    className={
                      Number(viewingCustomer.dueAmount || 0) > 0
                        ? "customer-red-text"
                        : "customer-green-text"
                    }
                  >
                    {formatMoney(viewingCustomer.dueAmount)}
                  </strong>
                </div>

                <div>
                  <span>Loyalty Points</span>
                  <strong>{viewingCustomer.loyaltyPoints ?? 0} Points</strong>
                </div>

                <div>
                  <span>Registered Date</span>
                  <strong>
                    {viewingCustomer.createdAt
                      ? new Date(viewingCustomer.createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </strong>
                </div>
              </div>

              <div className="customer-section-title">Postal Address</div>
              <div className="customer-address-box">
                <p>{viewingCustomer.address || "No street address provided."}</p>
                <small>
                  {[
                    viewingCustomer.city,
                    viewingCustomer.state,
                    viewingCustomer.pincode,
                    viewingCustomer.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </small>
              </div>
            </div>

            <div className="customer-modal-footer">
              <button
                type="button"
                className="customer-cancel-btn"
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