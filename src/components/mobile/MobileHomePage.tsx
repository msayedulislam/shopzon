import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileHeader } from './MobileHeader';
import { MobileSearchBar } from './MobileSearchBar';
import { MobileBanner } from './MobileBanner';
import { MobileCategories } from './MobileCategories';
import { MobileFlashSale } from './MobileFlashSale';
import { MobileNewProducts } from './MobileNewProducts';
import { MobileBestSellers } from './MobileBestSellers';
import { MobileAllProducts } from './MobileAllProducts';
import { MobileBottomNav } from './MobileBottomNav';

export function MobileHomePage() {
  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background">
      {/* Header */}
      <MobileHeader showBack={false} transparent />
      
      {/* Search Bar */}
      <MobileSearchBar />
      
      {/* Banner Carousel */}
      <MobileBanner />
      
      {/* Categories */}
      <MobileCategories />
      
      {/* Flash Sale Section */}
      <div className="mt-2">
        <MobileFlashSale />
      </div>
      
      {/* New Products Section */}
      <div className="mt-2">
        <MobileNewProducts />
      </div>
      
      {/* Best Sellers Section */}
      <div className="mt-2">
        <MobileBestSellers />
      </div>
      
      {/* All Products Section */}
      <div className="mt-2 pb-24">
        <MobileAllProducts />
      </div>
      
      {/* Floating Action Button - Chat/Support */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
        whileTap={{ scale: 0.9 }}
        className="fixed right-4 bottom-20 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center shadow-lg shadow-primary/30"
        aria-label="Chat support"
      >
        <MessageCircle className="h-5 w-5" />
      </motion.button>
      
      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
