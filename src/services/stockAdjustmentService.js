import axios from "axios";


const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

export const getStockAdjustments = async (params = {}) => {
  return await axios.get(`${API_BASE_URL}/stock-adjustments/all`, {
    ...getAuthHeaders(),
    params,
  });
};

export const getStockAdjustmentById = async (id) => {
  return await axios.get(
    `${API_BASE_URL}/stock-adjustments/${id}`,
    getAuthHeaders()
  );
};

export const createStockAdjustment = async (payload) => {
  return await axios.post(
    `${API_BASE_URL}/stock-adjustments/create`,
    payload,
    getAuthHeaders()
  );
};

export const updateStockAdjustment = async (id, payload) => {
  return await axios.put(
    `${API_BASE_URL}/stock-adjustments/update/${id}`,
    payload,
    getAuthHeaders()
  );
};

export const deleteStockAdjustment = async (id) => {
  return await axios.delete(
    `${API_BASE_URL}/stock-adjustments/delete/${id}`,
    getAuthHeaders()
  );
};