import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Bell, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileProductCard } from './MobileProductCard';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';
import { useProducts, toDisplayProduct } from '@/hooks/useProducts';
import { products as mockProducts } from '@/data/mockData';

interface MobileProductsPageProps {
  title?: string;
}

export function MobileProductsPage({ title = 'Products' }: MobileProductsPageProps) {
  const navigate = useNavigate();
  const { data: dbProducts, isLoading } = useProducts({ limit: 24 });

  const products = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : mockProducts.slice(0, 24);

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-background pb-20">
      <MobileHeader title={title} showBack />

      {/* Products Grid */}
      <div className="px-3 py-3">
        {isLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
            {[...Array(12)].map((i) => (
              <div key={i} className="aspect-[3/4] bg-white rounded-lg animate-pulse border border-border/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
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
