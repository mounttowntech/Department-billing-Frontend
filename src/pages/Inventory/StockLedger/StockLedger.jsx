import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
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
  Boxes,
  Layers,
  History,
} from "lucide-react";

import {
  getStockLedgers,
  createStockLedger,
  updateStockLedger,
  deleteStockLedger,
} from "../../../services/stockLedgerService";

import { getStores } from "../../../services/storeService";
import { getWarehouses } from "../../../services/warehouseService";
import { getProducts } from "../../../services/productService";
import { getVariants } from "../../../services/productVariantService";

import "./StockLedger.css";

const MOVEMENT_TYPES = [
  { value: "purchase", label: "Purchase (+ In)", type: "in" },
  { value: "sale", label: "Sale (- Out)", type: "out" },
  { value: "sales_return", label: "Sales Return (+ In)", type: "in" },
  { value: "purchase_return", label: "Purchase Return (- Out)", type: "out" },
  { value: "adjustment_in", label: "Adjustment (+ In)", type: "in" },
  { value: "adjustment_out", label: "Adjustment (- Out)", type: "out" },
  { value: "transfer_in", label: "Transfer (+ In)", type: "in" },
  { value: "transfer_out", label: "Transfer (- Out)", type: "out" },
];

const REFERENCE_MODELS = [
  "Purchase",
  "SalesInvoice",
  "PurchaseReturn",
  "SalesReturn",
  "StockAdjustment",
  "StockTransfer",
  "OpeningStock",
];

const emptyForm = {
  store: "",
  warehouse: "",
  product: "",
  variant: "",
  skuCode: "",
  barcode: "",
  movementType: "purchase",
  quantity: 1,
  beforeStock: 0,
  afterStock: 0,
  referenceModel: "OpeningStock",
  referenceNumber: "",
  remarks: "",
};

