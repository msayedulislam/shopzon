import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Grid3X3, Smartphone, Shirt, Home, Dumbbell, Sparkles as SparklesIcon, Car, Baby, BookOpen, ShoppingBag } from 'lucide-react';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  electronics: Smartphone,
  fashion: Shirt,
  'home-living': Home,
  sports: Dumbbell,
  beauty: SparklesIcon,
  automotive: Car,
  'baby-kids': Baby,
  books: BookOpen,
  default: ShoppingBag
};

const categoryData = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    productCount: 1250,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    productCount: 2340,
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: '3',
    name: 'Home & Living',
    slug: 'home-living',
    productCount: 890,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: '4',
    name: 'Sports',
    slug: 'sports',
    productCount: 567,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: '5',
    name: 'Beauty',
    slug: 'beauty',
    productCount: 1120,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: '6',
    name: 'Automotive',
    slug: 'automotive',
    productCount: 345,
    color: 'from-slate-500 to-gray-600',
  },
  {
    id: '7',
    name: 'Baby & Kids',
    slug: 'baby-kids',
    productCount: 678,
    color: 'from-sky-400 to-blue-500',
  },
  {
    id: '8',
    name: 'Books',
    slug: 'books',
    productCount: 2100,
    color: 'from-indigo-500 to-violet-500',
  },
];

const getIconForSlug = (slug: string) => {
  return iconMap[slug] || iconMap.default;
};

export function CategoriesSection() {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-muted-foreground mb-4">
              <Grid3X3 className="h-4 w-4 text-primary animate-pulse" />
              <span>Browse Categories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Shop by <span className="text-gradient">Category</span>
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Discover products across all categories
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              to="/categories"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full glass-primary text-primary font-semibold transition-all duration-300 hover:gap-4"
            >
              View All Categories
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-6">
          {categoryData.map((category, index) => {
            const IconComponent = getIconForSlug(category.slug);
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  to={`/category/${category.slug}`}
                  className="group relative flex flex-col items-center justify-center aspect-square rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Overlay Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center p-4 text-center">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      <IconComponent className="h-7 w-7 text-white" />
                    </div>
                    
                    {/* Category Name */}
                    <span className="font-bold text-sm text-white drop-shadow-lg">
                      {category.name}
                    </span>
                    
                    {/* Product Count */}
                    <span className="text-xs text-white/80 mt-1">
                      {category.productCount} items
                    </span>
                  </div>
                  
                  {/* Bottom Glow */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
