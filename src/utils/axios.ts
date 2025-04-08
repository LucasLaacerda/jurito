import axios from 'axios';
import axiosRetry from 'axios-retry';
import { toast } from 'react-hot-toast';

// Configuração global do axios
const axiosInstance = axios.create({
  baseURL: 'https://web-production-192c4.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Aumentando para 60 segundos
});

// Configuração de retry para lidar com falhas temporárias
axiosRetry(axiosInstance, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: any) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.code === 'ECONNABORTED' || 
           error.message.includes('timeout');
  }
});

// Interceptor para adicionar headers de autenticação se necessário
axiosInstance.interceptors.request.use(
  (config) => {
    // Aqui você pode adicionar tokens de autenticação se necessário
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

// Interceptor para tratar erros de resposta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorMessage = error.response?.data?.message || error.message;
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default axiosInstance; 