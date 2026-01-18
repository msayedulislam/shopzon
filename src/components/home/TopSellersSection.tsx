import { motion } from 'framer-motion';
import { Store, Star, ShieldCheck, ArrowRight, Crown, Package, TrendingUp, Award, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const topSellers = [
  {
    id: '1',
    name: 'Shopzon Official',
    slug: 'shopzon-official',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=300&fit=crop',
    rating: 4.9,
    productCount: 520,
    totalSales: 15200,
    verified: true,
    level: 'gold' as const,
    category: 'Electronics & Gadgets',
    followers: '12.5K',
  },
  {
    id: '2',
    name: 'Fashion Hub BD',
    slug: 'fashion-hub-bd',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=300&fit=crop',
    rating: 4.8,
    productCount: 380,
    totalSales: 12500,
    verified: true,
    level: 'gold' as const,
    category: 'Fashion & Clothing',
    followers: '9.8K',
  },
  {
    id: '3',
    name: 'Tech World',
    slug: 'tech-world',
    logo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=300&fit=crop',
    rating: 4.7,
    productCount: 290,
    totalSales: 9800,
    verified: true,
    level: 'silver' as const,
    category: 'Computers & Laptops',
    followers: '7.2K',
  },
  {
    id: '4',
    name: 'Beauty Palace',
    slug: 'beauty-palace',
    logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=300&fit=crop',
    rating: 4.8,
    productCount: 450,
    totalSales: 11300,
    verified: true,
    level: 'gold' as const,
    category: 'Beauty & Cosmetics',
    followers: '11.3K',
  },
];

const getLevelStyles = (level: 'bronze' | 'silver' | 'gold') => {
  switch (level) {
    case 'gold':
      return {
        bg: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
        text: 'text-amber-900',
        glow: 'shadow-amber-400/30',
        border: 'border-amber-400/50',
      };
    case 'silver':
      return {
        bg: 'bg-gradient-to-r from-slate-300 via-slate-200 to-slate-400',
        text: 'text-slate-800',
        glow: 'shadow-slate-400/30',
        border: 'border-slate-300/50',
      };
    default:
      return {
        bg: 'bg-gradient-to-r from-orange-300 via-orange-200 to-orange-400',
        text: 'text-orange-900',
        glow: 'shadow-orange-400/30',
        border: 'border-orange-300/50',
      };
  }
};

export function TopSellersSection() {
  return (
    <section className="py-12 lg:py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-semibold mb-4"
          >
            <Award className="h-4 w-4" />
            <span>Verified Merchants</span>
            <Sparkles className="h-4 w-4" />
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Top <span className="bg-gradient-to-r from-primary via-rose-500 to-amber-500 bg-clip-text text-transparent">Sellers</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Shop with confidence from our most trusted and highest-rated merchants
          </p>
        </motion.div>

        {/* Sellers Grid - New Card Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {topSellers.map((seller, index) => {
            const levelStyles = getLevelStyles(seller.level);
            return (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={`/seller/${seller.slug}`}
                  className="group relative block rounded-2xl sm:rounded-3xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
                >
                  {/* Cover Image */}
                  <div className="relative h-24 sm:h-28 overflow-hidden">
                    <img 
                      src={seller.coverImage} 
                      alt={seller.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    
                    {/* Level Badge */}
                    <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ${levelStyles.bg} ${levelStyles.text} text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-lg ${levelStyles.glow}`}>
                      <Crown className="h-3 w-3" />
                      {seller.level.charAt(0).toUpperCase() + seller.level.slice(1)}
                    </div>
                  </div>

                  {/* Logo - Overlapping */}
                  <div className="relative px-4 -mt-10 sm:-mt-12">
                    <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden bg-card border-4 border-card shadow-xl ${seller.verified ? 'ring-2 ring-blue-500/50' : ''}`}>
                      <img 
                        src={seller.logo} 
                        alt={seller.name}
                        className="w-full h-full object-cover"
                      />
                      {seller.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-card">
                          <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 pt-3">
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {seller.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 line-clamp-1">{seller.category}</p>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-muted/50">
                        <div className="flex items-center justify-center gap-0.5 text-amber-500 mb-0.5">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs sm:text-sm font-bold text-foreground">{seller.rating}</span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground">Rating</span>
                      </div>
                      <div className="text-center p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-muted/50">
                        <div className="text-xs sm:text-sm font-bold text-foreground mb-0.5">{seller.productCount}</div>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground">Products</span>
                      </div>
                      <div className="text-center p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-muted/50">
                        <div className="text-xs sm:text-sm font-bold text-foreground mb-0.5">{seller.followers}</div>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground">Followers</span>
                      </div>
                    </div>

                    {/* Sales Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="text-[10px] sm:text-xs font-medium">{seller.totalSales.toLocaleString()} sales</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary text-[10px] sm:text-xs font-semibold group-hover:gap-2 transition-all">
                        Visit Store
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 md:mt-12"
        >
          <Link 
            to="/sellers"
            className="group inline-flex items-center gap-3 px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-rose-600 text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300"
          >
            <Store className="h-4 w-4 sm:h-5 sm:w-5" />
            Explore All Sellers
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
