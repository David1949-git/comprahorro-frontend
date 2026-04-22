{/* --- HEADER DINÁMICO --- */}
<div className={`w-full flex flex-col items-center transition-all duration-700 ${!tieneResultados ? 'mb-4' : 'mb-6'}`}>
  
  {/* Contenedor circular para disimular el recuadro blanco del logo */}
  <div className={`bg-white rounded-full flex items-center justify-center p-3 shadow-[0_10px_35px_rgba(0,0,0,0.1)] transition-all duration-700 ${!tieneResultados ? 'w-56 h-56 mb-5' : 'w-24 h-24 mb-3'}`}>
    <img 
      src="/logo.png" 
      alt="Logo" 
      className={`transition-all duration-700 ${!tieneResultados ? 'w-48' : 'w-16'}`} 
    />
  </div>

  <h1 className={`font-black text-[#0a192f] tracking-tighter transition-all duration-700 ${!tieneResultados ? 'text-6xl' : 'text-3xl'}`}>
    ComprAhorro
  </h1>
  <p className={`text-slate-500 font-medium italic transition-all duration-700 ${!tieneResultados ? 'text-xl mb-4' : 'text-sm mb-2'}`}>
    Busca, compara y ahorra
  </p>
  
  {/* SLOGAN FINAL COMPLETO (Solo visible antes de buscar para mantener limpieza) */}
  {!tieneResultados && (
    <div className="flex flex-col items-center w-full max-w-2xl mb-8 animate-fade-in text-center px-4">
      <h2 className="text-2xl md:text-3xl font-black text-emerald-600 mb-4">
        ¡Nosotros buscamos, tú ahorras! [cite: 2]
      </h2>
      
      {/* Las 3 promesas del documento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-medium text-slate-600 uppercase tracking-tight">
        <div className="flex flex-col items-center">
          <span className="text-emerald-500 font-black text-lg">1. COMPARA</span>
          <p className="normal-case text-gray-500 leading-tight">Precios de varios comercios en tiempo real [cite: 3]</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-emerald-500 font-black text-lg">2. ELIGE</span>
          <p className="normal-case text-gray-500 leading-tight">Con total calma y tranquilidad [cite: 4]</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-emerald-500 font-black text-lg">3. COMPRA</span>
          <p className="normal-case text-gray-500 leading-tight">Directo sin intermediarios para tu máximo ahorro [cite: 5]</p>
        </div>
      </div>
    </div>
  )}

  {/* BUSCADOR SIMÉTRICO (Igual que antes) */}
  <div className="flex w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
    <input
      type="text"
      placeholder="¿Qué quieres ahorrar hoy?"
      className="flex-grow px-6 py-4 text-slate-700 focus:outline-none text-lg"
      value={termino}
      onChange={(e) => setTermino(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && buscar()}
    />
    <button onClick={buscar} disabled={cargando} className="bg-[#0a192f] text-white font-bold px-8 py-4 hover:bg-emerald-600 transition-colors disabled:bg-slate-400">
      {cargando ? '...' : 'BUSCAR'}
    </button>
  </div>
</div>