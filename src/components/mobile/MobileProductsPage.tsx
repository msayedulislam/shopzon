import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Bell, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileProductCard } from './MobileProductCard';
import { useProducts, toDisplayProduct } from '@/hooks/useProducts';
import { products as mockProducts } from '@/data/mockData';
import { MobileBottomNav } from './MobileBottomNav';

export function MobileProductsPage() {
  const navigate = useNavigate();
  const { data: dbProducts, isLoading } = useProducts({ limit: 12 });
  
  const products = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : mockProducts.slice(0, 12);

  return (
    <div className="min-h-screen bg-white dark:bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">New Product</h1>
          <div className="flex items-center gap-1">
            <button className="p-2"><Search className="h-5 w-5 text-muted-foreground" /></button>
            <button className="p-2 relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="aspect-[3/4] bg-secondary/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {products.map((product, index) => (
              <MobileProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
