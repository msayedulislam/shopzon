import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useProducts';

const fallbackCategories = [
  { id: '1', name: 'Women', slug: 'fashion', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=200&fit=crop' },
  { id: '2', name: 'Men', slug: 'men-topwear', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&h=200&fit=crop' },
  { id: '3', name: 'Gadgets', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop' },
  { id: '4', name: 'Kids', slug: 'kids', image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=200&h=200&fit=crop' },
  { id: '5', name: 'Beauty', slug: 'beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop' },
  { id: '6', name: 'Home', slug: 'home-living', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=200&h=200&fit=crop' },
  { id: '7', name: 'Shoes', slug: 'footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop' },
  { id: '8', name: 'Bags', slug: 'accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop' },
];

export function MobileCategories() {
  const { data: dbCategories } = useCategories();

  const categories = dbCategories && dbCategories.length > 0
    ? dbCategories.map((cat, idx) => ({
      id: cat.id,
      name: cat.name.split(' ')[0], // Keep it short
      slug: cat.slug,
      image: cat.image_url || fallbackCategories[idx % fallbackCategories.length].image,
    }))
    : fallbackCategories;

  return (
    <div className="py-4 bg-white overflow-hidden">
      <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="flex-shrink-0"
          >
            <Link
              to={`/categories?category=${category.slug}`}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/5 p-0.5 bg-white shadow-sm ring-1 ring-border/20">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-full"
                  loading="lazy"
                />
              </div>
              <span className="text-[11px] font-bold text-foreground text-center">
                {category.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
