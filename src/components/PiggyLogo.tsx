import piggyLogo from "@/assets/piggy-logo.png"; // This is now piggy-logo-ARmd533S.png

const PiggyLogo = ({ size = 32, className }: { size?: number; className?: string }) => {
  return (
    <div
      className={`bg-white rounded-lg flex items-center justify-center overflow-hidden ${className}`}
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

