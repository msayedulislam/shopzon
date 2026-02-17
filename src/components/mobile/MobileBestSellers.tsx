import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MobileProductCard } from './MobileProductCard';
import { useBestSelling, toDisplayProduct } from '@/hooks/useProducts';
import { getBestSellingProducts } from '@/data/mockData';

export function MobileBestSellers() {
  const { data: dbProducts } = useBestSelling(6);

  const bestSellers = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getBestSellingProducts().slice(0, 6);

  return (
    <div className="bg-white py-4 rounded-3xl mx-3 shadow-sm border border-border/5">
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-[14px] font-black text-foreground uppercase tracking-widest italic">Best Sellers</h2>
        <Link to="/products?popular=true" className="flex items-center text-[10px] text-primary font-black uppercase tracking-widest">
          View All
          <ChevronRight className="h-3 w-3 ml-0.5" strokeWidth={3} />
        </Link>
      </div>

      <div className="px-4 grid grid-cols-3 md:grid-cols-5 gap-3">
        {bestSellers.map((product) => (
          <MobileProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
