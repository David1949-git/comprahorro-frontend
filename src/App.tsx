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
        const url = `https://comprahorro-backend-1.onrender.com/ahorros/buscar?q=${encodeURIComponent(termino)}&lat=${coords.lat}&lon=${coords.lon}`;
        const respuesta = await fetch(url);
        const data = await respuesta.json();
        setResultados(data.resultados || []);
        setVeredicto(data.veredicto || '');
     } catch (error) {
        setVeredicto("Error de conexión con el motor local.");
     }
     setCargando(false);
  };

  const tieneResultados = resultados.length > 0 || veredicto !== '';

  return (
    <div className={`min-h-screen bg-[#f8fafc] flex flex-col items-center px-4 font-sans text-slate-900 transition-all duration-700 ${!tieneResultados ? 'justify-center' : 'pt-10'}`}>
      
      {/* HEADER DINÁMICO */}
      <div className={`w-full max-w-6xl flex flex-col items-center transition-all duration-700 ${!tieneResultados ? 'mb-8' : 'mb-6'}`}>
        <img src="/logo.png" alt="Logo" className={`transition-all duration-700 ${!tieneResultados ? 'w-48 mb-6' : 'w-24 mb-2'}`} />
        <h1 className={`font-black text-[#0a192f] tracking-tighter transition-all duration-700 ${!tieneResultados ? 'text-6xl' : 'text-3xl'}`}>
          ComprAhorro
        </h1>
        <p className={`text-slate-500 font-medium italic transition-all duration-700 ${!tieneResultados ? 'text-xl mb-10' : 'text-sm mb-4'}`}>
          Busca, compara y ahorra en Panamá 🇵🇦
        </p>

        {/* BUSCADOR POTENTE */}
        <div className="flex w-full max-w-3xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-slate-200 overflow-hidden focus-within:ring-4 focus-within:ring-blue-100 transition-all">
          <input
            type="text"
            placeholder="¿Qué quieres ahorrar hoy?"
            className="flex-grow px-8 py-5 text-slate-700 focus:outline-none text-xl"
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
          />
          <button onClick={buscar} disabled={cargando} className="bg-[#0a192f] text-white font-bold px-10 py-5 hover:bg-black transition-colors disabled:bg-slate-400 text-lg uppercase tracking-tighter">
            {cargando ? '...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* RESULTADOS - ESTILO FULL SCREEN */}
      <div className="w-full max-w-6xl pb-20">
        {veredicto && (
          <div className="bg-white p-8 mb-10 rounded-[2.5rem] shadow-sm border border-blue-50 flex items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="text-4xl mr-6">💡</span>
            <p className="font-bold text-2xl leading-snug text-slate-800">{veredicto}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {resultados.length > 0 ? (
            resultados.map((item, index) => (
              <div key={index} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all duration-300 group">
                <div className="md:w-64 bg-white flex-shrink-0 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-50">
                  {item.imagen ? (
                    <img src={item.imagen} className="max-h-48 w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="bg-slate-50 w-full h-48 rounded-2xl flex items-center justify-center text-slate-300 text-5xl">📷</div>
                  )}
                </div>
                <div className="p-10 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-4 py-2 rounded-full mb-4 inline-block">{item.tienda}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-3xl leading-tight mb-2">{item.producto}</h3>
                  </div>
                  <div className="flex items-center justify-between mt-8">
                    <span className="text-5xl font-black text-emerald-600 tracking-tighter">{item.precioFinal}</span>
                    <a href={item.link} target="_blank" className="bg-[#0a192f] text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-800 transition-all shadow-lg hover:-translate-y-1">IR A LA TIENDA</a>
                  </div>
                </div>
              </div>
            ))
          ) : !cargando && !tieneResultados && (
            <div className="text-center opacity-20 mt-10">
              <p className="text-2xl font-black uppercase tracking-widest">        <div className="mt-8 p-4 bg-emerald-50 rounded-xl">¡Nosotros buscamos, tú ahorras!</div></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

