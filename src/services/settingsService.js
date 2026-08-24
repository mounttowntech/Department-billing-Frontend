import api from "../api/axios";


export const getAllSettings = async (params = {}) => {
  const response = await api.get("/settings/all", { params });
  return response.data;
};

export const getSettingsByStore = async (storeId) => {
  const response = await api.get(`/settings/store/${storeId}`);
  return response.data;
};

export const getSettingsById = async (id) => {
  const response = await api.get(`/settings/${id}`);
  return response.data;
};

export const createSettings = async (data) => {
  const response = await api.post("/settings/create", data);
  return response.data;
};

export const updateSettings = async (id, data) => {
  const response = await api.put(`/settings/update/${id}`, data);
  return response.data;
};

export const deleteSettings = async (id) => {
  const response = await api.delete(`/settings/delete/${id}`);
  return response.data;
};