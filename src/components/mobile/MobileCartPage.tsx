import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Bell, Check, Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/data/mockData';
import { MobileBottomNav } from './MobileBottomNav';

export function MobileCartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getSubtotal } = useCart();
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState<string[]>(items.map(i => i.product.id));

  const subtotal = getSubtotal();
  const deliveryCharge = subtotal > 5000 ? 0 : 60;
  const total = subtotal + deliveryCharge;

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(i => i.product.id));
    }
  };

  const toggleSelectItem = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-background pb-20">
        <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
          <div className="flex items-center justify-between h-14 px-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold text-foreground">My Cart</h1>
            <div className="flex items-center gap-1">
              <button className="p-2"><Search className="h-5 w-5 text-muted-foreground" /></button>
              <button className="p-2 relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <div className="w-24 h-24 mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
            <span className="text-4xl">🛒</span>
          </div>
          <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Looks like you haven't added anything yet
          </p>
          <Link to="/products" className="px-6 py-3 bg-primary text-white rounded-full font-medium">
            Start Shopping
          </Link>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background pb-40">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">My Cart</h1>
          <div className="flex items-center gap-1">
            <button className="p-2"><Search className="h-5 w-5 text-muted-foreground" /></button>
            <button className="p-2 relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Select All */}
      <div className="bg-white dark:bg-card px-4 py-3 flex items-center gap-3 border-b border-border/30">
        <button
          onClick={toggleSelectAll}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            selectedItems.length === items.length
              ? 'bg-primary border-primary'
              : 'border-muted-foreground/50'
          }`}
        >
          {selectedItems.length === items.length && <Check className="h-3 w-3 text-white" />}
        </button>
        <span className="text-sm font-medium">Select All</span>
      </div>

      {/* Cart Items */}
      <div className="px-4 py-2 space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={item.product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-card rounded-xl p-3 flex gap-3"
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleSelectItem(item.product.id)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-4 transition-colors ${
                selectedItems.includes(item.product.id)
                  ? 'bg-primary border-primary'
                  : 'border-muted-foreground/50'
              }`}
            >
              {selectedItems.includes(item.product.id) && <Check className="h-3 w-3 text-white" />}
            </button>

            {/* Product Image */}
            <Link to={`/product/${item.product.slug}`} className="shrink-0">
              <div className="w-16 h-16 rounded-lg bg-secondary/50 overflow-hidden">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.product.slug}`}>
                <h3 className="text-sm font-medium text-foreground line-clamp-1">
                  {item.product.name}
                </h3>
              </Link>
              <p className="text-xs text-muted-foreground mt-0.5">
                Color - Red Size-7
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold text-primary">
                  {formatPrice(item.product.price)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded border border-border flex items-center justify-center"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => removeItem(item.product.id)}
              className="shrink-0 self-start p-1 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Fixed Bottom Summary */}
      <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-card border-t border-border/50 px-4 py-3 safe-area-bottom z-40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Total:</span>
          <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-full border-2 border-primary text-primary font-semibold text-sm"
          >
            Cancel
          </button>
          <Link
            to={user ? "/checkout" : "/auth?mode=login"}
            className="flex-1 py-3 rounded-full bg-primary text-white font-semibold text-sm text-center"
          >
            Place Order
          </Link>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
