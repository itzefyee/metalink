# Starter UI Extraction - Landing Page & CAD Generator

This document contains the extracted landing page and CAD generator page from Metalink, ready to be reused as a starter UI in another project.

## Table of Contents

1. [Landing Page](#landing-page)
2. [CAD Generator Page](#cad-generator-page)
3. [Component Dependencies](#component-dependencies)
4. [Required Assets](#required-assets)
5. [Setup Instructions](#setup-instructions)
6. [Styling Requirements](#styling-requirements)

---

## Landing Page

**File:** `src/app/page.tsx`

```tsx
import Header from '@/components/layout/Header';
import Hero from '@/components/layout/Hero';
import Footer from '@/components/layout/Footer';
import FeaturedProducts from '@/components/products/FeaturedProducts';
import CategoryShowcase from '@/components/layout/CategoryShowcase';
import Link from 'next/link';
import TechnicalPattern from '@/components/TechnicalPattern';
import BlueprintSketchLayer from '@/components/BlueprintSketchLayer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Extended Technical Pattern Background with Gradient Effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top section - normal brightness */}
        <div className="absolute inset-0 opacity-55 text-[#5daaff]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-home" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1.2"/>
              </pattern>
              <pattern id="dots-home" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.6" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-home)"/>
            <rect width="100%" height="100%" fill="url(#dots-home)"/>
          </svg>
        </div>
        
        {/* Gradient overlay for darkening/brightening effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-transparent" style={{ backgroundSize: '100% 200%' }}></div>
      </div>

      <div className="relative z-10">
        <Header />
        <main className="flex-1">
          <Hero />
          
          {/* AI Tools Showcase */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-blue-700 text-white py-20">
            <TechnicalPattern />
            <div className="absolute inset-0 bg-black/30" />
            <BlueprintSketchLayer />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">AI-Powered Tools</h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  Leverage cutting-edge AI technology to streamline your design and sourcing process.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Link href="/cad-generator" className="group glass-card glass-card-with-liquid p-6 text-gray-900">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg mb-4 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    CAD Generator
                  </h3>
                  <p className="text-gray-800">Generate technical drawings from text descriptions or templates with AI assistance.</p>
                </Link>
                
                <Link href="/cad-analyzer" className="group glass-card glass-card-with-liquid p-6 text-gray-900">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    CAD Analyzer
                  </h3>
                  <p className="text-gray-800">Analyze drawings for manufacturability, validate specifications, and generate reports.</p>
                </Link>
                
                <Link href="/product-recommender" className="group glass-card glass-card-with-liquid p-6 text-gray-900">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-400 rounded-lg mb-4 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    Product Recommender
                  </h3>
                  <p className="text-gray-800">Get AI-powered product recommendations with compatibility scores and alternatives.</p>
                </Link>
              </div>
            </div>
          </section>

          {/* Featured Products Section */}
          <FeaturedProducts />
          
          {/* Product Categories Showcase */}
          <CategoryShowcase />

          {/* Value Propositions */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-blue-700 text-white py-20">
            <TechnicalPattern />
            <div className="absolute inset-0 bg-black/30" />
            <BlueprintSketchLayer />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Why Choose Metalink?</h2>
                <p className="text-lg text-white/85 max-w-2xl mx-auto">
                  Advanced AI technology meets manufacturing expertise to deliver the best steel parts sourcing experience.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-500 rounded-xl mx-auto mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-blue-500/40">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Analysis</h3>
                  <p className="text-white/80 leading-relaxed">Upload your technical drawings and get instant product recommendations with confidence scores and detailed reasoning.</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-xl mx-auto mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-emerald-500/40">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Technical Expertise</h3>
                  <p className="text-white/80 leading-relaxed">Comprehensive specifications, compatibility information, and technical support for all industrial components.</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-400 rounded-xl mx-auto mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-amber-500/40">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast Quotes</h3>
                  <p className="text-white/80 leading-relaxed">Get competitive quotes for custom parts and bulk orders within 24 hours with transparent pricing.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
```

---

## CAD Generator Page

**File:** `src/app/cad-generator/page.tsx`

```tsx
'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CADGenerator from '@/components/cad/CADGenerator';
import PageHero from '@/components/layout/PageHero';

// Dynamically import 3D component to avoid SSR issues
const BlueprintModel3D = dynamic(() => import('@/components/cad/BlueprintModel3D'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />
});

export default function CADGeneratorPage() {
  const blueprintShadow = 'drop-shadow(0 0 28px rgba(0, 116, 230, 0.85))';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 home-wavy-bg relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div 
            className="absolute top-[6%] left-[-6%] w-[360px] h-[360px]"
            style={{ opacity: 0.95, animation: 'blueprintFloat 8s ease-in-out infinite, blueprintPulse 6s ease-in-out infinite', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="gear" />
          </div>
          
          <div 
            className="absolute top-[10%] left-[-1%] w-[300px] h-[300px]"
            style={{ opacity: 0.9, animation: 'blueprintFloatAlt 11s ease-in-out infinite, blueprintPulse 8s ease-in-out infinite 1s', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="shaft" />
          </div>
          
          <div 
            className="absolute top-[4%] right-[-10%] w-[330px] h-[330px]"
            style={{ opacity: 0.94, animation: 'blueprintFloat 9s ease-in-out infinite, blueprintPulse 7s ease-in-out infinite 2s', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="bracket" />
          </div>
          
          <div 
            className="absolute top-[9%] right-[-4%] w-[315px] h-[315px]"
            style={{ opacity: 0.9, animation: 'blueprintFloatAlt 10s ease-in-out infinite, blueprintPulse 9s ease-in-out infinite 1.5s', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="gear" />
          </div>
          
          <div 
            className="absolute top-[13%] right-[-12%] w-[360px] h-[360px]"
            style={{ opacity: 0.97, animation: 'blueprintFloat 12s ease-in-out infinite, blueprintPulse 7s ease-in-out infinite 3s', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="beam" />
          </div>
          
          <div 
            className="absolute top-[32%] left-[-5%] w-[320px] h-[320px]"
            style={{ opacity: 0.92, animation: 'blueprintFloatAlt 13s ease-in-out infinite, blueprintPulse 8s ease-in-out infinite 2.5s', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="bracket" />
          </div>
          
          <div 
            className="absolute top-[38%] left-[-9%] w-[260px] h-[260px]"
            style={{ opacity: 0.9, animation: 'blueprintFloat 10s ease-in-out infinite, blueprintPulse 9s ease-in-out infinite 1s', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="shaft" />
          </div>
          
          <div 
            className="absolute top-[37%] right-[-8%] w-[270px] h-[270px]"
            style={{ opacity: 0.9, animation: 'blueprintFloatAlt 11s ease-in-out infinite, blueprintPulse 7s ease-in-out infinite 3.5s', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="gear" />
          </div>
          
          <div 
            className="absolute top-[43%] right-[-4%] w-[310px] h-[310px]"
            style={{ opacity: 0.94, animation: 'blueprintFloat 9s ease-in-out infinite, blueprintPulse 8s ease-in-out infinite 2s', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="bracket" />
          </div>
          
          <div 
            className="absolute bottom-[17%] left-[-7%] w-[360px] h-[360px]"
            style={{ opacity: 0.98, animation: 'blueprintFloat 12s ease-in-out infinite, blueprintPulse 8s ease-in-out infinite 4s', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="beam" />
          </div>
          
          <div 
            className="absolute bottom-[21%] left-[-1%] w-[280px] h-[280px]"
            style={{ opacity: 0.92, animation: 'blueprintFloatAlt 10s ease-in-out infinite, blueprintPulse 9s ease-in-out infinite 2.5s', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="gear" />
          </div>
          
          <div 
            className="absolute bottom-[14%] right-[-9%] w-[260px] h-[260px]"
            style={{ opacity: 0.9, animation: 'blueprintFloat 11s ease-in-out infinite, blueprintPulse 7s ease-in-out infinite 3s', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="shaft" />
          </div>
          
          <div 
            className="absolute bottom-[19%] right-[-4%] w-[310px] h-[310px]"
            style={{ opacity: 0.94, animation: 'blueprintFloatAlt 13s ease-in-out infinite, blueprintPulse 8s ease-in-out infinite 1.5s', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="bracket" />
          </div>
          
          <div 
            className="absolute bottom-[11%] right-[-12%] w-[335px] h-[335px]"
            style={{ opacity: 0.96, animation: 'blueprintFloat 9s ease-in-out infinite, blueprintPulse 7s ease-in-out infinite 4s', filter: blueprintShadow }}
          >
            <BlueprintModel3D modelType="shaft" />
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          <div className="mb-10">
            <PageHero
              eyebrow="Blueprint Studio"
              eyebrowPlacement="inline-after"
              title="CAD Drawing Generator"
              highlightPlacement="side"
              theme="light"
              description="Turn a short prompt or preset into production-ready STEP files without leaving the page."
              highlights={[
                { label: 'Templates', value: '4 Ready' },
                { label: 'Avg Render', value: '~6s' },
                { label: 'Formats', value: 'STEP' },
                { label: 'Edits', value: 'Live Parametric' },
              ]}
            />
          </div>
          
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading CAD generator...</div>}>
            <CADGenerator />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

---

## Component Dependencies

### Core Layout Components

#### Header (`src/components/layout/Header.tsx`)
- **Dependencies:**
  - `next/link` - Next.js Link component
  - `next/navigation` - useRouter hook
  - `@/components/auth/AuthProvider` - Authentication context
- **Features:**
  - Responsive navigation menu
  - Authentication state management
  - Mobile menu toggle
  - Logo and branding

#### Footer (`src/components/layout/Footer.tsx`)
- **Dependencies:**
  - `next/link` - Next.js Link component
- **Features:**
  - Company information
  - Navigation links
  - Social media links
  - Contact information

#### Hero (`src/components/layout/Hero.tsx`)
- **Dependencies:**
  - `next/link` - Next.js Link component
  - `@/components/hero/RotatingModel3D` - 3D model animation
  - `@/components/hero/AnimatedTextPrompt` - Animated text display
  - `@/components/TechnicalPattern` - Background pattern
  - `@/components/BlueprintSketchLayer` - Blueprint overlay
- **Features:**
  - Hero section with animated 3D model
  - Animated text prompts
  - Call-to-action button
  - Parallax scrolling effects

#### PageHero (`src/components/layout/PageHero.tsx`)
- **Dependencies:** None (pure component)
- **Features:**
  - Flexible hero component for page headers
  - Supports eyebrow text, highlights, and actions
  - Light/dark theme support
  - Multiple layout options

### Background & Visual Components

#### TechnicalPattern (`src/components/TechnicalPattern.tsx`)
- **Purpose:** SVG-based technical grid pattern background
- **Usage:** Applied to sections for visual depth

#### BlueprintSketchLayer (`src/components/BlueprintSketchLayer.tsx`)
- **Purpose:** Blueprint-style sketch overlay
- **Usage:** Adds technical/engineering aesthetic to sections

#### BlueprintModel3D (`src/components/cad/BlueprintModel3D.tsx`)
- **Dependencies:**
  - `@react-three/fiber` - React Three.js renderer
  - `@react-three/drei` - Three.js helpers
  - `three` - Three.js library
- **Purpose:** 3D model display for background decoration
- **Model Types:** `gear`, `shaft`, `bracket`, `beam`

### Content Components

#### FeaturedProducts (`src/components/products/FeaturedProducts.tsx`)
- **Dependencies:**
  - `@/hooks` - useProducts hook
  - `@/components/products/ProductCard`
  - `@/components/TechnicalPattern`
  - `@/components/BlueprintSketchLayer`
- **Purpose:** Displays featured products in a grid

#### CategoryShowcase (`src/components/layout/CategoryShowcase.tsx`)
- **Dependencies:**
  - `@/hooks` - useCategories hook
  - `@/components/TechnicalPattern`
  - `@/components/BlueprintSketchLayer`
- **Purpose:** Displays product categories

#### CADGenerator (`src/components/cad/CADGenerator.tsx`)
- **Dependencies:**
  - Multiple hooks and utilities
  - API integration for CAD generation
  - File handling and preview components
- **Purpose:** Main CAD generation interface
- **Note:** This is a complex component with many sub-dependencies

---

## Required Assets

### Images
- `/public/images/logo.svg` - Main logo
- `/public/images/logo-white.svg` - White logo variant (for footer)
- `/public/images/tarumt-logo-767.png` - Partner logo (optional)

### 3D Model Frames
- `/public/model-frames/brake-rotor/` - Directory containing frame images for rotating 3D model
  - 36 PNG frames (frame_00.png to frame_35.png)
  - 36 SVG frames (optional)

### Fonts
- **Inter** - Primary font family (loaded via Google Fonts or similar)

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install next react react-dom
npm install tailwindcss postcss autoprefixer
npm install @react-three/fiber @react-three/drei three
npm install framer-motion
npm install lucide-react
```

### 2. Configure Tailwind CSS

Create or update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066CC',
        'primary-light': '#3399FF',
        secondary: '#6B46C1',
        accent: '#00D4FF',
        'accent-light': '#66E0FF',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#111827',
        'text-secondary': '#6B7280',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'blueprint-grid': 'radial-gradient(circle, rgba(0, 102, 204, 0.05) 1px, transparent 1px)',
        'gradient-blue': 'linear-gradient(135deg, #0066CC, #00D4FF)',
        'gradient-purple': 'linear-gradient(135deg, #6B46C1, #9B7FD9)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'blue-glow': '0 4px 12px rgba(0, 102, 204, 0.25)',
        'blue-glow-lg': '0 12px 24px rgba(0, 102, 204, 0.3)',
      },
    },
  },
  plugins: [],
}
```

### 3. Set Up Global Styles

Add to `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: #2563eb;
    --color-secondary: #64748b;
    --color-accent: #f59e0b;
    --color-background: #f8fafc;
    --color-surface: #ffffff;
    --color-text: #1f2937;
    --color-text-secondary: #6b7280;
    --color-border: #e5e7eb;
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: var(--color-text);
    background-color: var(--color-background);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

@layer components {
  /* Glass card effect */
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .glass-card-with-liquid {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  /* Catalog glass container */
  .catalog-glass-container {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  /* Home wavy background */
  .home-wavy-bg {
    background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  }
}

@keyframes blueprintFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(2deg);
  }
}

@keyframes blueprintFloatAlt {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(20px) rotate(-2deg);
  }
}

@keyframes blueprintPulse {
  0%, 100% {
    opacity: 0.9;
  }
  50% {
    opacity: 0.7;
  }
}
```

### 4. Component Structure

Create the following directory structure:

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── cad-generator/
│   │   └── page.tsx           # CAD generator page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── PageHero.tsx
│   │   └── CategoryShowcase.tsx
│   ├── products/
│   │   ├── FeaturedProducts.tsx
│   │   └── ProductCard.tsx
│   ├── cad/
│   │   ├── CADGenerator.tsx
│   │   └── BlueprintModel3D.tsx
│   ├── hero/
│   │   ├── RotatingModel3D.tsx
│   │   └── AnimatedTextPrompt.tsx
│   ├── TechnicalPattern.tsx
│   └── BlueprintSketchLayer.tsx
└── hooks/
    └── (custom hooks for data fetching)
```

### 5. Next.js Configuration

Ensure `next.config.js` includes:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your configuration
}

