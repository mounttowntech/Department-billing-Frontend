import api from "../api/axios";

export const getSalesReturns = async (params = {}) => {
  const response = await api.get("/sales-returns/all", { params });
  return response.data;
};


export const getSalesReturnById = async (id) => {
  const response = await api.get(`/sales-returns/${id}`);
  return response.data;
};


export const createSalesReturn = async (data) => {
  const response = await api.post("/sales-returns/create", data);
  return response.data;
};

export const updateSalesReturn = async (id, data) => {
  const response = await api.put(`/sales-returns/update/${id}`, data);
  return response.data;
};

export const deleteSalesReturn = async (id) => {
  const response = await api.delete(`/sales-returns/delete/${id}`);
  return response.data;
};