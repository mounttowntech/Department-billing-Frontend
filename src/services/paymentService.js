import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const paymentAPI = axios.create({
  baseURL: `${API_URL}/payments`,
});

paymentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Create Payment
export const createPayment = async (data) => {
  const response = await paymentAPI.post("/create", data);
  return response.data;
};

// Get All Payments
export const getAllPayments = async (params = {}) => {
  const response = await paymentAPI.get("/all", {
    params,
  });

  return response.data;
};

// Get Payment By ID
export const getPaymentById = async (id) => {
  const response = await paymentAPI.get(`/${id}`);
  return response.data;
};

// Update Payment
export const updatePayment = async (id, data) => {
  const response = await paymentAPI.put(`/update/${id}`, data);
  return response.data;
};

// Delete Payment
export const deletePayment = async (id) => {
  const response = await paymentAPI.delete(`/delete/${id}`);
  return response.data;
};