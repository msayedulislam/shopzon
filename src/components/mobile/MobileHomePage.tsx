import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { MobileSearchBar } from './MobileSearchBar';
import { MobileBanner } from './MobileBanner';
import { MobileCategories } from './MobileCategories';
import { MobileFlashSale } from './MobileFlashSale';
import { MobileNewProducts } from './MobileNewProducts';
import { MobileBestSellers } from './MobileBestSellers';
import { MobileAllProducts } from './MobileAllProducts';
import { MobileBottomNav } from './MobileBottomNav';
import { NotificationPermissionPrompt } from './NotificationPermissionPrompt';

export function MobileHomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background">
      {/* Header */}
      <MobileHeader showBack={false} transparent />
      
      {/* Search Bar */}
      <MobileSearchBar />
      
      {/* Banner Carousel */}
      <MobileBanner />
      
      {/* Categories */}
      <div className="mt-1.5">
        <MobileCategories />
      </div>
      
      {/* Flash Sale Section */}
      <div className="mt-1.5">
        <MobileFlashSale />
      </div>
      
      {/* New Products Section */}
      <div className="mt-1.5">
        <MobileNewProducts />
      </div>
      
      {/* Best Sellers Section */}
      <div className="mt-1.5">
        <MobileBestSellers />
      </div>
      
      {/* All Products Section */}
      <div className="mt-1.5 pb-20">
        <MobileAllProducts />
      </div>
      
      {/* Floating Action Button - Chat/Support */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/help')}
        className="fixed right-3 bottom-16 z-40 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"
        aria-label="Chat support"
      >
        <MessageCircle className="h-4 w-4" />
      </motion.button>
      
      {/* Bottom Navigation */}
      <MobileBottomNav />
      
      {/* Notification Permission Prompt */}
      <NotificationPermissionPrompt />
    </div>
  );
}
