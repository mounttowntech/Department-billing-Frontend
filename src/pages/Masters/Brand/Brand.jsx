import React, { useEffect, useMemo, useState } from "react";
import "./Brand.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Tag,
  ShieldCheck,
  ShieldOff,
  Star,
  Image as ImageIcon,
} from "lucide-react";

import {
  getBrands,
  createBrand,
  updateBrand,
  toggleBrand,
  deleteBrand,
  resolveImageUrl,
} from "../../../services/brandService";

import { getStores } from "../../../services/storeService";

const INDUSTRY_TYPES = [
  { value: "department_store", label: "Department Store" },
  { value: "garments", label: "Garments" },
  { value: "restaurant", label: "Restaurant" },
  { value: "general", label: "General" },
];

const emptyBrand = {
  store: "",
  brandCode: "",
  brandName: "",
  displayName: "",
  companyName: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  country: "India",
  description: "",
  industryType: "department_store",
  displayOrder: 1,
  isFeatured: false,
  showOnPOS: true,
  status: "active",
};

export default function Brand() {
  const [brands, setBrands] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyBrand);

  const [existingLogo, setExistingLogo] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const fetchBrands = async () => {
    try {
      setLoading(true);

      const res = await getBrands({
        search: search || undefined,
        status: statusFilter || undefined,
        store: storeFilter || undefined,
        industryType: typeFilter || undefined,
      });

      if (res.success) {
        setBrands(res.data || []);
      } else {
        setBrands([]);
      }
    } catch (err) {
      console.log(err);
      setBrands([]);
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

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBrands();
    }, 300);

    return () => clearTimeout(timer);
   
  }, [search, statusFilter, storeFilter, typeFilter]);

  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const filteredBrands = useMemo(() => brands, [brands]);

  const totalBrands = brands.length;
  const activeBrands = brands.filter((x) => x.status === "active").length;
  const inactiveBrands = brands.filter((x) => x.status === "inactive").length;
  const featuredBrands = brands.filter((x) => x.isFeatured).length;

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetLogoState = () => {
    setExistingLogo("");
    setLogoFile(null);
    setLogoPreview("");
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyBrand);
    resetLogoState();
    setShowModal(true);
  };

  const openEditModal = (brand) => {
    setEditingId(brand._id);
    setFormData({
      store: brand.store?._id || brand.store || "",
      brandCode: brand.brandCode || "",
      brandName: brand.brandName || "",
      displayName: brand.displayName || "",
      companyName: brand.companyName || "",
      website: brand.website || "",
      email: brand.email || "",
      phone: brand.phone || "",
      address: brand.address || "",
      country: brand.country || "India",
      description: brand.description || "",
      industryType: brand.industryType || "department_store",
      displayOrder: brand.displayOrder ?? 1,
      isFeatured: Boolean(brand.isFeatured),
      showOnPOS: brand.showOnPOS !== false,
      status: brand.status || "active",
    });

    setExistingLogo(brand.logo || "");
    setLogoFile(null);
    setLogoPreview("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyBrand);
    resetLogoState();
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    setExistingLogo("");
  };

  const displayedLogo = logoPreview || resolveImageUrl(existingLogo);

  const handleSubmit = async () => {
    if (!formData.store || !formData.brandCode || !formData.brandName) {
      alert("Store, Brand Code and Brand Name are required.");
      return;
    }

    try {
      setSaving(true);

      const fields = { ...formData };

      if (editingId) {
      
        fields.existingLogo = existingLogo || "";
        await updateBrand(editingId, fields, logoFile);
      } else {
        await createBrand(fields, logoFile);
      }

      closeModal();
      fetchBrands();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to save Brand.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleBrand(id);
      fetchBrands();
    } catch (err) {
      console.log(err);
      alert("Unable to update brand status.");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Permanently delete this brand? This cannot be undone.")
    )
      return;

    try {
      await deleteBrand(id);
      fetchBrands();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to delete brand.");
    }
  };

  return (
    <div className="brand-page">
      <div className="brand-content">
      
        <div className="page-header">
          <div>
            <h2>Brands</h2>
            <p>Manage the brands you stock in your store.</p>
          </div>

          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={18} />
            Add Brand
          </button>
        </div>

    

        <div className="brand-toolbar">
          <div className="brand-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search brand code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="brand-filter-select"
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
            className="brand-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Industry Types</option>
            {INDUSTRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            className="brand-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

      

        <div className="brand-summary-grid">
          <div className="brand-summary-card card-blue">
            <div className="brand-summary-icon">
              <Tag size={24} />
            </div>
            <h2>{totalBrands}</h2>
            <p>Total Brands</p>
          </div>

          <div className="brand-summary-card card-green">
            <div className="brand-summary-icon">
              <ShieldCheck size={24} />
            </div>
            <h2>{activeBrands}</h2>
            <p>Active</p>
          </div>

          <div className="brand-summary-card card-red">
            <div className="brand-summary-icon">
              <ShieldOff size={24} />
            </div>
            <h2>{inactiveBrands}</h2>
            <p>Inactive</p>
          </div>

          <div className="brand-summary-card card-purple">
            <div className="brand-summary-icon">
              <Star size={24} />
            </div>
            <h2>{featuredBrands}</h2>
            <p>Featured</p>
          </div>
        </div>

   

        <div className="table-card">
          <table className="brand-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Store</th>
                <th>Industry Type</th>
                <th>Company</th>
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
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    No Brands Found
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand._id}>
                    <td>
                      <div className="brand-info">
                        <div className="brand-avatar">
                          {brand.logo ? (
                            <img
                              src={resolveImageUrl(brand.logo)}
                              alt={brand.brandName}
                            />
                          ) : (
                            <Tag size={18} />
                          )}
                        </div>
                        <div>
                          <strong>
                            {brand.displayName || brand.brandName}
                            {brand.isFeatured && (
                              <Star size={13} className="featured-star" />
                            )}
                          </strong>
                          <p>{brand.brandCode}</p>
                        </div>
                      </div>
                    </td>

                    <td>{brand.store?.storeName || "—"}</td>

                    <td>
                      {INDUSTRY_TYPES.find(
                        (t) => t.value === brand.industryType
                      )?.label || brand.industryType}
                    </td>

                    <td>{brand.companyName || "—"}</td>

                    <td>
                      <span
                        className={
                          brand.status === "active"
                            ? "badge active"
                            : "badge inactive"
                        }
                      >
                        {brand.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          title="Edit"
                          onClick={() => openEditModal(brand)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className={
                            brand.status === "active"
                              ? "deactivate-btn"
                              : "activate-btn"
                          }
                          title={
                            brand.status === "active"
                              ? "Deactivate"
                              : "Activate"
                          }
                          onClick={() => handleToggleStatus(brand._id)}
                        >
                          {brand.status === "active" ? (
                            <ShieldOff size={16} />
                          ) : (
                            <ShieldCheck size={16} />
                          )}
                        </button>

                        <button
                          className="delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(brand._id)}
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
            <div className="brand-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Brand" : "Add Brand"}</h3>
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
                    <label>Brand Code *</label>
                    <input
                      placeholder="e.g. NIKE"
                      value={formData.brandCode}
                      onChange={(e) =>
                        updateField("brandCode", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Brand Name *</label>
                    <input
                      placeholder="e.g. Nike"
                      value={formData.brandName}
                      onChange={(e) =>
                        updateField("brandName", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      placeholder="Defaults to Brand Name"
                      value={formData.displayName}
                      onChange={(e) =>
                        updateField("displayName", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      placeholder="Legal / parent company"
                      value={formData.companyName}
                      onChange={(e) =>
                        updateField("companyName", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Industry Type</label>
                    <select
                      value={formData.industryType}
                      onChange={(e) =>
                        updateField("industryType", e.target.value)
                      }
                    >
                      {INDUSTRY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
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
                    <label>Display Order</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        updateField("displayOrder", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Website</label>
                    <input
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) =>
                        updateField("website", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      value={formData.country}
                      onChange={(e) => updateField("country", e.target.value)}
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label>Logo</label>
                    <div className="image-picker">
                      {displayedLogo ? (
                        <img
                          src={displayedLogo}
                          alt="Logo preview"
                          className="image-preview"
                        />
                      ) : (
                        <div className="image-preview image-preview-empty">
                          <ImageIcon size={22} />
                        </div>
                      )}

                      <label className="image-picker-btn">
                        {displayedLogo ? "Change Logo" : "Choose Logo"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoSelect}
                          hidden
                        />
                      </label>

                      {displayedLogo && (
                        <button
                          type="button"
                          className="image-picker-clear"
                          onClick={handleRemoveLogo}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-group form-group-full">
                    <label>Address</label>
                    <input
                      value={formData.address}
                      onChange={(e) =>
                        updateField("address", e.target.value)
                      }
                    />
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
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        updateField("isFeatured", e.target.checked)
                      }
                    />
                    Featured Brand
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.showOnPOS}
                      onChange={(e) =>
                        updateField("showOnPOS", e.target.checked)
                      }
                    />
                    Show on POS
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
                    ? "Update Brand"
                    : "Create Brand"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}