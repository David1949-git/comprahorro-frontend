import { useState, useEffect } from 'react';
import { getAhorrosApiUrl } from '@/lib/api';
import apiClient from '@/lib/axios';

type Factura  = { precioBase: number; impuestos: number; delivery: number; servicioPrestado: number; totalFinal: number; };
type Resultado = { producto: string; tienda: string; precioFinal?: string; imagen?: string; link?: string; affiliateUrl?: string; rating?: number; reviews?: number; };

// ── Colores por tienda ────────────────────────────────────────────────────────
const STORE_COLORS: Record<string, string> = {
  'super xtra': '#1d4ed8', 'xtra': '#1d4ed8',
  'super 99':   '#b91c1c',
  'machetazo':  '#c2410c', 'el machetazo': '#c2410c',
  'rey':        '#15803d', 'supermercados rey': '#15803d',
  'cochez':     '#7c3aed',
  'nirsa':      '#0891b2',
};
function storeColor(t: string) {
  const k = (t || '').toLowerCase();
  for (const [key, val] of Object.entries(STORE_COLORS)) if (k.includes(key)) return val;
  return '#475569';
}

function tienePrecioValido(r: Resultado) {
  return !!r.precioFinal && r.precioFinal !== 'Sin precio' && r.precioFinal !== 'Ver precio' && r.precioFinal.trim() !== '';
}
function tieneImagenValida(r: Resultado) {
  return !!r.imagen && r.imagen !== '' && !r.imagen.includes('logo');
}
function precioNum(p?: string): number {
  if (!p || p === 'Sin precio') return Infinity;
  const n = parseFloat(p.replace(/[^0-9.]/g, ''));
  return isFinite(n) ? n : Infinity;
}

const FALLBACK = '/cerdo-logo.jpg';

