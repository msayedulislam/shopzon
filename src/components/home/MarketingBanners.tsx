import { motion } from 'framer-motion';
import { ArrowRight, Percent, Truck, Sparkles, Gift, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const banners = [
  {
    id: 1,
    badge: 'Up to 50% Off',
    badgeColor: 'bg-blue-500 text-white',
    title: 'Electronics',
    subtitle: 'Latest gadgets & devices',
    link: '/products?category=electronics',
    gradient: 'from-blue-100 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50',
    iconBg: 'bg-blue-500/10',
    icon: '📱',
    accentColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 2,
    badge: 'New Collection',
    badgeColor: 'bg-rose-500 text-white',
    title: 'Fashion Week',
    subtitle: 'Trendy styles for everyone',
    link: '/products?category=fashion',
    gradient: 'from-rose-100 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50',
    iconBg: 'bg-rose-500/10',
    icon: '👗',
    accentColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 3,
    badge: 'Free Delivery',
    badgeColor: 'bg-amber-500 text-white',
    title: 'Home Essentials',
    subtitle: 'Make your home beautiful',
    link: '/products?category=home-living',
    gradient: 'from-amber-100 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50',
    iconBg: 'bg-amber-500/10',
    icon: '🏠',
    accentColor: 'text-amber-600 dark:text-amber-400',
  },
];

const largeBanners = [
  {
    id: 1,
    badge: 'Limited Time',
    title: 'Mega Flash Sale',
    subtitle: 'Up to 70% off on thousands of products',
    link: '/products?sale=true',
    gradient: 'from-primary/20 via-rose-500/20 to-orange-500/20',
    textGradient: 'from-primary to-rose-500',
  },
  {
    id: 2,
    badge: 'New Arrivals',
    title: 'Summer Collection 2024',
    subtitle: 'Fresh styles just dropped - be the first to shop',
    link: '/products?sort=newest',
    gradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
    textGradient: 'from-emerald-500 to-teal-500',
  },
];

export function MarketingBanners() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        {/* Small Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link 
                to={banner.link}
                className={`group relative block p-6 rounded-3xl bg-gradient-to-br ${banner.gradient} overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >
                {/* Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${banner.badgeColor} mb-4`}>
                  {banner.badge}
                </span>
                
                {/* Content */}
                <h3 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {banner.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{banner.subtitle}</p>
                
                {/* CTA */}
                <div className={`inline-flex items-center gap-2 text-sm font-semibold ${banner.accentColor} group-hover:gap-3 transition-all duration-300`}>
                  Shop Now
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Icon */}
                <div className="absolute bottom-4 right-4 text-6xl opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-300">
                  {banner.icon}
                </div>

                {/* Decorative circle */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/20 dark:bg-white/5" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Large Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {largeBanners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Link 
                to={banner.link}
                className={`group relative block p-8 rounded-3xl bg-gradient-to-br ${banner.gradient} overflow-hidden transition-all duration-300 hover:shadow-2xl`}
              >
                {/* Badge */}
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-foreground text-background mb-4">
                  {banner.badge}
                </span>
                
                {/* Content */}
                <h3 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${banner.textGradient} bg-clip-text text-transparent mb-2`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {banner.title}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm">{banner.subtitle}</p>
                
                {/* CTA */}
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-semibold group-hover:gap-3 transition-all duration-300">
                  Shop Now
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/10 dark:bg-white/5" />
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 dark:bg-white/5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
