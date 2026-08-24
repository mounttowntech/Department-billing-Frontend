import api from "../api/axios";

export const getCustomers = async (params = {}) => {
  return api.get("/customers/all", {
    params,
  });
};

export const getCustomerById = async (id) => {
  return api.get(`/customers/${id}`);
};

export const createCustomer = async (data) => {
  return api.post("/customers/create", data);
};

export const updateCustomer = async (id, data) => {
  return api.put(`/customers/update/${id}`, data);
};

export const deleteCustomer = async (id) => {
  return api.delete(`/customers/delete/${id}`);
};


export const toggleCustomerStatus = async (id) => {
  return api.put(`/customers/toggle-status/${id}`);
};