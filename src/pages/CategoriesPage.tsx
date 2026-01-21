import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCategories } from '@/hooks/useProducts';
import { categories as mockCategories } from '@/data/mockData';
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Dumbbell, 
  Sparkles, 
  Car, 
  Baby, 
  BookOpen,
  Watch,
  Laptop,
  Camera,
  Headphones,
  Gamepad2,
  Gift,
  Utensils,
  Flower2,
  PawPrint,
  Wrench,
  Palette,
  Music,
  Plane,
  Heart,
  ShoppingBag,
  Grid3X3,
  ArrowRight
} from 'lucide-react';

// Icon mapping for categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  electronics: Smartphone,
  fashion: Shirt,
  'home-living': Home,
  sports: Dumbbell,
  beauty: Sparkles,
  automotive: Car,
  'baby-kids': Baby,
  books: BookOpen,
  watches: Watch,
  computers: Laptop,
  cameras: Camera,
  audio: Headphones,
  gaming: Gamepad2,
  gifts: Gift,
  'food-grocery': Utensils,
  garden: Flower2,
  pets: PawPrint,
  tools: Wrench,
  art: Palette,
  music: Music,
  travel: Plane,
  health: Heart,
  default: ShoppingBag
};

// Color gradients for categories
const colorGradients = [
  'from-blue-500 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-green-500 to-emerald-500',
  'from-purple-500 to-pink-500',
  'from-slate-500 to-gray-600',
  'from-sky-400 to-blue-500',
  'from-indigo-500 to-violet-500',
  'from-red-500 to-rose-500',
  'from-teal-500 to-cyan-500',
  'from-yellow-500 to-amber-500',
  'from-fuchsia-500 to-purple-500',
];

const getIconForCategory = (slug: string) => {
  return iconMap[slug] || iconMap.default;
};

const getGradientForIndex = (index: number) => {
  return colorGradients[index % colorGradients.length];
};

export default function CategoriesPage() {
  const { data: dbCategories, isLoading } = useCategories();
  
  const categories = dbCategories && dbCategories.length > 0 
    ? dbCategories.map(c => ({ 
        id: c.id, 
        name: c.name, 
        slug: c.slug, 
        icon: c.icon || '📦', 
        productCount: 0,
        image_url: c.image_url 
      }))
    : mockCategories.map(c => ({ ...c, image_url: null }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]" />
          </div>
          
          <div className="container relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-muted-foreground mb-6">
                <Grid3X3 className="h-4 w-4 text-primary" />
                <span>Browse All Categories</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Explore Our <span className="text-gradient">Categories</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover thousands of products across {categories.length} categories. Find exactly what you're looking for.
              </p>
            </motion.div>

            {/* Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-3xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              /* Categories Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
                {categories.map((category, index) => {
                  const IconComponent = getIconForCategory(category.slug);
                  const gradient = getGradientForIndex(index);
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link
                        to={`/category/${category.slug}`}
                        className="group relative flex flex-col items-center justify-center aspect-square rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                      >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
                        
                        {/* Overlay Pattern */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center p-4 text-center">
                          {/* Icon */}
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                            <IconComponent className="h-8 w-8 md:h-10 md:w-10 text-white" />
                          </div>
                          
                          {/* Category Name */}
                          <h3 className="font-bold text-sm md:text-base text-white drop-shadow-lg line-clamp-2">
                            {category.name}
                          </h3>
                          
                          {/* Arrow on Hover */}
                          <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <ArrowRight className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        
                        {/* Bottom Glow */}
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
