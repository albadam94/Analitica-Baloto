"use client";

import React, { useState, useEffect } from 'react';
import { Darker_Grotesque, Fira_Code } from 'next/font/google';
import SorteoInputCard from './components/SorteoInputCard';

const darkerGrotesque = Darker_Grotesque({ subsets: ['latin'], weight: ['400', '600', '700', '900'], variable: '--font-darker' });
const firaCode = Fira_Code({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-fira' });

interface SorteoForm {
  n1: string; n2: string; n3: string; n4: string; n5: string; sb: string;
}

export default function Dashboard() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState("2026-06-29");
  const [dbActiva, setDbActiva] = useState(false);
  const [loadingPredict, setLoadingPredict] = useState(false);

  // Estado para la card del generador predictivo (IA/Estadística)
  const [prediccion, setPrediccion] = useState<SorteoForm>({ n1: '15', n2: '04', n3: '10', n4: '02', n5: '40', sb: '10' });

  // Métricas dinámicas del backend
  const [sorteosJugados, setSorteosJugados] = useState(15);
  const [numerosActivos, setNumerosActivos] = useState<string[]>(['15', '04', '10', '02', '40', '10']);

  const [editando, setEditando] = useState<{ [key: string]: boolean }>({
    baloto: false,
    revancha: false,
    jugadas: false,
  });

  const [formBaloto, setFormBaloto] = useState<SorteoForm>({ n1: '15', n2: '04', n3: '10', n4: '02', n5: '40', sb: '10' });
  const [formRevancha, setFormRevancha] = useState<SorteoForm>({ n1: '15', n2: '04', n3: '10', n4: '02', n5: '40', sb: '10' });
  const [formJugadas, setFormJugadas] = useState<SorteoForm>({ n1: '15', n2: '04', n3: '10', n4: '02', n5: '40', sb: '10' });

  // 1. EFECTO: Consultar la API cuando cambia la fecha en el calendario
  useEffect(() => {
    async function cargarDatosFecha() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/sorteos/${fechaSeleccionada}`);
        if (!res.ok) throw new Error("Error en servidor");
        
        const data = await res.json();
        
        if (data.baloto) {
          setDbActiva(true);
          setSorteosJugados(data.sorteos_jugados);
          setNumerosActivos(data.numeros_activos.map((n: number) => String(n).padStart(2, '0')));
          
          setFormBaloto({
            n1: String(data.baloto.n1).padStart(2, '0'),
            n2: String(data.baloto.n2).padStart(2, '0'),
            n3: String(data.baloto.n3).padStart(2, '0'),
            n4: String(data.baloto.n4).padStart(2, '0'),
            n5: String(data.baloto.n5).padStart(2, '0'),
            sb: String(data.baloto.sb).padStart(2, '0'),
          });
          
          setFormRevancha({
            n1: String(data.revancha.n1).padStart(2, '0'),
            n2: String(data.revancha.n2).padStart(2, '0'),
            n3: String(data.revancha.n3).padStart(2, '0'),
            n4: String(data.revancha.n4).padStart(2, '0'),
            n5: String(data.revancha.n5).padStart(2, '0'),
            sb: String(data.revancha.sb).padStart(2, '0'),
          });
        } else {
          // Si no hay datos registrados para ese día
          setDbActiva(false);
          setSorteosJugados(0);
          setNumerosActivos(['00', '00', '00', '00', '00', '00']);
        }
      } catch (error) {
        setDbActiva(false);
        console.error("Backend desconectado", error);
      }
    }
    
    cargarDatosFecha();
  }, [fechaSeleccionada]);

  // 2. PETICIÓN: Llamar al generador predictivo con IA/Estadística
  const handleGenerarPrediccion = async () => {
    setLoadingPredict(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/predict");
      if (!res.ok) throw new Error("Error obteniendo predicción");
      const data = await res.json();
      setPrediccion(data);
    } catch (error) {
      console.error("Error al conectar con el generador predictivo", error);
    } finally {
      setLoadingPredict(false);
    }
  };

  const toggleEdit = async (tarjeta: 'baloto' | 'revancha' | 'jugadas') => {
    if (editando[tarjeta]) {
      // Si ya estaba editando, al hacer clic significa que va a "Guardar"
      const guardadoExitoso = await guardarSorteoEnBackend();
      if (!guardadoExitoso) return; // Detiene el cierre si hubo un error en la API
    }
    setEditando(prev => ({ ...prev, [tarjeta]: !prev[tarjeta] }));
  };

  // 3. PETICIÓN: Enviar datos nuevos ingresados manualmente al backend
  const guardarSorteoEnBackend = async (): Promise<boolean> => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/sorteos/ingresar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: fechaSeleccionada,
          baloto: {
            n1: parseInt(formBaloto.n1, 10), n2: parseInt(formBaloto.n2, 10),
            n3: parseInt(formBaloto.n3, 10), n4: parseInt(formBaloto.n4, 10),
            n5: parseInt(formBaloto.n5, 10), sb: parseInt(formBaloto.sb, 10),
          },
          revancha: {
            n1: parseInt(formRevancha.n1, 10), n2: parseInt(formRevancha.n2, 10),
            n3: parseInt(formRevancha.n3, 10), n4: parseInt(formRevancha.n4, 10),
            n5: parseInt(formRevancha.n5, 10), sb: parseInt(formRevancha.sb, 10),
          }
        })
      });
      if (res.ok) {
        setDbActiva(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al guardar en el servidor", error);
      return false;
    }
  };

  const handleInputChange = (tarjeta: 'baloto' | 'revancha' | 'jugadas', campo: keyof SorteoForm, valor: string) => {
    if (tarjeta === 'baloto') setFormBaloto(prev => ({ ...prev, [campo]: valor }));
    if (tarjeta === 'revancha') setFormRevancha(prev => ({ ...prev, [campo]: valor }));
    if (tarjeta === 'jugadas') setFormJugadas(prev => ({ ...prev, [campo]: valor }));
  };

  return (
    <main className={`${darkerGrotesque.variable} ${firaCode.variable} min-h-screen bg-[#09090B] text-[#E4E4E7] p-8 font-sans antialiased`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center border-b border-[#202024] pb-6">
          <h1 className="text-3xl font-black tracking-tight text-white">
            Baloto Analytics <span className="text-zinc-600 font-light text-2xl">v1.0</span>
          </h1>
          
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs px-3 py-1.5 rounded-lg border border-[#202024] bg-[#141416] text-zinc-400">
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${dbActiva ? 'bg-[#9EFF00]' : 'bg-red-500 animate-pulse'}`}></span>
              {dbActiva ? "Base de datos Activa" : "Base de datos Inactiva"}
            </span>

            <label className="flex items-center gap-2 font-mono text-sm px-3 py-1.5 rounded-lg border border-[#9EFF00] bg-black text-[#9EFF00] cursor-pointer transition-all hover:bg-[#141416] relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#9EFF00]"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
              <span>{fechaSeleccionada ? new Date(fechaSeleccionada).toLocaleDateString('es-CO', { timeZone: 'UTC' }) : "Seleccionar fecha"}</span>
              <input type="date" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
            </label>
          </div>
        </div>

        {/* Grid metricas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-[#141416] p-6 rounded-xl border border-[#202024] h-[130px] flex flex-col justify-between">
              <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Sorteos jugados</span>
              <h2 className="text-4xl font-black text-[#9EFF00] font-mono">{sorteosJugados}</h2>
            </div>
            <div className="bg-[#141416] p-6 rounded-xl border border-[#202024] h-[130px] flex flex-col justify-between">
              <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Último Resultado Baloto</span>
              <div className="flex gap-3 text-2xl font-black text-[#9EFF00] font-mono tracking-tight">
                <span>{formBaloto.n1}</span><span>{formBaloto.n2}</span><span>{formBaloto.n3}</span><span>{formBaloto.n4}</span><span>{formBaloto.n5}</span><span className="text-[#FF5500]">{formBaloto.sb}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#141416] p-6 rounded-xl border border-[#202024] h-[130px] flex flex-col justify-between">
              <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Números más activos</span>
              <div className="flex gap-3 text-2xl font-black text-[#FF5500] font-mono tracking-tight">
                {numerosActivos.map((num, i) => (
                  <span key={i}>{num}</span>
                ))}
              </div>
            </div>
            <div className="bg-[#141416] p-6 rounded-xl border border-[#202024] h-[130px] flex flex-col justify-between">
              <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Último Resultado Revancha</span>
              <div className="flex gap-3 text-2xl font-black text-[#9EFF00] font-mono tracking-tight">
                <span>{formRevancha.n1}</span><span>{formRevancha.n2}</span><span>{formRevancha.n3}</span><span>{formRevancha.n4}</span><span>{formRevancha.n5}</span><span className="text-[#FF5500]">{formRevancha.sb}</span>
              </div>
            </div>
          </div>

          {/* Generador interactivo */}
          <div className="bg-[#141416] p-6 rounded-xl border border-[#202024] flex flex-col justify-between h-[284px]">
            <div className="text-center">
              <span className="text-sm font-bold text-white tracking-wide block mb-4">Generar nuevo sorteo</span>
              <div className={`flex gap-3 justify-center text-2xl font-black text-[#9EFF00] font-mono tracking-tight my-4 transition-opacity ${loadingPredict ? 'opacity-40 animate-pulse' : ''}`}>
                <span>{prediccion.n1}</span><span>{prediccion.n2}</span><span>{prediccion.n3}</span><span>{prediccion.n4}</span><span>{prediccion.n5}</span><span className="text-[#FF5500]">{prediccion.sb}</span>
              </div>
            </div>
            <button 
              onClick={handleGenerarPrediccion}
              disabled={loadingPredict}
              className="w-full py-2.5 bg-transparent border border-[#9EFF00] text-[#9EFF00] font-mono text-xs rounded-xl hover:bg-[#9EFF00] hover:text-black hover:shadow-[0_0_15px_rgba(158,255,0,0.15)] transition-all duration-200 disabled:opacity-50"
            >
              {loadingPredict ? "Calculando probabilidades..." : "Generar próximo resultado"}
            </button>
          </div>
        </div>

        {/* BOTTOM CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <SorteoInputCard 
            title="Resultado Baloto" tarjetaKey="baloto" form={formBaloto} isEditing={editando.baloto}
            onEditToggle={() => toggleEdit('baloto')} onInputChange={(campo, valor) => handleInputChange('baloto', campo, valor)}
          />

          <SorteoInputCard 
            title="Resultado Baloto Revancha" tarjetaKey="revancha" form={formRevancha} isEditing={editando.revancha}
            onEditToggle={() => toggleEdit('revancha')} onInputChange={(campo, valor) => handleInputChange('revancha', campo, valor)}
          />

          <SorteoInputCard 
            title="Balotas Jugadas" tarjetaKey="jugadas" form={formJugadas} isEditing={editando.jugadas}
            onEditToggle={() => toggleEdit('jugadas')} onInputChange={(campo, valor) => handleInputChange('jugadas', campo, valor)}
          />
        </div>

        <div className="text-right pt-6 text-xs font-mono text-[#9EFF00]/70">
          Creado por:{" "}
          <a href="https://brayanalbadam.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-[#9EFF00] font-bold transition-all">
            Brayanalbadam.com
          </a>
        </div>

      </div>
    </main>
  );
}