import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Building2,
  Check,
  Star,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import {
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  activateCustomerAddress,
  deleteCustomerAddress,
} from "../../../services/addressService";

import { getStores } from "../../../services/storeService";
import { getCustomers } from "../../../services/customerService";

import "./Address.css";

const ADDRESS_LABELS = [
  { value: "home", label: "Home" },
  { value: "office", label: "Office" },
  { value: "billing", label: "Billing" },
  { value: "shipping", label: "Shipping" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  store: "",
  customer: "",
  label: "home",
  contactName: "",
  contactPhone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  isDefault: false,
  status: "active",
};

export default function CustomerAddress() {
  const [addresses, setAddresses] = useState([]);
  const [stores, setStores] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [labelFilter, setLabelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");


  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingAddress, setViewingAddress] = useState(null);

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

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (storeFilter) params.store = storeFilter;
      if (customerFilter) params.customer = customerFilter;
      if (labelFilter) params.label = labelFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await getCustomerAddresses(params);
      const data =
        res?.data?.data ||
        res?.data?.addresses ||
        res?.data ||
        [];

      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Customer Addresses Error:", error);
      alert(error?.response?.data?.message || "Failed to load customer addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [storeFilter, customerFilter, labelFilter, statusFilter]);

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

  const clearFilters = () => {
    setSearch("");
    setStoreFilter("");
    setCustomerFilter("");
    setLabelFilter("");
    setStatusFilter("");
  };

  const filteredAddresses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return addresses;

    return addresses.filter((addr) => {
      const custName = getCustomerName(addr.customer).toLowerCase();
      const contact = String(addr.contactName || "").toLowerCase();
      const phone = String(addr.contactPhone || "").toLowerCase();
      const city = String(addr.city || "").toLowerCase();
      const state = String(addr.state || "").toLowerCase();
      const line1 = String(addr.addressLine1 || "").toLowerCase();
      const pincode = String(addr.pincode || "").toLowerCase();
      const label = String(addr.label || "").toLowerCase();

      return (
        custName.includes(term) ||
        contact.includes(term) ||
        phone.includes(term) ||
        city.includes(term) ||
        state.includes(term) ||
        line1.includes(term) ||
        pincode.includes(term) ||
        label.includes(term)
      );
    });
  }, [addresses, search, customers, stores]);

  const summary = useMemo(() => {
    const defaultCount = addresses.filter((a) => a.isDefault).length;
    const activeCount = addresses.filter((a) => a.status === "active").length;
    const billingCount = addresses.filter(
      (a) => a.label === "billing" || a.label === "shipping"
    ).length;

    return {
      total: addresses.length,
      defaultCount,
      activeCount,
      billingCount,
    };
  }, [addresses]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (addr) => {
    setEditingId(addr._id);
    setForm({
      store: addr.store?._id || addr.store || "",
      customer: addr.customer?._id || addr.customer || "",
      label: addr.label || "home",
      contactName: addr.contactName || "",
      contactPhone: addr.contactPhone || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      country: addr.country || "India",
      pincode: addr.pincode || "",
      isDefault: Boolean(addr.isDefault),
      status: addr.status || "active",
    });
    setShowModal(true);
  };

  const openViewModal = (addr) => {
    setViewingAddress(addr);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.store) {
      alert("Store is required");
      return;
    }
    if (!form.customer) {
      alert("Customer is required");
      return;
    }
    if (!form.addressLine1.trim()) {
      alert("Address Line 1 is required");
      return;
    }
    if (!form.city.trim()) {
      alert("City is required");
      return;
    }
    if (!form.state.trim()) {
      alert("State is required");
      return;
    }
    if (!form.pincode.trim()) {
      alert("Pincode is required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        store: form.store,
        customer: form.customer,
        label: form.label,
        contactName: form.contactName?.trim() || "",
        contactPhone: form.contactPhone?.trim() || "",
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2?.trim() || "",
        landmark: form.landmark?.trim() || "",
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country || "India",
        pincode: form.pincode.trim(),
        isDefault: Boolean(form.isDefault),
        status: form.status,
      };

      if (editingId) {
        await updateCustomerAddress(editingId, payload);
        alert("Customer address updated successfully");
      } else {
        await createCustomerAddress(payload);
        alert("Customer address created successfully");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadAddresses();
    } catch (error) {
      console.error("Save Customer Address Error:", error);
      alert(error?.response?.data?.message || "Failed to save customer address");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (addr) => {
    const isInactive = addr.status === "inactive";
    const promptMessage = isInactive
      ? `Activate this address for ${getCustomerName(addr.customer)}?`
      : `Deactivate this address for ${getCustomerName(addr.customer)}?`;

    if (!window.confirm(promptMessage)) return;

    try {
      setSaving(true);
      if (isInactive) {
        await activateCustomerAddress(addr._id);
        alert("Address activated successfully");
      } else {
        await deleteCustomerAddress(addr._id);
        alert("Address deactivated successfully");
      }
      await loadAddresses();
    } catch (error) {
      console.error("Toggle Status Error:", error);
      alert(error?.response?.data?.message || "Failed to change address status");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addr) => {
    const confirmed = window.confirm(
      `Delete address (${addr.addressLine1}, ${addr.city}) for ${getCustomerName(addr.customer)}?`
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteCustomerAddress(addr._id);
      alert("Customer address deleted successfully");
      await loadAddresses();
    } catch (error) {
      console.error("Delete Customer Address Error:", error);
      alert(error?.response?.data?.message || "Failed to delete customer address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="address-page">
      <div className="address-content">

        <div className="address-page-header">
          <div>
            <h2>Customer Addresses</h2>
            <p>Manage multi-location shipping, billing, and contact destinations</p>
          </div>

          <button className="address-primary-btn" onClick={openCreateModal}>
            <Plus size={18} />
            New Address
          </button>
        </div>

        <div className="address-toolbar">
          <div className="address-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search customer, city, contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="address-clear-search" onClick={() => setSearch("")}>
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="address-filter-select"
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
            className="address-filter-select"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.customerName} ({c.phone})
              </option>
            ))}
          </select>

          <select
            className="address-filter-select"
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value)}
          >
            <option value="">All Labels</option>
            {ADDRESS_LABELS.map((lbl) => (
              <option key={lbl.value} value={lbl.value}>
                {lbl.label}
              </option>
            ))}
          </select>

          <select
            className="address-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {(search || storeFilter || customerFilter || labelFilter || statusFilter) && (
            <button type="button" className="address-clear-btn" onClick={clearFilters}>
              Clear
            </button>
          )}

        </div>
  <div className="address-summary-grid">
          <div className="address-summary-card card-blue">
            <div className="address-summary-icon">
              <MapPin size={22} />
            </div>
            <div>
              <h2>{summary.total}</h2>
              <p>Total Addresses</p>
            </div>
          </div>

          <div className="address-summary-card card-green">
            <div className="address-summary-icon">
              <Star size={22} />
            </div>
            <div>
              <h2>{summary.defaultCount}</h2>
              <p>Default Primary</p>
            </div>
          </div>

          <div className="address-summary-card card-purple">
            <div className="address-summary-icon">
              <Building2 size={22} />
            </div>
            <div>
              <h2>{summary.billingCount}</h2>
              <p>Billing / Shipping</p>
            </div>
          </div>

          <div className="address-summary-card card-amber">
            <div className="address-summary-icon">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h2>{summary.activeCount}</h2>
              <p>Active Destinations</p>
            </div>
          </div>
        </div>

        <div className="address-table-card">
          <table className="address-table">
            <thead>
              <tr>
                <th style={{ width: "16%" }}>Customer</th>
                <th style={{ width: "10%" }}>Label</th>
                <th style={{ width: "13%" }}>Contact</th>
                <th style={{ width: "20%" }}>Address Line</th>
                <th style={{ width: "12%" }}>City & State</th>
                <th style={{ width: "8%" }}>Pincode</th>
                <th style={{ width: "8%" }}>Default</th>
                <th style={{ width: "13%" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="address-empty-row">
                    <RefreshCw size={20} className="address-spin" />
                    <span>Loading customer addresses...</span>
                  </td>
                </tr>
              ) : filteredAddresses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="address-empty-row">
                    No customer addresses found.
                  </td>
                </tr>
              ) : (
                filteredAddresses.map((addr) => (
                  <tr key={addr._id}>
                    <td className="address-customer-cell" title={getCustomerName(addr.customer)}>
                      <strong>{getCustomerName(addr.customer)}</strong>
                    </td>

                    <td>
                      <span className={`address-label-pill pill-${addr.label}`}>
                        {addr.label}
                      </span>
                    </td>

                    <td>
                      <div className="address-contact-cell">
                        <span>{addr.contactName || "—"}</span>
                        <small>{addr.contactPhone || ""}</small>
                      </div>
                    </td>

                    <td title={`${addr.addressLine1} ${addr.addressLine2 || ""}`}>
                      <div className="address-line-cell">
                        <span>{addr.addressLine1}</span>
                        {addr.landmark && <small>Near: {addr.landmark}</small>}
                      </div>
                    </td>

                    <td>
                      <div className="address-location-cell">
                        <span>{addr.city}</span>
                        <small>{addr.state}</small>
                      </div>
                    </td>

                    <td>{addr.pincode}</td>

                    <td>
                      {addr.isDefault ? (
                        <span className="address-default-badge">
                          <Check size={12} /> Default
                        </span>
                      ) : (
                        <span className="address-muted-dash">—</span>
                      )}
                    </td>

                    <td>
                      <div className="address-actions">
                        {/* View */}
                        <button
                          type="button"
                          className="address-action-btn view-btn"
                          title="View Details"
                          onClick={() => openViewModal(addr)}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          className="address-action-btn edit-btn"
                          title="Edit Address"
                          onClick={() => openEditModal(addr)}
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          type="button"
                          className={`address-action-btn ${
                            addr.status === "inactive" ? "activate-btn" : "block-btn"
                          }`}
                          title={addr.status === "inactive" ? "Activate Address" : "Deactivate Address"}
                          onClick={() => handleToggleStatus(addr)}
                        >
                          {addr.status === "inactive" ? (
                            <ShieldCheck size={15} />
                          ) : (
                            <ShieldAlert size={15} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="address-action-btn delete-btn"
                          title="Delete Address"
                          onClick={() => handleDelete(addr)}
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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div
          className="address-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) setShowModal(false);
          }}
        >
          <div className="address-modal">
            <div className="address-modal-header">
              <h3>{editingId ? "Edit Customer Address" : "New Customer Address"}</h3>
              <button
                className="address-close-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="address-modal-form-wrapper">
              <div className="address-modal-body">
                <h4 className="address-section-title">Ownership & Categorization</h4>

                <div className="address-form-grid">
                  <div className="address-form-group">
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

                  <div className="address-form-group">
                    <label>Customer *</label>
                    <select
                      value={form.customer}
                      onChange={(e) => setForm({ ...form, customer: e.target.value })}
                      required
                    >
                      <option value="">Select Customer</option>
                      {customers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.customerName} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="address-form-group">
                    <label>Address Label *</label>
                    <select
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      required
                    >
                      {ADDRESS_LABELS.map((lbl) => (
                        <option key={lbl.value} value={lbl.value}>
                          {lbl.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="address-form-group address-checkbox-group">
                    <label className="address-checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.isDefault}
                        onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                      />
                      <span>Set as Default Address for this Customer</span>
                    </label>
                  </div>
                </div>

                <h4 className="address-section-title">Receiver Contact (Optional)</h4>

                <div className="address-form-grid">
                  <div className="address-form-group">
                    <label>Contact Name</label>
                    <input
                      type="text"
                      placeholder="Receiver's name"
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    />
                  </div>

                  <div className="address-form-group">
                    <label>Contact Phone</label>
                    <input
                      type="text"
                      placeholder="Receiver's phone"
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    />
                  </div>
                </div>

                <h4 className="address-section-title">Street Address</h4>

                <div className="address-form-grid">
                  <div className="address-form-group address-full">
                    <label>Address Line 1 *</label>
                    <input
                      type="text"
                      placeholder="Flat, House no., Building, Company, Apartment"
                      value={form.addressLine1}
                      onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                      required
                    />
                  </div>

                  <div className="address-form-group address-full">
                    <label>Address Line 2</label>
                    <input
                      type="text"
                      placeholder="Area, Street, Sector, Village"
                      value={form.addressLine2}
                      onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                    />
                  </div>

                  <div className="address-form-group">
                    <label>Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Apollo Hospital"
                      value={form.landmark}
                      onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                    />
                  </div>

                  <div className="address-form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      placeholder="6 Digits PIN"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="address-form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="address-form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      required
                    />
                  </div>

                  <div className="address-form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="address-modal-footer">
                <button
                  type="button"
                  className="address-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" className="address-save-btn" disabled={saving}>
                  <Save size={18} />
                  {saving ? "Saving..." : editingId ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewingAddress && (
        <div
          className="address-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowViewModal(false);
          }}
        >
          <div className="address-modal address-view-modal">
            <div className="address-modal-header">
              <h3>Customer Address Details</h3>
              <button
                className="address-close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="address-modal-body">
              <div className="address-detail-grid">
                <div>
                  <span>Customer</span>
                  <strong>{getCustomerName(viewingAddress.customer)}</strong>
                </div>

                <div>
                  <span>Category Label</span>
                  <strong>
                    <span className={`address-label-pill pill-${viewingAddress.label}`}>
                      {viewingAddress.label}
                    </span>
                  </strong>
                </div>

                <div>
                  <span>Assigned Store</span>
                  <strong>{getStoreName(viewingAddress.store)}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    <span
                      className={`badge ${
                        viewingAddress.status === "active" ? "paid" : "pending"
                      }`}
                    >
                      {viewingAddress.status}
                    </span>
                  </strong>
                </div>

                <div>
                  <span>Contact Person</span>
                  <strong>{viewingAddress.contactName || "—"}</strong>
                </div>

                <div>
                  <span>Contact Phone</span>
                  <strong>{viewingAddress.contactPhone || "—"}</strong>
                </div>

                <div>
                  <span>Default Address</span>
                  <strong>
                    {viewingAddress.isDefault ? "Yes (Primary)" : "No"}
                  </strong>
                </div>

                <div>
                  <span>Pincode</span>
                  <strong>{viewingAddress.pincode}</strong>
                </div>
              </div>

              <div className="address-section-title">Complete Postal Details</div>
              <div className="address-complete-box">
                <p className="address-line-primary">
                  {viewingAddress.addressLine1}
                </p>
                {viewingAddress.addressLine2 && (
                  <p className="address-line-secondary">
                    {viewingAddress.addressLine2}
                  </p>
                )}
                {viewingAddress.landmark && (
                  <p className="address-landmark-text">
                    Landmark: {viewingAddress.landmark}
                  </p>
                )}
                <p className="address-region-text">
                  {[
                    viewingAddress.city,
                    viewingAddress.state,
                    viewingAddress.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>

            <div className="address-modal-footer">
              <button
                type="button"
                className="address-cancel-btn"
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