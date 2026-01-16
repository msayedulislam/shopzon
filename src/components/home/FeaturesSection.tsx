import { Truck, Shield, Headphones, CreditCard, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Express Delivery',
    description: 'Same day delivery in major cities',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&q=80',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Shield,
    title: '100% Authentic',
    description: 'Genuine products guaranteed',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
    gradient: 'from-emerald-500/20 to-green-500/20',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: "We're here to help anytime",
    image: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=400&q=80',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Multiple payment options',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px]" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-muted-foreground mb-4">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Premium Shopping <span className="text-gradient">Experience</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group glass-card rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 animate-slide-up hover:shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-32 overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-b ${feature.gradient} to-background opacity-60`} />
                
                {/* Animated Icon Overlay */}
                <div className={`absolute top-4 right-4 w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center backdrop-blur-sm`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor} group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`} />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
