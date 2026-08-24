import api from "../api/axios";

export const getBatches = async (params = {}) => {
  const response = await api.get("/batchs/all", { params });
  return response;
};

export const getBatchById = async (id) => {
  const response = await api.get(`/batchs/${id}`);
  return response;
};

export const createBatch = async (data) => {
  const response = await api.post("/batchs/create", data);
  return response;
};

export const updateBatch = async (id, data) => {
  const response = await api.put(`/batchs/update/${id}`, data);
  return response;
};

export const deleteBatch = async (id) => {
  const response = await api.delete(`/batchs/delete/${id}`);
  return response;
};

export const getExpiredBatches = async () => {
  const response = await api.get("/batchs/expired");
  return response;
};

export const getLowStockBatches = async () => {
  const response = await api.get("/batchs/low-stock");
  return response;
};

export const getBatchByBarcode = async (barcode) => {
  const response = await api.get(
    `/batchs/barcode/${barcode}`
  );
  return response;
};

export const getBatchesByProduct = async (productId) => {
  const response = await api.get(
    `/batchs/product/${productId}`
  );
  return response;
};