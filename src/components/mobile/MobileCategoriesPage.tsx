import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useProducts';
import { categories as mockCategories } from '@/data/mockData';
import { Shirt, Baby, Home, Dumbbell, ShoppingBasket, BookOpen, Gift, Smartphone } from 'lucide-react';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';

const categoryIcons: Record<string, any> = {
  'electronics': Smartphone,
  'fashion': Shirt,
  'home-living': Home,
  'beauty': Gift,
  'sports': Dumbbell,
  'groceries': ShoppingBasket,
  'books': BookOpen,
  'toys': Baby,
};

const categoryColors = [
  'from-rose-400 to-rose-500',
  'from-purple-400 to-purple-500',
  'from-blue-400 to-blue-500',
  'from-teal-400 to-teal-500',
  'from-amber-400 to-amber-500',
  'from-emerald-400 to-emerald-500',
  'from-pink-400 to-pink-500',
  'from-indigo-400 to-indigo-500',
];

// Subcategories for display
const subCategories: Record<string, string[]> = {
  'electronics': ['Phones', 'Laptops', 'Tablets', 'Cameras'],
  'fashion': ['Shirt', 'T-shirt', 'Pant', 'Jeans'],
  'home-living': ['Furniture', 'Decor', 'Kitchen', 'Bedding'],
  'beauty': ['Makeup', 'Skincare', 'Perfume', 'Hair'],
  'sports': ['Gym', 'Outdoor', 'Fitness', 'Sports Wear'],
  'groceries': ['Fresh', 'Dairy', 'Snacks', 'Beverages'],
  'books': ['Fiction', 'Non-Fiction', 'Academic', 'Comics'],
  'toys': ['Games', 'Dolls', 'Blocks', 'Outdoor'],
};

export function MobileCategoriesPage() {
  const navigate = useNavigate();
  const { data: dbCategories, isLoading } = useCategories();

  const categories = dbCategories && dbCategories.length > 0
    ? dbCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug, image: c.image_url }))
    : mockCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug, image: c.image }));

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-background pb-20">
      <MobileHeader title="All Categories" showBack />

      {/* Categories List */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white p-4 rounded-xl shadow-sm border border-border/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary" />
                  <div className="h-5 w-32 bg-secondary rounded" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="aspect-square bg-secondary/50 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category, index) => {
              const Icon = categoryIcons[category.slug] || Smartphone;
              const subs = subCategories[category.slug] || ['Item 1', 'Item 2', 'Item 3'];

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white dark:bg-card p-4 rounded-2xl shadow-sm border border-border/5 border-b-2 border-b-primary/5"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${categoryColors[index % categoryColors.length]} flex items-center justify-center shadow-lg shadow-black/5 ring-4 ring-white`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <Link
                        to={`/category/${category.slug}`}
                        className="font-black text-foreground text-sm uppercase tracking-tight"
                      >
                        {category.name}
                      </Link>
                    </div>
                    <Link to={`/category/${category.slug}`} className="text-[10px] font-bold text-primary bg-primary/5 px-2.5 py-1.5 rounded-full hover:bg-primary/10 transition-colors">
                      VIEW ALL
                    </Link>
                  </div>

                  {/* Subcategories Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {subs.slice(0, 3).map((sub, subIndex) => (
                      <Link
                        key={sub}
                        to={`/category/${category.slug}?sub=${sub.toLowerCase()}`}
                        className="flex flex-col items-center group"
                      >
                        <div className="w-full aspect-square rounded-xl bg-secondary/30 dark:bg-card mb-2 flex items-center justify-center border border-border/10 group-active:scale-95 transition-transform overflow-hidden relative">
                          {/* Placeholder icon animation or decoration */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-3xl filter grayscale-[0.5] group-hover:grayscale-0 transition-all">
                            {['👔', '👕', '👖', '👗', '👜', '🕶️', '⌚'][subIndex % 7]}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors text-center line-clamp-1">{sub}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
