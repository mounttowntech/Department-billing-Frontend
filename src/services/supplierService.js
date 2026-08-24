import api from "../api/axios";

export const getSuppliers = async (params = {}) => {
  const response = await api.get("/suppliers/all", {
    params,
  });

  return response.data;
};

export const getSupplierById = async (id) => {
  const response = await api.get(`/suppliers/${id}`);

  return response.data;
};

export const createSupplier = async (data) => {
  const response = await api.post("/suppliers/create", data);

  return response.data;
};

export const updateSupplier = async (id, data) => {
  const response = await api.put(`/suppliers/update/${id}`, data);

  return response.data;
};

export const deleteSupplier = async (id) => {
  const response = await api.delete(`/suppliers/delete/${id}`);

  return response.data;
};

export const activateSupplier = async (id) => {
  const response = await api.patch(`/suppliers/activate/${id}`);

  return response.data;
};