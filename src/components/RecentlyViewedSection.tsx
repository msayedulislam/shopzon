import { Link } from 'react-router-dom';
import { Clock, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { formatPrice } from '@/data/mockData';

export function RecentlyViewedSection() {
  const { products, clearAll } = useRecentlyViewed();

  if (products.length === 0) return null;

  return (
    <section className="py-6">
      <div className="container">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Recently Viewed
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <AnimatePresence>
                {products.slice(0, 10).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="shrink-0"
                  >
                    <Link
                      to={`/product/${product.slug}`}
                      className="block w-32 group"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary mb-2">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-sm font-bold text-primary mt-1">
                        {formatPrice(product.price)}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
