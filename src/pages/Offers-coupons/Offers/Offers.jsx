import React, { useEffect, useMemo, useState } from "react";
import {
  Tag,
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
  IndianRupee,
  Gift,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import {
  getOffers,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
} from "../../../services/offerService";

import { getStores } from "../../../services/storeService";
import { getProducts } from "../../../services/productService";

import "./Offers.css";

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "flat", label: "Flat Amount (₹)" },
];

const emptyForm = {
  offerName: "",
  store: "",
  product: "",
  category: "",
  subCategory: "",
  discountType: "percentage",
  discountValue: "",
  startDate: "",
  endDate: "",
  status: true,
};

export default function Offer() {
  const [offers, setOffers] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingOffer, setViewingOffer] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // ======================================================
  // LOAD MASTER DATA
  // ======================================================
  const loadMasterData = async () => {
    try {
      const [storesRes, productsRes] = await Promise.allSettled([
        getStores(),
        getProducts(),
      ]);

      if (storesRes.status === "fulfilled") {
        const d =
          storesRes.value?.data?.data ||
          storesRes.value?.data?.stores ||
          storesRes.value?.data ||
          [];
        setStores(Array.isArray(d) ? d : []);
      }

      if (productsRes.status === "fulfilled") {
        const d =
          productsRes.value?.data?.data ||
          productsRes.value?.data?.products ||
          productsRes.value?.data ||
          [];
        setProducts(Array.isArray(d) ? d : []);
      }
    } catch (error) {
      console.error("Master Data Load Error:", error);
    }
  };

  // ======================================================
  // LOAD OFFERS
  // ======================================================
  const loadOffers = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (search) params.search = search;
      if (storeFilter) params.store = storeFilter;
      if (statusFilter !== "") params.status = statusFilter;

      const res = await getOffers(params);
      const data =
        res?.data?.data?.data ||
        res?.data?.data ||
        res?.data?.offers ||
        res?.data ||
        [];

      setOffers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Offers Error:", error);
      alert(error?.response?.data?.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadOffers();
  }, [storeFilter, statusFilter]);

  // ======================================================
  // RESOLVER HELPERS
  // ======================================================
  const getStoreName = (storeField) => {
    if (!storeField) return "—";
    if (typeof storeField === "object" && storeField !== null) {
      return storeField.storeName || storeField.name || "—";
    }
    const matched = stores.find((s) => String(s._id || s.id) === String(storeField));
    return matched?.storeName || matched?.name || storeField;
  };

  const getProductName = (prodField) => {
    if (!prodField) return null;
    if (typeof prodField === "object" && prodField !== null) {
      return prodField.productName || prodField.name || null;
    }
    const matched = products.find((p) => String(p._id || p.id) === String(prodField));
    return matched?.productName || matched?.name || null;
  };

  const clearFilters = () => {
    setSearch("");
    setStoreFilter("");
    setStatusFilter("");
    setTypeFilter("");
  };

  const filteredOffers = useMemo(() => {
    return offers.filter((item) => {
      const matchesSearch = search.trim()
        ? String(item.offerName || "")
            .toLowerCase()
            .includes(search.trim().toLowerCase()) ||
          getStoreName(item.store)
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        : true;

      const matchesType = typeFilter ? item.discountType === typeFilter : true;

      return matchesSearch && matchesType;
    });
  }, [offers, search, typeFilter, stores]);

  const summary = useMemo(() => {
    const activeOffers = offers.filter((o) => o.status === true).length;
    const percentageCount = offers.filter((o) => o.discountType === "percentage").length;
    const flatCount = offers.filter((o) => o.discountType === "flat").length;

    return {
      total: offers.length,
      active: activeOffers,
      percentage: percentageCount,
      flat: flatCount,
    };
  }, [offers]);

  // ======================================================
  // MODAL HANDLERS
  // ======================================================
  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (offer) => {
    setEditingId(offer._id);
    setForm({
      offerName: offer.offerName || "",
      store: offer.store?._id || offer.store || "",
      product: offer.product?._id || offer.product || "",
      category: offer.category?._id || offer.category || "",
      subCategory: offer.subCategory?._id || offer.subCategory || "",
      discountType: offer.discountType || "percentage",
      discountValue: offer.discountValue ?? "",
      startDate: offer.startDate ? offer.startDate.split("T")[0] : "",
      endDate: offer.endDate ? offer.endDate.split("T")[0] : "",
      status: offer.status !== undefined ? Boolean(offer.status) : true,
    });
    setShowModal(true);
  };

  const openViewModal = (offer) => {
    setViewingOffer(offer);
    setShowViewModal(true);
  };

  // ======================================================
  // SUBMISSION & ACTIONS
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.offerName.trim()) {
      alert("Offer name is required");
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
        offerName: form.offerName.trim(),
        store: form.store,
        product: form.product || undefined,
        category: form.category || undefined,
        subCategory: form.subCategory || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        status: Boolean(form.status),
      };

      if (editingId) {
        await updateOffer(editingId, payload);
        alert("Offer updated successfully");
      } else {
        await createOffer(payload);
        alert("Offer created successfully");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadOffers();
    } catch (error) {
      console.error("Save Offer Error:", error);
      alert(error?.response?.data?.message || "Failed to process offer");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (offer) => {
    const isInactive = !offer.status;
    const promptMessage = isInactive
      ? `Activate offer "${offer.offerName}"?`
      : `Deactivate offer "${offer.offerName}"?`;

    if (!window.confirm(promptMessage)) return;

    try {
      setSaving(true);
      await toggleOfferStatus(offer._id);
      alert(`Offer ${isInactive ? "activated" : "deactivated"} successfully`);
      await loadOffers();
    } catch (error) {
      console.error("Toggle Status Error:", error);
      alert(error?.response?.data?.message || "Failed to update offer status");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (offer) => {
    const confirmed = window.confirm(
      `Permanently delete offer "${offer.offerName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteOffer(offer._id);
      alert("Offer deleted permanently");
      await loadOffers();
    } catch (error) {
      console.error("Delete Offer Error:", error);
      alert(error?.response?.data?.message || "Failed to delete offer");
    } finally {
      setSaving(false);
    }
  };

  const renderScopeBadge = (offer) => {
    const prod = getProductName(offer.product);
    if (prod) {
      return (
        <span className="offer-scope-pill pill-product" title={`Product: ${prod}`}>
          Product: {prod}
        </span>
      );
    }
    if (offer.category?.categoryName || offer.category) {
      return (
        <span className="offer-scope-pill pill-category">
          Category: {offer.category?.categoryName || "Applied"}
        </span>
      );
    }
    if (offer.subCategory?.subCategoryName || offer.subCategory) {
      return (
        <span className="offer-scope-pill pill-subcategory">
          SubCategory: {offer.subCategory?.subCategoryName || "Applied"}
        </span>
      );
    }
    return <span className="offer-scope-pill pill-store">Store-wide All Items</span>;
  };

  return (
    <div className="offer-page">
      <div className="offer-content">
        {/* HEADER */}
        <div className="offer-page-header">
          <div>
            <h2>Discounts & Promotional Offers</h2>
            <p>Configure percentage and flat promotional discounts across stores and inventories</p>
          </div>

          <button className="offer-primary-btn" onClick={openCreateModal}>
            <Plus size={18} />
            New Offer
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="offer-toolbar">
          <div className="offer-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search offer campaign, store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="offer-clear-search" onClick={() => setSearch("")}>
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="offer-filter-select"
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
            className="offer-filter-select"
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
            className="offer-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          {(search || storeFilter || typeFilter || statusFilter) && (
            <button type="button" className="offer-clear-btn" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>

        {/* SUMMARY CARDS */}
        <div className="offer-summary-grid">
          <div className="offer-summary-card card-blue">
            <div className="offer-summary-icon">
              <Gift size={22} />
            </div>
            <div>
              <h2>{summary.total}</h2>
              <p>Total Campaigns</p>
            </div>
          </div>

          <div className="offer-summary-card card-green">
            <div className="offer-summary-icon">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h2>{summary.active}</h2>
              <p>Active Offers</p>
            </div>
          </div>

          <div className="offer-summary-card card-purple">
            <div className="offer-summary-icon">
              <Percent size={22} />
            </div>
            <div>
              <h2>{summary.percentage}</h2>
              <p>Percentage Off Deals</p>
            </div>
          </div>

          <div className="offer-summary-card card-amber">
            <div className="offer-summary-icon">
              <IndianRupee size={22} />
            </div>
            <div>
              <h2>{summary.flat}</h2>
              <p>Flat Value Off Deals</p>
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="offer-table-card">
          <table className="offer-table">
            <thead>
              <tr>
                <th style={{ width: "16%" }}>Offer Campaign</th>
                <th style={{ width: "12%" }}>Store</th>
                <th style={{ width: "18%" }}>Target Scope</th>
                <th style={{ width: "12%" }}>Discount Value</th>
                <th style={{ width: "16%" }}>Validity Period</th>
                <th style={{ width: "9%" }}>Status</th>
                <th style={{ width: "19%" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="offer-empty-row">
                    <RefreshCw size={20} className="offer-spin" />
                    <span>Loading promotional offers...</span>
                  </td>
                </tr>
              ) : filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="offer-empty-row">
                    No promotional offers found.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong className="offer-name-text">{item.offerName}</strong>
                    </td>

                    <td title={getStoreName(item.store)}>
                      {getStoreName(item.store)}
                    </td>

                    <td>{renderScopeBadge(item)}</td>

                    <td>
                      <strong className="offer-discount-text">
                        {item.discountType === "percentage"
                          ? `${item.discountValue}% OFF`
                          : `₹${item.discountValue} FLAT`}
                      </strong>
                    </td>

                    <td>
                      <div className="offer-validity-cell">
                        <span>
                          {item.startDate
                            ? new Date(item.startDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Immediate"}
                          {" → "}
                          {item.endDate
                            ? new Date(item.endDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Open Ended"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${item.status ? "paid" : "pending"}`}>
                        {item.status ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="offer-actions" style={{ display: "flex", gap: "5px" }}>
                        {/* View */}
                        <button
                          type="button"
                          className="offer-action-btn view-btn"
                          title="View Offer Details"
                          onClick={() => openViewModal(item)}
                          style={{ width: "30px", height: "30px" }}
                        >
                          <Eye size={15} />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          className="offer-action-btn edit-btn"
                          title="Edit Campaign"
                          onClick={() => openEditModal(item)}
                          style={{ width: "30px", height: "30px" }}
                        >
                          <Edit size={15} />
                        </button>

                        {/* Status Toggle (Activate <-> Deactivate) */}
                        <button
                          type="button"
                          className={`offer-action-btn ${
                            !item.status ? "activate-btn" : "block-btn"
                          }`}
                          title={item.status ? "Deactivate Offer" : "Activate Offer"}
                          onClick={() => handleToggleStatus(item)}
                          style={{ width: "30px", height: "30px" }}
                        >
                          {!item.status ? (
                            <ShieldCheck size={15} />
                          ) : (
                            <ShieldAlert size={15} />
                          )}
                        </button>

                        {/* Permanent Delete */}
                        <button
                          type="button"
                          className="offer-action-btn delete-btn"
                          title="Permanently Delete Offer"
                          onClick={() => handleDelete(item)}
                          style={{ width: "30px", height: "30px" }}
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
          className="offer-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) setShowModal(false);
          }}
        >
          <div className="offer-modal">
            <div className="offer-modal-header">
              <h3>{editingId ? "Edit Promotional Offer" : "Create Promotional Offer"}</h3>
              <button
                className="offer-close-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="offer-modal-form-wrapper">
              <div className="offer-modal-body">
                <h4 className="offer-section-title">Campaign Info</h4>

                <div className="offer-form-grid">
                  <div className="offer-form-group">
                    <label>Offer Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Festival Mega 20% Off"
                      value={form.offerName}
                      onChange={(e) => setForm({ ...form, offerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="offer-form-group">
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

                  <div className="offer-form-group">
                    <label>Discount Type *</label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                      required
                    >
                      {DISCOUNT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="offer-form-group">
                    <label>
                      Discount Value {form.discountType === "percentage" ? "(%)" : "(₹)"} *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder={form.discountType === "percentage" ? "e.g. 15" : "e.g. 250"}
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <h4 className="offer-section-title">Target Item Scope (Optional)</h4>

                <div className="offer-form-grid">
                  <div className="offer-form-group offer-full">
                    <label>Specific Product</label>
                    <select
                      value={form.product}
                      onChange={(e) => setForm({ ...form, product: e.target.value })}
                    >
                      <option value="">All Products in Store</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.productName || p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <h4 className="offer-section-title">Validity Dates & Status</h4>

                <div className="offer-form-grid">
                  <div className="offer-form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>

                  <div className="offer-form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>

                  <div className="offer-form-group offer-checkbox-group">
                    <label className="offer-checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.checked })}
                      />
                      <span>Active and Available at Checkout</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="offer-modal-footer">
                <button
                  type="button"
                  className="offer-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" className="offer-save-btn" disabled={saving}>
                  <Save size={18} />
                  {saving ? "Saving..." : editingId ? "Update Campaign" : "Launch Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && viewingOffer && (
        <div
          className="offer-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowViewModal(false);
          }}
        >
          <div className="offer-modal offer-view-modal">
            <div className="offer-modal-header">
              <h3>Offer Details — {viewingOffer.offerName}</h3>
              <button
                className="offer-close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="offer-modal-body">
              <div className="offer-detail-grid">
                <div>
                  <span>Campaign Name</span>
                  <strong className="offer-name-text">{viewingOffer.offerName}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    <span className={`badge ${viewingOffer.status ? "paid" : "pending"}`}>
                      {viewingOffer.status ? "Active" : "Inactive"}
                    </span>
                  </strong>
                </div>

                <div>
                  <span>Store</span>
                  <strong>{getStoreName(viewingOffer.store)}</strong>
                </div>

                <div>
                  <span>Discount Value</span>
                  <strong className="offer-discount-text">
                    {viewingOffer.discountType === "percentage"
                      ? `${viewingOffer.discountValue}% Percentage Off`
                      : `₹${viewingOffer.discountValue} Flat Off`}
                  </strong>
                </div>

                <div>
                  <span>Specific Product</span>
                  <strong>{getProductName(viewingOffer.product) || "All Products"}</strong>
                </div>

                <div>
                  <span>Category Scope</span>
                  <strong>
                    {viewingOffer.category?.categoryName ||
                      viewingOffer.subCategory?.subCategoryName ||
                      "Store-wide"}
                  </strong>
                </div>

                <div>
                  <span>Start Date</span>
                  <strong>
                    {viewingOffer.startDate
                      ? new Date(viewingOffer.startDate).toLocaleDateString("en-IN")
                      : "Immediate"}
                  </strong>
                </div>

                <div>
                  <span>End Date</span>
                  <strong>
                    {viewingOffer.endDate
                      ? new Date(viewingOffer.endDate).toLocaleDateString("en-IN")
                      : "No Expiry Limit"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="offer-modal-footer">
              <button
                type="button"
                className="offer-cancel-btn"
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