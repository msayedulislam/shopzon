import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/data/mockData';
import { Button } from '@/components/ui/button';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    images: string[];
    rating?: number;
}

interface GovalyProductCardProps {
    product: Product;
    index?: number;
}

export function GovalyProductCard({ product, index = 0 }: GovalyProductCardProps) {
    const discountPercent = product.discount ||
        (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.02, duration: 0.2 }}
        >
            <Link
                to={`/product/${product.slug}`}
                className="group block bg-white dark:bg-card border border-border/50 rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200"
            >
                {/* Image Container */}
                <div className="relative aspect-square bg-secondary/30 overflow-hidden">
                    <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                        <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded">
                            -{discountPercent}%
                        </div>
                    )}

                    {/* Wishlist Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 bg-white/90 hover:bg-white dark:bg-card/90 dark:hover:bg-card opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.preventDefault();
                            // Add to wishlist logic
                        }}
                    >
                        <Heart className="h-3.5 w-3.5" />
                    </Button>
                </div>

                {/* Product Info */}
                <div className="p-2.5">
                    {/* Product Name */}
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-1.5 min-h-[2.5rem]">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-primary">
                            {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Rating */}
                    {product.rating && product.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`text-xs ${i < Math.floor(product.rating || 0) ? 'text-warning' : 'text-muted/30'}`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                ({product.rating.toFixed(1)})
                            </span>
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
