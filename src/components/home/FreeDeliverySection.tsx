import { motion } from 'framer-motion';
import { Truck, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GovalyProductCard } from '@/components/product/GovalyProductCard';
import { useFreeDeliveryProducts, toDisplayProduct } from '@/hooks/useProducts';
import { getFreeDeliveryProducts } from '@/data/mockData';

export function FreeDeliverySection() {
  const { data: dbProducts, isLoading } = useFreeDeliveryProducts(4);

  // Use database products if available, otherwise fall back to mock data
  const freeDeliveryProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getFreeDeliveryProducts().slice(0, 4);

  if (freeDeliveryProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-500/5 to-background" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4">
              <Truck className="h-4 w-4 animate-pulse" />
              <span>Free Shipping</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Free <span className="text-emerald-500">Delivery</span>
            </h2>
            <p className="text-muted-foreground mt-2">No extra cost - delivered straight to your door</p>
          </div>

          <Link
            to="/products?freeDelivery=true"
            className="group inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:gap-3 transition-all duration-300"
          >
            View All
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {freeDeliveryProducts.map((product, index) => (
              <motion.div
                key={`free-${product.id}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GovalyProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
