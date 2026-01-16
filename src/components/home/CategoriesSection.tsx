import { Link } from 'react-router-dom';
import { ArrowRight, Grid3X3, Smartphone, Shirt, Home, Dumbbell, Sparkles as SparklesIcon, Car, Baby, Book } from 'lucide-react';

const categoryData = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    icon: Smartphone,
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80',
    productCount: 1250,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    icon: Shirt,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
    productCount: 2340,
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: '3',
    name: 'Home & Living',
    slug: 'home-living',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80',
    productCount: 890,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: '4',
    name: 'Sports',
    slug: 'sports',
    icon: Dumbbell,
    image: 'https://images.unsplash.com/photo-1461896836934- voices-people?w=400&q=80',
    productCount: 567,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: '5',
    name: 'Beauty',
    slug: 'beauty',
    icon: SparklesIcon,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',
    productCount: 1120,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: '6',
    name: 'Automotive',
    slug: 'automotive',
    icon: Car,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80',
    productCount: 345,
    color: 'from-slate-500 to-gray-600',
  },
  {
    id: '7',
    name: 'Baby & Kids',
    slug: 'baby-kids',
    icon: Baby,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80',
    productCount: 678,
    color: 'from-sky-400 to-blue-500',
  },
  {
    id: '8',
    name: 'Books',
    slug: 'books',
    icon: Book,
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80',
    productCount: 2100,
    color: 'from-indigo-500 to-violet-500',
  },
];

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
          <div className="animate-slide-up">
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
          </div>
          <Link
            to="/categories"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full glass-primary text-primary font-semibold transition-all duration-300 hover:gap-4 animate-slide-in-right"
          >
            View All Categories
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-6">
          {categoryData.map((category, index) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-3xl aspect-square animate-slide-up transition-all duration-500 hover:scale-105"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background Image */}
              <img 
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-75 transition-opacity duration-300`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                {/* Animated Icon */}
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <category.icon className="h-7 w-7 text-white" />
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
              
              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
