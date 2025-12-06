import TechnicalPattern from '@/components/TechnicalPattern';
import BlueprintSketchLayer from '@/components/BlueprintSketchLayer';
import ProductCard from './ProductCard';

// Mock data - replace with actual data fetching
const featuredProducts = [
  {
    id: '1',
    name: 'Steel Bracket',
    description: 'High-strength steel bracket for structural applications',
    category: 'Brackets',
    price: '$45.99',
  },
  {
    id: '2',
    name: 'Aluminum Beam',
    description: 'Lightweight aluminum beam with excellent load-bearing capacity',
    category: 'Beams',
    price: '$89.99',
  },
  {
    id: '3',
    name: 'Gear Assembly',
    description: 'Precision gear assembly for mechanical systems',
    category: 'Gears',
    price: '$125.00',
  },
];

export default function FeaturedProducts() {
  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular industrial components and parts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}


