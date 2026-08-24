import api from "../api/axios";

export const getTaxSettings = async (params = {}) => {
  const res = await api.get("/tax-settings/all", { params });
  return res.data;
};

export const getTaxSettingById = async (id) => {
  const res = await api.get(`/tax-settings/${id}`);
  return res.data;
};

export const createTaxSetting = async (data) => {
  const res = await api.post("/tax-settings/create", data);
  return res.data;
};

export const updateTaxSetting = async (id, data) => {
  const res = await api.put(`/tax-settings/update/${id}`, data);
  return res.data;
};

export const deleteTaxSetting = async (id) => {
  const res = await api.delete(`/tax-settings/delete/${id}`);
  return res.data;
};