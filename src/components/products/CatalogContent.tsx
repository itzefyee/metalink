'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import ProductFilter from '@/components/products/ProductFilter';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useProducts, useCategories, type Product } from '@/hooks';
import { FilterOptions } from '@/types';

export default function CatalogContent() {
    const searchParams = useSearchParams();
    const [sortBy, setSortBy] = useState('name-asc');

    const [filters, setFilters] = useState<FilterOptions>({
        categories: searchParams?.get('category') ? [searchParams.get('category')!] : [],
        materials: [],
        priceRange: [0, 10000],
        inStockOnly: false,
        searchQuery: ''
    });

    // Fetch categories from Convex
    const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories();

    // Fetch products from Convex using React Query
    // Set limit to 100 to fetch all products
    const {
        data: productsData,
        isLoading: productsLoading,
        error: productsError,
        refetch,
        isRefetching,
    } = useProducts({ limit: 100 });

    const [isRefreshAnimating, setIsRefreshAnimating] = useState(false);

    // Extract products array from React Query response
    const products: Product[] = productsData?.products || [];
    const loading = productsLoading || categoriesLoading;
    
    // Handle legacy field names for compatibility
    const normalizedProducts = useMemo(() => {
        return products.map(p => ({
            ...p,
            technical_details: p.technicalDetails || p.technical_details,
            in_stock: p.inStock !== undefined ? p.inStock : p.in_stock,
        }));
    }, [products]);

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...normalizedProducts];

        // Apply category filter
        if (filters.categories.length > 0) {
            filtered = filtered.filter(product =>
                filters.categories.includes(product.category)
            );
        }

        // Apply material filter
        if (filters.materials.length > 0) {
            filtered = filtered.filter(product =>
                product.material && filters.materials.some(material =>
                    product.material!.toLowerCase().includes(material.toLowerCase())
                )
            );
        }

        // Apply search filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query) ||
                (product.description && product.description.toLowerCase().includes(query)) ||
                (product.technical_details && product.technical_details.toLowerCase().includes(query))
            );
        }

        // Apply price range filter
        filtered = filtered.filter(product =>
            product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
        );

        // Apply in-stock filter
        if (filters.inStockOnly) {
            filtered = filtered.filter(product => product.in_stock);
        }

        // Sort products
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                default:
                    return 0;
            }
        });

        return sorted;
    }, [normalizedProducts, filters, sortBy]);

    const handleFiltersChange = (newFilters: FilterOptions) => {
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        setFilters({
            categories: [],
            materials: [],
            priceRange: [0, 10000],
            inStockOnly: false,
            searchQuery: ''
        });
    };

    const handleManualRefresh = async () => {
        if (productsLoading || isRefetching) return;
        setIsRefreshAnimating(true);
        try {
            await refetch();
        } finally {
            setTimeout(() => setIsRefreshAnimating(false), 500);
        }
    };

    // Get unique categories and materials for filter options
    const availableCategories = useMemo(() => {
        return categoriesData.map((cat: { id: string; name: string }) => ({
            id: cat.id,
            name: cat.name
        }));
    }, [categoriesData]);

    const availableMaterials = useMemo(() => {
        const materials = [...new Set(normalizedProducts.map((p: Product) => p.material).filter((m): m is string => m !== null && m !== undefined))];
        return materials.sort();
    }, [normalizedProducts]);

    const priceRange: [number, number] = useMemo(() => {
        if (normalizedProducts.length === 0) return [0, 10000];
        const prices = normalizedProducts.map((p: Product) => p.price);
        return [Math.min(...prices), Math.max(...prices)];
    }, [normalizedProducts]);

    // Handle loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Handle error state
    if (productsError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center py-12 bg-white/5 border border-red-500/20 rounded-2xl backdrop-blur-xl max-w-md mx-auto px-6">
                    <div className="text-red-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Failed to load products</h3>
                    <p className="text-slate-300 mb-4">
                        {productsError.message || 'An error occurred while fetching products'}
                    </p>
                    <button
                        onClick={handleManualRefresh}
                        className="inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const refreshStateActive = isRefetching || isRefreshAnimating;

    return (
        <main className="catalog-shell flex-1 min-h-screen relative" style={{ background: 'var(--hero-blue-gradient)' }}>
            {/* Wiregrid Pattern Overlay */}
            <div className="catalog-grid-pattern" aria-hidden="true">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="catalog-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.2" className="grid-lines"/>
                        </pattern>
                        <pattern id="catalog-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="10" cy="10" r="1.6" fill="rgba(255, 255, 255, 0.2)" className="grid-dots"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#catalog-grid)"/>
                    <rect width="100%" height="100%" fill="url(#catalog-dots)"/>
                </svg>
            </div>
            <div className="catalog-wire-pattern" aria-hidden="true">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="catalog-wire" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 0 0 L 60 60 M 60 0 L 0 60" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" className="wire-line"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#catalog-wire)"/>
                </svg>
            </div>
            <div className="catalog-particle-layer" aria-hidden="true"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
                <div className="mb-10 space-y-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-[0.25em] uppercase bg-white/10 text-sky-200 border border-white/20">
                                Live Catalog
                            </span>
                            <div>
                                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                                    <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent drop-shadow-sm">
                                        Intelligent Product Catalog
                                    </span>
                                </h1>
                                <p className="text-base sm:text-lg text-slate-200 max-w-3xl mt-3">
                                    Discover <span className="font-semibold text-white">{normalizedProducts.length}+ precision components</span> curated for robotics, structural steel, and custom fabrication.
                                    Every product is synchronized with Convex and enriched with AI-ready metadata for instant filtering.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['AI-featherlight filters', '24h quote-ready specs', 'SVG-rich visuals', 'Compliance metadata'].map((badge) => (
                                    <span
                                        key={badge}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-slate-200 bg-white/10 border border-white/10 backdrop-blur-sm"
                                    >
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
                            {[
                                { label: 'Products Live', value: normalizedProducts.length.toString(), accent: 'from-cyan-400 to-blue-500' },
                                { label: 'Categories', value: availableCategories.length.toString(), accent: 'from-indigo-400 to-purple-500' },
                                { label: 'Avg Lead Time', value: '2-5 days', accent: 'from-emerald-400 to-teal-500' },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-4 text-white shadow-[0_10px_30px_rgba(15,23,42,0.25)]"
                                >
                                    <p className="text-xs uppercase tracking-wide text-slate-300">{stat.label}</p>
                                    <p className={`text-2xl font-semibold mt-2 bg-gradient-to-r ${stat.accent} text-transparent bg-clip-text`}>
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
                    {/* Sidebar Filters - Separate Glass Container */}
                    <div className="lg:w-1/4 w-full">
                        <div className="glass-container p-4">
                            <ProductFilter
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                onClearFilters={handleClearFilters}
                                categories={availableCategories}
                                materials={availableMaterials}
                                priceRange={priceRange}
                            />
                        </div>
                    </div>

                    {/* Main Content - Separate Glass Container */}
                    <div className="lg:w-3/4 w-full">
                        <div
                            className={`catalog-glass-container h-full p-8 relative overflow-hidden ${refreshStateActive ? 'ring-1 ring-sky-400/40 shadow-[0_0_45px_rgba(14,165,233,0.15)]' : ''
                                }`}
                        >
                            {refreshStateActive && (
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-cyan-400/5 animate-pulse" aria-hidden="true" />
                            )}
                            <div className="relative z-10">
                                {/* Sort and Results Count */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                    <div className="text-sm font-medium text-white">
                                        Showing <span className="text-blue-300 font-bold">{filteredAndSortedProducts.length}</span> of {normalizedProducts.length} products
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 w-full sm:w-auto">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                aria-live="polite"
                                                className={`text-[11px] uppercase tracking-wide text-sky-200 font-semibold transition-all duration-200 ${refreshStateActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
                                                    }`}
                                            >
                                                Refreshing catalog…
                                            </div>
                                            <button
                                                onClick={handleManualRefresh}
                                                disabled={productsLoading || isRefetching}
                                                className={`inline-flex items-center px-3 py-2 border border-white/20 text-sm font-medium rounded-md text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${refreshStateActive ? 'bg-white/20 shadow-[0_0_20px_rgba(14,165,233,0.25)]' : 'hover:bg-white/20'
                                                    }`}
                                                title="Refresh products"
                                            >
                                                <svg
                                                    className={`w-4 h-4 mr-1 transition-transform duration-300 ${refreshStateActive ? 'animate-spin' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                {refreshStateActive ? 'Refreshing' : 'Refresh'}
                                            </button>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <label htmlFor="sort" className="text-sm font-medium text-white">
                                                Sort by:
                                            </label>
                                            <select
                                                id="sort"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="border border-white/20 bg-white/5 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm font-medium"
                                            >
                                                <option value="name-asc" className="bg-slate-800">Name (A-Z)</option>
                                                <option value="name-desc" className="bg-slate-800">Name (Z-A)</option>
                                                <option value="price-asc" className="bg-slate-800">Price (Low to High)</option>
                                                <option value="price-desc" className="bg-slate-800">Price (High to Low)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Products Grid */}
                                {filteredAndSortedProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredAndSortedProducts.map((product) => (
                                            <ProductCard 
                                                key={product.id} 
                                                id={product.id}
                                                name={product.name}
                                                description={product.description || undefined}
                                                imageUrl={product.images?.[0] || undefined}
                                                price={product.price ? `$${product.price.toFixed(2)}` : undefined}
                                                category={product.category}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                                        <div className="text-slate-400 mb-4">
                                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
                                        <p className="text-slate-300 mb-4">
                                            Try adjusting your filters or search terms to find what you&apos;re looking for.
                                        </p>
                                        <button
                                            onClick={handleClearFilters}
                                            className="inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
