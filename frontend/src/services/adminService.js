import api from './api.js';

// ─── Products ──────────────────────────────────────────────
export const adminGetProducts = (params) =>
  api.get('/products', { params: { showAll: 'true', ...params } });
export const adminCreateProduct = (data) => api.post('/products', data);
export const adminUpdateProduct = (id, data) => api.put(`/products/${id}`, data);
export const adminDeleteProduct = (id) => api.delete(`/products/${id}`);
export const adminUploadProductImages = (id, formData) =>
  api.post(`/products/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ─── Categories ────────────────────────────────────────────
export const adminGetCategories = () => api.get('/categories');
export const adminCreateCategory = (data) => api.post('/categories', data);
export const adminUpdateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const adminDeleteCategory = (id) => api.delete(`/categories/${id}`);

// ─── Orders ────────────────────────────────────────────────
export const adminGetOrders = (params) => api.get('/orders', { params });
export const adminGetOrderById = (id) => api.get(`/orders/${id}`);
export const adminUpdateOrderStatus = (id, orderStatus) =>
  api.put(`/orders/${id}/status`, { orderStatus });

// ─── CMS ───────────────────────────────────────────────────
export const adminGetBanners = () => api.get('/cms/banners');
export const adminCreateBanner = (data) => api.post('/cms/banners', data);
export const adminUpdateBanner = (id, data) => api.put(`/cms/banners/${id}`, data);
export const adminDeleteBanner = (id) => api.delete(`/cms/banners/${id}`);
export const adminGetSettings = () => api.get('/cms/settings');
export const adminUpdateSettings = (data) => api.put('/cms/settings', data);

// ─── Upload ────────────────────────────────────────────────
export const adminUploadImage = (formData) =>
  api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
