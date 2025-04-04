"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Plane, Clock, Calendar, CheckCircle, ArrowRight, FileText, Percent, DollarSign, Info, Scale, Shield, Zap, Globe } from "lucide-react";
import LoadingDots from "../components/LoadingDots";
import DropDown, { CasoType } from "../components/DropDown";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';

// URL base da API
const API_URL = "https://web-production-192c4.up.railway.app";

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

export default function Home() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // Começamos com o step 0 (tela inicial)
  const [[page, direction], setPage] = useState([0, 0]);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipoCaso: "Voo Atrasado" as CasoType,
    numeroVoo: "",
    dataVoo: "",
    companhiaAerea: "",
    descricao: "",
    valorCompensacao: "",
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
      const dadosParaEnvio = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        tipo_caso: formData.tipoCaso,
        numero_voo: formData.numeroVoo,
        data_voo: formData.dataVoo,
        companhia_aerea: formData.companhiaAerea,
        descricao: formData.descricao,
        valor_compensacao: formData.valorCompensacao,
      };

      // Função para fazer chamadas à API
      const chamarAPI = async (endpoint: string, dados: any) => {
        try {
          console.log(`Enviando dados para ${endpoint}:`, dados);
          
          const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Resposta de erro de ${endpoint}:`, errorText);
            throw new Error(`Erro na chamada à API: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log(`Resposta de ${endpoint}:`, data);
          return data;
        } catch (error) {
          console.error(`Erro ao chamar ${endpoint}:`, error);
          return null;
        }
      };

      // Chamar todos os endpoints em paralelo
      Promise.all([
        chamarAPI('/gerar-resumo', dadosParaEnvio),
        chamarAPI('/avaliar-regulacoes', dadosParaEnvio),
        chamarAPI('/avaliar-viabilidade', dadosParaEnvio),
        chamarAPI('/calcular-compensacao', dadosParaEnvio),
        chamarAPI('/gerar-plano-acao', dadosParaEnvio),
      ])
        .then(([resumo, regulacoes, viabilidade, compensacao, planoAcao]) => {
          console.log("Respostas da API:", { resumo, regulacoes, viabilidade, compensacao, planoAcao });
          
          // Gerar a petição com base nos dados e respostas da API
          const peticao = gerarPeticao(
            formData, 
            resumo?.texto || "Não foi possível gerar o resumo.", 
            regulacoes?.leis || "Não foi possível avaliar as regulamentações."
          );
          
          setResultado({
            peticao,
            probabilidadeVitoria: viabilidade?.probabilidade || 85,
            valorEstimado: compensacao?.valor || parseFloat(formData.valorCompensacao) * 3,
            instrucoes: planoAcao?.passos || "1. Imprima a petição em 3 vias\n2. Assine todas as vias\n3. Apresente na vara cível do seu município\n4. Guarde uma via para seus registros\n5. Acompanhe o processo pelo número que será fornecido no protocolo",
            resumo: resumo?.texto || "Não foi possível gerar o resumo.",
            regulacoes: regulacoes?.leis || "Não foi possível avaliar as regulamentações.",
            planoAcao: planoAcao?.passos || "Não foi possível gerar o plano de ação.",
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

  // Função para gerar a petição com base nos dados e respostas da API
  const gerarPeticao = (dados: any, resumo: string, regulacoes: string) => {
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
            className="w-full max-w-3xl mx-auto text-center px-4 sm:px-6 h-full flex flex-col justify-center"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 sm:mb-8"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
              >
                <Scale className="h-8 w-8 sm:h-10 sm:w-10 text-dark-950" />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4"
              >
                {t('welcome.title')}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto"
              >
                {t('welcome.subtitle')}
              </motion.p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
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
              className="bg-white text-dark-950 px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-white/90 transition-colors flex items-center mx-auto text-base sm:text-lg font-medium"
            >
              {t('welcome.cta')}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
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
            className="w-full max-w-md mx-auto px-4 sm:px-0 h-full flex flex-col justify-center"
          >
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6"
            >
              {t('form.personal.title')}
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-3 sm:space-y-4"
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
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 sm:p-3 focus:border-white/20 focus:ring-white/10"
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
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 sm:p-3 focus:border-white/20 focus:ring-white/10"
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
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 sm:p-3 focus:border-white/20 focus:ring-white/10"
                  placeholder={t('form.personal.phone')}
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
            className="w-full max-w-md mx-auto px-4 sm:px-0 h-full flex flex-col justify-center"
          >
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6"
            >
              {t('form.flight.title')}
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-3 sm:space-y-4"
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
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 sm:p-3 focus:border-white/20 focus:ring-white/10"
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
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 sm:p-3 focus:border-white/20 focus:ring-white/10"
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
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 sm:p-3 focus:border-white/20 focus:ring-white/10"
                  placeholder="Ex: Latam, Gol, Azul"
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
            className="w-full max-w-md mx-auto px-4 sm:px-0 h-full flex flex-col justify-center"
          >
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6"
            >
              {t('form.description.title')}
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-3 sm:space-y-4"
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
                  rows={4}
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 sm:p-3 focus:border-white/20 focus:ring-white/10 resize-none"
                  placeholder={t('form.description.description')}
                />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <label className="block text-sm text-white/60 mb-1">{t('form.description.value')}</label>
                <input
                  type="text"
                  name="valorCompensacao"
                  value={formData.valorCompensacao}
                  onChange={handleInputChange}
                  className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 sm:p-3 focus:border-white/20 focus:ring-white/10"
                  placeholder="Ex: 500,00"
                />
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
              {/* Seção de estatísticas */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6"
              >
                <motion.div 
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className="bg-dark-900/80 rounded-xl p-3 sm:p-4 border border-white/10 flex-1 min-w-[200px]"
                >
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg mb-2 sm:mb-3">
                    <Percent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{t('result.stats.probability.title')}</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{t('result.stats.probability.value', { value: resultado.probabilidadeVitoria })}</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className="bg-dark-900/80 rounded-xl p-3 sm:p-4 border border-white/10 flex-1 min-w-[200px]"
                >
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg mb-2 sm:mb-3">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{t('result.stats.value.title')}</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{t('result.stats.value.value', { value: resultado.valorEstimado.toFixed(2) })}</p>
                </motion.div>
              </motion.div>
              
              {/* Layout horizontal para telas maiores */}
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Seção principal - Petição */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="bg-dark-900/80 rounded-xl p-4 sm:p-6 border border-white/10 lg:w-2/3"
                >
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white" />
                      {t('result.petition.title')}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-dark-950 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-white/90 transition-colors flex items-center text-sm sm:text-base"
                      onClick={() => {
                        // Aqui você implementaria a lógica para baixar a petição
                        toast.success("Petição baixada com sucesso!");
                      }}
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {t('result.petition.download')}
                    </motion.button>
                  </div>
                  
                  <div className="bg-dark-950/50 rounded-lg p-3 sm:p-4">
                    <pre className="text-xs sm:text-sm text-white/80 whitespace-pre-wrap">{resultado.peticao}</pre>
                  </div>
                </motion.div>
                
                {/* Seção de informações adicionais */}
                <div className="lg:w-1/3 flex flex-col gap-4 sm:gap-6">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-dark-900/80 rounded-xl p-4 sm:p-6 border border-white/10"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                      <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white" />
                      {t('result.instructions.title')}
                    </h3>
                    <ul className="space-y-2 text-white/80">
                      {resultado.instrucoes.split('\n').map((instrucao, index) => (
                        <motion.li 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                          className="flex items-start text-sm sm:text-base"
                        >
                          <span className="text-white mr-2">•</span>
                          {instrucao}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-dark-900/80 rounded-xl p-4 sm:p-6 border border-white/10"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">{t('result.summary.title')}</h3>
                    <div className="bg-dark-950/50 rounded-lg p-3 sm:p-4">
                      <p className="text-sm sm:text-base text-white/80">{resultado.resumo}</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="bg-dark-900/80 rounded-xl p-4 sm:p-6 border border-white/10"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">{t('result.regulations.title')}</h3>
                    <div className="bg-dark-950/50 rounded-lg p-3 sm:p-4">
                      <p className="text-sm sm:text-base text-white/80">{resultado.regulacoes}</p>
                    </div>
                  </motion.div>
                </div>
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
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center justify-center">
        {step > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex justify-center mb-6 sm:mb-8"
          >
            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.div 
                className={`flex items-center ${step >= 1 ? 'text-white' : 'text-white/30'}`}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-white text-dark-950' : 'bg-white/10'}`}
                  animate={{ scale: step >= 1 ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  1
                </motion.div>
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium">{t('steps.personal')}</span>
              </motion.div>
              <div className="w-8 sm:w-12 h-0.5 bg-white/10"></div>
              <motion.div 
                className={`flex items-center ${step >= 2 ? 'text-white' : 'text-white/30'}`}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-white text-dark-950' : 'bg-white/10'}`}
                  animate={{ scale: step >= 2 ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  2
                </motion.div>
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium">{t('steps.flight')}</span>
              </motion.div>
              <div className="w-8 sm:w-12 h-0.5 bg-white/10"></div>
              <motion.div 
                className={`flex items-center ${step >= 3 ? 'text-white' : 'text-white/30'}`}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-white text-dark-950' : 'bg-white/10'}`}
                  animate={{ scale: step >= 3 ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  3
                </motion.div>
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium">{t('steps.description')}</span>
              </motion.div>
              <div className="w-8 sm:w-12 h-0.5 bg-white/10"></div>
              <motion.div 
                className={`flex items-center ${step >= 4 ? 'text-white' : 'text-white/30'}`}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-white text-dark-950' : 'bg-white/10'}`}
                  animate={{ scale: step >= 4 ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  4
                </motion.div>
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium">{t('steps.result')}</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        <div className={`w-full ${step === 4 ? 'h-auto min-h-[500px]' : 'h-[500px]'} flex items-center justify-center`}>
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
            className="w-full max-w-md mx-auto mt-6 sm:mt-8 flex justify-between"
          >
            {step > 1 && step < 4 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackStep}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors text-sm sm:text-base"
              >
                {t('form.buttons.back')}
              </motion.button>
            )}
            
            {step < 4 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextStep}
                className="ml-auto bg-white text-dark-950 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-white/90 transition-colors flex items-center text-sm sm:text-base"
              >
                {step === 3 ? t('form.buttons.generate') : t('form.buttons.next')}
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
              </motion.button>
            )}
          </motion.div>
        )}
      </main>
      
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6 text-center text-white/40 text-xs sm:text-sm"
      >
        <p>{t('footer')}</p>
      </motion.footer>
    </div>
  );
} 