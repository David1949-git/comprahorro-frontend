import { MapPin, Phone, MessageCircle, ExternalLink } from "lucide-react";

interface Product {
  producto: string;
  tienda: string;
  precioFinal: string;
  link: string;
  imagen: string;
  tipo: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
      {/* Product image with overlay */}
      <div className="relative overflow-hidden">
        <img
          src={product.imagen || '/placeholder-product.png'}
          alt={product.producto}
          loading="lazy"
          className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-500"
        />
        {/* Store badge overlay */}
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md">
          <span className="text-xs font-bold text-gray-700">{product.tienda}</span>
        </div>
      </div>

      <div className="p-3 md:p-4 space-y-3">
        {/* Store identity with enhanced display */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center border border-primary/30">
            <span className="text-xs font-bold text-primary">{product.tienda.charAt(0)}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{product.tienda}</p>
            <p className="text-xs text-muted-foreground">{product.tipo === 'tienda' ? 'Tienda oficial' : 'Recomendado'}</p>
          </div>
        </div>
        
        {/* Product name */}
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
          {product.producto}
        </h3>
        
        {/* Price section with professional styling */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-700">
              {product.precioFinal}
            </span>
            <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">
              Mejor Precio
            </div>
          </div>
        </div>
        
        {/* Action buttons with prioritized 'Ver en el comercio' */}
        <div className="space-y-2">
          {/* Primary action - Ver en el comercio */}
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ExternalLink size={16} strokeWidth={2} />
            Ver en el comercio
          </a>
          
          {/* Secondary actions */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1 border border-gray-300 text-gray-700 text-xs font-medium py-2 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              <MessageCircle size={14} />
              Consultar
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 border border-gray-300 text-gray-700 text-xs font-medium py-2 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              <Phone size={14} />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
