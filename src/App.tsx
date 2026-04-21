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
            <div className="flex flex-col items-center w-full max-w-2xl mx-auto mb-8 px-4">
          <h2 className="text-xl md:text-2xl font-bold text-emerald-600 mb-2 text-center animate-fade-in">
            ¡Nosotros buscamos, tú ahorras!
          </h2>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">
            <span className="flex items-center gap-1"><span className="text-emerald-500 font-bold">✓</span> Tiempo Real</span>
            <span className="flex items-center gap-1"><span className="text-emerald-500 font-bold">✓</span> Sin Intermediarios</span>
            <span className="flex items-center gap-1"><span className="text-emerald-500 font-bold">✓</span> Compra Directa</span>
          </div>
        </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-emerald-500 mr-3">✓</span>
              <p className="text-lg text-slate-600">Elige con total calma y tranquilidad.</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-emerald-500 mr-3">✓</span>
              <p className="text-lg text-slate-600">Compra directo sin intermediarios para tu máximo ahorro.</p>
            </div>
          </div>
        </div></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




