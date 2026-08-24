import axios from "axios";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  "http://localhost:5001/api";

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

export const getStockLedgers = async (params = {}) => {
  return await axios.get(`${API_BASE_URL}/stock-ledgers/all`, {
    ...getAuthHeaders(),
    params,
  });
};

export const getStockLedgerById = async (id) => {
  return await axios.get(
    `${API_BASE_URL}/stock-ledgers/${id}`,
    getAuthHeaders()
  );
};

export const createStockLedger = async (payload) => {
  return await axios.post(
    `${API_BASE_URL}/stock-ledgers/create`,
    payload,
    getAuthHeaders()
  );
};

export const updateStockLedger = async (id, payload) => {
  return await axios.put(
    `${API_BASE_URL}/stock-ledgers/update/${id}`,
    payload,
    getAuthHeaders()
  );
};

export const deleteStockLedger = async (id) => {
  return await axios.delete(
    `${API_BASE_URL}/stock-ledgers/delete/${id}`,
    getAuthHeaders()
  );
};