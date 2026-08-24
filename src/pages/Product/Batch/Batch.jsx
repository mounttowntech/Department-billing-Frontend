import React, { useEffect, useMemo, useState } from "react";
import "./Batch.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";

import {
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
} from "../../../services/batchService";

import { getStores } from "../../../services/storeService";
import { getProducts } from "../../../services/productService";
import { getUnits } from "../../../services/unitService";
import { getWarehouses } from "../../../services/warehouseService";
import { getShelves } from "../../../services/shelfService";
import { getSuppliers } from "../../../services/supplierService";
import api from "../../../api/axios";

const emptyBatch = {
  store: "",
  product: "",
  variant: "",
  supplier: "",
  purchase: "",
  warehouse: "",
  shelf: "",

  batchNumber: "",
  barcode: "",

  manufacturingDate: "",
  expiryDate: "",
  receivedDate: "",

  purchasePrice: 0,
  sellingPrice: 0,
  mrp: 0,

  quantity: 0,
  remainingQuantity: 0,
  damagedQuantity: 0,
  returnedQuantity: 0,

  status: "Available",
  remarks: "",
};

export default function Batch() {
  const [batches, setBatches] = useState([]);

  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [shelves, setShelves] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptyBatch);

  const fetchBatches = async () => {
    try {
      setLoading(true);

      const res = await getBatches({
        store: storeFilter || undefined,
        product: productFilter || undefined,
        status: statusFilter || undefined,
      });

      const data = res?.data?.data || [];

      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Failed to load batches:", err);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const res = await getStores();

      if (res.success) {
        setStores(res.data || []);
      }
    } catch (err) {
      console.log("Stores:", err);
    }

    try {
      const res = await getProducts();

      const data = res?.data?.data || res?.data || [];

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Products:", err);
    }

    try {
      const res = await getSuppliers();

      const data = res?.data?.data || res?.data || [];

      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Suppliers:", err);
    }

    try {
      const res = await api.get("/purchases/all");

      setPurchases(res.data?.data || []);
    } catch (err) {
      console.log("Purchases:", err);
    }

    try {
      const res = await getWarehouses();

      if (res.success) {
        setWarehouses(res.data || []);
      }
    } catch (err) {
      console.log("Warehouses:", err);
    }

    try {
      const res = await getShelves();

      if (res.success) {
        setShelves(res.data || []);
      }
    } catch (err) {
      console.log("Shelves:", err);
    }

    try {
      const res = await api.get("/product-variants/all");

      setVariants(res.data?.data || []);
    } catch (err) {
      console.log("Variants:", err);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBatches();
    }, 300);

    return () => clearTimeout(timer);
  }, [storeFilter, productFilter, statusFilter]);

  const filteredBatches = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return batches;

    return batches.filter((batch) => {
      return (
        batch.batchNumber?.toLowerCase().includes(value) ||
        batch.barcode?.toLowerCase().includes(value) ||
        batch.product?.productName?.toLowerCase().includes(value) ||
        batch.variant?.variantName?.toLowerCase().includes(value) ||
        batch.variant?.skuCode?.toLowerCase().includes(value)
      );
    });
  }, [batches, search]);

  const totalBatches = batches.length;

  const availableBatches = batches.filter(
    (x) => x.status === "Available",
  ).length;

  const expiredBatches = batches.filter((x) => x.status === "Expired").length;

  const lowStockBatches = batches.filter(
    (x) => Number(x.remainingQuantity || 0) <= 10,
  ).length;

  const updateField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyBatch);
    setShowModal(true);
  };

  const openEditModal = (batch) => {
    setEditingId(batch._id);

    setFormData({
      store: batch.store?._id || batch.store || "",
      product: batch.product?._id || batch.product || "",
      variant: batch.variant?._id || batch.variant || "",
      supplier: batch.supplier?._id || batch.supplier || "",
      purchase: batch.purchase?._id || batch.purchase || "",
      warehouse: batch.warehouse?._id || batch.warehouse || "",
      shelf: batch.shelf?._id || batch.shelf || "",

      batchNumber: batch.batchNumber || "",
      barcode: batch.barcode || "",

      manufacturingDate: batch.manufacturingDate
        ? batch.manufacturingDate.substring(0, 10)
        : "",

      expiryDate: batch.expiryDate ? batch.expiryDate.substring(0, 10) : "",

      receivedDate: batch.receivedDate
        ? batch.receivedDate.substring(0, 10)
        : "",

      purchasePrice: batch.purchasePrice ?? 0,
      sellingPrice: batch.sellingPrice ?? 0,
      mrp: batch.mrp ?? 0,

      quantity: batch.quantity ?? 0,
      remainingQuantity: batch.remainingQuantity ?? 0,

      damagedQuantity: batch.damagedQuantity ?? 0,

      returnedQuantity: batch.returnedQuantity ?? 0,

      status: batch.status || "Available",
      remarks: batch.remarks || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyBatch);
  };

  const handleSubmit = async () => {
    if (
      !formData.store ||
      !formData.product ||
      !formData.supplier ||
      !formData.purchase ||
      !formData.warehouse ||
      !formData.batchNumber ||
      !formData.barcode
    ) {
      alert(
        "Store, Product, Supplier, Purchase, Warehouse, Batch Number and Barcode are required.",
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,

        variant: formData.variant || undefined,
        shelf: formData.shelf || undefined,

        manufacturingDate: formData.manufacturingDate || undefined,

        expiryDate: formData.expiryDate || undefined,

        receivedDate: formData.receivedDate || undefined,
      };

      if (editingId) {
        await updateBatch(editingId, payload);
      } else {
        await createBatch(payload);
      }

      closeModal();
      fetchBatches();
    } catch (err) {
      console.log(err);

      alert(err?.response?.data?.message || "Unable to save Batch.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (batch) => {
    const confirmed = window.confirm(`Delete batch "${batch.batchNumber}"?`);

    if (!confirmed) return;

    try {
      await deleteBatch(batch._id);

      fetchBatches();
    } catch (err) {
      console.log(err);

      alert(err?.response?.data?.message || "Unable to delete batch.");
    }
  };

  const shelvesForWarehouse = useMemo(() => {
    if (!formData.warehouse) return [];

    return shelves.filter(
      (s) => (s.warehouse?._id || s.warehouse) === formData.warehouse,
    );
  }, [shelves, formData.warehouse]);

  const variantsForProduct = useMemo(() => {
    if (!formData.product) return variants;

    return variants.filter(
      (v) => (v.product?._id || v.product) === formData.product,
    );
  }, [variants, formData.product]);

  return (
    <div className="batch-page">
      <div className="batch-content">
        {/* HEADER */}

        <div className="page-header">
          <div>
            <h2>Batch Management</h2>

            <p>Manage product batches, stock, pricing and expiry.</p>
          </div>

          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={18} />
            Add Batch
          </button>
        </div>

        <div className="batch-toolbar">
          <div className="batch-search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search batch, barcode, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="batch-filter-select"
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
          >
            <option value="">All Stores</option>

            {stores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.storeName}
              </option>
            ))}
          </select>

          <select
            className="batch-filter-select"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
          >
            <option value="">All Products</option>

            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.productName}
              </option>
            ))}
          </select>

          <select
            className="batch-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>

            <option value="Available">Available</option>

            <option value="Sold Out">Sold Out</option>

            <option value="Expired">Expired</option>

            <option value="Damaged">Damaged</option>

            <option value="Returned">Returned</option>
          </select>
        </div>

        <div className="batch-summary-grid">
          <div className="batch-summary-card card-blue">
            <Package size={24} />

            <div>
              <h2>{totalBatches}</h2>
              <p>Total Batches</p>
            </div>
          </div>

          <div className="batch-summary-card card-green">
            <CheckCircle size={24} />

            <div>
              <h2>{availableBatches}</h2>
              <p>Available</p>
            </div>
          </div>

          <div className="batch-summary-card card-red">
            <Clock size={24} />

            <div>
              <h2>{expiredBatches}</h2>
              <p>Expired</p>
            </div>
          </div>

          <div className="batch-summary-card card-amber">
            <AlertTriangle size={24} />

            <div>
              <h2>{lowStockBatches}</h2>
              <p>Low Stock</p>
            </div>
          </div>
        </div>

        <div className="table-card">
          <table className="batch-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Product / Variant</th>
                <th>Supplier</th>
                <th>Pricing</th>
                <th>Stock</th>
                <th>Expiry</th>
                <th>Status</th>
                <th width="120">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="empty-row">
                    Loading...
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-row">
                    No Batches Found
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => (
                  <tr key={batch._id}>
                    <td>
                      <div className="batch-info">
                        <strong>{batch.batchNumber}</strong>

                        <p>{batch.barcode}</p>
                      </div>
                    </td>

                    <td>
                      <strong>{batch.product?.productName || "—"}</strong>

                      <p>
                        {batch.variant?.variantName ||
                          batch.variant?.skuCode ||
                          "—"}
                      </p>
                    </td>

                    <td>{batch.supplier?.supplierName || "—"}</td>

                    <td>
                      <div className="price-cell">
                        <strong>
                          ₹
                          {Number(batch.sellingPrice || 0).toLocaleString(
                            "en-IN",
                          )}
                        </strong>

                        <span>
                          MRP ₹{Number(batch.mrp || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </td>

                    <td>
                      <strong>{batch.remainingQuantity ?? 0}</strong>

                      <span className="stock-small">
                        / {batch.quantity ?? 0}
                      </span>
                    </td>

                    <td>
                      {batch.expiryDate
                        ? new Date(batch.expiryDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={`badge status-${batch.status
                          ?.toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {batch.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          title="Edit"
                          onClick={() => openEditModal(batch)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className="delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(batch)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="batch-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Batch" : "Add Batch"}</h3>

                <button className="close-btn" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <h4 className="section-title">Batch Details</h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Store *</label>

                    <select
                      value={formData.store}
                      onChange={(e) => updateField("store", e.target.value)}
                    >
                      <option value="">Select Store</option>

                      {stores.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.storeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Product *</label>

                    <select
                      value={formData.product}
                      onChange={(e) => {
                        updateField("product", e.target.value);

                        updateField("variant", "");
                      }}
                    >
                      <option value="">Select Product</option>

                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.productName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Variant</label>

                    <select
                      value={formData.variant}
                      onChange={(e) => updateField("variant", e.target.value)}
                    >
                      <option value="">Select Variant</option>

                      {variantsForProduct.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.variantName || v.skuCode}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Supplier *</label>

                    <select
                      value={formData.supplier}
                      onChange={(e) => updateField("supplier", e.target.value)}
                    >
                      <option value="">Select Supplier</option>

                      {suppliers.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Purchase *</label>

                    <select
                      value={formData.purchase}
                      onChange={(e) => updateField("purchase", e.target.value)}
                    >
                      <option value="">Select Purchase</option>

                      {purchases.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.purchaseNo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Batch Number *</label>

                    <input
                      placeholder="e.g. BATCH-2026-001"
                      value={formData.batchNumber}
                      onChange={(e) =>
                        updateField("batchNumber", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Barcode *</label>

                    <input
                      placeholder="e.g. 8901234567890"
                      value={formData.barcode}
                      onChange={(e) => updateField("barcode", e.target.value)}
                    />
                  </div>
                </div>

                <h4 className="section-title">Warehouse & Location</h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Warehouse *</label>

                    <select
                      value={formData.warehouse}
                      onChange={(e) => {
                        updateField("warehouse", e.target.value);

                        updateField("shelf", "");
                      }}
                    >
                      <option value="">Select Warehouse</option>

                      {warehouses.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.warehouseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Shelf</label>

                    <select
                      value={formData.shelf}
                      disabled={!formData.warehouse}
                      onChange={(e) => updateField("shelf", e.target.value)}
                    >
                      <option value="">Select Shelf</option>

                      {shelvesForWarehouse.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.shelfName}
                          {s.rackNumber ? ` (${s.rackNumber})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <h4 className="section-title">Dates</h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Manufacturing Date</label>

                    <input
                      type="date"
                      value={formData.manufacturingDate}
                      onChange={(e) =>
                        updateField("manufacturingDate", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Expiry Date</label>

                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        updateField("expiryDate", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Received Date</label>

                    <input
                      type="date"
                      value={formData.receivedDate}
                      onChange={(e) =>
                        updateField("receivedDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                <h4 className="section-title">Pricing</h4>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Purchase Price *</label>

                    <input
                      type="number"
                      min="0"
                      value={formData.purchasePrice}
                      onChange={(e) =>
                        updateField("purchasePrice", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Selling Price *</label>

                    <input
                      type="number"
                      min="0"
                      value={formData.sellingPrice}
                      onChange={(e) =>
                        updateField("sellingPrice", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>MRP *</label>

                    <input
                      type="number"
                      min="0"
                      value={formData.mrp}
                      onChange={(e) => updateField("mrp", e.target.value)}
                    />
                  </div>
                </div>

                <h4 className="section-title">Stock</h4>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Quantity *</label>

                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => updateField("quantity", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Remaining Quantity *</label>

                    <input
                      type="number"
                      min="0"
                      value={formData.remainingQuantity}
                      onChange={(e) =>
                        updateField("remainingQuantity", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Damaged Quantity</label>

                    <input
                      type="number"
                      min="0"
                      value={formData.damagedQuantity}
                      onChange={(e) =>
                        updateField("damagedQuantity", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Returned Quantity</label>

                    <input
                      type="number"
                      min="0"
                      value={formData.returnedQuantity}
                      onChange={(e) =>
                        updateField("returnedQuantity", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>

                    <select
                      value={formData.status}
                      onChange={(e) => updateField("status", e.target.value)}
                    >
                      <option value="Available">Available</option>

                      <option value="Sold Out">Sold Out</option>

                      <option value="Expired">Expired</option>

                      <option value="Damaged">Damaged</option>

                      <option value="Returned">Returned</option>
                    </select>
                  </div>
                </div>

                <h4 className="section-title">Remarks</h4>

                <div className="form-group">
                  <textarea
                    rows="3"
                    placeholder="Enter remarks..."
                    value={formData.remarks}
                    onChange={(e) => updateField("remarks", e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>

                <button
                  className="save-btn"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  <Save size={18} />

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Batch"
                      : "Create Batch"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
