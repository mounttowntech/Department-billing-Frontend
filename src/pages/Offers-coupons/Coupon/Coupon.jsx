import React, { useEffect, useMemo, useState } from "react";
import {
  Ticket,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Percent,
  Layers,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../../../services/couponService";

import { getStores } from "../../../services/storeService";
import "./Coupon.css";

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "flat", label: "Flat Amount (₹)" },
];

const generateCouponCode = () => {
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SAVE-${randomChars}`;
};

const emptyForm = {
  couponCode: "",
  store: "",
  discountType: "percentage",
  discountValue: "",
  minBillAmount: 0,
  maxDiscountAmount: 0,
  startDate: "",
  endDate: "",
  usageLimit: 0,
  status: true,
};

export default function Coupon() {
  const [coupons, setCoupons] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingCoupon, setViewingCoupon] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadMasterData = async () => {
    try {
      const res = await getStores();
      const storeData =
        res?.data?.data ||
        res?.data?.stores ||
        res?.data ||
        res?.stores ||
        [];
      setStores(Array.isArray(storeData) ? storeData : []);
    } catch (error) {
      console.error("Load Stores Error:", error);
    }
  };

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (search) params.search = search;
      if (storeFilter) params.store = storeFilter;
      if (statusFilter !== "") params.status = statusFilter;

      const res = await getCoupons(params);
      const rawList =
        res?.data?.data ||
        res?.data?.coupons ||
        res?.data ||
        res?.coupons ||
        res ||
        [];

      setCoupons(Array.isArray(rawList) ? rawList : []);
    } catch (error) {
      console.error("Load Coupons Error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load coupons"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [storeFilter, statusFilter]);

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

  const clearFilters = () => {
    setSearch("");
    setStoreFilter("");
    setTypeFilter("");
    setStatusFilter("");
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((item) => {
      const code = String(item.couponCode || "").toLowerCase();
      const storeName = getStoreName(item.store).toLowerCase();
      const term = search.trim().toLowerCase();

      const matchesSearch = term
        ? code.includes(term) || storeName.includes(term)
        : true;
      const matchesType = typeFilter ? item.discountType === typeFilter : true;

      return matchesSearch && matchesType;
    });
  }, [coupons, search, typeFilter, stores]);

  const summary = useMemo(() => {
    const activeCoupons = coupons.filter((c) => c.status === true).length;
    const totalRedemptions = coupons.reduce(
      (sum, c) => sum + Number(c.usedCount || 0),
      0
    );
    const percentageCount = coupons.filter(
      (c) => c.discountType === "percentage"
    ).length;

    return {
      total: coupons.length,
      active: activeCoupons,
      redemptions: totalRedemptions,
      percentage: percentageCount,
    };
  }, [coupons]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      couponCode: generateCouponCode(),
    });
    setShowModal(true);
  };

  const openEditModal = async (coupon) => {
    setEditingId(coupon._id);
    try {
      const res = await getCouponById(coupon._id);
      const data = res?.data || res || coupon;

      setForm({
        couponCode: data.couponCode || "",
        store: data.store?._id || data.store || "",
        discountType: data.discountType || "percentage",
        discountValue: data.discountValue ?? "",
        minBillAmount: data.minBillAmount ?? 0,
        maxDiscountAmount: data.maxDiscountAmount ?? 0,
        startDate: data.startDate ? data.startDate.split("T")[0] : "",
        endDate: data.endDate ? data.endDate.split("T")[0] : "",
        usageLimit: data.usageLimit ?? 0,
        status: data.status !== undefined ? Boolean(data.status) : true,
      });
      setShowModal(true);
    } catch {
      setForm({
        couponCode: coupon.couponCode || "",
        store: coupon.store?._id || coupon.store || "",
        discountType: coupon.discountType || "percentage",
        discountValue: coupon.discountValue ?? "",
        minBillAmount: coupon.minBillAmount ?? 0,
        maxDiscountAmount: coupon.maxDiscountAmount ?? 0,
        startDate: coupon.startDate ? coupon.startDate.split("T")[0] : "",
        endDate: coupon.endDate ? coupon.endDate.split("T")[0] : "",
        usageLimit: coupon.usageLimit ?? 0,
        status: coupon.status !== undefined ? Boolean(coupon.status) : true,
      });
      setShowModal(true);
    }
  };

  const openViewModal = (coupon) => {
    setViewingCoupon(coupon);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.couponCode.trim()) {
      alert("Coupon code is required");
      return;
    }
    if (!form.store) {
      alert("Store selection is required");
      return;
    }
    if (form.discountValue === "" || Number(form.discountValue) < 0) {
      alert("Please enter a valid discount value");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        couponCode: form.couponCode.trim().toUpperCase(),
        store: form.store,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minBillAmount: Number(form.minBillAmount || 0),
        maxDiscountAmount: Number(form.maxDiscountAmount || 0),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        usageLimit: Number(form.usageLimit || 0),
        status: Boolean(form.status),
      };

      if (editingId) {
        await updateCoupon(editingId, payload);
        alert("Coupon updated successfully");
      } else {
        await createCoupon(payload);
        alert("Coupon created successfully");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadCoupons();
    } catch (error) {
      console.error("Save Coupon Error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to process coupon"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    const nextStatus = !coupon.status;
    const promptMessage = nextStatus
      ? `Activate coupon "${coupon.couponCode}"?`
      : `Deactivate coupon "${coupon.couponCode}"?`;

    if (!window.confirm(promptMessage)) return;

    try {
      setSaving(true);
      await updateCoupon(coupon._id, { status: nextStatus });
      alert(`Coupon ${nextStatus ? "activated" : "deactivated"} successfully`);
      await loadCoupons();
    } catch (error) {
      console.error("Toggle Status Error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update coupon status"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(
      `Permanently delete coupon "${coupon.couponCode}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteCoupon(coupon._id);
      alert("Coupon deleted permanently");
      await loadCoupons();
    } catch (error) {
      console.error("Delete Coupon Error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete coupon"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="coupon-page">
      <div className="coupon-content">
        <div className="coupon-page-header">
          <div>
            <h2>Vouchers & Coupons</h2>
            <p>
              Issue checkout promo codes, manage minimum thresholds, and track
              usage caps
            </p>
          </div>

          <button className="coupon-primary-btn" onClick={openCreateModal}>
            <Plus size={18} />
            New Coupon
          </button>
        </div>

        <div className="coupon-toolbar">
          <div className="coupon-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search coupon code, store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="coupon-clear-search"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="coupon-filter-select"
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
            className="coupon-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Discount Types</option>
            {DISCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            className="coupon-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          {(search || storeFilter || typeFilter || statusFilter) && (
            <button
              type="button"
              className="coupon-clear-btn"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}
        </div>

        <div className="coupon-summary-grid">
          <div className="coupon-summary-card card-blue">
            <div className="coupon-summary-icon">
              <Ticket size={22} />
            </div>
            <div>
              <h2>{summary.total}</h2>
              <p>Total Coupons</p>
            </div>
          </div>

          <div className="coupon-summary-card card-green">
            <div className="coupon-summary-icon">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h2>{summary.active}</h2>
              <p>Active Promo Codes</p>
            </div>
          </div>

          <div className="coupon-summary-card card-purple">
            <div className="coupon-summary-icon">
              <Percent size={22} />
            </div>
            <div>
              <h2>{summary.percentage}</h2>
              <p>Percentage Discounts</p>
            </div>
          </div>

          <div className="coupon-summary-card card-amber">
            <div className="coupon-summary-icon">
              <Layers size={22} />
            </div>
            <div>
              <h2>{summary.redemptions}</h2>
              <p>Times Redeemed</p>
            </div>
          </div>
        </div>

        <div className="coupon-table-card">
          <table className="coupon-table">
            <thead>
              <tr>
                <th style={{ width: "16%" }}>Coupon Code</th>
                <th style={{ width: "13%" }}>Store</th>
                <th style={{ width: "12%" }}>Discount</th>
                <th style={{ width: "13%" }}>Min / Max Bill</th>
                <th style={{ width: "11%" }}>Usage / Limit</th>
                <th style={{ width: "15%" }}>Validity Period</th>
                <th style={{ width: "8%" }}>Status</th>
                <th style={{ width: "19%" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="coupon-empty-row">
                    <RefreshCw size={20} className="coupon-spin" />
                    <span>Loading promotional coupons...</span>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="8" className="coupon-empty-row">
                    No promotional coupons found.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong className="coupon-code-badge">
                        {item.couponCode}
                      </strong>
                    </td>

                    <td title={getStoreName(item.store)}>
                      {getStoreName(item.store)}
                    </td>

                    <td>
                      <strong className="coupon-discount-text">
                        {item.discountType === "percentage"
                          ? `${item.discountValue}% OFF`
                          : `₹${item.discountValue} FLAT`}
                      </strong>
                    </td>

                    <td>
                      <div className="coupon-threshold-cell">
                        <span>Min: ₹{item.minBillAmount || 0}</span>
                        {item.maxDiscountAmount > 0 && (
                          <small>Max: ₹{item.maxDiscountAmount}</small>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="coupon-usage-text">
                        {item.usedCount || 0} /{" "}
                        {item.usageLimit > 0 ? item.usageLimit : "∞"}
                      </span>
                    </td>

                    <td>
                      <div className="coupon-validity-cell">
                        <span>
                          {item.startDate
                            ? new Date(item.startDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )
                            : "Immediate"}
                          {" → "}
                          {item.endDate
                            ? new Date(item.endDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "No Expiry"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`badge ${item.status ? "paid" : "pending"}`}
                      >
                        {item.status ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="coupon-actions">
                        <button
                          type="button"
                          className="coupon-action-btn view-btn"
                          title="View Details"
                          onClick={() => openViewModal(item)}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          className="coupon-action-btn edit-btn"
                          title="Edit Coupon"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          type="button"
                          className={`coupon-action-btn ${
                            !item.status ? "activate-btn" : "block-btn"
                          }`}
                          title={
                            item.status
                              ? "Deactivate Coupon"
                              : "Activate Coupon"
                          }
                          onClick={() => handleToggleStatus(item)}
                        >
                          {!item.status ? (
                            <ShieldCheck size={15} />
                          ) : (
                            <ShieldAlert size={15} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="coupon-action-btn delete-btn"
                          title="Permanently Delete"
                          onClick={() => handleDelete(item)}
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
          className="coupon-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) setShowModal(false);
          }}
        >
          <div className="coupon-modal">
            <div className="coupon-modal-header">
              <h3>{editingId ? "Edit Promo Coupon" : "Create Promo Coupon"}</h3>
              <button
                className="coupon-close-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="coupon-modal-form-wrapper">
              <div className="coupon-modal-body">
                <h4 className="coupon-section-title">Identity & Placement</h4>

                <div className="coupon-form-grid">
                  <div className="coupon-form-group">
                    <label>Coupon Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. FESTIVE2026"
                      value={form.couponCode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          couponCode: e.target.value.toUpperCase(),
                        })
                      }
                      required
                    />
                  </div>

                  <div className="coupon-form-group">
                    <label>Assigned Store *</label>
                    <select
                      value={form.store}
                      onChange={(e) =>
                        setForm({ ...form, store: e.target.value })
                      }
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

                  <div className="coupon-form-group">
                    <label>Discount Type *</label>
                    <select
                      value={form.discountType}
                      onChange={(e) =>
                        setForm({ ...form, discountType: e.target.value })
                      }
                      required
                    >
                      {DISCOUNT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="coupon-form-group">
                    <label>
                      Discount Value{" "}
                      {form.discountType === "percentage" ? "(%)" : "(₹)"} *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder={
                        form.discountType === "percentage"
                          ? "e.g. 10"
                          : "e.g. 150"
                      }
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm({ ...form, discountValue: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <h4 className="coupon-section-title">Thresholds & Caps</h4>

                <div className="coupon-form-grid">
                  <div className="coupon-form-group">
                    <label>Minimum Bill Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 for no minimum"
                      value={form.minBillAmount}
                      onChange={(e) =>
                        setForm({ ...form, minBillAmount: e.target.value })
                      }
                    />
                  </div>

                  <div className="coupon-form-group">
                    <label>Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 for unlimited"
                      value={form.maxDiscountAmount}
                      onChange={(e) =>
                        setForm({ ...form, maxDiscountAmount: e.target.value })
                      }
                    />
                  </div>

                  <div className="coupon-form-group coupon-full">
                    <label>Global Usage Limit</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 for unlimited total redemptions"
                      value={form.usageLimit}
                      onChange={(e) =>
                        setForm({ ...form, usageLimit: e.target.value })
                      }
                    />
                  </div>
                </div>

                <h4 className="coupon-section-title">
                  Validity Dates & Status
                </h4>

                <div className="coupon-form-grid">
                  <div className="coupon-form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm({ ...form, startDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="coupon-form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm({ ...form, endDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="coupon-form-group coupon-checkbox-group">
                    <label className="coupon-checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.checked })
                        }
                      />
                      <span>Active and Redeemable at Checkout</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="coupon-modal-footer">
                <button
                  type="button"
                  className="coupon-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="coupon-save-btn"
                  disabled={saving}
                >
                  <Save size={18} />
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Coupon"
                    : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewingCoupon && (
        <div
          className="coupon-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowViewModal(false);
          }}
        >
          <div className="coupon-modal coupon-view-modal">
            <div className="coupon-modal-header">
              <h3>Coupon Details — {viewingCoupon.couponCode}</h3>
              <button
                className="coupon-close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="coupon-modal-body">
              <div className="coupon-detail-grid">
                <div>
                  <span>Coupon Code</span>
                  <strong className="coupon-code-badge">
                    {viewingCoupon.couponCode}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    <span
                      className={`badge ${
                        viewingCoupon.status ? "paid" : "pending"
                      }`}
                    >
                      {viewingCoupon.status ? "Active" : "Inactive"}
                    </span>
                  </strong>
                </div>

                <div>
                  <span>Store</span>
                  <strong>{getStoreName(viewingCoupon.store)}</strong>
                </div>

                <div>
                  <span>Discount Value</span>
                  <strong className="coupon-discount-text">
                    {viewingCoupon.discountType === "percentage"
                      ? `${viewingCoupon.discountValue}% Off`
                      : `₹${viewingCoupon.discountValue} Flat Off`}
                  </strong>
                </div>

                <div>
                  <span>Min Bill Threshold</span>
                  <strong>₹{viewingCoupon.minBillAmount || 0}</strong>
                </div>

                <div>
                  <span>Max Discount Limit</span>
                  <strong>
                    {viewingCoupon.maxDiscountAmount > 0
                      ? `₹${viewingCoupon.maxDiscountAmount}`
                      : "No Cap"}
                  </strong>
                </div>

                <div>
                  <span>Usage Redemptions</span>
                  <strong>
                    {viewingCoupon.usedCount || 0} of{" "}
                    {viewingCoupon.usageLimit > 0
                      ? viewingCoupon.usageLimit
                      : "Unlimited"}
                  </strong>
                </div>

                <div>
                  <span>Active Validity</span>
                  <strong>
                    {viewingCoupon.startDate
                      ? new Date(viewingCoupon.startDate).toLocaleDateString(
                          "en-IN"
                        )
                      : "Immediate"}
                    {" — "}
                    {viewingCoupon.endDate
                      ? new Date(viewingCoupon.endDate).toLocaleDateString(
                          "en-IN"
                        )
                      : "No Expiry"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="coupon-modal-footer">
              <button
                type="button"
                className="coupon-cancel-btn"
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