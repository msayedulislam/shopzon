import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GovalyProductCard } from '@/components/product/GovalyProductCard';
import { useNewArrivals, toDisplayProduct } from '@/hooks/useProducts';
import { getNewArrivals } from '@/data/mockData';

export function NewArrivalSection() {
  const { data: dbProducts, isLoading } = useNewArrivals(10);

  const newArrivals = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getNewArrivals().slice(0, 10);

  if (newArrivals.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="py-6 bg-white dark:bg-card">
      <div className="container">
        {/* Section Header - Compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-foreground">New Arrivals</h2>
          </div>

          <Link
            to="/products?sort=newest"
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {newArrivals.slice(0, 12).map((product, index) => (
              <GovalyProductCard key={`new-${product.id}-${index}`} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
