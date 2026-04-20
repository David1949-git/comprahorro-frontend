import { ShoppingCart, Pill, Laptop } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    name: "Súper",
    description: "Alimentos y hogar",
    icon: ShoppingCart,
    gradient: "from-primary to-emerald-glow",
    searchQuery: "supermercado alimentos bebidas",
  },
  {
    name: "Farmacia",
    description: "Salud y bienestar",
    icon: Pill,
    gradient: "from-primary to-emerald-glow",
    searchQuery: "farmacia medicamentos salud",
  },
  {
    name: "Electrónica",
    description: "Tech y gadgets",
    icon: Laptop,
    gradient: "from-primary to-emerald-glow",
    searchQuery: "electrónica tecnología computadoras celulares",
  },
];

const QuickCategories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: typeof categories[0]) => {
    // Navigate to home with search query
    navigate(`/?q=${encodeURIComponent(category.searchQuery)}`);
  };

  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Categorías</h2>
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        {categories.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => handleCategoryClick(cat)}
            className="group relative bg-accent hover:bg-primary/5 rounded-2xl p-5 md:p-8 flex flex-col items-center gap-3 transition-all duration-300 border border-transparent hover:border-primary/20 cursor-pointer"
            style={{ animation: `fade-in-up 0.5s ease-out ${i * 0.1}s both` }}
          >
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-emerald rounded-2xl flex items-center justify-center shadow-elevated group-hover:scale-110 transition-transform duration-300">
              <cat.icon size={24} className="text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm md:text-base text-foreground">{cat.name}</p>
              <p className="text-xs text-muted-foreground hidden md:block mt-0.5">{cat.description}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickCategories;
