import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FlashSaleSection } from '@/components/home/FlashSaleSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { NewArrivalSection } from '@/components/home/NewArrivalSection';
import { NewCollectionSection } from '@/components/home/NewCollectionSection';
import { FreeDeliverySection } from '@/components/home/FreeDeliverySection';
import { DiscountProductSection } from '@/components/home/DiscountProductSection';
import { PromoBanners } from '@/components/home/PromoBanners';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <FlashSaleSection />
        <PromoBanners />
        <FeaturedProducts />
        <NewArrivalSection />
        <NewCollectionSection />
        <FreeDeliverySection />
        <DiscountProductSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
