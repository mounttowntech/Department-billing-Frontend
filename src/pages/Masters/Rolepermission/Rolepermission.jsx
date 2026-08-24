import React, { useEffect, useMemo, useState } from "react";
import "./RolePermission.css";
import { hasPermission } from "../../../utils/permission";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  Lock,
} from "lucide-react";

import {
  getRolePermissions,
  createRolePermission,
  updateRolePermission,
  toggleRolePermission,
  deleteRolePermission,
} from "../../../services/rolePermissionService";

import { getStores } from "../../../services/storeService";

const MODULES = [
  "Dashboard",
  "Products",
  "Purchase",
  "Sales",
  "Inventory",
  "Customers",
  "Suppliers",
  "Reports",
  "Store",
  "Users",
  "Role Permission",
  "Tax Settings",
  "Units",
  "Categories",
  "Sub Categories",
  "Brands",
  "Warehouse",
  "Shelf",
];

const PERMISSION_COLUMNS = [
  { key: "canView", label: "View" },
  { key: "canCreate", label: "Create" },
  { key: "canEdit", label: "Edit" },
  { key: "canDelete", label: "Delete" },
  { key: "canPrint", label: "Print" },
  { key: "canExport", label: "Export" },
  { key: "canImport", label: "Import" },
  { key: "canApprove", label: "Approve" },
];

const buildEmptyPermissions = () => {
  const map = {};
  MODULES.forEach((module) => {
    map[module] = {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canPrint: false,
      canExport: false,
      canImport: false,
      canApprove: false,
    };
  });
  return map;
};

const emptyRole = {
  store: "",
  roleCode: "",
  roleName: "",
  description: "",
  isSystemRole: false,
  dashboardAccess: true,
  status: "active",
};

const permissionsArrayToMap = (permissionsArray = []) => {
  const map = buildEmptyPermissions();

  permissionsArray.forEach((p) => {
    if (map[p.module]) {
      map[p.module] = {
        canView: !!p.canView,
        canCreate: !!p.canCreate,
        canEdit: !!p.canEdit,
        canDelete: !!p.canDelete,
        canPrint: !!p.canPrint,
        canExport: !!p.canExport,
        canImport: !!p.canImport,
        canApprove: !!p.canApprove,
      };
    }
  });

  return map;
};

const permissionsMapToArray = (map) =>
  MODULES.map((module) => ({
    module,
    ...map[module],
  }));

