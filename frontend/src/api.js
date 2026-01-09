import axios from 'axios';

// Connect to your FastAPI Backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// Automatically add the Token to every request if we are logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;