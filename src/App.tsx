import { useState, useEffect } from 'react';

export default function App() {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [veredicto, setVeredicto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [coords, setCoords] = useState({ lat: '8.9833', lon: '-79.5167' });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude.toString(), lon: pos.coords.longitude.toString() }),
        () => console.log("Usando Panamá City por defecto"),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const buscar = async () => {
     if (!termino.trim()) return;
     setCargando(true);
     setResultados([]); 
     setVeredicto('');
     
     try {
        const url = `https://comprahorro-backend-1.onrender.com/ahorros/buscar?q=${encodeURIComponent(termino)}`;
        const respuesta = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout ? AbortSignal.timeout(30000) : new AbortController().signal 
        });
        
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        
        const data = await respuesta.json();
        setResultados(data.resultados || []);
        setVeredicto(data.veredicto || '');
     } catch (error) {
        setVeredicto("El motor está despertando. Por favor, reintenta en unos segundos.");
     }
     setCargando(false);
  };

  const tieneResultados = resultados.length > 0 || veredicto !== '';

  return (
    <div className={`min-h-screen bg-[#f8fafc] flex flex-col items-center px-4 font-sans text-slate-900 transition-all duration-700 ${!tieneResultados ? 'justify-center' : 'pt-10'}`}>
      
      {/* HEADER: Logo más grande y transición suave */}
      <div className={`w-full flex flex-col items-center transition-all duration-700 ${!tieneResultados ? 'mb-4' : 'mb-6'}`}>
        <img 
          src="/logo.png" 
          alt="Logo" 
          className={`transition-all duration-700 drop-shadow-2xl ${!tieneResultados ? 'w-64 mb-4' : 'w-28 mb-2'}`} 
        />
        <h1 className={`font-black text-[#0a192f] tracking-tighter transition-all duration-700 ${!tieneResultados ? 'text-6xl' : 'text-3xl'}`}>
          ComprAhorro
        </h1>
        <p className={`text-slate-500 font-medium italic transition-all duration-700 ${!tieneResultados ? 'text-xl mb-6' : 'text-sm mb-4'}`}>
          Busca, compara y ahorra
        </p>
        
        {/* SLOGAN: Centrado y Estilizado */}
        {!tieneResultados && (
          <div className="flex flex-col items-center w-full max-w-xl mb-8 animate-fade-in">
            <h2 className="text-xl md:text-2xl font-bold text-emerald-600 mb-2 text-center">
              ¡Nosotros buscamos, tú ahorras!
            </h2>
            <div className="flex justify-center gap-x-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <span>TIEMPO REAL</span>
              <span>•</span>
              <span>SIN INTERMEDIARIOS</span>
            </div>
          </div>
        )}

        {/* BUSCADOR: Más estrecho para mejor simetría (max-w-xl) */}
        <div className="flex w-full max-w-xl bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-slate-200 overflow-hidden focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
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
            className="bg-[#0a192f] text-white font-bold px-8 py-4 hover:bg-emerald-600 transition-colors disabled:bg-slate-400 text-sm uppercase"
          >
            {cargando ? '...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* ÁREA DE RESULTADOS */}
      <div className="w-full max-w-4xl pb-20">
        {veredicto && (
          <div className="bg-white p-6 mb-8 rounded-3xl shadow-sm border-l-8 border-emerald-500 flex items-center animate-in slide-in-from-bottom-2 duration-500">
            <span className="text-3xl mr-4">💡</span>
            <p className="font-bold text-xl text-slate-800">{veredicto}</p>
          </div>
        )}

        <div className="space-y-6">
          {resultados.map((item, index) => (
            <div key={index} className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-all group">
              <div className="md:w-48 bg-white flex-shrink-0 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-50">
                {item.imagen ? (
                  <img src={item.imagen} className="max-h-32 w-full object-contain group-hover:scale-105 transition-transform" />
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
                  <a href={item.link} target="_blank" className="bg-[#0a192f] text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all">
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