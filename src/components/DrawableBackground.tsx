'use client';

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

interface DrawableBackgroundProps {
  enabled?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  className?: string;
}

export interface DrawableBackgroundRef {
  clear: () => void;
}

const DrawableBackground = forwardRef<DrawableBackgroundRef, DrawableBackgroundProps>(({
  enabled = true,
  strokeColor = 'rgba(93, 170, 255, 0.3)',
  strokeWidth = 2,
  opacity = 0.4,
  className = '',
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);
  const [heroBounds, setHeroBounds] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Find and track hero section bounds
  useEffect(() => {
    const updateHeroBounds = () => {
      // Find the hero section (first section with blue gradient and Prompt-to-CAD)
      const sections = Array.from(document.querySelectorAll('section'));
      const heroSection = sections.find(section => {
        const classes = section.className || '';
        const hasBlueGradient = classes.includes('bg-gradient-to-br') && 
                                (classes.includes('from-primary') || 
                                 classes.includes('via-blue-600') ||
                                 classes.includes('to-blue-700'));
        if (hasBlueGradient) {
          const hasPromptToCAD = section.querySelector('h1') && 
                                 (section.textContent?.includes('Prompt-to-CAD') || 
                                  section.querySelector('[class*="RotatingModel3D"]') !== null ||
                                  section.querySelector('[class*="catalog-glass-container"]') !== null);
          return hasPromptToCAD;
        }
        return false;
      });

      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        setHeroBounds({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      }
    };

    // Initial update
    updateHeroBounds();

    // Update on scroll and resize
    window.addEventListener('scroll', updateHeroBounds, { passive: true });
    window.addEventListener('resize', updateHeroBounds);
    
    // Also update after a short delay to catch dynamic content
    const timeoutId = setTimeout(updateHeroBounds, 100);

    return () => {
      window.removeEventListener('scroll', updateHeroBounds);
      window.removeEventListener('resize', updateHeroBounds);
      clearTimeout(timeoutId);
    };
  }, []);

  // Initialize canvas with hero section dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !heroBounds) return;

    const resizeCanvas = () => {
      canvas.width = heroBounds.width;
      canvas.height = heroBounds.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [heroBounds]);

  const getCoordinates = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !heroBounds) return null;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Convert to coordinates relative to hero section
    const x = clientX - heroBounds.left + window.scrollX;
    const y = clientY - heroBounds.top + window.scrollY;

    // Clamp to hero section bounds
    const clampedX = Math.max(0, Math.min(x, heroBounds.width));
    const clampedY = Math.max(0, Math.min(y, heroBounds.height));

    return { x: clampedX, y: clampedY };
  }, [heroBounds]);

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
    setIsDrawing(false);
    setLastPosition(null);
    // Re-enable text selection
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }, []);

  const draw = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = opacity;

    if (lastPosition) {
      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    setLastPosition({ x, y });
  }, [strokeColor, strokeWidth, opacity, lastPosition]);

  const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    if (!enabled) return;
    
    // Get the actual target element at the click position
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const target = document.elementFromPoint(clientX, clientY) as HTMLElement;
    
    if (!target) return;
    
    // Check if clicking directly on interactive elements (buttons, links, inputs)
    const isDirectlyInteractive = 
      (target.tagName === 'A' && target.getAttribute('href')) ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'TEXTAREA' ||
      target.getAttribute('role') === 'button' ||
      target.closest('button:not([disabled]), a[href], input:not([disabled]), select, textarea');
    
    // Check if it's a glass card or glass container
    const isGlassCard = target.closest('[class*="glass-card"]') || 
                        target.closest('[class*="catalog-glass-container"]');
    
    // Check if clicking on "Prompt-to-CAD" text (h1 element or its children)
    const isPromptToCAD = target.tagName === 'H1' || 
                          target.closest('h1') ||
                          (target.textContent && target.textContent.includes('Prompt-to-CAD')) ||
                          target.closest('[class*="text-6xl"], [class*="text-7xl"], [class*="text-8xl"]');
    
    // Check if we're on the hero section (only section where drawing is allowed)
    // Hero section is identified by containing "Prompt-to-CAD" text or being the first blue gradient section
    const section = target.closest('section');
    let isOnHeroSection = false;
    
    if (section) {
      const sectionClasses = section.className || '';
      // Check if section has the blue gradient classes (hero section has these)
      const hasBlueGradient = sectionClasses.includes('bg-gradient-to-br') && 
                              (sectionClasses.includes('from-primary') || 
                               sectionClasses.includes('via-blue-600') ||
                               sectionClasses.includes('to-blue-700'));
      
      if (hasBlueGradient) {
        // Check if this is the hero section by looking for unique hero content
        // Hero section contains "Prompt-to-CAD" h1 or RotatingModel3D component
        const hasPromptToCAD = section.querySelector('h1') && 
                               (section.textContent?.includes('Prompt-to-CAD') || 
                                section.querySelector('[class*="RotatingModel3D"]') !== null ||
                                section.querySelector('[class*="catalog-glass-container"]') !== null);
        
        // Also check if it's the first blue gradient section (hero is typically first)
        const allSections = Array.from(document.querySelectorAll('section'));
        const blueGradientSections = allSections.filter(sec => {
          const classes = sec.className || '';
          return classes.includes('bg-gradient-to-br') && 
                 (classes.includes('from-primary') || 
                  classes.includes('via-blue-600') ||
                  classes.includes('to-blue-700'));
        });
        const isFirstBlueGradient = blueGradientSections.length > 0 && section === blueGradientSections[0];
        
        isOnHeroSection = hasPromptToCAD || isFirstBlueGradient;
      }
    }
    
    // Only allow drawing on hero section, and block interactive elements, glass cards, and Prompt-to-CAD text
    if (isDirectlyInteractive || isGlassCard || isPromptToCAD || !isOnHeroSection) {
      return; // Don't draw on interactive elements, glass components, Prompt-to-CAD text, or non-hero areas
    }
    
    // Prevent text selection and default behaviors
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent text selection globally while drawing
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    const coords = getCoordinates(e);
    if (coords) {
      isDrawingRef.current = true;
      setIsDrawing(true);
      setLastPosition(coords);
      // Draw initial point
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = strokeColor;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(coords.x, coords.y, strokeWidth / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, [enabled, getCoordinates, strokeColor, strokeWidth, opacity]);

  const continueDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    if (!enabled || !isDrawingRef.current) return;
    
    // Check if we're over an interactive element
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const target = document.elementFromPoint(clientX, clientY) as HTMLElement;
    
    if (target) {
      const isDirectlyInteractive = 
        (target.tagName === 'A' && target.getAttribute('href')) ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.getAttribute('role') === 'button' ||
        target.closest('button:not([disabled]), a[href], input:not([disabled]), select, textarea');
      
      const isGlassCard = target.closest('[class*="glass-card"]') || 
                          target.closest('[class*="catalog-glass-container"]');
      
      // Check if over "Prompt-to-CAD" text
      const isPromptToCAD = target.tagName === 'H1' || 
                            target.closest('h1') ||
                            (target.textContent && target.textContent.includes('Prompt-to-CAD')) ||
                            target.closest('[class*="text-6xl"], [class*="text-7xl"], [class*="text-8xl"]');
      
      // Check if we're still on the hero section
      const section = target.closest('section');
      let isOnHeroSection = false;
      
      if (section) {
        const sectionClasses = section.className || '';
        const hasBlueGradient = sectionClasses.includes('bg-gradient-to-br') && 
                                (sectionClasses.includes('from-primary') || 
                                 sectionClasses.includes('via-blue-600') ||
                                 sectionClasses.includes('to-blue-700'));
        
        if (hasBlueGradient) {
          const hasPromptToCAD = section.querySelector('h1') && 
                                 (section.textContent?.includes('Prompt-to-CAD') || 
                                  section.querySelector('[class*="RotatingModel3D"]') !== null ||
                                  section.querySelector('[class*="catalog-glass-container"]') !== null);
          
          const allSections = Array.from(document.querySelectorAll('section'));
          const blueGradientSections = allSections.filter(sec => {
            const classes = sec.className || '';
            return classes.includes('bg-gradient-to-br') && 
                   (classes.includes('from-primary') || 
                    classes.includes('via-blue-600') ||
                    classes.includes('to-blue-700'));
          });
          const isFirstBlueGradient = blueGradientSections.length > 0 && section === blueGradientSections[0];
          
          isOnHeroSection = hasPromptToCAD || isFirstBlueGradient;
        }
      }
      
      // Stop if over interactive element, glass card, Prompt-to-CAD text, or left the hero section
      if (isDirectlyInteractive || isGlassCard || isPromptToCAD || !isOnHeroSection) {
        stopDrawing();
        return;
      }
    }
    
    e.preventDefault();
    e.stopPropagation();
    const coords = getCoordinates(e);
    if (coords) {
      draw(coords.x, coords.y);
    }
  }, [enabled, getCoordinates, draw, stopDrawing]);

  useEffect(() => {
    if (!enabled) return;

    // Use document-level events to capture all mouse movements
    const handleMouseDown = (e: MouseEvent) => {
      startDrawing(e);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDrawingRef.current) {
        continueDrawing(e);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      stopDrawing();
    };

    const handleTouchStart = (e: TouchEvent) => {
      startDrawing(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDrawingRef.current) {
        continueDrawing(e);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      stopDrawing();
    };

    // Add event listeners to document
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      // Clean up text selection prevention
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [enabled, startDrawing, continueDrawing, stopDrawing]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);


  // Expose clear function via ref
  useImperativeHandle(ref, () => ({
    clear: clearCanvas,
  }));

  if (!heroBounds) {
    return null; // Don't render until hero section is found
  }

  return (
    <div 
      ref={containerRef}
      className={`fixed z-[12] ${className}`}
      style={{ 
        pointerEvents: 'none', // Let clicks pass through to content
        top: `${heroBounds.top}px`,
        left: `${heroBounds.left}px`,
        width: `${heroBounds.width}px`,
        height: `${heroBounds.height}px`,
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          cursor: enabled ? 'crosshair' : 'default',
          pointerEvents: 'none' // Canvas doesn't block interactions
        }}
      />
    </div>
  );
});

DrawableBackground.displayName = 'DrawableBackground';

export default DrawableBackground;

