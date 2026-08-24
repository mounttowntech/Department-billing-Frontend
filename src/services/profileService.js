import axios from "axios";

const API_URL = "http://localhost:5001/api/profile"; // உங்கள் Backend URL


export const getMyProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


export const updateMyProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`${API_URL}/update`, profileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


export const changePassword = async (passwordData) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`${API_URL}/change-password`, passwordData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};