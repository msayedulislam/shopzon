import { motion } from 'framer-motion';
import { Truck, Shield, Headphones, CreditCard, Gift, RotateCcw } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free delivery on orders over ৳1000',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Shield,
    title: '100% Authentic',
    description: 'Genuine products guaranteed',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: "We're always here to help",
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Multiple payment options',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Gift,
    title: 'Special Offers',
    description: 'Exclusive deals & discounts',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '7-day return policy',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
];

export function MarketingFeatures() {
  return (
    <section className="py-12 lg:py-16 border-y border-border/50 bg-secondary/30">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group text-center"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bgColor} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-7 w-7 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
