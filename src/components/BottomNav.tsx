import { Home, ArrowLeftRight, Heart, User } from "lucide-react";
import { useState } from "react";

const navItems = [
  { name: "Inicio", icon: Home },
  { name: "Comparar", icon: ArrowLeftRight },
  { name: "Favoritos", icon: Heart },
  { name: "Perfil", icon: User },
];

const BottomNav = () => {
  const [active, setActive] = useState("Inicio");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border/50 safe-area-bottom md:hidden">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = active === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="transition-all"
              />
              <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                {item.name}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
