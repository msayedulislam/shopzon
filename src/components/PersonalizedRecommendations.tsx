import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { formatPrice } from '@/data/mockData';

interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number | null;
  rating?: number | null;
  images: { image_url: string }[];
  category?: { name: string };
}

export function PersonalizedRecommendations() {
  const { products: recentProducts } = useRecentlyViewed();
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [recentProducts]);

  const fetchRecommendations = async () => {
    try {
      // Get categories from recently viewed products
      const recentCategories = new Set<string>();
      
      if (recentProducts.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('category_id')
          .in('id', recentProducts.slice(0, 5).map(p => p.id));
        
        products?.forEach(p => {
          if (p.category_id) recentCategories.add(p.category_id);
        });
      }

      // Fetch similar products or trending if no recent views
      let query = supabase
        .from('products')
        .select(`
          id, name, slug, price, original_price, rating,
          product_images(image_url),
          categories(name)
        `)
        .eq('status', 'approved')
        .gt('stock', 0);

      if (recentCategories.size > 0 && recentProducts.length > 0) {
        // Exclude recently viewed
        query = query
          .in('category_id', Array.from(recentCategories))
          .not('id', 'in', `(${recentProducts.map(p => p.id).join(',')})`);
      } else {
        // Show trending/featured
        query = query.eq('is_featured', true);
      }

      const { data } = await query.limit(8);

      if (data) {
        setRecommendations(data.map(p => ({
          ...p,
          images: p.product_images || [],
          category: p.categories as any,
        })));
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || recommendations.length === 0) return null;

  return (
    <section className="py-6">
      <div className="container">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Recommended For You
              </CardTitle>
              <Link to="/products">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/product/${product.slug}`}
                    className="block group"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary mb-3">
                      <img
                        src={product.images[0]?.image_url || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {product.original_price && product.price < product.original_price && (
                        <Badge className="absolute top-2 left-2 bg-destructive">
                          {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      {product.category && (
                        <p className="text-xs text-muted-foreground">{product.category.name}</p>
                      )}
                      <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                          {product.original_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                        </div>
                        {product.rating && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{product.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
