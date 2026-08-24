import React, { useEffect, useMemo, useState } from "react";
import "./User.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Users as UsersIcon,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldOff,
 
} from "lucide-react";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
 
} from "../../../services/userService";

import { getRoles } from "../../../services/roleService";
import { getStores } from "../../../services/storeService";
import { hasPermission } from "../../../utils/permission";
const emptyUser = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",

  role: "",
  store: "",

  address: "",
  city: "",
  state: "",
  pincode: "",

  joiningDate: "",
  salary: 0,

  status: "active",
};


const toPayload = (formData, isEditing) => {
  const payload = { ...formData };

  if (isEditing || !payload.password) {
    delete payload.password;
  }

  if (!payload.store) delete payload.store;

  return payload;
};

export default function User() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyUser);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await getUsers({
        search: search || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
      });

      if (res.success) {
        setUsers(res.data || []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.log(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      if (res.success) {
        setRoles(res.data || []);
      }
    } catch (err) {
      console.log(err);
      setRoles([]);
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
    fetchRoles();
    fetchStores();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, roleFilter]);

  const filteredUsers = useMemo(() => users, [users]);

  const totalUsers = users.length;
  const activeUsers = users.filter((x) => x.status === "active").length;
  const inactiveUsers = users.filter((x) => x.status === "inactive").length;
  

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyUser);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingId(user._id);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",

      role: user.role?._id || user.role || "",
      store: user.store?._id || user.store || "",

      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",

      joiningDate: user.joiningDate
        ? user.joiningDate.substring(0, 10)
        : "",
      salary: user.salary || 0,

      status: user.status || "active",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyUser);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const payload = toPayload(formData, Boolean(editingId));

      if (editingId) {
        await updateUser(editingId, payload);
      } else {
        await createUser(payload);
      }

      closeModal();
      fetchUsers();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to save User.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Delete this user permanently?")) return;

  try {
    await deleteUser(id);

    alert("User deleted successfully");

    fetchUsers();
  } catch (err) {
    console.log(err);
    alert(err.response?.data?.message || "Unable to delete user.");
  }
};
  const handleToggleStatus = async (user) => {
  try {
    await updateUser(user._id, {
      status: user.status === "active"
        ? "inactive"
        : "active",
    });

    fetchUsers();
  } catch (err) {
    console.log(err);
    alert("Unable to update status.");
  }
};

  const statusBadgeClass = (status) =>
  status === "active"
    ? "badge active"
    : "badge inactive";

  return (
    <div className="user-page">
      <div className="user-content">

        <div className="page-header">
          <div>
            <h2>User Management</h2>
            <p>Manage staff accounts, roles and access.</p>
          </div>

          {hasPermission("Users", "canCreate") && (
  <button className="primary-btn" onClick={openAddModal}>
    <Plus size={18} />
    Add User
  </button>
)}
        </div>

      
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r._id} value={r._id}>
                {r.roleName}
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

        <div className="user-summary-grid">
          <div className="user-summary-card card-blue">
            <div className="user-summary-icon">
              <UsersIcon size={24} />
            </div>
            <h2>{totalUsers}</h2>
            <p>Total Users</p>
          </div>

          <div className="user-summary-card card-green">
            <div className="user-summary-icon">
              <UserCheck size={24} />
            </div>
            <h2>{activeUsers}</h2>
            <p>Active Users</p>
          </div>

          <div className="user-summary-card card-red">
            <div className="user-summary-icon">
              <UserX size={24} />
            </div>
            <h2>{inactiveUsers}</h2>
            <p>Inactive Users</p>
          </div>
        </div>

        
        <div className="table-card">
          <table className="user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Store</th>
                <th>Status</th>
                <th width="160">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    Loading...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    No Users Found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {(user.firstName || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>
                            {user.firstName} {user.lastName}
                          </strong>
                          <p>{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td>{user.phone}</td>
                    <td>{user.role?.roleName || "—"}</td>
                    <td>{user.store?.storeName || "—"}</td>

                    <td>
                      <span className={statusBadgeClass(user.status)}>
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-btns">
                        {hasPermission("Users", "canEdit") && (
  <button
    className="edit-btn"
    onClick={() => openEditModal(user)}
  >
    <Edit size={16} />
  </button>
)}

  {hasPermission("Users", "canEdit") && (
  <button
    className={
      user.status === "active"
        ? "deactivate-btn"
        : "activate-btn"
    }
    title={
      user.status === "active"
        ? "Deactivate"
        : "Activate"
    }
    onClick={() => handleToggleStatus(user)}
  >
    {user.status === "active" ? (
      <ShieldOff size={16} />
    ) : (
      <ShieldCheck size={16} />
    )}
  </button>
)}
                        {hasPermission("Users", "canDelete") && (
  <button
    className="delete-btn"
    title="Delete"
    onClick={() => handleDelete(user._id)}
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
            <div className="user-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit User" : "Add User"}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
           
                <h4 className="section-title">Basic Information</h4>

                <div className="form-grid">
                  <input
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />

                  <input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />

                  <input
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                {!editingId && (
                  <>
                    <h4 className="section-title">Security</h4>

                    <div className="form-grid">
                      <input
                        type="password"
                        placeholder="Password (min 6 characters)"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                  </>
                )}

                <h4 className="section-title">Role &amp; Store Assignment</h4>

                <div className="form-grid">
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.roleName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.store}
                    onChange={(e) =>
                      setFormData({ ...formData, store: e.target.value })
                    }
                  >
                    <option value="">Select Store (optional)</option>
                    {stores.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.storeName}
                      </option>
                    ))}
                  </select>
                </div>

       
                <h4 className="section-title">Address</h4>

                <div className="form-grid">
                  <textarea
                    rows="3"
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />

                  <input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />

                  <input
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />

                  <input
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                  />
                </div>

                <h4 className="section-title">Employment Details</h4>

                <div className="form-grid">
                  <div>
                    <label>Joining Date</label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          joiningDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label>Salary</label>
                    <input
                      type="number"
                      placeholder="Salary"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <h4 className="section-title">Status</h4>

                <select
                  className="status-select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                 <option value="active">Active</option>
                 <option value="inactive">Inactive</option>
                </select>
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
                    ? "Update User"
                    : "Create User"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}