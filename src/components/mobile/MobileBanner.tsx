import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const banners = [
  {
    id: 1,
    title: 'SUMMER',
    discount: '40%',
    subtitle: 'SALES',
    bgGradient: 'from-rose-400 via-rose-500 to-orange-400',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop',
    link: '/products?sale=summer',
  },
  {
    id: 2,
    title: 'NEW',
    discount: '30%',
    subtitle: 'ARRIVALS',
    bgGradient: 'from-blue-400 via-blue-500 to-indigo-500',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=200&fit=crop',
    link: '/products?new=true',
  },
  {
    id: 3,
    title: 'FLASH',
    discount: '50%',
    subtitle: 'DEALS',
    bgGradient: 'from-amber-400 via-orange-500 to-red-500',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop',
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
      className="px-4 py-2"
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative h-32 rounded-2xl overflow-hidden shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Link 
              to={banners[currentIndex].link}
              className={`flex w-full h-full bg-gradient-to-r ${banners[currentIndex].bgGradient} relative overflow-hidden`}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              {/* Content */}
              <div className="relative z-10 flex items-center justify-between w-full px-5 py-4">
                <div className="text-white">
                  <motion.p 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl font-bold tracking-wide"
                  >
                    {banners[currentIndex].title}
                  </motion.p>
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-baseline gap-1.5 mt-0.5"
                  >
                    <span className="text-3xl font-black">
                      {banners[currentIndex].discount}
                    </span>
                    <span className="text-sm font-bold opacity-90">OFF</span>
                  </motion.div>
                </div>
                
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-white text-xl font-bold tracking-wide"
                >
                  {banners[currentIndex].subtitle}
                </motion.p>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-5 bg-white' 
                  : 'w-1.5 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
