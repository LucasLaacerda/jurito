import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos para o formulário
type FormData = {
  descricao: string;
  nomeCompanhia: string;
  dataOcorrencia: string;
  tipoProblema: string;
};

// Tipos para a resposta da API
type ApiResponse = {
  resumo: string;
  regulacoes: string[];
  viabilidade: number;
  compensacao: number;
  planoAcao: string[];
};

const questions = [
  {
    id: 'descricao',
    question: 'Conta pra gente o que rolou na sua viagem... 🤔',
    placeholder: 'Ex: Meu voo atrasou e perdi a conexão...',
    type: 'textarea'
  },
  {
    id: 'nomeCompanhia',
    question: 'Qual empresa te deixou na mão? ✈️',
    placeholder: 'Ex: LATAM, Gol, Azul...',
    type: 'text'
  },
  {
    id: 'dataOcorrencia',
    question: 'Quando isso aconteceu? 📅',
    type: 'date'
  },
  {
    id: 'tipoProblema',
    question: 'Que tipo de perrengue você passou? 😅',
    type: 'select',
    options: [
      { value: 'voo_cancelado', label: '❌ Voo cancelado' },
      { value: 'voo_atrasado', label: '⏰ Voo atrasado' },
      { value: 'conexao_perdida', label: '🏃‍♂️ Perdi a conexão' },
      { value: 'bagagem_extraviada', label: '🧳 Bagagem sumiu' },
      { value: 'bagagem_danificada', label: '💔 Bagagem danificada' },
      { value: 'overbooking', label: '👥 Overbooking' },
      { value: 'outro', label: '🤷‍♂️ Outro problema' }
    ]
  }
];

const Consultar: React.FC = () => {
  const { register, handleSubmit, watch } = useForm<FormData>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string>('');

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_JURITO_BACKEND_URL}/api/consultar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // seus dados aqui
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na consulta');
      }

      const resultado = await response.json();
      setResultado(resultado);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentValue = watch(questions[currentQuestion].id as keyof FormData);
  const canAdvance = currentValue && currentValue.length > 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="max-w-3xl mx-auto px-4 py-20">
          {!resultado ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <motion.h2 
                    className="text-3xl font-bold text-white mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {questions[currentQuestion].question}
                  </motion.h2>

                  <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
                    {questions[currentQuestion].type === 'textarea' && (
                      <textarea
                        {...register(questions[currentQuestion].id as keyof FormData)}
                        className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                        rows={4}
                        placeholder={questions[currentQuestion].placeholder}
                      />
                    )}

                    {questions[currentQuestion].type === 'text' && (
                      <input
                        type="text"
                        {...register(questions[currentQuestion].id as keyof FormData)}
                        className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder={questions[currentQuestion].placeholder}
                      />
                    )}

                    {questions[currentQuestion].type === 'date' && (
                      <input
                        type="date"
                        {...register(questions[currentQuestion].id as keyof FormData)}
                        className="w-full p-4 rounded-xl bg-white/20 text-white backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                    )}

                    {questions[currentQuestion].type === 'select' && (
                      <select
                        {...register(questions[currentQuestion].id as keyof FormData)}
                        className="w-full p-4 rounded-xl bg-white/20 text-white backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <option value="">Selecione uma opção</option>
                        {questions[currentQuestion].options?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="flex justify-between pt-6">
                      <button
                        type="button"
                        onClick={prevQuestion}
                        className={`px-6 py-3 rounded-xl text-white transition-all duration-200 ${
                          currentQuestion === 0 
                            ? 'opacity-0 pointer-events-none' 
                            : 'bg-white/20 hover:bg-white/30'
                        }`}
                      >
                        ← Voltar
                      </button>

                      {currentQuestion === questions.length - 1 ? (
                        <button
                          type="submit"
                          disabled={!canAdvance || loading}
                          className="px-6 py-3 rounded-xl bg-white text-purple-600 font-medium hover:bg-white/90 transition-all duration-200 disabled:opacity-50"
                        >
                          {loading ? 'Analisando...' : 'Analisar meu caso ✨'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={nextQuestion}
                          disabled={!canAdvance}
                          className="px-6 py-3 rounded-xl bg-white text-purple-600 font-medium hover:bg-white/90 transition-all duration-200 disabled:opacity-50"
                        >
                          Próximo →
                        </button>
                      )}
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8">
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <motion.div
                    className="h-1.5 rounded-full bg-white"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl text-white"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-4xl">✨</span>
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">Análise Concluída!</h2>
                <p className="text-xl opacity-90">Temos boas notícias para você</p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-2">Chance de Sucesso</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold">{resultado.viabilidade}%</div>
                    <div className="flex-1">
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <motion.div
                          className="h-3 rounded-full bg-green-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${resultado.viabilidade}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-2">Possível Compensação</h3>
                  <div className="text-4xl font-bold">
                    R$ {resultado.compensacao.toLocaleString('pt-BR')}
                  </div>
                </div>

                <div className="bg-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Próximos Passos</h3>
                  <div className="space-y-3">
                    {resultado.planoAcao.map((acao, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 * (index + 1) }}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>{acao}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = '/contato'}
                  className="w-full py-4 bg-white text-purple-600 rounded-xl font-medium hover:bg-white/90 transition-all duration-200"
                >
                  Quero Iniciar Meu Processo 🚀
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Consultar; 