import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
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
    <section className="px-4 py-4 bg-white dark:bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground">Best Sellers</h2>
        <Link 
          to="/products?sort=bestselling" 
          className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          All
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] bg-secondary/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {bestProducts.slice(0, 3).map((product, index) => (
            <MobileProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
