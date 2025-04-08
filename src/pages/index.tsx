"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Plane, ArrowRight, FileText, Percent, Shield, Zap, Globe } from "lucide-react";
import LoadingDots from "../components/LoadingDots";
import DropDown, { CasoType } from "../components/DropDown";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import api, { convertFormDataToVooData } from '../services/api';

// Variantes de animação para as transições
const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const pageTransition = {
  type: "tween",
  duration: 0.5
};

// Variantes de animação para dispositivos móveis
const mobilePageVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 500 : -500,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    y: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    y: direction < 0 ? 500 : -500,
    opacity: 0
  })
};

// Adicionar estilos personalizados para a barra de rolagem
const customStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'pt', ['common'])),
    },
  };
};

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  tipoCaso: CasoType;
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
  [key: string]: string | string[] | CasoType;
}

export default function Home() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // Começamos com o step 0 (tela inicial)
  const [[page, direction], setPage] = useState([0, 0]);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    telefone: "",
    tipoCaso: "Voo Atrasado" as CasoType,
    numeroVoo: "",
    dataVoo: "",
    companhiaAerea: "",
    descricao: "",
    valorCompensacao: "",
    origem: "",
    destino: "",
    cpf: "",
    cidadeEstado: "",
    oferecido: [] as string[],
    anexos: [] as string[],
  });
  const [resultado, setResultado] = useState({
    peticao: "",
    probabilidadeVitoria: 0,
    valorEstimado: 0,
    instrucoes: "",
    resumo: "",
    regulacoes: "",
    planoAcao: "",
  });

  // Verificar se é dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Verificar inicialmente
    checkIfMobile();
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkIfMobile);
    
    // Limpar listener ao desmontar
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoCasoChange = (tipo: CasoType) => {
    setFormData((prev) => ({ ...prev, tipoCaso: tipo }));
  };

  const handleOferecidoChange = (opcao: string) => {
    setFormData((prev) => {
      const oferecido = [...prev.oferecido];
      if (oferecido.includes(opcao)) {
        return { ...prev, oferecido: oferecido.filter(item => item !== opcao) };
      } else {
        return { ...prev, oferecido: [...oferecido, opcao] };
      }
    });
  };

  const handleAnexoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map(file => file.name);
      setFormData((prev) => ({ ...prev, anexos: [...prev.anexos, ...fileNames] }));
    }
  };

  const removeAnexo = (index: number) => {
    setFormData((prev) => {
      const anexos = [...prev.anexos];
      anexos.splice(index, 1);
      return { ...prev, anexos };
    });
  };

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleNextStep = () => {
    if (step === 0) {
      setStep(1);
      paginate(1);
    } else if (step < 3) {
      setStep(step + 1);
      paginate(1);
    } else {
      setLoading(true);
      
      // Preparar dados para envio ao backend
      const dadosParaEnvio = convertFormDataToVooData(formData);
      
      // Chamar todos os endpoints em paralelo usando o serviço de API
      Promise.allSettled([
        api.gerarResumo(dadosParaEnvio),
        api.avaliarRegulacoes(dadosParaEnvio),
        api.avaliarViabilidade(dadosParaEnvio),
        api.calcularCompensacao(dadosParaEnvio),
        api.gerarPlanoAcao(dadosParaEnvio),
      ])
        .then((results) => {
          console.log("Resultados das chamadas à API:", results);
          
          // Extrair os resultados bem-sucedidos
          const resumo = results[0].status === 'fulfilled' ? results[0].value : null;
          const regulacoes = results[1].status === 'fulfilled' ? results[1].value : null;
          const viabilidade = results[2].status === 'fulfilled' ? results[2].value : null;
          const compensacao = results[3].status === 'fulfilled' ? results[3].value : null;
          const planoAcao = results[4].status === 'fulfilled' ? results[4].value : null;
          
          // Verificar quantos endpoints falharam
          const falhas = results.filter(r => r.status === 'rejected').length;
          
          // Se todos os endpoints falharam, mostrar erro
          if (falhas === results.length) {
            toast.error("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
            setLoading(false);
            return;
          }
          
          // Se alguns endpoints falharam, mostrar aviso
          if (falhas > 0) {
            toast("Alguns dados não puderam ser carregados. Continuando com informações disponíveis.");
          }
          
          // Gerar a petição com base nos dados e respostas da API
          const peticao = gerarPeticao(
            formData, 
            resumo?.resposta || "Não foi possível gerar o resumo.", 
            regulacoes?.resposta || "Não foi possível avaliar as regulamentações."
          );
          
          // Extrair probabilidade e valor estimado, com fallbacks
          const probabilidadeVitoria = viabilidade?.resposta 
            ? extrairProbabilidade(viabilidade.resposta) 
            : 85; // Valor padrão
          
          const valorEstimado = compensacao?.resposta 
            ? extrairValor(compensacao.resposta) 
            : parseFloat(formData.valorCompensacao) * 3; // Valor padrão
          
          // Gerar instruções padrão se não houver resposta
          const instrucoesPadrao = "1. Imprima a petição em 3 vias\n2. Assine todas as vias\n3. Apresente na vara cível do seu município\n4. Guarde uma via para seus registros\n5. Acompanhe o processo pelo número que será fornecido no protocolo";
          
          setResultado({
            peticao,
            probabilidadeVitoria,
            valorEstimado,
            instrucoes: planoAcao?.resposta || instrucoesPadrao,
            resumo: resumo?.resposta || "Não foi possível gerar o resumo.",
            regulacoes: regulacoes?.resposta || "Não foi possível avaliar as regulamentações.",
            planoAcao: planoAcao?.resposta || "Não foi possível gerar o plano de ação.",
          });
          
          setLoading(false);
          setStep(4);
          paginate(1);
        })
        .catch(error => {
          console.error("Erro ao processar os dados:", error);
          toast.error("Ocorreu um erro ao processar seus dados. Tente novamente.");
          setLoading(false);
        });
    }
  };

  // Função para extrair a probabilidade de sucesso do texto da resposta
  const extrairProbabilidade = (texto: string): number => {
    // Tenta encontrar um número de 0 a 100 seguido de % no texto
    const match = texto.match(/(\d+)%/);
    if (match && match[1]) {
      const valor = parseInt(match[1], 10);
      return isNaN(valor) ? 85 : Math.min(100, Math.max(0, valor));
    }
    return 85; // Valor padrão se não encontrar
  };

  // Função para extrair o valor de compensação do texto da resposta
  const extrairValor = (texto: string): number => {
    // Tenta encontrar um valor monetário no formato R$ X.XXX,XX ou R$ XXXX,XX
    const match = texto.match(/R\$\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/);
    if (match && match[1]) {
      const valorStr = match[1].replace('.', '').replace(',', '.');
      const valor = parseFloat(valorStr);
      return isNaN(valor) ? parseFloat(formData.valorCompensacao) * 3 : valor;
    }
    return parseFloat(formData.valorCompensacao) * 3; // Valor padrão se não encontrar
  };

  // Função para gerar a petição com base nos dados e respostas da API
  const gerarPeticao = (dados: FormData, resumo: string, regulacoes: string) => {
    return `PETIÇÃO INICIAL\n\nExmo(a) Sr(a). Dr(a). Juiz(a) de Direito da Vara Cível da Comarca de São Paulo\n\n${dados.nome}, brasileiro(a), portador(a) da Cédula de Identidade RG nº XXX.XXX.XXX-X, inscrito(a) no CPF sob nº XXX.XXX.XXX-XX, residente e domiciliado(a) na Rua Exemplo, nº 123, Bairro Centro, São Paulo/SP, vem, respeitosamente, à presença de Vossa Excelência, propor a presente AÇÃO DE INDENIZAÇÃO POR DANOS MATERIAIS E MORAIS em face de ${dados.companhiaAerea}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº XX.XXX.XXX/0001-XX, com sede na Rua da Companhia, nº 456, Bairro Aeroporto, São Paulo/SP, pelos fatos e fundamentos a seguir expostos:\n\nFATOS\n\n${resumo}\n\nDIREITO\n\n${regulacoes}\n\nPEDIDO\n\nAnte o exposto, requer:\n\n1. A citação da ré, na forma da lei;\n\n2. A inversão do ônus da prova, nos termos do art. 6º, VIII, do CDC;\n\n3. A condenação da ré ao pagamento de indenização por danos materiais no valor de R$ ${dados.valorCompensacao}, a título de reembolso do valor da passagem e despesas adicionais;\n\n4. A condenação da ré ao pagamento de indenização por danos morais no valor de R$ ${(parseFloat(dados.valorCompensacao) * 2).toFixed(2)}, a título de compensação pelos transtornos sofridos;\n\n5. A concessão dos benefícios da justiça gratuita, nos termos da Lei 1.060/50;\n\n6. A inversão do ônus da prova, nos termos do art. 6º, VIII, do CDC;\n\n7. A concessão dos benefícios da justiça gratuita, nos termos da Lei 1.060/50.\n\nNestes termos,\nPede deferimento.\n\nSão Paulo, ${new Date().toLocaleDateString('pt-BR')}.\n\n${dados.nome}\nCPF: XXX.XXX.XXX-XX`;
  };

  const handleBackStep = () => {
    if (step > 0) {
      setStep(step - 1);
      paginate(-1);
    }
  };

  const handleVoltarAoInicio = () => {
    setStep(0);
    setPage([0, 0]);
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      tipoCaso: "Voo Atrasado",
      numeroVoo: "",
      dataVoo: "",
      companhiaAerea: "",
      descricao: "",
      valorCompensacao: "",
      origem: "",
      destino: "",
      cpf: "",
      cidadeEstado: "",
      oferecido: [],
      anexos: [],
    });
    setResultado({
      peticao: "",
      probabilidadeVitoria: 0,
      valorEstimado: 0,
      instrucoes: "",
      resumo: "",
      regulacoes: "",
      planoAcao: "",
    });
  };

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value;
    router.push(router.pathname, router.asPath, { locale });
  };

  // Função para converter o tipo de caso para a chave de tradução
  const getTranslationKey = (tipo: string) => {
    switch (tipo) {
      case "Voo Atrasado":
        return "voo_atrasado";
      case "Voo Cancelado":
        return "voo_cancelado";
      case "Bagagem Extraviada":
        return "bagagem_extraviada";
      case "Overbooking":
        return "overbooking";
      case "Outro":
        return "outro";
      default:
        return tipo.toLowerCase().replace(' ', '_');
    }
  };

  // Função para obter o texto traduzido
  const getTranslatedText = (tipo: string) => {
    const key = getTranslationKey(tipo);
    return t(`form.flight.options.${key}`);
  };

  const renderStep = () => {
    // Usar variantes diferentes para mobile e desktop
    const variants = isMobile ? mobilePageVariants : pageVariants;
    
    switch (step) {
      case 0:
        return (
          <motion.div
            key="welcome"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="w-full max-w-3xl mx-auto text-center px-4 sm:px-6 h-full flex flex-col justify-start"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-2"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center mx-auto mb-1"
              >
                <Image 
                  src="/images/logo.png" 
                  alt="Jurito Logo" 
                  width={224}
                  height={224}
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2"
              >
                {t('welcome.title')}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-4"
              >
                {t('welcome.subtitle')}
              </motion.p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6"
            >
              <motion.div 
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-dark-900/80 rounded-xl p-4 sm:p-6 border border-white/10"
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg mb-3 sm:mb-4 mx-auto">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{t('welcome.features.legal.title')}</h3>
                <p className="text-sm sm:text-base text-white/70">
                  {t('welcome.features.legal.description')}
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-dark-900/80 rounded-xl p-4 sm:p-6 border border-white/10"
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg mb-3 sm:mb-4 mx-auto">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{t('welcome.features.fast.title')}</h3>
                <p className="text-sm sm:text-base text-white/70">
                  {t('welcome.features.fast.description')}
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-dark-900/80 rounded-xl p-4 sm:p-6 border border-white/10"
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg mb-3 sm:mb-4 mx-auto">
                  <Percent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{t('welcome.features.probability.title')}</h3>
                <p className="text-sm sm:text-base text-white/70">
                  {t('welcome.features.probability.description')}
                </p>
              </motion.div>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextStep}
              className="bg-white text-dark-950 px-8 py-4 rounded-xl hover:bg-white/90 transition-colors flex items-center mx-auto text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              {t('welcome.cta')}
              <ArrowRight className="h-5 w-5 ml-2" />
            </motion.button>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            key="personal"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="w-full max-w-md mx-auto px-4 sm:px-0 h-full flex flex-col justify-start pt-2"
          >
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl sm:text-2xl font-bold text-white mb-4"
            >
              {t('form.personal.title')}
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-3"
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label className="block text-sm text-white/60 mb-1">{t('form.personal.name')}</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 focus:border-white/20 focus:ring-white/10"
                  placeholder={t('form.personal.name')}
                />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <label className="block text-sm text-white/60 mb-1">{t('form.personal.email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 focus:border-white/20 focus:ring-white/10"
                  placeholder={t('form.personal.email')}
                />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <label className="block text-sm text-white/60 mb-1">{t('form.personal.phone')}</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 focus:border-white/20 focus:ring-white/10"
                  placeholder={t('form.personal.phone')}
                />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <label className="block text-sm text-white/60 mb-1">{t('form.personal.cpf')}</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 focus:border-white/20 focus:ring-white/10"
                  placeholder={t('form.personal.cpf')}
                />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <label className="block text-sm text-white/60 mb-1">{t('form.personal.city')}</label>
                <input
                  type="text"
                  name="cidadeEstado"
                  value={formData.cidadeEstado}
                  onChange={handleInputChange}
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 focus:border-white/20 focus:ring-white/10"
                  placeholder={t('form.personal.city')}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="flight"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="w-full max-w-md mx-auto px-4 sm:px-0 h-full flex flex-col justify-start pt-2"
          >
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl sm:text-2xl font-bold text-white mb-4"
            >
              {t('form.flight.title')}
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-3"
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label className="block text-sm text-white/60 mb-1">{t('form.flight.type')}</label>
                <DropDown caso={formData.tipoCaso} setCaso={handleTipoCasoChange} />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <label className="block text-sm text-white/60 mb-1">{t('form.flight.number')}</label>
                <input
                  type="text"
                  name="numeroVoo"
                  value={formData.numeroVoo}
                  onChange={handleInputChange}
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 focus:border-white/20 focus:ring-white/10"
                  placeholder="Ex: LA1234"
                />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <label className="block text-sm text-white/60 mb-1">{t('form.flight.date')}</label>
                <input
                  type="date"
                  name="dataVoo"
                  value={formData.dataVoo}
                  onChange={handleInputChange}
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 focus:border-white/20 focus:ring-white/10"
                />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <label className="block text-sm text-white/60 mb-1">{t('form.flight.airline')}</label>
                <input
                  type="text"
                  name="companhiaAerea"
                  value={formData.companhiaAerea}
                  onChange={handleInputChange}
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 focus:border-white/20 focus:ring-white/10"
                  placeholder="Ex: Latam, Gol, Azul"
                />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <label className="block text-sm text-white/60 mb-1">{t('form.flight.origin')}</label>
                <input
                  type="text"
                  name="origem"
                  value={formData.origem}
                  onChange={handleInputChange}
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 focus:border-white/20 focus:ring-white/10"
                  placeholder={t('form.flight.origin')}
                />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <label className="block text-sm text-white/60 mb-1">{t('form.flight.destination')}</label>
                <input
                  type="text"
                  name="destino"
                  value={formData.destino}
                  onChange={handleInputChange}
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 focus:border-white/20 focus:ring-white/10"
                  placeholder={t('form.flight.destination')}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="description"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="w-full max-w-md mx-auto px-4 sm:px-0 h-full flex flex-col justify-start pt-2"
          >
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl sm:text-2xl font-bold text-white mb-4"
            >
              {t('form.description.title')}
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-3"
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label className="block text-sm text-white/60 mb-1">{t('form.description.description')}</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 focus:border-white/20 focus:ring-white/10 resize-none"
                  placeholder={t('form.description.description')}
                />
              </motion.div>
              
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-2"
              >
                <label className="block text-sm text-white/60 mb-4">{t('form.description.offered')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.oferecido.includes('reembolso')
                        ? 'bg-white/10 border-2 border-white shadow-lg'
                        : 'bg-dark-900/80 border border-white/10 hover:bg-white/5'
                    }`}
                    onClick={() => handleOferecidoChange('reembolso')}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-200 ${
                      formData.oferecido.includes('reembolso')
                        ? 'border-white bg-white'
                        : 'border-white/30 bg-transparent'
                    }`}>
                      {formData.oferecido.includes('reembolso') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-dark-950"
                        />
                      )}
                    </div>
                    <span className={`text-sm ${
                      formData.oferecido.includes('reembolso')
                        ? 'text-white font-medium'
                        : 'text-white/80'
                    }`}>{t('form.description.options.refund')}</span>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.oferecido.includes('reacomodacao')
                        ? 'bg-white/10 border-2 border-white shadow-lg'
                        : 'bg-dark-900/80 border border-white/10 hover:bg-white/5'
                    }`}
                    onClick={() => handleOferecidoChange('reacomodacao')}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-200 ${
                      formData.oferecido.includes('reacomodacao')
                        ? 'border-white bg-white'
                        : 'border-white/30 bg-transparent'
                    }`}>
                      {formData.oferecido.includes('reacomodacao') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-dark-950"
                        />
                      )}
                    </div>
                    <span className={`text-sm ${
                      formData.oferecido.includes('reacomodacao')
                        ? 'text-white font-medium'
                        : 'text-white/80'
                    }`}>{t('form.description.options.reaccommodation')}</span>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.oferecido.includes('voucher')
                        ? 'bg-white/10 border-2 border-white shadow-lg'
                        : 'bg-dark-900/80 border border-white/10 hover:bg-white/5'
                    }`}
                    onClick={() => handleOferecidoChange('voucher')}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-200 ${
                      formData.oferecido.includes('voucher')
                        ? 'border-white bg-white'
                        : 'border-white/30 bg-transparent'
                    }`}>
                      {formData.oferecido.includes('voucher') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-dark-950"
                        />
                      )}
                    </div>
                    <span className={`text-sm ${
                      formData.oferecido.includes('voucher')
                        ? 'text-white font-medium'
                        : 'text-white/80'
                    }`}>{t('form.description.options.voucher')}</span>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.oferecido.includes('nenhuma')
                        ? 'bg-white/10 border-2 border-white shadow-lg'
                        : 'bg-dark-900/80 border border-white/10 hover:bg-white/5'
                    }`}
                    onClick={() => handleOferecidoChange('nenhuma')}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-200 ${
                      formData.oferecido.includes('nenhuma')
                        ? 'border-white bg-white'
                        : 'border-white/30 bg-transparent'
                    }`}>
                      {formData.oferecido.includes('nenhuma') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-dark-950"
                        />
                      )}
                    </div>
                    <span className={`text-sm ${
                      formData.oferecido.includes('nenhuma')
                        ? 'text-white font-medium'
                        : 'text-white/80'
                    }`}>{t('form.description.options.none')}</span>
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-4"
              >
                <label className="block text-sm text-white/60 mb-2">{t('form.description.attachments')}</label>
                <div 
                  className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-white/30 transition-colors"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileText className="h-6 w-6 mx-auto mb-2 text-white/60" />
                  <p className="text-sm text-white/60">{t('form.description.clickToUpload')}</p>
                  <p className="text-xs text-white/40 mt-1">{t('form.description.supportedFiles')}</p>
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    multiple 
                    onChange={handleAnexoChange}
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="result"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="w-full h-full flex flex-col"
          >
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6"
            >
              {t('result.title')}
            </motion.h2>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna principal com resultado */}
                <div className="lg:col-span-2 space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/10"
                  >
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t('result.title')}</h2>
                    
                    {/* Destaque para o valor da compensação */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
                      <p className="text-white/80 text-sm mb-2">{t('result.compensation')}</p>
                      <p className="text-4xl sm:text-5xl font-bold text-white">
                        R$ {Number(formData.valorCompensacao).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    
                    {/* Probabilidade com cor */}
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-white mb-4">{t('result.probability.title')}</h3>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                        resultado.probabilidadeVitoria >= 70 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        resultado.probabilidadeVitoria >= 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        <span className="text-lg font-medium">{resultado.probabilidadeVitoria}%</span>
                        <span className="ml-2 text-sm">{t('result.probability.chance')}</span>
                      </div>
                    </div>
                    
                    {/* Instruções */}
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-white mb-4">{t('result.instructions.title')}</h3>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-white/80">{resultado.instrucoes}</p>
                      </div>
                    </div>
                    
                    {/* Petição */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-white" />
                          {t('result.petition.title')}
                        </h3>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-white text-dark-950 px-4 py-2 rounded-lg hover:bg-white/90 transition-colors flex items-center"
                          onClick={() => {
                            // Aqui você implementaria a lógica para baixar a petição
                            toast.success("Petição baixada com sucesso!");
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {t('result.petition.download')}
                        </motion.button>
                      </div>
                      <div className="bg-dark-950/50 rounded-lg p-4 max-h-60 overflow-y-auto custom-scrollbar">
                        <pre className="text-sm text-white/80 whitespace-pre-wrap">{resultado.peticao}</pre>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Coluna lateral com resumo do caso */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 h-fit"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">{t('result.summary.title')}</h3>
                  
                  <div className="space-y-4">
                    {/* Dados pessoais */}
                    <div>
                      <h4 className="text-sm font-medium text-white/60 mb-2">{t('result.summary.personal')}</h4>
                      <p className="text-white">{formData.nome}</p>
                      <p className="text-white/80 text-sm">{formData.email}</p>
                      <p className="text-white/80 text-sm">{formData.telefone}</p>
                    </div>
                    
                    {/* Dados do voo */}
                    <div>
                      <h4 className="text-sm font-medium text-white/60 mb-2">{t('result.summary.flight')}</h4>
                      <p className="text-white">{getTranslatedText(formData.tipoCaso)}</p>
                      <p className="text-white/80 text-sm">{t('form.flight.number')}: {formData.numeroVoo}</p>
                      <p className="text-white/80 text-sm">{t('form.flight.date')}: {formData.dataVoo}</p>
                      <p className="text-white/80 text-sm">{t('form.flight.airline')}: {formData.companhiaAerea}</p>
                    </div>
                    
                    {/* Descrição */}
                    <div>
                      <h4 className="text-sm font-medium text-white/60 mb-2">{t('result.summary.description')}</h4>
                      <p className="text-white/80 text-sm">{formData.descricao}</p>
                    </div>
                  </div>
                  
                  {/* Botão de ação direta */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center mt-6"
                  >
                    <button
                      onClick={handleVoltarAoInicio}
                      className="w-full px-6 py-3 bg-white text-dark-950 rounded-xl font-medium text-base hover:bg-white/90 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      {t('result.instructions.button')}
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Adicionar os estilos ao documento
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-950 overflow-hidden">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 2000 }}
      />
      
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6 flex justify-between items-center"
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center"
          >
            <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-dark-950" />
          </motion.div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Jurito</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {step > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoltarAoInicio}
              className="text-white/70 hover:text-white text-sm sm:text-base flex items-center"
            >
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 rotate-180" />
              {t('backToStart')}
            </motion.button>
          )}
          
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-white/70" />
            <select 
              onChange={changeLanguage} 
              value={locale} 
              className="bg-dark-900/80 border border-white/10 rounded-lg text-white p-1 text-sm focus:border-white/20 focus:ring-white/10"
            >
              <option value="pt">Português</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/50"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/30"></div>
          </div>
        </div>
      </motion.header>
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center justify-center relative">
        <div className={`w-full ${step === 4 ? 'h-auto min-h-[500px]' : step === 0 ? 'h-screen' : 'min-h-[600px]'} flex items-start justify-center overflow-hidden pt-4`}>
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center"
            >
              <LoadingDots color="#ffffff" style="large" />
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 sm:mt-4 text-white/60 text-sm sm:text-base"
              >
                {t('loading')}
              </motion.p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setLoading(false);
                  toast.error(t('processCancelled'));
                }}
                className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium border border-white/20"
              >
                {t('cancel')}
              </motion.button>
            </motion.div>
          ) : (
            <AnimatePresence initial={false} custom={direction} mode="wait">
              {renderStep()}
            </AnimatePresence>
          )}
        </div>

        {step > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto flex justify-between bg-dark-950/80 backdrop-blur-sm py-3 z-10 px-4 rounded-xl mt-4"
          >
            {step > 1 && step < 4 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackStep}
                className="px-4 sm:px-6 py-2 rounded-lg text-white hover:bg-white/5 transition-colors text-sm sm:text-base font-medium"
              >
                {t('form.buttons.back')}
              </motion.button>
            )}
            
            {step < 4 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextStep}
                className={`${step > 1 ? 'ml-4' : 'ml-auto'} bg-white text-dark-950 px-4 sm:px-6 py-2 rounded-lg hover:bg-white/90 transition-colors flex items-center text-sm sm:text-base font-medium`}
              >
                {step === 3 ? t('form.buttons.generate') : t('form.buttons.next')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </motion.button>
            )}
          </motion.div>
        )}
      </main>
      
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-6xl mx-auto px-4 py-4 text-center text-white/40 text-xs sm:text-sm"
      >
        <p>{t('footer')}</p>
      </motion.footer>
    </div>
  );
} 