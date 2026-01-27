import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap } from 'lucide-react';
import { MobileProductCard } from './MobileProductCard';
import { useFlashSaleProducts, toDisplayProduct } from '@/hooks/useProducts';
import { getFlashSaleProducts } from '@/data/mockData';
import { motion } from 'framer-motion';

export function MobileFlashSale() {
  const { data: dbProducts, isLoading } = useFlashSaleProducts(6);
  
  const flashSaleProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getFlashSaleProducts().slice(0, 6);

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
    <section className="py-3 bg-white dark:bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" fill="currentColor" />
            <h2 className="text-sm font-bold text-foreground">Flash Sale</h2>
          </div>
          
          {/* Timer - Compact */}
          <div className="flex items-center gap-0.5 bg-foreground/5 px-2 py-0.5 rounded">
            <span className="text-[10px] font-bold text-foreground">{pad(timeLeft.hours)}</span>
            <span className="text-[10px] text-foreground">:</span>
            <span className="text-[10px] font-bold text-foreground">{pad(timeLeft.minutes)}</span>
            <span className="text-[10px] text-foreground">:</span>
            <span className="text-[10px] font-bold text-foreground">{pad(timeLeft.seconds)}</span>
          </div>
        </div>
        
        <Link 
          to="/flash-sale" 
          className="flex items-center gap-0.5 text-xs text-primary font-medium"
        >
          All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Products Grid - 3 columns */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-1.5 px-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] bg-secondary/30 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 px-2">
          {flashSaleProducts.slice(0, 6).map((product, index) => (
            <MobileProductCard key={product.id} product={product} index={index} variant="square" />
          ))}
        </div>
      )}
    </section>
  );
}
