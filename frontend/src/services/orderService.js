import api from './api.js';

export const createOrder = (payload) => api.post('/orders', payload);

