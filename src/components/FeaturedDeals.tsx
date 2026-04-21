import { Tag, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface Deal {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  store: string;
  storeColor: string;
  discount?: number;
  location: string;
  distance: string;
  reference: string;
  condition: string;
  stock: string;
  isOpen: boolean;
  phone: string;
  whatsapp: string;
  productUrl: string;
  storeLogo?: string;
}

const FeaturedDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Fetch real data from API
    const fetchFeaturedDeals = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://proyectocompras.onrender.com';
        const response = await fetch(`${apiUrl}/ahorros/destacados`);
        
        if (response.ok) {
          const data = await response.json();
          setDeals(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching featured deals:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set timeout to show welcome message after 3 seconds
    const timeoutId = setTimeout(() => {
      setShowWelcome(true);
      setLoading(false);
    }, 3000);

    fetchFeaturedDeals();

    return () => clearTimeout(timeoutId);
  }, []);

  if (loading && !showWelcome) {
    return (
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Sparkles className="animate-spin text-primary" size={20} />
            <span className="text-muted-foreground">Cargando ofertas destacadas...</span>
          </div>
        </div>
      </section>
    );
  }

  if (showWelcome || deals.length === 0) {
    return null; // Don't show duplicate welcome message - HeroSearch handles this
  }

  if (deals.length === 0) {
    return (
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto">
            <Tag size={24} className="text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Ofertas Destacadas</h2>
          <p className="text-muted-foreground">No hay ofertas disponibles en este momento</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-10 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
            <Tag size={18} className="text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Ofertas Destacadas</h2>
        </div>
        <button className="text-sm font-medium text-primary hover:underline underline-offset-4">
          Ver todas
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {deals.map((deal, i) => (
          <div
            key={deal.id}
            className="group bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden hover:shadow-card transition-all duration-300 cursor-pointer"
            style={{ animation: `fade-in-up 0.5s ease-out ${i * 0.1}s both` }}
          >
            {/* Discount badge */}
            <div className="relative">
              <img
                src={deal.image}
                alt={deal.name}
                loading="lazy"
                className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {deal.discount && (
                <span className="absolute top-3 left-3 bg-gradient-emerald text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-lg">
                  -{deal.discount}%
                </span>
              )}
            </div>

            <div className="p-3 md:p-4 space-y-3">
              {/* Header with location and distance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{deal.location} · {deal.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${deal.isOpen ? 'bg-[#7ecfa4]' : 'bg-gray-400'}`} />
                  <span className={`text-xs font-medium ${deal.isOpen ? 'text-[#2e7d52]' : 'text-gray-500'}`}>
                    {deal.isOpen ? 'ABIERTO' : 'CERRADO'}
                  </span>
                </div>
              </div>

              {/* Store identity */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center border border-primary/30">
                  <span className="text-xs font-bold text-primary">{deal.store.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{deal.store}</p>
                  <p className="text-xs text-muted-foreground">Tienda oficial</p>
                </div>
              </div>
              
              {/* Product name */}
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                {deal.name}
              </h3>
              
              {/* Product reference and condition */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{deal.reference}</span>
                <span>·</span>
                <span>{deal.condition}</span>
                <span>·</span>
                <span>{deal.stock}</span>
              </div>
              
              {/* Price section */}
              <div className="bg-[#e8f5ee] border-2 border-dashed border-[#2e7d52] rounded-lg p-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-foreground">
                    ${deal.price.toFixed(2)}
                  </span>
                  {deal.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      ${deal.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="space-y-2">
                <a
                  href={deal.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-emerald text-primary-foreground text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-all duration-300 shadow-elevated hover:shadow-card"
                >
                  Ver en el comercio
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedDeals;

