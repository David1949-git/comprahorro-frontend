import { Search, X, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { getAhorrosApiUrl } from '@/lib/api';
import piggyLogo from "@/assets/piggy-logo.png";
import ProductCard from "./ProductCard";

const HeroSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [veredicto, setVeredicto] = useState<string>("");

  const handleSearch = async (e: React.FormEvent) => {
    console.log('Iniciando búsqueda...');
    e.preventDefault();

    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        let lat: string | undefined;
        let lon: string | undefined;

        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });
          lat = position.coords.latitude.toString();
          lon = position.coords.longitude.toString();
        } catch (error) {
          lat = '8.9824';
          lon = '-79.5197';
        }

        const apiUrl = getAhorrosApiUrl();
        const params = new URLSearchParams({
          q: searchQuery.trim(),
          lat: lat || '',
          lon: lon || ''
        });

        const response = await fetch(`${apiUrl}/buscar?${params}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        if (data.resultados && data.veredicto) {
          setSearchResults(Array.isArray(data.resultados) ? data.resultados : []);
          setVeredicto(data.veredicto);
        } else {
          setSearchResults(Array.isArray(data) ? data : []);
          setVeredicto("");
        }
        setHasSearched(true);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-50 to-white" />
      
      <div className="relative container mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-6xl mx-auto">
          {!hasSearched && (
            <div className="text-center space-y-12" style={{ animation: "fade-in-up 0.6s ease-out" }}>
              {/* Encabezado con Logo */}
              <div className="mx-auto max-w-4xl">
                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-[2rem] p-4 inline-block mb-6">
                  <img
                    src={piggyLogo}
                    alt="Logo ComprAhorro"
                    className="h-32 md:h-48 w-auto object-contain mx-auto rounded-2xl"
                  />
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-2">
                  ComprAhorro
                </h2>
                <div className="inline-flex items-center rounded-full bg-white/80 px-6 py-2 text-xs md:text-sm font-bold tracking-widest text-primary shadow-sm border border-primary/10">
                  TODO EN UN SOLO LUGAR
                </div>
              </div>

              {/* Sección de Beneficios Corregida */}
              <div className="space-y-10">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-800">
                  Nosotros buscamos, ¡tú ahorras!
                </h1>
                <div className="mx-auto flex max-w-5xl flex-col md:flex-row items-stretch justify-center gap-6">
                  <div className="flex-1 rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-sm px-6 py-8 shadow-soft hover:shadow-md transition-shadow">
                    <p className="text-lg font-black tracking-wider text-primary">1. COMPARA</p>
                    <p className="mt-2 text-sm font-semibold text-slate-500 uppercase tracking-tight">Precios reales</p>
                  </div>
                  <div className="flex-1 rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-sm px-6 py-8 shadow-soft hover:shadow-md transition-shadow">
                    <p className="text-lg font-black tracking-wider text-primary">2. ELIGE</p>
                    <p className="mt-2 text-sm font-semibold text-slate-500 uppercase tracking-tight">Sin presiones</p>
                  </div>
                  <div className="flex-1 rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-sm px-6 py-8 shadow-soft hover:shadow-md transition-shadow">
                    <p className="text-lg font-black tracking-wider text-primary">3. COMPRA</p>
                    <p className="mt-2 text-sm font-semibold text-slate-500 uppercase tracking-tight">Directo sin intermediarios</p>
                  </div>
                </div>
              </div>

              {/* Barra de búsqueda */}
              <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-3xl">
                <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
                  <div className={`relative flex items-center bg-background border-2 rounded-2xl transition-all duration-300 ${
                    isFocused ? 'border-primary shadow-xl' : 'border-input hover:border-primary/50 shadow-md'
                  }`}>
                    <div className="flex-1 flex items-center">
                      <Search size={24} className={`ml-6 ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="¿Qué quieres ahorrar hoy?"
                        className="flex-1 px-6 py-6 bg-transparent text-foreground focus:outline-none text-lg md:text-xl"
                      />
                      {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery("")} className="mr-4 p-2 hover:bg-muted rounded-lg">
                          <X size={20} className="text-muted-foreground" />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching || !searchQuery.trim()}
                      className="bg-primary text-primary-foreground px-10 py-6 rounded-xl font-bold text-lg hover:opacity-90 transition-all mr-2 disabled:opacity-50"
                    >
                      {isSearching ? "BUSCANDO..." : "BUSCAR"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {hasSearched && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setSearchResults([]);
                    setSearchQuery("");
                    setVeredicto("");
                  }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={20} />
                  <span>Volver</span>
                </button>
                <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                  <div className="relative flex items-center bg-background border-2 rounded-2xl border-input">
                    <Search size={20} className="ml-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar productos..."
                      className="flex-1 px-4 py-4 bg-transparent focus:outline-none"
                    />
                    <button type="submit" className="bg-primary text-primary-foreground px-6 py-4 rounded-xl font-semibold mr-2">
                      Buscar
                    </button>
                  </div>
                </form>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  {searchResults.length > 0 
                    ? `${searchResults.length} resultados encontrados`
                    : 'No se encontraron resultados'
                  }
                </h2>
              </div>

              {veredicto && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">🔍</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-emerald-800 mb-1">Análisis de ComprAhorro</h3>
                      <p className="text-emerald-700 text-sm leading-relaxed">{veredicto}</p>
                    </div>
                  </div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((product, index) => (
                    <div key={product.id || index} style={{ animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
