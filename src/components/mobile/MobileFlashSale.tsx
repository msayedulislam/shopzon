import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MobileProductCard } from './MobileProductCard';
import { useFlashSaleProducts, toDisplayProduct } from '@/hooks/useProducts';
import { getFlashSaleProducts } from '@/data/mockData';
import { Loader2 } from 'lucide-react';

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
    <div className="px-4 py-4 bg-white dark:bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">Flash Sell</h2>
          <span className="text-xs text-primary font-medium">
            {formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}
          </span>
        </div>
        <Link 
          to="/flash-sale" 
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          All &gt;
        </Link>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {flashSaleProducts.map((product, index) => (
            <MobileProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
