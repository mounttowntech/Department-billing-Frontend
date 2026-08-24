import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  Boxes,
  CheckCircle2,
  Clock,
} from "lucide-react";

import {
  getStockTransfers,
  createStockTransfer,
  updateStockTransfer,
  cancelStockTransfer,
  deleteStockTransfer,
} from "../../../services/stockTransferService";

import { getStores } from "../../../services/storeService";
import { getWarehouses } from "../../../services/warehouseService";
import { getProducts } from "../../../services/productService";
import { getVariants } from "../../../services/productVariantService";

import "./StockTransfer.css";

const generateTransferNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const time = String(now.getTime()).slice(-4);
  return `STF-${year}${month}${day}-${time}`;
};

const emptyItem = () => ({
  product: "",
  variant: "",
  skuCode: "",
  quantity: 1,
});

const emptyForm = {
  transferNo: "",
  store: "",
  fromWarehouse: "",
  toWarehouse: "",
  remarks: "",
  items: [emptyItem()],
};

export default function StockTransfer() {
  const [transfers, setTransfers] = useState([]);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromWhFilter, setFromWhFilter] = useState("");
  const [toWhFilter, setToWhFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingTransfer, setViewingTransfer] = useState(null);

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
  // LOAD TRANSFERS
  // ======================================================
  const loadTransfers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (storeFilter) params.store = storeFilter;
      if (statusFilter) params.status = statusFilter;
      if (fromWhFilter) params.fromWarehouse = fromWhFilter;
      if (toWhFilter) params.toWarehouse = toWhFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await getStockTransfers(params);
      const data =
        res?.data?.data?.data ||
        res?.data?.data ||
        res?.data?.transfers ||
        res?.data ||
        [];

      setTransfers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Stock Transfers Error:", error);
      alert(error?.response?.data?.message || "Failed to load stock transfers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadTransfers();
  }, [storeFilter, statusFilter, fromWhFilter, toWhFilter, fromDate, toDate]);

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
  // CLEAR FILTERS & SEARCH
  // ======================================================
  const clearFilters = () => {
    setSearch("");
    setStoreFilter("");
    setStatusFilter("");
    setFromWhFilter("");
    setToWhFilter("");
    setFromDate("");
    setToDate("");
  };

  const filteredTransfers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return transfers;

    return transfers.filter((item) => {
      const transferNo = String(item.transferNo || "").toLowerCase();
      const storeName = getStoreName(item.store).toLowerCase();
      const fromWh = getWarehouseName(item.fromWarehouse).toLowerCase();
      const toWh = getWarehouseName(item.toWarehouse).toLowerCase();

      return (
        transferNo.includes(term) ||
        storeName.includes(term) ||
        fromWh.includes(term) ||
        toWh.includes(term)
      );
    });
  }, [transfers, search, stores, warehouses]);

  const summary = useMemo(() => {
    const completed = transfers.filter((t) => t.status === "completed").length;
    const pending = transfers.filter((t) => t.status === "pending").length;
    const cancelled = transfers.filter((t) => t.status === "cancelled").length;

    const totalQtyMoved = transfers.reduce(
      (sum, t) => sum + Number(t.totalQuantity || 0),
      0
    );

    return {
      total: transfers.length,
      completed,
      pending,
      cancelled,
      totalQtyMoved,
    };
  }, [transfers]);

  // ======================================================
  // MODAL HANDLERS
  // ======================================================
  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      transferNo: generateTransferNo(),
      items: [emptyItem()],
    });
    setShowModal(true);
  };

  const openEditModal = (transfer) => {
    if (transfer.status === "cancelled") {
      alert("Cancelled stock transfers cannot be edited.");
      return;
    }

    setEditingId(transfer._id);
    setForm({
      transferNo: transfer.transferNo,
      store: transfer.store?._id || transfer.store || "",
      fromWarehouse: transfer.fromWarehouse?._id || transfer.fromWarehouse || "",
      toWarehouse: transfer.toWarehouse?._id || transfer.toWarehouse || "",
      remarks: transfer.remarks || "",
      items: (transfer.items || []).map((item) => ({
        product: item.product?._id || item.product || "",
        variant: item.variant?._id || item.variant || "",
        skuCode: item.skuCode || item.variant?.skuCode || "",
        quantity: item.quantity || 1,
      })),
    });
    setShowModal(true);
  };

  const openViewModal = (transfer) => {
    setViewingTransfer(transfer);
    setShowViewModal(true);
  };

  // ======================================================
  // LINE ITEM HANDLERS
  // ======================================================
  const handleItemProductChange = (index, productId) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              product: productId,
              variant: "",
              skuCode: "",
            }
          : item
      ),
    }));
  };

  const handleItemVariantChange = (index, variantId) => {
    const variantObj = variants.find((v) => String(v._id || v.id) === String(variantId));
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              variant: variantId,
              skuCode: variantObj?.skuCode || "",
              product: variantObj?.product?._id || variantObj?.product || item.product,
            }
          : item
      ),
    }));
  };

  const handleItemQuantityChange = (index, qty) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, quantity: qty } : item
      ),
    }));
  };

  const addItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, emptyItem()],
    }));
  };

  const removeItemRow = (index) => {
    if (form.items.length === 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // ======================================================
  // SUBMISSION & ACTIONS
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.store) {
      alert("Store is required");
      return;
    }
    if (!form.fromWarehouse) {
      alert("Source (From) Warehouse is required");
      return;
    }
    if (!form.toWarehouse) {
      alert("Destination (To) Warehouse is required");
      return;
    }
    if (String(form.fromWarehouse) === String(form.toWarehouse)) {
      alert("From Warehouse and To Warehouse cannot be the same");
      return;
    }

    const validItems = form.items.filter(
      (item) => item.variant && Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      alert("Add at least one line item with a variant and quantity");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        transferNo: form.transferNo,
        store: form.store,
        fromWarehouse: form.fromWarehouse,
        toWarehouse: form.toWarehouse,
        remarks: form.remarks?.trim() || "",
        items: validItems.map((item) => ({
          product: item.product,
          variant: item.variant,
          skuCode: item.skuCode,
          quantity: Number(item.quantity),
        })),
      };

      if (editingId) {
        await updateStockTransfer(editingId, payload);
        alert("Stock Transfer updated and inventory re-synced successfully");
      } else {
        await createStockTransfer(payload);
        alert("Stock Transfer posted and inventory moved successfully");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadTransfers();
    } catch (error) {
      console.error("Save Stock Transfer Error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to process stock transfer"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (transfer) => {
    const confirmed = window.confirm(
      `Cancel transfer ${transfer.transferNo}? This will automatically reverse the stock movement.`
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      await cancelStockTransfer(transfer._id);
      alert("Stock Transfer cancelled and inventory reversed successfully");
      await loadTransfers();
    } catch (error) {
      console.error("Cancel Stock Transfer Error:", error);
      alert(error?.response?.data?.message || "Failed to cancel stock transfer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (transfer) => {
    const confirmed = window.confirm(
      `Delete transfer ${transfer.transferNo}?`
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteStockTransfer(transfer._id);
      alert("Stock Transfer deleted successfully");
      await loadTransfers();
    } catch (error) {
      console.error("Delete Stock Transfer Error:", error);
      alert(error?.response?.data?.message || "Failed to delete stock transfer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stocktransfer-page">
      <div className="stocktransfer-content">
        {/* HEADER */}
        <div className="stocktransfer-page-header">
          <div>
            <h2>Stock Transfers</h2>
            <p>Relocate, dispatch, and track inventory between warehouses</p>
          </div>

          <button
            className="stocktransfer-primary-btn"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            New Transfer
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="stocktransfer-summary-grid">
          <div className="stocktransfer-summary-card card-blue">
            <div className="stocktransfer-summary-icon">
              <ArrowLeftRight size={22} />
            </div>
            <div>
              <h2>{summary.total}</h2>
              <p>Total Transfers</p>
            </div>
          </div>

          <div className="stocktransfer-summary-card card-green">
            <div className="stocktransfer-summary-icon">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h2>{summary.completed}</h2>
              <p>Completed</p>
            </div>
          </div>

          <div className="stocktransfer-summary-card card-amber">
            <div className="stocktransfer-summary-icon">
              <Clock size={22} />
            </div>
            <div>
              <h2>{summary.pending}</h2>
              <p>Pending</p>
            </div>
          </div>

          <div className="stocktransfer-summary-card card-purple">
            <div className="stocktransfer-summary-icon">
              <Boxes size={22} />
            </div>
            <div>
              <h2>{summary.totalQtyMoved}</h2>
              <p>Units Transferred</p>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="stocktransfer-toolbar">
          <div className="stocktransfer-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search Transfer No, Store, Warehouse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="stocktransfer-clear-search"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="stocktransfer-filter-select"
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
            className="stocktransfer-filter-select"
            value={fromWhFilter}
            onChange={(e) => setFromWhFilter(e.target.value)}
          >
            <option value="">From Warehouse</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.warehouseName || w.name}
              </option>
            ))}
          </select>

          <select
            className="stocktransfer-filter-select"
            value={toWhFilter}
            onChange={(e) => setToWhFilter(e.target.value)}
          >
            <option value="">To Warehouse</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.warehouseName || w.name}
              </option>
            ))}
          </select>

          <select
            className="stocktransfer-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            className="stocktransfer-date-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            type="date"
            className="stocktransfer-date-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          {(search ||
            storeFilter ||
            statusFilter ||
            fromWhFilter ||
            toWhFilter ||
            fromDate ||
            toDate) && (
            <button
              type="button"
              className="stocktransfer-clear-btn"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}


        </div>

        {/* TABLE CARD - ZERO HORIZONTAL SCROLL */}
        <div className="stocktransfer-table-card">
          <table className="stocktransfer-table">
            <thead>
              <tr>
                <th style={{ width: "13%" }}>Transfer No</th>
                <th style={{ width: "11%" }}>Store</th>
                <th style={{ width: "12%" }}>From</th>
                <th style={{ width: "12%" }}>To</th>
                <th style={{ width: "7%" }}>Items</th>
                <th style={{ width: "8%" }}>Total Qty</th>
                <th style={{ width: "9%" }}>Status</th>
                <th style={{ width: "12%" }}>Date</th>
                <th style={{ width: "16%" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="stocktransfer-empty-row">
                    <RefreshCw size={20} className="stocktransfer-spin" />
                    <span>Loading stock transfers...</span>
                  </td>
                </tr>
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="stocktransfer-empty-row">
                    No stock transfers found.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong className="stocktransfer-number">
                        {item.transferNo}
                      </strong>
                    </td>

                    <td title={getStoreName(item.store)}>
                      {getStoreName(item.store)}
                    </td>

                    <td title={getWarehouseName(item.fromWarehouse)}>
                      {getWarehouseName(item.fromWarehouse)}
                    </td>

                    <td title={getWarehouseName(item.toWarehouse)}>
                      {getWarehouseName(item.toWarehouse)}
                    </td>

                    <td>{item.totalItems ?? item.items?.length ?? 0}</td>

                    <td>
                      <strong>{item.totalQuantity ?? 0}</strong>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          item.status === "completed"
                            ? "paid"
                            : item.status === "pending"
                            ? "partial"
                            : "pending"
                        }`}
                      >
                        {item.status}
                      </span>
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
                    <div className="stocktransfer-actions">
  {/* View */}
  <button
    type="button"
    className="stocktransfer-action-btn view-btn"
    title="View Details"
    onClick={() => openViewModal(item)}
  >
    <Eye size={15} strokeWidth={2} />
  </button>

  {/* Edit */}
  {item.status !== "cancelled" && (
    <button
      type="button"
      className="stocktransfer-action-btn edit-btn"
      title="Edit"
      onClick={() => openEditModal(item)}
    >
      <Edit size={15} strokeWidth={2} />
    </button>
  )}

  {/* Cancel Transfer (Cross Icon) */}
  {item.status !== "cancelled" && (
    <button
      type="button"
      className="stocktransfer-action-btn cancel-btn"
      title="Cancel Transfer"
      onClick={() => handleCancel(item)}
    >
      <X size={15} strokeWidth={2.5} />
    </button>
  )}

  {/* Delete */}
  <button
    type="button"
    className="stocktransfer-action-btn delete-btn"
    title="Delete"
    onClick={() => handleDelete(item)}
  >
    <Trash2 size={15} strokeWidth={2} />
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
          className="stocktransfer-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setShowModal(false);
            }
          }}
        >
          <div className="stocktransfer-modal">
            <div className="stocktransfer-modal-header">
              <h3>
                {editingId ? "Edit Stock Transfer" : "New Stock Transfer"}
              </h3>
              <button
                className="stocktransfer-close-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="stocktransfer-modal-form-wrapper"
            >
              <div className="stocktransfer-modal-body">
                <h4 className="stocktransfer-section-title">Transfer Info</h4>

                <div className="stocktransfer-form-grid">
                  <div className="stocktransfer-form-group">
                    <label>Transfer No</label>
                    <input
                      type="text"
                      value={form.transferNo}
                      readOnly
                      disabled
                      className="stocktransfer-readonly-input"
                    />
                  </div>

                  <div className="stocktransfer-form-group">
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

                  <div className="stocktransfer-form-group">
                    <label>From Warehouse *</label>
                    <select
                      value={form.fromWarehouse}
                      onChange={(e) =>
                        setForm({ ...form, fromWarehouse: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Origin Warehouse</option>
                      {warehouses.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.warehouseName || w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="stocktransfer-form-group">
                    <label>To Warehouse *</label>
                    <select
                      value={form.toWarehouse}
                      onChange={(e) =>
                        setForm({ ...form, toWarehouse: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Destination Warehouse</option>
                      {warehouses.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.warehouseName || w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <h4 className="stocktransfer-section-title">
                  Transfer Line Items
                </h4>

                <div className="stocktransfer-items-wrap">
                  <table className="stocktransfer-items-table">
                    <thead>
                      <tr>
                        <th style={{ width: "38%" }}>Product *</th>
                        <th style={{ width: "36%" }}>Variant / SKU *</th>
                        <th style={{ width: "18%" }}>Quantity *</th>
                        <th style={{ width: "8%" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((item, index) => {
                        const availableVariants = item.product
                          ? variants.filter(
                              (v) =>
                                String(v.product?._id || v.product) ===
                                String(item.product)
                            )
                          : variants;

                        return (
                          <tr key={index}>
                            <td>
                              <select
                                value={item.product}
                                onChange={(e) =>
                                  handleItemProductChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                required
                              >
                                <option value="">Select Product</option>
                                {products.map((p) => (
                                  <option key={p._id} value={p._id}>
                                    {p.productName || p.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td>
                              <select
                                value={item.variant}
                                onChange={(e) =>
                                  handleItemVariantChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                required
                              >
                                <option value="">Select Variant</option>
                                {availableVariants.map((v) => (
                                  <option key={v._id} value={v._id}>
                                    {v.skuCode}{" "}
                                    {v.packSize ? `(${v.packSize})` : ""}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemQuantityChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </td>

                            <td>
                              <button
                                type="button"
                                className="stocktransfer-item-remove-btn"
                                onClick={() => removeItemRow(index)}
                                disabled={form.items.length === 1}
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  className="stocktransfer-add-item-btn"
                  onClick={addItemRow}
                >
                  <Plus size={14} />
                  Add Line Item
                </button>

                <div className="stocktransfer-form-group stocktransfer-full">
                  <label>Remarks</label>
                  <textarea
                    rows="2"
                    placeholder="Enter transfer notes or remarks..."
                    value={form.remarks}
                    onChange={(e) =>
                      setForm({ ...form, remarks: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="stocktransfer-modal-footer">
                <button
                  type="button"
                  className="stocktransfer-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="stocktransfer-save-btn"
                  disabled={saving}
                >
                  <Save size={18} />
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Transfer"
                    : "Post Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && viewingTransfer && (
        <div
          className="stocktransfer-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewModal(false);
            }
          }}
        >
          <div className="stocktransfer-modal stocktransfer-view-modal">
            <div className="stocktransfer-modal-header">
              <h3>
                Stock Transfer Details — {viewingTransfer.transferNo}
              </h3>
              <button
                className="stocktransfer-close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="stocktransfer-modal-body">
              <div className="stocktransfer-detail-grid">
                <div>
                  <span>Transfer No</span>
                  <strong>{viewingTransfer.transferNo}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    <span
                      className={`badge ${
                        viewingTransfer.status === "completed"
                          ? "paid"
                          : viewingTransfer.status === "pending"
                          ? "partial"
                          : "pending"
                      }`}
                    >
                      {viewingTransfer.status}
                    </span>
                  </strong>
                </div>

                <div>
                  <span>Store</span>
                  <strong>{getStoreName(viewingTransfer.store)}</strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>
                    {viewingTransfer.createdAt
                      ? new Date(viewingTransfer.createdAt).toLocaleString("en-IN")
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>Origin (From)</span>
                  <strong>
                    {getWarehouseName(viewingTransfer.fromWarehouse)}
                  </strong>
                </div>

                <div>
                  <span>Destination (To)</span>
                  <strong>
                    {getWarehouseName(viewingTransfer.toWarehouse)}
                  </strong>
                </div>

                <div>
                  <span>Total Items</span>
                  <strong>{viewingTransfer.totalItems ?? 0}</strong>
                </div>

                <div>
                  <span>Total Quantity</span>
                  <strong>{viewingTransfer.totalQuantity ?? 0}</strong>
                </div>
              </div>

              <div className="stocktransfer-section-title">Transferred Items</div>
              <div className="stocktransfer-view-items-wrap">
                <table className="stocktransfer-view-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Variant / SKU</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewingTransfer.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td>{getProductName(item.product)}</td>
                        <td>{item.skuCode || item.variant?.skuCode || "—"}</td>
                        <td>
                          <strong>{item.quantity}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {viewingTransfer.remarks && (
                <div className="stocktransfer-notes">
                  <span>Remarks</span>
                  <p>{viewingTransfer.remarks}</p>
                </div>
              )}
            </div>

            <div className="stocktransfer-modal-footer">
              <button
                type="button"
                className="stocktransfer-cancel-btn"
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