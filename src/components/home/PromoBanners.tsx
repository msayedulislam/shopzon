import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const banners = [
  {
    slug: 'electronics',
    title: 'Electronics',
    subtitle: 'Up to 40% Off',
    emoji: '📱',
    gradient: 'from-blue-600/40 to-cyan-600/40',
    glowColor: 'rgba(59, 130, 246, 0.3)',
  },
  {
    slug: 'fashion',
    title: 'Fashion Week',
    subtitle: 'New Collection',
    emoji: '👗',
    gradient: 'from-pink-600/40 to-rose-600/40',
    glowColor: 'rgba(236, 72, 153, 0.3)',
  },
  {
    slug: 'home-living',
    title: 'Home Essentials',
    subtitle: 'Free Delivery',
    emoji: '🏠',
    gradient: 'from-amber-500/40 to-orange-500/40',
    glowColor: 'rgba(245, 158, 11, 0.3)',
  },
];

export function PromoBanners() {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <Link
              key={banner.slug}
              to={`/category/${banner.slug}`}
              className="group relative overflow-hidden rounded-3xl min-h-[280px] glass-card transition-all duration-500 hover:scale-[1.02] animate-slide-up"
              style={{ 
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} opacity-80`} />
              
              {/* Animated Glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 60px ${banner.glowColor}` }}
              />
              
              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                <div>
                  <span className="inline-block px-4 py-1.5 rounded-full glass text-foreground/80 text-sm font-medium mb-4">
                    {banner.subtitle}
                  </span>
                  <h3 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {banner.title}
                  </h3>
                  <div className="inline-flex items-center gap-2 text-foreground font-semibold group-hover:gap-4 transition-all duration-300">
                    <span>Shop Now</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
                
                {/* Floating Emoji */}
                <div className="absolute right-8 bottom-8 text-8xl opacity-40 group-hover:opacity-60 group-hover:scale-125 transition-all duration-500 group-hover:rotate-12">
                  {banner.emoji}
                </div>
              </div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}