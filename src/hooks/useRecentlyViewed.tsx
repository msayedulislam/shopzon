import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  products: RecentProduct[];
  maxProducts: number;
  addProduct: (product: Omit<RecentProduct, 'viewedAt'>) => void;
  getProducts: () => RecentProduct[];
  clearAll: () => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      products: [],
      maxProducts: 20,
      
      addProduct: (product) => {
        const { products, maxProducts } = get();
        const filtered = products.filter(p => p.id !== product.id);
        const newProduct: RecentProduct = {
          ...product,
          viewedAt: Date.now(),
        };
        const updated = [newProduct, ...filtered].slice(0, maxProducts);
        set({ products: updated });
      },
      
      getProducts: () => {
        return get().products.sort((a, b) => b.viewedAt - a.viewedAt);
      },
      
      clearAll: () => {
        set({ products: [] });
      },
    }),
    {
      name: 'recently-viewed',
    }
  )
);
