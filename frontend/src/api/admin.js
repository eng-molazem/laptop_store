import api from './client';

export const adminLogin = (email, password) => api.post('/admin/login', { email, password }).then((r) => r.data);
export const adminMe = () => api.get('/admin/me').then((r) => r.data);

export const getStats = () => api.get('/admin/stats').then((r) => r.data);

export const getAdminProducts = () => api.get('/admin/products').then((r) => r.data);
export const getAdminProduct = (id) => api.get(`/admin/products/${id}`).then((r) => r.data);
export const createProduct = (formData) =>
  api.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
export const updateProduct = (id, formData) =>
  api.put(`/admin/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`).then((r) => r.data);

export const getAdminCategories = () => api.get('/admin/categories').then((r) => r.data);
export const createCategory = (data) => api.post('/admin/categories', data).then((r) => r.data);
export const updateCategory = (id, data) => api.put(`/admin/categories/${id}`, data).then((r) => r.data);
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data);

export const getCategoryAttributes = (categoryId) =>
  api.get('/admin/category-attributes', { params: { category: categoryId } }).then((r) => r.data);
export const createCategoryAttribute = (data) => api.post('/admin/category-attributes', data).then((r) => r.data);
export const updateCategoryAttribute = (id, data) => api.put(`/admin/category-attributes/${id}`, data).then((r) => r.data);
export const deleteCategoryAttribute = (id) => api.delete(`/admin/category-attributes/${id}`).then((r) => r.data);

export const getAdminOrders = (params) => api.get('/admin/orders', { params }).then((r) => r.data);
export const getAdminOrder = (id) => api.get(`/admin/orders/${id}`).then((r) => r.data);
export const updateOrderStatus = (id, status, note) => api.patch(`/admin/orders/${id}/status`, { status, note }).then((r) => r.data);

export const getAdminPaymentRequests = (params) => api.get('/admin/payment-requests', { params }).then((r) => r.data);
export const approvePaymentRequest = (id) => api.patch(`/admin/payment-requests/${id}/approve`).then((r) => r.data);
export const rejectPaymentRequest = (id, rejectionReason) =>
  api.patch(`/admin/payment-requests/${id}/reject`, { rejectionReason }).then((r) => r.data);

export const getAdminPaymentMethods = () => api.get('/admin/payment-methods').then((r) => r.data);
export const createPaymentMethod = (formData) =>
  api.post('/admin/payment-methods', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
export const updatePaymentMethod = (id, formData) =>
  api.put(`/admin/payment-methods/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
export const deletePaymentMethod = (id) => api.delete(`/admin/payment-methods/${id}`).then((r) => r.data);

export const getAdminCoupons = () => api.get('/admin/coupons').then((r) => r.data);
export const createCoupon = (data) => api.post('/admin/coupons', data).then((r) => r.data);
export const updateCoupon = (id, data) => api.put(`/admin/coupons/${id}`, data).then((r) => r.data);
export const deleteCoupon = (id) => api.delete(`/admin/coupons/${id}`).then((r) => r.data);

export const getAdminReviews = (reported) => api.get('/admin/reviews', { params: { reported } }).then((r) => r.data);
export const hideReview = (id) => api.patch(`/admin/reviews/${id}/hide`).then((r) => r.data);
export const unhideReview = (id) => api.patch(`/admin/reviews/${id}/unhide`).then((r) => r.data);
export const deleteReviewAdmin = (id) => api.delete(`/admin/reviews/${id}`).then((r) => r.data);

export const getAdminSettings = () => api.get('/admin/settings').then((r) => r.data);
export const updateAdminSettings = (data) => api.put('/admin/settings', data).then((r) => r.data);

export const getAdmins = () => api.get('/admin/admins').then((r) => r.data);
export const createAdmin = (data) => api.post('/admin/admins', data).then((r) => r.data);
export const updateAdmin = (id, data) => api.put(`/admin/admins/${id}`, data).then((r) => r.data);
export const deleteAdmin = (id) => api.delete(`/admin/admins/${id}`).then((r) => r.data);

export const getAuditLog = (params) => api.get('/admin/audit-log', { params }).then((r) => r.data);

async function downloadCsv(path, filename) {
  const res = await api.get(path, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const exportOrdersCsv = () => downloadCsv('/admin/export/orders.csv', 'orders.csv');
export const exportPaymentRequestsCsv = () => downloadCsv('/admin/export/payment-requests.csv', 'payment-requests.csv');
