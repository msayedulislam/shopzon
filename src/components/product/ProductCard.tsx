import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
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
            className="w-full h-full object-cover rounded-xl"
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
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.discount && (
            <span className="badge-sale">-{product.discount}%</span>
          )}
          {product.isFlashSale && (
            <span className="badge-hot">🔥 Flash</span>
          )}
          {product.freeDelivery && (
            <Badge variant="secondary" className="text-xs">Free Delivery</Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full shadow-md"
            onClick={handleWishlist}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-destructive text-destructive' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full shadow-md"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            onClick={handleAddToCart}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.brand.name}
          </p>
        )}

        {/* Name */}
        <h3 className="font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating)
                    ? 'rating-star'
                    : 'text-muted fill-muted'
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
        <div className="flex items-center gap-2">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="price-original">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
