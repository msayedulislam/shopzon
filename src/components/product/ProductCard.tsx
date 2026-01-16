import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  if (variant === 'horizontal') {
    return (
      <Link to={`/product/${product.slug}`} className="card-product flex gap-4 p-4">
        <div className="relative w-32 h-32 shrink-0">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover rounded-2xl"
          />
          {product.discount && (
            <span className="badge-sale absolute top-2 left-2">-{product.discount}%</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{product.shortDescription}</p>
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-4 w-4 rating-star" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="price-current text-lg">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="price-original text-sm">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product.slug}`} className="card-product group block">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-3xl">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.discount && (
            <span className="badge-sale animate-pulse">-{product.discount}%</span>
          )}
          {product.isFlashSale && (
            <span className="badge-hot flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Flash
            </span>
          )}
          {product.freeDelivery && (
            <Badge variant="secondary" className="text-xs glass px-3 py-1">
              Free Delivery
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
          <Button
            size="icon"
            className="h-10 w-10 rounded-2xl glass hover:bg-primary/20 transition-all duration-300"
            onClick={handleWishlist}
          >
            <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-primary text-primary' : 'text-foreground'}`} />
          </Button>
          <Button
            size="icon"
            className="h-10 w-10 rounded-2xl glass hover:bg-primary/20 transition-all duration-300"
          >
            <Eye className="h-4 w-4 text-foreground" />
          </Button>
        </div>

        {/* Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-all duration-500">
          <Button
            onClick={handleAddToCart}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-primary uppercase tracking-wider font-semibold mb-2">
            {product.brand.name}
          </p>
        )}

        {/* Name */}
        <h3 className="font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'rating-star'
                    : 'text-muted/30'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            {product.sold} sold
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="price-original">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}