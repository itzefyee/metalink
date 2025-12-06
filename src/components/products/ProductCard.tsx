'use client';

import Image from 'next/image';
import { useState } from 'react';

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
  const [imageError, setImageError] = useState(false);

  return (
    <div className="catalog-glass-container rounded-2xl p-6 hover:shadow-xl transition-shadow text-white">
      {imageUrl && !imageError ? (
        <div className="w-full h-48 mb-4 overflow-hidden relative rounded-xl">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain rounded-xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={imageUrl.startsWith('http')}
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="w-full h-48 mb-4 flex items-center justify-center rounded-xl">
          <span className="text-white/60 text-sm">No Image</span>
        </div>
      )}
      {category && (
        <span className="text-xs font-medium text-blue-300 uppercase tracking-wide mb-2 block">
          {category}
        </span>
      )}
      <h3 className="text-xl font-semibold mb-2 text-white">{name}</h3>
      {description && (
        <p className="text-white/90 text-sm mb-4 line-clamp-2">{description}</p>
      )}
      {price && (
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">{price}</span>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
            View Details
          </button>
        </div>
      )}
    </div>
  );
}



