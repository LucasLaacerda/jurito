"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Plane, Clock, Calendar, CheckCircle, ArrowRight, FileText, Percent, DollarSign, Info } from "lucide-react";
import LoadingDots from "../components/LoadingDots";
import DropDown, { CasoType } from "../components/DropDown";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoCasoChange = (tipo: CasoType) => {
    setFormData((prev) => ({ ...prev, tipoCaso: tipo }));
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      
      // Simulando processamento da petição
      setTimeout(() => {
        setResultado({
          peticao: `PETIÇÃO INICIAL\n\nExmo(a) Sr(a). Dr(a). Juiz(a) de Direito da Vara Cível da Comarca de São Paulo\n\n${formData.nome}, brasileiro(a), portador(a) da Cédula de Identidade RG nº XXX.XXX.XXX-X, inscrito(a) no CPF sob nº XXX.XXX.XXX-XX, residente e domiciliado(a) na Rua Exemplo, nº 123, Bairro Centro, São Paulo/SP, vem, respeitosamente, à presença de Vossa Excelência, propor a presente AÇÃO DE INDENIZAÇÃO POR DANOS MATERIAIS E MORAIS em face de ${formData.companhiaAerea}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº XX.XXX.XXX/0001-XX, com sede na Rua da Companhia, nº 456, Bairro Aeroporto, São Paulo/SP, pelos fatos e fundamentos a seguir expostos:\n\nFATOS\n\n1. O(a) requerente adquiriu passagem aérea para voo ${formData.numeroVoo} da companhia ${formData.companhiaAerea}, com data de partida em ${formData.dataVoo}.\n\n2. No dia do voo, o(a) requerente compareceu ao aeroporto no horário determinado, quando foi informado(a) que o voo havia sido ${formData.tipoCaso === "Voo Atrasado" ? "atrasado" : formData.tipoCaso === "Voo Cancelado" ? "cancelado" : "sujeito a overbooking"}.\n\n3. O(a) requerente não foi devidamente informado(a) sobre a situação com antecedência, o que causou transtornos significativos.\n\n4. A companhia aérea não ofereceu alternativas adequadas e não realizou o reembolso integral do valor da passagem.\n\nDIREITO\n\n5. A companhia aérea, ao não cumprir com sua obrigação contratual de transportar o(a) passageiro(a) no horário e data acordados, cometeu falha na prestação do serviço, gerando danos materiais e morais.\n\n6. O Código de Defesa do Consumidor (Lei 8.078/90) garante ao consumidor a proteção contra práticas abusivas e a reparação integral dos danos sofridos.\n\n7. A Convenção de Montreal, ratificada pelo Brasil, estabelece a responsabilidade objetiva da transportadora por danos decorrentes de atrasos e cancelamentos.\n\nPEDIDO\n\nAnte o exposto, requer:\n\n1. A citação da ré, na forma da lei;\n\n2. A inversão do ônus da prova, nos termos do art. 6º, VIII, do CDC;\n\n3. A condenação da ré ao pagamento de indenização por danos materiais no valor de R$ ${formData.valorCompensacao}, a título de reembolso do valor da passagem e despesas adicionais;\n\n4. A condenação da ré ao pagamento de indenização por danos morais no valor de R$ ${(parseFloat(formData.valorCompensacao) * 2).toFixed(2)}, a título de compensação pelos transtornos sofridos;\n\n5. A concessão dos benefícios da justiça gratuita, nos termos da Lei 1.060/50;\n\n6. A inversão do ônus da prova, nos termos do art. 6º, VIII, do CDC;\n\n7. A concessão dos benefícios da justiça gratuita, nos termos da Lei 1.060/50.\n\nNestes termos,\nPede deferimento.\n\nSão Paulo, ${new Date().toLocaleDateString('pt-BR')}.\n\n${formData.nome}\nCPF: XXX.XXX.XXX-XX`,
          probabilidadeVitoria: 85,
          valorEstimado: parseFloat(formData.valorCompensacao) * 3,
          instrucoes: "1. Imprima a petição em 3 vias\n2. Assine todas as vias\n3. Apresente na vara cível do seu município\n4. Guarde uma via para seus registros\n5. Acompanhe o processo pelo número que será fornecido no protocolo",
        });
        setLoading(false);
        setStep(4);
      }, 2000);
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Seus dados pessoais</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Nome completo</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-lg text-white p-3 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Digite seu nome completo"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-lg text-white p-3 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Digite seu e-mail"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Telefone</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-lg text-white p-3 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Digite seu telefone"
                />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Detalhes do voo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Tipo de problema</label>
                <DropDown caso={formData.tipoCaso} setCaso={handleTipoCasoChange} />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Número do voo</label>
                <input
                  type="text"
                  name="numeroVoo"
                  value={formData.numeroVoo}
                  onChange={handleInputChange}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-lg text-white p-3 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ex: LA1234"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Data do voo</label>
                <input
                  type="date"
                  name="dataVoo"
                  value={formData.dataVoo}
                  onChange={handleInputChange}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-lg text-white p-3 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Companhia aérea</label>
                <input
                  type="text"
                  name="companhiaAerea"
                  value={formData.companhiaAerea}
                  onChange={handleInputChange}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-lg text-white p-3 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ex: Latam, Gol, Azul"
                />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Descrição do problema</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Descreva o que aconteceu</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-lg text-white p-3 focus:border-primary-500 focus:ring-primary-500 resize-none"
                  placeholder="Descreva detalhadamente o que aconteceu com seu voo"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Valor da passagem (R$)</label>
                <input
                  type="text"
                  name="valorCompensacao"
                  value={formData.valorCompensacao}
                  onChange={handleInputChange}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-lg text-white p-3 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Ex: 500,00"
                />
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Sua petição está pronta!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-500/20 rounded-lg mb-3">
                  <Percent className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Probabilidade de vitória</h3>
                <p className="text-3xl font-bold text-primary-400">{resultado.probabilidadeVitoria}%</p>
              </div>
              
              <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-500/20 rounded-lg mb-3">
                  <DollarSign className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Valor estimado</h3>
                <p className="text-3xl font-bold text-primary-400">R$ {resultado.valorEstimado.toFixed(2)}</p>
              </div>
              
              <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-500/20 rounded-lg mb-3">
                  <FileText className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Petição gerada</h3>
                <p className="text-white/80">Pronta para apresentação</p>
              </div>
            </div>
            
            <div className="bg-dark-800/50 rounded-xl p-6 border border-white/10 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary-400" />
                Instruções para apresentação
              </h3>
              <ul className="space-y-2 text-white/80">
                {resultado.instrucoes.split('\n').map((instrucao, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    {instrucao}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-dark-800/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Petição gerada</h3>
              <div className="bg-dark-900/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <pre className="text-white/80 text-sm whitespace-pre-wrap">{resultado.peticao}</pre>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center"
                  onClick={() => {
                    // Aqui você implementaria a lógica para baixar a petição
                    toast.success("Petição baixada com sucesso!");
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Baixar petição
                </button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-950">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 2000 }}
      />
      
      <header className="w-full max-w-5xl mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Jurito</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary-500"></div>
          <div className="w-2 h-2 rounded-full bg-primary-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-primary-500/30"></div>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="w-full flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-primary-500' : 'text-white/30'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-500' : 'bg-white/10'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Dados pessoais</span>
            </div>
            <div className="w-12 h-0.5 bg-white/10"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary-500' : 'text-white/30'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-500' : 'bg-white/10'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Detalhes do voo</span>
            </div>
            <div className="w-12 h-0.5 bg-white/10"></div>
            <div className={`flex items-center ${step >= 3 ? 'text-primary-500' : 'text-white/30'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-500' : 'bg-white/10'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Descrição</span>
            </div>
            <div className="w-12 h-0.5 bg-white/10"></div>
            <div className={`flex items-center ${step >= 4 ? 'text-primary-500' : 'text-white/30'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-primary-500' : 'bg-white/10'}`}>
                4
              </div>
              <span className="ml-2 text-sm font-medium">Resultado</span>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingDots color="#8b5cf6" style="large" />
            <p className="mt-4 text-white/60">Gerando sua petição...</p>
          </div>
        ) : (
          renderStep()
        )}
        
        <div className="w-full max-w-md mx-auto mt-8 flex justify-between">
          {step > 1 && step < 4 && (
            <button
              onClick={handleBackStep}
              className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
            >
              Voltar
            </button>
          )}
          
          {step < 4 && (
            <button
              onClick={handleNextStep}
              className="ml-auto bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center"
            >
              {step === 3 ? "Gerar petição" : "Próximo"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </main>
      
      <footer className="w-full max-w-5xl mx-auto px-4 py-6 text-center text-white/40 text-sm">
        <p>© 2023 Jurito - Assistente jurídico para problemas com voos</p>
      </footer>
    </div>
  );
} 