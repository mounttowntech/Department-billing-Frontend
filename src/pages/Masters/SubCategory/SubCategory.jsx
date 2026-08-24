import React, { useEffect, useMemo, useState } from "react";
import "./SubCategory.css";

import {
  Search,
  Plus,
  Edit,
  Save,
  Trash2,
  X,
  Tag,
  ShieldCheck,
  ShieldOff,
  Image as ImageIcon,
} from "lucide-react";

import {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  activateSubCategory,
  deactivateSubCategory,
  deleteSubCategory,
  resolveImageUrl,
} from "../../../services/subcategoryService";

import { getCategories } from "../../../services/categoryService";
import { getStores } from "../../../services/storeService";
import { getTaxSettings } from "../../../services/taxSettingService";

const emptySubCategory = {
  store: "",
  category: "",
  subCategoryCode: "",
  subCategoryName: "",
  displayName: "",
  description: "",
  taxSetting: "",
  shelfLifeDays: 0,
  displayOrder: 1,
  requiresBatch: false,
  requiresExpiry: false,
  allowDiscount: true,
  allowReturn: true,
  status: "active",
};

export default function SubCategory() {
  const [subCategories, setSubCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptySubCategory);


  const [formCategories, setFormCategories] = useState([]);

  const [existingImageURL, setExistingImageURL] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [existingIcon, setExistingIcon] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");

  const fetchSubCategories = async () => {
    try {
      setLoading(true);

      const res = await getSubCategories({
        search: search || undefined,
        status: statusFilter || undefined,
        store: storeFilter || undefined,
        category: categoryFilter || undefined,
      });

      if (res.success) {
        setSubCategories(res.data || []);
      } else {
        setSubCategories([]);
      }
    } catch (err) {
      console.log(err);
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await getStores();
      if (res.success) setStores(res.data || []);
    } catch (err) {
      console.log(err);
      setStores([]);
    }
  };


  const fetchCategories = async (storeId) => {
    try {
      const res = await getCategories({
        store: storeId || undefined,
        status: "active",
      });
      if (res.success) setCategories(res.data || []);
    } catch (err) {
      console.log(err);
      setCategories([]);
    }
  };

  const fetchTaxes = async () => {
    try {
      const res = await getTaxSettings({ status: "active" });
      if (res.success) setTaxes(res.data || []);
    } catch (err) {
      console.log(err);
      setTaxes([]);
    }
  };

 
  const fetchFormCategories = async (storeId) => {
    if (!storeId) {
      setFormCategories([]);
      return;
    }
    try {
      const res = await getCategories({ store: storeId, status: "active" });
      if (res.success) setFormCategories(res.data || []);
    } catch (err) {
      console.log(err);
      setFormCategories([]);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchTaxes();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCategories(storeFilter);

    setCategoryFilter("");
  
  }, [storeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubCategories();
    }, 300);

    return () => clearTimeout(timer);

  }, [search, statusFilter, storeFilter, categoryFilter]);

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

  const filteredSubCategories = useMemo(() => subCategories, [subCategories]);

  const totalSubCategories = subCategories.length;
  const activeSubCategories = subCategories.filter(
    (x) => x.status === "active"
  ).length;
  const inactiveSubCategories = subCategories.filter(
    (x) => x.status === "inactive"
  ).length;

  const updateFieldValue = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    if (key === "store") {
   
      setFormData((prev) => ({ ...prev, category: "" }));
      fetchFormCategories(value);
    }
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
    setFormData(emptySubCategory);
    setFormCategories([]);
    resetImageState();
    setShowModal(true);
  };

  const openEditModal = (subCategory) => {
    const storeId = subCategory.store?._id || subCategory.store || "";

    setEditingId(subCategory._id);
    setFormData({
      store: storeId,
      category: subCategory.category?._id || subCategory.category || "",
      subCategoryCode: subCategory.subCategoryCode || "",
      subCategoryName: subCategory.subCategoryName || "",
      displayName: subCategory.displayName || "",
      description: subCategory.description || "",
      taxSetting: subCategory.taxSetting?._id || subCategory.taxSetting || "",
      shelfLifeDays: subCategory.shelfLifeDays ?? 0,
      displayOrder: subCategory.displayOrder ?? 1,
      requiresBatch: !!subCategory.requiresBatch,
      requiresExpiry: !!subCategory.requiresExpiry,
      allowDiscount: subCategory.allowDiscount !== false,
      allowReturn: subCategory.allowReturn !== false,
      status: subCategory.status || "active",
    });

    fetchFormCategories(storeId);

    setExistingImageURL(subCategory.image || "");
    setImageFile(null);
    setImagePreview("");
    setExistingIcon(subCategory.icon || "");
    setIconFile(null);
    setIconPreview("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptySubCategory);
    setFormCategories([]);
    resetImageState();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    if(imagePreview){
URL.revokeObjectURL(imagePreview);
}
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
    if (
      !formData.store ||
      !formData.category ||
      !formData.subCategoryCode ||
      !formData.subCategoryName
    ) {
      alert("Store, Category, Sub Category Code and Name are required.");
      return;
    }

    try {
      setSaving(true);

      const fields = {
        ...formData,
        taxSetting: formData.taxSetting || "",
      };

      if (editingId) {
        fields.existingImage = existingImageURL || "";
        fields.existingIcon = existingIcon || "";
        await updateSubCategory(editingId, fields, imageFile, iconFile);
      } else {
        await createSubCategory(fields, imageFile, iconFile);
      }

     closeModal();

setImageFile(null);
setIconFile(null);
setExistingImageURL("");
setExistingIcon("");
      fetchSubCategories();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to save Sub Category.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (subCategory) => {
    try {
      if (subCategory.status === "active") {
        await deactivateSubCategory(subCategory._id);
      } else {
        await activateSubCategory(subCategory._id);
      }
      fetchSubCategories();
    } catch (err) {
      console.log(err);
      alert("Unable to update sub category status.");
    }
  };
const handleDelete = async (id) => {
  const ok = window.confirm(
    "Delete this Sub Category?"
  );

  if (!ok) return;

  try {
    await deleteSubCategory(id);

    fetchSubCategories();

    alert("Deleted Successfully");
  } catch (err) {
    console.log(err);

    alert(
      err.response?.data?.message ||
      "Delete Failed"
    );
  }
};
  return (
    <div className="subcategory-page">
      <div className="subcategory-content">
     

        <div className="page-header">
          <div>
            <h2>Sub Categories</h2>
            <p>Manage sub categories within each department category.</p>
          </div>

          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={18} />
            Add Sub Category
          </button>
        </div>

    
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search sub category code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
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
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.categoryName}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

     

        <div className="subcategory-summary-grid">
          <div className="subcategory-summary-card card-blue">
            <div className="subcategory-summary-icon">
              <Tag size={24} />
            </div>
            <h2>{totalSubCategories}</h2>
            <p>Total Sub Categories</p>
          </div>

          <div className="subcategory-summary-card card-green">
            <div className="subcategory-summary-icon">
              <ShieldCheck size={24} />
            </div>
            <h2>{activeSubCategories}</h2>
            <p>Active</p>
          </div>

          <div className="subcategory-summary-card card-red">
            <div className="subcategory-summary-icon">
              <ShieldOff size={24} />
            </div>
            <h2>{inactiveSubCategories}</h2>
            <p>Inactive</p>
          </div>
        </div>

   
        <div className="table-card">
          <table className="subcategory-table">
            <thead>
              <tr>
                <th>Sub Category</th>
                <th>Store</th>
                <th>Category</th>
                <th>Tax</th>
                <th>Shelf Life</th>
                <th>Status</th>
                <th width="120">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    <div className="loading-row">
Loading Sub Categories...
</div>
                  </td>
                </tr>
              ) : filteredSubCategories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    No Sub Categories Found
                  </td>
                </tr>
              ) : (
                filteredSubCategories.map((subCategory) => (
                  <tr key={subCategory._id}>
                    <td>
                      <div className="subcategory-info">
                        <div className="subcategory-avatar">
                          {subCategory.image ? (
                            <img
    src={resolveImageUrl(subCategory.image)}
    onError={(e)=>{
        e.target.src="/no-image.png";
    }}
                              alt={subCategory.subCategoryName}
                            />
                          ) : (
                            <Tag size={18} />
                          )}
                        </div>
                        <div>
                          <strong>
                            {subCategory.displayName ||
                              subCategory.subCategoryName}
                          </strong>
                          <p>{subCategory.subCategoryCode}</p>
                        </div>
                      </div>
                    </td>

                    <td>{subCategory.store?.storeName || "—"}</td>

                    <td>{subCategory.category?.categoryName || "—"}</td>

                    <td>{subCategory.taxSetting?.taxName || "—"}</td>

                    <td>
                      {subCategory.shelfLifeDays
                        ? `${subCategory.shelfLifeDays} days`
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={
                          subCategory.status === "active"
                            ? "badge active"
                            : "badge inactive"
                        }
                      >
                        {subCategory.status}
                      </span>
                    </td>

                    <td>
                     <div className="action-btns">

  <button
    className="edit-btn"
    onClick={() => openEditModal(subCategory)}
  >
    <Edit size={16}/>
  </button>

  {subCategory.status === "active" ? (

    <button
      className="deactivate-btn"
      onClick={() =>
        handleToggleStatus(subCategory)
      }
    >
      <ShieldOff size={16}/>
    </button>

  ) : (

    <button
      className="activate-btn"
      onClick={() =>
        handleToggleStatus(subCategory)
      }
    >
      <ShieldCheck size={16}/>
    </button>

  )}

  <button
    className="delete-btn"
    onClick={() =>
      handleDelete(subCategory._id)
    }
  >
    <Trash2 size={16}/>
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
            <div className="subcategory-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Sub Category" : "Add Sub Category"}</h3>
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
                      onChange={(e) =>
                        updateFieldValue("store", e.target.value)
                      }
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
                    <label>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        updateFieldValue("category", e.target.value)
                      }
                      disabled={!formData.store}
                    >
                      <option value="">
                        {formData.store ? "Select Category" : "Select Store First"}
                      </option>
                      {formCategories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Sub Category Code *</label>
                    <input
                      placeholder="e.g. GROCERY-SNACKS"
                      value={formData.subCategoryCode}
                      onChange={(e) =>
                        updateFieldValue("subCategoryCode", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Sub Category Name *</label>
                    <input
                      placeholder="e.g. Snacks"
                      value={formData.subCategoryName}
                      onChange={(e) =>
                        updateFieldValue("subCategoryName", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      placeholder="Defaults to Sub Category Name"
                      value={formData.displayName}
                      onChange={(e) =>
                        updateFieldValue("displayName", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Tax Setting</label>
                    <select
                      value={formData.taxSetting}
                      onChange={(e) =>
                        updateFieldValue("taxSetting", e.target.value)
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
                    <label>Shelf Life (days)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.shelfLifeDays}
                      onChange={(e) =>
                        updateFieldValue(
                          "shelfLifeDays",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Display Order</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        updateFieldValue(
                          "displayOrder",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        updateFieldValue("status", e.target.value)
                      }
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
                    <label>Sub Category Image</label>
                    <div className="image-picker">
                      {displayedImage ? (
                        <img
                          src={displayedImage}
                          alt="Sub category preview"
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
                        updateFieldValue("description", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="checkbox-grid">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.requiresBatch}
                      onChange={(e) =>
                        updateFieldValue("requiresBatch", e.target.checked)
                      }
                    />
                    Requires Batch
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.requiresExpiry}
                      onChange={(e) =>
                        updateFieldValue("requiresExpiry", e.target.checked)
                      }
                    />
                    Requires Expiry
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.allowDiscount}
                      onChange={(e) =>
                        updateFieldValue("allowDiscount", e.target.checked)
                      }
                    />
                    Allow Discount
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.allowReturn}
                      onChange={(e) =>
                        updateFieldValue("allowReturn", e.target.checked)
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
type="button"
className="save-btn"
onClick={handleSubmit}
disabled={saving}
>
                 {saving
? "Please Wait..."
: editingId
? "Update"
: "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}