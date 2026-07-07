"use client";

import React from 'react';

// Definimos cómo luce estructuralmente un sorteo en TypeScript
interface Sorteo {
  id: number;
  numeros: number[];
  sb: number;
}

interface HeatMapProps {
  sorteos: Sorteo[];
}

export default function HeatMap({ sorteos }: HeatMapProps) {
  // 1. Inicializamos un objeto con los números del 1 al 43 en 0 apariciones
  const frecuencias: Record<number, number> = {};
  for (let i = 1; i <= 43; i++) frecuencias[i] = 0;

  // 2. Contamos las frecuencias basándonos en la lista que nos llegue
  sorteos.forEach((sorteo) => {
    sorteo.numeros.forEach((num) => {
      if (frecuencias[num] !== undefined) frecuencias[num]++;
    });
  });

  const maxFrecuencia = Math.max(...Object.values(frecuencias), 1);

  // 3. Función inteligente para pintar las balotas según su temperatura
  const getBgColor = (frecuencia: number) => {
    if (sorteos.length === 0) return 'bg-slate-800/40 text-slate-600 border border-slate-800/50';
    
    const porcentaje = frecuencia / maxFrecuencia;
    if (frecuencia === 0) return 'bg-slate-900 text-slate-600 border border-slate-850';
    if (porcentaje < 0.3) return 'bg-emerald-950/60 text-emerald-500 border border-emerald-900/50';
    if (porcentaje < 0.6) return 'bg-emerald-800/80 text-emerald-200';
    
    // El más "caliente" brilla con Tailwind
    return 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/10 scale-[1.02]';
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          🔥 Mapa de Calor
        </h3>
        <p className="text-xs text-slate-400 mt-1">Frecuencia e intensidad de balotas principales (1 al 43)</p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Object.entries(frecuencias).map(([numero, frec]) => (
          <div
            key={numero}
            className={`h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-200 ${getBgColor(frec)}`}
            title={`Número ${numero}: ${frec} veces`}
          >
            <span className="text-sm font-semibold">{numero.padStart(2, '0')}</span>
            {sorteos.length > 0 && <span className="text-[9px] opacity-70 font-mono">{frec}x</span>}
          </div>
        ))}
      </div>
    </div>
  );
}