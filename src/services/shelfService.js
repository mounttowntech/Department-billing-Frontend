import api from "../api/axios";

const BASE = "/shelfs";

export const getShelves = async (params = {}) => {
  const res = await api.get(`${BASE}/all`, { params });
  return res.data;
};

export const getShelfById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createShelf = async (fields) => {
  const res = await api.post(`${BASE}/create`, fields);
  return res.data;
};

export const updateShelf = async (id, fields) => {
  const res = await api.put(`${BASE}/update/${id}`, fields);
  return res.data;
};

export const toggleShelf = async (id) => {
  const res = await api.patch(`${BASE}/activate/${id}`);
  return res.data;
};

export const deleteShelf = async (id) => {
  const res = await api.delete(`${BASE}/delete/${id}`);
  return res.data;
};