import { useQuery } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';

export interface Category {
  id: string;
  name: string;
}

export function useCategories() {
  const convex = useConvex();

  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // Get all products to extract unique categories
      const products = await convex.query(api.products.list, { limit: 1000 });
      
      // Extract unique categories
      const categorySet = new Set<string>();
      products.forEach((product: any) => {
        if (product.category) {
          categorySet.add(product.category);
        }
      });

      // Convert to array and map to Category format
      const categories: Category[] = Array.from(categorySet).map((cat, index) => ({
        id: `cat-${index}`,
        name: cat,
      }));

      return categories;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

