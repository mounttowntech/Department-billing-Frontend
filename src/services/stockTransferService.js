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

export const getStockTransfers = async (params = {}) => {
  return await axios.get(`${API_BASE_URL}/stock-transfers/all`, {
    ...getAuthHeaders(),
    params,
  });
};

export const getStockTransferById = async (id) => {
  return await axios.get(
    `${API_BASE_URL}/stock-transfers/${id}`,
    getAuthHeaders()
  );
};

export const createStockTransfer = async (payload) => {
  return await axios.post(
    `${API_BASE_URL}/stock-transfers/create`,
    payload,
    getAuthHeaders()
  );
};

export const updateStockTransfer = async (id, payload) => {
  return await axios.put(
    `${API_BASE_URL}/stock-transfers/update/${id}`,
    payload,
    getAuthHeaders()
  );
};

export const cancelStockTransfer = async (id) => {
  return await axios.patch(
    `${API_BASE_URL}/stock-transfers/cancel/${id}`,
    {},
    getAuthHeaders()
  );
};

export const deleteStockTransfer = async (id) => {
  return await axios.delete(
    `${API_BASE_URL}/stock-transfers/delete/${id}`,
    getAuthHeaders()
  );
};