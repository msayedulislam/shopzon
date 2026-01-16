import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Sparkles, Star } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { getFeaturedProducts } from '@/data/mockData';
import { motion } from 'framer-motion';

export function FeaturedProducts() {
  const featuredProducts = getFeaturedProducts();

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <motion.div 
        animate={{ x: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-[120px] -translate-y-1/2" 
      />
      <motion.div 
        animate={{ x: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-amber-500/10 to-transparent blur-[100px] -translate-y-1/2" 
      />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 opacity-20">
        <Star className="h-8 w-8 text-amber-500" />
      </div>
      <div className="absolute bottom-32 left-16 opacity-15">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      
      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-14"
        >
          <div className="max-w-xl">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-semibold mb-5"
            >
              <Crown className="h-4 w-4" />
              <span>Handpicked for You</span>
            </motion.div>
            
            {/* Title */}
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Featured{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-primary bg-clip-text text-transparent">Products</span>
                <motion.span 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="absolute -top-2 -right-6"
                >
                  <Sparkles className="h-6 w-6 text-amber-500" />
                </motion.span>
              </span>
            </h2>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              Premium selection curated just for you. Discover trending items loved by thousands.
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
              className="group inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-card border-2 border-border hover:border-primary/50 text-foreground font-semibold transition-all duration-500 hover:gap-5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
            >
              View All Products
              <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
        
        {/* Bottom Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-16 pt-12 border-t border-border/50"
        >
          {[
            { value: '50K+', label: 'Happy Customers' },
            { value: '10K+', label: 'Products Available' },
            { value: '4.9', label: 'Average Rating', icon: Star },
            { value: '24/7', label: 'Customer Support' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl md:text-3xl font-bold text-foreground mb-1">
                {stat.icon && <stat.icon className="h-6 w-6 fill-amber-500 text-amber-500" />}
                <span className="bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">{stat.value}</span>
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}