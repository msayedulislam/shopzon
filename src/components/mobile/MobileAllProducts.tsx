import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { MobileProductCard } from './MobileProductCard';
import { useProducts, toDisplayProduct } from '@/hooks/useProducts';
import { products as mockProducts } from '@/data/mockData';

export function MobileAllProducts() {
  const { data: dbProducts, isLoading } = useProducts({ limit: 50 });
  
  const allProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : mockProducts;

  return (
    <section className="px-4 py-4 bg-white dark:bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground">All Products</h2>
        <Link 
          to="/products" 
          className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          View All
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {allProducts.map((product, index) => (
            <MobileProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
