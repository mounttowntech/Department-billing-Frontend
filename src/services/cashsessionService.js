import api from "../api/axios";

export const getCashSessions = async (params = {}) => {
  const response = await api.get("/cash-sessions/all", { params });

  return response;
};

export const getCashSessionById = async (id) => {
  const response = await api.get(`/cash-sessions/${id}`);

  return response;
};

export const createCashSession = async (data) => {
  const response = await api.post("/cash-sessions/create", data);

  return response;
};

export const updateCashSession = async (id, data) => {
  const response = await api.put(`/cash-sessions/update/${id}`, data);

  return response;
};

export const deleteCashSession = async (id) => {
  const response = await api.delete(`/cash-sessions/delete/${id}`);

  return response;
};