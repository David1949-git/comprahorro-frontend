import { useState, useEffect } from 'react';

import { getAhorrosApiUrl, getApiBaseUrl } from '@/lib/api';

import apiClient from '@/lib/axios';



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
  const [ubicacionUsuario, setUbicacionUsuario] = useState<{lat: number, lon: number} | null>(null);



  // Obtener ubicación del usuario como Waze con múltiples fallbacks
  const obtenerUbicacionUsuario = async () => {
    // Verificar que estamos en HTTPS para geolocalización precisa
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('Geolocalización precisa requiere HTTPS. La precisión puede ser limitada.');
    }

    // Prioridad 1: GPS del navegador con máxima precisión
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Ubicación GPS de alta precisión obtenida:', {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy
          });
          setUbicacionUsuario({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        async (error) => {
          console.log('GPS denegado, intentando detección por IP:', error);
          await obtenerUbicacionPorIP();
        },
        {
          enableHighAccuracy: true,    // Máxima precisión como Waze
          timeout: 15000,             // 15 segundos para GPS preciso
          maximumAge: 0               // Sin cache, siempre ubicación actual
        }
      );
    } else {
      console.log('Geolocalización no soportada, usando IP');
      await obtenerUbicacionPorIP();
    }
  };

  // Fallback por IP como Waze
  const obtenerUbicacionPorIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        console.log('Ubicación por IP obtenida:', { lat: data.latitude, lon: data.longitude, city: data.city });
        setUbicacionUsuario({
          lat: data.latitude,
          lon: data.longitude
        });
      } else {
        console.log('No se pudo obtener ubicación por IP');
      }
    } catch (error) {
      console.log('Error en detección por IP:', error);
    }
  };

  // Obtener ubicación al montar el componente
  useEffect(() => {
    obtenerUbicacionUsuario();
  }, []);

  const buscar = async () => {

    if (!termino.trim()) return;

    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('comprAhorro_token');
    if (!token) {
      // Redirigir a registro si no está autenticado
      window.location.href = '/register.html';
      return;
    }

    setCargando(true);
    console.log('🔍 Iniciando búsqueda para:', termino);

    try {

      const apiUrl = getAhorrosApiUrl();
      console.log('🌐 URL API:', apiUrl);

      const params: any = { q: termino };
      
      // Agregar coordenadas si tenemos ubicación
      if (ubicacionUsuario) {
        params.lat = ubicacionUsuario.lat.toString();
        params.lon = ubicacionUsuario.lon.toString();
        console.log('📍 Usando ubicación:', ubicacionUsuario);
      }

      console.log('📤 Enviando solicitud con params:', params);
      const respuesta = await apiClient.get(`${getApiBaseUrl()}/ahorros/buscar`, {
        params
      });

      console.log('📥 Respuesta recibida:', respuesta.data);
      const datos = respuesta.data;

      console.log('📊 Resultados:', datos.resultados);
      console.log('💭 Veredicto:', datos.veredicto);

      // FORZAR ACTUALIZACIÓN DE ESTADO
      setResultados([]); // Limpiar primero
      setTimeout(() => {
        setResultados(datos.resultados || []);
        setVeredicto(datos.veredicto || '');
        setCargando(false);
        console.log('✅ Estados actualizados');
      }, 100);

    } catch (error) {

      console.error('❌ Error buscando:', error);
      setCargando(false);
      
      // Error handling mejorado
      let errorMessage = 'No se pudieron obtener resultados. Intenta de nuevo.';
      
      if (error.response) {
        // Error de respuesta del servidor
        if (error.response.status === 429) {
          errorMessage = 'Demasiadas búsquedas. Espera unos segundos e intenta nuevamente.';
        } else if (error.response.status === 500) {
          errorMessage = 'Error temporal del servidor. Intenta en un momento.';
        } else if (error.response.status === 404) {
          errorMessage = 'Servicio no disponible. Contacta soporte.';
        }
      } else if (error.request) {
        // Error de red
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      }

      setVeredicto(errorMessage);
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

      const respuesta = await apiClient.get(`${apiUrl}/factura`, {

        params: { precioBase }

      });

      const facturaData = respuesta.data;

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

        src="/logo-oficial.png?v=202605051300" 

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

            {cargando ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>BUSCANDO</span>
              </div>
            ) : 'BUSCAR'}

          </button>

        </div>

        

        {/* MENSAJE DE REGISTRO */}

        <p className="mt-6 text-center text-lg font-light tracking-wide" 

           style={{ 

             color: 'rgba(255, 255, 255, 0.9)',

             textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',

             fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

           }}>

          Regístrate gratis para buscar productos y ahorrar!

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

            <div key={index} className={`bg-white rounded-3xl shadow-sm flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-all`} style={{ 

              border: '1px solid rgba(30, 64, 175, 0.1)',

              boxShadow: '0 4px 15px rgba(30, 64, 175, 0.1)'

            }}>

              <div className="md:w-48 bg-white flex-shrink-0 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r" style={{ borderColor: 'rgba(30, 64, 175, 0.05)' }}>

                {item.imagen ? (
                  <img src={item.imagen} alt={item.producto} className="max-h-32 w-full object-contain" />
                ) : (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.tienda || 'Tienda')}&background=1e40af&color=fff&size=128&bold=true`}
                    alt={item.tienda} 
                    className="max-h-32 w-full object-contain rounded-2xl"
                  />
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



