'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import RotatingModel3D from '@/components/hero/RotatingModel3D';
import AnimatedTextPrompt from '@/components/hero/AnimatedTextPrompt';
import TechnicalPattern from '@/components/TechnicalPattern';
import BlueprintSketchLayer from '@/components/BlueprintSketchLayer';

const Hero: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setScrollY(window.scrollY);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-primary via-blue-600 to-blue-700 text-white overflow-hidden pt-16 pb-16 min-h-[calc(110vh-4rem)] flex items-center">
      <TechnicalPattern />
      <div className="absolute inset-0 bg-black/30"></div>

      <BlueprintSketchLayer variant="hero" parallaxOffset={scrollY} />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center space-y-6">
          {/* Title */}
          <div className="text-center space-y-2 py-4">
            <div className="relative inline-block">
              {/* Top corner brackets */}
              <div className="absolute -top-6 -left-6 w-12 h-12 border-t-2 border-l-2 border-[#0087e6]"></div>
              <div className="absolute -top-6 -right-6 w-12 h-12 border-t-2 border-r-2 border-[#0087e6]"></div>
              
              {/* Decorative lines */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-48 h-px bg-gradient-to-r from-transparent via-[#0087e6] to-transparent"></div>
              
              {/* Main title */}
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-2 tracking-tight px-8 whitespace-nowrap">
                Prompt-to-CAD
              </h1>
              
              {/* Bottom decorative elements */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-48 h-px bg-gradient-to-r from-transparent via-[#0087e6] to-transparent"></div>
              
              {/* Bottom corner brackets */}
              <div className="absolute -bottom-6 -left-6 w-12 h-12 border-b-2 border-l-2 border-[#0087e6]"></div>
              <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-2 border-r-2 border-[#0087e6]"></div>
              
              {/* Side accent lines */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 w-6 h-px bg-[#0087e6]"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 w-6 h-px bg-[#0087e6]"></div>
            </div>
          </div>
          
          {/* Button */}
          <div className="pb-4">
            <Link
              href="/cad-generator"
              className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-white text-[#4677dd] font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 text-sm sm:text-base shadow-md shadow-white/20 hover:shadow-white/30 hover:scale-105"
            >
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate a Model
            <svg className="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            </Link>
          </div>
          
          {/* Chat Interface Container */}
          <div className="w-full max-w-2xl mb-8">
            <div className="catalog-glass-container aspect-[4/3] w-full overflow-hidden p-3 sm:p-4 flex flex-col gap-3">
              {/* Animated Prompt Display */}
              <div className="relative rounded-2xl bg-gradient-to-br from-white/35 via-white/15 to-white/5 px-3 py-2 sm:px-5 sm:py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                
                <div className="w-full flex items-center justify-center text-center [&_h1]:hidden [&>div>p:first-of-type]:hidden [&_div[aria-live]]:min-h-0 [&_div[aria-live]_p]:text-[#e6e6e6] [&_div[aria-live]_p]:text-base [&_div[aria-live]_p]:font-mono [&_div[aria-live]_p]:tracking-wide [&_div[aria-live]_p]:m-0 [&_div[aria-live]_span]:text-[#e6e6e6]">
                  <AnimatedTextPrompt 
                    className="w-full"
                    prompts={[
                      'A 320MM VENTED BRAKE ROTOR WITH 5 M12 HOLES ON 114.3MM PCD',
                      'A STEEL BRACKET WITH 4 MOUNTING HOLES',
                      'A CIRCULAR PLATE WITH CENTER HOLE',
                    ]}
                  />
                </div>
              </div>

              {/* 3D Model Display */}
              <div className="flex-1 flex items-center justify-center min-h-0 -mt-6 sm:-mt-8">
                <div className="w-full max-w-lg">
                  <RotatingModel3D 
                    modelName="brake-rotor"
                    totalFrames={36}
                    frameRate={60}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
