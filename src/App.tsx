import { useState, useEffect } from 'react';
import { getAhorrosApiUrl } from '@/lib/api';
import apiClient from '@/lib/axios';

type Factura = {
  precioBase: number;
  impuestos: number;
  delivery: number;
  servicioPrestado: number;
  totalFinal: number;
};

type Resultado = {
  producto: string;
  tienda: string;
  precioFinal?: string;
  imagen?: string;
  link?: string;
  affiliateUrl?: string;
  descripcion?: string;
  rating?: number;
  reviews?: number;
};

function clasificarResultados(resultados: Resultado[]) {
  const tieneImagen = (r: Resultado) => !!r.imagen;
  const tienePrecio = (r: Resultado) =>
    !!r.precioFinal && r.precioFinal.trim() !== '' && r.precioFinal !== 'Ver precio' && r.precioFinal !== 'Sin precio';
  const tierA = resultados.filter(r => tieneImagen(r) && tienePrecio(r));
  const tierB = resultados.filter(r => tieneImagen(r) && !tienePrecio(r));
  const tierC = resultados.filter(r => !tieneImagen(r));
  return { tierA, tierB, tierC };
}

function extraerPrecioNumerico(precio?: string): number {
  if (!precio || precio === 'Sin precio' || precio === 'Ver precio') return Infinity;
  const num = parseFloat(precio.replace(/[^0-9.]/g, ''));
  return isFinite(num) ? num : Infinity;
}

function encontrarGanador(resultados: Resultado[]): Resultado | null {
  const conPrecio = resultados.filter(
    r => r.imagen && r.precioFinal && r.precioFinal !== 'Sin precio' && r.precioFinal !== 'Ver precio'
  );
  if (conPrecio.length === 0) return null;
  return conPrecio.reduce((min, r) =>
    extraerPrecioNumerico(r.precioFinal) < extraerPrecioNumerico(min.precioFinal) ? r : min
  );
}

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-size='36' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%9B%8D%EF%B8%8F%3C/text%3E%3C/svg%3E";