export default function RolePermission() {
  const [roles, setRoles] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyRole);
  const [permissionsMap, setPermissionsMap] = useState(buildEmptyPermissions);

  const fetchRoles = async () => {
    try {
      setLoading(true);

      const res = await getRolePermissions({
        search: search || undefined,
        status: statusFilter || undefined,
        store: storeFilter || undefined,
      });

      if (res.success) {
        setRoles(res.data || []);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.log(err);
      setRoles([]);
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
      fetchRoles();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, statusFilter, storeFilter]);

  const filteredRoles = useMemo(() => roles, [roles]);

  const totalRoles = roles.length;
  const activeRoles = roles.filter((x) => x.status === "active").length;
  const inactiveRoles = roles.filter((x) => x.status === "inactive").length;
  const systemRoles = roles.filter((x) => x.isSystemRole).length;

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyRole);
    setPermissionsMap(buildEmptyPermissions());
    setShowModal(true);
  };

  const openEditModal = (role) => {
    setEditingId(role._id);
    setFormData({
      store: role.store?._id || role.store || "",
      roleCode: role.roleCode || "",
      roleName: role.roleName || "",
      description: role.description || "",
      isSystemRole: !!role.isSystemRole,
      dashboardAccess: role.dashboardAccess !== false,
      status: role.status || "active",
    });
    setPermissionsMap(permissionsArrayToMap(role.permissions));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyRole);
    setPermissionsMap(buildEmptyPermissions());
  };

  const toggleCell = (module, key) => {
    setPermissionsMap((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [key]: !prev[module][key],
      },
    }));
  };

  const toggleEntireRow = (module) => {
    setPermissionsMap((prev) => {
      const row = prev[module];
      const allOn = PERMISSION_COLUMNS.every((c) => row[c.key]);
      const next = {};
      PERMISSION_COLUMNS.forEach((c) => {
        next[c.key] = !allOn;
      });
      return { ...prev, [module]: next };
    });
  };

  const toggleEntireColumn = (key) => {
    setPermissionsMap((prev) => {
      const allOn = MODULES.every((m) => prev[m][key]);
      const next = { ...prev };
      MODULES.forEach((m) => {
        next[m] = { ...next[m], [key]: !allOn };
      });
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!formData.store || !formData.roleCode || !formData.roleName) {
      alert("Store, Role Code and Role Name are required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        roleCode: formData.roleCode.toUpperCase(),
        permissions: permissionsMapToArray(permissionsMap),
      };

      if (editingId) {
        await updateRolePermission(editingId, payload);
      } else {
        await createRolePermission(payload);
      }

      closeModal();
      fetchRoles();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to save Role.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this role permanently?")) return;

    try {
      await deleteRolePermission(id);
      fetchRoles();
    } catch (err) {
      console.log(err);
      alert(
        err.response?.data?.message ||
          "Unable to delete role. It may still be assigned to users."
      );
    }
  };

  const handleToggleStatus = async (role) => {
    try {
      await toggleRolePermission(role._id);
      fetchRoles();
    } catch (err) {
      console.log(err);
      alert("Unable to update role status.");
    }
  };

  const activeCount = (role) =>
    (role.permissions || []).filter(
      (p) =>
        p.canView ||
        p.canCreate ||
        p.canEdit ||
        p.canDelete ||
        p.canPrint ||
        p.canExport ||
        p.canImport ||
        p.canApprove
    ).length;

  return (
    <div className="role-page">
      <div className="role-content">
       

        <div className="page-header">
          <div>
            <h2>Role &amp; Permissions</h2>
            <p>Define roles and control module-level access.</p>
          </div>

          {hasPermission("Role Permission", "canCreate") && (
  <button className="primary-btn" onClick={openAddModal}>
    <Plus size={18} />
    Add Role
  </button>
)}
        </div>

        

        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by role name, code..."
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

   
        <div className="role-summary-grid">
          <div className="role-summary-card card-blue">
            <div className="role-summary-icon">
              <Lock size={24} />
            </div>
            <h2>{totalRoles}</h2>
            <p>Total Roles</p>
          </div>

          <div className="role-summary-card card-green">
            <div className="role-summary-icon">
              <ShieldCheck size={24} />
            </div>
            <h2>{activeRoles}</h2>
            <p>Active Roles</p>
          </div>

          <div className="role-summary-card card-red">
            <div className="role-summary-icon">
              <ShieldOff size={24} />
            </div>
            <h2>{inactiveRoles}</h2>
            <p>Inactive Roles</p>
          </div>

          <div className="role-summary-card card-purple">
            <div className="role-summary-icon">
              <ShieldAlert size={24} />
            </div>
            <h2>{systemRoles}</h2>
            <p>System Roles</p>
          </div>
        </div>

  

        <div className="table-card">
          <table className="role-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Store</th>
                <th>Modules Enabled</th>
                <th>Type</th>
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
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    No Roles Found
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role._id}>
                    <td>
                      <div className="role-info">
                        <div className="role-avatar">
                          <Lock size={18} />
                        </div>
                        <div>
                          <strong>{role.roleName}</strong>
                          <p>{role.roleCode}</p>
                        </div>
                      </div>
                    </td>

                    <td>{role.store?.storeName || "—"}</td>
                    <td>
                      {activeCount(role)} / {MODULES.length}
                    </td>

                    <td>
                      {role.isSystemRole ? (
                        <span className="badge system">System</span>
                      ) : (
                        <span className="badge custom">Custom</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          role.status === "active"
                            ? "badge active"
                            : "badge inactive"
                        }
                      >
                        {role.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-btns">
                       {hasPermission("Role Permission", "canEdit") && (
  <button
    className="edit-btn"
    onClick={() => openEditModal(role)}
  >
    <Edit size={16} />
  </button>
)}

                       {hasPermission("Role Permission", "canEdit") && (
  <button
    className={
      role.status === "active"
        ? "deactivate-btn"
        : "activate-btn"
    }
    title={
      role.status === "active"
        ? "Deactivate"
        : "Activate"
    }
    onClick={() => handleToggleStatus(role)}
  >
    {role.status === "active" ? (
      <ShieldOff size={16} />
    ) : (
      <ShieldCheck size={16} />
    )}
  </button>
)}{hasPermission("Role Permission", "canDelete") && (
  <button
    className="delete-btn"
    onClick={() => handleDelete(role._id)}
  >
    <Trash2 size={16} />
  </button>
)}
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
            <div className="role-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Role" : "Add Role"}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
            
                <h4 className="section-title">Basic Information</h4>

                <div className="form-grid">
                  <select
                    value={formData.store}
                    onChange={(e) =>
                      setFormData({ ...formData, store: e.target.value })
                    }
                  >
                    <option value="">Select Store</option>
                    {stores.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.storeName}
                      </option>
                    ))}
                  </select>

                  <input
                    placeholder="Role Code (e.g. STORE_MGR)"
                    value={formData.roleCode}
                    onChange={(e) =>
                      setFormData({ ...formData, roleCode: e.target.value })
                    }
                  />

                  <input
                    placeholder="Role Name (e.g. Store Manager)"
                    value={formData.roleName}
                    onChange={(e) =>
                      setFormData({ ...formData, roleName: e.target.value })
                    }
                  />

                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <textarea
                    rows="2"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="checkbox-grid">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.dashboardAccess}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dashboardAccess: e.target.checked,
                        })
                      }
                    />
                    Dashboard Access
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isSystemRole}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isSystemRole: e.target.checked,
                        })
                      }
                    />
                    System Role (protected)
                  </label>
                </div>


                <h4 className="section-title">Module Permissions</h4>

                <div className="matrix-wrapper">
                  <table className="permission-matrix">
                    <thead>
                      <tr>
                        <th className="matrix-module-col">Module</th>
                        {PERMISSION_COLUMNS.map((col) => (
                          <th key={col.key}>
                            <button
                              type="button"
                              className="matrix-col-toggle"
                              onClick={() => toggleEntireColumn(col.key)}
                              title={`Toggle ${col.label} for all modules`}
                            >
                              {col.label}
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {MODULES.map((module) => (
                        <tr key={module}>
                          <td className="matrix-module-col">
                            <button
                              type="button"
                              className="matrix-row-toggle"
                              onClick={() => toggleEntireRow(module)}
                              title={`Toggle all permissions for ${module}`}
                            >
                              {module}
                            </button>
                          </td>

                          {PERMISSION_COLUMNS.map((col) => (
                            <td key={col.key} className="matrix-cell">
                              <input
                                type="checkbox"
                                checked={permissionsMap[module][col.key]}
                                onChange={() => toggleCell(module, col.key)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    ? "Update Role"
                    : "Create Role"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}