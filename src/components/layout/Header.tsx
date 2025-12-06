'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import MetalinkLogo from '@/components/MetalinkLogo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Set flag to prevent account page redirect loop
      sessionStorage.setItem('isLoggingOut', 'true');
      await signOut();
      sessionStorage.removeItem('isLoggingOut');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      sessionStorage.removeItem('isLoggingOut');
    } finally {
      setIsLoggingOut(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <MetalinkLogo variant="default" showText={true} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/catalog" className="text-gray-700 hover:text-primary transition-colors">
              Catalog
            </Link>
            <Link href="/cad-generator" className="text-gray-700 hover:text-primary transition-colors">
              CAD Generator
            </Link>
            <Link href="/cad-analyzer" className="text-gray-700 hover:text-primary transition-colors">
              CAD Analyzer
            </Link>
            
            {/* Authentication Navigation */}
            {loading && !user ? (
              <div className="flex items-center">
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ) : user ? (
              <>
                {/* Authenticated User Items */}
                <Link 
                  href="/account" 
                  className="text-gray-700 hover:text-primary transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Account
                </Link>
                <span className="text-sm text-gray-600">
                  {user?.email || profile?.email || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-gray-700 hover:text-primary transition-colors flex items-center disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Unauthenticated User Items */}
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link href="/catalog" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Catalog
              </Link>
              <Link href="/cad-generator" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                CAD Generator
              </Link>
              <Link href="/cad-analyzer" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                CAD Analyzer
              </Link>
              <Link href="/product-recommender" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Product Recommender
              </Link>
              
              {/* Mobile Authentication Navigation */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                {loading ? (
                  <div className="px-4 py-2">
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ) : user ? (
                  <>
                    {/* Authenticated User Items - Mobile */}
                    <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
                      {user?.email || 'User'}
                    </div>
                    <Link 
                      href="/account" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center disabled:opacity-50"
                    >
                      {isLoggingOut ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Logging out...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Unauthenticated User Items - Mobile */}
                    <Link 
                      href="/login" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
