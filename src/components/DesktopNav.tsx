import { Home, ArrowLeftRight, Heart, User } from "lucide-react";
import PiggyLogo from "@/components/PiggyLogo";

const DesktopNav = () => {
  return (
    <header className="hidden md:block sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <PiggyLogo size={32} />
          <span className="font-bold text-lg text-foreground">ComprAhorro</span>
        </div>

        <nav className="flex items-center gap-1">
          {[
            { name: "Inicio", icon: Home },
            { name: "Comparar", icon: ArrowLeftRight },
            { name: "Favoritos", icon: Heart },
            { name: "Perfil", icon: User },
          ].map((item, i) => (
            <button
              key={item.name}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                i === 0
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default DesktopNav;
