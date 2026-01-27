import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  position: string;
}

const fallbackBanners: Banner[] = [
  {
    id: '1',
    title: 'Summer Sale',
    subtitle: 'Up to 50% Off on Selected Items',
    image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
    link_url: '/products?sale=true',
    position: 'hero',
  },
  {
    id: '2',
    title: 'New Collection',
    subtitle: 'Discover Latest Trends',
    image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop',
    link_url: '/products?sort=newest',
    position: 'hero',
  },
];

export function PromoBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('banners')
        .select('id, title, subtitle, image_url, link_url, position')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setBanners(data && data.length > 0 ? data : fallbackBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners(fallbackBanners);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    if (banners.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [banners.length, isPaused, nextSlide]);

  if (isLoading) {
    return (
      <section className="py-3">
        <div className="container">
          <Skeleton className="w-full h-[180px] md:h-[220px] lg:h-[280px] rounded-lg" />
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="py-3">
      <div className="container">
        <div 
          className="relative overflow-hidden rounded-lg"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Banner Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link 
                to={currentBanner.link_url || '/products'}
                className="block relative aspect-[3/1] md:aspect-[4/1] overflow-hidden"
              >
                {/* Background Image */}
                <img
                  src={currentBanner.image_url}
                  alt={currentBanner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center px-6 md:px-10">
                  <div className="max-w-md space-y-2">
                    <h2 className="text-xl md:text-3xl font-bold text-white">
                      {currentBanner.title}
                    </h2>
                    {currentBanner.subtitle && (
                      <p className="text-sm md:text-base text-white/90">
                        {currentBanner.subtitle}
                      </p>
                    )}
                    <button className="mt-2 px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors">
                      Shop Now
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  prevSlide();
                }}
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  nextSlide();
                }}
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-5 bg-white' 
                      : 'w-1.5 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