export default function StockLedger() {
  const [ledgers, setLedgers] = useState([]);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [movementFilter, setMovementFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingLedger, setViewingLedger] = useState(null);

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
      console.error("Master Data Load Error:", error);
    }
  };

  // ======================================================
  // LOAD STOCK LEDGER RECORDS
  // ======================================================
  const loadLedgers = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100, // retrieve recent history
      };

      if (search) params.search = search;
      if (storeFilter) params.store = storeFilter;
      if (warehouseFilter) params.warehouse = warehouseFilter;
      if (movementFilter) params.movementType = movementFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await getStockLedgers(params);
      const data =
        res?.data?.data?.data ||
        res?.data?.data ||
        res?.data?.ledgers ||
        res?.data ||
        [];

      setLedgers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Stock Ledger Error:", error);
      alert(error?.response?.data?.message || "Failed to load stock ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadLedgers();
  }, [storeFilter, warehouseFilter, movementFilter, fromDate, toDate]);

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

  const getProductName = (pField) => {
    if (!pField) return "—";
    if (typeof pField === "object" && pField !== null) {
      return pField.productName || pField.name || "—";
    }
    const matched = products.find((p) => String(p._id || p.id) === String(pField));
    return matched?.productName || matched?.name || "—";
  };

  // ======================================================
  // FILTER HANDLERS & SUMMARY
  // ======================================================
  const clearFilters = () => {
    setSearch("");
    setStoreFilter("");
    setWarehouseFilter("");
    setMovementFilter("");
    setFromDate("");
    setToDate("");
  };

  const isMovementIn = (type) => {
    return [
      "purchase",
      "sales_return",
      "adjustment_in",
      "transfer_in",
    ].includes(type);
  };

  const filteredLedgers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return ledgers;

    return ledgers.filter((item) => {
      const sku = String(item.skuCode || item.variant?.skuCode || "").toLowerCase();
      const barcode = String(item.barcode || "").toLowerCase();
      const refNo = String(item.referenceNumber || "").toLowerCase();
      const storeName = getStoreName(item.store).toLowerCase();
      const prodName = getProductName(item.product).toLowerCase();

      return (
        sku.includes(term) ||
        barcode.includes(term) ||
        refNo.includes(term) ||
        storeName.includes(term) ||
        prodName.includes(term)
      );
    });
  }, [ledgers, search, stores, products]);

  const summary = useMemo(() => {
    let inQty = 0;
    let outQty = 0;

    ledgers.forEach((item) => {
      const q = Number(item.quantity || 0);
      if (isMovementIn(item.movementType)) {
        inQty += q;
      } else {
        outQty += q;
      }
    });

    return {
      totalEntries: ledgers.length,
      inQty,
      outQty,
      netStockChange: inQty - outQty,
    };
  }, [ledgers]);

  // ======================================================
  // MODAL HANDLERS
  // ======================================================
  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (ledger) => {
    setEditingId(ledger._id);
    setForm({
      store: ledger.store?._id || ledger.store || "",
      warehouse: ledger.warehouse?._id || ledger.warehouse || "",
      product: ledger.product?._id || ledger.product || "",
      variant: ledger.variant?._id || ledger.variant || "",
      skuCode: ledger.skuCode || ledger.variant?.skuCode || "",
      barcode: ledger.barcode || "",
      movementType: ledger.movementType || "purchase",
      quantity: ledger.quantity || 1,
      beforeStock: ledger.beforeStock || 0,
      afterStock: ledger.afterStock || 0,
      referenceModel: ledger.referenceModel || "OpeningStock",
      referenceNumber: ledger.referenceNumber || "",
      remarks: ledger.remarks || "",
    });
    setShowModal(true);
  };

  const openViewModal = (ledger) => {
    setViewingLedger(ledger);
    setShowViewModal(true);
  };

  const handleProductChange = (productId) => {
    setForm((prev) => ({
      ...prev,
      product: productId,
      variant: "",
      skuCode: "",
      barcode: "",
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
      barcode: variantObj?.barcode || "",
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
  // SUBMISSION & DELETE
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.store) {
      alert("Store is required");
      return;
    }
    if (!form.product) {
      alert("Product is required");
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
        store: form.store,
        warehouse: form.warehouse || null,
        product: form.product,
        variant: form.variant,
        skuCode: form.skuCode,
        barcode: form.barcode,
        movementType: form.movementType,
        quantity: Number(form.quantity),
        beforeStock: Number(form.beforeStock || 0),
        afterStock: Number(form.afterStock || 0),
        referenceModel: form.referenceModel,
        referenceNumber: form.referenceNumber?.trim() || "",
        remarks: form.remarks?.trim() || "",
      };

      if (editingId) {
        await updateStockLedger(editingId, payload);
        alert("Stock Ledger entry updated successfully");
      } else {
        await createStockLedger(payload);
        alert("Stock Ledger entry created successfully");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadLedgers();
    } catch (error) {
      console.error("Save Stock Ledger Error:", error);
      alert(
        error?.response?.data?.message || "Failed to process stock ledger entry"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ledger) => {
    const confirmed = window.confirm(
      `Delete ledger entry ${ledger.referenceNumber || ledger.skuCode}?`
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteStockLedger(ledger._id);
      alert("Stock Ledger entry deleted successfully");
      await loadLedgers();
    } catch (error) {
      console.error("Delete Stock Ledger Error:", error);
      alert(
        error?.response?.data?.message || "Failed to delete stock ledger entry"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stockledger-page">
      <div className="stockledger-content">
        {/* HEADER */}
        <div className="stockledger-page-header">
          <div>
            <h2>Stock Ledger</h2>
            <p>Comprehensive audit trail for inventory movements and balance history</p>
          </div>

          <button className="stockledger-primary-btn" onClick={openCreateModal}>
            <Plus size={18} />
            New Entry
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="stockledger-summary-grid">
          <div className="stockledger-summary-card card-blue">
            <div className="stockledger-summary-icon">
              <BookOpen size={22} />
            </div>
            <div>
              <h2>{summary.totalEntries}</h2>
              <p>Total Movements</p>
            </div>
          </div>

          <div className="stockledger-summary-card card-green">
            <div className="stockledger-summary-icon">
              <ArrowDownLeft size={22} />
            </div>
            <div>
              <h2>+{summary.inQty}</h2>
              <p>Total Stock In</p>
            </div>
          </div>

          <div className="stockledger-summary-card card-amber">
            <div className="stockledger-summary-icon">
              <ArrowUpRight size={22} />
            </div>
            <div>
              <h2>-{summary.outQty}</h2>
              <p>Total Stock Out</p>
            </div>
          </div>

          <div className="stockledger-summary-card card-purple">
            <div className="stockledger-summary-icon">
              <Layers size={22} />
            </div>
            <div>
              <h2>{summary.netStockChange >= 0 ? `+${summary.netStockChange}` : summary.netStockChange}</h2>
              <p>Net Balance Delta</p>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="stockledger-toolbar">
          <div className="stockledger-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search SKU, Barcode, Ref Number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="stockledger-clear-search"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="stockledger-filter-select"
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
            className="stockledger-filter-select"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.warehouseName || w.name}
              </option>
            ))}
          </select>

          <select
            className="stockledger-filter-select"
            value={movementFilter}
            onChange={(e) => setMovementFilter(e.target.value)}
          >
            <option value="">All Movement Types</option>
            {MOVEMENT_TYPES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="stockledger-date-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            type="date"
            className="stockledger-date-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          {(search ||
            storeFilter ||
            warehouseFilter ||
            movementFilter ||
            fromDate ||
            toDate) && (
            <button
              type="button"
              className="stockledger-clear-btn"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}


        </div>

        <div className="stockledger-table-card">
          <table className="stockledger-table">
            <thead>
              <tr>
                <th style={{ width: "11%" }}>Date & Time</th>
                <th style={{ width: "12%" }}>Ref No / Type</th>
                <th style={{ width: "11%" }}>Movement</th>
                <th style={{ width: "14%" }}>Store & Location</th>
                <th style={{ width: "16%" }}>Product & SKU</th>
                <th style={{ width: "8%" }}>Change</th>
                <th style={{ width: "12%" }}>Before → After</th>
                <th style={{ width: "16%" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="stockledger-empty-row">
                    <RefreshCw size={20} className="stockledger-spin" />
                    <span>Loading stock ledger entries...</span>
                  </td>
                </tr>
              ) : filteredLedgers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="stockledger-empty-row">
                    No stock ledger records found.
                  </td>
                </tr>
              ) : (
                filteredLedgers.map((item) => {
                  const isIn = isMovementIn(item.movementType);

                  return (
                    <tr key={item._id}>
                      <td>
                        <div className="stockledger-date-cell">
                          <span>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                          <small>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </small>
                        </div>
                      </td>

                      <td>
                        <div className="stockledger-ref-cell">
                          <strong className="stockledger-ref-no">
                            {item.referenceNumber || "—"}
                          </strong>
                          <small>{item.referenceModel || "Manual Entry"}</small>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`stockledger-movement-pill ${
                            isIn ? "movement-in" : "movement-out"
                          }`}
                        >
                          {item.movementType?.replace("_", " ")}
                        </span>
                      </td>

                      <td>
                        <div className="stockledger-location-cell">
                          <span title={getStoreName(item.store)}>
                            {getStoreName(item.store)}
                          </span>
                          <small>{getWarehouseName(item.warehouse)}</small>
                        </div>
                      </td>

                      <td>
                        <div className="stockledger-prod-cell">
                          <span title={getProductName(item.product)}>
                            {getProductName(item.product)}
                          </span>
                          <small>{item.skuCode || item.variant?.skuCode || "—"}</small>
                        </div>
                      </td>

                      <td>
                        <strong
                          className={
                            isIn
                              ? "stockledger-green-text"
                              : "stockledger-red-text"
                          }
                        >
                          {isIn ? `+${item.quantity}` : `-${item.quantity}`}
                        </strong>
                      </td>

                      <td>
                        <span className="stockledger-stock-delta">
                          {item.beforeStock ?? 0} → <strong>{item.afterStock ?? 0}</strong>
                        </span>
                      </td>

                      <td>
                        <div className="stockledger-actions">
                          <button
                            type="button"
                            className="stockledger-action-btn view-btn"
                            title="View Audit Details"
                            onClick={() => openViewModal(item)}
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            className="stockledger-action-btn edit-btn"
                            title="Edit Entry"
                            onClick={() => openEditModal(item)}
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            type="button"
                            className="stockledger-action-btn delete-btn"
                            title="Delete"
                            onClick={() => handleDelete(item)}
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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div
          className="stockledger-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setShowModal(false);
            }
          }}
        >
          <div className="stockledger-modal">
            <div className="stockledger-modal-header">
              <h3>{editingId ? "Edit Stock Ledger Entry" : "New Stock Ledger Entry"}</h3>
              <button
                className="stockledger-close-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="stockledger-modal-form-wrapper">
              <div className="stockledger-modal-body">
                <h4 className="stockledger-section-title">Location & Entity</h4>

                <div className="stockledger-form-grid">
                  <div className="stockledger-form-group">
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

                  <div className="stockledger-form-group">
                    <label>Warehouse (Optional)</label>
                    <select
                      value={form.warehouse}
                      onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
                    >
                      <option value="">None / Main Store</option>
                      {warehouses.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.warehouseName || w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="stockledger-form-group">
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

                  <div className="stockledger-form-group">
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
                </div>

                <h4 className="stockledger-section-title">Movement & Delta Details</h4>

                <div className="stockledger-form-grid">
                  <div className="stockledger-form-group">
                    <label>Movement Type *</label>
                    <select
                      value={form.movementType}
                      onChange={(e) =>
                        setForm({ ...form, movementType: e.target.value })
                      }
                      required
                    >
                      {MOVEMENT_TYPES.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="stockledger-form-group">
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

                  <div className="stockledger-form-group">
                    <label>Before Stock</label>
                    <input
                      type="number"
                      value={form.beforeStock}
                      onChange={(e) =>
                        setForm({ ...form, beforeStock: e.target.value })
                      }
                    />
                  </div>

                  <div className="stockledger-form-group">
                    <label>After Stock</label>
                    <input
                      type="number"
                      value={form.afterStock}
                      onChange={(e) =>
                        setForm({ ...form, afterStock: e.target.value })
                      }
                    />
                  </div>

                  <div className="stockledger-form-group">
                    <label>Reference Model</label>
                    <select
                      value={form.referenceModel}
                      onChange={(e) =>
                        setForm({ ...form, referenceModel: e.target.value })
                      }
                    >
                      {REFERENCE_MODELS.map((mod) => (
                        <option key={mod} value={mod}>
                          {mod}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="stockledger-form-group">
                    <label>Reference Number</label>
                    <input
                      type="text"
                      placeholder="e.g. INV-001, PO-102"
                      value={form.referenceNumber}
                      onChange={(e) =>
                        setForm({ ...form, referenceNumber: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="stockledger-form-group stockledger-full">
                  <label>Remarks</label>
                  <textarea
                    rows="2"
                    placeholder="Enter audit comments or ledger notes..."
                    value={form.remarks}
                    onChange={(e) =>
                      setForm({ ...form, remarks: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="stockledger-modal-footer">
                <button
                  type="button"
                  className="stockledger-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="stockledger-save-btn"
                  disabled={saving}
                >
                  <Save size={18} />
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Entry"
                    : "Post Ledger Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {showViewModal && viewingLedger && (
        <div
          className="stockledger-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewModal(false);
            }
          }}
        >
          <div className="stockledger-modal stockledger-view-modal">
            <div className="stockledger-modal-header">
              <h3>Stock Movement Audit Details</h3>
              <button
                className="stockledger-close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="stockledger-modal-body">
              <div className="stockledger-detail-grid">
                <div>
                  <span>Date & Time</span>
                  <strong>
                    {viewingLedger.createdAt
                      ? new Date(viewingLedger.createdAt).toLocaleString("en-IN")
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>Movement Type</span>
                  <strong>
                    <span
                      className={`stockledger-movement-pill ${
                        isMovementIn(viewingLedger.movementType)
                          ? "movement-in"
                          : "movement-out"
                      }`}
                    >
                      {viewingLedger.movementType?.replace("_", " ")}
                    </span>
                  </strong>
                </div>

                <div>
                  <span>Store</span>
                  <strong>{getStoreName(viewingLedger.store)}</strong>
                </div>

                <div>
                  <span>Warehouse</span>
                  <strong>{getWarehouseName(viewingLedger.warehouse)}</strong>
                </div>

                <div>
                  <span>Product</span>
                  <strong>{getProductName(viewingLedger.product)}</strong>
                </div>

                <div>
                  <span>Variant / SKU</span>
                  <strong>
                    {viewingLedger.skuCode ||
                      viewingLedger.variant?.skuCode ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Barcode</span>
                  <strong>{viewingLedger.barcode || "—"}</strong>
                </div>

                <div>
                  <span>Quantity Moved</span>
                  <strong
                    className={
                      isMovementIn(viewingLedger.movementType)
                        ? "stockledger-green-text"
                        : "stockledger-red-text"
                    }
                  >
                    {isMovementIn(viewingLedger.movementType)
                      ? `+${viewingLedger.quantity}`
                      : `-${viewingLedger.quantity}`}
                  </strong>
                </div>

                <div>
                  <span>Before Stock</span>
                  <strong>{viewingLedger.beforeStock ?? 0}</strong>
                </div>

                <div>
                  <span>After Stock</span>
                  <strong>{viewingLedger.afterStock ?? 0}</strong>
                </div>

                <div>
                  <span>Reference Type</span>
                  <strong>{viewingLedger.referenceModel || "—"}</strong>
                </div>

                <div>
                  <span>Reference No</span>
                  <strong>{viewingLedger.referenceNumber || "—"}</strong>
                </div>
              </div>

              {viewingLedger.remarks && (
                <div className="stockledger-notes">
                  <span>Remarks</span>
                  <p>{viewingLedger.remarks}</p>
                </div>
              )}
            </div>

            <div className="stockledger-modal-footer">
              <button
                type="button"
                className="stockledger-cancel-btn"
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