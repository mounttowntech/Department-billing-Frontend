import React, { useEffect, useMemo, useState } from "react";
import "./Units.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Ruler,
  ShieldCheck,
  ShieldOff,
  Star,
} from "lucide-react";

import {
  getUnits,
  createUnit,
  updateUnit,
  activateUnit,
  deactivateUnit,
  permanentDeleteUnit,
} from "../../../services/unitService";

import { getStores } from "../../../services/storeService";

const APPLICABLE_OPTIONS = ["Product", "Purchase", "Sales", "Inventory"];

const emptyUnit = {
  store: "",
  unitCode: "",
  unitName: "",
  shortName: "",
  isBaseUnit: false,
  allowDecimal: false,
  conversionFactor: 1,
  applicableFor: [],
  displayOrder: 1,
  status: "active",
};

export default function Unit() {
  const [units, setUnits] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyUnit);

  const fetchUnits = async () => {
    try {
      setLoading(true);

      const res = await getUnits({
        search: search || undefined,
        status: statusFilter || undefined,
        store: storeFilter || undefined,
      });

      if (res.success) {
        setUnits(res.data || []);
      } else {
        setUnits([]);
      }
    } catch (err) {
      console.log(err);
      setUnits([]);
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
      fetchUnits();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, statusFilter, storeFilter]);

  const filteredUnits = useMemo(() => units, [units]);

  const totalUnits = units.length;
  const activeUnits = units.filter((x) => x.status === "active").length;
  const inactiveUnits = units.filter((x) => x.status === "inactive").length;
  const baseUnits = units.filter((x) => x.isBaseUnit).length;

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyUnit);
    setShowModal(true);
  };

  const openEditModal = (unit) => {
    setEditingId(unit._id);
    setFormData({
      store: unit.store?._id || unit.store || "",
      unitCode: unit.unitCode || "",
      unitName: unit.unitName || "",
      shortName: unit.shortName || "",
      isBaseUnit: !!unit.isBaseUnit,
      allowDecimal: !!unit.allowDecimal,
      conversionFactor: unit.conversionFactor ?? 1,
      applicableFor: unit.applicableFor || [],
      displayOrder: unit.displayOrder ?? 1,
      status: unit.status || "active",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyUnit);
  };

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleBaseUnitToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      isBaseUnit: checked,
      conversionFactor: checked ? 1 : prev.conversionFactor,
    }));
  };

  const toggleApplicable = (item) => {
    setFormData((prev) => {
      const has = prev.applicableFor.includes(item);
      return {
        ...prev,
        applicableFor: has
          ? prev.applicableFor.filter((x) => x !== item)
          : [...prev.applicableFor, item],
      };
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.store ||
      !formData.unitCode ||
      !formData.unitName ||
      !formData.shortName
    ) {
      alert("Store, Unit Code, Unit Name and Short Name are required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        unitCode: formData.unitCode.toUpperCase(),
        shortName: formData.shortName.toUpperCase(),
      };

      if (editingId) {
        await updateUnit(editingId, payload);
      } else {
        await createUnit(payload);
      }

      closeModal();
      fetchUnits();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to save Unit.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (unit) => {
    try {
      if (unit.status === "active") {
        await deactivateUnit(unit._id);
      } else {
        await activateUnit(unit._id);
      }
      fetchUnits();
    } catch (err) {
      console.log(err);
      alert("Unable to update unit status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this unit? This cannot be undone."))
      return;

    try {
      await permanentDeleteUnit(id);
      fetchUnits();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to delete unit.");
    }
  };

  return (
    <div className="unit-page">
      <div className="unit-content">
        <div className="page-header">
          <div>
            <h2>Units</h2>
            <p>Manage measurement units and conversion factors.</p>
          </div>

          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={18} />
            Add Unit
          </button>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search unit code or name..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="units-summary-grid">
          <div className="units-summary-card card-blue">
            <div className="units-summary-icon">
              <Ruler size={24} />
            </div>
            <h2>{totalUnits}</h2>
            <p>Total Units</p>
          </div>

          <div className="units-summary-card card-green">
            <div className="units-summary-icon">
              <ShieldCheck size={24} />
            </div>
            <h2>{activeUnits}</h2>
            <p>Active</p>
          </div>

          <div className="units-summary-card card-red">
            <div className="units-summary-icon">
              <ShieldOff size={24} />
            </div>
            <h2>{inactiveUnits}</h2>
            <p>Inactive</p>
          </div>

          <div className="units-summary-card card-purple">
            <div className="units-summary-icon">
              <Star size={24} />
            </div>
            <h2>{baseUnits}</h2>
            <p>Base Units</p>
          </div>
        </div>

        <div className="table-card">
          <table className="unit-table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Short Name</th>
                <th>Store</th>
                <th>Conversion</th>
                <th>Type</th>
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
              ) : filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    No Units Found
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit) => (
                  <tr key={unit._id}>
                    <td>
                      <div className="unit-info">
                        <div className="unit-avatar">
                          <Ruler size={18} />
                        </div>
                        <div>
                          <strong>{unit.unitName}</strong>
                          <p>{unit.unitCode}</p>
                        </div>
                      </div>
                    </td>

                    <td>{unit.shortName}</td>
                    <td>{unit.store?.storeName || "—"}</td>

                    <td>
                      {unit.isBaseUnit
                        ? "1 (Base)"
                        : `1 : ${unit.conversionFactor}`}
                    </td>

                    <td>
                      {unit.isBaseUnit ? (
                        <span className="badge system">Base</span>
                      ) : (
                        <span className="badge custom">Derived</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          unit.status === "active"
                            ? "badge active"
                            : "badge inactive"
                        }
                      >
                        {unit.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          title="Edit"
                          onClick={() => openEditModal(unit)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className={
                            unit.status === "active"
                              ? "deactivate-btn"
                              : "activate-btn"
                          }
                          title={
                            unit.status === "active" ? "Deactivate" : "Activate"
                          }
                          onClick={() => handleToggleStatus(unit)}
                        >
                          {unit.status === "active" ? (
                            <ShieldOff size={16} />
                          ) : (
                            <ShieldCheck size={16} />
                          )}
                        </button>

                        <button
                          className="delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(unit._id)}
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
            <div className="unit-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Unit" : "Add Unit"}</h3>
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
                    <label>Unit Code *</label>
                    <input
                      placeholder="e.g. PCS"
                      value={formData.unitCode}
                      onChange={(e) => updateField("unitCode", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit Name *</label>
                    <input
                      placeholder="e.g. Pieces"
                      value={formData.unitName}
                      onChange={(e) => updateField("unitName", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Short Name *</label>
                    <input
                      placeholder="e.g. PC"
                      value={formData.shortName}
                      onChange={(e) => updateField("shortName", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Display Order</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        updateField("displayOrder", Number(e.target.value))
                      }
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

                <h4 className="section-title">Conversion</h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Conversion Factor</label>
                    <input
                      type="number"
                      min="1"
                      disabled={formData.isBaseUnit}
                      value={formData.conversionFactor}
                      onChange={(e) =>
                        updateField("conversionFactor", Number(e.target.value))
                      }
                    />
                    {formData.isBaseUnit && (
                      <span className="field-hint">
                        Base units always convert 1 : 1
                      </span>
                    )}
                  </div>
                </div>

                <div className="checkbox-grid">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isBaseUnit}
                      onChange={(e) => handleBaseUnitToggle(e.target.checked)}
                    />
                    Base Unit
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.allowDecimal}
                      onChange={(e) =>
                        updateField("allowDecimal", e.target.checked)
                      }
                    />
                    Allow Decimal Quantity
                  </label>
                </div>

                <h4 className="section-title">Applicable For</h4>

                <div className="applicable-grid">
                  {APPLICABLE_OPTIONS.map((item) => (
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
                      ? "Update Unit"
                      : "Create Unit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
