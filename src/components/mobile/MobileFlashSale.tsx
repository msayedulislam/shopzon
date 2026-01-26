import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { MobileProductCard } from './MobileProductCard';
import { useFlashSaleProducts, toDisplayProduct } from '@/hooks/useProducts';
import { getFlashSaleProducts } from '@/data/mockData';
import { motion } from 'framer-motion';

export function MobileFlashSale() {
  const { data: dbProducts, isLoading } = useFlashSaleProducts(3);
  
  const flashSaleProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getFlashSaleProducts().slice(0, 3);

  const [timeLeft, setTimeLeft] = useState({
    hours: 3,
    minutes: 30,
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

  const formatTime = (h: number, m: number, s: number) => 
    `${h.toString().padStart(2, '0')}. ${m.toString().padStart(2, '0')}. ${s.toString().padStart(2, '0')}`;

  if (flashSaleProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="px-4 py-4 bg-white dark:bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-foreground">Flash Sell</h2>
          <motion.span 
            key={timeLeft.seconds}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-xs text-primary font-semibold tabular-nums"
          >
            {formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}
          </motion.span>
        </div>
        <Link 
          to="/flash-sale" 
          className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          All
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] bg-secondary/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {flashSaleProducts.map((product, index) => (
            <MobileProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
