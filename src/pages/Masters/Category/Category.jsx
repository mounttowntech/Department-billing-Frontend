import React, { useEffect, useMemo, useState } from "react";
import "./Category.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  LayoutGrid,
  ShieldCheck,
  ShieldOff,
  Image as ImageIcon,
} from "lucide-react";

import {
  getCategories,
  createCategory,
  updateCategory,
  toggleCategory,
  deleteCategory,
  resolveImageUrl,
} from "../../../services/categoryService";

import { getStores } from "../../../services/storeService";
import { getTaxSettings } from "../../../services/taxSettingService";

const DEPARTMENT_TYPES = [
  { value: "department_store", label: "Department Store" },
  { value: "restaurant", label: "Restaurant" },
  { value: "garments", label: "Garments" },
  { value: "general", label: "General" },
];

const emptyCategory = {
  store: "",
  categoryCode: "",
  categoryName: "",
  displayName: "",
  description: "",
  departmentType: "department_store",
  taxSetting: "",
  allowDiscount: true,
  allowReturn: true,
  status: "active",
};

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [taxes, setTaxes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyCategory);


  const [existingImageURL, setExistingImageURL] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [existingIcon, setExistingIcon] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await getCategories({
        search: search || undefined,
        status: statusFilter || undefined,
        store: storeFilter || undefined,
        departmentType: typeFilter || undefined,
      });

      if (res.success) {
        setCategories(res.data || []);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.log(err);
      setCategories([]);
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

  const fetchTaxes = async () => {
    try {
      const res = await getTaxSettings({ status: "active" });
      if (res.success) {
        setTaxes(res.data || []);
      }
    } catch (err) {
      console.log(err);
      setTaxes([]);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchTaxes();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 300);

    return () => clearTimeout(timer);
   
  }, [search, statusFilter, storeFilter, typeFilter]);

 
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      if (iconPreview && iconPreview.startsWith("blob:")) {
        URL.revokeObjectURL(iconPreview);
      }
    };
  }, [iconPreview]);

  const filteredCategories = useMemo(() => categories, [categories]);

  const totalCategories = categories.length;
  const activeCategories = categories.filter((x) => x.status === "active").length;
  const inactiveCategories = categories.filter((x) => x.status === "inactive").length;

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetImageState = () => {
    setExistingImageURL("");
    setImageFile(null);
    setImagePreview("");
    setExistingIcon("");
    setIconFile(null);
    setIconPreview("");
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyCategory);
    resetImageState();
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingId(category._id);
    setFormData({
      store: category.store?._id || category.store || "",
      categoryCode: category.categoryCode || "",
      categoryName: category.categoryName || "",
      displayName: category.displayName || "",
      description: category.description || "",
      departmentType: category.departmentType || "department_store",
      taxSetting: category.taxSetting?._id || category.taxSetting || "",
      allowDiscount: category.allowDiscount !== false,
      allowReturn: category.allowReturn !== false,
      status: category.status || "active",
    });

    setExistingImageURL(category.imageURL || "");
    setImageFile(null);
    setImagePreview("");
    setExistingIcon(category.icon || "");
    setIconFile(null);
    setIconPreview("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyCategory);
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
    setExistingImageURL("");
  };

  const handleIconSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleRemoveIcon = () => {
    setIconFile(null);
    setIconPreview("");
    setExistingIcon("");
  };


  const displayedImage = imagePreview || resolveImageUrl(existingImageURL);
  const displayedIcon = iconPreview || resolveImageUrl(existingIcon);

  const handleSubmit = async () => {
    if (!formData.store || !formData.categoryCode || !formData.categoryName) {
      alert("Store, Category Code and Category Name are required.");
      return;
    }

    try {
      setSaving(true);

      const fields = {
        ...formData,
        taxSetting: formData.taxSetting || "",
      };

      if (editingId) {
       
        fields.existingImageURL = existingImageURL || "";
        fields.existingIcon = existingIcon || "";
        await updateCategory(editingId, fields, imageFile, iconFile);
      } else {
        await createCategory(fields, imageFile, iconFile);
      }

      closeModal();
      fetchCategories();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to save Category.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleCategory(id);
      fetchCategories();
    } catch (err) {
      console.log(err);
      alert("Unable to update category status.");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Permanently delete this category? This cannot be undone."
      )
    )
      return;

    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to delete category.");
    }
  };

  return (
    <div className="category-page">
      <div className="category-content">
        {/* ===========================
        PAGE HEADER
        =========================== */}

        <div className="page-header">
          <div>
            <h2>Categories</h2>
            <p>Manage department categories and their settings.</p>
          </div>

          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={18} />
            Add Category
          </button>
        </div>

        <div className="category-toolbar">
          <div className="category-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search category code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="category-filter-select"
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
            className="category-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {DEPARTMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            className="category-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>


        <div className="category-summary-grid">
          <div className="category-summary-card card-blue">
            <div className="category-summary-icon">
              <LayoutGrid size={24} />
            </div>
            <h2>{totalCategories}</h2>
            <p>Total Categories</p>
          </div>

          <div className="category-summary-card card-green">
            <div className="category-summary-icon">
              <ShieldCheck size={24} />
            </div>
            <h2>{activeCategories}</h2>
            <p>Active</p>
          </div>

          <div className="category-summary-card card-red">
            <div className="category-summary-icon">
              <ShieldOff size={24} />
            </div>
            <h2>{inactiveCategories}</h2>
            <p>Inactive</p>
          </div>
        </div>

    
        <div className="table-card">
          <table className="category-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Store</th>
                <th>Type</th>
                <th>Tax</th>
                <th>Status</th>
                <th width="140">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    Loading...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    No Categories Found
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category._id}>
                    <td>
                      <div className="category-info">
                        <div className="category-avatar">
                          {category.imageURL ? (
                            <img
                              src={resolveImageUrl(category.imageURL)}
                              alt={category.categoryName}
                            />
                          ) : (
                            <LayoutGrid size={18} />
                          )}
                        </div>
                        <div>
                          <strong>
                            {category.displayName || category.categoryName}
                          </strong>
                          <p>{category.categoryCode}</p>
                        </div>
                      </div>
                    </td>

                    <td>{category.store?.storeName || "—"}</td>

                    <td>
                      {DEPARTMENT_TYPES.find(
                        (t) => t.value === category.departmentType
                      )?.label || category.departmentType}
                    </td>

                    <td>{category.taxSetting?.taxName || "—"}</td>

                    <td>
                      <span
                        className={
                          category.status === "active"
                            ? "badge active"
                            : "badge inactive"
                        }
                      >
                        {category.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          title="Edit"
                          onClick={() => openEditModal(category)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className={
                            category.status === "active"
                              ? "deactivate-btn"
                              : "activate-btn"
                          }
                          title={
                            category.status === "active"
                              ? "Deactivate"
                              : "Activate"
                          }
                          onClick={() => handleToggleStatus(category._id)}
                        >
                          {category.status === "active" ? (
                            <ShieldOff size={16} />
                          ) : (
                            <ShieldCheck size={16} />
                          )}
                        </button>

                        <button
                          className="delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(category._id)}
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
            <div className="category-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Category" : "Add Category"}</h3>
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
                      {stores.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.storeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Category Code *</label>
                    <input
                      placeholder="e.g. GROCERY"
                      value={formData.categoryCode}
                      onChange={(e) =>
                        updateField("categoryCode", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Category Name *</label>
                    <input
                      placeholder="e.g. Grocery"
                      value={formData.categoryName}
                      onChange={(e) =>
                        updateField("categoryName", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      placeholder="Defaults to Category Name"
                      value={formData.displayName}
                      onChange={(e) =>
                        updateField("displayName", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Department Type</label>
                    <select
                      value={formData.departmentType}
                      onChange={(e) =>
                        updateField("departmentType", e.target.value)
                      }
                    >
                      {DEPARTMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
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
                      {taxes.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.taxName}
                        </option>
                      ))}
                    </select>
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
                    <label>Icon</label>
                    <div className="image-picker">
                      {displayedIcon ? (
                        <img
                          src={displayedIcon}
                          alt="Icon preview"
                          className="image-preview icon-preview"
                        />
                      ) : (
                        <div className="image-preview icon-preview image-preview-empty">
                          <ImageIcon size={18} />
                        </div>
                      )}

                      <label className="image-picker-btn">
                        {displayedIcon ? "Change" : "Choose"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconSelect}
                          hidden
                        />
                      </label>

                      {displayedIcon && (
                        <button
                          type="button"
                          className="image-picker-clear"
                          onClick={handleRemoveIcon}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-group form-group-full">
                    <label>Category Image</label>
                    <div className="image-picker">
                      {displayedImage ? (
                        <img
                          src={displayedImage}
                          alt="Category preview"
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

                <div className="checkbox-grid">
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
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}