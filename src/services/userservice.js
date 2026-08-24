import api from "../api/axios";

export const getUsers = async (params = {}) => {

    const response = await api.get("/users/all", {
        params,
    });

    return response.data;

};


export const getUserById = async (id) => {

    const response = await api.get(`/users/${id}`);

    return response.data;

};

export const createUser = async (userData) => {

    const response = await api.post(
        "/users/create",
        userData
    );

    return response.data;

};

export const updateUser = async (
    id,
    userData
) => {

    const response = await api.put(
        `/users/update/${id}`,
        userData
    );

    return response.data;

};


export const blockUser = async (id) => {

    const response = await api.patch(
        `/users/block/${id}`
    );

    return response.data;

};


export const activateUser = async (id) => {

    const response = await api.patch(
        `/users/activate/${id}`
    );

    return response.data;

};

export const deleteUser = async (id) => {

    const response = await api.delete(
        `/users/delete/${id}`
    );

    return response.data;

};

export const toggleUserStatus = async (id) => {
  const response = await api.patch(`/users/toggle/${id}`);
  return response.data;
};