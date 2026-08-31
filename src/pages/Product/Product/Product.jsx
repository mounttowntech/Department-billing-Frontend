import React, { useEffect, useMemo, useState } from "react";
import "./Product.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Package,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";

import {
  getProducts,
  createProduct,
  updateProduct,
  activateProduct,
  deactivateProduct,
  deleteProduct,
  resolveProductImageUrl,
} from "../../../services/productService";

import { getStores } from "../../../services/storeService";
import { getCategories } from "../../../services/categoryService";
import { getBrands } from "../../../services/brandService";
import { getTaxSettings } from "../../../services/taxSettingService";
import { getSubCategories } from "../../../services/subCategoryService";
import { getUnits } from "../../../services/unitService";

const emptyProduct = {
  store: "",
  productCode: "",
  productName: "",
  displayName: "",
  category: "",
  subCategory: "",
  brand: "",
  unit: "",
  taxSetting: "",
  hsnCode: "",
  description: "",
  totalStock: 0,
  minimumStock: 5,
  isBatchRequired: false,
  isExpiryRequired: false,
  allowDiscount: true,
  allowReturn: true,
  status: "active",
};

export default function Product() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [taxes, setTaxes] = useState([]);

  const [filterCategories, setFilterCategories] = useState([]);
  const [filterBrands, setFilterBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);

  const [existingImage, setExistingImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts({
        store: storeFilter || undefined,
        category: categoryFilter || undefined,
        brand: brandFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
      });

      if (res.data?.success) {
        setProducts(res.data.data || []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.log("Product fetch error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalDropdowns = async () => {
    try {
      const [storeRes, taxRes] = await Promise.all([
        getStores(),
        getTaxSettings({ status: "active" }),
      ]);

      if (storeRes?.success || storeRes?.data?.success) {
        const storeData = storeRes.data || storeRes.data?.data || [];
        setStores(storeData);
        // Default to the first store (e.g., D-Mart) if none is selected
        if (storeData.length > 0 && !storeFilter) {
          setStoreFilter(storeData[0]._id);
        }
      }
      if (taxRes?.success || taxRes?.data?.success) {
        setTaxes(taxRes.data || taxRes.data?.data || []);
      }
    } catch (err) {
      console.log("Global dropdown fetch error:", err);
    }
  };

  const fetchStoreDependentDropdowns = async (storeId, isForFilter = false) => {
    try {
      const params = storeId ? { store: storeId } : {};
      const [catRes, subCatRes, brandRes, unitRes] = await Promise.all([
        getCategories(params),
        getSubCategories(params),
        getBrands(params),
        getUnits(params),
      ]);

      const catList = catRes?.data || catRes?.data?.data || [];
      const brandList = brandRes?.data || brandRes?.data?.data || [];
      const subCatList = subCatRes?.data || subCatRes?.data?.data || [];
      const unitList = unitRes?.data || unitRes?.data?.data || [];

      if (isForFilter) {
        setFilterCategories(catList);
        setFilterBrands(brandList);
      } else {
        setCategories(catList);
        setSubCategories(subCatList);
        setBrands(brandList);
        setUnits(unitList);
      }
    } catch (err) {
      console.log("Store dependent dropdown error:", err);
    }
  };

  useEffect(() => {
    fetchGlobalDropdowns();
  }, []);

  useEffect(() => {
    fetchStoreDependentDropdowns(storeFilter, true);
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, statusFilter, storeFilter, categoryFilter, brandFilter]);

  const filteredProducts = useMemo(() => products, [products]);

  const totalProducts = filteredProducts.length;
  const activeProducts = filteredProducts.filter(
    (x) => String(x.status).toLowerCase() === "active",
  ).length;
  const inactiveProducts = filteredProducts.filter(
    (x) => String(x.status).toLowerCase() === "inactive",
  ).length;
  const lowStockProducts = filteredProducts.filter(
    (x) => Number(x.totalStock || 0) <= Number(x.minimumStock || 0),
  ).length;

  const subCategoriesForFormCategory = useMemo(() => {
    if (!formData.category) return [];
    return subCategories.filter((sc) => {
      const categoryId = sc.category?._id || sc.category?.id || sc.category || "";
      return String(categoryId) === String(formData.category);
    });
  }, [subCategories, formData.category]);

  const updateField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === "store") {
      fetchStoreDependentDropdowns(value, false);
      setFormData((prev) => ({
        ...prev,
        category: "",
        subCategory: "",
        brand: "",
        unit: "",
      }));
    }
  };

  const resetImageState = () => {
    setExistingImage("");
    setImageFile(null);
    setImagePreview("");
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      ...emptyProduct,
      store: storeFilter || (stores.length > 0 ? stores[0]._id : ""),
    });
    if (storeFilter || (stores.length > 0 ? stores[0]._id : "")) {
      fetchStoreDependentDropdowns(storeFilter || stores[0]._id, false);
    }
    resetImageState();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    const storeId = product.store?._id || product.store || "";

    setFormData({
      store: storeId,
      productCode: product.productCode || "",
      productName: product.productName || "",
      displayName: product.displayName || "",
      category: product.category?._id || product.category || "",
      subCategory: product.subCategory?._id || product.subCategory || "",
      brand: product.brand?._id || product.brand || "",
      unit: product.unit?._id || product.unit || "",
      taxSetting: product.taxSetting?._id || product.taxSetting || "",
      hsnCode: product.hsnCode || "",
      description: product.description || "",
      totalStock: product.totalStock ?? 0,
      minimumStock: product.minimumStock ?? 5,
      isBatchRequired: Boolean(product.isBatchRequired),
      isExpiryRequired: Boolean(product.isExpiryRequired),
      allowDiscount: product.allowDiscount !== false,
      allowReturn: product.allowReturn !== false,
      status: product.status || "active",
    });

    if (storeId) {
      fetchStoreDependentDropdowns(storeId, false);
    }

    setExistingImage(product.image || "");
    setImageFile(null);
    setImagePreview("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ ...emptyProduct });
    resetImageState();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setExistingImage("");
  };

  const displayedImage = imagePreview || resolveProductImageUrl(existingImage);

  const handleSubmit = async () => {
    if (
      !formData.store ||
      !formData.productCode ||
      !formData.productName ||
      !formData.category ||
      !formData.unit
    ) {
      alert("Store, Product Code, Product Name, Category and Unit are required.");
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        fd.append(key, value);
      });

      if (imageFile) {
        fd.append("image", imageFile);
      }

      if (editingId) {
        fd.append("existingImage", existingImage || "");
        await updateProduct(editingId, fd);
      } else {
        await createProduct(fd);
      }

      closeModal();
      await fetchProducts();
    } catch (err) {
      console.log("Save product error:", err);
      alert(err.response?.data?.message || "Unable to save Product.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      if (String(product.status).toLowerCase() === "active") {
        await deactivateProduct(product._id);
      } else {
        await activateProduct(product._id);
      }
      await fetchProducts();
    } catch (err) {
      console.log(err);
      alert("Unable to update product status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this product? This cannot be undone.")) {
      return;
    }

    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to delete product.");
    }
  };

  return (
    <div className="product-page">
      <div className="product-content">
        <div className="page-header">
          <div>
            <h2>Products</h2>
            <p>Manage store-wise product catalog.</p>
          </div>

          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={18} />
            Add Product
          </button>
        </div>

        <div className="product-toolbar">
          <div className="product-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search product code, name or HSN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="product-filter-select"
            value={storeFilter}
            onChange={(e) => {
              setStoreFilter(e.target.value);
              setCategoryFilter("");
              setBrandFilter("");
            }}
          >
            <option value="">Select Store</option>
            {stores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.storeName}
              </option>
            ))}
          </select>

          <select
            className="product-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={!storeFilter}
          >
            <option value="">All Categories</option>
            {filterCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.categoryName}
              </option>
            ))}
          </select>

          <select
            className="product-filter-select"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            disabled={!storeFilter}
          >
            <option value="">All Brands</option>
            {filterBrands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.brandName}
              </option>
            ))}
          </select>

          <select
            className="product-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="product-summary-grid">
          <div className="product-summary-card card-blue">
            <div className="product-summary-icon">
              <Package size={24} />
            </div>
            <h2>{totalProducts}</h2>
            <p>Total Products</p>
          </div>

          <div className="product-summary-card card-green">
            <div className="product-summary-icon">
              <ShieldCheck size={24} />
            </div>
            <h2>{activeProducts}</h2>
            <p>Active</p>
          </div>

          <div className="product-summary-card card-red">
            <div className="product-summary-icon">
              <ShieldOff size={24} />
            </div>
            <h2>{inactiveProducts}</h2>
            <p>Inactive</p>
          </div>

          <div className="product-summary-card card-amber">
            <div className="product-summary-icon">
              <AlertTriangle size={24} />
            </div>
            <h2>{lowStockProducts}</h2>
            <p>Low Stock</p>
          </div>
        </div>

        <div className="table-card">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Unit</th>
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
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    {!storeFilter ? "Please select a store to view products" : "No Products Found"}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLow =
                    Number(product.totalStock || 0) <=
                    Number(product.minimumStock || 0);

                  return (
                    <tr key={product._id}>
                      <td>
                        <div className="product-info">
                          <div className="product-avatar">
                            {product.image ? (
                              <img
                                src={resolveProductImageUrl(product.image)}
                                alt={product.productName}
                              />
                            ) : (
                              <Package size={18} />
                            )}
                          </div>

                          <div>
                            <strong>
                              {product.displayName || product.productName}
                            </strong>
                            <p>{product.productCode}</p>
                          </div>
                        </div>
                      </td>

                      <td>{product.category?.categoryName || "—"}</td>
                      <td>{product.brand?.brandName || "—"}</td>
                      <td>{product.unit?.shortName || "—"}</td>

                      <td>
                        <span className={`stock-value ${isLow ? "low" : ""}`}>
                          {product.totalStock ?? 0}
                        </span>

                        {isLow && (
                          <span
                            className="badge low-stock"
                            style={{ marginLeft: 8 }}
                          >
                            Low
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            String(product.status).toLowerCase() === "active"
                              ? "badge active"
                              : "badge inactive"
                          }
                        >
                          {product.status}
                        </span>
                      </td>

                      <td>
                        <div className="action-btns">
                          <button
                            className="edit-btn"
                            title="Edit"
                            onClick={() => openEditModal(product)}
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            className={
                              String(product.status).toLowerCase() === "active"
                                ? "deactivate-btn"
                                : "activate-btn"
                            }
                            title={
                              String(product.status).toLowerCase() === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                            onClick={() => handleToggleStatus(product)}
                          >
                            {String(product.status).toLowerCase() === "active" ? (
                              <ShieldOff size={16} />
                            ) : (
                              <ShieldCheck size={16} />
                            )}
                          </button>

                          <button
                            className="delete-btn"
                            title="Delete"
                            onClick={() => handleDelete(product._id)}
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
            <div className="product-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Product" : "Add Product"}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <h4 className="section-title">Basic Information</h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Store *</label>
                    <select
                      value={formData.store}
                      onChange={(e) => updateField("store", e.target.value)}
                    >
                      <option value="">Select Store</option>
                      {stores.map((store) => (
                        <option key={store._id} value={store._id}>
                          {store.storeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Product Code *</label>
                    <input
                      placeholder="e.g. PRD-0001"
                      value={formData.productCode}
                      onChange={(e) =>
                        updateField("productCode", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      placeholder="e.g. Basmati Rice 1kg"
                      value={formData.productName}
                      onChange={(e) =>
                        updateField("productName", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      placeholder="Defaults to Product Name"
                      value={formData.displayName}
                      onChange={(e) =>
                        updateField("displayName", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        updateField("category", e.target.value);
                        updateField("subCategory", "");
                      }}
                      disabled={!formData.store}
                    >
                      <option value="">
                        {formData.store ? "Select Category" : "Select a store first"}
                      </option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Sub-Category</label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) =>
                        updateField("subCategory", e.target.value)
                      }
                      disabled={!formData.category}
                    >
                      <option value="">
                        {formData.category
                          ? "Select Sub-Category"
                          : "Select a category first"}
                      </option>
                      {subCategoriesForFormCategory.map((subCategory) => (
                        <option key={subCategory._id} value={subCategory._id}>
                          {subCategory.subCategoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Brand</label>
                    <select
                      value={formData.brand}
                      onChange={(e) => updateField("brand", e.target.value)}
                      disabled={!formData.store}
                    >
                      <option value="">
                        {formData.store ? "No Brand" : "Select a store first"}
                      </option>
                      {brands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.brandName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Unit *</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => updateField("unit", e.target.value)}
                      disabled={!formData.store}
                    >
                      <option value="">
                        {formData.store ? "Select Unit" : "Select a store first"}
                      </option>
                      {units.map((unit) => (
                        <option key={unit._id} value={unit._id}>
                          {unit.unitName} ({unit.shortName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tax Setting</label>
                    <select
                      value={formData.taxSetting}
                      onChange={(e) =>
                        updateField("taxSetting", e.target.value)
                      }
                    >
                      <option value="">No Tax</option>
                      {taxes.map((tax) => (
                        <option key={tax._id} value={tax._id}>
                          {tax.taxName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>HSN Code</label>
                    <input
                      value={formData.hsnCode}
                      onChange={(e) => updateField("hsnCode", e.target.value)}
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

                  <div className="form-group">
                    <label>Total Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.totalStock}
                      onChange={(e) =>
                        updateField("totalStock", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Minimum Stock (reorder level)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minimumStock}
                      onChange={(e) =>
                        updateField("minimumStock", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label>Product Image</label>
                    <div className="image-picker">
                      {displayedImage ? (
                        <img
                          src={displayedImage}
                          alt="Product preview"
                          className="image-preview"
                        />
                      ) : (
                        <div className="image-preview image-preview-empty">
                          <ImageIcon size={22} />
                        </div>
                      )}

                      <label className="image-picker-btn">
                        {displayedImage ? "Change Image" : "Choose Image"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          hidden
                        />
                      </label>

                      {displayedImage && (
                        <button
                          type="button"
                          className="image-picker-clear"
                          onClick={handleRemoveImage}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-group form-group-full">
                    <label>Description</label>
                    <textarea
                      rows="2"
                      value={formData.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                    />
                  </div>
                </div>

                <h4 className="section-title">Inventory Settings</h4>

                <div className="checkbox-grid">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isBatchRequired}
                      onChange={(e) =>
                        updateField("isBatchRequired", e.target.checked)
                      }
                    />
                    Batch Tracking Required
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isExpiryRequired}
                      onChange={(e) =>
                        updateField("isExpiryRequired", e.target.checked)
                      }
                    />
                    Expiry Date Required
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.allowDiscount}
                      onChange={(e) =>
                        updateField("allowDiscount", e.target.checked)
                      }
                    />
                    Allow Discount
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.allowReturn}
                      onChange={(e) =>
                        updateField("allowReturn", e.target.checked)
                      }
                    />
                    Allow Return
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
                      ? "Update Product"
                      : "Create Product"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}