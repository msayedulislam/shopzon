import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { getFeaturedProducts } from '@/data/mockData';

export function FeaturedProducts() {
  const featuredProducts = getFeaturedProducts();

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] -translate-y-1/2" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-muted-foreground mb-4">
              <Crown className="h-4 w-4 text-accent" />
              <span>Handpicked for You</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Sparkles className="h-8 w-8 text-accent" />
              Featured <span className="text-gradient">Products</span>
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Premium selection curated just for you
            </p>
          </div>
          <Link
            to="/products?featured=true"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full glass-primary text-primary font-semibold transition-all duration-300 hover:gap-4 animate-slide-in-right"
          >
            View All Products
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}