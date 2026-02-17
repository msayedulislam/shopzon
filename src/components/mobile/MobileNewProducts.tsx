import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MobileProductCard } from './MobileProductCard';
import { useNewArrivals, toDisplayProduct } from '@/hooks/useProducts';
import { getNewArrivals } from '@/data/mockData';

export function MobileNewProducts() {
  const { data: dbProducts } = useNewArrivals(6);

  const newProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getNewArrivals().slice(0, 6);

  return (
    <div className="bg-white py-3">
      <div className="flex items-center justify-between px-3 mb-3">
        <h2 className="text-[15px] font-black text-foreground uppercase tracking-tight">New Arrivals</h2>
        <Link to="/products?new=true" className="flex items-center text-xs text-primary font-bold">
          View All
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="px-3 grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
        {newProducts.map((product) => (
          <MobileProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
