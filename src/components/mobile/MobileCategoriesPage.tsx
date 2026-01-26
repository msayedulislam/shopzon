import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useProducts';
import { categories as mockCategories } from '@/data/mockData';
import { Shirt, Baby, Home, Dumbbell, ShoppingBasket, BookOpen, Gift, Smartphone } from 'lucide-react';
import { MobileBottomNav } from './MobileBottomNav';

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
    ? dbCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))
    : mockCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug }));

  return (
    <div className="min-h-screen bg-white dark:bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">All Categories</h1>
          <div className="flex items-center gap-1">
            <button className="p-2"><Search className="h-5 w-5 text-muted-foreground" /></button>
            <button className="p-2 relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Categories List */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-secondary" />
                  <div className="h-4 w-24 bg-secondary rounded" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="aspect-square bg-secondary rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category, index) => {
              const Icon = categoryIcons[category.slug] || Smartphone;
              const subs = subCategories[category.slug] || ['Item 1', 'Item 2', 'Item 3'];
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${categoryColors[index % categoryColors.length]} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <Link 
                      to={`/category/${category.slug}`}
                      className="font-semibold text-foreground"
                    >
                      {category.name}
                    </Link>
                  </div>
                  
                  {/* Subcategories Grid */}
                  <div className="grid grid-cols-3 gap-3 ml-15">
                    {subs.slice(0, 3).map((sub, subIndex) => (
                      <Link
                        key={sub}
                        to={`/category/${category.slug}?sub=${sub.toLowerCase()}`}
                        className="bg-secondary/40 dark:bg-secondary/20 rounded-xl p-3 text-center"
                      >
                        <div className="aspect-square rounded-lg bg-white dark:bg-card mb-2 flex items-center justify-center">
                          <span className="text-2xl">
                            {['👔', '👕', '👖', '👗'][subIndex % 4]}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-foreground">{sub}</span>
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
