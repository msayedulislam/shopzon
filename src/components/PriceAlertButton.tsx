import { useState } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PriceAlertButtonProps {
  productId: string;
  currentPrice: number;
  productName: string;
  variant?: 'icon' | 'button';
}

export function PriceAlertButton({ 
  productId, 
  currentPrice, 
  productName,
  variant = 'icon' 
}: PriceAlertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const { user } = useAuth();
  const { hasAlert, createAlert, removeAlert } = usePriceAlerts();
  
  const alertExists = hasAlert(productId);

  const handleSetAlert = () => {
    if (!user) {
      toast.error('Please login to set price alerts');
      return;
    }

    createAlert.mutate({
      productId,
      targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
      originalPrice: currentPrice,
    });
    
    setIsOpen(false);
    setTargetPrice('');
  };

  const handleRemoveAlert = () => {
    removeAlert.mutate(productId);
  };

  if (alertExists) {
    return (
      <Button
        variant="ghost"
        size={variant === 'icon' ? 'icon' : 'sm'}
        onClick={handleRemoveAlert}
        className="text-primary"
        title="Remove price alert"
      >
        <BellRing className="h-4 w-4" />
        {variant === 'button' && <span className="ml-2">Alert Set</span>}
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={variant === 'icon' ? 'icon' : 'sm'}
          title="Set price drop alert"
        >
          <Bell className="h-4 w-4" />
          {variant === 'button' && <span className="ml-2">Price Alert</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Set Price Alert
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Get notified when the price drops for:
            </p>
            <p className="font-medium">{productName}</p>
            <p className="text-lg font-bold text-primary">
              Current: ৳{currentPrice.toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target-price">Target Price (optional)</Label>
            <Input
              id="target-price"
              type="number"
              placeholder={`Alert me when below ৳${Math.round(currentPrice * 0.9)}`}
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to get notified on any price drop
            </p>
          </div>
          
          <Button onClick={handleSetAlert} className="w-full gap-2">
            <Bell className="h-4 w-4" />
            Set Alert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
