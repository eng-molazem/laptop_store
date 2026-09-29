import api from './client';

export const getSettings = () => api.get('/settings').then((r) => r.data);
export const getCategories = () => api.get('/categories').then((r) => r.data);
export const getCategoryAttributesBySlug = (slug) => api.get(`/categories/${slug}/attributes`).then((r) => r.data);

export const getProducts = (params) => api.get('/products', { params }).then((r) => r.data);
export const getFilterOptions = (params) => api.get('/products/filters/options', { params }).then((r) => r.data);
export const getProductBySlug = (slug) => api.get(`/products/${slug}`).then((r) => r.data);
export const getProductsByIds = (ids) => api.get('/products/compare', { params: { ids: ids.join(',') } }).then((r) => r.data);

export const postReview = (productId, data) => api.post(`/products/${productId}/reviews`, data).then((r) => r.data);
export const reportReview = (reviewId, reason) => api.post(`/reviews/${reviewId}/report`, { reason }).then((r) => r.data);

export const getPaymentMethods = () => api.get('/payment-methods').then((r) => r.data);

export const validateCoupon = (code, subtotal) => api.post('/coupons/validate', { code, subtotal }).then((r) => r.data);

export const getCart = (guestId) => api.get(`/cart/${guestId}`).then((r) => r.data);
export const saveCart = (guestId, data) => api.put(`/cart/${guestId}`, data).then((r) => r.data);

export const createOrder = (data) => api.post('/orders', data).then((r) => r.data);
export const submitPaymentRequest = (orderId, formData) =>
  api
    .post(`/orders/${orderId}/payment-requests`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);
export const trackOrder = (orderId, phone) => api.get(`/orders/${orderId}/track`, { params: { phone } }).then((r) => r.data);

export const subscribeNewsletter = (email) => api.post('/newsletter', { email }).then((r) => r.data);
