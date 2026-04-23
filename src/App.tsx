import { useState } from 'react';

export default function App() {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [veredicto, setVeredicto] = useState('');
  const [cargando, setCargando] = useState(false);

  const buscar = async () => {
    if (!termino.trim()) return;
    setCargando(true);
    setResultados([]);
    setVeredicto('');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // Environment-based API configuration
      const isDevelopment = import.meta.env.DEV;
      const apiUrl = isDevelopment 
        ? 'http://localhost:10000/ahorros' 
        : 'https://proyectocompras.onrender.com/ahorros';
      
      // All radar calls use /buscar endpoint with ?q= parameter
      const url = `${apiUrl}/buscar?q=${encodeURIComponent(termino)}`;
      
      const respuesta = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });

      if (!respuesta.ok) throw new Error('Error en la respuesta');
      
      const data = await respuesta.json();
      setResultados(data.resultados || []);
      setVeredicto(data.veredicto || '');
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setVeredicto("El radar tardó demasiado en despertar (Render está calentando). Por favor, intenta de nuevo.");
      } else {
        setVeredicto("El radar se está reiniciando. Por favor, intenta de nuevo en un momento.");
      }
    } finally {
      clearTimeout(timeoutId);
      setCargando(false);
    }
  };

  const tieneResultados = resultados.length > 0 || veredicto !== '';

  return (
    <div className={`min-h-screen bg-[#f8fafc] flex flex-col items-center px-4 font-sans transition-all duration-700 ${!tieneResultados ? 'justify-center' : 'pt-10'}`}>
      
      {/* --- HEADER: Diseño de Marca Estilo Uber con Contenedor Compacto --- */}
      <div className={`w-full flex flex-col items-center justify-center transition-all duration-700 ${!tieneResultados ? 'mb-4' : 'mb-6'}`}>
        
        {/* Contenedor circular: Logo flotando sin fondo, con sombra suave */}
        <div className={`rounded-full flex items-center justify-center p-2 shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all duration-700 ${!tieneResultados ? 'w-28 h-28 mb-4' : 'w-14 h-14 mb-2'}`}>
          <img 
            src="/logo.png" 
            alt="ComprAhorro" 
            className={`transition-all duration-700 object-contain ${!tieneResultados ? 'w-[90%] h-[90%]' : 'w-[90%] h-[90%]'}`} 
          />
        </div>
        <h1 className={`font-black text-[#0a192f] transition-all duration-700 ${!tieneResultados ? 'text-6xl' : 'text-3xl'}`}>
          ComprAhorro
        </h1>
        <p className={`text-slate-500 font-medium italic transition-all duration-700 ${!tieneResultados ? 'text-xl mb-6' : 'text-sm mb-4'}`}>
          Busca, compara y ahorra
        </p>
        
        {/* SLOGAN ESTRATÉGICO DE 3 PASOS */}
        {!tieneResultados && (
          <div className="flex flex-col items-center w-full max-w-2xl mb-10 text-center animate-fade-in px-4">
            <h2 className="text-2xl md:text-3xl font-black text-emerald-600 mb-8 uppercase tracking-tight">
              ¡Nosotros buscamos, tú ahorras!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm font-bold text-slate-600">
              <div className="flex flex-col items-center text-center">
                <span className="text-emerald-500 text-lg mb-1">1. COMPARA</span>
                <p className="normal-case font-medium text-gray-500 leading-tight">Precios en tiempo real de varios comercios</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-emerald-500 text-lg mb-1">2. ELIGE</span>
                <p className="normal-case font-medium text-gray-500 leading-tight">Con total calma y tranquilidad</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-emerald-500 text-lg mb-1">3. COMPRA</span>
                <p className="normal-case font-medium text-gray-500 leading-tight">Directo sin intermediarios</p>
              </div>
            </div>
          </div>
        )}

        {/* BUSCADOR SIMÉTRICO */}
        <div className="flex w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
          <input
            type="text"
            placeholder="¿Qué quieres ahorrar hoy?"
            className="flex-grow px-6 py-4 text-slate-700 focus:outline-none text-lg"
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
          />
          <button 
            onClick={buscar} 
            disabled={cargando} 
            className="bg-[#0a192f] text-white font-bold px-8 py-4 hover:bg-emerald-600 transition-colors disabled:bg-slate-400"
          >
            {cargando ? '...' : 'BUSCAR'}
          </button>
        </div>
      </div>

      {/* ÁREA DE RESULTADOS */}
      <div className="w-full max-w-4xl pb-20 mt-10">
        {veredicto && (
          <div className="bg-white p-6 mb-8 rounded-3xl shadow-sm border-l-8 border-emerald-500 flex items-center animate-in slide-in-from-bottom-2 duration-500">
            <span className="text-3xl mr-4">💡</span>
            <p className="font-bold text-xl text-slate-800 leading-tight">{veredicto}</p>
          </div>
        )}

        <div className="space-y-6">
          {resultados.map((item, index) => (
            <div key={index} className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-all group">
              <div className="md:w-48 bg-white flex-shrink-0 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-50">
                {item.imagen ? (
                  <img src={item.imagen} alt={item.producto} className="max-h-32 w-full object-contain group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="bg-slate-50 w-full h-32 rounded-2xl flex items-center justify-center text-slate-300">📷</div>
                )}
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-2 inline-block">
                    {item.tienda}
                  </span>
                  <h3 className="font-bold text-slate-900 text-xl leading-tight">{item.producto}</h3>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-3xl font-black text-emerald-600">{item.precioFinal}</span>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="bg-[#0a192f] text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all">
                    VER TIENDA
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}