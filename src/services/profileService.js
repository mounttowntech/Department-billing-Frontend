import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const getMyProfile = async () => {
  const response = await axios.get(
    `${API_URL}/profile`
  );

  return response.data;
};

export const updateMyProfile = async (data) => {
  const response = await axios.put(
    `${API_URL}/profile/update`,
    data
  );

  return response.data;
};

export const changePassword = async (data) => {
  const response = await axios.put(
    `${API_URL}/profile/change-password`,
    data
  );

  return response.data;
};