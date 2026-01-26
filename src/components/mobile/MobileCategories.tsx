import { Link } from 'react-router-dom';
import { ChevronRight, Smartphone, Shirt, Baby, Home, Dumbbell, ShoppingBasket, BookOpen, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { id: '1', name: 'Man', slug: 'fashion', icon: Shirt, color: 'from-rose-400 to-rose-500' },
  { id: '2', name: 'Woman', slug: 'beauty', icon: Gift, color: 'from-purple-400 to-purple-500' },
  { id: '3', name: 'Kids', slug: 'toys', icon: Baby, color: 'from-blue-400 to-blue-500' },
  { id: '4', name: 'Home', slug: 'home-living', icon: Home, color: 'from-teal-400 to-teal-500' },
];

export function MobileCategories() {
  return (
    <div className="px-4 py-4 bg-white dark:bg-card">
      <div className="flex items-center justify-between">
        {/* Category Icons */}
        <div className="flex items-center gap-4 flex-1">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
            >
              <Link
                to={`/categories?category=${category.slug}`}
                className="flex flex-col items-center gap-1.5"
              >
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center shadow-md`}
                >
                  <category.icon className="h-5 w-5 text-white" strokeWidth={2} />
                </motion.div>
                <span className="text-[11px] font-medium text-foreground text-center">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* More Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
        >
          <Link
            to="/categories"
            className="flex flex-col items-center gap-1.5"
          >
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-muted-foreground to-foreground/80 flex items-center justify-center shadow-md"
            >
              <ChevronRight className="h-5 w-5 text-white" strokeWidth={2.5} />
            </motion.div>
            <span className="text-[11px] font-medium text-foreground text-center">
              More
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
