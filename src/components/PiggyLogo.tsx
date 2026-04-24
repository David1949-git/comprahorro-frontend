import piggyLogo from "@/assets/piggy-logo.png"; // This is now piggy-logo-ARmd533S.png

const PiggyLogo = ({ size = 32, className }: { size?: number; className?: string }) => {
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-emerald-100/40 to-transparent backdrop-blur-sm flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={piggyLogo}
        alt="ComprAhorro"
        width={size * 0.8}
        height={size * 0.8}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
};

export default PiggyLogo;

