import api from "../api/axios";

export const getSalesInvoices = async (params = {}) => {
  const response = await api.get("/sales-invoices/all", { params });

  return response;
};

export const getSalesInvoiceById = async (id) => {
  const response = await api.get(`/sales-invoices/${id}`);

  return response;
};

export const createSalesInvoice = async (data) => {
  const response = await api.post("/sales-invoices/create", data);

  return response;
};

export const updateSalesInvoice = async (id, data) => {
  const response = await api.put(`/sales-invoices/update/${id}`, data);

  return response;
};

export const deleteSalesInvoice = async (id) => {
  const response = await api.delete(`/sales-invoices/delete/${id}`);

  return response;
};