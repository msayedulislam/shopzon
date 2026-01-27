import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Clock } from 'lucide-react';
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

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (flashSaleProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="py-4 bg-white dark:bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" fill="white" />
            </div>
            <h2 className="text-base font-bold text-foreground">Flash Sale</h2>
          </div>
        </div>
        
        {/* Timer */}
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex items-center gap-0.5">
            <span className="w-6 h-6 rounded-md bg-foreground text-background text-xs font-bold flex items-center justify-center">
              {pad(timeLeft.hours)}
            </span>
            <span className="text-foreground font-bold">:</span>
            <span className="w-6 h-6 rounded-md bg-foreground text-background text-xs font-bold flex items-center justify-center">
              {pad(timeLeft.minutes)}
            </span>
            <span className="text-foreground font-bold">:</span>
            <span className="w-6 h-6 rounded-md bg-foreground text-background text-xs font-bold flex items-center justify-center">
              {pad(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Products Horizontal Scroll */}
      {isLoading ? (
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-36 shrink-0">
              <div className="aspect-[3/4] bg-secondary/40 rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
            {flashSaleProducts.map((product, index) => (
              <div key={product.id} className="w-36 shrink-0">
                <MobileProductCard product={product} index={index} variant="compact" />
              </div>
            ))}
            
            {/* View All Card */}
            <Link 
              to="/flash-sale"
              className="w-28 shrink-0 aspect-[3/4] rounded-2xl bg-gradient-to-br from-primary/10 to-rose-500/10 border border-primary/20 flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ChevronRight className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary">View All</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
