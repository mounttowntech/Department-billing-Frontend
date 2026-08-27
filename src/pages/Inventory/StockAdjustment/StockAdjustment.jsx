import React, { useEffect, useMemo, useState } from "react";
import {
  Sliders,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  TrendingUp,
  TrendingDown,
  Layers,
} from "lucide-react";

import {
  getStockAdjustments,
  createStockAdjustment,
  updateStockAdjustment,
  deleteStockAdjustment,
} from "../../../services/stockAdjustmentService";

import { getStores } from "../../../services/storeService";
import { getWarehouses } from "../../../services/warehouseService";
import { getProducts } from "../../../services/productService";
import { getVariants } from "../../../services/productVariantService";

import "./StockAdjustment.css";

const generateAdjustmentNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const time = String(now.getTime()).slice(-4);
  return `ADJ-${year}${month}${day}-${time}`;
};

const emptyForm = {
  adjustmentNo: "",
  store: "",
  warehouse: "",
  product: "",
  variant: "",
  skuCode: "",
  adjustmentType: "increase",
  quantity: 1,
  reason: "",
};

export default function StockAdjustment() {
  const [adjustments, setAdjustments] = useState([]);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // ======================================================
  // LOAD MASTER DATA
  // ======================================================
  const loadMasterData = async () => {
    try {
      const [storesRes, whRes, prodRes, varRes] = await Promise.allSettled([
        getStores(),
        getWarehouses(),
        getProducts(),
        getVariants(),
      ]);

      if (storesRes.status === "fulfilled") {
        const d =
          storesRes.value?.data?.data ||
          storesRes.value?.data?.stores ||
          storesRes.value?.data ||
          [];
        setStores(Array.isArray(d) ? d : []);
      }

      if (whRes.status === "fulfilled") {
        const d =
          whRes.value?.data?.data ||
          whRes.value?.data?.warehouses ||
          whRes.value?.data ||
          [];
        setWarehouses(Array.isArray(d) ? d : []);
      }

      if (prodRes.status === "fulfilled") {
        const d =
          prodRes.value?.data?.data ||
          prodRes.value?.data?.products ||
          prodRes.value?.data ||
          [];
        setProducts(Array.isArray(d) ? d : []);
      }

      if (varRes.status === "fulfilled") {
        const d =
          varRes.value?.data?.data ||
          varRes.value?.data?.variants ||
          varRes.value?.data ||
          [];
        setVariants(Array.isArray(d) ? d : []);
      }
    } catch (error) {
      console.error("Failed to load master data:", error);
    }
  };

  // ======================================================
  // LOAD ADJUSTMENTS
  // ======================================================
  const loadAdjustments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (storeFilter) params.store = storeFilter;
      if (typeFilter) params.adjustmentType = typeFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const res = await getStockAdjustments(params);
      const data = res?.data?.data || res?.data || [];
      setAdjustments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Stock Adjustments Error:", error);
      alert(
        error?.response?.data?.message || "Failed to load stock adjustments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadAdjustments();
  }, [storeFilter, typeFilter, fromDate, toDate]);

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

  const getWarehouseName = (whField) => {
    if (!whField) return "—";
    if (typeof whField === "object" && whField !== null) {
      return whField.warehouseName || whField.name || "—";
    }
    const matched = warehouses.find((w) => String(w._id || w.id) === String(whField));
    return matched?.warehouseName || matched?.name || "—";
  };

  const getProductName = (pField, variantField) => {
    if (pField && typeof pField === "object" && pField !== null) {
      return pField.productName || pField.name || "—";
    }
    if (pField) {
      const matched = products.find((p) => String(p._id || p.id) === String(pField));
      if (matched) return matched.productName || matched.name || "—";
    }
    if (variantField) {
      const varId = typeof variantField === "object" ? variantField._id : variantField;
      const matchedVar = variants.find((v) => String(v._id || v.id) === String(varId));
      if (matchedVar?.product) {
        const prodObj = products.find(
          (p) => String(p._id || p.id) === String(matchedVar.product?._id || matchedVar.product)
        );
        return prodObj?.productName || prodObj?.name || "—";
      }
    }
    return typeof pField === "string" ? pField : "—";
  };

  // ======================================================
  // CLEAR FILTERS HANDLER
  // ======================================================
  const clearFilters = () => {
    setSearch("");
    setStoreFilter("");
    setTypeFilter("");
    setFromDate("");
    setToDate("");
  };

  const filteredAdjustments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return adjustments;

    return adjustments.filter((item) => {
      const storeName = getStoreName(item.store).toLowerCase();
      const prodName = getProductName(item.product, item.variant).toLowerCase();
      const sku = String(item.skuCode || item.variant?.skuCode || "").toLowerCase();
      const adjNo = String(item.adjustmentNo || "").toLowerCase();

      return (
        adjNo.includes(term) ||
        storeName.includes(term) ||
        prodName.includes(term) ||
        sku.includes(term)
      );
    });
  }, [adjustments, search, stores, products, variants]);

  const summary = useMemo(() => {
    const increases = adjustments.filter((a) => a.adjustmentType === "increase");
    const decreases = adjustments.filter((a) => a.adjustmentType === "decrease");

    const totalQtyAdjusted = adjustments.reduce(
      (sum, a) => sum + Number(a.quantity || 0),
      0
    );

    return {
      total: adjustments.length,
      increases: increases.length,
      decreases: decreases.length,
      totalQty: totalQtyAdjusted,
    };
  }, [adjustments]);

  // ======================================================
  // MODAL HANDLERS
  // ======================================================
  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      adjustmentNo: generateAdjustmentNo(),
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setForm({
      adjustmentNo: item.adjustmentNo,
      store: item.store?._id || item.store || "",
      warehouse: item.warehouse?._id || item.warehouse || "",
      product: item.product?._id || item.product || "",
      variant: item.variant?._id || item.variant || "",
      skuCode: item.skuCode || item.variant?.skuCode || "",
      adjustmentType: item.adjustmentType || "increase",
      quantity: item.quantity || 1,
      reason: item.reason || "",
    });
    setShowModal(true);
  };

  const openViewModal = (item) => {
    setViewingItem(item);
    setShowViewModal(true);
  };

  const handleProductChange = (productId) => {
    setForm((prev) => ({
      ...prev,
      product: productId,
      variant: "",
      skuCode: "",
    }));
  };

  const handleVariantChange = (variantId) => {
    const variantObj = variants.find(
      (v) => String(v._id || v.id) === String(variantId)
    );
    setForm((prev) => ({
      ...prev,
      variant: variantId,
      skuCode: variantObj?.skuCode || "",
      product: variantObj?.product?._id || variantObj?.product || prev.product,
    }));
  };

  const availableVariants = useMemo(() => {
    if (!form.product) return variants;
    return variants.filter(
      (v) => String(v.product?._id || v.product) === String(form.product)
    );
  }, [variants, form.product]);

  // ======================================================
  // FORM SUBMISSION
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.store) {
      alert("Store is required");
      return;
    }
    if (!form.variant) {
      alert("Variant is required");
      return;
    }
    if (Number(form.quantity) <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        adjustmentNo: form.adjustmentNo,
        store: form.store,
        warehouse: form.warehouse || null,
        product: form.product,
        variant: form.variant,
        skuCode: form.skuCode,
        adjustmentType: form.adjustmentType,
        quantity: Number(form.quantity),
        reason: form.reason?.trim() || "",
      };

      if (editingId) {
        await updateStockAdjustment(editingId, payload);
        alert("Stock Adjustment updated successfully");
      } else {
        await createStockAdjustment(payload);
        alert("Stock Adjustment created successfully");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadAdjustments();
    } catch (error) {
      console.error("Save Stock Adjustment Error:", error);
      alert(
        error?.response?.data?.message || "Failed to process stock adjustment"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete adjustment ${item.adjustmentNo}? This will permanently reverse the inventory move.`
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteStockAdjustment(item._id);
      alert("Stock Adjustment deleted and inventory reversed successfully");
      await loadAdjustments();
    } catch (error) {
      console.error("Delete Stock Adjustment Error:", error);
      alert(
        error?.response?.data?.message || "Failed to delete stock adjustment"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stockadj-page">
      <div className="stockadj-content">
        {/* HEADER */}
        <div className="stockadj-page-header">
          <div>
            <h2>Stock Adjustments</h2>
            <p>Track, reconcile, and audit manual inventory changes</p>
          </div>

          <button className="stockadj-primary-btn" onClick={openCreateModal}>
            <Plus size={18} />
            New Adjustment
          </button>
        </div>


        <div className="stockadj-toolbar">
          <div className="stockadj-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search Adjustment No, Store, Product, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="stockadj-clear-search"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="stockadj-filter-select"
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
            className="stockadj-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="increase">Increase (+)</option>
            <option value="decrease">Decrease (-)</option>
          </select>

          <input
            type="date"
            className="stockadj-date-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            type="date"
            className="stockadj-date-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          {(search || storeFilter || typeFilter || fromDate || toDate) && (
            <button
              type="button"
              className="stockadj-clear-btn"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}


        </div>


        <div className="stockadj-summary-grid">
          <div className="stockadj-summary-card card-blue">
            <div className="stockadj-summary-icon">
              <Sliders size={22} />
            </div>
            <div>
              <h2>{summary.total}</h2>
              <p>Total Adjustments</p>
            </div>
          </div>

          <div className="stockadj-summary-card card-green">
            <div className="stockadj-summary-icon">
              <TrendingUp size={22} />
            </div>
            <div>
              <h2>{summary.increases}</h2>
              <p>Stock In (+)</p>
            </div>
          </div>

          <div className="stockadj-summary-card card-red">
            <div className="stockadj-summary-icon">
              <TrendingDown size={22} />
            </div>
            <div>
              <h2>{summary.decreases}</h2>
              <p>Stock Out (-)</p>
            </div>
          </div>

          <div className="stockadj-summary-card card-purple">
            <div className="stockadj-summary-icon">
              <Layers size={22} />
            </div>
            <div>
              <h2>{summary.totalQty}</h2>
              <p>Units Adjusted</p>
            </div>
          </div>
        </div>
        <div className="stockadj-table-card">
          <table className="stockadj-table">
            <thead>
              <tr>
                <th style={{ width: "12%" }}>Adjustment No</th>
                <th style={{ width: "13%" }}>Store</th>
                <th style={{ width: "16%" }}>Product</th>
                <th style={{ width: "11%" }}>SKU</th>
                <th style={{ width: "9%" }}>Type</th>
                <th style={{ width: "7%" }}>Qty</th>
                <th style={{ width: "7%" }}>Before</th>
                <th style={{ width: "7%" }}>After</th>
                <th style={{ width: "10%" }}>Date</th>
                <th style={{ width: "12%" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="stockadj-empty-row">
                    <RefreshCw size={20} className="stockadj-spin" />
                    <span>Loading stock adjustments...</span>
                  </td>
                </tr>
              ) : filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan="10" className="stockadj-empty-row">
                    No stock adjustments found.
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong className="stockadj-number">
                        {item.adjustmentNo}
                      </strong>
                    </td>

                    <td title={getStoreName(item.store)}>
                      {getStoreName(item.store)}
                    </td>

                    <td title={getProductName(item.product, item.variant)}>
                      {getProductName(item.product, item.variant)}
                    </td>

                    <td>{item.skuCode || item.variant?.skuCode || "—"}</td>

                    <td>
                      <span
                        className={`badge ${
                          item.adjustmentType === "increase" ? "paid" : "pending"
                        }`}
                      >
                        {item.adjustmentType === "increase" ? "+ In" : "- Out"}
                      </span>
                    </td>

                    <td>
                      <strong
                        className={
                          item.adjustmentType === "increase"
                            ? "stockadj-green-text"
                            : "stockadj-red-text"
                        }
                      >
                        {item.adjustmentType === "increase" ? "+" : "-"}
                        {item.quantity}
                      </strong>
                    </td>

                    <td>{item.beforeStock ?? "—"}</td>

                    <td>
                      <strong>{item.afterStock ?? "—"}</strong>
                    </td>

                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    <td>
                      <div className="stockadj-actions">
                        <button
                          className="stockadj-action-btn view-btn"
                          title="View"
                          onClick={() => openViewModal(item)}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          className="stockadj-action-btn edit-btn"
                          title="Edit"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          className="stockadj-action-btn delete-btn"
                          title="Delete & Reverse"
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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div
          className="stockadj-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setShowModal(false);
            }
          }}
        >
          <div className="stockadj-modal">
            <div className="stockadj-modal-header">
              <h3>
                {editingId ? "Edit Stock Adjustment" : "New Stock Adjustment"}
              </h3>
              <button
                className="stockadj-close-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="stockadj-modal-form-wrapper">
              <div className="stockadj-modal-body">
                <h4 className="stockadj-section-title">Adjustment Overview</h4>

                <div className="stockadj-form-grid">
                  <div className="stockadj-form-group">
                    <label>Adjustment No</label>
                    <input
                      type="text"
                      value={form.adjustmentNo}
                      readOnly
                      disabled
                      className="stockadj-readonly-input"
                    />
                  </div>

                  <div className="stockadj-form-group">
                    <label>Store *</label>
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

                  <div className="stockadj-form-group">
                    <label>Warehouse (Optional)</label>
                    <select
                      value={form.warehouse}
                      onChange={(e) =>
                        setForm({ ...form, warehouse: e.target.value })
                      }
                    >
                      <option value="">None / Main Store</option>
                      {warehouses.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.warehouseName || w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="stockadj-form-group">
                    <label>Adjustment Type *</label>
                    <select
                      value={form.adjustmentType}
                      onChange={(e) =>
                        setForm({ ...form, adjustmentType: e.target.value })
                      }
                      required
                    >
                      <option value="increase">Increase Stock (+)</option>
                      <option value="decrease">Decrease Stock (-)</option>
                    </select>
                  </div>
                </div>

                <h4 className="stockadj-section-title">Item Details</h4>

                <div className="stockadj-form-grid">
                  <div className="stockadj-form-group">
                    <label>Product *</label>
                    <select
                      value={form.product}
                      onChange={(e) => handleProductChange(e.target.value)}
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.productName || p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="stockadj-form-group">
                    <label>Variant / SKU *</label>
                    <select
                      value={form.variant}
                      onChange={(e) => handleVariantChange(e.target.value)}
                      required
                    >
                      <option value="">Select Variant</option>
                      {availableVariants.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.skuCode} {v.packSize ? `(${v.packSize})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="stockadj-form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="stockadj-form-group">
                    <label>SKU Code</label>
                    <input
                      type="text"
                      value={form.skuCode}
                      readOnly
                      disabled
                      className="stockadj-readonly-input"
                    />
                  </div>
                </div>

                <div className="stockadj-form-group stockadj-full">
                  <label>Reason / Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Enter reason for adjustment (e.g. Damage, Audit Reconciliation, Expiry)..."
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="stockadj-modal-footer">
                <button
                  type="button"
                  className="stockadj-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="stockadj-save-btn"
                  disabled={saving}
                >
                  <Save size={18} />
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Adjustment"
                    : "Post Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && viewingItem && (
        <div
          className="stockadj-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewModal(false);
            }
          }}
        >
          <div className="stockadj-modal stockadj-view-modal">
            <div className="stockadj-modal-header">
              <h3>Stock Adjustment Details — {viewingItem.adjustmentNo}</h3>
              <button
                className="stockadj-close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="stockadj-modal-body">
              <div className="stockadj-detail-grid">
                <div>
                  <span>Adjustment No</span>
                  <strong>{viewingItem.adjustmentNo}</strong>
                </div>

                <div>
                  <span>Type</span>
                  <strong>
                    <span
                      className={`badge ${
                        viewingItem.adjustmentType === "increase"
                          ? "paid"
                          : "pending"
                      }`}
                    >
                      {viewingItem.adjustmentType === "increase"
                        ? "Increase (+)"
                        : "Decrease (-)"}
                    </span>
                  </strong>
                </div>

                <div>
                  <span>Store</span>
                  <strong>{getStoreName(viewingItem.store)}</strong>
                </div>

                <div>
                  <span>Warehouse</span>
                  <strong>{getWarehouseName(viewingItem.warehouse)}</strong>
                </div>

                <div>
                  <span>Product</span>
                  <strong>
                    {getProductName(viewingItem.product, viewingItem.variant)}
                  </strong>
                </div>

                <div>
                  <span>SKU Code</span>
                  <strong>
                    {viewingItem.skuCode ||
                      viewingItem.variant?.skuCode ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Quantity</span>
                  <strong
                    className={
                      viewingItem.adjustmentType === "increase"
                        ? "stockadj-green-text"
                        : "stockadj-red-text"
                    }
                  >
                    {viewingItem.adjustmentType === "increase" ? "+" : "-"}
                    {viewingItem.quantity}
                  </strong>
                </div>

                <div>
                  <span>Before Stock</span>
                  <strong>{viewingItem.beforeStock ?? "—"}</strong>
                </div>

                <div>
                  <span>After Stock</span>
                  <strong>{viewingItem.afterStock ?? "—"}</strong>
                </div>

                <div>
                  <span>Created At</span>
                  <strong>
                    {viewingItem.createdAt
                      ? new Date(viewingItem.createdAt).toLocaleString("en-IN")
                      : "—"}
                  </strong>
                </div>
              </div>

              {viewingItem.reason && (
                <div className="stockadj-notes">
                  <span>Reason / Remarks</span>
                  <p>{viewingItem.reason}</p>
                </div>
              )}
            </div>

            <div className="stockadj-modal-footer">
              <button
                type="button"
                className="stockadj-cancel-btn"
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