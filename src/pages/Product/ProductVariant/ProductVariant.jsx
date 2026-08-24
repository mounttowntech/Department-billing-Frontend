import React, { useEffect, useMemo, useState } from "react";
import "./ProductVariant.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Tags,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  Upload,
} from "lucide-react";

import {
  getVariants,
  createVariant,
  updateVariant,
  activateVariant,
  deactivateVariant,
  deleteVariant,
  resolveVariantImageUrl,
} from "../../../services/productVariantService";

import { getStores } from "../../../services/storeService";
import { getProducts } from "../../../services/productService";
import { getUnits } from "../../../services/unitService";
import { getWarehouses } from "../../../services/warehouseService";
import { getShelves } from "../../../services/shelfService";

const emptyVariant = {
  store: "",
  product: "",
  skuCode: "",
  barcode: "",
  variantName: "",
  unit: "",
  packSize: "",
  weight: 0,
  purchasePrice: 0,
  sellingPrice: 0,
  mrp: 0,
  gstPercentage: 0,
  currentStock: 0,
  minimumStock: 5,
  warehouse: "",
  shelf: "",
  status: "active",
};

export default function ProductVariant() {
  const [variants, setVariants] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [shelves, setShelves] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyVariant);
  const [existingImages, setExistingImages] = useState([]); // already-saved paths, kept unless removed
  const [newImageFiles, setNewImageFiles] = useState([]); // File objects picked from device, not yet uploaded
  const [newImagePreviews, setNewImagePreviews] = useState([]); // matching blob: preview URLs

  const fetchVariants = async () => {
    try {
      setLoading(true);

      const res = await getVariants({
        search: search || undefined,
        status: statusFilter || undefined,
        store: storeFilter || undefined,
        product: productFilter || undefined,
      });

      if (res.data.success) {
        setVariants(res.data.data || []);
      } else {
        setVariants([]);
      }
    } catch (err) {
      console.log(err);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
 
    try {
      const productRes = await getProducts();
      if (productRes.data.success) setProducts(productRes.data.data || []);
    } catch (err) {
      console.log("Failed to load products:", err);
    }

    try {
      const storeRes = await getStores();
      if (storeRes.success) setStores(storeRes.data || []);
    } catch (err) {
      console.log("Failed to load stores:", err);
    }

    try {
      const unitRes = await getUnits();
      if (unitRes.success) setUnits(unitRes.data || []);
    } catch (err) {
      console.log("Failed to load units:", err);
    }

    try {
      const warehouseRes = await getWarehouses();
      if (warehouseRes.success) setWarehouses(warehouseRes.data || []);
    } catch (err) {
      console.log("Failed to load warehouses:", err);
    }

    try {
      const shelfRes = await getShelves();
      if (shelfRes.success) setShelves(shelfRes.data || []);
    } catch (err) {
      console.log("Failed to load shelves:", err);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVariants();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, statusFilter, storeFilter, productFilter]);

  const filteredVariants = useMemo(() => variants, [variants]);

  const totalVariants = variants.length;
  const activeVariants = variants.filter((x) => x.status === "active").length;
  const inactiveVariants = variants.filter((x) => x.status === "inactive").length;
  const lowStockVariants = variants.filter(
    (x) => Number(x.currentStock || 0) <= Number(x.minimumStock || 0)
  ).length;

  const shelvesForFormWarehouse = useMemo(() => {
    if (!formData.warehouse) return [];
    return shelves.filter(
      (s) => (s.warehouse?._id || s.warehouse) === formData.warehouse
    );
  }, [shelves, formData.warehouse]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyVariant);
    setExistingImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setShowModal(true);
  };

  const openEditModal = (variant) => {
    setEditingId(variant._id);
    setFormData({
      store: variant.store?._id || variant.store || "",
      product: variant.product?._id || variant.product || "",
      skuCode: variant.skuCode || "",
      barcode: variant.barcode || "",
      variantName: variant.variantName || "",
      unit: variant.unit?._id || variant.unit || "",
      packSize: variant.packSize || "",
      weight: variant.weight ?? 0,
      purchasePrice: variant.purchasePrice ?? 0,
      sellingPrice: variant.sellingPrice ?? 0,
      mrp: variant.mrp ?? 0,
      gstPercentage: variant.gstPercentage ?? 0,
      currentStock: variant.currentStock ?? 0,
      minimumStock: variant.minimumStock ?? 5,
      warehouse: variant.warehouse?._id || variant.warehouse || "",
      shelf: variant.shelf?._id || variant.shelf || "",
      status: variant.status || "active",
    });
    setExistingImages(
      Array.isArray(variant.imageUrls) ? variant.imageUrls : []
    );
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyVariant);
    setExistingImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
  };

  const handleImagesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {

    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  
  }, []);

  const handleSubmit = async () => {
    if (
      !formData.store ||
      !formData.product ||
      !formData.skuCode ||
      !formData.barcode ||
      !formData.sellingPrice ||
      !formData.mrp
    ) {
      alert(
        "Store, Product, SKU Code, Barcode, Selling Price and MRP are required."
      );
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        fd.append(key, value);
      });

      existingImages.forEach((url) => fd.append("existingImages", url));
      newImageFiles.forEach((file) => fd.append("images", file));

      if (editingId) {
        await updateVariant(editingId, fd);
      } else {
        await createVariant(fd);
      }

      closeModal();
      fetchVariants();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to save Product Variant.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (variant) => {
    try {
      if (variant.status === "active") {
        await deactivateVariant(variant._id);
      } else {
        await activateVariant(variant._id);
      }
      fetchVariants();
    } catch (err) {
      console.log(err);
      alert("Unable to update variant status.");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Permanently delete this product variant? This cannot be undone."
      )
    )
      return;

    try {
      await deleteVariant(id);
      fetchVariants();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to delete variant.");
    }
  };

  const stockBadge = (variant) => {
    const stock = Number(variant.currentStock || 0);
    const min = Number(variant.minimumStock || 0);
    if (stock <= 0) return { label: "Out of Stock", cls: "stock-out" };
    if (stock <= min) return { label: "Low Stock", cls: "stock-low" };
    return { label: "In Stock", cls: "stock-in" };
  };

  return (
    <div className="variant-page">
      <div className="variant-content">
      
        <div className="page-header">
          <div>
            <h2>Product Variants</h2>
            <p>Manage SKUs, pricing and stock per product variant.</p>
          </div>

          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={18} />
            Add Variant
          </button>
        </div>

        
        <div className="variants-toolbar">
          <div className="variants-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search SKU, barcode, variant name, pack size..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="variants-filter-select"
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
          >
            <option value="">All Stores</option>
            {stores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.storeName}
              </option>
            ))}
          </select>

          <select
            className="variants-filter-select"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.productName}
              </option>
            ))}
          </select>

          <select
            className="variants-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>


        <div className="variant-summary-grid">
          <div className="variant-summary-card card-blue">
            <div className="variant-summary-icon">
              <Tags size={24} />
            </div>
            <h2>{totalVariants}</h2>
            <p>Total Variants</p>
          </div>

          <div className="variant-summary-card card-green">
            <div className="variant-summary-icon">
              <ShieldCheck size={24} />
            </div>
            <h2>{activeVariants}</h2>
            <p>Active</p>
          </div>

          <div className="variant-summary-card card-red">
            <div className="variant-summary-icon">
              <ShieldOff size={24} />
            </div>
            <h2>{inactiveVariants}</h2>
            <p>Inactive</p>
          </div>

          <div className="variant-summary-card card-amber">
            <div className="variant-summary-icon">
              <AlertTriangle size={24} />
            </div>
            <h2>{lowStockVariants}</h2>
            <p>Low / Out of Stock</p>
          </div>
        </div>

        <div className="table-card">
          <table className="variant-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Variant</th>
                <th>Product</th>
                <th>Price (Selling / MRP)</th>
                <th>Stock</th>
                <th>Status</th>
                <th width="140">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    Loading...
                  </td>
                </tr>
              ) : filteredVariants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    No Product Variants Found
                  </td>
                </tr>
              ) : (
                filteredVariants.map((variant) => {
                  const badge = stockBadge(variant);

                  return (
                    <tr key={variant._id}>
                        <td>
  <div className="variant-table-image">
    {variant.imageUrls?.length > 0 ? (
      <img
        src={resolveVariantImageUrl(variant.imageUrls[0])}
        alt={variant.variantName || "Variant"}
      />
    ) : (
      <div className="no-variant-image">
        <Tags size={18} />
      </div>
    )}
  </div>
</td>
                      <td>
                        <div className="variant-info">
                          <strong>
                            {variant.variantName || variant.skuCode}
                          </strong>
                          <p>
                            {variant.skuCode} · {variant.barcode}
                            {variant.packSize ? ` · ${variant.packSize}` : ""}
                          </p>
                        </div>
                      </td>
       
                      <td>{variant.product?.productName || "—"}</td>

                      <td>
                        <div className="price-cell">
                          <strong>₹{Number(variant.sellingPrice || 0).toLocaleString("en-IN")}</strong>
                          <span>₹{Number(variant.mrp || 0).toLocaleString("en-IN")}</span>
                        </div>
                      </td>

                      <td>
                        {variant.currentStock ?? 0}{" "}
                        <span className={`badge ${badge.cls}`} style={{ marginLeft: 6 }}>
                          {badge.label}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            variant.status === "active"
                              ? "badge active"
                              : "badge inactive"
                          }
                        >
                          {variant.status}
                        </span>
                      </td>

                      <td>
                        <div className="action-btns">
                          <button
                            className="edit-btn"
                            title="Edit"
                            onClick={() => openEditModal(variant)}
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            className={
                              variant.status === "active"
                                ? "deactivate-btn"
                                : "activate-btn"
                            }
                            title={
                              variant.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                            onClick={() => handleToggleStatus(variant)}
                          >
                            {variant.status === "active" ? (
                              <ShieldOff size={16} />
                            ) : (
                              <ShieldCheck size={16} />
                            )}
                          </button>

                          <button
                            className="delete-btn"
                            title="Delete"
                            onClick={() => handleDelete(variant._id)}
                          >
                            <Trash2 size={16} />
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

        {showModal && (
          <div className="modal-overlay">
            <div className="variant-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Variant" : "Add Variant"}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <h4 className="section-title">Identity</h4>

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
                      onChange={(e) => updateField("product", e.target.value)}
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
                    <label>SKU Code *</label>
                    <input
                      placeholder="e.g. SKU-RICE-1KG"
                      value={formData.skuCode}
                      onChange={(e) => updateField("skuCode", e.target.value)}
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

                  <div className="form-group">
                    <label>Variant Name</label>
                    <input
                      placeholder="e.g. 1kg Pack"
                      value={formData.variantName}
                      onChange={(e) =>
                        updateField("variantName", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Pack Size</label>
                    <input
                      placeholder="e.g. 1kg, 500ml"
                      value={formData.packSize}
                      onChange={(e) =>
                        updateField("packSize", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => updateField("unit", e.target.value)}
                    >
                      <option value="">Select Unit</option>
                      {units.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.unitName} ({u.shortName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Weight</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.weight}
                      onChange={(e) => updateField("weight", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => updateField("status", e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <h4 className="section-title">Pricing & Tax</h4>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Purchase Price</label>
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

                  <div className="form-group">
                    <label>GST %</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.gstPercentage}
                      onChange={(e) =>
                        updateField("gstPercentage", e.target.value)
                      }
                    />
                  </div>
                </div>

                <h4 className="section-title">Stock & Location</h4>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Current Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.currentStock}
                      onChange={(e) =>
                        updateField("currentStock", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Minimum Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minimumStock}
                      onChange={(e) =>
                        updateField("minimumStock", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Warehouse</label>
                    <select
                      value={formData.warehouse}
                      onChange={(e) => {
                        updateField("warehouse", e.target.value);
                        updateField("shelf", ""); // reset dependent field
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
                      onChange={(e) => updateField("shelf", e.target.value)}
                      disabled={!formData.warehouse}
                    >
                      <option value="">
                        {formData.warehouse ? "Select Shelf" : "Select a warehouse first"}
                      </option>
                      {shelvesForFormWarehouse.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.shelfName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <h4 className="section-title">Images</h4>

                <div className="image-grid">
                  {existingImages.map((url, index) => (
                    <div className="image-thumb" key={`existing-${index}`}>
                      <img src={resolveVariantImageUrl(url)} alt="" />
                      <button
                        type="button"
                        className="image-thumb-remove"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {newImagePreviews.map((url, index) => (
                    <div className="image-thumb" key={`new-${index}`}>
                      <img src={url} alt="" />
                      <button
                        type="button"
                        className="image-thumb-remove"
                        onClick={() => removeNewImage(index)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  <label className="image-thumb-add">
                    <Upload size={18} />
                    <span>Add Images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesSelect}
                      hidden
                    />
                  </label>
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
                    ? "Update Variant"
                    : "Create Variant"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}