import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useProducts';

// Fallback categories with images
const fallbackCategories = [
  { id: '1', name: 'Women Fashion', slug: 'fashion', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=200&fit=crop' },
  { id: '2', name: 'Men Topwear', slug: 'men-topwear', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&h=200&fit=crop' },
  { id: '3', name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop' },
  { id: '4', name: 'Kids Wear', slug: 'kids', image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=200&h=200&fit=crop' },
  { id: '5', name: 'Beauty', slug: 'beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop' },
  { id: '6', name: 'Home & Living', slug: 'home-living', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=200&h=200&fit=crop' },
  { id: '7', name: 'Footwear', slug: 'footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop' },
  { id: '8', name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop' },
];

export function MobileCategories() {
  const { data: dbCategories, isLoading } = useCategories();
  
  const categories = dbCategories && dbCategories.length > 0
    ? dbCategories.slice(0, 8).map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image_url || fallbackCategories[idx % fallbackCategories.length].image,
      }))
    : fallbackCategories;

  return (
    <div className="py-3 bg-white dark:bg-card">
      {/* Section Header */}
      <div className="flex items-center justify-between px-3 mb-2.5">
        <h2 className="text-sm font-bold text-foreground">Categories</h2>
        <Link 
          to="/categories" 
          className="flex items-center gap-0.5 text-xs text-primary font-medium"
        >
          All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Categories Grid - 4 columns, Govaly style */}
      <div className="grid grid-cols-4 gap-1 px-1.5">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
          >
            <Link
              to={`/categories?category=${category.slug}`}
              className="flex flex-col items-center gap-1 p-1.5"
            >
              {/* Square Image Container */}
              <motion.div 
                whileTap={{ scale: 0.95 }}
                className="w-full aspect-square rounded-lg overflow-hidden bg-secondary/30 border border-border/20"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>
              <span className="text-[10px] font-medium text-foreground text-center line-clamp-1 leading-tight">
                {category.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
