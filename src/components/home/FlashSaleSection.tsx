import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Zap, Flame, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { useFlashSaleProducts, toDisplayProduct } from '@/hooks/useProducts';
import { products as mockProducts, getFlashSaleProducts } from '@/data/mockData';
import { motion } from 'framer-motion';

export function FlashSaleSection() {
  const { data: dbProducts, isLoading } = useFlashSaleProducts(5);
  
  // Use database products if available, otherwise fall back to mock data
  const flashSaleProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getFlashSaleProducts().slice(0, 5);

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

  const TimerBlock = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center">
      <motion.div 
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center shadow-xl shadow-primary/30 border border-white/20">
          <span className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>
            {value}
          </span>
        </div>
        <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-rose-600 rounded-2xl blur opacity-40 -z-10" />
      </motion.div>
      <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );

  if (flashSaleProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Premium Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-rose-500/10 blur-[150px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-500/15 to-orange-500/10 blur-[120px]" 
        />
      </div>
      
      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-14"
        >
          <div>
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500/10 to-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-5"
            >
              <Flame className="h-4 w-4 animate-pulse" />
              <span>Limited Time Offer</span>
            </motion.div>
            
            {/* Title */}
            <h2 className="text-3xl md:text-5xl font-bold text-foreground flex items-center gap-4 mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-rose-600 shadow-lg shadow-primary/30">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <span>Flash <span className="bg-gradient-to-r from-primary via-rose-500 to-amber-500 bg-clip-text text-transparent">Sale</span></span>
            </h2>
            
            {/* Timer */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-2 text-muted-foreground mr-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:inline">Ends in</span>
              </div>
              <TimerBlock value={formatTime(timeLeft.hours)} label="Hours" />
              <span className="text-3xl font-bold text-primary/50 self-start mt-4">:</span>
              <TimerBlock value={formatTime(timeLeft.minutes)} label="Mins" />
              <span className="text-3xl font-bold text-primary/50 self-start mt-4">:</span>
              <TimerBlock value={formatTime(timeLeft.seconds)} label="Secs" />
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/flash-sale"
              className="group inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-primary to-rose-600 text-white font-semibold transition-all duration-500 hover:gap-5 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-1"
            >
              View All Deals
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {flashSaleProducts.map((product, index) => (
              <motion.div
                key={`flash-${product.id}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
