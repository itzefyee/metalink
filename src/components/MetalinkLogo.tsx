import React from 'react';

interface MetalinkLogoProps {
  variant?: 'default' | 'white';
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const MetalinkLogo: React.FC<MetalinkLogoProps> = ({ 
  variant = 'default', 
  className = '',
  showText = true,
  size = 'md'
}) => {
  const isWhite = variant === 'white';
  const iconColor = isWhite ? '#FFFFFF' : '#2563EB';
  const textColor = isWhite ? '#FFFFFF' : '#1F2937';
  
  // Size mappings
  const sizeMap = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 44, text: 'text-xl' },
    lg: { icon: 56, text: 'text-2xl' }
  };
  
  const currentSize = sizeMap[size];
  const iconSize = currentSize.icon;

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* Logo Icon */}
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
        
        {/* Link/Chain Icon - Modern connected links design */}
        <g transform="translate(22, 22)">
          {/* Left Link Ring */}
          <ellipse
            cx="-6"
            cy="-2"
            rx="4.5"
            ry="3.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d="M -6 -5.5 L -6 -8.5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.95"
          />
          
          {/* Right Link Ring */}
          <ellipse
            cx="6"
            cy="-2"
            rx="4.5"
            ry="3.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d="M 6 -5.5 L 6 -8.5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.95"
          />
          
          {/* Top Connecting Arc */}
          <path
            d="M -6 -8.5 Q 0 -10.5 6 -8.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.95"
          />
          
          {/* Bottom Connecting Arc */}
          <path
            d="M -6 1.5 Q 0 3.5 6 1.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.95"
          />
          
          {/* Center connecting line for depth */}
          <line
            x1="-2"
            y1="-2"
            x2="2"
            y2="-2"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity="0.6"
          />
        </g>
      </svg>

      {/* Logo Text with gradient effect */}
      {showText && (
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