module.exports = nextConfig
```

### 6. TypeScript Configuration

If using TypeScript, ensure `tsconfig.json` includes path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Styling Requirements

### Custom CSS Classes

The pages use several custom CSS classes that need to be defined:

1. **`.glass-card`** - Glass morphism effect for cards
2. **`.glass-card-with-liquid`** - Enhanced glass effect with gradient
3. **`.catalog-glass-container`** - Glass container for catalog items
4. **`.home-wavy-bg`** - Background gradient for home sections

### Animations

The CAD generator page uses floating animations for 3D models:

- `blueprintFloat` - Vertical floating animation
- `blueprintFloatAlt` - Alternative floating animation
- `blueprintPulse` - Opacity pulsing animation

### Color Palette

Primary colors used throughout:
- Primary Blue: `#0066CC`
- Primary Light: `#3399FF`
- Accent Cyan: `#00D4FF`
- Background: `#F8FAFC` / `#FFFFFF`
- Text: `#111827`
- Text Secondary: `#6B7280`

### Responsive Breakpoints

The design uses Tailwind's default breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## Notes for Adaptation

1. **Authentication**: The Header component includes authentication logic. You may need to adapt or remove this based on your project needs.

2. **Data Fetching**: Components like `FeaturedProducts` and `CategoryShowcase` use custom hooks (`useProducts`, `useCategories`). You'll need to implement these or replace with your data fetching solution.

3. **3D Models**: The `BlueprintModel3D` component requires Three.js setup. If you don't need 3D models, you can remove or simplify the floating 3D model decorations.

4. **CAD Generator**: The `CADGenerator` component is complex and includes API integration. You may want to create a simplified version or integrate with your own backend.

5. **Branding**: Replace Metalink branding (logo, company name) with your own.

6. **Routes**: Update navigation links to match your project's routing structure.

---

## Quick Start Checklist

- [ ] Install all npm dependencies
- [ ] Set up Tailwind CSS configuration
- [ ] Add global CSS styles
- [ ] Create component directory structure
- [ ] Copy all component files
- [ ] Add required images/assets
- [ ] Set up path aliases (`@/*`)
- [ ] Configure Next.js
- [ ] Implement data fetching hooks (or replace with your solution)
- [ ] Update branding and content
- [ ] Test responsive design
- [ ] Customize colors and styling to match your brand

---

## Support

For questions or issues with adapting these pages, refer to:
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber

