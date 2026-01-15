import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[500px] py-12 lg:py-20">
          {/* Content */}
          <div className="text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Up to 70% Off on Electronics
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
              Shop Smart,
              <br />
              <span className="text-accent">Save Big</span>
            </h1>
            
            <p className="text-lg text-white/80 mb-8 max-w-lg mx-auto lg:mx-0">
              Discover amazing deals on thousands of products from verified sellers across Bangladesh. Quality guaranteed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/products">
                <Button className="btn-hero w-full sm:w-auto">
                  Shop Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/flash-sale">
                <Button className="btn-hero-outline w-full sm:w-auto">
                  🔥 Flash Sale
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 justify-center lg:justify-start mt-10">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">50K+</p>
                <p className="text-sm text-white/70">Products</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">10K+</p>
                <p className="text-sm text-white/70">Sellers</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">500K+</p>
                <p className="text-sm text-white/70">Customers</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative z-10 animate-float">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent rounded-2xl flex items-center justify-center text-4xl shadow-accent animate-bounce-subtle">
                📱
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                👟
              </div>
              <div className="absolute top-1/2 -right-8 w-16 h-16 bg-warning rounded-xl flex items-center justify-center text-2xl shadow-lg">
                💄
              </div>
              <div className="w-80 h-80 mx-auto bg-white/10 backdrop-blur-lg rounded-3xl flex items-center justify-center">
                <div className="text-center">
                  <span className="text-8xl">🛍️</span>
                  <p className="text-white font-semibold mt-4">Your One-Stop Shop</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
