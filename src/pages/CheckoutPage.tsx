import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Truck, ChevronRight, Check, Plus, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/data/mockData';

const steps = [
  { id: 1, name: 'Shipping', icon: MapPin },
  { id: 2, name: 'Payment', icon: CreditCard },
  { id: 3, name: 'Review', icon: Check },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
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

  const handlePlaceOrder = () => {
    // Simulate order placement
    clearCart();
    navigate('/order-success');
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
            <Link to="/cart" className="hover:text-foreground">Cart</Link>
            <span>/</span>
            <span className="text-foreground">Checkout</span>
          </nav>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 ${
                      currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentStep > step.id
                          ? 'bg-primary text-primary-foreground'
                          : currentStep === step.id
                          ? 'bg-primary/20 text-primary border-2 border-primary'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className="hidden md:block font-medium">{step.name}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground mx-2 md:mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping */}
              {currentStep === 1 && (
                <div className="bg-card rounded-2xl p-6 shadow-sm animate-fade-in">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Shipping Address
                  </h2>

                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={shippingInfo.name}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="01XXXXXXXXX"
                          value={shippingInfo.phone}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        placeholder="House no, Road no, Area"
                        value={shippingInfo.address}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, address: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, city: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="area">Area</Label>
                        <Input
                          id="area"
                          placeholder="Your area"
                          value={shippingInfo.area}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, area: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          placeholder="1234"
                          value={shippingInfo.postalCode}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <Link to="/cart">
                      <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Cart
                      </Button>
                    </Link>
                    <Button onClick={() => setCurrentStep(2)} className="gap-2">
                      Continue to Payment
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div className="bg-card rounded-2xl p-6 shadow-sm animate-fade-in">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </h2>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      <label
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          paymentMethod === 'cod'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="cod" />
                        <div className="flex-1">
                          <p className="font-medium">Cash on Delivery (COD)</p>
                          <p className="text-sm text-muted-foreground">
                            Pay when you receive your order
                          </p>
                        </div>
                        <span className="text-2xl">💵</span>
                      </label>

                      <label
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          paymentMethod === 'bkash'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="bkash" />
                        <div className="flex-1">
                          <p className="font-medium">bKash</p>
                          <p className="text-sm text-muted-foreground">
                            Pay instantly with bKash
                          </p>
                        </div>
                        <span className="text-2xl">📱</span>
                      </label>

                      <label
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          paymentMethod === 'nagad'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="nagad" />
                        <div className="flex-1">
                          <p className="font-medium">Nagad</p>
                          <p className="text-sm text-muted-foreground">
                            Pay instantly with Nagad
                          </p>
                        </div>
                        <span className="text-2xl">📲</span>
                      </label>

                      <label
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          paymentMethod === 'card'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="card" />
                        <div className="flex-1">
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-sm text-muted-foreground">
                            Visa, MasterCard, AMEX
                          </p>
                        </div>
                        <span className="text-2xl">💳</span>
                      </label>
                    </div>
                  </RadioGroup>

                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep(3)} className="gap-2">
                      Review Order
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-card rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Order Review</h2>
                    
                    {/* Items */}
                    <div className="divide-y">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex gap-4 py-4">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium line-clamp-1">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-card rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Shipping Address
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                        Edit
                      </Button>
                    </div>
                    <p className="text-muted-foreground">
                      {shippingInfo.name}<br />
                      {shippingInfo.phone}<br />
                      {shippingInfo.address}, {shippingInfo.area}<br />
                      {shippingInfo.city} - {shippingInfo.postalCode}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-card rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Payment Method
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                        Edit
                      </Button>
                    </div>
                    <p className="text-muted-foreground capitalize">
                      {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={handlePlaceOrder} className="btn-hero">
                      Place Order
                      <Check className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Items ({items.length})
                    </span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium">
                      {deliveryCharge === 0 ? (
                        <span className="text-primary">FREE</span>
                      ) : (
                        formatPrice(deliveryCharge)
                      )}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg text-primary">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mt-6 p-4 bg-primary/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Estimated Delivery</p>
                      <p className="text-xs text-muted-foreground">
                        Within 3-5 business days
                      </p>
                    </div>
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
