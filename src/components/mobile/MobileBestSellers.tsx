import { Link } from 'react-router-dom';
import { ChevronRight, Flame } from 'lucide-react';
import { MobileProductCard } from './MobileProductCard';
import { useBestSelling, toDisplayProduct } from '@/hooks/useProducts';
import { getBestSellingProducts } from '@/data/mockData';

export function MobileBestSellers() {
  const { data: dbProducts, isLoading } = useBestSelling(6);
  
  const bestProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getBestSellingProducts().slice(0, 6);

  if (bestProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="py-3 bg-white dark:bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-3 mb-2.5">
        <div className="flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-bold text-foreground">Best Sellers</h2>
        </div>
        <Link 
          to="/products?sort=bestselling" 
          className="flex items-center gap-0.5 text-xs text-primary font-medium"
        >
          All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Products Grid - 3 columns */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-1.5 px-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] bg-secondary/30 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 px-2">
          {bestProducts.slice(0, 6).map((product, index) => (
            <MobileProductCard key={product.id} product={product} index={index} variant="square" />
          ))}
        </div>
      )}
    </section>
  );
}
