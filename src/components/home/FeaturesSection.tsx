import { Truck, Shield, Headphones, CreditCard } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Same day delivery in Dhaka',
  },
  {
    icon: Shield,
    title: '100% Authentic',
    description: 'Genuine products guaranteed',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'We\'re here to help anytime',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Multiple payment options',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-12 bg-secondary/50">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-card shadow-sm animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
