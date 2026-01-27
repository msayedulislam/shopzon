import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const banners = [
  {
    id: 1,
    title: 'Summer Sale',
    discount: '40% OFF',
    description: 'On selected items',
    bgGradient: 'from-rose-500 via-pink-500 to-orange-400',
    link: '/products?sale=summer',
  },
  {
    id: 2,
    title: 'New Arrivals',
    discount: '30% OFF',
    description: 'Fresh collections',
    bgGradient: 'from-blue-500 via-indigo-500 to-purple-500',
    link: '/products?new=true',
  },
  {
    id: 3,
    title: 'Flash Deals',
    discount: '50% OFF',
    description: 'Limited time only',
    bgGradient: 'from-amber-500 via-orange-500 to-red-500',
    link: '/flash-sale',
  },
];

export function MobileBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <div 
      className="px-4 py-3"
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative h-36 rounded-3xl overflow-hidden shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Link 
              to={banners[currentIndex].link}
              className={`flex w-full h-full bg-gradient-to-br ${banners[currentIndex].bgGradient} relative overflow-hidden`}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-xl" />
              <div className="absolute top-1/2 right-8 w-24 h-24 bg-white/5 rounded-full" />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col justify-center w-full px-6 py-5">
                <motion.p 
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/80 text-xs font-medium tracking-wider uppercase"
                >
                  {banners[currentIndex].description}
                </motion.p>
                <motion.h3 
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-white text-xl font-bold mt-1"
                >
                  {banners[currentIndex].title}
                </motion.h3>
                <motion.div 
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 mt-2"
                >
                  <span className="text-white text-2xl font-black">
                    {banners[currentIndex].discount}
                  </span>
                </motion.div>
                <motion.div
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="mt-3"
                >
                  <span className="inline-flex items-center gap-1 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
                    Shop Now <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </motion.div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Progress Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-6 bg-white' 
                  : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
