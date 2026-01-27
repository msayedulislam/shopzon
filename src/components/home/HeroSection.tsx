import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Sparkles, Star, ShoppingBag, Truck, Shield, Gift, TrendingUp, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Animated Gradient Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 dark:bg-primary/15 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/15 dark:bg-accent/10 blur-[100px]" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gradient-radial from-primary/10 via-transparent to-transparent" 
        />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Floating Particles */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-2 h-2 rounded-full bg-primary/60"
        />
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-40 right-40 w-3 h-3 rounded-full bg-accent/50"
        />
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-40 left-1/3 w-2 h-2 rounded-full bg-primary/60"
        />
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-accent/40"
        />
      </div>

      <div className="container relative" style={{ zIndex: 1 }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[90vh] py-16 lg:py-24">
          {/* Content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-primary text-primary text-sm font-semibold mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              <span>Up to 70% Off on Premium Products</span>
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Zap className="h-4 w-4" />
              </motion.div>
            </motion.div>
            
            {/* Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-foreground inline-block"
              >
                Shop
              </motion.span>
              <br />
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-gradient inline-block"
              >
                Premium
              </motion.span>
              <br />
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-foreground inline-block"
              >
                Quality
              </motion.span>
            </motion.h1>
            
            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Discover an exclusive collection of premium products from verified sellers. Experience luxury at unbeatable prices.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/products">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="btn-hero w-full sm:w-auto group">
                    <ShoppingBag className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    <span>Explore Now</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/flash-sale">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="btn-hero-outline w-full sm:w-auto group">
                    <Zap className="h-5 w-5 text-primary animate-pulse" />
                    <span>Flash Deals</span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-8 justify-center lg:justify-start mt-14"
            >
              {[
                { value: '50K+', label: 'Products', icon: ShoppingBag },
                { value: '10K+', label: 'Sellers', icon: Award },
                { value: '500K+', label: 'Customers', icon: Users },
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label} 
                  className="text-center relative group"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {index > 0 && (
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                  )}
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Main Product Image */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-[420px] h-[420px] glass-card rounded-[3rem] overflow-hidden"
            >
              <img 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
                alt="Premium Watch"
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="absolute top-4 left-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center gap-2"
              >
                <Star className="h-4 w-4 rating-star fill-current" />
                Bestseller
              </motion.div>
              
              {/* Product Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-0 left-0 right-0 p-6"
              >
                <p className="text-white font-bold text-xl">Premium Collection</p>
                <div className="flex items-center gap-2 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 rating-star fill-current" />
                  ))}
                  <span className="text-white/80 text-sm ml-1">(4.9)</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Floating Product Cards */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="absolute -top-4 -left-4 w-32 h-32 glass-card rounded-3xl overflow-hidden shadow-glow animate-float"
            >
              <img 
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
                alt="Headphones"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <motion.div
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Truck className="h-8 w-8 text-white" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="absolute -bottom-8 -right-8 w-28 h-28 glass-primary rounded-2xl overflow-hidden animate-float"
              style={{ animationDelay: '1s' }}
            >
              <img 
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
                alt="Sneakers"
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="absolute top-1/2 -right-16 w-24 h-24 rounded-2xl overflow-hidden glass-card animate-float"
              style={{ animationDelay: '2s' }}
            >
              <img 
                src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80"
                alt="Camera"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Gift className="h-6 w-6 text-white" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, type: "spring" }}
              className="absolute -top-10 right-20 w-20 h-20 glass-card rounded-xl overflow-hidden animate-float"
              style={{ animationDelay: '1.5s' }}
            >
              <img 
                src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80"
                alt="Perfume"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </motion.div>

            {/* Trending Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
              className="absolute bottom-20 -left-12 glass-card px-4 py-3 rounded-2xl flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Trending Now</p>
                <p className="text-xs text-muted-foreground">+24% this week</p>
              </div>
            </motion.div>

            {/* Orbiting Rings */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-primary/10 dark:border-primary/10" 
              style={{ margin: '-40px' }} 
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-accent/10 dark:border-accent/10" 
              style={{ margin: '-80px' }} 
            />
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}