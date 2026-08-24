import api from "../api/axios";

export const getRolePermissions = async (params = {}) => {
  const res = await api.get("/role-permissions/all", { params });
  return res.data;
};

export const getRolePermissionById = async (id) => {
  const res = await api.get(`/role-permissions/${id}`);
  return res.data;
};

export const createRolePermission = async (data) => {
  const res = await api.post("/role-permissions/create", data);
  return res.data;
};

export const updateRolePermission = async (id, data) => {
  const res = await api.put(`/role-permissions/update/${id}`, data);
  return res.data;
};

export const toggleRolePermission = async (id) => {
  const res = await api.patch(`/role-permissions/toggle/${id}`);
  return res.data;
};

export const deleteRolePermission = async (id) => {
  const res = await api.delete(`/role-permissions/delete/${id}`);
  return res.data;
};