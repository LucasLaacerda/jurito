import axios from 'axios';
import axiosRetry from 'axios-retry';

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

// Interceptor para tratar erros de resposta
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento global de erros
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error('Erro de resposta:', error.response.status, error.response.data);
      
      // Você pode adicionar lógica específica para diferentes códigos de status
      if (error.response.status === 401) {
        // Não autorizado - redirecionar para login ou renovar token
      } else if (error.response.status === 404) {
        // Recurso não encontrado
      } else if (error.response.status >= 500) {
        // Erro do servidor
      }
    } else if (error.request) {
      // A requisição foi feita, mas não houve resposta
      console.error('Erro de requisição:', error.request);
    } else {
      // Algo aconteceu na configuração da requisição
      console.error('Erro:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 