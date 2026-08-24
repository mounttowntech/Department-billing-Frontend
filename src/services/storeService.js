import api from "../api/axios";

export const getPublicStores = async () => {
  const response = await api.get("/stores/public");
  return response.data;
};

export const getStores = async (params = {}) => {
  const response = await api.get("/stores/all", {
    params,
  });

  return response.data;
};


export const getStoreById = async (id) => {
  const response = await api.get(`/stores/${id}`);
  return response.data;
};

export const createStore = async (storeData) => {
  const response = await api.post("/stores/create", storeData);
  return response.data;
};


export const updateStore = async (id, storeData) => {
  const response = await api.put(`/stores/update/${id}`, storeData);
  return response.data;
};

export const activateStore = async (id) => {
  const response = await api.patch(`/stores/activate/${id}`);
  return response.data;
};

export const deleteStore = async (id) => {
  const response = await api.delete(`/stores/delete/${id}`);
  return response.data;
};

export const getManagers = async () => {
  const response = await api.get("/users/all");
  return response.data;
};