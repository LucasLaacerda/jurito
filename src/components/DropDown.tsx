import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'next-i18next';

export type CasoType = "Voo Atrasado" | "Voo Cancelado" | "Bagagem Extraviada" | "Overbooking" | "Outro";

interface DropDownProps {
  caso: CasoType;
  setCaso: (caso: CasoType) => void;
}

const DropDown = ({ caso, setCaso }: DropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('common');

  const opcoes: CasoType[] = [
    "Voo Atrasado",
    "Voo Cancelado",
    "Bagagem Extraviada",
    "Overbooking",
    "Outro"
  ];

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

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-3 focus:border-white/20 focus:ring-white/10 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{getTranslatedText(caso)}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-dark-900 rounded-lg shadow-lg border border-white/10 overflow-hidden">
          {opcoes.map((opcao) => (
            <button
              key={opcao}
              type="button"
              className={`w-full text-left px-4 py-2 text-sm ${
                caso === opcao ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
              }`}
              onClick={() => {
                setCaso(opcao);
                setIsOpen(false);
              }}
            >
              {getTranslatedText(opcao)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDown; 