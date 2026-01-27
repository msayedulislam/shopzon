import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FlashSaleSection } from '@/components/home/FlashSaleSection';
import { NewArrivalSection } from '@/components/home/NewArrivalSection';
import { AllProductsSection } from '@/components/home/AllProductsSection';
import { BestSellingSection } from '@/components/home/BestSellingSection';
import { PromoBannerCarousel } from '@/components/home/PromoBannerCarousel';
import { MobileHomePage } from '@/components/mobile/MobileHomePage';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  // Show mobile-specific homepage on mobile devices
  if (isMobile) {
    return <MobileHomePage />;
  }

  // Desktop version - Clean, compact Govaly-style layout
  return (
    <div className="min-h-screen flex flex-col bg-secondary/30 dark:bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Banner */}
        <PromoBannerCarousel />
        
        {/* Categories Grid */}
        <CategoriesSection />
        
        {/* Flash Sale */}
        <div className="mt-2">
          <FlashSaleSection />
        </div>
        
        {/* Best Sellers */}
        <div className="mt-2">
          <BestSellingSection />
        </div>
        
        {/* New Arrivals */}
        <div className="mt-2">
          <NewArrivalSection />
        </div>
        
        {/* All Products */}
        <div className="mt-2 pb-6">
          <AllProductsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
