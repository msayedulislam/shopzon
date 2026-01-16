import { motion } from 'framer-motion';
import { Handshake } from 'lucide-react';

const brands = [
  {
    id: '1',
    name: 'Samsung',
    logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=100&fit=crop',
  },
  {
    id: '2',
    name: 'Apple',
    logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&h=100&fit=crop',
  },
  {
    id: '3',
    name: 'Nike',
    logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=100&fit=crop',
  },
  {
    id: '4',
    name: 'Adidas',
    logo: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=100&fit=crop',
  },
  {
    id: '5',
    name: 'Sony',
    logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=100&fit=crop',
  },
  {
    id: '6',
    name: 'LG',
    logo: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=200&h=100&fit=crop',
  },
  {
    id: '7',
    name: 'Xiaomi',
    logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&h=100&fit=crop',
  },
  {
    id: '8',
    name: 'Puma',
    logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200&h=100&fit=crop',
  },
  {
    id: '9',
    name: 'L\'Oreal',
    logo: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=100&fit=crop',
  },
  {
    id: '10',
    name: 'JBL',
    logo: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=100&fit=crop',
  },
];

export function BrandLogosSection() {
  return (
    <section className="py-12 lg:py-16 bg-muted/30 overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            <Handshake className="h-4 w-4" />
            Trusted Partners
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Our Brand Partners
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            We collaborate with world-renowned brands to bring you authentic products
          </p>
        </motion.div>
      </div>

      {/* Infinite Scroll Carousel */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-muted/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-muted/80 to-transparent z-10 pointer-events-none" />

        {/* Scrolling Container */}
        <div className="flex animate-scroll">
          {/* First set */}
          <div className="flex gap-8 md:gap-12 items-center px-4">
            {brands.map((brand) => (
              <motion.div
                key={brand.id}
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 group"
              >
                <div className="w-28 h-20 md:w-36 md:h-24 rounded-2xl bg-card border border-border p-4 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </motion.div>
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex gap-8 md:gap-12 items-center px-4">
            {brands.map((brand) => (
              <motion.div
                key={`dup-${brand.id}`}
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 group"
              >
                <div className="w-28 h-20 md:w-36 md:h-24 rounded-2xl bg-card border border-border p-4 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
