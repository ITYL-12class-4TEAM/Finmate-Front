import api from './index';

export const getProductsAPI = async () => {
  const res = await api.get(`/api/products`);

  return res.data.body.data;
};

export const getProductsCategoriesAPI = async () => {
  const res = await api.get(`/api/products/categories`);

  return res.data.body.data;
};
