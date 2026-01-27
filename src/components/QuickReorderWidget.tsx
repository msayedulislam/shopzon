import { useState } from 'react';
import { RefreshCw, ShoppingCart, Heart, Trash2, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuickReorder } from '@/hooks/useQuickReorder';
import { useCart } from '@/hooks/useCart';
import { format } from 'date-fns';

export function QuickReorderWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const { 
    pastOrders, 
    savedCarts, 
    isLoading, 
    saveCurrentCart, 
    reorderFromOrder, 
    reorderFromSavedCart,
    deleteSavedCart,
  } = useQuickReorder();
  
  const { items } = useCart();

  const handleSaveCart = () => {
    if (items.length === 0) return;
    
    const cartItems = items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images?.[0] || '/placeholder.svg',
      quantity: item.quantity,
      price: item.product.price,
    }));
    
    saveCurrentCart.mutate({ 
      name: saveName || `My Cart - ${format(new Date(), 'MMM d, yyyy')}`,
      items: cartItems,
    });
    
    setShowSaveDialog(false);
    setSaveName('');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Quick Reorder
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Quick Reorder
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            {/* Saved Carts */}
            {savedCarts.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Saved Carts
                </h3>
                <div className="space-y-2">
                  {savedCarts.map((cart) => (
                    <Card key={cart.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{cart.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {cart.items.length} items
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reorderFromSavedCart(cart)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add to Cart
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSavedCart.mutate(cart.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Orders */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Past Orders
              </h3>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : pastOrders.length === 0 ? (
                <p className="text-muted-foreground">No past orders to reorder from</p>
              ) : (
                <div className="space-y-3">
                  {pastOrders.map((order) => (
                    <Card key={order.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{order.order_number}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(order.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div 
                                key={idx}
                                className="flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded"
                              >
                                {item.product_image && (
                                  <img 
                                    src={item.product_image} 
                                    alt="" 
                                    className="w-4 h-4 rounded object-cover"
                                  />
                                )}
                                <span className="truncate max-w-[100px]">
                                  {item.product_name}
                                </span>
                                <span className="text-muted-foreground">×{item.quantity}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{order.items.length - 3} more
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium">৳{order.total.toLocaleString()}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => reorderFromOrder(order)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reorder
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Save Cart Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            disabled={items.length === 0}
          >
            <Plus className="h-4 w-4" />
            Save Cart
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current Cart</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Cart name (optional)"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Saving {items.length} items
            </p>
            <Button onClick={handleSaveCart} className="w-full">
              Save Cart
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
