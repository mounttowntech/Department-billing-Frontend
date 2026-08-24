import api from "../api/axios";

export const getPurchases = async (params = {}) => {
  const response = await api.get("/purchases/all", { params });

  return response;
};

export const getPurchaseById = async (id) => {
  const response = await api.get(`/purchases/${id}`);

  return response;
};

export const createPurchase = async (data) => {
  const response = await api.post("/purchases/create", data);

  return response;
};

export const updatePurchase = async (id, data) => {
  const response = await api.put(`/purchases/update/${id}`, data);

  return response;
};

export const deletePurchase = async (id) => {
  const response = await api.delete(`/purchases/delete/${id}`);

  return response;
};

export const getTodayPurchases = async () => {
  const response = await api.get("/purchases/today");

  return response;
};


export const getPendingPurchases = async () => {
  const response = await api.get("/purchases/pending-payment");

  return response;
};

export const getPurchaseBySupplier = async (supplierId) => {
  const response = await api.get(`/purchases/supplier/${supplierId}`);

  return response;
};