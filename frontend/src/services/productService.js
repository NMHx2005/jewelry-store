import api from './api.js';

export const fetchProducts = (params) =>
  api.get('/products', {
    params,
  });

export const fetchProductBySlug = (slug) => api.get(`/products/${slug}`);

export const fetchFeaturedProducts = () =>
  api.get('/products', { params: { isFeatured: true, limit: 8 } });

export const fetchCategories = () => api.get('/categories');

export const fetchBanners = () => api.get('/cms/banners');


