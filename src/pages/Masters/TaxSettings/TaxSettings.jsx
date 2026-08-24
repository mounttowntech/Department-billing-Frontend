import React, { useEffect, useState } from "react";
import "./TaxSettings.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Percent,
  ShieldCheck,
  ShieldOff,
  Star,
} from "lucide-react";

import {
  getTaxSettings,
  createTaxSetting,
  updateTaxSetting,
  deleteTaxSetting,
} from "../../../services/taxSettingService";

const emptyTax = {
  taxCode: "",

  taxName: "",

  taxType: "GST",

  hsnSacCode: "",

  cgst: 0,

  sgst: 0,

  igst: 0,

  cess: 0,

  vat: 0,

  taxCalculationType: "Exclusive",

  isDefaultTax: false,

  applicableFor: [],

  description: "",

  status: "active",
};

export default function TaxSettings() {
  const [taxes, setTaxes] = useState([]);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [taxTypeFilter, setTaxTypeFilter] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptyTax);

  const fetchTaxes = async () => {
    try {
      setLoading(true);

      const res = await getTaxSettings({
        search: search || undefined,

        status: statusFilter || undefined,

        taxType: taxTypeFilter || undefined,
      });

      if (res.success) {
        setTaxes(res.data || []);
      }
    } catch (error) {
      console.log(error);

      setTaxes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTaxes();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, statusFilter, taxTypeFilter]);

  const openAdd = () => {
    setEditingId(null);

    setFormData({ ...emptyTax });

    setShowModal(true);
  };

  const openEdit = (tax) => {
    setEditingId(tax._id);

    setFormData({
      taxCode: tax.taxCode || "",

      taxName: tax.taxName || "",

      taxType: tax.taxType || "GST",

      hsnSacCode: tax.hsnSacCode || "",

      cgst: tax.cgst || 0,

      sgst: tax.sgst || 0,

      igst: tax.igst || 0,

      cess: tax.cess || 0,

      vat: tax.vat || 0,

      taxCalculationType: tax.taxCalculationType || "Exclusive",

      isDefaultTax: tax.isDefaultTax || false,

      applicableFor: tax.applicableFor || [],

      description: tax.description || "",

      status: tax.status || "active",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);

    setEditingId(null);

    setFormData({ ...emptyTax });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (editingId) {
        await updateTaxSetting(editingId, formData);
      } else {
        await createTaxSetting(formData);
      }

      closeModal();

      fetchTaxes();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Unable to save tax");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tax?")) return;

    try {
      await deleteTaxSetting(id);

      fetchTaxes();
    } catch (error) {
      console.log(error);
    }
  };

  const updateField = (key, value) => {
    setFormData({
      ...formData,

      [key]: value,
    });
  };

  const toggleApplicable = (item) => {
    let arr = [...formData.applicableFor];

    if (arr.includes(item)) {
      arr = arr.filter((x) => x !== item);
    } else {
      arr.push(item);
    }

    updateField("applicableFor", arr);
  };

  return (
    <div className="tax-page">
      <div className="tax-content">
        <div className="page-header">
          <div>
            <h2>Tax Settings</h2>

            <p>Manage GST, VAT and other tax configurations.</p>
          </div>

          <button className="primary-btn" onClick={openAdd}>
            <Plus size={18} />
            Add Tax
          </button>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              placeholder="Search tax code or name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={taxTypeFilter}
            onChange={(e) => setTaxTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>

            <option value="GST">GST</option>

            <option value="IGST">IGST</option>

            <option value="VAT">VAT</option>

            <option value="CGST_SGST">CGST + SGST</option>

            <option value="CESS">CESS</option>

            <option value="CUSTOM">CUSTOM</option>
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

        <div className="tax-summary-grid">
          <div className="tax-summary-card card-blue">
            <div className="tax-summary-icon">
              <Percent size={24} />
            </div>

            <h2>{taxes.length}</h2>

            <p>Total Taxes</p>
          </div>

          <div className="tax-summary-card card-green">
            <div className="tax-summary-icon">
              <ShieldCheck size={24} />
            </div>

            <h2>{taxes.filter((x) => x.status === "active").length}</h2>

            <p>Active</p>
          </div>

          <div className="tax-summary-card card-red">
            <div className="tax-summary-icon">
              <ShieldOff size={24} />
            </div>

            <h2>{taxes.filter((x) => x.status === "inactive").length}</h2>

            <p>Inactive</p>
          </div>

          <div className="tax-summary-card card-purple">
            <div className="tax-summary-icon">
              <Star size={24} />
            </div>

            <h2>{taxes.filter((x) => x.isDefaultTax).length}</h2>

            <p>Default Tax</p>
          </div>
        </div>

        <div className="table-card">
          <table className="tax-table">
            <thead>
              <tr>
                <th>Code</th>

                <th>Name</th>

                <th>Type</th>

                <th>Tax %</th>

                <th>HSN/SAC</th>

                <th>Status</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading...</td>
                </tr>
              ) : taxes.length === 0 ? (
                <tr>
                  <td colSpan="7">No Tax Found</td>
                </tr>
              ) : (
                taxes.map((tax) => (
                  <tr key={tax._id}>
                    <td>{tax.taxCode}</td>

                    <td>{tax.taxName}</td>

                    <td>{tax.taxType}</td>

                    <td>{tax.totalTax}%</td>

                    <td>{tax.hsnSacCode}</td>

                    <td>{tax.status}</td>

                    <td className="icons">
                      <button
                        className="edit-btn"
                        onClick={() => openEdit(tax)}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(tax._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="tax-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Tax Setting" : "Add Tax Setting"}</h3>

                <button className="close-btn" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tax Code *</label>

                    <input
                      value={formData.taxCode}
                      onChange={(e) => updateField("taxCode", e.target.value)}
                      placeholder="GST18"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tax Name *</label>

                    <input
                      value={formData.taxName}
                      onChange={(e) => updateField("taxName", e.target.value)}
                      placeholder="GST 18%"
                    />
                  </div>

                  <div className="form-group">
                    <label>HSN / SAC Code *</label>

                    <input
                      value={formData.hsnSacCode}
                      onChange={(e) =>
                        updateField("hsnSacCode", e.target.value)
                      }
                      placeholder="9983"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tax Type</label>

                    <select
                      value={formData.taxType}
                      onChange={(e) => {
                        const type = e.target.value;

                        setFormData({
                          ...formData,

                          taxType: type,

                          cgst: 0,

                          sgst: 0,

                          igst: 0,

                          vat: 0,

                          cess: 0,
                        });
                      }}
                    >
                      <option value="GST">GST</option>

                      <option value="IGST">IGST</option>

                      <option value="VAT">VAT</option>

                      <option value="CGST_SGST">CGST + SGST</option>

                      <option value="CESS">CESS</option>

                      <option value="CUSTOM">CUSTOM</option>
                    </select>
                  </div>
                </div>

                <div className="tax-values">
                  {(formData.taxType === "GST" ||
                    formData.taxType === "CGST_SGST") && (
                    <div className="form-grid">
                      <div className="form-group">
                        <label>CGST %</label>

                        <input
                          type="number"
                          value={formData.cgst}
                          onChange={(e) =>
                            updateField("cgst", Number(e.target.value))
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>SGST %</label>

                        <input
                          type="number"
                          value={formData.sgst}
                          onChange={(e) =>
                            updateField("sgst", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  )}

                  {formData.taxType === "IGST" && (
                    <div className="form-group">
                      <label>IGST %</label>

                      <input
                        type="number"
                        value={formData.igst}
                        onChange={(e) =>
                          updateField("igst", Number(e.target.value))
                        }
                      />
                    </div>
                  )}

                  {formData.taxType === "VAT" && (
                    <div className="form-group">
                      <label>VAT %</label>

                      <input
                        type="number"
                        value={formData.vat}
                        onChange={(e) =>
                          updateField("vat", Number(e.target.value))
                        }
                      />
                    </div>
                  )}

                  {formData.taxType === "CESS" && (
                    <div className="form-group">
                      <label>CESS %</label>

                      <input
                        type="number"
                        value={formData.cess}
                        onChange={(e) =>
                          updateField("cess", Number(e.target.value))
                        }
                      />
                    </div>
                  )}

                  {formData.taxType === "CUSTOM" && (
                    <div className="form-group">
                      <label>Custom Tax %</label>

                      <input
                        type="number"
                        value={formData.vat}
                        onChange={(e) =>
                          updateField("vat", Number(e.target.value))
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Calculation Type</label>

                    <select
                      value={formData.taxCalculationType}
                      onChange={(e) =>
                        updateField("taxCalculationType", e.target.value)
                      }
                    >
                      <option value="Exclusive">Exclusive</option>

                      <option value="Inclusive">Inclusive</option>
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
                </div>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={formData.isDefaultTax}
                    onChange={(e) =>
                      updateField("isDefaultTax", e.target.checked)
                    }
                  />
                  Default Tax
                </label>

                <h4>Applicable For</h4>

                <div className="applicable-grid">
                  {["Purchase", "Sales", "Service", "Expense"].map((item) => (
                    <label key={item} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={formData.applicableFor.includes(item)}
                        onChange={() => toggleApplicable(item)}
                      />

                      {item}
                    </label>
                  ))}
                </div>

                <div className="form-group">
                  <label>Description</label>

                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
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
                      ? "Update Tax"
                      : "Create Tax"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
