import { Link } from 'react-router-dom';
import { ChevronRight, Timer } from 'lucide-react';
import { MobileProductCard } from './MobileProductCard';
import { useFlashSaleProducts, toDisplayProduct } from '@/hooks/useProducts';
import { getFlashSaleProducts } from '@/data/mockData';

export function MobileFlashSale() {
  const { data: dbProducts, isLoading } = useFlashSaleProducts(6);

  const flashSaleProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getFlashSaleProducts().slice(0, 6);

  return (
    <div className="bg-white py-3">
      <div className="flex items-center justify-between px-3 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-black text-foreground uppercase tracking-tight">Flash Sale</h2>
          <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded text-primary animate-pulse">
            <Timer className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold">08:24:12</span>
          </div>
        </div>
        <Link to="/products?sale=true" className="flex items-center text-xs text-primary font-bold">
          View All
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="px-3 grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
        {flashSaleProducts.map((product) => (
          <MobileProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
