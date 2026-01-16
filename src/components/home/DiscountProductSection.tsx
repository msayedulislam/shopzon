import { motion } from 'framer-motion';
import { Percent, ArrowRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { getDiscountProducts } from '@/data/mockData';

export function DiscountProductSection() {
  const discountProducts = getDiscountProducts().slice(0, 4);

  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-rose-500/5 to-background" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-rose-500/10 blur-[120px]" />
      
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 text-sm font-medium text-rose-600 dark:text-rose-400 mb-4">
              <Flame className="h-4 w-4 animate-pulse" />
              <span>Hot Deals</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Discount <span className="text-rose-500">Products</span>
            </h2>
            <p className="text-muted-foreground mt-2">Amazing discounts on top products - save big today!</p>
          </div>
          
          <Link 
            to="/products?discount=true" 
            className="group inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold hover:gap-3 transition-all duration-300"
          >
            View All Deals
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {discountProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
