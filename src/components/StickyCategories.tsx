import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { categories as mockCategories } from '@/data/mockData';
import { useCategories } from '@/hooks/useProducts';
import { Zap } from 'lucide-react';

interface StickyCategoriesProps {
  isVisible: boolean;
}

export function StickyCategories({ isVisible }: StickyCategoriesProps) {
  const { data: dbCategories } = useCategories();
  
  // Use database categories or fall back to mock
  const categories = dbCategories && dbCategories.length > 0 
    ? dbCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon || '📦', productCount: 0 }))
    : mockCategories;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-white/5 shadow-lg"
        >
          <div className="container">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
              {categories.map((category, index) => (
                <motion.div
                  key={`sticky-${category.id}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/category/${category.slug}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 whitespace-nowrap"
                  >
                    <span>{category.name}</span>
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categories.length * 0.05 }}
              >
                <Link
                  to="/flash-sale"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 whitespace-nowrap"
                >
                  <Zap className="h-4 w-4" />
                  <span>Flash Sale</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
