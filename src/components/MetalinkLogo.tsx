import React from 'react';

interface MetalinkLogoProps {
  variant?: 'default' | 'white';
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

const MetalinkLogo: React.FC<MetalinkLogoProps> = ({ 
  variant = 'default', 
  className = '',
  showText = true,
  size = 'md',
  iconOnly = false
}) => {
  const isWhite = variant === 'white';
  
  // Size mappings
  const sizeMap = {
    sm: { icon: 32, text: 'text-lg', iconText: 'text-sm' },
    md: { icon: 44, text: 'text-xl', iconText: 'text-base' },
    lg: { icon: 56, text: 'text-2xl', iconText: 'text-lg' }
  };
  
  const currentSize = sizeMap[size];
  const iconSize = currentSize.icon;

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* Logo Icon with M */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background Circle with Gradient */}
        <defs>
          <linearGradient id="metalinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isWhite ? '#60A5FA' : '#3B82F6'} />
            <stop offset="100%" stopColor={isWhite ? '#2563EB' : '#1D4ED8'} />
          </linearGradient>
          <filter id="metalinkShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer Circle with subtle shadow */}
        <circle 
          cx="22" 
          cy="22" 
          r="20" 
          fill="url(#metalinkGradient)"
          filter="url(#metalinkShadow)"
        />
        
        {/* Bold Modern "M" Letter */}
        <g transform="translate(22, 22)">
          {/* Left vertical stroke */}
          <path
            d="M -7 -8 L -7 6"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Left diagonal (top to center) */}
          <path
            d="M -7 -8 L 0 2"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Right diagonal (center to top) */}
          <path
            d="M 0 2 L 7 -8"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Right vertical stroke */}
          <path
            d="M 7 -8 L 7 6"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Center point accent */}
          <circle
            cx="0"
            cy="2"
            r="1.5"
            fill="#FFFFFF"
            opacity="0.9"
          />
        </g>
      </svg>

      {/* Logo Text with gradient effect */}
      {showText && !iconOnly && (
        <span 
          className={`${currentSize.text} font-bold tracking-tight bg-gradient-to-r ${
            isWhite 
              ? 'from-white to-blue-100' 
              : 'from-gray-900 via-blue-700 to-gray-900'
          } bg-clip-text text-transparent`}
        >
          Metalink
        </span>
      )}
    </div>
  );
};

export default MetalinkLogo;
