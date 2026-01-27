import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ComparisonProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  images: string[];
  rating?: number | null;
  category?: string;
  brand?: string;
  specifications?: Record<string, string>;
}

interface ProductComparisonState {
  products: ComparisonProduct[];
  maxProducts: number;
  addProduct: (product: ComparisonProduct) => boolean;
  removeProduct: (productId: string) => void;
  clearAll: () => void;
  isInComparison: (productId: string) => boolean;
}

export const useProductComparison = create<ProductComparisonState>()(
  persist(
    (set, get) => ({
      products: [],
      maxProducts: 4,
      
      addProduct: (product) => {
        const { products, maxProducts } = get();
        if (products.length >= maxProducts) {
          return false;
        }
        if (products.find(p => p.id === product.id)) {
          return false;
        }
        set({ products: [...products, product] });
        return true;
      },
      
      removeProduct: (productId) => {
        set({ products: get().products.filter(p => p.id !== productId) });
      },
      
      clearAll: () => {
        set({ products: [] });
      },
      
      isInComparison: (productId) => {
        return get().products.some(p => p.id === productId);
      },
    }),
    {
      name: 'product-comparison',
    }
  )
);
