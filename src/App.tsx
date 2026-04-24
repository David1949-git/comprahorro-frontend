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
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://comprahorro-backend-1.onrender.com/ahorros';
      
      const respuesta = await fetch(`${apiUrl}/buscar?q=${encodeURIComponent(termino)}`, { 
        method: 'GET', 
        signal: controller.signal 
      });

      if (!respuesta.ok) throw new Error('Error de conexión');
      
      const data = await respuesta.json();
      
      // ORDENAMIENTO ESTRICTO: 
      // 1. Con Precio y Imagen
      // 2. Con Precio sin Imagen
      // 3. El resto (Consultar)
      const listaOrdenada = (data.resultados || []).sort((a: any, b: any) => {
        const scoreA = (a.precioFinal && a.precioFinal.includes('$') ? 10 : 0) + (a.imagen ? 5 : 0);
        const scoreB = (b.precioFinal && b.precioFinal.includes('$') ? 10 : 0) + (b.imagen ? 5 : 0);
        return scoreB - scoreA;
      });

      setResultados(listaOrdenada);
      setVeredicto(data.veredicto || '');
    } catch (e) {
      setVeredicto("El radar está buscando. Si no ves resultados, intenta con un término más corto.");
    } finally {
      clearTimeout(timeoutId);
      setCargando(false);
    }
  };

  const tieneResultados = resultados.length > 0 || veredicto !== '';

  return (
    <div className={`min-h-screen bg-[#f8fafc] flex flex-col items-center px-4 font-sans transition-all duration-700 ${!tieneResultados ? 'justify-center' : 'pt-10'}`}>
      
      {/* HEADER DEFINITIVO */}
      <div className={`w-full flex flex-col items-center justify-center transition-all duration-700 ${!tieneResultados ? 'mb-4' : 'mb-6'}`}>
        <div className="bg-white rounded-full p-2 w-56 h-56 shadow-2xl mb-8 border-4 border-emerald-50 overflow-hidden">
          <img src="/logo.png" alt="ComprAhorro" className="w-full h-full object-contain mix-blend-multiply" />
        </div>

        <h1 className={`font-black text-[#0a192f] transition-all duration-700 ${!tieneResultados ? 'text-6xl text-center' : 'text-3xl'}`}>ComprAhorro</h1>
        {!tieneResultados && (
          <div className="flex flex-col items-center animate-fade-in mt-6">
            <h2 className="text-2xl md:text-3xl font-black text-emerald-600 mb-8 uppercase tracking-tight">¡Nosotros buscamos, tú ahorras!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm font-bold text-slate-600">
              <div className="flex flex-col items-center">
                <span className="text-emerald-500 text-lg">1. COMPARA</span>
                <p className="font-medium text-gray-400">Precios reales</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-emerald-500 text-lg">2. ELIGE</span>
                <p className="font-medium text-gray-400">Sin presiones</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-emerald-500 text-lg">3. COMPRA</span>
                <p className="font-medium text-gray-400">Directo al grano</p>
              </div>
            </div>
          </div>
        )}

        {/* BUSCADOR */}
        <div className="flex w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mt-8 focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
          <input
            type="text"
            placeholder="¿Qué quieres ahorrar hoy?"
            className="flex-grow px-6 py-4 text-slate-700 focus:outline-none text-lg"
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
          />
          <button onClick={buscar} disabled={cargando} className="bg-[#0a192f] text-white font-bold px-8 py-4 hover:bg-emerald-600">
            {cargando ? '...' : 'BUSCAR'}
          </button>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="w-full max-w-4xl pb-20 mt-10">
        {veredicto && (
          <div className="bg-white p-6 mb-8 rounded-3xl shadow-sm border-l-8 border-emerald-500 flex items-center">
            <span className="text-3xl mr-4">💡</span>
            <p className="font-bold text-xl text-slate-800 leading-tight">{veredicto}</p>
          </div>
        )}

        <div className="space-y-6">
          {resultados.map((item, index) => (
            <div key={index} className={`bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-all ${!item.precioFinal || !item.precioFinal.includes('$') ? 'opacity-70' : ''}`}>
              <div className="md:w-48 bg-white flex-shrink-0 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-50">
                {item.imagen ? (
                  <img src={item.imagen} alt={item.producto} className="max-h-32 w-full object-contain" />
                ) : (
                  <div className="bg-slate-50 w-24 h-24 rounded-2xl flex items-center justify-center text-4xl">📷</div>
                )}
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-2 inline-block">{item.tienda}</span>
                  <h3 className="font-bold text-slate-900 text-xl leading-tight">{item.producto}</h3>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-3xl font-black text-emerald-600">{item.precioFinal || 'Ver precio'}</span>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="bg-[#0a192f] text-white px-6 py-2 rounded-xl font-bold text-sm">VER TIENDA</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
