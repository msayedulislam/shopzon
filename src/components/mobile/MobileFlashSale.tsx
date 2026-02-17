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
    <div className="bg-white py-4 rounded-3xl mx-3 shadow-sm border border-border/5">
      <div className="flex items-center justify-between px-4 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-black text-foreground uppercase tracking-widest italic">Flash Sale</h2>
          <div className="flex items-center gap-1.5 bg-primary px-2.5 py-1 rounded-full text-white shadow-lg shadow-primary/20">
            <Timer className="h-3 w-3" strokeWidth={3} />
            <span className="text-[10px] font-black tracking-tighter">08:24:12</span>
          </div>
        </div>
        <Link to="/products?sale=true" className="flex items-center text-[10px] text-primary font-black uppercase tracking-widest">
          View All
          <ChevronRight className="h-3 w-3 ml-0.5" strokeWidth={3} />
        </Link>
      </div>
      <div className="px-4 grid grid-cols-3 md:grid-cols-5 gap-3">
        {flashSaleProducts.map((product) => (
          <MobileProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
