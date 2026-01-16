import { motion } from 'framer-motion';
import { Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/mockData';

export function AllProductsSection() {
  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-muted-foreground mb-4">
              <Package className="h-4 w-4 text-primary animate-pulse" />
              <span>All Products</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Explore Our <span className="text-gradient">Collection</span>
            </h2>
            <p className="text-muted-foreground mt-2">Browse through our complete product catalog</p>
          </div>
          
          <Link 
            to="/products" 
            className="group inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
          >
            View All Products
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
