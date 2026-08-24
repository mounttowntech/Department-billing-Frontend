import React, { useEffect, useMemo, useState } from "react";
import "./Shelf.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  LayoutList,
  ShieldCheck,
  ShieldOff,
  Wrench,
} from "lucide-react";

import {
  getShelves,
  createShelf,
  updateShelf,
  toggleShelf,
  deleteShelf,
} from "../../../services/shelfService";

import { getStores } from "../../../services/storeService";
import { getWarehouses } from "../../../services/warehouseService";

const STORAGE_TYPES = ["Normal", "Cold", "Frozen", "Dry Storage"];

const emptyShelf = {
  store: "",
  warehouse: "",
  shelfCode: "",
  shelfName: "",
  rackNumber: "",
  floorNumber: 1,
  section: "",
  storageType: "Normal",
  maximumCapacity: 0,
  currentCapacity: 0,
  remarks: "",
  status: "active",
};

export default function Shelf() {
  const [shelves, setShelves] = useState([]);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyShelf);

  const fetchShelves = async () => {
    try {
      setLoading(true);

      const res = await getShelves({
        search: search || undefined,
        status: statusFilter || undefined,
        store: storeFilter || undefined,
        warehouse: warehouseFilter || undefined,
        storageType: typeFilter || undefined,
      });

      if (res.success) {
        setShelves(res.data || []);
      } else {
        setShelves([]);
      }
    } catch (err) {
      console.log(err);
      setShelves([]);
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

  const fetchWarehouses = async () => {
    try {
      const res = await getWarehouses();
      if (res.success) setWarehouses(res.data || []);
    } catch (err) {
      console.log(err);
      setWarehouses([]);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShelves();
    }, 300);

    return () => clearTimeout(timer);

  }, [search, statusFilter, storeFilter, warehouseFilter, typeFilter]);

  const filteredShelves = useMemo(() => shelves, [shelves]);

  const totalShelves = shelves.length;
  const activeShelves = shelves.filter((x) => x.status === "active").length;
  const inactiveShelves = shelves.filter((x) => x.status === "inactive").length;
  const maintenanceShelves = shelves.filter(
    (x) => x.status === "maintenance"
  ).length;

  const warehousesForFormStore = useMemo(() => {
    if (!formData.store) return warehouses;
    return warehouses.filter(
      (w) => (w.store?._id || w.store) === formData.store
    );
  }, [warehouses, formData.store]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyShelf);
    setShowModal(true);
  };

  const openEditModal = (shelf) => {
    setEditingId(shelf._id);
    setFormData({
      store: shelf.store?._id || shelf.store || "",
      warehouse: shelf.warehouse?._id || shelf.warehouse || "",
      shelfCode: shelf.shelfCode || "",
      shelfName: shelf.shelfName || "",
      rackNumber: shelf.rackNumber || "",
      floorNumber: shelf.floorNumber ?? 1,
      section: shelf.section || "",
      storageType: shelf.storageType || "Normal",
      maximumCapacity: shelf.maximumCapacity ?? 0,
      currentCapacity: shelf.currentCapacity ?? 0,
      remarks: shelf.remarks || "",
      status: shelf.status || "active",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyShelf);
  };

  const handleSubmit = async () => {
    if (
      !formData.store ||
      !formData.warehouse ||
      !formData.shelfCode ||
      !formData.shelfName ||
      !formData.rackNumber
    ) {
      alert(
        "Store, Warehouse, Shelf Code, Shelf Name and Rack Number are required."
      );
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await updateShelf(editingId, formData);
      } else {
        await createShelf(formData);
      }

      closeModal();
      fetchShelves();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to save Shelf.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleShelf(id);
      fetchShelves();
    } catch (err) {
      console.log(err);
      alert("Unable to update shelf status.");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Permanently delete this shelf? This cannot be undone.")
    )
      return;

    try {
      await deleteShelf(id);
      fetchShelves();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to delete shelf.");
    }
  };

  return (
    <div className="shelf-page">
      <div className="shelf-content">
       
        <div className="page-header">
          <div>
            <h2>Shelves</h2>
            <p>Manage rack and shelf locations inside your warehouses.</p>
          </div>

          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={18} />
            Add Shelf
          </button>
        </div>


        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search shelf code, name, rack or section..."
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
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.warehouseName}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Storage Types</option>
            {STORAGE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
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
            <option value="maintenance">Maintenance</option>
          </select>
        </div>


        <div className="shelf-summary-grid">
          <div className="shelf-summary-card card-blue">
            <div className="shelf-summary-icon">
              <LayoutList size={24} />
            </div>
            <h2>{totalShelves}</h2>
            <p>Total Shelves</p>
          </div>

          <div className="shelf-summary-card card-green">
            <div className="shelf-summary-icon">
              <ShieldCheck size={24} />
            </div>
            <h2>{activeShelves}</h2>
            <p>Active</p>
          </div>

          <div className="shelf-summary-card card-red">
            <div className="shelf-summary-icon">
              <ShieldOff size={24} />
            </div>
            <h2>{inactiveShelves}</h2>
            <p>Inactive</p>
          </div>

          <div className="shelf-summary-card card-amber">
            <div className="shelf-summary-icon">
              <Wrench size={24} />
            </div>
            <h2>{maintenanceShelves}</h2>
            <p>Maintenance</p>
          </div>
        </div>



        <div className="table-card">
          <table className="shelf-table">
            <thead>
              <tr>
                <th>Shelf</th>
                <th>Warehouse</th>
                <th>Storage Type</th>
                <th>Capacity</th>
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
              ) : filteredShelves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    No Shelves Found
                  </td>
                </tr>
              ) : (
                filteredShelves.map((shelf) => {
                  const pct =
                    shelf.maximumCapacity > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (shelf.currentCapacity / shelf.maximumCapacity) *
                              100
                          )
                        )
                      : 0;

                  return (
                    <tr key={shelf._id}>
                      <td>
                        <div className="shelf-info">
                          <strong>
                            {shelf.shelfName}
                            {shelf.storageType !== "Normal" && (
                              <span
                                className={`zone-tag ${shelf.storageType
                                  ?.toLowerCase()
                                  .replace(" ", "-")}`}
                              >
                                {shelf.storageType}
                              </span>
                            )}
                          </strong>
                          <p>
                            {shelf.shelfCode} · Rack {shelf.rackNumber}
                            {shelf.section ? ` · ${shelf.section}` : ""}
                          </p>
                        </div>
                      </td>

                      <td>{shelf.warehouse?.warehouseName || "—"}</td>

                      <td>{shelf.storageType}</td>

                      <td style={{ minWidth: 120 }}>
                        {shelf.maximumCapacity > 0 ? (
                          <>
                            <span style={{ fontSize: 12, color: "var(--bp-muted)" }}>
                              {shelf.currentCapacity} / {shelf.maximumCapacity}
                            </span>
                            <div className="capacity-bar-track">
                              <div
                                className="capacity-bar-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td>
                        <span className={`badge ${shelf.status}`}>
                          {shelf.status}
                        </span>
                      </td>

                      <td>
                        <div className="action-btns">
                          <button
                            className="edit-btn"
                            title="Edit"
                            onClick={() => openEditModal(shelf)}
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            className={
                              shelf.status === "active"
                                ? "deactivate-btn"
                                : "activate-btn"
                            }
                            title={
                              shelf.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                            onClick={() => handleToggleStatus(shelf._id)}
                          >
                            {shelf.status === "active" ? (
                              <ShieldOff size={16} />
                            ) : (
                              <ShieldCheck size={16} />
                            )}
                          </button>

                          <button
                            className="delete-btn"
                            title="Delete"
                            onClick={() => handleDelete(shelf._id)}
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
            <div className="shelf-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Shelf" : "Add Shelf"}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <h4 className="section-title">Location</h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Store *</label>
                    <select
                      value={formData.store}
                      onChange={(e) => {
                        updateField("store", e.target.value);
                        updateField("warehouse", ""); // reset dependent field
                      }}
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
                    <label>Warehouse *</label>
                    <select
                      value={formData.warehouse}
                      onChange={(e) =>
                        updateField("warehouse", e.target.value)
                      }
                      disabled={!formData.store}
                    >
                      <option value="">
                        {formData.store ? "Select Warehouse" : "Select a store first"}
                      </option>
                      {warehousesForFormStore.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.warehouseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Shelf Code *</label>
                    <input
                      placeholder="e.g. SH-A01"
                      value={formData.shelfCode}
                      onChange={(e) =>
                        updateField("shelfCode", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Shelf Name *</label>
                    <input
                      placeholder="e.g. Aisle A - Shelf 1"
                      value={formData.shelfName}
                      onChange={(e) =>
                        updateField("shelfName", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Rack Number *</label>
                    <input
                      placeholder="e.g. R-12"
                      value={formData.rackNumber}
                      onChange={(e) =>
                        updateField("rackNumber", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Floor Number</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.floorNumber}
                      onChange={(e) =>
                        updateField("floorNumber", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Section</label>
                    <input
                      placeholder="e.g. Dairy, Electronics"
                      value={formData.section}
                      onChange={(e) =>
                        updateField("section", e.target.value)
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
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <h4 className="section-title">Storage Details</h4>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Storage Type</label>
                    <select
                      value={formData.storageType}
                      onChange={(e) =>
                        updateField("storageType", e.target.value)
                      }
                    >
                      {STORAGE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Maximum Capacity</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maximumCapacity}
                      onChange={(e) =>
                        updateField("maximumCapacity", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Current Capacity</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.currentCapacity}
                      onChange={(e) =>
                        updateField("currentCapacity", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="form-grid" style={{ marginTop: 15 }}>
                  <div className="form-group form-group-full">
                    <label>Remarks</label>
                    <textarea
                      rows="2"
                      value={formData.remarks}
                      onChange={(e) =>
                        updateField("remarks", e.target.value)
                      }
                    />
                  </div>
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
                    ? "Update Shelf"
                    : "Create Shelf"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}