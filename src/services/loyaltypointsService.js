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

export const getLoyaltyPoints = async (params = {}) => {
  return await axios.get(`${API_BASE_URL}/loyalty-points/all`, {
    ...getAuthHeaders(),
    params,
  });
};

export const getLoyaltyPointsById = async (id) => {
  return await axios.get(
    `${API_BASE_URL}/loyalty-points/${id}`,
    getAuthHeaders()
  );
};

export const createLoyaltyPoints = async (payload) => {
  return await axios.post(
    `${API_BASE_URL}/loyalty-points/create`,
    payload,
    getAuthHeaders()
  );
};

export const updateLoyaltyPoints = async (id, payload) => {
  return await axios.put(
    `${API_BASE_URL}/loyalty-points/update/${id}`,
    payload,
    getAuthHeaders()
  );
};

export const deleteLoyaltyPoints = async (id) => {
  return await axios.delete(
    `${API_BASE_URL}/loyalty-points/delete/${id}`,
    getAuthHeaders()
  );
};