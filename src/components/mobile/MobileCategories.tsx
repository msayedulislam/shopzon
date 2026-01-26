import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { categories } from '@/data/mockData';
import { motion } from 'framer-motion';

const categoryColors = [
  'bg-gradient-to-br from-rose-400 to-rose-500',
  'bg-gradient-to-br from-purple-400 to-purple-500',
  'bg-gradient-to-br from-blue-400 to-blue-500',
  'bg-gradient-to-br from-teal-400 to-teal-500',
  'bg-gradient-to-br from-amber-400 to-amber-500',
  'bg-gradient-to-br from-emerald-400 to-emerald-500',
  'bg-gradient-to-br from-pink-400 to-pink-500',
  'bg-gradient-to-br from-indigo-400 to-indigo-500',
];

const categoryIcons: Record<string, string> = {
  'electronics': '📱',
  'fashion': '👔',
  'home-living': '🏠',
  'beauty': '💄',
  'sports': '⚽',
  'groceries': '🛒',
  'books': '📚',
  'toys': '🧸',
};

const categoryLabels: Record<string, string> = {
  'electronics': 'Man',
  'fashion': 'Woman',
  'home-living': 'Kids',
  'beauty': 'Home',
  'sports': 'Sports',
  'groceries': 'Grocery',
  'books': 'Books',
  'toys': 'Toys',
};

export function MobileCategories() {
  const displayCategories = categories.slice(0, 4);

  return (
    <div className="px-4 py-4 bg-white dark:bg-card">
      <div className="flex items-center justify-between gap-3">
        {displayCategories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={`/categories?category=${category.slug}`}
              className="flex flex-col items-center gap-2"
            >
              <div 
                className={`w-14 h-14 rounded-full ${categoryColors[index % categoryColors.length]} flex items-center justify-center text-white text-xl shadow-md`}
              >
                {categoryIcons[category.slug] || '📦'}
              </div>
              <span className="text-xs font-medium text-foreground text-center">
                {categoryLabels[category.slug] || category.name.split(' ')[0]}
              </span>
            </Link>
          </motion.div>
        ))}
        
        {/* More Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/categories"
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-muted-foreground to-foreground/70 flex items-center justify-center text-white shadow-md">
              <ChevronRight className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-foreground">More</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
