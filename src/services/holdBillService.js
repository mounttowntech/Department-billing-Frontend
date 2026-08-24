import axios from "axios";

const API_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const getHoldBills = async (params = {}) => {
  const response = await api.get("/hold-bills/all", {
    params,
  });

  return response.data;
};

export const getHoldBillById = async (id) => {
  const response = await api.get(`/hold-bills/${id}`);

  return response.data;
};

export const createHoldBill = async (data) => {
  const response = await api.post(
    "/hold-bills/create",
    data
  );

  return response.data;
};

export const updateHoldBill = async (id, data) => {
  const response = await api.put(
    `/hold-bills/update/${id}`,
    data
  );

  return response.data;
};

export const convertHoldBill = async (id) => {
  const response = await api.post(
    `/hold-bills/convert/${id}`
  );

  return response.data;
};

export const deleteHoldBill = async (id) => {
  const response = await api.delete(
    `/hold-bills/delete/${id}`
  );

  return response.data;
};

export const getCustomers = async () => {
  const response = await api.get("/customers/all");

  return response.data;
};


export const getProducts = async () => {
  const response = await api.get("/products/all");

  return response.data;
};

export const getProductVariants = async () => {
  const response = await api.get(
    "/product-variants/all"
  );

  return response.data;
};


export const getStores = async () => {
  const response = await api.get("/stores/all");

  return response.data;
};

export const getBatches = async () => {
  try {
    const response = await api.get("/batches/all");

    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        success: true,
        data: [],
      };
    }

    throw error;
  }
};

export default api;