import api from "../api/axios";

const BASE = "/warehouses";

export const getWarehouses = async (params = {}) => {
  const res = await api.get(`${BASE}/all`, { params });
  return res.data;
};

export const getWarehouseById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createWarehouse = async (fields) => {
  const res = await api.post(`${BASE}/create`, fields);
  return res.data;
};

export const updateWarehouse = async (id, fields) => {
  const res = await api.put(`${BASE}/update/${id}`, fields);
  return res.data;
};

export const toggleWarehouse = async (id) => {
  const res = await api.patch(`${BASE}/activate/${id}`);
  return res.data;
};

export const deleteWarehouse = async (id) => {
  const res = await api.delete(`${BASE}/delete/${id}`);
  return res.data;
};