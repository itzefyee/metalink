'use client';

import React from 'react';
import { FilterOptions } from '@/types';

interface ProductFilterProps {
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
    onClearFilters: () => void;
    categories: { id: string; name: string }[];
    materials: string[];
    priceRange: [number, number];
}

const getFilterCategoryColor = (name: string) => {
    const normalized = name.toLowerCase();
    if (normalized.includes('robot')) {
        return 'border-black bg-blue-100/80 text-blue-900';
    }
    if (normalized.includes('fasten')) {
        return 'border-black bg-amber-100/80 text-amber-900';
    }
    if (normalized.includes('custom')) {
        return 'border-black bg-purple-100/80 text-purple-900';
    }
    if (normalized.includes('struct')) {
        return 'border-black bg-slate-100/80 text-slate-900';
    }
    return 'border-black bg-slate-100/80 text-slate-900';
};

const ProductFilter: React.FC<ProductFilterProps> = ({
    filters,
    onFiltersChange,
    onClearFilters,
    categories,
    materials,
    priceRange
}) => {
    const updateFilter = (key: keyof FilterOptions, value: string | number | string[] | number[] | boolean) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const toggleCategory = (categoryId: string) => {
        const newCategories = filters.categories.includes(categoryId)
            ? filters.categories.filter(id => id !== categoryId)
            : [...filters.categories, categoryId];
        updateFilter('categories', newCategories);
    };

    const toggleMaterial = (material: string) => {
        const newMaterials = filters.materials.includes(material)
            ? filters.materials.filter(m => m !== material)
            : [...filters.materials, material];
        updateFilter('materials', newMaterials);
    };

    const hasActiveFilters =
        filters.categories.length > 0 ||
        filters.materials.length > 0 ||
        filters.priceRange[0] > priceRange[0] ||
        filters.priceRange[1] < priceRange[1] ||
        filters.inStockOnly ||
        filters.searchQuery.length > 0;

    return (
        <div className="filter-inner-card p-6 space-y-6 h-full w-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Search */}
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                        Search Products
                    </label>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={filters.searchQuery}
                        onChange={(e) => updateFilter('searchQuery', e.target.value)}
                        className="glass-input"
                    />
                </div>

                {/* Categories */}
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-3">
                        Categories
                    </label>
                    <div className="space-y-3">
                        {categories.map((category) => (
                            <label
                                key={category.id}
                                className={`flex items-center justify-between rounded-xl px-4 py-3 shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:bg-white ${getFilterCategoryColor(category.name)}`}
                            >
                                <input
                                    type="checkbox"
                                    className="glass-checkbox"
                                    checked={filters.categories.includes(category.id)}
                                    onChange={() => toggleCategory(category.id)}
                                />
                                <span className="ml-3 text-sm font-semibold">
                                    {category.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Materials */}
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-3">
                        Materials
                    </label>
                    <div className="space-y-3">
                        {materials.map((material) => (
                            <label
                                key={material}
                                className="flex items-center justify-between rounded-xl border-2 border-slate-300 bg-white/90 px-4 py-3 shadow-sm hover:border-blue-400 transition-colors cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="glass-checkbox"
                                    checked={filters.materials.includes(material)}
                                    onChange={() => toggleMaterial(material)}
                                />
                                <span className="ml-3 text-sm font-semibold text-slate-800">
                                    {material}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-3">
                        Price Range
                    </label>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <input
                                type="range"
                                min={priceRange[0]}
                                max={priceRange[1]}
                                value={filters.priceRange[0]}
                                onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                                className="glass-range"
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="range"
                                min={priceRange[0]}
                                max={priceRange[1]}
                                value={filters.priceRange[1]}
                                onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                                className="glass-range"
                            />
                        </div>
                        <div className="flex justify-between text-sm text-slate-600 font-semibold">
                            <span>${filters.priceRange[0]}</span>
                            <span>${filters.priceRange[1]}</span>
                        </div>
                    </div>
                </div>

                {/* In Stock Only */}
                <div>
                    <label className="flex items-center justify-between rounded-xl border-2 border-slate-300 bg-white/90 px-4 py-3 shadow-sm hover:border-blue-400 transition-colors cursor-pointer">
                        <input
                            type="checkbox"
                            className="glass-checkbox"
                            checked={filters.inStockOnly}
                            onChange={(e) => updateFilter('inStockOnly', e.target.checked)}
                        />
                        <span className="ml-3 text-sm font-semibold text-slate-800">
                            In stock only
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ProductFilter;