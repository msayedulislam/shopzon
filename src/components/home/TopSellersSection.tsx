import { motion } from 'framer-motion';
import { Store, Star, ShieldCheck, ArrowRight, Crown, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const topSellers = [
  {
    id: '1',
    name: 'BD Mart Official',
    slug: 'bd-mart-official',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop',
    rating: 4.9,
    productCount: 520,
    totalSales: 15200,
    verified: true,
    level: 'gold' as const,
    category: 'Electronics & Gadgets',
  },
  {
    id: '2',
    name: 'Fashion Hub BD',
    slug: 'fashion-hub-bd',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
    rating: 4.8,
    productCount: 380,
    totalSales: 12500,
    verified: true,
    level: 'gold' as const,
    category: 'Fashion & Clothing',
  },
  {
    id: '3',
    name: 'Tech World',
    slug: 'tech-world',
    logo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop',
    rating: 4.7,
    productCount: 290,
    totalSales: 9800,
    verified: true,
    level: 'silver' as const,
    category: 'Computers & Laptops',
  },
  {
    id: '4',
    name: 'Beauty Palace',
    slug: 'beauty-palace',
    logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop',
    rating: 4.8,
    productCount: 450,
    totalSales: 11300,
    verified: true,
    level: 'gold' as const,
    category: 'Beauty & Cosmetics',
  },
  {
    id: '5',
    name: 'Sports Zone',
    slug: 'sports-zone',
    logo: 'https://images.unsplash.com/photo-1461896836934- voices?w=200&h=200&fit=crop',
    rating: 4.6,
    productCount: 210,
    totalSales: 7600,
    verified: true,
    level: 'silver' as const,
    category: 'Sports & Fitness',
  },
  {
    id: '6',
    name: 'Home Decor Plus',
    slug: 'home-decor-plus',
    logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
    rating: 4.7,
    productCount: 340,
    totalSales: 8900,
    verified: true,
    level: 'silver' as const,
    category: 'Home & Living',
  },
];

const getLevelColor = (level: 'bronze' | 'silver' | 'gold') => {
  switch (level) {
    case 'gold':
      return 'from-amber-400 to-yellow-500 text-amber-900';
    case 'silver':
      return 'from-slate-300 to-slate-400 text-slate-800';
    default:
      return 'from-orange-300 to-orange-400 text-orange-800';
  }
};

export function TopSellersSection() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Crown className="h-4 w-4" />
                Top Rated
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Store className="h-7 w-7 text-primary" />
              Top Sellers
            </h2>
            <p className="text-muted-foreground mt-1">Trusted sellers with excellent ratings</p>
          </div>
          
          <Link 
            to="/sellers"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View All Sellers
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Sellers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {topSellers.map((seller, index) => (
            <motion.div
              key={seller.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                to={`/seller/${seller.slug}`}
                className="group relative flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                {/* Seller Logo */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
                    <img 
                      src={seller.logo} 
                      alt={seller.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {seller.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <ShieldCheck className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Seller Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {seller.name}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${getLevelColor(seller.level)}`}>
                      <Crown className="h-3 w-3" />
                      {seller.level.charAt(0).toUpperCase() + seller.level.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 truncate">{seller.category}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-medium text-foreground">{seller.rating}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-3.5 w-3.5" />
                      {seller.productCount} Products
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      {seller.totalSales.toLocaleString()} Sales
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
