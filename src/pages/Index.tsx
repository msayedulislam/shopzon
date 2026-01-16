import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FlashSaleSection } from '@/components/home/FlashSaleSection';
import { NewArrivalSection } from '@/components/home/NewArrivalSection';
import { NewCollectionSection } from '@/components/home/NewCollectionSection';
import { FreeDeliverySection } from '@/components/home/FreeDeliverySection';
import { DiscountProductSection } from '@/components/home/DiscountProductSection';
import { MarketingFeatures } from '@/components/home/MarketingFeatures';
import { AllProductsSection } from '@/components/home/AllProductsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { BestSellingSection } from '@/components/home/BestSellingSection';
import { TopSellersSection } from '@/components/home/TopSellersSection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <MarketingFeatures />
        <CategoriesSection />
        <FlashSaleSection />
        <BestSellingSection />
        <NewArrivalSection />
        <NewCollectionSection />
        <FreeDeliverySection />
        <DiscountProductSection />
        <AllProductsSection />
        <TopSellersSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
