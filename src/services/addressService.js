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

export const getCustomerAddresses = async (params = {}) => {
  return await axios.get(`${API_BASE_URL}/customer-addresss/all`, {
    ...getAuthHeaders(),
    params,
  });
};

export const getCustomerAddressById = async (id) => {
  return await axios.get(
    `${API_BASE_URL}/customer-addresss/${id}`,
    getAuthHeaders()
  );
};

export const createCustomerAddress = async (payload) => {
  return await axios.post(
    `${API_BASE_URL}/customer-addresss/create`,
    payload,
    getAuthHeaders()
  );
};

export const updateCustomerAddress = async (id, payload) => {
  return await axios.put(
    `${API_BASE_URL}/customer-addresss/update/${id}`,
    payload,
    getAuthHeaders()
  );
};

export const activateCustomerAddress = async (id) => {
  return await axios.patch(
    `${API_BASE_URL}/customer-addresss/activate/${id}`,
    {},
    getAuthHeaders()
  );
};

export const deleteCustomerAddress = async (id) => {
  return await axios.delete(
    `${API_BASE_URL}/customer-addresss/delete/${id}`,
    getAuthHeaders()
  );
};