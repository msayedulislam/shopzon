import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/15 blur-[100px] animate-glow-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[150px]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Floating Particles */}
        <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-primary animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-40 w-3 h-3 rounded-full bg-accent animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/3 w-2 h-2 rounded-full bg-primary/60 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-accent/40 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[90vh] py-16 lg:py-24">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-primary text-primary text-sm font-semibold mb-8 animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>Up to 70% Off on Premium Products</span>
              <Zap className="h-4 w-4" />
            </div>
            
            {/* Heading */}
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 animate-slide-up"
              style={{ animationDelay: '0.2s', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="text-foreground">Shop</span>
              <br />
              <span className="text-gradient">Premium</span>
              <br />
              <span className="text-foreground">Quality</span>
            </h1>
            
            {/* Description */}
            <p 
              className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              Discover an exclusive collection of premium products from verified sellers. Experience luxury at unbeatable prices.
            </p>

            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up"
              style={{ animationDelay: '0.4s' }}
            >
              <Link to="/products">
                <Button className="btn-hero w-full sm:w-auto group">
                  <span>Explore Now</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/flash-sale">
                <Button className="btn-hero-outline w-full sm:w-auto group">
                  <span className="mr-2">🔥</span>
                  <span>Flash Deals</span>
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div 
              className="flex items-center gap-8 justify-center lg:justify-start mt-14 animate-slide-up"
              style={{ animationDelay: '0.5s' }}
            >
              {[
                { value: '50K+', label: 'Products' },
                { value: '10K+', label: 'Sellers' },
                { value: '500K+', label: 'Customers' },
              ].map((stat, index) => (
                <div key={stat.label} className="text-center relative">
                  {index > 0 && (
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                  )}
                  <p className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Main Glass Card */}
            <div 
              className="relative z-10 w-96 h-96 glass-card rounded-[3rem] flex items-center justify-center animate-float"
              style={{ animationDelay: '0.3s' }}
            >
              {/* Inner Glow */}
              <div className="absolute inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
              
              {/* Center Content */}
              <div className="relative text-center">
                <span className="text-9xl filter drop-shadow-2xl">🛍️</span>
                <p className="text-foreground font-semibold mt-6 text-lg">Premium Collection</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 rating-star" />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div 
              className="absolute -top-4 -left-4 w-28 h-28 glass-card rounded-3xl flex items-center justify-center animate-float shadow-glow"
              style={{ animationDelay: '0s' }}
            >
              <span className="text-5xl">📱</span>
            </div>
            
            <div 
              className="absolute -bottom-8 -right-8 w-24 h-24 glass-primary rounded-2xl flex items-center justify-center animate-float"
              style={{ animationDelay: '1s' }}
            >
              <span className="text-4xl">👟</span>
            </div>
            
            <div 
              className="absolute top-1/2 -right-16 w-20 h-20 rounded-2xl flex items-center justify-center animate-float"
              style={{ 
                animationDelay: '2s',
                background: 'linear-gradient(135deg, hsl(45 93% 58% / 0.3), hsl(30 95% 55% / 0.3))',
                backdropFilter: 'blur(10px)',
                border: '1px solid hsl(45 93% 58% / 0.3)'
              }}
            >
              <span className="text-3xl">💄</span>
            </div>

            <div 
              className="absolute -top-10 right-20 w-16 h-16 glass-card rounded-xl flex items-center justify-center animate-float"
              style={{ animationDelay: '1.5s' }}
            >
              <span className="text-2xl">⌚</span>
            </div>

            {/* Orbiting Ring */}
            <div className="absolute inset-0 rounded-full border border-primary/10 animate-rotate-slow" style={{ margin: '-40px' }} />
            <div className="absolute inset-0 rounded-full border border-accent/10 animate-rotate-slow" style={{ margin: '-80px', animationDirection: 'reverse', animationDuration: '25s' }} />
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}