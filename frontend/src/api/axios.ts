import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // asegúrate que coincide con tu backend
});

// Interceptor para incluir el token JWT en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (!config.headers) {
    config.headers = {};
  }

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // ✅ corregido
  }

  return config;
});

export default api;
