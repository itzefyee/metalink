import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  category?: string;
}

export default function ProductCard({
  name,
  description,
  imageUrl,
  price,
  category,
}: ProductCardProps) {
  return (
    <div className="glass-card glass-card-with-liquid rounded-xl p-6 hover:shadow-xl transition-shadow">
      {imageUrl && (
        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
          <span className="text-gray-400">Image</span>
        </div>
      )}
      {category && (
        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2 block">
          {category}
        </span>
      )}
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{name}</h3>
      {description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
      )}
      {price && (
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">{price}</span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            View Details
          </button>
        </div>
      )}
    </div>
  );
}



