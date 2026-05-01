const fs = require('fs');
const nuevo = `import piggyLogo from "@/assets/piggy-logo.png";
const PiggyLogo = ({ size = 32, className }: { size?: number; className?: string }) => {
  return (
    <div
      className={\`relative flex items-center justify-center \${className}\`}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 35%, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.07) 60%, transparent 100%)",
          filter: "blur(2px)",
        }}
      />
      <img
        src={piggyLogo}
        alt="ComprAhorro"
        width={size}
        height={size}
        className="relative z-10 w-full h-full object-contain drop-shadow-md"
        loading="lazy"
      />
    </div>
  );
};
export default PiggyLogo;`;
fs.writeFileSync('src/components/PiggyLogo.tsx', nuevo, 'utf8');
console.log('PiggyLogo actualizado OK');