export default function App() {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [veredicto, setVeredicto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [factura, setFactura] = useState<Factura | null>(null);
  const [itemSeleccionado, setItemSeleccionado] = useState<Resultado | null>(null);
  const [ubicacionUsuario, setUbicacionUsuario] = useState<{ lat: number; lon: number } | null>(null);

  const obtenerUbicacionPorIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.latitude && data.longitude)
        setUbicacionUsuario({ lat: data.latitude, lon: data.longitude });
    } catch {}
  };

  const obtenerUbicacionUsuario = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUbicacionUsuario({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        async () => { await obtenerUbicacionPorIP(); },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else await obtenerUbicacionPorIP();
  };

  useEffect(() => { obtenerUbicacionUsuario(); }, []);

  const volverInicio = () => {
    setResultados([]);
    setVeredicto('');
    setFactura(null);
    setItemSeleccionado(null);
  };

  const buscar = async () => {
    if (!termino.trim()) return;
    const token = localStorage.getItem('comprAhorro_token');
    if (!token) {
      sessionStorage.setItem('comprAhorro_termino_pendiente', termino);
      window.location.href = '/register.html';
      return;
    }
    setCargando(true);
    setFactura(null);
    try {
      // _t rompe el caché del navegador en cada búsqueda
      const params: Record<string, string> = {
        q: termino,
        _t: Date.now().toString(),
      };
      if (ubicacionUsuario) {
        params.lat = ubicacionUsuario.lat.toString();
        params.lon = ubicacionUsuario.lon.toString();
      }
      const respuesta = await apiClient.get(
        `https://comprahorro-backend-1.onrender.com/api/ahorros/buscar`,
        {
          params,
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
        }
      );
      const datos = respuesta.data;
      setResultados([]);
      setTimeout(() => {
        setResultados(datos.resultados || []);
        setVeredicto(datos.veredicto || '');
        setCargando(false);
      }, 100);
    } catch (error: any) {
      setCargando(false);
      let msg = 'No se pudieron obtener resultados. Intenta de nuevo.';
      if (error.response?.status === 429) msg = 'Demasiadas búsquedas. Espera unos segundos.';
      else if (error.response?.status === 500) msg = 'Error temporal del servidor. Intenta en un momento.';
      else if (error.request) msg = 'Error de conexión. Verifica tu internet.';
      setVeredicto(msg);
      setResultados([]);
    }
  };

  useEffect(() => {
    const terminoPendiente = sessionStorage.getItem('comprAhorro_termino_pendiente');
    const token = localStorage.getItem('comprAhorro_token');
    if (terminoPendiente && token) {
      sessionStorage.removeItem('comprAhorro_termino_pendiente');
      setTermino(terminoPendiente);
      setTimeout(() => { document.getElementById('btn-buscar')?.click(); }, 500);
    }
  }, []);

  const generarFactura = async (item: Resultado) => {
    if (!item?.precioFinal) return;
    const apiUrl = getAhorrosApiUrl();
    const precioBase = item.precioFinal.replace(/[^0-9.]/g, '') || '0';
    setCargando(true);
    try {
      const respuesta = await apiClient.get(`${apiUrl}/factura`, { params: { precioBase } });
      setFactura(respuesta.data);
      setItemSeleccionado(item);
    } catch {
      setVeredicto('No se pudo generar la factura. Intenta de nuevo.');
    } finally { setCargando(false); }
  };

  const tieneResultados = resultados.length > 0 || veredicto !== '';
  const { tierA, tierB, tierC } = clasificarResultados(resultados);
  const ganador = encontrarGanador(resultados);

  // ── PANTALLA DE INICIO ────────────────────────────────────────────────────
  if (!tieneResultados) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #e0f2fe 40%, #f0f9ff 100%)' }}>
        <nav className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center"
              style={{ background: 'white', boxShadow: '0 2px 8px rgba(30,64,175,0.15)' }}>
              <img src="/cerdo-logo.jpg" alt="Logo" className="w-8 h-8 object-cover" />
            </div>
            <span className="font-extrabold text-xl tracking-tight" style={{ color: '#1e3a8a' }}>
              Compr<span style={{ color: '#16a34a' }}>Ahorro</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-sm font-bold tracking-widest" style={{ color: '#1e3a8a' }}>
            <span>COMPARA</span><span className="mx-2 opacity-30">|</span>
            <span>ELIGE</span><span className="mx-2 opacity-30">|</span>
            <span>COMPRA</span>
          </div>
          <div className="flex gap-3">
            <a href="/login.html" className="text-sm font-semibold px-4 py-2 rounded-full hover:bg-blue-50" style={{ color: '#1e3a8a' }}>
              Iniciar sesión
            </a>
            <a href="/register.html" className="text-sm font-semibold px-4 py-2 rounded-full text-white hover:opacity-90" style={{ backgroundColor: '#1e40af' }}>
              Registrarse
            </a>
          </div>
        </nav>

        <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 text-center">
          <div className="mb-8 inline-block border rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase"
            style={{ borderColor: '#94a3b8', color: '#475569', backgroundColor: 'rgba(255,255,255,0.6)' }}>
            TODO EN UN SOLO LUGAR
          </div>
          <div className="mb-6 rounded-full flex items-center justify-center"
            style={{
              width: '180px', height: '180px',
              background: 'radial-gradient(circle at 40% 35%, #ffffff 60%, #e0f2fe 100%)',
              boxShadow: '0 20px 60px rgba(30, 64, 175, 0.2), 0 8px 20px rgba(30, 64, 175, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)'
            }}>
            <img src="/cerdo-logo.jpg" alt="ComprAhorro" className="w-36 h-36 object-contain" />
          </div>
          <h1 className="text-5xl font-extrabold mb-2 tracking-tight" style={{ color: '#1e3a8a' }}>
            Compr<span style={{ color: '#16a34a' }}>Ahorro</span>
          </h1>
          <p className="text-xl font-semibold mb-10" style={{ color: '#16a34a' }}>
            ¡Nosotros buscamos, tú ahorras!
          </p>
          <div className="grid grid-cols-3 gap-8 mb-10 max-w-lg w-full">
            {[
              { num: '1', label: 'COMPARA', desc: 'Precios reales' },
              { num: '2', label: 'ELIGE', desc: 'Sin presiones' },
              { num: '3', label: 'COMPRA', desc: 'Directo sin intermediarios' },
            ].map(({ num, label, desc }) => (
              <div key={num} className="flex flex-col items-center">
                <span className="text-4xl font-black mb-1" style={{ color: '#16a34a' }}>{num}</span>
                <span className="text-xs font-extrabold tracking-widest uppercase mb-1" style={{ color: '#16a34a' }}>{label}</span>
                <p className="text-xs text-center" style={{ color: '#475569' }}>• {desc}</p>
              </div>
            ))}
          </div>
          <div className="w-full max-w-xl">
            <div className="flex rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }}>
              <input
                type="text"
                placeholder="¿Qué quieres ahorrar hoy?"
                className="flex-grow px-6 py-4 text-base focus:outline-none bg-transparent"
                style={{ color: '#1e3a8a' }}
                value={termino}
                onChange={(e) => setTermino(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscar()}
              />
              <button id="btn-buscar" onClick={buscar} disabled={cargando}
                className="text-white font-bold px-8 py-4 hover:opacity-90"
                style={{ backgroundColor: '#1e293b', minWidth: '110px' }}>
                {cargando ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>...</span>
                  </div>
                ) : 'BUSCAR'}
              </button>
            </div>
            <p className="mt-3 text-xs font-medium" style={{ color: '#64748b' }}>
              Crea tu cuenta gratis para buscar productos y ahorrar 🐷
            </p>
          </div>
        </main>

        <footer className="text-white py-10 px-8" style={{ backgroundColor: '#0f172a' }}>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="font-extrabold text-base mb-2">Compr<span style={{ color: '#4ade80' }}>Ahorro</span></p>
              <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
                La plataforma inteligente para comparar precios y ahorrar dinero en tus compras diarias.
              </p>
            </div>
            <div>
              <p className="font-bold mb-3 text-xs tracking-widest uppercase" style={{ color: '#94a3b8' }}>Enlaces Rápidos</p>
              <ul className="space-y-1 text-xs" style={{ color: '#cbd5e1' }}>
                <li><a href="/" className="hover:text-white">Inicio</a></li>
                <li><a href="/login.html" className="hover:text-white">Mi Cuenta</a></li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-3 text-xs tracking-widest uppercase" style={{ color: '#94a3b8' }}>Categorías</p>
              <ul className="space-y-1 text-xs" style={{ color: '#cbd5e1' }}>
                <li>Supermercado</li><li>Electrónica</li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-3 text-xs tracking-widest uppercase" style={{ color: '#94a3b8' }}>Contacto</p>
              <ul className="space-y-1 text-xs" style={{ color: '#cbd5e1' }}>
                <li>Soporte</li><li>Sobre Nosotros</li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ── PANTALLA DE RESULTADOS ────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #f0f9ff 100%)' }}>

      <nav className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={volverInicio}
            className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors"
            style={{ color: '#1e3a8a', border: '1px solid #dbeafe' }}>
            ← Inicio
          </button>
          <button onClick={volverInicio} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(30,64,175,0.15)' }}>
              <img src="/cerdo-logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-xl hidden sm:block" style={{ color: '#1e3a8a' }}>
              Compr<span style={{ color: '#16a34a' }}>Ahorro</span>
            </span>
          </button>
        </div>
        <div className="flex rounded-xl overflow-hidden mx-4 flex-grow max-w-lg"
          style={{ border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
          <input type="text" className="flex-grow px-4 py-2 text-sm focus:outline-none"
            style={{ color: '#1e3a8a' }} value={termino}
            onChange={(e) => setTermino(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
            placeholder="Nueva búsqueda..." />
          <button id="btn-buscar" onClick={buscar} disabled={cargando}
            className="text-white font-bold px-5 py-2 text-sm hover:opacity-90"
            style={{ backgroundColor: '#1e293b' }}>
            {cargando ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : 'BUSCAR'}
          </button>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 pb-20">

        {veredicto && (
          <div className="bg-white p-5 mb-8 rounded-2xl flex items-start gap-3"
            style={{ borderLeft: '6px solid #15803d', boxShadow: '0 4px 15px rgba(30,64,175,0.08)' }}>
            <span className="text-2xl flex-shrink-0">💡</span>
            <p className="font-bold text-base leading-snug" style={{ color: '#1e3a8a' }}>{veredicto}</p>
          </div>
        )}

        {ganador && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🥇</span>
              <h2 className="font-extrabold text-base tracking-wide uppercase" style={{ color: '#15803d' }}>
                Mejor precio encontrado
              </h2>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row"
              style={{ border: '2px solid #16a34a', boxShadow: '0 8px 30px rgba(21,128,61,0.15)' }}>
              <div className="relative md:w-56 flex-shrink-0 flex items-center justify-center p-5"
                style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
                <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#15803d', color: 'white' }}>
                  💰 Precio más bajo
                </span>
                <img
                  src={ganador.imagen || IMG_FALLBACK}
                  alt={ganador.producto}
                  className="max-h-36 w-full object-contain mt-4"
                  onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK; }}
                />
              </div>
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                    {ganador.tienda}
                  </span>
                  <h3 className="font-bold text-xl mt-2 leading-snug" style={{ color: '#1e3a8a' }}>
                    {ganador.producto}
                  </h3>
                </div>
                <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: '#64748b' }}>Precio</p>
                    <span className="text-4xl font-black" style={{ color: '#15803d' }}>{ganador.precioFinal}</span>
                  </div>
                  <div className="flex gap-2">
                    {ganador.precioFinal && ganador.precioFinal !== 'Sin precio' && (
                      <button onClick={() => generarFactura(ganador)}
                        className="text-sm px-4 py-2.5 rounded-xl font-semibold hover:opacity-80"
                        style={{ border: '1px solid #15803d', color: '#15803d' }}>
                        Ver recibo
                      </button>
                    )}
                    <a href={ganador.affiliateUrl || ganador.link} target="_blank" rel="noopener noreferrer nofollow"
                      className="text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90"
                      style={{ backgroundColor: '#15803d' }}>
                      IR A LA TIENDA →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {factura && itemSeleccionado && (
          <div className="bg-white rounded-2xl p-6 mb-8"
            style={{ border: '1px solid #dbeafe', boxShadow: '0 4px 15px rgba(30,64,175,0.08)' }}>
            <h2 className="text-xl font-bold mb-3" style={{ color: '#1e3a8a' }}>Recibo de compra</h2>
            <p className="text-sm mb-4" style={{ color: '#1e40af' }}>Comercio: <strong>{itemSeleccionado.tienda}</strong></p>
            <div className="space-y-2 text-sm" style={{ color: '#1e3a8a' }}>
              {[
                ['Costo base', `$${factura.precioBase.toFixed(2)}`],
                ['Impuestos (7%)', `$${factura.impuestos.toFixed(2)}`],
                ['Delivery', `$${factura.delivery.toFixed(2)}`],
                ['Servicio prestado', `$${factura.servicioPrestado.toFixed(2)}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between pb-1 border-b" style={{ borderColor: 'rgba(30,64,175,0.08)' }}>
                  <span>{k}</span><span>{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-extrabold text-base">
                <span>Total</span><span>${factura.totalFinal.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <a href={itemSeleccionado.affiliateUrl || itemSeleccionado.link} target="_blank" rel="noopener noreferrer nofollow"
                className="text-white px-5 py-2 rounded-xl font-semibold text-sm hover:opacity-90"
                style={{ backgroundColor: '#1e40af' }}>Comprar en tienda</a>
              <button onClick={() => setFactura(null)}
                className="px-5 py-2 rounded-xl text-sm hover:opacity-80"
                style={{ border: '1px solid #1e40af', color: '#1e3a8a' }}>Cerrar</button>
            </div>
          </div>
        )}

        {tierA.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span>🏆</span>
              <h2 className="font-extrabold text-base tracking-wide uppercase" style={{ color: '#1e3a8a' }}>
                Opciones con foto y precio
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                {tierA.length} resultados
              </span>
            </div>
            <div className="space-y-4">
              {tierA.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row"
                  style={{ border: '1px solid rgba(30,64,175,0.08)', boxShadow: '0 4px 15px rgba(30,64,175,0.07)' }}>
                  <div className="md:w-44 flex-shrink-0 flex items-center justify-center p-4 bg-gray-50">
                    <img
                      src={item.imagen || IMG_FALLBACK}
                      alt={item.producto}
                      className="max-h-28 w-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK; }}
                    />
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>{item.tienda}</span>
                      <h3 className="font-bold text-lg mt-1 leading-snug" style={{ color: '#1e3a8a' }}>{item.producto}</h3>
                      {item.rating && item.rating > 0 && (
                        <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>
                          {'★'.repeat(Math.round(item.rating))}{'☆'.repeat(5 - Math.round(item.rating))}
                          <span className="ml-1 text-gray-400">{item.reviews ? `(${item.reviews})` : ''}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                      <div>
                        <p className="text-[10px] font-semibold mb-0.5" style={{ color: '#64748b' }}>Precio</p>
                        <span className="text-3xl font-black" style={{ color: '#15803d' }}>{item.precioFinal}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => generarFactura(item)}
                          className="text-sm px-4 py-2 rounded-xl font-semibold hover:opacity-80"
                          style={{ border: '1px solid #1e40af', color: '#1e40af' }}>Ver recibo</button>
                        <a href={item.affiliateUrl || item.link} target="_blank" rel="noopener noreferrer nofollow"
                          className="text-white px-5 py-2 rounded-xl font-bold text-sm hover:opacity-90"
                          style={{ backgroundColor: '#1e40af' }}>VER TIENDA</a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tierB.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span>📦</span>
              <h2 className="font-extrabold text-base tracking-wide uppercase" style={{ color: '#1e3a8a' }}>Más opciones disponibles</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                {tierB.length} resultados
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tierB.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden flex"
                  style={{ border: '1px solid rgba(30,64,175,0.08)', boxShadow: '0 4px 10px rgba(30,64,175,0.05)' }}>
                  <div className="w-28 flex-shrink-0 flex items-center justify-center p-3 bg-gray-50">
                    <img
                      src={item.imagen || IMG_FALLBACK}
                      alt={item.producto}
                      className="max-h-20 w-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK; }}
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#1e40af' }}>{item.tienda}</span>
                      <h3 className="font-semibold text-sm mt-0.5" style={{ color: '#1e3a8a' }}>{item.producto}</h3>
                    </div>
                    <a href={item.affiliateUrl || item.link} target="_blank" rel="noopener noreferrer nofollow"
                      className="mt-2 text-xs font-bold hover:opacity-70" style={{ color: '#1e40af' }}>
                      Ver precio en tienda →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tierC.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span>📋</span>
              <h2 className="font-extrabold text-base tracking-wide uppercase" style={{ color: '#1e3a8a' }}>Otras referencias</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                {tierC.length} resultados
              </span>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(30,64,175,0.08)', boxShadow: '0 2px 8px rgba(30,64,175,0.04)' }}>
              {tierC.map((item, i) => (
                <div key={i} className={`flex items-center justify-between px-5 py-3 ${i < tierC.length - 1 ? 'border-b' : ''}`}
                  style={{ borderColor: 'rgba(30,64,175,0.06)' }}>
                  <div className="flex-grow mr-4">
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#64748b' }}>{item.tienda}</span>
                    <p className="text-sm font-medium" style={{ color: '#1e3a8a' }}>{item.producto}</p>
                    {item.precioFinal && item.precioFinal !== 'Sin precio' && (
                      <p className="text-sm font-bold mt-0.5" style={{ color: '#15803d' }}>{item.precioFinal}</p>
                    )}
                  </div>
                  {item.link && (
                    <a href={item.affiliateUrl || item.link} target="_blank" rel="noopener noreferrer nofollow"
                      className="text-xs font-bold flex-shrink-0 hover:opacity-70" style={{ color: '#1e40af' }}>Ver →</a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {resultados.length === 0 && !cargando && veredicto && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-semibold text-lg" style={{ color: '#1e3a8a' }}>No se encontraron productos</p>
            <p className="text-sm mt-2 mb-6" style={{ color: '#64748b' }}>Intenta con otras palabras clave</p>
            <button onClick={volverInicio}
              className="text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90"
              style={{ backgroundColor: '#1e40af' }}>
              ← Volver al inicio
            </button>
          </div>
        )}

      </main>

      <footer className="text-white py-8 px-8" style={{ backgroundColor: '#0f172a' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="font-extrabold text-sm mb-1">Compr<span style={{ color: '#4ade80' }}>Ahorro</span></p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>Compara precios y ahorra en tus compras diarias.</p>
          </div>
          <div>
            <p className="font-bold mb-2 text-xs tracking-widest uppercase" style={{ color: '#94a3b8' }}>Enlaces Rápidos</p>
            <ul className="space-y-1 text-xs" style={{ color: '#cbd5e1' }}>
              <li><button onClick={volverInicio} className="hover:text-white">Inicio</button></li>
              <li><a href="/login.html" className="hover:text-white">Mi Cuenta</a></li>
            </ul>
          </div>
          <div>
            <p className="font-bold mb-2 text-xs tracking-widest uppercase" style={{ color: '#94a3b8' }}>Categorías</p>
            <ul className="space-y-1 text-xs" style={{ color: '#cbd5e1' }}>
              <li>Supermercado</li><li>Electrónica</li>
            </ul>
          </div>
          <div>
            <p className="font-bold mb-2 text-xs tracking-widest uppercase" style={{ color: '#94a3b8' }}>Contacto</p>
            <ul className="space-y-1 text-xs" style={{ color: '#cbd5e1' }}>
              <li>Soporte</li><li>Sobre Nosotros</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}