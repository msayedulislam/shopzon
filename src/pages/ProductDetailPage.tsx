import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, Minus, Plus, Check, Share2, ChevronRight, Award, Package } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { products, formatPrice } from '@/data/mockData';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/product/ProductCard';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section with Gradient */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/30">
          <div className="container py-6 lg:py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to={`/category/${product.category.slug}`} className="hover:text-primary transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
              {/* Product Images */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative aspect-square bg-card rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50">
                  <motion.img
                    key={selectedImage}
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.discount && (
                      <span className="bg-destructive text-destructive-foreground text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                        -{product.discount}% OFF
                      </span>
                    )}
                    {product.isFlashSale && (
                      <span className="bg-amber-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <Award className="h-4 w-4" /> Flash Deal
                      </span>
                    )}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart className={`h-5 w-5 transition-all ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`} />
                  </motion.button>
                </div>
                
                {/* Thumbnails */}
                <div className="flex gap-3 overflow-x-auto pb-2 px-1">
                  {[product.images[0], product.images[0], product.images[0], product.images[0]].map((img, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shadow-md ${
                        selectedImage === index 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-transparent hover:border-primary/50'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Product Info */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {/* Brand */}
                {product.brand && (
                  <Link 
                    to={`/brand/${product.brand.slug}`} 
                    className="inline-flex items-center gap-2 text-xs text-primary/80 font-semibold uppercase tracking-widest hover:text-primary transition-colors"
                  >
                    <span className="w-8 h-[2px] bg-primary/50"></span>
                    {product.brand.name}
                  </Link>
                )}

                {/* Title */}
                <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-amber-500/10 dark:bg-amber-500/20 px-3 py-1.5 rounded-full">
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                    <span className="font-bold text-amber-600 dark:text-amber-400">{product.rating}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {product.reviewCount} reviews
                  </span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {product.sold}+ sold
                  </span>
                </div>

                {/* Price */}
                <div className="flex flex-wrap items-baseline gap-3 p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl">
                  <span className="text-4xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1">
                        Save {formatPrice(product.originalPrice - product.price)}
                      </Badge>
                    </>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>

                {/* Variations */}
                {colorVariations.length > 0 && (
                  <div className="space-y-3">
                    <span className="font-semibold text-sm uppercase tracking-wide">Color: <span className="text-primary">{selectedColor}</span></span>
                    <div className="flex flex-wrap gap-2">
                      {colorVariations.map((variation) => (
                        <motion.button
                          key={variation.id}
                          onClick={() => setSelectedColor(variation.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`px-5 py-2.5 rounded-xl border-2 transition-all font-medium ${
                            selectedColor === variation.value
                              ? 'border-primary bg-primary/10 text-primary shadow-md'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          {variation.value}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {sizeVariations.length > 0 && (
                  <div className="space-y-3">
                    <span className="font-semibold text-sm uppercase tracking-wide">Size: <span className="text-primary">{selectedSize}</span></span>
                    <div className="flex flex-wrap gap-2">
                      {sizeVariations.map((variation) => (
                        <motion.button
                          key={variation.id}
                          onClick={() => setSelectedSize(variation.value)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-14 h-14 rounded-xl border-2 transition-all font-semibold ${
                            selectedSize === variation.value
                              ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          {variation.value}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-3">
                  <span className="font-semibold text-sm uppercase tracking-wide">Quantity</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-none h-12 w-12 hover:bg-primary/10"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-14 text-center font-bold text-lg">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-none h-12 w-12 hover:bg-primary/10"
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ {product.stock} in stock
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-14 gap-2 text-base font-semibold border-2 border-primary text-primary hover:bg-primary/10"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </Button>
                  </motion.div>
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                      Buy Now
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="lg" className="h-14 w-14 p-0 border-2">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 pt-6">
                  {[
                    { icon: Truck, title: "Free Delivery", subtitle: "In Dhaka", color: "text-blue-500 bg-blue-500/10" },
                    { icon: Shield, title: "Warranty", subtitle: "1 Year", color: "text-emerald-500 bg-emerald-500/10" },
                    { icon: RotateCcw, title: "Easy Return", subtitle: "7 Days", color: "text-amber-500 bg-amber-500/10" }
                  ].map((feature, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-semibold">{feature.title}</span>
                      <span className="text-xs text-muted-foreground">{feature.subtitle}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Seller Info */}
                <div className="p-5 bg-card rounded-2xl border border-border/50 hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl shadow-inner">
                      🏪
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">{product.seller.name}</span>
                        {product.seller.verified && (
                          <span className="bg-blue-500 text-white p-0.5 rounded-full">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] uppercase font-bold">
                          {product.seller.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          {product.seller.rating}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                        <span>{product.seller.productCount} Products</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                      Visit Store
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="container py-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-2">
              {[
                { value: 'description', label: 'Description' },
                { value: 'specifications', label: 'Specifications' },
                { value: 'reviews', label: `Reviews (${product.reviewCount})` }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-t-xl rounded-b-none border-2 border-b-0 border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:shadow-sm py-3 px-6 font-semibold text-muted-foreground data-[state=active]:text-foreground transition-all"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="description" className="mt-0">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-b-2xl rounded-tr-2xl p-8 border border-border/50 shadow-sm"
              >
                <h3 className="text-xl font-bold mb-4 text-foreground">About this product</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
                <ul className="space-y-3">
                  {[
                    "Premium quality materials",
                    "Designed for everyday use",
                    "100% authentic product",
                    "Manufacturer warranty included"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Check className="h-4 w-4" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-0">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-b-2xl rounded-tr-2xl p-8 border border-border/50 shadow-sm"
              >
                <table className="w-full">
                  <tbody className="divide-y divide-border">
                    {[
                      { label: 'Brand', value: product.brand?.name || 'N/A' },
                      { label: 'Category', value: product.category.name },
                      { label: 'Stock', value: `${product.stock} units` },
                      { label: 'SKU', value: `BDM-${product.id.padStart(6, '0')}` }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 text-muted-foreground w-1/3 font-medium">{row.label}</td>
                        <td className="py-4 font-semibold text-foreground">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-0">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-b-2xl rounded-tr-2xl p-8 border border-border/50 shadow-sm"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
                    <p className="text-5xl font-bold text-primary mb-2">{product.rating}</p>
                    <div className="flex items-center gap-0.5 justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{product.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 w-full">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3 mb-2">
                        <span className="text-sm w-4 font-semibold">{star}</span>
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${star * 18}%` }}
                            transition={{ duration: 0.5, delay: star * 0.1 }}
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-10">{Math.round(star * 18)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full h-12 font-semibold bg-primary hover:bg-primary/90">Write a Review</Button>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="container pb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Related Products
              </h2>
              <Link to="/products" className="text-primary font-semibold hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
