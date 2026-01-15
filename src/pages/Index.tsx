import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FlashSaleSection } from '@/components/home/FlashSaleSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { PromoBanners } from '@/components/home/PromoBanners';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CategoriesSection />
        <FlashSaleSection />
        <PromoBanners />
        <FeaturedProducts />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
