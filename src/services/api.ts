import axios from 'axios';

export const api = axios.create({
  // Puxa automaticamente a URL do seu .env
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor: Antes de qualquer requisição sair do Front, ele executa isso
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});