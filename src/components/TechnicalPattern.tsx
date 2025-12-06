export default function TechnicalPattern() {
  return (
    <div className="absolute inset-0 opacity-30 pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-tech" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1.2"/>
          </pattern>
          <pattern id="dots-tech" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.6" fill="currentColor"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-tech)" className="text-white/20"/>
        <rect width="100%" height="100%" fill="url(#dots-tech)" className="text-white/20"/>
      </svg>
    </div>
  );
}


