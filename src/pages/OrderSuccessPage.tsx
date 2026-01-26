import { Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileOrderSuccessPage } from '@/components/mobile/MobileOrderSuccessPage';

export default function OrderSuccessPage() {
  const isMobile = useIsMobile();
  const orderNumber = 'JHU' + Math.random().toString(36).substring(2, 8).toUpperCase();

  if (isMobile) {
    return <MobileOrderSuccessPage />;
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg max-w-md w-full text-center animate-slide-up">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
          Order Placed Successfully!
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Thank you for your order. We've received your order and will begin processing it soon.
        </p>

        <div className="bg-secondary rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Order Number</p>
          <p className="text-xl font-bold text-primary">{orderNumber}</p>
        </div>

        <div className="space-y-4 text-left mb-8">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Order Confirmation</p>
              <p className="text-muted-foreground">
                You'll receive an SMS and email confirmation shortly
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/dashboard/orders" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Package className="h-4 w-4" />
              Track Order
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button className="w-full btn-hero">
              <Home className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
