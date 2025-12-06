import { useQuery } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';

export interface UseProductsOptions {
  limit?: number;
  category?: string;
  materialFamily?: string;
  inStock?: boolean;
}

export interface Product {
  _id: string;
  id: string;
  name: string;
  category: string;
  material?: string | null;
  materialFamily?: string | null;
  componentTypeId?: string | null;
  specifications: any;
  price: number;
  images: string[];
  description?: string | null;
  technicalDetails?: string | null;
  technical_details?: string | null; // Legacy field name
  compatibleWith: string[];
  inStock: boolean;
  in_stock?: boolean; // Legacy field name
  leadTime?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const convex = useConvex();

  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      const products = await convex.query(api.products.list, {
        category: options.category,
        materialFamily: options.materialFamily,
        inStock: options.inStock,
        limit: options.limit,
      });

      // Map Convex products to expected format
      return {
        products: products.map((p: any) => ({
          _id: p._id,
          id: p.id,
          name: p.name,
          category: p.category,
          material: p.material,
          materialFamily: p.materialFamily,
          componentTypeId: p.componentTypeId,
          specifications: p.specifications,
          price: p.price,
          images: p.images,
          description: p.description,
          technicalDetails: p.technicalDetails,
          technical_details: p.technicalDetails, // Legacy compatibility
          compatibleWith: p.compatibleWith,
          inStock: p.inStock,
          in_stock: p.inStock, // Legacy compatibility
          leadTime: p.leadTime,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })) as Product[],
      };
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

