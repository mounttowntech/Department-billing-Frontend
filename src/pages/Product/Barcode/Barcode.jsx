import React, { useEffect, useMemo, useState } from "react";
import "./Barcode.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Barcode as BarcodeIcon,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

import {
  getBarcodes,
  createBarcode,
  updateBarcode,
  activateBarcode,
  deactivateBarcode,
  deleteBarcode,
} from "../../../services/barcodeService";

import { getStores } from "../../../services/storeService";
import { getProducts } from "../../../services/productService";
import api from "../../../api/axios";

const BARCODE_TYPES = [
  { value: "Product", label: "Product" },
  { value: "Batch", label: "Batch" },
  { value: "Weight", label: "Weight" },
];

const emptyBarcode = {
  store: "",
  product: "",
  variant: "",
  batch: "",
  barcode: "",
  skuCode: "",
  barcodeType: "Product",
  status: true,
};

const generateBarcode = () => {
  const base =
    "890" + Math.floor(100000000 + Math.random() * 900000000);

  const digits = base.split("").map(Number);

  let sum = 0;

  digits.forEach((digit, index) => {
    sum += index % 2 === 0 ? digit : digit * 3;
  });

  const checkDigit = (10 - (sum % 10)) % 10;

  return base + checkDigit;
};

export default function Barcode() {
  const [barcodes, setBarcodes] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptyBarcode);
  const fetchBarcodes = async () => {
    try {
      setLoading(true);

      const res = await getBarcodes({
        search: search || undefined,
        status: statusFilter || undefined,
        store: storeFilter || undefined,
        barcodeType: typeFilter || undefined,
      });

      const data = res?.data?.data || res?.data || [];

      setBarcodes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setBarcodes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await getStores();

      if (res.success) {
        setStores(res.data || []);
      }
    } catch (err) {
      console.log(err);
      setStores([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await getProducts();

      const data = res?.data?.data || res?.data || [];

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setProducts([]);
    }
  };

  const fetchVariants = async () => {
    try {
      const res = await api.get("/product-variants/all");

      setVariants(res.data?.data || []);
    } catch (err) {
      console.log(err);
      setVariants([]);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await api.get("/batchs/all");

      setBatches(res.data?.data || []);
    } catch (err) {
      console.log(err);
      setBatches([]);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchProducts();
    fetchVariants();
    fetchBatches();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBarcodes();
    }, 300);

    return () => clearTimeout(timer);


  }, [search, statusFilter, storeFilter, typeFilter]);

  const filteredBarcodes = useMemo(() => {
    return barcodes;
  }, [barcodes]);

  const totalBarcodes = barcodes.length;

  const activeBarcodes = barcodes.filter(
    (b) => b.status === true
  ).length;

  const inactiveBarcodes = barcodes.filter(
    (b) => b.status === false
  ).length;

  const updateField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const openAddModal = () => {
    setEditingId(null);

    setFormData({
      ...emptyBarcode,
      barcode: generateBarcode(),
    });

    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);

    setFormData({
      store: item.store?._id || item.store || "",
      product: item.product?._id || item.product || "",
      variant: item.variant?._id || item.variant || "",
      batch: item.batch?._id || item.batch || "",
      barcode: item.barcode || "",
      skuCode: item.skuCode || "",
      barcodeType: item.barcodeType || "Product",
      status: item.status !== false,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyBarcode);
  };

  const handleSubmit = async () => {
    if (!formData.store || !formData.barcode.trim()) {
      alert("Store and Barcode are required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        product: formData.product || undefined,
        variant: formData.variant || undefined,
        batch: formData.batch || undefined,
      };

      if (editingId) {
        await updateBarcode(editingId, payload);
      } else {
        await createBarcode(payload);
      }

      closeModal();
      fetchBarcodes();
    } catch (err) {
      console.log(err);

      alert(
        err?.response?.data?.message ||
          "Unable to save Barcode."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      setTogglingId(item._id);

      if (item.status === true) {
        await deactivateBarcode(item._id);
      } else {
        await activateBarcode(item._id);
      }

      fetchBarcodes();
    } catch (err) {
      console.log(err);

      alert("Unable to update barcode status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Permanently delete this barcode? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteBarcode(id);

      fetchBarcodes();
    } catch (err) {
      console.log(err);

      alert(
        err?.response?.data?.message ||
          "Unable to delete barcode."
      );
    }
  };

  return (
    <div className="barcode-page">
      <div className="barcode-content">

        <div className="page-header">
          <div>
            <h2>Barcodes</h2>

            <p>
              Manage product, batch and weight barcodes.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add Barcode
          </button>
        </div>

        <div className="barcode-toolbar">

          <div className="barcode-search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search barcode or SKU code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="barcode-filter-select"
            value={storeFilter}
            onChange={(e) =>
              setStoreFilter(e.target.value)
            }
          >
            <option value="">All Stores</option>

            {stores.map((s) => (
              <option
                key={s._id}
                value={s._id}
              >
                {s.storeName}
              </option>
            ))}
          </select>

          <select
            className="barcode-filter-select"
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
          >
            <option value="">All Types</option>

            {BARCODE_TYPES.map((t) => (
              <option
                key={t.value}
                value={t.value}
              >
                {t.label}
              </option>
            ))}
          </select>

          <select
            className="barcode-filter-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="barcode-summary-grid">

          <div className="barcode-summary-card card-blue">
            <div className="barcode-summary-icon">
              <BarcodeIcon size={22} />
            </div>

            <div>
              <h2>{totalBarcodes}</h2>
              <p>Total Barcodes</p>
            </div>
          </div>

          <div className="barcode-summary-card card-green">
            <div className="barcode-summary-icon">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2>{activeBarcodes}</h2>
              <p>Active</p>
            </div>
          </div>

          <div className="barcode-summary-card card-red">
            <div className="barcode-summary-icon">
              <ShieldOff size={22} />
            </div>

            <div>
              <h2>{inactiveBarcodes}</h2>
              <p>Inactive</p>
            </div>
          </div>

        </div>

        <div className="table-card">

          <table className="barcode-table">

            <thead>
              <tr>
                <th>Barcode</th>
                <th>SKU Code</th>
                <th>Type</th>
                <th>Store</th>
                <th>Product</th>
                <th>Status</th>
                <th width="140">Action</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="empty-row"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredBarcodes.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="empty-row"
                  >
                    No Barcodes Found
                  </td>
                </tr>
              ) : (
                filteredBarcodes.map((item) => (
                  <tr key={item._id}>

                    <td>
                      <div className="barcode-info">

                        <div className="barcode-avatar">
                          <BarcodeIcon size={18} />
                        </div>

                        <strong>
                          {item.barcode}
                        </strong>

                      </div>
                    </td>

                    <td>
                      {item.skuCode || "—"}
                    </td>

                    <td>
                      {item.barcodeType || "—"}
                    </td>

                    <td>
                      {item.store?.storeName || "—"}
                    </td>

                    <td>
                      {item.product?.productName || "—"}
                    </td>

                    <td>
                      <span
                        className={
                          item.status === true
                            ? "badge active"
                            : "badge inactive"
                        }
                      >
                        {item.status === true
                          ? "active"
                          : "inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="action-btns">

                        <button
                          className="edit-btn"
                          title="Edit"
                          onClick={() =>
                            openEditModal(item)
                          }
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className={
                            item.status === true
                              ? "deactivate-btn"
                              : "activate-btn"
                          }
                          title={
                            item.status === true
                              ? "Deactivate"
                              : "Activate"
                          }
                          disabled={
                            togglingId === item._id
                          }
                          onClick={() =>
                            handleToggleStatus(item)
                          }
                        >
                          {item.status === true ? (
                            <ShieldOff size={16} />
                          ) : (
                            <ShieldCheck size={16} />
                          )}
                        </button>


                        <button
                          className="delete-btn"
                          title="Delete"
                          onClick={() =>
                            handleDelete(item._id)
                          }
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

            <div className="barcode-modal">

              {/* MODAL HEADER */}
              <div className="modal-header">

                <div>
                  <h3>
                    {editingId
                      ? "Edit Barcode"
                      : "Add Barcode"}
                  </h3>

                  {!editingId && (
                    <span className="modal-subtitle">
                      Barcode will be generated automatically
                    </span>
                  )}
                </div>

                <button
                  className="close-btn"
                  onClick={closeModal}
                >
                  <X size={20} />
                </button>

              </div>


              <div className="modal-body">

                <h4 className="section-title">
                  Barcode Details
                </h4>

                <div className="form-grid">

                  <div className="form-group">

                    <label>
                      Store <span className="required">*</span>
                    </label>

                    <select
                      value={formData.store}
                      onChange={(e) =>
                        updateField(
                          "store",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Store
                      </option>

                      {stores.map((s) => (
                        <option
                          key={s._id}
                          value={s._id}
                        >
                          {s.storeName}
                        </option>
                      ))}
                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Barcode Type
                    </label>

                    <select
                      value={formData.barcodeType}
                      onChange={(e) =>
                        updateField(
                          "barcodeType",
                          e.target.value
                        )
                      }
                    >
                      {BARCODE_TYPES.map((t) => (
                        <option
                          key={t.value}
                          value={t.value}
                        >
                          {t.label}
                        </option>
                      ))}
                    </select>

                  </div>

                  <div className="form-group barcode-generated-group">

                    <label>
                      Barcode{" "}
                      <span className="auto-label">
                        Auto Generated
                      </span>
                    </label>

                    <div className="barcode-input-wrapper">

                      <BarcodeIcon size={18} />

                      <input
                        value={formData.barcode}
                        readOnly
                        placeholder="Auto-generated barcode"
                      />

                      <span className="generated-check">
                        ✓
                      </span>

                    </div>

                    <small className="field-help">
                      This barcode is generated automatically
                      and cannot be edited.
                    </small>

                  </div>

                  <div className="form-group">

                    <label>
                      SKU Code
                    </label>

                    <input
                      placeholder="e.g. SKU-001"
                      value={formData.skuCode}
                      onChange={(e) =>
                        updateField(
                          "skuCode",
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Product
                    </label>

                    <select
                      value={formData.product}
                      onChange={(e) =>
                        updateField(
                          "product",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Product
                      </option>

                      {products.map((p) => (
                        <option
                          key={p._id}
                          value={p._id}
                        >
                          {p.productName}
                        </option>
                      ))}
                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Variant
                    </label>

                    <select
                      value={formData.variant}
                      onChange={(e) =>
                        updateField(
                          "variant",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Variant
                      </option>

                      {variants.map((v) => (
                        <option
                          key={v._id}
                          value={v._id}
                        >
                          {v.variantName ||
                            v.skuCode ||
                            "Unnamed Variant"}
                        </option>
                      ))}
                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Batch
                    </label>

                    <select
                      value={formData.batch}
                      onChange={(e) =>
                        updateField(
                          "batch",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Batch
                      </option>

                      {batches.map((b) => (
                        <option
                          key={b._id}
                          value={b._id}
                        >
                          {b.batchNumber}
                        </option>
                      ))}
                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Status
                    </label>

                    <select
                      value={
                        formData.status
                          ? "true"
                          : "false"
                      }
                      onChange={(e) =>
                        updateField(
                          "status",
                          e.target.value === "true"
                        )
                      }
                    >
                      <option value="true">
                        Active
                      </option>

                      <option value="false">
                        Inactive
                      </option>
                    </select>

                  </div>

                </div>
              </div>

              <div className="modal-footer">

                <button
                  className="cancel-btn"
                  onClick={closeModal}
                >
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
                    ? "Update Barcode"
                    : "Create Barcode"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}