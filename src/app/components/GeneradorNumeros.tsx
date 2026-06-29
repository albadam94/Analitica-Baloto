"use client";

import React, { useState } from 'react';

interface Sorteo {
  id: number;
  numeros: number[];
  sb: number;
}

interface GeneradorProps {
  sorteos: Sorteo[];
}

export default function GeneradorNumeros({ sorteos }: GeneradorProps) {
  const [combinacion, setCombinacion] = useState<number[]>([]);
  const [superBalota, setSuperBalota] = useState<number | null>(null);

  const generarJugadaIdeal = () => {
    if (sorteos.length === 0) return;

    const frecuencias: Record<number, number> = {};
    const frecuenciasSB: Record<number, number> = {};
    
    for (let i = 1; i <= 43; i++) frecuencias[i] = 0;
    for (let i = 1; i <= 16; i++) frecuenciasSB[i] = 0;

    sorteos.forEach(s => {
      s.numeros.forEach(n => frecuencias[n]++);
      frecuenciasSB[s.sb]++;
    });

    // Ordenar balotas por mayor frecuencia
    const balotasOrdenadas = Object.keys(frecuencias)
      .map(Number)
      .sort((a, b) => frecuencias[b] - frecuencias[a]);

    // Ordenar superbalotas por mayor frecuencia
    const sbOrdenadas = Object.keys(frecuenciasSB)
      .map(Number)
      .sort((a, b) => frecuenciasSB[b] - frecuenciasSB[a]);

    // Algoritmo: tomamos una mezcla de las más calientes y las ordenamos de menor a mayor
    const seleccionadas = [
      balotasOrdenadas[0],
      balotasOrdenadas[1],
      balotasOrdenadas[2],
      balotasOrdenadas[3],
      balotasOrdenadas[4]
    ].sort((a, b) => a - b);

    setCombinacion(seleccionadas);
    setSuperBalota(sbOrdenadas[0]);
  };

  const delaApiEstaVacia = sorteos.length === 0;

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-full flex flex-col justify-between shadow-xl">
      <div>
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          🎯 Generador de Tendencia
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Calcula la combinación óptima analizando el histórico de la base de datos.
        </p>
        
        {combinacion.length > 0 ? (
          <div className="flex gap-2 justify-center items-center my-8 bg-slate-950/60 p-5 rounded-xl border border-slate-850 animate-fade-in">
            {combinacion.map((num) => (
              <span key={num} className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-base shadow-sm">
                {num.toString().padStart(2, '0')}
              </span>
            ))}
            <span className="text-slate-600 font-bold text-lg mx-1">+</span>
            <span className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black text-base shadow-md shadow-amber-500/10">
              {superBalota?.toString().padStart(2, '0')}
            </span>
          </div>
        ) : (
          <div className="text-center py-10 my-4 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
            <p className="text-sm text-slate-500">
              {delaApiEstaVacia 
                ? "Esperando conexión con el backend de Python..." 
                : "Haz clic abajo para calcular la combinación"}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={generarJugadaIdeal}
        disabled={delaApiEstaVacia}
        className={`w-full py-3.5 font-bold rounded-xl transition-all duration-200 shadow-lg ${
          delaApiEstaVacia
            ? "bg-slate-800 text-slate-600 cursor-not-allowed shadow-none"
            : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/5 active:scale-[0.99]"
        }`}
      >
        {delaApiEstaVacia ? "Backend Offline" : "Calcular Próxima Jugada"}
      </button>
    </div>
  );
}