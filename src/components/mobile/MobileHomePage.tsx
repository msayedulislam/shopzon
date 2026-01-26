import { MobileHeader } from './MobileHeader';
import { MobileSearchBar } from './MobileSearchBar';
import { MobileBanner } from './MobileBanner';
import { MobileCategories } from './MobileCategories';
import { MobileFlashSale } from './MobileFlashSale';
import { MobileNewProducts } from './MobileNewProducts';
import { MobileBestSellers } from './MobileBestSellers';
import { MobileBottomNav } from './MobileBottomNav';

export function MobileHomePage() {
  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background">
      {/* Header */}
      <MobileHeader showBack={false} />
      
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
      <div className="mt-2 pb-20">
        <MobileBestSellers />
      </div>
      
      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
