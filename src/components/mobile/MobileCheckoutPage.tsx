import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Check, ChevronRight, LocateFixed, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';
import { toast } from 'sonner';
import { MobileBottomNav } from './MobileBottomNav';
import { useLocationDetect } from '@/hooks/useLocationDetect';

export function MobileCheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, getSubtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placingOrder, setPlacingOrder] = useState(false);
  const { detecting, detectLocation } = useLocationDetect();

  const handleDetectLocation = async () => {
    const location = await detectLocation();
    if (location) {
      setShippingInfo((prev) => ({
        ...prev,
        address: location.address || prev.address,
        city: location.city || prev.city,
        area: location.area || prev.area,
        postalCode: location.postalCode || prev.postalCode,
      }));
    }
  };
  
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka',
    area: '',
    postalCode: '',
  });

  const subtotal = getSubtotal();
  const deliveryCharge = subtotal > 5000 ? 0 : 60;
  const total = subtotal + deliveryCharge;

  // Auto-fill user profile data and detect location on mount
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
    // Auto-detect location on page load
    autoDetectLocationOnMount();
  }, [user]);

  const autoDetectLocationOnMount = async () => {
    const location = await detectLocation();
    if (location) {
      setShippingInfo((prev) => ({
        ...prev,
        address: location.address || prev.address,
        city: location.city || prev.city,
        area: location.area || prev.area,
        postalCode: location.postalCode || prev.postalCode,
      }));
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('user_id', user?.id)
        .single();

      if (profile) {
        setShippingInfo((prev) => ({
          ...prev,
          name: profile.full_name || prev.name,
          phone: profile.phone || prev.phone,
        }));
      }
    } catch (error) {
      console.log('No profile found, user can fill manually');
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login to place order');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderNumber = `BDM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          shipping_name: shippingInfo.name,
          shipping_phone: shippingInfo.phone,
          shipping_address: shippingInfo.address,
          shipping_city: shippingInfo.city,
          shipping_area: shippingInfo.area,
          shipping_postal_code: shippingInfo.postalCode,
          subtotal: subtotal,
          delivery_charge: deliveryCharge,
          total: total,
          payment_method: paymentMethod as any,
          payment_status: 'pending',
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images[0],
        quantity: item.quantity,
        price: item.product.price,
        seller_id: item.product.seller?.id || null,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      navigate('/order-success');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex flex-col items-center justify-center p-8">
        <h2 className="text-lg font-semibold mb-4">Your cart is empty</h2>
        <Link to="/products" className="text-primary font-medium">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground ml-2">Checkout</h1>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-card px-4 py-3 flex items-center justify-center gap-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {currentStep > step ? <Check className="h-4 w-4" /> : step}
            </div>
            {step < 3 && (
              <div className={`w-8 h-0.5 ${currentStep > step ? 'bg-primary' : 'bg-secondary'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="px-4 py-4">
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-card rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Shipping Address
              </h2>
              <button
                onClick={handleDetectLocation}
                disabled={detecting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium disabled:opacity-50"
              >
                {detecting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="h-3.5 w-3.5" />
                )}
                {detecting ? 'Detecting...' : 'Auto Detect'}
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 text-sm"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 text-sm"
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Address</label>
                <input
                  type="text"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 text-sm"
                  placeholder="House, Road, Area"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">City</label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Area</label>
                  <input
                    type="text"
                    value={shippingInfo.area}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, area: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 text-sm"
                    placeholder="Your area"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-card rounded-xl p-4"
          >
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Method
            </h2>
            <div className="space-y-2">
              {[
                { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                { id: 'bkash', label: 'bKash', icon: '📱' },
                { id: 'nagad', label: 'Nagad', icon: '📲' },
                { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                    paymentMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-sm font-medium flex-1 text-left">{method.label}</span>
                  {paymentMethod === method.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div className="bg-white dark:bg-card rounded-xl p-4">
              <h2 className="text-base font-semibold mb-3">Order Summary</h2>
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 py-2 border-b border-border/50 last:border-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-contain bg-secondary/30"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-white dark:bg-card rounded-xl p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-border/50 px-4 py-3 safe-area-bottom z-40">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 py-3 rounded-full border-2 border-primary text-primary font-semibold text-sm"
            >
              Back
            </button>
          )}
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1 py-3 rounded-full bg-primary text-white font-semibold text-sm"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="flex-1 py-3 rounded-full bg-primary text-white font-semibold text-sm disabled:opacity-50"
            >
              {placingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
