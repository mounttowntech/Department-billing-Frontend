import api from "../api/axios";

export const getCoupons = async (params = {}) => {
  const response = await api.get("/coupons/all", {
    params,
  });

  return response.data;
};

export const getCouponById = async (id) => {
  const response = await api.get(`/coupons/${id}`);

  return response.data;
};

export const createCoupon = async (couponData) => {
  const response = await api.post(
    "/coupons/create",
    couponData
  );

  return response.data;
};

export const updateCoupon = async (id, couponData) => {
  const response = await api.put(
    `/coupons/update/${id}`,
    couponData
  );

  return response.data;
};

export const deleteCoupon = async (id) => {
  const response = await api.delete(
    `/coupons/delete/${id}`
  );

  return response.data;
};


export const validateCoupon = async (id) => {
  const response = await api.get(
    `/coupons/validate/${id}`
  );

  return response.data;
};


export const getCouponByCode = async (couponCode) => {
  const response = await api.get(
    `/coupons/code/${encodeURIComponent(couponCode)}`
  );

  return response.data;
};