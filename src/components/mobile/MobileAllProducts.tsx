import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileProductCard } from './MobileProductCard';
import { useProducts, toDisplayProduct } from '@/hooks/useProducts';
import { Sparkles, Loader2, ChevronRight } from 'lucide-react';

export function MobileAllProducts() {
  const { data: dbProducts, isLoading } = useProducts({ limit: 12 });

  const products = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : [];

  return (
    <div className="bg-white py-4 rounded-xl shadow-sm border border-border/20">
      <div className="flex items-center gap-2 px-3 mb-4">
        <Sparkles className="h-4.5 w-4.5 text-primary" />
        <h2 className="text-[15px] font-black text-foreground uppercase tracking-tight">Just For You</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="px-3">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
            {products.map((product) => (
              <MobileProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length >= 12 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <Link
                to="/products"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-secondary/30 hover:bg-secondary/50 rounded-lg text-[11px] font-bold text-foreground transition-colors border border-border/40"
              >
                View All Products
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
