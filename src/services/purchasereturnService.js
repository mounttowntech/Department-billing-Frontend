import axios from "axios";

const API_URL = "/api/purchase-returns";

const purchaseReturnService = {
  getAll: async (params = {}) => {
    const response = await axios.get(`${API_URL}/all`, {
      params,
    });

    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);

    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(`${API_URL}/create`, data);

    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/update/${id}`, data);

    return response.data;
  },

  updateStatus: async (id, returnStatus) => {
    const response = await axios.patch(`${API_URL}/${id}/status`, {
      returnStatus,
    });

    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/delete/${id}`);

    return response.data;
  },
};

export default purchaseReturnService;