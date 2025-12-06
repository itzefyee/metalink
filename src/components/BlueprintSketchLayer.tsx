export default function BlueprintSketchLayer() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-10">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="blueprint-sketch" width="60" height="60" patternUnits="userSpaceOnUse">
            <path 
              d="M 0 30 Q 15 20, 30 30 T 60 30" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5"
              className="text-white"
            />
            <path 
              d="M 30 0 Q 20 15, 30 30 T 30 60" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5"
              className="text-white"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-sketch)"/>
      </svg>
    </div>
  );
}

