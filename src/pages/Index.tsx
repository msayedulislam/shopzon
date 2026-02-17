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
import { RecentlyViewedSection } from '@/components/RecentlyViewedSection';
import { PersonalizedRecommendations } from '@/components/PersonalizedRecommendations';
import { ProductComparisonBar } from '@/components/ProductComparison';
import { LiveChatWidget } from '@/components/LiveChatWidget';

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
        <div className="py-2">
          <CategoriesSection />
        </div>
        
        {/* Flash Sale */}
        <div className="py-3">
          <FlashSaleSection />
        </div>
        
        {/* Best Sellers */}
        <div className="py-3">
          <BestSellingSection />
        </div>
        
        {/* Personalized Recommendations */}
        <div className="py-3">
          <PersonalizedRecommendations />
        </div>
        
        {/* New Arrivals */}
        <div className="py-3">
          <NewArrivalSection />
        </div>
        
        {/* Recently Viewed */}
        <div className="py-3">
          <RecentlyViewedSection />
        </div>
        
        {/* All Products */}
        <div className="py-6 pb-8">
          <AllProductsSection />
        </div>
      </main>
      <Footer />
      
      {/* Product Comparison Bar */}
      <ProductComparisonBar />
      
      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
};

export default Index;
