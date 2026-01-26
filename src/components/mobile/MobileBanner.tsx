import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const banners = [
  {
    id: 1,
    title: 'SUMMER',
    discount: '40%',
    subtitle: 'SALES',
    bgColor: 'bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop',
    link: '/products?sale=summer',
  },
  {
    id: 2,
    title: 'NEW',
    discount: '30%',
    subtitle: 'ARRIVALS',
    bgColor: 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=200&fit=crop',
    link: '/products?new=true',
  },
  {
    id: 3,
    title: 'FLASH',
    discount: '50%',
    subtitle: 'DEALS',
    bgColor: 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop',
    link: '/flash-sale',
  },
];

export function MobileBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-4 py-3">
      <div className="relative h-36 rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Link 
              to={banners[currentIndex].link}
              className={`block w-full h-full ${banners[currentIndex].bgColor} relative`}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url(${banners[currentIndex].image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-between p-6">
                <div className="text-white">
                  <p className="text-2xl font-bold tracking-wider">
                    {banners[currentIndex].title}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black">
                      {banners[currentIndex].discount}
                    </span>
                    <span className="text-lg font-semibold">OFF</span>
                  </div>
                </div>
                <div className="text-white text-right">
                  <p className="text-2xl font-bold tracking-wider">
                    {banners[currentIndex].subtitle}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Dots Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-5 bg-white' 
                  : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