export default function App() {
  const [termino, setTermino]       = useState('');
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [veredicto, setVeredicto]   = useState('');
  const [cargando, setCargando]     = useState(false);
  const [factura, setFactura]       = useState<Factura | null>(null);
  const [itemSel, setItemSel]       = useState<Resultado | null>(null);
  const [ubicacion, setUbicacion]   = useState<{lat:number;lon:number}|null>(null);
  const [verMasRefs, setVerMasRefs] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstall, setShowInstall]     = useState(false);

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  useEffect(() => {
    if ('serviceWorker' in navigator)
      window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
  }, []);
  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
    setInstallPrompt(null);
  };
  useEffect(() => {
    const fetchIP = async () => {
      try { const r = await fetch('https://ipapi.co/json/'); const d = await r.json(); if (d.latitude) setUbicacion({ lat: d.latitude, lon: d.longitude }); } catch {}
    };
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => setUbicacion({ lat: p.coords.latitude, lon: p.coords.longitude }), fetchIP, { timeout: 10000 });
    else fetchIP();
  }, []);

  const volverInicio = () => { setResultados([]); setVeredicto(''); setFactura(null); setItemSel(null); setVerMasRefs(false); };

  const buscar = async () => {
    if (!termino.trim()) return;
    const token = localStorage.getItem('comprAhorro_token');
    if (!token) { sessionStorage.setItem('comprAhorro_termino_pendiente', termino); window.location.href = '/register.html'; return; }
    setCargando(true); setFactura(null); setVerMasRefs(false);
    try {
      const params: Record<string,string> = { q: termino, _t: Date.now().toString() };
      if (ubicacion) { params.lat = ubicacion.lat.toString(); params.lon = ubicacion.lon.toString(); }
      const res = await apiClient.get('https://comprahorro-backend-1.onrender.com/api/ahorros/buscar', { params, headers: { 'Cache-Control': 'no-cache' } });
      setResultados([]);
      setTimeout(() => { setResultados(res.data.resultados || []); setVeredicto(res.data.veredicto || ''); setCargando(false); }, 100);
    } catch { setCargando(false); setVeredicto('Error de conexión. Intenta de nuevo.'); setResultados([]); }
  };

  useEffect(() => {
    const pend = sessionStorage.getItem('comprAhorro_termino_pendiente');
    const tok  = localStorage.getItem('comprAhorro_token');
    if (pend && tok) { sessionStorage.removeItem('comprAhorro_termino_pendiente'); setTermino(pend); setTimeout(() => document.getElementById('btn-buscar')?.click(), 500); }
  }, []);

  const generarFactura = async (item: Resultado) => {
    if (!item?.precioFinal) return;
    setCargando(true);
    try {
      const precioBase = item.precioFinal.replace(/[^0-9.]/g, '') || '0';
      const res = await apiClient.get(`${getAhorrosApiUrl()}/factura`, { params: { precioBase } });
      setFactura(res.data); setItemSel(item);
    } catch { setVeredicto('No se pudo generar la factura.'); }
    finally { setCargando(false); }
  };

  const tieneResultados   = resultados.length > 0 || veredicto !== '';
  const conPrecioEImagen  = resultados.filter(r => tienePrecioValido(r) && tieneImagenValida(r));
  const conPrecioSinImg   = resultados.filter(r => tienePrecioValido(r) && !tieneImagenValida(r));
  const sinPrecio         = resultados.filter(r => !tienePrecioValido(r));
  const ganador = conPrecioEImagen.length > 0
    ? conPrecioEImagen.reduce((m, r) => precioNum(r.precioFinal) < precioNum(m.precioFinal) ? r : m)
    : null;

  // Resumen por tienda (pills horizontales)
  const resumenTiendas = [...new Set(resultados.filter(tienePrecioValido).map(r => r.tienda))]
    .map(tienda => {
      const prods  = resultados.filter(r => r.tienda === tienda && tienePrecioValido(r));
      const mejor  = prods.reduce((m, r) => precioNum(r.precioFinal) < precioNum(m.precioFinal) ? r : m);
      return { nombre: tienda, mejorPrecio: mejor.precioFinal, count: prods.length };
    });

  // ── PANTALLA INICIO ─────────────────────────────────────────────────────────
  if (!tieneResultados) return (
    <div className="min-h-screen flex flex-col" style={{background:'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 50%,#dbeafe 100%)'}}>
      <nav className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/cerdo-logo.jpg" className="w-8 h-8 rounded-full object-cover shadow" alt="logo"/>
          <span className="font-extrabold text-lg" style={{color:'#1e3a8a'}}>Compr<span style={{color:'#16a34a'}}>Ahorro</span></span>
        </div>
        <div className="hidden md:flex gap-1 text-xs font-black tracking-widest" style={{color:'#1e3a8a'}}>
          <span>COMPARA</span><span className="mx-2">·</span><span>ELIGE</span><span className="mx-2">·</span><span>COMPRA</span>
        </div>
        <div className="flex gap-1 sm:gap-2">
          <a href="/login.html" className="text-xs sm:text-sm font-semibold px-3 py-2 rounded-full hover:bg-blue-50" style={{color:'#1e3a8a'}}>Entrar</a>
          <a href="/register.html" className="text-xs sm:text-sm font-bold px-3 py-2 rounded-full text-white shadow" style={{backgroundColor:'#1e40af'}}>Registrarse</a>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 sm:py-16 text-center">
        <div style={{width:'min(150px,40vw)',height:'min(150px,40vw)',borderRadius:'50%',margin:'0 auto 20px',background:'radial-gradient(circle at 40% 35%,#fff 60%,#dbeafe 100%)',boxShadow:'0 20px 60px rgba(30,64,175,0.18)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <img src="/cerdo-logo.jpg" alt="ComprAhorro" style={{width:'75%',height:'75%',objectFit:'contain'}}/>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black mb-1" style={{color:'#1e3a8a',letterSpacing:'-1px'}}>
          Compr<span style={{color:'#16a34a'}}>Ahorro</span>
        </h1>
        <p className="text-base sm:text-lg font-bold mb-4" style={{color:'#16a34a'}}>¡Nosotros buscamos, tú ahorras!</p>

        {/* Tiendas que comparamos */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 hidden">
          {[].map(([n,c])=>(
            <span key={n} className="text-xs font-black px-3 py-1 rounded-full text-white" style={{backgroundColor:c}}>{n}</span>
          ))}
        </div>

        <div className="flex gap-5 sm:gap-10 mb-8">
          {[['COMPARA','Precios reales'],['ELIGE','Sin presiones'],['COMPRA','Sin intermediarios']].map(([l,d])=>(
            <div key={l} className="flex flex-col items-center">
              
              <span className="text-[10px] sm:text-xs font-black tracking-widest mt-1" style={{color:'#16a34a'}}>{l}</span>
              <span className="text-[10px] sm:text-xs mt-1 block" style={{color:'#1e3a8a'}}>{d}</span>
            </div>
          ))}
        </div>

        <div className="w-full max-w-2xl flex rounded-2xl overflow-hidden shadow-2xl" style={{border:'1px solid #e2e8f0',background:'white'}}>
          <input type="text" placeholder="¿Qué quieres ahorrar hoy?"
            value={termino} onChange={e=>setTermino(e.target.value)} onKeyDown={e=>e.key==='Enter'&&buscar()}
            className="flex-grow px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base focus:outline-none" style={{color:'#1e3a8a'}}/>
          <button id="btn-buscar" onClick={buscar} disabled={cargando}
            className="px-5 sm:px-8 py-3 sm:py-4 text-white font-black text-sm hover:opacity-90 transition-opacity"
            style={{backgroundColor:'#1e293b',minWidth:80}}>
            {cargando ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"/> : 'BUSCAR'}
          </button>
        </div>
        <p className="mt-3 text-xs" style={{color:'#94a3b8'}}>Crea tu cuenta gratis y empieza a ahorrar 🐷</p>
      </main>

      <footer className="py-8 px-6 text-white" style={{backgroundColor:'#0f172a'}}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <div><p className="font-black text-sm mb-2">Compr<span style={{color:'#4ade80'}}>Ahorro</span></p><p style={{color:'#94a3b8'}}>La plataforma inteligente para comparar precios en Panamá.</p></div>
          <div><p className="font-black tracking-widest uppercase mb-3" style={{color:'#94a3b8'}}>Navegación</p><ul className="space-y-2" style={{color:'#cbd5e1'}}><li><a href="/" className="hover:text-white">Inicio</a></li><li><a href="/login.html" className="hover:text-white">Mi Cuenta</a></li></ul></div>
          <div><p className="font-black tracking-widest uppercase mb-3" style={{color:'#94a3b8'}}>Tiendas</p><ul className="space-y-2" style={{color:'#cbd5e1'}}><li>Super Xtra</li><li>Super 99</li><li>El Machetazo</li><li>Rey</li></ul></div>
          <div><p className="font-black tracking-widest uppercase mb-3" style={{color:'#94a3b8'}}>Contacto</p><ul className="space-y-2" style={{color:'#cbd5e1'}}><li>Soporte</li><li>Sobre Nosotros</li></ul></div>
        </div>
      </footer>

      {showInstall && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white shadow-2xl" style={{borderTop:'2px solid #dbeafe'}}>
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <img src="/cerdo-logo.jpg" className="w-11 h-11 rounded-full object-cover flex-shrink-0"/>
            <div className="flex-grow"><p className="font-black text-sm" style={{color:'#1e3a8a'}}>Instalar ComprAhorro 🐷</p><p className="text-xs" style={{color:'#94a3b8'}}>Accede más rápido desde tu pantalla de inicio</p></div>
            <button onClick={handleInstall} className="px-4 py-2 rounded-xl font-black text-white text-sm" style={{backgroundColor:'#1e40af'}}>Instalar</button>
            <button onClick={()=>setShowInstall(false)} className="text-gray-400 text-xl px-1">✕</button>
          </div>
        </div>
      )}
    </div>
  );

  // ── PANTALLA RESULTADOS ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{background:'#f1f5f9'}}>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-20 bg-white border-b flex items-center gap-2 px-3 py-2" style={{borderColor:'#e2e8f0',boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}>
        <button onClick={volverInicio} className="flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-lg hover:bg-slate-100 flex-shrink-0" style={{color:'#1e3a8a',border:'1px solid #dbeafe'}}>← Inicio</button>
        <img src="/cerdo-logo.jpg" onClick={volverInicio} className="w-7 h-7 rounded-full object-cover cursor-pointer flex-shrink-0" alt="logo"/>
        <div className="flex flex-grow rounded-xl overflow-hidden" style={{border:'1.5px solid #e2e8f0',background:'white',maxWidth:500}}>
          <input type="text" value={termino} onChange={e=>setTermino(e.target.value)} onKeyDown={e=>e.key==='Enter'&&buscar()}
            placeholder="Nueva búsqueda..." className="flex-grow px-3 py-2 text-sm focus:outline-none" style={{color:'#1e3a8a',minWidth:0}}/>
          <button id="btn-buscar" onClick={buscar} disabled={cargando} className="px-4 py-2 text-white text-xs font-black hover:opacity-90 flex-shrink-0" style={{backgroundColor:'#1e293b'}}>
            {cargando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : 'BUSCAR'}
          </button>
        </div>
      </nav>

      <main className="flex-grow max-w-6xl w-full mx-auto px-3 sm:px-4 py-5 pb-24">

        {/* VEREDICTO IA */}
        {veredicto && veredicto !== 'Comparando precios en Panamá...' && (
          <div className="flex items-start gap-3 bg-white rounded-2xl p-4 mb-5 shadow-sm" style={{borderLeft:'4px solid #16a34a'}}>
            <img src="/cerdo-logo.jpg" alt="ComprAhorro" className="w-7 h-7 rounded-full object-cover flex-shrink-0"/>
            <p className="text-sm font-semibold leading-relaxed" style={{color:'#1e3a8a'}}>{veredicto}</p>
          </div>
        )}

        {/* PILLS POR TIENDA */}
        {resumenTiendas.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{scrollbarWidth:'none'}}>
            {resumenTiendas.map(t => (
              <div key={t.nombre} className="flex-shrink-0 bg-white rounded-xl px-4 py-3 shadow-sm text-center" style={{borderTop:`3px solid ${storeColor(t.nombre)}`,minWidth:110}}>
                <p className="text-[10px] font-black uppercase tracking-wide mb-1" style={{color:storeColor(t.nombre)}}>{t.nombre}</p>
                <p className="text-lg font-black" style={{color:'#0f172a'}}>{t.mejorPrecio}</p>
                <p className="text-[10px]" style={{color:'#94a3b8'}}>{t.count} producto{t.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        )}

        {/* GANADOR */}
        {ganador && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span>🥇</span>
              <h2 className="font-black text-xs tracking-widest uppercase" style={{color:'#15803d'}}>Mejor precio encontrado</h2>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-md flex flex-col sm:flex-row" style={{border:`2px solid ${storeColor(ganador.tienda)}`}}>
              <div className="relative sm:w-48 flex-shrink-0 flex items-center justify-center p-5" style={{background:'#f8fafc',minHeight:150}}>
                <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-1 rounded-full text-white" style={{backgroundColor:storeColor(ganador.tienda)}}>💰 Precio más bajo</span>
                <img src={ganador.imagen||FALLBACK} alt={ganador.producto} className="max-h-28 max-w-full object-contain" onError={e=>{(e.target as HTMLImageElement).src=FALLBACK}}/>
              </div>
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div>
                  <span className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2 text-white" style={{backgroundColor:storeColor(ganador.tienda)}}>{ganador.tienda}</span>
                  <h3 className="font-bold text-base leading-snug" style={{color:'#0f172a'}}>{ganador.producto}</h3>
                </div>
                <div className="flex items-end justify-between mt-3 flex-wrap gap-3">
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{color:'#94a3b8'}}>PRECIO</p>
                    <span className="text-3xl sm:text-4xl font-black" style={{color:storeColor(ganador.tienda)}}>{ganador.precioFinal}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={()=>generarFactura(ganador)} className="text-sm px-4 py-2 rounded-xl font-bold hover:opacity-80" style={{border:`2px solid ${storeColor(ganador.tienda)}`,color:storeColor(ganador.tienda)}}>Ver recibo</button>
                    <a href={ganador.affiliateUrl||ganador.link} target="_blank" rel="noopener noreferrer nofollow" className="text-sm px-5 py-2 rounded-xl font-black text-white hover:opacity-90 shadow" style={{backgroundColor:storeColor(ganador.tienda)}}>IR A LA TIENDA →</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FACTURA */}
        {factura && itemSel && (
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm" style={{border:'1px solid #dbeafe'}}>
            <h2 className="font-black text-lg mb-4" style={{color:'#1e3a8a'}}>🧾 Recibo estimado</h2>
            <p className="text-sm mb-4 font-semibold" style={{color:'#475569'}}>Comercio: <strong>{itemSel.tienda}</strong></p>
            <div className="space-y-2 text-sm" style={{color:'#334155'}}>
              {[['Precio base',`$${factura.precioBase.toFixed(2)}`],['ITBMS 7%',`$${factura.impuestos.toFixed(2)}`],['Delivery estimado',`$${factura.delivery.toFixed(2)}`],['Servicio ComprAhorro',`$${factura.servicioPrestado.toFixed(2)}`]].map(([k,v])=>(
                <div key={k} className="flex justify-between py-2 border-b" style={{borderColor:'#f1f5f9'}}><span>{k}</span><span className="font-semibold">{v}</span></div>
              ))}
              <div className="flex justify-between pt-3 font-black text-base" style={{color:'#1e3a8a'}}><span>TOTAL ESTIMADO</span><span>${factura.totalFinal.toFixed(2)}</span></div>
            </div>
            <div className="flex gap-3 mt-5">
              <a href={itemSel.affiliateUrl||itemSel.link} target="_blank" rel="noopener noreferrer nofollow" className="px-5 py-2 rounded-xl text-sm font-black text-white hover:opacity-90" style={{backgroundColor:'#1e40af'}}>Comprar ahora</a>
              <button onClick={()=>setFactura(null)} className="px-5 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100" style={{border:'1px solid #e2e8f0',color:'#64748b'}}>Cerrar</button>
            </div>
          </div>
        )}

        {/* GRID PRINCIPAL — con precio + imagen ─────────────────────────── */}
        {conPrecioEImagen.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span>🛍️</span>
              <h2 className="font-black text-xs tracking-widest uppercase" style={{color:'#1e3a8a'}}>Productos con precio</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{backgroundColor:'#dbeafe',color:'#1e40af'}}>{conPrecioEImagen.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {conPrecioEImagen.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden flex flex-col" style={{boxShadow:'0 2px 12px rgba(0,0,0,0.07)',border:'1px solid #f1f5f9'}}>
                  {/* Imagen */}
                  <div className="relative flex items-center justify-center p-3" style={{background:'#f8fafc',height:148}}>
                    <span className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{backgroundColor:storeColor(item.tienda)}}/>
                    <img src={item.imagen||FALLBACK} alt={item.producto} className="max-h-28 max-w-full object-contain"
                      onError={e=>{(e.target as HTMLImageElement).src=FALLBACK}}/>
                  </div>
                  {/* Info */}
                  <div className="p-3 flex flex-col flex-grow">
                    <span className="text-[9px] font-black uppercase tracking-widest mb-1" style={{color:storeColor(item.tienda)}}>{item.tienda}</span>
                    <p className="text-xs font-semibold leading-snug flex-grow mb-2" style={{color:'#0f172a',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                      {item.producto}
                    </p>
                    {item.rating && item.rating > 0 ? (
                      <p className="text-xs mb-1" style={{color:'#f59e0b'}}>{'★'.repeat(Math.round(item.rating))}{'☆'.repeat(5-Math.round(item.rating))}</p>
                    ) : null}
                    <p className="text-xl font-black mb-3" style={{color:storeColor(item.tienda)}}>{item.precioFinal}</p>
                    <div className="flex gap-1.5 mt-auto">
                      <button onClick={()=>generarFactura(item)} className="text-[11px] px-2 py-1.5 rounded-lg font-bold hover:opacity-80 flex-shrink-0" style={{border:`1px solid ${storeColor(item.tienda)}`,color:storeColor(item.tienda)}}>
                        Recibo
                      </button>
                      <a href={item.affiliateUrl||item.link} target="_blank" rel="noopener noreferrer nofollow"
                        className="text-[11px] px-2 py-1.5 rounded-lg font-black text-white hover:opacity-90 flex-grow text-center"
                        style={{backgroundColor:storeColor(item.tienda)}}>
                        Ver en tienda →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LISTA SECUNDARIA — precio sin imagen ──────────────────────────── */}
        {conPrecioSinImg.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span>💲</span>
              <h2 className="font-black text-xs tracking-widest uppercase" style={{color:'#1e3a8a'}}>Más opciones con precio</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{backgroundColor:'#dbeafe',color:'#1e40af'}}>{conPrecioSinImg.length}</span>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{border:'1px solid #f1f5f9'}}>
              {conPrecioSinImg.map((item, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${i<conPrecioSinImg.length-1?'border-b':''}`} style={{borderColor:'#f8fafc'}}>
                  <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{backgroundColor:storeColor(item.tienda)}}/>
                  <div className="flex-grow min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{color:storeColor(item.tienda)}}>{item.tienda}</p>
                    <p className="text-sm font-semibold truncate" style={{color:'#1e3a8a'}}>{item.producto}</p>
                    <p className="text-sm font-black" style={{color:storeColor(item.tienda)}}>{item.precioFinal}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={()=>generarFactura(item)} className="text-xs px-2 py-1.5 rounded-lg font-bold" style={{border:`1px solid ${storeColor(item.tienda)}`,color:storeColor(item.tienda)}}>Recibo</button>
                    <a href={item.affiliateUrl||item.link} target="_blank" rel="noopener noreferrer nofollow" className="text-xs font-black px-3 py-1.5 rounded-lg text-white" style={{backgroundColor:storeColor(item.tienda)}}>Ver →</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MÁS REFERENCIAS — colapsado ────────────────────────────────────── */}
        {sinPrecio.length > 0 && (
          <div className="mb-6">
            <button onClick={()=>setVerMasRefs(!verMasRefs)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white transition-colors"
              style={{background:'white',border:'1px solid #e2e8f0',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
              <div className="flex items-center gap-2">
                <span>🔗</span>
                <span className="font-black text-xs tracking-widest uppercase" style={{color:'#64748b'}}>Más referencias</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{backgroundColor:'#f1f5f9',color:'#64748b'}}>{sinPrecio.length}</span>
              </div>
              <span style={{color:'#94a3b8'}}>{verMasRefs ? '▲' : '▼'}</span>
            </button>
            {verMasRefs && (
              <div className="mt-2 bg-white rounded-2xl overflow-hidden shadow-sm" style={{border:'1px solid #f1f5f9'}}>
                {sinPrecio.map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 ${i<sinPrecio.length-1?'border-b':''}`} style={{borderColor:'#f8fafc'}}>
                    <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{backgroundColor:storeColor(item.tienda)}}/>
                    <div className="flex-grow min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{color:'#94a3b8'}}>{item.tienda}</p>
                      <p className="text-sm font-semibold truncate" style={{color:'#1e3a8a'}}>{item.producto}</p>
                      <p className="text-xs" style={{color:'#94a3b8'}}>Precio no disponible</p>
                    </div>
                    <a href={item.affiliateUrl||item.link} target="_blank" rel="noopener noreferrer nofollow"
                      className="text-xs font-black flex-shrink-0 px-3 py-1.5 rounded-lg" style={{backgroundColor:'#f1f5f9',color:'#1e40af'}}>
                      Ver precio →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SIN RESULTADOS */}
        {resultados.length === 0 && !cargando && veredicto && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bold text-lg mb-2" style={{color:'#1e3a8a'}}>No encontramos resultados</p>
            <p className="text-sm mb-6" style={{color:'#94a3b8'}}>Prueba con otras palabras clave</p>
            <button onClick={volverInicio} className="px-6 py-3 rounded-xl font-black text-white text-sm" style={{backgroundColor:'#1e40af'}}>← Volver al inicio</button>
          </div>
        )}
      </main>

      <footer className="py-8 px-6 text-white" style={{backgroundColor:'#0f172a'}}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <div><p className="font-black text-sm mb-2">Compr<span style={{color:'#4ade80'}}>Ahorro</span></p><p style={{color:'#94a3b8'}}>Compara precios y ahorra en Panamá.</p></div>
          <div><p className="font-black tracking-widest uppercase mb-3" style={{color:'#94a3b8'}}>Navegación</p><ul className="space-y-2" style={{color:'#cbd5e1'}}><li><button onClick={volverInicio} className="hover:text-white">Inicio</button></li><li><a href="/login.html" className="hover:text-white">Mi Cuenta</a></li></ul></div>
          <div><p className="font-black tracking-widest uppercase mb-3" style={{color:'#94a3b8'}}>Tiendas</p><ul className="space-y-2" style={{color:'#cbd5e1'}}><li>Super Xtra</li><li>Super 99</li><li>El Machetazo</li><li>Rey</li></ul></div>
          <div><p className="font-black tracking-widest uppercase mb-3" style={{color:'#94a3b8'}}>Contacto</p><ul className="space-y-2" style={{color:'#cbd5e1'}}><li>Soporte</li><li>Sobre Nosotros</li></ul></div>
        </div>
      </footer>

      {showInstall && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white shadow-2xl" style={{borderTop:'2px solid #dbeafe'}}>
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <img src="/cerdo-logo.jpg" className="w-11 h-11 rounded-full object-cover flex-shrink-0"/>
            <div className="flex-grow"><p className="font-black text-sm" style={{color:'#1e3a8a'}}>Instalar ComprAhorro 🐷</p><p className="text-xs" style={{color:'#94a3b8'}}>Accede más rápido desde tu pantalla de inicio</p></div>
            <button onClick={handleInstall} className="px-4 py-2 rounded-xl font-black text-white text-sm" style={{backgroundColor:'#1e40af'}}>Instalar</button>
            <button onClick={()=>setShowInstall(false)} className="text-gray-400 text-xl px-1">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}