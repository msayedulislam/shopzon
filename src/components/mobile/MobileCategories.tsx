import { Link } from 'react-router-dom';
import { ChevronRight, Shirt, Gift, Baby, Home, Smartphone, Sparkles, ShoppingBag, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { id: '1', name: 'Fashion', slug: 'fashion', icon: Shirt, gradient: 'from-rose-500 to-pink-400' },
  { id: '2', name: 'Beauty', slug: 'beauty', icon: Sparkles, gradient: 'from-purple-500 to-violet-400' },
  { id: '3', name: 'Kids', slug: 'toys', icon: Baby, gradient: 'from-blue-500 to-cyan-400' },
  { id: '4', name: 'Home', slug: 'home-living', icon: Home, gradient: 'from-teal-500 to-emerald-400' },
  { id: '5', name: 'Electronics', slug: 'electronics', icon: Smartphone, gradient: 'from-indigo-500 to-blue-400' },
  { id: '6', name: 'Deals', slug: 'deals', icon: Zap, gradient: 'from-amber-500 to-orange-400' },
];

export function MobileCategories() {
  return (
    <div className="px-4 py-5 bg-white dark:bg-card">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground">Shop by Category</h2>
        <Link 
          to="/categories" 
          className="flex items-center gap-0.5 text-xs text-primary font-medium"
        >
          See All
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-3 gap-3">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
          >
            <Link
              to={`/categories?category=${category.slug}`}
              className="flex flex-col items-center gap-2 group"
            >
              <motion.div 
                whileTap={{ scale: 0.92 }}
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                style={{
                  boxShadow: `0 8px 20px -4px rgba(0, 0, 0, 0.15)`
                }}
              >
                <category.icon className="h-6 w-6 text-white" strokeWidth={1.8} />
              </motion.div>
              <span className="text-xs font-medium text-foreground text-center">
                {category.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
