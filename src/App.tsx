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
  const [buscadorFoco, setBuscadorFoco] = useState(false);

  const buscar = async () => {
    if (!termino.trim()) return;
    
    setCargando(true);
    try {
      const apiUrl = getAhorrosApiUrl();
      const respuesta = await fetch(`${apiUrl}/buscar?q=${encodeURIComponent(termino)}`);
      
      if (!respuesta.ok) {
        throw new Error('Error en la búsqueda');
      }
      
      const datos = await respuesta.json();
      setResultados(datos);
      setVeredicto('');
    } catch (error) {
      console.error('Error buscando:', error);
      setVeredicto('No se pudieron obtener resultados. Intenta de nuevo.');
      setResultados([]);
    } finally {
      setCargando(false);
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
      className={`min-h-screen flex flex-col items-center px-4 font-sans transition-all duration-700 bg-gradient-to-b from-blue-50 to-white ${!tieneResultados ? 'justify-center' : 'pt-10'}`}
    >
      {/* HEADER/LOGO IMAGE */}
      <img 
        src="/principal-home.png" 
        alt="Logo" 
        className="mb-8 max-w-md w-full"
      />
      
      {/* BUSCADOR CENTRADO */}
      <div className={`w-full flex flex-col items-center justify-center transition-all duration-700 ${!tieneResultados ? 'justify-center' : 'pt-20'}`}>
        <div className={`flex w-full max-w-xl rounded-3xl overflow-hidden transition-all duration-300 ${buscadorFoco ? 'scale-[1.02]' : 'scale-100'}`}
             style={{
               backgroundColor: 'rgba(255, 255, 255, 0.7)',
               backdropFilter: 'blur(10px)',
               border: '1px solid rgba(255, 255, 255, 0.3)',
               boxShadow: '0 20px 40px rgba(30, 64, 175, 0.15), 0 8px 16px rgba(30, 64, 175, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
             }}>
          <input
            type="text"
            placeholder="¿Qué quieres ahorrar hoy?"
            className="flex-grow px-6 py-4 focus:outline-none text-lg bg-transparent"
            style={{ color: '#1e3a8a' }}
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
            onFocus={() => setBuscadorFoco(true)}
            onBlur={() => setBuscadorFoco(false)}
          />
          <button 
            onClick={buscar} 
            disabled={cargando} 
            className="text-white font-bold px-8 py-4 transition-all hover:opacity-90 bg-transparent"
            style={{ 
              backgroundColor: 'rgba(30, 64, 175, 0.85)',
              borderRadius: '0 24px 24px 0',
              backdropFilter: 'blur(10px)'
            }}
          >
            {cargando ? '...' : 'BUSCAR'}
          </button>
        </div>
        
        {/* MENSAJE DE REGISTRO */}
        <p className="mt-6 text-center text-lg font-light tracking-wide" 
           style={{ 
             color: 'rgba(255, 255, 255, 0.9)',
             textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
             fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
           }}>
          ¡Regístrate gratis para comenzar tu ahorro!
        </p>
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

