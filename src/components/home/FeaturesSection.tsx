import { Truck, Shield, Headphones, CreditCard, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Express Delivery',
    description: 'Same day delivery in major cities',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Shield,
    title: '100% Authentic',
    description: 'Genuine products guaranteed',
    gradient: 'from-emerald-500/20 to-green-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: "We're here to help anytime",
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Multiple payment options',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
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
            <Sparkles className="h-4 w-4 text-primary" />
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
              className="group glass-card rounded-3xl p-8 transition-all duration-500 hover:scale-105 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon Container */}
              <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
              </div>
              
              {/* Content */}
              <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}