import api from "../api/axios";


const BASE = "/brands";

export const getBrands = async (params = {}) => {
  const res = await api.get(`${BASE}/all`, { params });
  return res.data;
};

export const getBrandById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};


const buildFormData = (fields, logoFile) => {
  const fd = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, value);
  });

  if (logoFile) fd.append("logo", logoFile);

  return fd;
};

export const createBrand = async (fields, logoFile) => {
  const fd = buildFormData(fields, logoFile);

  const res = await api.post(`${BASE}/create`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};


export const updateBrand = async (id, fields, logoFile) => {
  const fd = buildFormData(fields, logoFile);

  const res = await api.put(`${BASE}/update/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};


export const toggleBrand = async (id) => {
  const res = await api.patch(`${BASE}/activate/${id}`);
  return res.data;
};

export const deleteBrand = async (id) => {
  const res = await api.delete(`${BASE}/delete/${id}`);
  return res.data;
};

const API_ORIGIN = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith("blob:")) {
    return imagePath;
  }
  return `${API_ORIGIN}${imagePath}`;
};