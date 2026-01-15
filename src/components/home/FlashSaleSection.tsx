import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { getFlashSaleProducts, formatPrice } from '@/data/mockData';
import { ProductCard } from '@/components/product/ProductCard';

export function FlashSaleSection() {
  const flashSaleProducts = getFlashSaleProducts();
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

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-r from-destructive/5 via-accent/5 to-destructive/5">
      <div className="container">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl animate-bounce-subtle">🔥</span>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Flash Sale
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />
              <div className="flex items-center gap-1">
                <span className="flash-timer">{formatTime(timeLeft.hours)}</span>
                <span className="text-foreground font-bold">:</span>
                <span className="flash-timer">{formatTime(timeLeft.minutes)}</span>
                <span className="text-foreground font-bold">:</span>
                <span className="flash-timer">{formatTime(timeLeft.seconds)}</span>
              </div>
            </div>
          </div>
          <Link
            to="/flash-sale"
            className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All Deals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {flashSaleProducts.slice(0, 5).map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
