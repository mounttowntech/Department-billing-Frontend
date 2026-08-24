import api from "../api/axios";

export const getAllExpenses = async (params = {}) => {
  const response = await api.get("/expenses/all", {
    params,
  });
  return response.data;
};

export const getExpenseById = async (id) => {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post("/expenses/create", data);
  return response.data;
};


export const updateExpense = async (id, data) => {
  const response = await api.put(`/expenses/update/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/delete/${id}`);
  return response.data;
};

export const approveExpense = async (id) => {
  const response = await api.put(`/expenses/approve/${id}`);
  return response.data;
};

export const rejectExpense = async (id) => {
  const response = await api.put(`/expenses/reject/${id}`);
  return response.data;
};

export const getExpenseSummary = async (params = {}) => {
  const response = await api.get("/expenses/summary/report", {
    params,
  });
  return response.data;
};