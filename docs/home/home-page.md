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
