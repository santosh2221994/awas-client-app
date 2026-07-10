import axios from 'axios';
import { useSessionStore } from '../stores/useSessionStore';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request logging middleware
client.interceptors.request.use((config) => {
  const token = useSessionStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log request
  console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, {
    params: config.params,
    data: config.data,
    headers: config.headers,
  });
  
  return config;
});

// Response logging middleware
client.interceptors.response.use(
  (res) => {
    console.log(`[API RESPONSE] ${res.status} ${res.config.url}`, {
      data: res.data,
      headers: res.headers,
    });
    return res.data;
  },
  (error) => {
    console.error(`[API ERROR] ${error.response?.status || 'Unknown'} ${error.config?.url}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      stack: error.stack,
    });
    
    if (error.response?.status === 401) {
      useSessionStore.getState().logout();
    }
    return Promise.reject({
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
  }
);

export default client;
