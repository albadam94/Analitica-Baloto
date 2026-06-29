"use client";

import React, { useRef, useEffect } from 'react';

interface SorteoForm {
  n1: string; n2: string; n3: string; n4: string; n5: string; sb: string;
}

interface SorteoInputCardProps {
  title: string;
  tarjetaKey: 'baloto' | 'revancha' | 'jugadas';
  form: SorteoForm;
  isEditing: boolean;
  onEditToggle: () => void;
  onInputChange: (campo: keyof SorteoForm, valor: string) => void;
}

export default function SorteoInputCard({
  title,
  tarjetaKey,
  form,
  isEditing,
  onEditToggle,
  onInputChange,
}: SorteoInputCardProps) {
  
  // Referencias para controlar el foco de los inputs de forma nativa
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Limpiar referencias muertas al desmontar o renderizar
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const campos: Array<keyof SorteoForm> = ['n1', 'n2', 'n3', 'n4', 'n5', 'sb'];

  // Validar reglas de Baloto en Colombia
  const validarRango = (campo: keyof SorteoForm, valor: string): boolean => {
    if (valor === "") return true;
    const num = parseInt(valor, 10);
    if (isNaN(num)) return false;
    
    if (campo === 'sb') {
      return num >= 1 && num <= 16; // Súper Baloto de 1 a 16
    }
    return num >= 1 && num <= 43; // Balotas regulares de 1 a 43
  };

  const handleChange = (index: number, campo: keyof SorteoForm, valor: string) => {
    // Solo permitir caracteres numéricos
    if (valor !== "" && !/^\d+$/.test(valor)) return;
    
    onInputChange(campo, valor);

    // Salto automático al siguiente input si se completan los 2 dígitos y es válido
    if (valor.length === 2 && validarRango(campo, valor) && index < 5) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Si presiona borrar (Backspace) y el input está vacío, regresa al anterior
    if (e.key === 'Backspace' && !form[campos[index]] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="bg-[#141416] p-6 rounded-xl border border-[#202024] text-center space-y-6 transition-all duration-300 hover:border-zinc-800">
      <span className="text-sm font-bold text-white tracking-wide block transition-colors duration-200">
        {title}
      </span>

      {isEditing ? (
        <div className="flex gap-2 justify-center items-center font-mono animate-fade-in">
          {campos.map((campo, idx) => {
            const isSB = campo === 'sb';
            const isValid = validarRango(campo, form[campo]);
            
            return (
              <React.Fragment key={campo}>
                {isSB && <span className="text-zinc-600 font-bold text-sm mx-0.5">+</span>}
                <input
                  ref={(el) => { if (el) inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={2}
                  inputMode="numeric"
                  value={form[campo]}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onChange={(e) => handleChange(idx, campo, e.target.value)}
                  className={`w-10 h-10 text-center bg-black font-black rounded-lg text-lg outline-none transition-all duration-200 ${
                    !isValid 
                      ? 'border-orange-500 text-orange-500 focus:shadow-[0_0_10px_rgba(255,85,0,0.2)]' 
                      : isSB 
                        ? 'border-[#FF5500] text-[#FF5500] focus:shadow-[0_0_10px_rgba(255,85,0,0.2)]' 
                        : 'border-[#9EFF00] text-[#9EFF00] focus:shadow-[0_0_10px_rgba(158,255,0,0.2)]'
                  }`}
                  placeholder="00"
                />
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-3 justify-center text-2xl font-black text-[#9EFF00] font-mono tracking-tight transition-all duration-300">
          <span>{form.n1.padStart(2, '0')}</span>
          <span>{form.n2.padStart(2, '0')}</span>
          <span>{form.n3.padStart(2, '0')}</span>
          <span>{form.n4.padStart(2, '0')}</span>
          <span>{form.n5.padStart(2, '0')}</span>
          <span className="text-[#FF5500]">{form.sb.padStart(2, '0')}</span>
        </div>
      )}

      <button 
        onClick={onEditToggle}
        className={`w-full py-2.5 bg-transparent border font-mono text-xs rounded-xl transition-all duration-200 ${
          isEditing 
            ? 'border-[#9EFF00] text-[#9EFF00] bg-[#9EFF00]/5 hover:bg-[#9EFF00]/10 shadow-[0_0_15px_rgba(158,255,0,0.05)]' 
            : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white hover:bg-zinc-900/30'
        }`}
      >
        {isEditing ? "Guardar cambios" : "Ingresar resultado"}
      </button>
    </div>
  );
}