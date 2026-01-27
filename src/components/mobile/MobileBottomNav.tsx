import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Grid3X3, label: 'Categories', path: '/categories' },
  { icon: ShoppingCart, label: 'Cart', path: '/cart', hasBadge: true },
  { icon: User, label: 'Account', path: '/dashboard' },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
      {/* Glass background with blur */}
      <div className="absolute inset-0 bg-white/80 dark:bg-card/80 backdrop-blur-xl border-t border-border/30" />
      
      <div className="relative flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-0.5 py-2 px-4 relative min-w-[60px]"
            >
              <motion.div 
                className="relative"
                whileTap={{ scale: 0.85 }}
              >
                {/* Active background pill */}
                {isActive && (
                  <motion.div
                    layoutId="navActiveBg"
                    className="absolute -inset-2 rounded-xl bg-primary/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                
                <Icon 
                  className={`relative h-5 w-5 transition-all duration-200 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* Cart Badge */}
                {item.hasBadge && itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-primary/30"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </motion.div>
              
              <span 
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
