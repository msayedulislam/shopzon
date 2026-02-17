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
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] dark:bg-background pb-24">
      <MobileHeader />

      <main className="flex-1">
        <MobileBanner />

        <div className="mt-4">
          <MobileCategories />
        </div>

        <div className="space-y-4 mt-4">
          <MobileFlashSale />

          {/* Promo Section */}
          <div className="px-3">
            <div className="w-full h-32 rounded-3xl overflow-hidden shadow-lg shadow-primary/10">
              <img
                src="https://images.unsplash.com/photo-1549439602-43ebca2327af?w=800&q=80"
                className="w-full h-full object-cover"
                alt="Ad Banner"
              />
            </div>
          </div>

          <MobileBestSellers />
          <MobileNewProducts />

          <div className="px-3 pb-8">
            <MobileAllProducts />
          </div>
        </div>
      </main>

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
