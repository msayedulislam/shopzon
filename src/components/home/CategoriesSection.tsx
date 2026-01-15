import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/data/mockData';

export function CategoriesSection() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Shop by Category
            </h2>
            <p className="text-muted-foreground mt-1">
              Find what you're looking for
            </p>
          </div>
          <Link
            to="/categories"
            className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="category-card animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                {category.icon}
              </div>
              <span className="font-medium text-sm text-center">{category.name}</span>
              <span className="text-xs text-muted-foreground">
                {category.productCount} items
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
