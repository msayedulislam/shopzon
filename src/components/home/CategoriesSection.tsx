import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';

const fallbackCategories = [
  { id: '1', name: 'Women Fashion', slug: 'fashion', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=200&fit=crop' },
  { id: '2', name: 'Men Topwear', slug: 'men-topwear', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&h=200&fit=crop' },
  { id: '3', name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop' },
  { id: '4', name: 'Kids Wear', slug: 'kids', image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=200&h=200&fit=crop' },
  { id: '5', name: 'Beauty', slug: 'beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop' },
  { id: '6', name: 'Home & Living', slug: 'home-living', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=200&h=200&fit=crop' },
  { id: '7', name: 'Footwear', slug: 'footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop' },
  { id: '8', name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop' },
  { id: '9', name: 'Health & Beauty', slug: 'health-beauty', image: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=200&h=200&fit=crop' },
  { id: '10', name: 'Baby & Kids', slug: 'baby-kids', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&h=200&fit=crop' },
];

export function CategoriesSection() {
  const { data: dbCategories, isLoading } = useCategories();
  
  const categories = dbCategories && dbCategories.length > 0
    ? dbCategories.slice(0, 10).map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image_url || fallbackCategories[idx % fallbackCategories.length].image,
      }))
    : fallbackCategories;

  return (
    <section className="py-6 bg-white dark:bg-card">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Categories</h2>
          <Link
            to="/categories"
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Categories Grid - Govaly Style with Images */}
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <Link
                to={`/category/${category.slug}`}
                className="group flex flex-col items-center gap-1.5"
              >
                {/* Square Image Container */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full aspect-square rounded-lg overflow-hidden bg-secondary/30 border border-border/20 group-hover:border-primary/30 transition-colors"
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
    </section>
  );
}
