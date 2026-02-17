import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { GovalyProductCard } from '@/components/product/GovalyProductCard';
import { useFeaturedProducts, toDisplayProduct } from '@/hooks/useProducts';
import { getFeaturedProducts } from '@/data/mockData';
import { motion } from 'framer-motion';

export function FeaturedProducts() {
  const { data: dbProducts, isLoading } = useFeaturedProducts(8);

  // Use database products if available, otherwise fall back to mock data
  const featuredProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getFeaturedProducts().slice(0, 8);

  if (featuredProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12"
        >
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-primary text-primary text-sm font-semibold mb-4"
            >
              <Sparkles className="h-4 w-4" />
              <span>Curated Selection</span>
            </motion.div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Featured <span className="text-gradient">Products</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Handpicked premium products from our top-rated sellers
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/products?featured=true"
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-primary text-primary font-semibold transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:gap-4"
            >
              View All
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={`featured-${product.id}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
