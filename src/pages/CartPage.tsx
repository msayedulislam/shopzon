import { Link } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck, Shield, Tag, LogIn } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/data/mockData';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileCartPage } from '@/components/mobile/MobileCartPage';
import { QuickReorderWidget } from '@/components/QuickReorderWidget';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCart();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [couponCode, setCouponCode] = useState('');
  
  const subtotal = getSubtotal();
  const deliveryCharge = subtotal > 5000 ? 0 : 60;
  const total = subtotal + deliveryCharge;
  const isLoggedIn = !!user;

  // Mobile view
  if (isMobile) {
    return <MobileCartPage />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-secondary/30">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet
            </p>
            <Link to="/products">
              <Button className="btn-hero">
                Start Shopping
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Shopping Cart</span>
          </nav>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h1>
            {isLoggedIn && <QuickReorderWidget />}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-card rounded-2xl p-4 md:p-6 shadow-sm animate-fade-in"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link to={`/product/${item.product.slug}`} className="shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="font-medium text-foreground hover:text-primary line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {item.product.brand && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.product.brand.name}
                        </p>
                      )}

                      {/* Selected Variations */}
                      {item.selectedVariations && item.selectedVariations.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.selectedVariations.map((v) => v.value).join(' / ')}
                        </p>
                      )}

                      {item.product.freeDelivery && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary mt-2">
                          <Truck className="h-3 w-3" />
                          Free Delivery
                        </span>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity */}
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(item.product.price)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

                {/* Coupon */}
                <div className="flex gap-2 mb-6">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">Apply</Button>
                </div>

                {/* Summary */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Charge</span>
                    <span className="font-medium">
                      {deliveryCharge === 0 ? (
                        <span className="text-primary">FREE</span>
                      ) : (
                        formatPrice(deliveryCharge)
                      )}
                    </span>
                  </div>
                  {subtotal < 5000 && (
                    <p className="text-xs text-muted-foreground">
                      Add {formatPrice(5000 - subtotal)} more for free delivery
                    </p>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg text-primary">
                        {formatPrice(total)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Including VAT where applicable
                    </p>
                  </div>
                </div>

                {/* Checkout Button */}
                {isLoggedIn ? (
                  <Link to="/checkout" className="block mt-6">
                    <Button className="w-full btn-hero">
                      Proceed to Checkout
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <div className="mt-6 space-y-3">
                    <Link to="/auth?mode=login" className="block">
                      <Button className="w-full btn-hero">
                        <LogIn className="h-5 w-5" />
                        Login to Checkout
                      </Button>
                    </Link>
                    <p className="text-xs text-center text-muted-foreground">
                      Don't have an account?{' '}
                      <Link to="/auth?mode=register" className="text-primary hover:underline">
                        Sign up
                      </Link>
                    </p>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    Fast Delivery
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
