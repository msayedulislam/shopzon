import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Loader2 } from 'lucide-react';
import { GovalyProductCard } from '@/components/product/GovalyProductCard';
import { useFlashSaleProducts, toDisplayProduct } from '@/hooks/useProducts';
import { getFlashSaleProducts } from '@/data/mockData';
import { motion } from 'framer-motion';

export function FlashSaleSection() {
  const { data: dbProducts, isLoading } = useFlashSaleProducts(10);

  const flashSaleProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getFlashSaleProducts().slice(0, 10);

  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (flashSaleProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="py-6 bg-white dark:bg-card">
      <div className="container">
        {/* Section Header - Compact Govaly Style */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Zap className="h-5 w-5 text-primary" fill="currentColor" />
              <h2 className="text-lg font-bold text-foreground">Flash Sale</h2>
            </div>

            {/* Timer - Compact */}
            <div className="flex items-center gap-1 bg-foreground/5 dark:bg-foreground/10 px-2.5 py-1 rounded-lg">
              <span className="text-xs font-bold text-foreground">{pad(timeLeft.hours)}</span>
              <span className="text-xs text-muted-foreground">:</span>
              <span className="text-xs font-bold text-foreground">{pad(timeLeft.minutes)}</span>
              <span className="text-xs text-muted-foreground">:</span>
              <span className="text-xs font-bold text-foreground">{pad(timeLeft.seconds)}</span>
            </div>
          </div>

          <Link
            to="/flash-sale"
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products Grid - 5 columns on desktop */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {flashSaleProducts.slice(0, 12).map((product, index) => (
              <GovalyProductCard key={`flash-${product.id}-${index}`} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
