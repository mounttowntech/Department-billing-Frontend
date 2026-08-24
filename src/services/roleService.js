import api from "../api/axios";


export const getRoles = async() => {
    const response = await api.get("/role-permissions/all");
    return response.data;
};

export const getAllRoles = async(params = {}) => {
    const response = await api.get("/role-permissions/all", {
        params,
    });

    return response.data;
};

export const getRoleById = async(id) => {
    const response = await api.get(`/role-permissions/${id}`);

    return response.data;
};


export const createRole = async(data) => {
    const response = await api.post(
        "/role-permissions/create",
        data
    );

    return response.data;
};


export const updateRole = async(id, data) => {
    const response = await api.put(
        `/role-permissions/update/${id}`,
        data
    );

    return response.data;
};


export const activateRole = async(id) => {
    const response = await api.patch(
        `/role-permissions/toggle/${id}`
    );

    return response.data;
};

export const deleteRole = async(id) => {
    const response = await api.delete(
        `/role-permissions/delete/${id}`
    );

    return response.data;
};