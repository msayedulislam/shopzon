import { motion } from 'framer-motion';
import { Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const collections = [
  {
    id: 1,
    title: 'Summer Essentials',
    subtitle: 'Cool & Comfortable',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80',
    link: '/products?category=fashion',
    gradient: 'from-orange-500/80 to-rose-500/80',
  },
  {
    id: 2,
    title: 'Tech Gadgets',
    subtitle: 'Latest Innovation',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80',
    link: '/products?category=electronics',
    gradient: 'from-blue-500/80 to-cyan-500/80',
  },
  {
    id: 3,
    title: 'Home & Living',
    subtitle: 'Modern Lifestyle',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
    link: '/products?category=home',
    gradient: 'from-emerald-500/80 to-teal-500/80',
  },
];

export function NewCollectionSection() {
  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-muted-foreground mb-4">
            <Layers className="h-4 w-4 text-primary animate-pulse" />
            <span>Curated For You</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            New <span className="text-gradient">Collections</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Explore our handpicked collections designed for every lifestyle
          </p>
        </motion.div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Link 
                to={collection.link}
                className="group relative block h-[300px] md:h-[350px] rounded-3xl overflow-hidden"
              >
                {/* Background Image */}
                <img 
                  src={collection.image} 
                  alt={collection.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${collection.gradient} opacity-60 group-hover:opacity-70 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <span className="text-sm font-medium opacity-90 mb-1">{collection.subtitle}</span>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {collection.title}
                  </h3>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                    Shop Now
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-white/10 to-transparent" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
