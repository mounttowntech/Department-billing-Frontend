import api from "../api/axios";

const BASE = "/units";


export const getUnits = async (params = {}) => {
  const res = await api.get(`${BASE}/all`, { params });
  return res.data;
};

export const getUnitById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createUnit = async (data) => {
  const res = await api.post(`${BASE}/create`, data);
  return res.data;
};

export const updateUnit = async (id, data) => {
  const res = await api.put(`${BASE}/update/${id}`, data);
  return res.data;
};

export const activateUnit = async (id) => {
  const res = await api.patch(`${BASE}/activate/${id}`);
  return res.data;
};

// Backend soft-deletes (sets status to "inactive") — there is no hard delete route.
export const deactivateUnit = async (id) => {
  const res = await api.delete(`${BASE}/delete/${id}`);
  return res.data;
};

// ⚠️ Requires a new backend route — see UnitController.js / unitsRoutes.js
// addition below. Actually removes the document, not a status flip.
export const permanentDeleteUnit = async (id) => {
  const res = await api.delete(`${BASE}/permanent/${id}`);
  return res.data;
};