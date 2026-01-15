import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, Minus, Plus, Check, Share2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { products, formatPrice } from '@/data/mockData';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/product/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const product = products.find((p) => p.slug === slug) || products[0];
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product.variations?.find((v) => v.type === 'color')?.value || ''
  );
  const [selectedSize, setSelectedSize] = useState(
    product.variations?.find((v) => v.type === 'size')?.value || ''
  );
  const [isWishlisted, setIsWishlisted] = useState(false);

  const colorVariations = product.variations?.filter((v) => v.type === 'color') || [];
  const sizeVariations = product.variations?.filter((v) => v.type === 'size') || [];

  const relatedProducts = products.filter(
    (p) => p.category.id === product.category.id && p.id !== product.id
  ).slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-foreground">Products</Link>
            <span>/</span>
            <Link to={`/category/${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-foreground truncate">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-card rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discount && (
                  <span className="badge-sale absolute top-4 left-4 text-base px-3 py-1.5">
                    -{product.discount}%
                  </span>
                )}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-destructive text-destructive' : ''}`} />
                </Button>
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[product.images[0], product.images[0], product.images[0], product.images[0]].map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Brand */}
              {product.brand && (
                <Link to={`/brand/${product.brand.slug}`} className="text-sm text-primary font-medium">
                  {product.brand.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) ? 'rating-star' : 'text-muted'
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-medium">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">{product.sold} sold</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <Badge className="bg-destructive text-destructive-foreground">
                      Save {formatPrice(product.originalPrice - product.price)}
                    </Badge>
                  </>
                )}
              </div>

              {/* Short Description */}
              <p className="text-muted-foreground">{product.description}</p>

              {/* Variations */}
              {colorVariations.length > 0 && (
                <div className="space-y-3">
                  <span className="font-medium">Color: {selectedColor}</span>
                  <div className="flex flex-wrap gap-2">
                    {colorVariations.map((variation) => (
                      <button
                        key={variation.id}
                        onClick={() => setSelectedColor(variation.value)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          selectedColor === variation.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {variation.value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizeVariations.length > 0 && (
                <div className="space-y-3">
                  <span className="font-medium">Size: {selectedSize}</span>
                  <div className="flex flex-wrap gap-2">
                    {sizeVariations.map((variation) => (
                      <button
                        key={variation.id}
                        onClick={() => setSelectedSize(variation.value)}
                        className={`w-12 h-12 rounded-lg border-2 transition-colors font-medium ${
                          selectedSize === variation.value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {variation.value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.stock} items available
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  size="lg"
                  className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" className="flex-1 btn-hero">
                  Buy Now
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Free Delivery</span>
                  <span className="text-xs text-muted-foreground">In Dhaka</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Warranty</span>
                  <span className="text-xs text-muted-foreground">1 Year</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <RotateCcw className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Easy Return</span>
                  <span className="text-xs text-muted-foreground">7 Days</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="p-4 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    🏪
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{product.seller.name}</span>
                      {product.seller.verified && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {product.seller.level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>⭐ {product.seller.rating}</span>
                      <span>•</span>
                      <span>{product.seller.productCount} Products</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Visit Store
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="description"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 px-6"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="specifications"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 px-6"
                >
                  Specifications
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 px-6"
                >
                  Reviews ({product.reviewCount})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-6">
                <div className="bg-card rounded-2xl p-6 shadow-sm prose prose-gray max-w-none">
                  <h3>About this product</h3>
                  <p>{product.description}</p>
                  <ul>
                    <li>Premium quality materials</li>
                    <li>Designed for everyday use</li>
                    <li>100% authentic product</li>
                    <li>Manufacturer warranty included</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="specifications" className="mt-6">
                <div className="bg-card rounded-2xl p-6 shadow-sm">
                  <table className="w-full">
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-3 text-muted-foreground w-1/3">Brand</td>
                        <td className="py-3 font-medium">{product.brand?.name || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-muted-foreground">Category</td>
                        <td className="py-3 font-medium">{product.category.name}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-muted-foreground">Stock</td>
                        <td className="py-3 font-medium">{product.stock} units</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-muted-foreground">SKU</td>
                        <td className="py-3 font-medium">BDM-{product.id.padStart(6, '0')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-6">
                <div className="bg-card rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-8 mb-8">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-primary">{product.rating}</p>
                      <div className="flex items-center gap-0.5 justify-center my-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 rating-star" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.reviewCount} reviews</p>
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-2 mb-1">
                          <span className="text-sm w-3">{star}</span>
                          <Star className="h-3 w-3 text-warning" />
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-warning rounded-full"
                              style={{ width: `${star * 18}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">Write a Review</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                Related Products
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
