'use client';

import React, { useEffect, useState } from 'react';

type BlueprintVariant = 'hero' | 'section';

interface BlueprintSketchLayerProps {
    variant?: BlueprintVariant;
    parallaxOffset?: number;
    className?: string;
}

const BlueprintSketchLayer: React.FC<BlueprintSketchLayerProps> = ({
    variant = 'section',
    parallaxOffset,
    className = '',
}) => {
    const [scrollOffset, setScrollOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (typeof window !== 'undefined') {
                setScrollOffset(window.scrollY || 0);
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const opacityClass = variant === 'hero' ? 'opacity-80' : 'opacity-60';
    const variantParallax = typeof parallaxOffset === 'number' ? parallaxOffset * 0.2 : 0;
    const intensity = variant === 'hero' ? 0.42 : 0.32;

    const getTransformStyle = (dx: number, dy: number) => ({
        transform: `translate3d(${scrollOffset * dx * intensity}px, ${scrollOffset * dy * intensity + variantParallax
            }px, 0)`,
    });

    const circles = [
        { className: 'top-10 left-12 w-24 h-24', drift: { x: 0.8, y: 0.9 } },
        { className: 'top-1/4 right-12 w-32 h-32', drift: { x: -1.1, y: 1.0 } },
        { className: 'bottom-24 left-1/5 w-28 h-28', drift: { x: 0.75, y: -0.9 } },
        { className: 'bottom-10 right-1/3 w-24 h-24', drift: { x: -0.7, y: -0.75 } },
    ];

    const squares = [
        { className: 'top-1/5 left-1/3 w-20 h-20 rotate-12', drift: { x: 0.6, y: 0.75 } },
        { className: 'bottom-1/3 right-8 w-28 h-28 rotate-45', drift: { x: -0.9, y: 1.0 } },
        { className: 'top-1/2 right-1/4 w-24 h-24 -rotate-6', drift: { x: 0.65, y: -0.65 } },
    ];

    const triangles = [
        { className: 'top-1/3 left-1/6 w-28 h-28', stroke: 'rgba(191, 219, 254, 0.75)', drift: { x: 0.45, y: 0.8 } },
        { className: 'bottom-1/4 right-1/4 w-28 h-28', stroke: 'rgba(191, 219, 254, 0.6)', drift: { x: -0.5, y: -0.75 } },
    ];

    const lines = [
        { x1: 120, y1: 200, x2: 320, y2: 260, drift: { x: 0.7, y: 0.85 } },
        { x1: 680, y1: 140, x2: 900, y2: 190, drift: { x: -0.6, y: 0.7 } },
        { x1: 200, y1: 620, x2: 420, y2: 700, drift: { x: 0.55, y: -0.6 } },
        { x1: 580, y1: 720, x2: 860, y2: 780, drift: { x: -0.65, y: -0.55 } },
    ];

    const circlesOverlay = [
        { cx: 260, cy: 360, r: 36, drift: { x: 0.65, y: 0.7 } },
        { cx: 760, cy: 520, r: 48, drift: { x: -0.6, y: -0.65 } },
    ];

    return (
        <div className={`absolute inset-0 pointer-events-none ${opacityClass} ${className}`}>
            <div className="absolute inset-0">
                {circles.map(({ className, drift }) => (
                    <div
                        key={className}
                        className={`absolute ${className} border border-blue-100/90 rounded-full shadow-[0_10px_40px_rgba(30,64,175,0.35)]`}
                        style={getTransformStyle(drift.x, drift.y)}
                    />
                ))}

                {squares.map(({ className, drift }) => (
                    <div
                        key={className}
                        className={`absolute ${className} border border-blue-100/80 shadow-[0_6px_30px_rgba(15,23,42,0.4)]`}
                        style={getTransformStyle(drift.x, drift.y)}
                    />
                ))}

                {triangles.map(({ className, stroke, drift }) => (
                    <svg
                        key={className}
                        className={`absolute ${className}`}
                        viewBox="0 0 100 100"
                        style={getTransformStyle(drift.x, drift.y)}
                    >
                        <polygon points="50,10 90,90 10,90" fill="none" stroke={stroke} strokeWidth="1.4" />
                    </svg>
                ))}

                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                    {lines.map(({ x1, y1, x2, y2, drift }) => (
                        <line
                            key={`${x1}-${y1}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="rgba(191,219,254,0.75)"
                            strokeWidth="1.8"
                            transform={`translate(${scrollOffset * drift.x * intensity}, ${scrollOffset * drift.y * intensity + variantParallax
                                })`}
                        />
                    ))}
                    {circlesOverlay.map(({ cx, cy, r, drift }) => (
                        <circle
                            key={`${cx}-${cy}`}
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill="none"
                            stroke="rgba(191,219,254,0.8)"
                            strokeWidth="1.8"
                            transform={`translate(${scrollOffset * drift.x * intensity}, ${scrollOffset * drift.y * intensity + variantParallax
                                })`}
                        />
                    ))}
                </svg>

                {variant === 'hero' && (
                    <>
                        {[
                            { className: 'top-8 left-6 w-32 h-32', drift: { x: 0.75, y: 0.8 } },
                            { className: 'top-32 left-12 w-24 h-24 -rotate-12', drift: { x: 0.65, y: 0.6 } },
                            { className: 'bottom-32 left-10 w-28 h-28', drift: { x: 0.7, y: -0.65 } },
                        ].map(({ className, drift }) => (
                            <div
                                key={className}
                                className={`absolute ${className} border border-blue-100/80 rounded-full blur-[0.5px]`}
                                style={getTransformStyle(drift.x, drift.y)}
                            />
                        ))}
                        <svg
                            className="absolute top-1/2 left-6 w-20 h-20"
                            viewBox="0 0 100 100"
                            style={getTransformStyle(0.55, 0.75)}
                        >
                            <polygon points="50,10 90,90 10,90" fill="none" stroke="rgba(191, 219, 254, 0.7)" strokeWidth="1.6" />
                        </svg>
                    </>
                )}
            </div>
        </div>
    );
};

export default BlueprintSketchLayer;

