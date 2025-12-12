import axios from 'axios';

const resolveBaseURL = () => {
  const envUrl = import.meta.env.BACKEND_URL;
  if (envUrl) {
    return envUrl;
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api';
  }

  const { protocol, hostname } = window.location;
  const isLocalHostname = ['localhost', '127.0.0.1'].includes(hostname);
  const isIpAddress = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
  const port = isLocalHostname || isIpAddress ? ':5000' : '';

  return `${protocol}//${hostname}${port}/api`;
};

export const API = axios.create({
  baseURL: resolveBaseURL(),
});

if (typeof window !== 'undefined') {
  API.interceptors.request.use((config) => {
    const token = window.localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const fetchProfile = () => API.get('/profile/me');
export const updateProfile = (data) =>
  API.put('/profile/me', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const fetchAdminDashboard = () => API.get('/admin/dashboard');
export const fetchAnnouncements = () => API.get('/announcements');
export const fetchAdminBroadcasts = () => API.get('/admin/broadcasts');
export const sendAdminBroadcast = (message) => API.post('/admin/broadcasts', { message });
export const inviteNutritionist = (email) => API.post('/admin/invitations', { email });
export const createAdminTask = (payload) => API.post('/admin/tasks', payload);
export const reviewMemberPlan = (userId) => API.post(`/admin/users/${userId}/review`);
export const impersonateMember = (userId) => API.post(`/admin/users/${userId}/impersonate`);
export const resetMemberPassword = (userId) => API.post(`/admin/users/${userId}/reset-password`);
export const resolveFlaggedReport = (reportId) => API.delete(`/admin/reports/${reportId}`);
export const removeOperationsTask = (taskId) => API.delete(`/admin/tasks/${taskId}`);
