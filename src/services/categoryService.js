import api from "../api/axios";

const BASE = "/department-categories";

export const getCategories = async (params = {}) => {
  const res = await api.get(`${BASE}/all`, { params });
  return res.data;
};

export const getCategoryById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

const buildFormData = (fields, imageFile, iconFile) => {
  const fd = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, value);
  });

  if (imageFile) fd.append("image", imageFile);
  if (iconFile) fd.append("icon", iconFile);

  return fd;
};

export const createCategory = async (fields, imageFile, iconFile) => {
  const fd = buildFormData(fields, imageFile, iconFile);

  const res = await api.post(`${BASE}/create`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};


export const updateCategory = async (id, fields, imageFile, iconFile) => {
  const fd = buildFormData(fields, imageFile, iconFile);

  const res = await api.put(`${BASE}/update/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};


export const toggleCategory = async (id) => {
  const res = await api.patch(`${BASE}/activate/${id}`);
  return res.data;
};

export const deleteCategory = async (id) => {
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