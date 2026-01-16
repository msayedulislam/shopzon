import { Link } from 'react-router-dom';
import { ArrowRight, Grid3X3 } from 'lucide-react';
import { categories } from '@/data/mockData';

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
              <Grid3X3 className="h-4 w-4 text-primary" />
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
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="category-card group animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon Container */}
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-all duration-500">
                {category.icon}
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Category Name */}
              <span className="font-semibold text-sm text-center text-foreground group-hover:text-primary transition-colors duration-300">
                {category.name}
              </span>
              
              {/* Product Count */}
              <span className="text-xs text-muted-foreground px-3 py-1 rounded-full glass-card">
                {category.productCount} items
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}