import axiosInstance from '../utils/axios';

// Interface para os dados do voo
export interface VooData {
  relato: string;
  nome: string;
  cpf: string;
  email: string;
  cia: string;
  voo: string;
  origem: string;
  destino: string;
  data_voo: string;
  oferecido: string[];
  valor: string;
  cidade_estado: string;
  anexos: string[];
}

// Interface para os dados do formulário
export interface FormData {
  nome: string;
  email: string;
  telefone: string;
  tipoCaso: string;
  numeroVoo: string;
  dataVoo: string;
  companhiaAerea: string;
  descricao: string;
  valorCompensacao: string;
  origem: string;
  destino: string;
  cpf: string;
  cidadeEstado: string;
  oferecido: string[];
  anexos: string[];
}

// Função para converter os dados do formulário para o formato da API
export const convertFormDataToVooData = (formData: FormData): VooData => {
  return {
    relato: formData.descricao,
    nome: formData.nome,
    cpf: formData.cpf,
    email: formData.email,
    cia: formData.companhiaAerea,
    voo: formData.numeroVoo,
    origem: formData.origem,
    destino: formData.destino,
    data_voo: formData.dataVoo,
    oferecido: formData.oferecido,
    valor: formData.valorCompensacao,
    cidade_estado: formData.cidadeEstado,
    anexos: formData.anexos,
  };
};

// Função para lidar com erros de API
const handleApiError = (error: any, endpoint: string) => {
  console.error(`Erro ao chamar ${endpoint}:`, error);
  
  // Verificar se é um erro de timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    console.warn(`Timeout ao chamar ${endpoint}. Tentando novamente...`);
    return null; // Retorna null para permitir que o retry do axios-retry funcione
  }
  
  // Verificar se é um erro de rede
  if (!error.response) {
    console.error(`Erro de rede ao chamar ${endpoint}. Verifique sua conexão.`);
    return null;
  }
  
  // Verificar se é um erro do servidor
  if (error.response.status >= 500) {
    console.error(`Erro do servidor (${error.response.status}) ao chamar ${endpoint}.`);
    return null;
  }
  
  // Outros erros
  console.error(`Erro ao chamar ${endpoint}: ${error.message}`);
  return null;
};

// Função para fazer uma chamada à API com retry manual
const callApiWithRetry = async (endpoint: string, data: any, maxRetries = 2) => {
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      console.log(`Tentativa ${retries + 1} de ${maxRetries + 1} para ${endpoint}`);
      const response = await axiosInstance.post(endpoint, data);
      console.log(`Resposta de ${endpoint}:`, response.data);
      return response.data;
    } catch (error) {
      retries++;
      
      if (retries > maxRetries) {
        console.error(`Todas as tentativas para ${endpoint} falharam.`);
        return null;
      }
      
      console.warn(`Tentativa ${retries} falhou para ${endpoint}. Tentando novamente em 2 segundos...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return null;
};

// Serviço de API
const api = {
  // Rota para análise completa (modelo antigo unificado)
  avaliarCaso: async (data: VooData) => {
    try {
      console.log('Enviando dados para avaliar-caso:', data);
      const response = await axiosInstance.post('/avaliar-caso', data);
      console.log('Resposta de avaliar-caso:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'avaliar-caso');
    }
  },

  // Rotas modulares por agente
  gerarResumo: async (data: VooData) => {
    return callApiWithRetry('/gerar-resumo', data);
  },

  avaliarRegulacoes: async (data: VooData) => {
    return callApiWithRetry('/avaliar-regulacoes', data);
  },

  avaliarViabilidade: async (data: VooData) => {
    return callApiWithRetry('/avaliar-viabilidade', data);
  },

  calcularCompensacao: async (data: VooData) => {
    return callApiWithRetry('/calcular-compensacao', data);
  },

  gerarPlanoAcao: async (data: VooData) => {
    return callApiWithRetry('/gerar-plano-acao', data);
  },
};

export default api; 