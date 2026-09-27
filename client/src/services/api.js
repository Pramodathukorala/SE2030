import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && error.config?.url !== '/auth/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);

// Accounts
export const getMyAccount = () => api.get('/accounts/my-account');

// Transactions
export const transferFunds = (data) => api.post('/transactions/transfer', data);
export const getMyTransactions = (params) => api.get('/transactions/my-transactions', { params });
export const getTransactionByReference = (refNumber) => api.get(`/transactions/reference/${refNumber}`);
export const getTransactionById = (id) => api.get(`/transactions/${id}`);

// Complaints
export const createComplaint = (data) => api.post('/complaints', data);
export const getMyComplaints = (params) => api.get('/complaints/my-complaints', { params });
export const getComplaintById = (id) => api.get(`/complaints/${id}`);
export const getAssignedComplaints = (params) => api.get('/complaints/assigned', { params });
export const updateComplaintStatus = (id, data) => api.put(`/complaints/${id}/status`, data);
export const escalateComplaint = (id) => api.put(`/complaints/${id}/escalate`);
export const resolveComplaint = (id) => api.put(`/complaints/${id}/resolve`);
export const closeComplaint = (id) => api.put(`/complaints/${id}/close`);
export const getEscalatedComplaints = (params) => api.get('/complaints/escalated', { params });
export const addManagerNotes = (id, data) => api.put(`/complaints/${id}/manager-notes`, data);

// Notifications
export const getMyNotifications = () => api.get('/notifications');
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => api.patch('/notifications/read-all');

// Dashboard
export const getCustomerDashboard = () => api.get('/dashboard/customer');
export const getOfficerDashboard = () => api.get('/dashboard/officer');
export const getManagerDashboard = () => api.get('/dashboard/manager');
export const getAdminDashboard = () => api.get('/dashboard/admin');

// Admin
export const getAllUsers = (params) => api.get('/admin/users', { params });
export const getUserById = (id) => api.get(`/admin/users/${id}`);
export const createStaffUser = (data) => api.post('/admin/users', data);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role });
export const updateUserStatus = (id, status) => api.put(`/admin/users/${id}/status`, { status });

export default api;
