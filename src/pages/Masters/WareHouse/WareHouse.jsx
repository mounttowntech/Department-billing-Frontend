import React, { useEffect, useMemo, useState } from "react";
import "./Warehouse.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Warehouse as WarehouseIcon,
  ShieldCheck,
  ShieldOff,
  Snowflake,
} from "lucide-react";

import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  toggleWarehouse,
  deleteWarehouse,
} from "../../../services/warehouseService";

import { getStores } from "../../../services/storeService";

const WAREHOUSE_TYPES = [
  "Main Warehouse",
  "Branch Warehouse",
  "Cold Storage",
  "Distribution Center",
];

const TEMPERATURE_ZONES = ["Normal", "Cold", "Frozen"];

const emptyWarehouse = {
  store: "",
  warehouseCode: "",
  warehouseName: "",
  warehouseType: "Main Warehouse",
  manager: "",
  phone: "",
  email: "",
  address: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    state: "",
    country: "India",
    pincode: "",
  },
  storageCapacity: 0,
  temperatureZone: "Normal",
  allowNegativeStock: false,
  remarks: "",
  status: "active",
};

export default function Warehouse() {
  const [warehouses, setWarehouses] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyWarehouse);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);

      const res = await getWarehouses({
        search: search || undefined,
        status: statusFilter || undefined,
        store: storeFilter || undefined,
        warehouseType: typeFilter || undefined,
      });

      if (res.success) {
        setWarehouses(res.data || []);
      } else {
        setWarehouses([]);
      }
    } catch (err) {
      console.log(err);
      setWarehouses([]);
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

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWarehouses();
    }, 300);

    return () => clearTimeout(timer);
   
  }, [search, statusFilter, storeFilter, typeFilter]);

  const filteredWarehouses = useMemo(() => warehouses, [warehouses]);

  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter((x) => x.status === "active").length;
  const inactiveWarehouses = warehouses.filter((x) => x.status === "inactive").length;
  const coldZoneWarehouses = warehouses.filter(
    (x) => x.temperatureZone && x.temperatureZone !== "Normal"
  ).length;

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateAddressField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [key]: value },
    }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyWarehouse);
    setShowModal(true);
  };

  const openEditModal = (warehouse) => {
    setEditingId(warehouse._id);
    setFormData({
      store: warehouse.store?._id || warehouse.store || "",
      warehouseCode: warehouse.warehouseCode || "",
      warehouseName: warehouse.warehouseName || "",
      warehouseType: warehouse.warehouseType || "Main Warehouse",
      manager: warehouse.manager?._id || warehouse.manager || "",
      phone: warehouse.phone || "",
      email: warehouse.email || "",
      address: {
        addressLine1: warehouse.address?.addressLine1 || "",
        addressLine2: warehouse.address?.addressLine2 || "",
        city: warehouse.address?.city || "",
        district: warehouse.address?.district || "",
        state: warehouse.address?.state || "",
        country: warehouse.address?.country || "India",
        pincode: warehouse.address?.pincode || "",
      },
      storageCapacity: warehouse.storageCapacity ?? 0,
      temperatureZone: warehouse.temperatureZone || "Normal",
      allowNegativeStock: Boolean(warehouse.allowNegativeStock),
      remarks: warehouse.remarks || "",
      status: warehouse.status || "active",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyWarehouse);
  };

  const handleSubmit = async () => {
    if (!formData.store || !formData.warehouseCode || !formData.warehouseName) {
      alert("Store, Warehouse Code and Warehouse Name are required.");
      return;
    }

    try {
      setSaving(true);

      const fields = {
        ...formData,
        manager: formData.manager || undefined,
      };

      if (editingId) {
        await updateWarehouse(editingId, fields);
      } else {
        await createWarehouse(fields);
      }

      closeModal();
      fetchWarehouses();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to save Warehouse.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleWarehouse(id);
      fetchWarehouses();
    } catch (err) {
      console.log(err);
      alert("Unable to update warehouse status.");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Permanently delete this warehouse? This cannot be undone."
      )
    )
      return;

    try {
      await deleteWarehouse(id);
      fetchWarehouses();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to delete warehouse.");
    }
  };

  return (
    <div className="warehouse-page">
      <div className="warehouse-content">
       
        <div className="page-header">
          <div>
            <h2>Warehouses</h2>
            <p>Manage storage locations across your stores.</p>
          </div>

          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={18} />
            Add Warehouse
          </button>
        </div>

       
        <div className="warehouse-toolbar">
          <div className="warehouse-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search warehouse code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="warehouse-filter-select"
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
            className="warehouse-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {WAREHOUSE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            className="warehouse-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

       
        <div className="warehouse-summary-grid">
          <div className="warehouse-summary-card card-blue">
            <div className="warehouse-summary-icon">
              <WarehouseIcon size={24} />
            </div>
            <h2>{totalWarehouses}</h2>
            <p>Total Warehouses</p>
          </div>

          <div className="warehouse-summary-card card-green">
            <div className="warehouse-summary-icon">
              <ShieldCheck size={24} />
            </div>
            <h2>{activeWarehouses}</h2>
            <p>Active</p>
          </div>

          <div className="warehouse-summary-card card-red">
            <div className="warehouse-summary-icon">
              <ShieldOff size={24} />
            </div>
            <h2>{inactiveWarehouses}</h2>
            <p>Inactive</p>
          </div>

          <div className="warehouse-summary-card card-purple">
            <div className="warehouse-summary-icon">
              <Snowflake size={24} />
            </div>
            <h2>{coldZoneWarehouses}</h2>
            <p>Cold / Frozen Zones</p>
          </div>
        </div>
        <div className="table-card">
          <table className="warehouse-table">
            <thead>
              <tr>
                <th>Warehouse</th>
                <th>Store</th>
                <th>Type</th>
                <th>Manager</th>
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
              ) : filteredWarehouses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    No Warehouses Found
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse._id}>
                    <td>
                      <div className="warehouse-info">
                        <strong>
                          {warehouse.warehouseName}
                          {warehouse.temperatureZone !== "Normal" && (
                            <span
                              className={`zone-tag ${warehouse.temperatureZone?.toLowerCase()}`}
                            >
                              {warehouse.temperatureZone}
                            </span>
                          )}
                        </strong>
                        <p>{warehouse.warehouseCode}</p>
                      </div>
                    </td>

                    <td>{warehouse.store?.storeName || "—"}</td>

                    <td>{warehouse.warehouseType}</td>

                    <td>
                      {warehouse.manager
                        ? `${warehouse.manager.firstName || ""} ${
                            warehouse.manager.lastName || ""
                          }`.trim() || warehouse.manager.employeeCode
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={
                          warehouse.status === "active"
                            ? "badge active"
                            : "badge inactive"
                        }
                      >
                        {warehouse.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          title="Edit"
                          onClick={() => openEditModal(warehouse)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className={
                            warehouse.status === "active"
                              ? "deactivate-btn"
                              : "activate-btn"
                          }
                          title={
                            warehouse.status === "active"
                              ? "Deactivate"
                              : "Activate"
                          }
                          onClick={() => handleToggleStatus(warehouse._id)}
                        >
                          {warehouse.status === "active" ? (
                            <ShieldOff size={16} />
                          ) : (
                            <ShieldCheck size={16} />
                          )}
                        </button>

                        <button
                          className="delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(warehouse._id)}
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
            <div className="warehouse-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Warehouse" : "Add Warehouse"}</h3>
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
                    <label>Warehouse Code *</label>
                    <input
                      placeholder="e.g. WH-MAIN"
                      value={formData.warehouseCode}
                      onChange={(e) =>
                        updateField("warehouseCode", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Warehouse Name *</label>
                    <input
                      placeholder="e.g. Main Warehouse - Coimbatore"
                      value={formData.warehouseName}
                      onChange={(e) =>
                        updateField("warehouseName", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Warehouse Type</label>
                    <select
                      value={formData.warehouseType}
                      onChange={(e) =>
                        updateField("warehouseType", e.target.value)
                      }
                    >
                      {WAREHOUSE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
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
                    <label>Phone</label>
                    <input
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
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
                </div>

                <h4 className="section-title">Storage Details</h4>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Storage Capacity</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={formData.storageCapacity}
                      onChange={(e) =>
                        updateField("storageCapacity", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Temperature Zone</label>
                    <select
                      value={formData.temperatureZone}
                      onChange={(e) =>
                        updateField("temperatureZone", e.target.value)
                      }
                    >
                      {TEMPERATURE_ZONES.map((z) => (
                        <option key={z} value={z}>
                          {z}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group form-group-full">
                    <label>Remarks</label>
                    <input
                      value={formData.remarks}
                      onChange={(e) =>
                        updateField("remarks", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="checkbox-grid">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.allowNegativeStock}
                      onChange={(e) =>
                        updateField("allowNegativeStock", e.target.checked)
                      }
                    />
                    Allow Negative Stock
                  </label>
                </div>

                <h4 className="section-title">Address</h4>

                <div className="form-grid">
                  <div className="form-group form-group-full">
                    <label>Address Line 1</label>
                    <input
                      value={formData.address.addressLine1}
                      onChange={(e) =>
                        updateAddressField("addressLine1", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label>Address Line 2</label>
                    <input
                      value={formData.address.addressLine2}
                      onChange={(e) =>
                        updateAddressField("addressLine2", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <input
                      value={formData.address.city}
                      onChange={(e) =>
                        updateAddressField("city", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>District</label>
                    <input
                      value={formData.address.district}
                      onChange={(e) =>
                        updateAddressField("district", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>
                    <input
                      value={formData.address.state}
                      onChange={(e) =>
                        updateAddressField("state", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      value={formData.address.country}
                      onChange={(e) =>
                        updateAddressField("country", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      value={formData.address.pincode}
                      onChange={(e) =>
                        updateAddressField("pincode", e.target.value)
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
                    ? "Update Warehouse"
                    : "Create Warehouse"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}