import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Zap, Flame } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { getFlashSaleProducts } from '@/data/mockData';

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
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] animate-glow-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
          <div className="animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-primary text-primary text-sm font-semibold mb-4">
              <Flame className="h-4 w-4 animate-pulse" />
              <span>Limited Time Offer</span>
            </div>
            
            {/* Title with Timer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <Zap className="h-8 w-8 text-primary animate-pulse" />
                <span className="text-gradient">Flash Sale</span>
              </h2>
              
              {/* Timer */}
              <div className="flex items-center gap-3 glass-card rounded-2xl px-6 py-3">
                <Clock className="h-5 w-5 text-primary" />
                <div className="flex items-center gap-2">
                  <div className="flash-timer">
                    {formatTime(timeLeft.hours)}
                  </div>
                  <span className="text-2xl font-bold text-primary animate-pulse">:</span>
                  <div className="flash-timer">
                    {formatTime(timeLeft.minutes)}
                  </div>
                  <span className="text-2xl font-bold text-primary animate-pulse">:</span>
                  <div className="flash-timer">
                    {formatTime(timeLeft.seconds)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Link
            to="/flash-sale"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full glass-primary text-primary font-semibold transition-all duration-300 hover:gap-4 animate-slide-in-right"
          >
            View All Deals
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
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