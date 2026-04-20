import { Search, ShoppingCart, Truck, X, ArrowLeft } from "lucide-react";

import { useState } from "react";

import ProductCard from "./ProductCard";
import PiggyLogo from "./PiggyLogo";



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
      console.log('Estado de búsqueda activado, iniciando llamada a API...');

      try {

        // Get user location silently

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

          // User denied location or geolocation failed, use Panama City as default

                    lat = '8.9824';

          lon = '-79.5197';

        }



        const apiUrl = import.meta.env.VITE_API_URL || 'https://proyectocompras.onrender.com';

        const params = new URLSearchParams({

          q: searchQuery.trim(),

          lat: lat,

          lon: lon

        });

        console.log(`Haciendo fetch a: ${apiUrl}/ahorros/buscar?${params}`);
        const response = await fetch(`${apiUrl}/ahorros/buscar?${params}`);

        

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        

        const data = await response.json();

                

        // Handle new backend response format

        if (data.resultados && data.veredicto) {

          setSearchResults(Array.isArray(data.resultados) ? data.resultados : []);

          setVeredicto(data.veredicto);

        } else {

          // Fallback for old format

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

      {/* Soft gradient background */}

      <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/40 to-emerald-light/60" />

      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(155 64% 36%), transparent 50%), radial-gradient(circle at 80% 20%, hsl(155 64% 45%), transparent 40%)' }} />



      <div className="relative container mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">

        <div className="max-w-6xl mx-auto">

          {/* Home content - show when no search has been made */}

          {!hasSearched && (

            <div className="text-center space-y-6" style={{ animation: "fade-in-up 0.6s ease-out" }}>

          <div className="flex justify-center mb-6">
            <PiggyLogo size={96} className="w-24 h-24 mx-auto mb-4" />
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-tight">
            ComprAhorro busca,{" "}
            <span className="text-gradient-emerald">tú ahorras.</span>
          </h1>

          <div className="space-y-3 text-muted-foreground text-xl md:text-2xl font-semibold max-w-2xl mx-auto">
            <p>Busca LO QUE SEA sin límites</p>
            <p>Compara precios en tiempo real</p>
            <p>Ahorra en cada compra</p>
          </div>



          {/* Modern Search Bar - Bigger and AI-focused */}

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mt-8">

            <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>

              <div className="absolute inset-0 bg-gradient-emerald rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

              <div className={`relative flex items-center bg-background border-2 rounded-2xl transition-all duration-300 ${

                isFocused 

                  ? 'border-primary shadow-elevated' 

                  : 'border-input hover:border-primary/50 shadow-soft'

              }`}>

                <div className="flex-1 flex items-center">

                  <Search 

                    size={24} 

                    strokeWidth={2.5} 

                    className={`ml-6 transition-colors duration-300 ${

                      isFocused ? 'text-primary' : 'text-muted-foreground'

                    }`}

                  />

                  <input

                    type="text"

                    value={searchQuery}

                    onChange={(e) => setSearchQuery(e.target.value)}

                    onFocus={() => setIsFocused(true)}

                    onBlur={() => setIsFocused(false)}

                    placeholder="Busca cualquier producto... 'arroz', 'laptop', 'medicinas'"

                    className="flex-1 px-6 py-6 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-lg md:text-xl"

                  />

                  {searchQuery && (

                    <button

                      type="button"

                      onClick={() => setSearchQuery("")}

                      className="mr-4 p-2 rounded-lg hover:bg-muted transition-colors duration-200"

                    >

                      <X size={20} strokeWidth={2} className="text-muted-foreground" />

                    </button>

                  )}

                </div>

                <button

                  type="submit"

                  disabled={isSearching || !searchQuery.trim()}

                  className="bg-gradient-emerald text-primary-foreground px-8 py-6 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity duration-300 mr-4 ml-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 min-w-[140px]"

                >

                  {isSearching ? (

                    <>

                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                      Buscando...

                    </>

                  ) : (

                    "Buscar"

                  )}

                </button>

              </div>

            </div>

          </form>

          {/* Welcome Message */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-6 font-medium">
            Busca comida, medicinas, tecnología o lo que necesites en todo Panamá
          </p>

          
            </div>

          )}



          {/* Search results - show when search has been performed */}

          {hasSearched && (

            <div className="space-y-6">

              {/* Search bar with back button */}

              <div className="flex items-center gap-4">

                <button

                  onClick={() => {

                    setHasSearched(false);

                    setSearchResults([]);

                    setSearchQuery("");

                    setVeredicto("");

                  }}

                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"

                >

                  <ArrowLeft size={20} />

                  <span>Volver</span>

                </button>

                <form onSubmit={handleSearch} className="flex-1 max-w-2xl">

                  <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>

                    <div className="absolute inset-0 bg-gradient-emerald rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

                    <div className={`relative flex items-center bg-background border-2 rounded-2xl transition-all duration-300 ${

                      isFocused 

                        ? 'border-primary shadow-elevated' 

                        : 'border-input hover:border-primary/50 shadow-soft'

                    }`}>

                      <div className="flex-1 flex items-center">

                        <Search 

                          size={20} 

                          strokeWidth={2.5} 

                          className={`ml-4 transition-colors duration-300 ${

                            isFocused ? 'text-primary' : 'text-muted-foreground'

                          }`}

                        />

                        <input

                          type="text"

                          value={searchQuery}

                          onChange={(e) => setSearchQuery(e.target.value)}

                          onFocus={() => setIsFocused(true)}

                          onBlur={() => setIsFocused(false)}

                          placeholder="Buscar productos, marcas, categorías..."

                          className="flex-1 px-4 py-4 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-base md:text-lg"

                        />

                        {searchQuery && (

                          <button

                            type="button"

                            onClick={() => setSearchQuery("")}

                            className="mr-2 p-1 rounded-lg hover:bg-muted transition-colors duration-200"

                          >

                            <X size={18} strokeWidth={2} className="text-muted-foreground" />

                          </button>

                        )}

                      </div>

                      <button

                        type="submit"

                        disabled={isSearching || !searchQuery.trim()}

                        className="bg-gradient-emerald text-primary-foreground px-6 py-4 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity duration-300 mr-2 ml-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px]"

                      >

                        {isSearching ? (

                          <>

                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                            Buscando...

                          </>

                        ) : (

                          "Buscar"

                        )}

                      </button>

                    </div>

                  </div>

                </form>

              </div>



              {/* Results header */}

              <div className="text-center">

                <h2 className="text-2xl font-bold text-foreground">

                  {searchResults.length > 0 

                    ? `${searchResults.length} resultado${searchResults.length === 1 ? '' : 's'} encontrados`

                    : 'No se encontraron resultados'

                  }

                </h2>

                {searchResults.length > 0 && (

                  <p className="text-muted-foreground mt-2">

                    Para "{searchQuery}"

                  </p>

                )}

              </div>



              {/* Análisis de ComprAhorro */}

              {veredicto && (

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-elevated">

                  <div className="flex items-start gap-3">

                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-emerald rounded-full flex items-center justify-center">

                      <span className="text-white font-bold text-sm">🔍</span>

                    </div>

                    <div className="flex-1">

                      <h3 className="font-bold text-emerald-800 mb-2">Análisis de ComprAhorro</h3>

                      <p className="text-emerald-700 text-sm leading-relaxed">{veredicto}</p>

                    </div>

                  </div>

                </div>

              )}



              {/* Results grid */}

              {searchResults.length > 0 && (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                  {searchResults.map((product, index) => (

                    <div

                      key={product.id || index}

                      style={{ animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both` }}

                    >

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

