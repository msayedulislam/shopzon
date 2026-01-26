import { Link } from 'react-router-dom';
import { MobileProductCard } from './MobileProductCard';
import { useNewArrivals, toDisplayProduct } from '@/hooks/useProducts';
import { getNewArrivals } from '@/data/mockData';
import { Loader2 } from 'lucide-react';

export function MobileNewProducts() {
  const { data: dbProducts, isLoading } = useNewArrivals(6);
  
  const newProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getNewArrivals().slice(0, 6);

  if (newProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="px-4 py-4 bg-white dark:bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">New Product</h2>
        <Link 
          to="/products" 
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          All &gt;
        </Link>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {newProducts.slice(0, 3).map((product, index) => (
            <MobileProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
