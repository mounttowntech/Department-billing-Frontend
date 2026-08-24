import api from "../api/axios";

export const getSalesReport = async (params = {}) => {
  const response = await api.get("/report/sales", { params });
  return response.data;
};

export const getPurchaseReport = async (params = {}) => {
  const response = await api.get("/report/purchases", { params });
  return response.data;
};

export const getStockReport = async (params = {}) => {
  const response = await api.get("/report/stock", { params });
  return response.data;
};

export const getExpenseReport = async (params = {}) => {
  const response = await api.get("/report/expenses", { params });
  return response.data;
};

export const getProfitLossReport = async (params = {}) => {
  const response = await api.get("/report/profit-loss", { params });
  return response.data;
};