'use client';

import TechnicalPattern from '@/components/TechnicalPattern';
import BlueprintSketchLayer from '@/components/BlueprintSketchLayer';
import ProductCard from './ProductCard';
import { useProducts } from '@/hooks';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function FeaturedProducts() {
  // Fetch featured products (first 3 in-stock products)
  const { data, isLoading } = useProducts({ limit: 10, inStock: true });

  // Get first 3 products with images
  const featuredProducts = data?.products
    ?.filter((product) => product.images && product.images.length > 0)
    .slice(0, 3)
    .map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description || product.technicalDetails || '',
      category: product.category,
      price: `$${product.price.toFixed(2)}`,
      imageUrl: product.images[0], // Use first image
    })) || [];

  return (
    <section className="relative overflow-hidden text-white py-20" style={{ background: 'var(--hero-blue-gradient)' }}>
      <TechnicalPattern />
      <div className="absolute inset-0 bg-black/30" />
      <BlueprintSketchLayer />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Featured Products</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Discover our most popular industrial components and parts.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60">No featured products available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}



