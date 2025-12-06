'use client';

import React from 'react';

interface WireframeIconLayerProps {
    className?: string;
}

const outlineClass =
    'stroke-current text-blue-300 fill-transparent stroke-[1.5] drop-shadow-[0_6px_18px_rgba(59,130,246,0.25)]';

const icons: Array<{ className: string; svg: React.ReactNode }> = [
    {
        className: 'absolute top-[4%] left-[-5%] w-[160px] h-[160px] rotate-6 opacity-80 animate-wireframeFloat1',
        svg: (
            <svg viewBox="0 0 64 64" className="w-full h-full">
                <rect x="8" y="18" width="48" height="28" rx="6" className={outlineClass} />
                <circle cx="26" cy="32" r="9" className={outlineClass} />
                <path d="M45 23l6-6" className={outlineClass} />
            </svg>
        ),
    },
    {
        className: 'absolute top-[12%] right-[-6%] w-[170px] h-[170px] -rotate-6 opacity-70 animate-wireframeFloat2',
        svg: (
            <svg viewBox="0 0 80 80" className="w-full h-full">
                <path d="M8 48h64l-10 10H18L8 48Z" className={outlineClass} />
                <path d="M18 48c4-14 10-26 22-26s18 12 22 26" className={outlineClass} />
                <circle cx="40" cy="20" r="6" className={outlineClass} />
            </svg>
        ),
    },
    {
        className: 'absolute top-[36%] left-[-8%] w-[150px] h-[150px] opacity-75 animate-wireframeFloat3',
        svg: (
            <svg viewBox="0 0 72 72" className="w-full h-full">
                <path d="M12 40c14-10 20-10 34 0" className={outlineClass} />
                <path d="M16 52h40l8 8H8l8-8Z" className={outlineClass} />
                <circle cx="36" cy="28" r="10" className={outlineClass} />
            </svg>
        ),
    },
    {
        className: 'absolute top-[42%] right-[-8%] w-[150px] h-[150px] opacity-75 animate-wireframeFloat4',
        svg: (
            <svg viewBox="0 0 72 72" className="w-full h-full">
                <path d="M12 50h48v10H12z" className={outlineClass} />
                <path d="M20 50V34c0-8 6-14 14-14h4c8 0 14 6 14 14v16" className={outlineClass} />
                <circle cx="28" cy="26" r="4" className={outlineClass} />
                <circle cx="44" cy="26" r="4" className={outlineClass} />
            </svg>
        ),
    },
    {
        className: 'absolute bottom-[14%] left-[-6%] w-[180px] h-[180px] opacity-80 animate-wireframeFloat5',
        svg: (
            <svg viewBox="0 0 80 80" className="w-full h-full">
                <path d="M12 54h56v6H12z" className={outlineClass} />
                <path d="M20 54V32c0-10 8-18 18-18h4c10 0 18 8 18 18v22" className={outlineClass} />
                <path d="M30 32h20v8H30z" className={outlineClass} />
            </svg>
        ),
    },
    {
        className: 'absolute bottom-[10%] right-[-7%] w-[190px] h-[190px] opacity-85 animate-wireframeFloat6',
        svg: (
            <svg viewBox="0 0 90 90" className="w-full h-full">
                <path d="M10 62h70l-10 14H20L10 62Z" className={outlineClass} />
                <path d="M18 62c8-18 16-28 27-28s19 10 27 28" className={outlineClass} />
                <circle cx="45" cy="28" r="8" className={outlineClass} />
            </svg>
        ),
    },
];

const WireframeIconLayer: React.FC<WireframeIconLayerProps> = ({ className = '' }) => {
    React.useEffect(() => {
        // Inject keyframes for wireframe animations
        if (typeof document !== 'undefined' && !document.head.querySelector('#wireframe-float-keyframes')) {
            const style = document.createElement('style');
            style.id = 'wireframe-float-keyframes';
            style.innerHTML = `
        @keyframes wireframeFloat1 {
          0%, 100% { transform: translateY(0) rotate(6deg); }
          50% { transform: translateY(-12px) rotate(6deg); }
        }
        @keyframes wireframeFloat2 {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-10px) rotate(-6deg); }
        }
        @keyframes wireframeFloat3 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes wireframeFloat4 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-11px); }
        }
        @keyframes wireframeFloat5 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-13px); }
        }
        @keyframes wireframeFloat6 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
      `;
            document.head.appendChild(style);
        }
    }, []);

    return (
        <div className={`absolute inset-0 pointer-events-none z-[1] ${className}`}>
            {icons.map((icon, index) => (
                <div key={index} className={icon.className}>
                    {icon.svg}
                </div>
            ))}
        </div>
    );
};

export default WireframeIconLayer;

