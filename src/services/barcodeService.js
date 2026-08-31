import api from "../api/axios";

export const getBarcodes = async (params = {}) => {
  const response = await api.get("/barcodes/all", { params });
  return response;
};

export const getBarcodeById = async (id) => {
  const response = await api.get(`/barcodes/${id}`);
  return response;
};

export const createBarcode = async (data) => {
  const response = await api.post("/barcodes/create", data);
  return response;
};

export const updateBarcode = async (id, data) => {
  const response = await api.put(`/barcodes/update/${id}`, data);
  return response;
};

export const deactivateBarcode = async (id) => {
  const response = await api.put(`/barcodes/update/${id}`, {
    status: false,
  });
  return response;
};

export const activateBarcode = async (id) => {
  const response = await api.put(`/barcodes/update/${id}`, {
    status: true,
  });
  return response;
};

export const deleteBarcode = async (id) => {
  const response = await api.delete(`/barcodes/delete/${id}`);
  return response;
};