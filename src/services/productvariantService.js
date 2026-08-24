import api from "../api/axios";

export const getVariants = async (params = {}) => {
  const response = await api.get("/product-variants/all", { params });

  return response;
};


export const getVariantById = async (id) => {
  const response = await api.get(`/product-variants/${id}`);

  return response;
};

export const getVariantByBarcode = async (barcode, store) => {
  const response = await api.get(`/product-variants/barcode/${barcode}`, {
    params: store ? { store } : {},
  });

  return response;
};

export const createVariant = async (data) => {
  const response = await api.post("/product-variants/create", data);

  return response;
};

export const updateVariant = async (id, data) => {
  const response = await api.put(`/product-variants/update/${id}`, data);

  return response;
};


export const activateVariant = async (id) => {
  const response = await api.patch(`/product-variants/activate/${id}`);

  return response;
};

export const deactivateVariant = async (id) => {
  const response = await api.put(`/product-variants/update/${id}`, {
    status: "inactive",
  });

  return response;
};


export const deleteVariant = async (id) => {
  const response = await api.delete(`/product-variants/delete/${id}`);

  return response;
};


export const getLowStockVariants = async (params = {}) => {
  const response = await api.get("/product-variants/low-stock", { params });

  return response;
};

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const FILE_BASE = API_BASE.replace(/\/api\/?$/, "");

export const resolveVariantImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${FILE_BASE}${path}`;
};