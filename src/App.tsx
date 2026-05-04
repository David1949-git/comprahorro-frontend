import { useState } from 'react';
import { getAhorrosApiUrl } from '@/lib/api';

type Factura = {
  precioBase: number;
  impuestos: number;
  delivery: number;
  servicioPrestado: number;
  totalFinal: number;
};

export default function App() {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [veredicto, setVeredicto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [factura, setFactura] = useState<Factura | null>(null);
  const [itemSeleccionado, setItemSeleccionado] = useState<any>(null);

  const buscar = async () => {
    if (!termino.trim()) return;
    
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('comprAhorro_token');
    
    if (!token) {
      // Usuario NO logueado: guardar término y redirigir a registro
      localStorage.setItem('terminoBusqueda', termino);
      window.location.href = '/register.html';
    } else {
      // Usuario SÍ logueado: redirigir al dashboard con la búsqueda
      window.location.href = `/dashboard.html?q=${encodeURIComponent(termino)}`;
    }
  };

  const generarFactura = async (item: any) => {
    if (!item?.precioFinal) return;
    const apiUrl = getAhorrosApiUrl();
    const precioBase = item.precioFinal.toString().replace(/[^0-9.]/g, '') || '0';
    setCargando(true);
    try {
      const respuesta = await fetch(`${apiUrl}/factura?precioBase=${encodeURIComponent(precioBase)}`);
      if (!respuesta.ok) throw new Error('No se pudo generar la factura');
      const facturaData = await respuesta.json();
      setFactura(facturaData);
      setItemSeleccionado(item);
    } catch (error) {
      console.error(error);
      setVeredicto('No se pudo generar la factura. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const tieneResultados = resultados.length > 0 || veredicto !== '';

  return (
    <div 
      className={`min-h-screen flex flex-col items-center px-4 font-sans transition-all duration-700 ${!tieneResultados ? 'justify-center' : 'pt-10'}`}
      style={{
        backgroundImage: 'url("/principal-home.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      
      {/* HEADER DEFINITIVO */}
      <div className={`w-full flex flex-col items-center justify-center transition-all duration-700 ${!tieneResultados ? 'mb-4' : 'mb-6'}`}>
        <div className="bg-white rounded-full p-2 w-56 h-56 shadow-2xl mb-8 border-4 border-emerald-50 overflow-hidden">
          <img src="/logo.png" alt="ComprAhorro" className="w-full h-full object-contain mix-blend-multiply" />
        </div>

        <h1 className={`font-black transition-all duration-700 ${!tieneResultados ? 'text-6xl text-center' : 'text-3xl'}`} style={{ color: '#1e40af' }}>
          <span style={{ color: '#1e3a8a' }}>Compr</span>Ahorro
        </h1>
        {!tieneResultados && (
          <div className="flex flex-col items-center animate-fade-in mt-6">
            <h2 className="text-2xl md:text-3xl font-black text-emerald-600 mb-8 uppercase tracking-tight">¡Nosotros buscamos, tú ahorras!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm font-bold">
              <div className="flex flex-col items-center">
                <span className="text-lg" style={{ color: '#14532d' }}>1. COMPARA</span>
                <p className="font-medium" style={{ color: '#000000' }}>Precios reales</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg" style={{ color: '#14532d' }}>2. ELIGE</span>
                <p className="font-medium" style={{ color: '#000000' }}>Sin presiones</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg" style={{ color: '#14532d' }}>3. COMPRA</span>
                <p className="font-medium" style={{ color: '#000000' }}>Directo sin intermediarios</p>
              </div>
            </div>
          </div>
        )}

        {/* BUSCADOR */}
        <div className="flex w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden mt-8 transition-all" style={{ boxShadow: '0 10px 25px rgba(30, 64, 175, 0.2)' }}>
          <input
            type="text"
            placeholder="¿Qué quieres ahorrar hoy?"
            className="flex-grow px-6 py-4 focus:outline-none text-lg"
            style={{ color: '#1e3a8a' }}
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
          />
          <button 
            onClick={buscar} 
            disabled={cargando} 
            className="text-white font-bold px-8 py-4 transition-all hover:opacity-90"
            style={{ 
              backgroundColor: '#1e40af',
              borderRadius: '0 24px 24px 0'
            }}
          >
            {cargando ? '...' : 'BUSCAR'}
          </button>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="w-full max-w-4xl pb-20 mt-10">
        {factura && itemSeleccionado && (
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-8" style={{ boxShadow: '0 4px 15px rgba(30, 64, 175, 0.1)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#1e3a8a' }}>Recibo de compra</h2>
            <p className="text-sm mb-4" style={{ color: '#1e40af' }}>Comercio seleccionado: <strong>{itemSeleccionado.tienda}</strong></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: '#1e3a8a' }}>
              <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid rgba(30, 64, 175, 0.1)' }}>
                <span>Costo base</span>
                <span>${factura.precioBase.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid rgba(30, 64, 175, 0.1)' }}>
                <span>Impuestos</span>
                <span>${factura.impuestos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid rgba(30, 64, 175, 0.1)' }}>
                <span>Servicio de delivery</span>
                <span>${factura.delivery.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-2" style={{ borderBottom: '1px solid rgba(30, 64, 175, 0.1)' }}>
                <span>Servicio prestado</span>
                <span>${factura.servicioPrestado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-4 text-base font-bold" style={{ color: '#1e3a8a' }}>
                <span>Total</span>
                <span>${factura.totalFinal.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col md:flex-row gap-3">
              <a
                href={itemSeleccionado.affiliateUrl || itemSeleccionado.link}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-white px-6 py-3 rounded-2xl font-semibold text-center transition-all hover:opacity-90"
                style={{ backgroundColor: '#1e40af' }}
              >
                Comprar en tienda
              </a>
              <button
                type="button"
                onClick={() => setFactura(null)}
                className="px-6 py-3 rounded-2xl transition-all hover:opacity-80"
                style={{ 
                  border: '1px solid #1e40af',
                  color: '#1e3a8a'
                }}
              >
                Cerrar recibo
              </button>
            </div>
          </div>
        )}
        {veredicto && (
          <div className="bg-white p-6 mb-8 rounded-3xl shadow-sm flex items-center" style={{ 
            borderLeft: '8px solid #14532d',
            boxShadow: '0 4px 15px rgba(30, 64, 175, 0.1)'
          }}>
            <span className="text-3xl mr-4">💡</span>
            <p className="font-bold text-xl leading-tight" style={{ color: '#1e3a8a' }}>{veredicto}</p>
          </div>
        )}

        <div className="space-y-6">
          {resultados.map((item, index) => (
            <div key={index} className={`bg-white rounded-3xl shadow-sm flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-all ${!item.precioFinal || !item.precioFinal.includes('$') ? 'opacity-70' : ''}`} style={{ 
              border: '1px solid rgba(30, 64, 175, 0.1)',
              boxShadow: '0 4px 15px rgba(30, 64, 175, 0.1)'
            }}>
              <div className="md:w-48 bg-white flex-shrink-0 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r" style={{ borderColor: 'rgba(30, 64, 175, 0.05)' }}>
                {item.imagen ? (
                  <img src={item.imagen} alt={item.producto} className="max-h-32 w-full object-contain" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl" style={{ backgroundColor: 'rgba(30, 64, 175, 0.05)' }}>📷</div>
                )}
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2 inline-block" style={{ 
                    color: '#14532d',
                    backgroundColor: 'rgba(20, 83, 45, 0.1)'
                  }}>{item.tienda}</span>
                  <h3 className="font-bold text-xl leading-tight" style={{ color: '#1e3a8a' }}>{item.producto}</h3>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-3xl font-black" style={{ color: '#14532d' }}>{item.precioFinal || 'Ver precio'}</span>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-white px-6 py-2 rounded-xl font-bold text-sm transition-all hover:opacity-90" style={{ backgroundColor: '#1e40af' }}>VER TIENDA</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

