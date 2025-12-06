'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import TechnicalPattern from '@/components/TechnicalPattern';
import BlueprintSketchLayer from '@/components/BlueprintSketchLayer';
import AnimatedTextPrompt from '@/components/hero/AnimatedTextPrompt';

// Dynamically import 3D component to avoid SSR issues
const RotatingModel3D = dynamic(() => import('@/components/hero/RotatingModel3D'), {
  ssr: false,
  loading: () => <div className="w-full h-64 md:h-96 bg-white/10 rounded-lg" />
});

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 md:py-32">
      <TechnicalPattern />
      <div className="absolute inset-0 bg-black/30" />
      <BlueprintSketchLayer />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI-Powered CAD Generation
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto lg:mx-0">
              Transform your ideas into production-ready technical drawings with cutting-edge AI technology.
            </p>
            <AnimatedTextPrompt />
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8">
              <Link
                href="/generate"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
          
          {/* Right side - 3D Model */}
          <div className="hidden lg:block">
            <RotatingModel3D />
          </div>
        </div>
      </div>
    </section>
  );
}

