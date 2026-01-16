import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const banners = [
  {
    slug: 'electronics',
    title: 'Electronics',
    subtitle: 'Up to 40% Off',
    emoji: '📱',
    gradient: 'from-blue-600 to-cyan-500',
    bgGradient: 'from-blue-600/15 to-cyan-500/15',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20',
  },
  {
    slug: 'fashion',
    title: 'Fashion Week',
    subtitle: 'New Collection',
    emoji: '👗',
    gradient: 'from-pink-600 to-rose-500',
    bgGradient: 'from-pink-600/15 to-rose-500/15',
    borderColor: 'border-pink-500/30',
    glowColor: 'shadow-pink-500/20',
  },
  {
    slug: 'home-living',
    title: 'Home Essentials',
    subtitle: 'Free Delivery',
    emoji: '🏠',
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/15 to-orange-500/15',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/20',
  },
];

export function PromoBanners() {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <motion.div
              key={banner.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              <Link
                to={`/category/${banner.slug}`}
                className={`group relative overflow-hidden rounded-3xl min-h-[300px] flex flex-col bg-gradient-to-br ${banner.bgGradient} backdrop-blur-sm border ${banner.borderColor} transition-all duration-500 hover:shadow-2xl ${banner.glowColor} hover:-translate-y-2`}
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Animated border glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} opacity-20 blur-xl`} />
                </div>
                
                {/* Content */}
                <div className="relative z-10 p-8 h-full flex flex-col justify-between flex-1">
                  <div>
                    {/* Badge */}
                    <span className={`inline-block px-4 py-1.5 rounded-full bg-gradient-to-r ${banner.gradient} text-white text-sm font-semibold mb-5 shadow-lg`}>
                      {banner.subtitle}
                    </span>
                    
                    {/* Title */}
                    <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {banner.title}
                    </h3>
                    
                    {/* CTA */}
                    <div className={`inline-flex items-center gap-2 font-semibold bg-gradient-to-r ${banner.gradient} bg-clip-text text-transparent group-hover:gap-4 transition-all duration-300`}>
                      <span>Shop Now</span>
                      <ArrowRight className={`h-5 w-5 text-current`} style={{ color: index === 0 ? '#3b82f6' : index === 1 ? '#ec4899' : '#f59e0b' }} />
                    </div>
                  </div>
                  
                  {/* Floating Emoji */}
                  <motion.div 
                    className="absolute right-6 bottom-6 text-8xl opacity-30 group-hover:opacity-50 transition-all duration-500"
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                    whileHover={{ scale: 1.2, rotate: 15 }}
                  >
                    {banner.emoji}
                  </motion.div>
                </div>

                {/* Premium Shimmer Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                
                {/* Corner accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${banner.gradient} opacity-10 rounded-bl-full`} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}