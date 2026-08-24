import api from "../api/axios";

export const getProducts = async () => {
  const response = await api.get("/products/all");

  return response;
};


export const getProduct = async (params = {}) => {
  const response = await api.get("/products/all", {
    params,
  });

  return response;
};

export const createProduct = async (data) => {
  const response = await api.post(
    "/products/create",
    data
  );

  return response;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(
    `/products/update/${id}`,
    data
  );

  return response;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(
    `/products/delete/${id}`
  );

  return response;
};

export const getLowStockProducts = async () => {
  const response = await api.get(
    "/products/low-stock"
  );

  return response;
};

export const getTopProducts = async () => {
  const response = await api.get(
    "/products/top-products"
  );

  return response;
};

export const activateProduct = async (id) => {
  const response = await api.patch(
    `/products/activate/${id}`
  );

  return response;
};

export const deactivateProduct = async (id) => {
  const response = await api.patch(
    `/products/deactivate/${id}`
  );

  return response;
};

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const FILE_BASE = API_BASE.replace(/\/api\/?$/, "");

export const resolveProductImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${FILE_BASE}${path}`;
};