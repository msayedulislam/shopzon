import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Home, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileBottomNav } from './MobileBottomNav';

export function MobileOrderSuccessPage() {
  const navigate = useNavigate();
  const orderNumber = 'JHU' + Math.random().toString(36).substring(2, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-white dark:bg-background flex flex-col pb-20">
      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full max-w-sm"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center"
          >
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold mb-2"
          >
            Order Placed! 🎉
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-6"
          >
            Thank you for your order. We'll process it shortly.
          </motion.p>

          {/* Order Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-secondary rounded-2xl p-4 mb-6"
          >
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <p className="text-xl font-bold text-primary">{orderNumber}</p>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-secondary/50 rounded-2xl p-4 mb-8"
          >
            <div className="flex items-start gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">What's next?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You'll receive an SMS and email confirmation with tracking details shortly.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <Link 
              to="/dashboard/orders" 
              className="flex items-center justify-center gap-2 w-full py-3 bg-secondary rounded-full font-medium"
            >
              <Package className="h-5 w-5" />
              Track Order
            </Link>
            <Link 
              to="/" 
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-full font-medium"
            >
              <Home className="h-5 w-5" />
              Continue Shopping
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
