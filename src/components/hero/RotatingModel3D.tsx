'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface RotatingModel3DProps {
  modelName?: string;
  totalFrames?: number;
  frameRate?: number;
  useSupabase?: boolean;
}

// Module-level cache for preloaded images
interface ImageCacheEntry {
  frameSources: string[];
  imagesLoaded: boolean;
}

const imageCache = new Map<string, ImageCacheEntry>();

const RotatingModel3D: React.FC<RotatingModel3DProps> = ({
  modelName = 'brake-rotor',
  totalFrames = 36,
  frameRate = 33, // milliseconds per frame
  useSupabase = false,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [frameSources, setFrameSources] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  // Base path for images (PNG sequence)
  const getImagePath = (frameIndex: number) => {
    const frameNumber = frameIndex.toString().padStart(3, '0');
    if (useSupabase) {
      // Supabase storage URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      return `${supabaseUrl}/storage/v1/object/public/model-frames/${modelName}/${modelName}-${frameNumber}.png`;
    }
    return `/model-frames/${modelName}/${modelName}-${frameNumber}.png`;
  };

  // Preload all images for smooth animation with caching
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create cache key based on model configuration
    const cacheKey = `${modelName}-${totalFrames}-${useSupabase}`;
    
    // Check cache first - if images were already loaded, use cached data immediately
    const cached = imageCache.get(cacheKey);
    if (cached && cached.imagesLoaded) {
      setFrameSources(cached.frameSources);
      setImagesLoaded(true);
      return;
    }

    // If not fully cached, load images
    const sources = Array.from({ length: totalFrames }, (_, i) => getImagePath(i));
    setFrameSources(sources);

    // Initialize cache entry
    if (!cached) {
      imageCache.set(cacheKey, {
        frameSources: sources,
        imagesLoaded: false,
      });
    }

    let loadedCount = 0;
    let cancelled = false;

    // Load all images in parallel (browser cache will handle actual caching)
    sources.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (!cancelled && loadedCount === sources.length) {
          // Update cache when all images are loaded
          const cacheEntry = imageCache.get(cacheKey);
          if (cacheEntry) {
            cacheEntry.imagesLoaded = true;
          }
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (!cancelled && loadedCount === sources.length) {
          // Even if some images fail, mark as loaded to prevent infinite loading
          const cacheEntry = imageCache.get(cacheKey);
          if (cacheEntry) {
            cacheEntry.imagesLoaded = true;
          }
          setImagesLoaded(true);
        }
      };
    });

    return () => {
      cancelled = true;
    };
  }, [totalFrames, modelName, useSupabase]);

  // Rotate through frames with hover acceleration
  const currentFrameRate = isHovered ? frameRate * 0.6 : frameRate; // 2.5x faster on hover

  useEffect(() => {
    if (!imagesLoaded) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % totalFrames);
    }, currentFrameRate);

    return () => clearInterval(interval);
  }, [imagesLoaded, totalFrames, currentFrameRate]);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center transition-transform duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ minHeight: '400px', maxHeight: '450px' }}
    >
      {/* Loading State */}
      {!imagesLoaded && (
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-medium text-sm">Loading 3D Model...</p>
        </div>
      )}

      {/* Render Current Frame */}
      {imagesLoaded && frameSources.length > 0 && (
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <Image
            src={frameSources[currentFrame]}
            alt="Rotating brake rotor 3D model"
            width={450}
            height={450}
            className="drop-shadow-2xl object-contain"
            style={{ width: '450px', height: '450px', maxWidth: '100%', maxHeight: '100%' }}
            priority={currentFrame === 0}
            unoptimized={useSupabase}
          />
        </div>
      )}

      {/* Model Label
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-6 py-3 shadow-lg z-20">
        <p className="text-sm font-mono text-gray-700">
          A 320mm vented brake rotor with 5 M12 holes on 114.3mm PCD
        </p>
      </div> */}

    </div>
  );
};

export default RotatingModel3D;
