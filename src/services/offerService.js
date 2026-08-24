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

export const getOffers = async (params = {}) => {
  return await axios.get(`${API_BASE_URL}/offers/all`, {
    ...getAuthHeaders(),
    params,
  });
};

export const getOfferById = async (id) => {
  return await axios.get(`${API_BASE_URL}/offers/${id}`, getAuthHeaders());
};

export const createOffer = async (payload) => {
  return await axios.post(
    `${API_BASE_URL}/offers/create`,
    payload,
    getAuthHeaders()
  );
};

export const updateOffer = async (id, payload) => {
  return await axios.put(
    `${API_BASE_URL}/offers/update/${id}`,
    payload,
    getAuthHeaders()
  );
};

// Toggle Active / Deactivate
export const toggleOfferStatus = async (id) => {
  return await axios.patch(
    `${API_BASE_URL}/offers/toggle-status/${id}`,
    {},
    getAuthHeaders()
  );
};

// Permanent Delete
export const deleteOffer = async (id) => {
  return await axios.delete(
    `${API_BASE_URL}/offers/delete/${id}`,
    getAuthHeaders()
  );
};

export const checkApplicableOffer = async (payload) => {
  return await axios.post(
    `${API_BASE_URL}/offers/applicable`,
    payload,
    getAuthHeaders()
  );
};