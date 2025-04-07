import React, { useState, useRef, useEffect } from 'react';

export type CasoType = 'Voo Atrasado' | 'Voo Cancelado' | 'Bagagem Extraviada' | 'Overbooking' | 'Outro';

interface DropDownProps {
  caso: CasoType;
  setCaso: (caso: CasoType) => void;
}

const DropDown: React.FC<DropDownProps> = ({ caso, setCaso }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: CasoType[] = [
    'Voo Atrasado',
    'Voo Cancelado',
    'Bagagem Extraviada',
    'Overbooking',
    'Outro'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="w-full bg-dark-900/80 border border-white/10 rounded-lg text-white p-2 focus:border-white/20 focus:ring-white/10 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{caso}</span>
        <svg
          className={`h-5 w-5 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-dark-900/95 border border-white/10 rounded-lg shadow-lg overflow-hidden">
          {options.map((option) => (
            <button
              key={option}
              className={`w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 ${
                caso === option ? 'bg-white/5' : ''
              }`}
              onClick={() => {
                setCaso(option);
                setIsOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDown; 