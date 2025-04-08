import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { toast } from 'react-hot-toast';

// Configuração global do axios
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_JURITO_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Aumentando para 60 segundos
});

// Configuração de retry para lidar com falhas temporárias
axiosRetry(axiosInstance, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: AxiosError) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error instanceof Error && error.message.includes('timeout'));
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

// Interceptor para tratar erros de resposta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    const errorMessage = error.response?.data?.message || error.message || 'Ocorreu um erro na requisição';
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default axiosInstance; 