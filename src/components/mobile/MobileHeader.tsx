import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Search, Bell, ShoppingCart, User, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/hooks/useCart';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  backPath?: string;
  showSearch?: boolean;
  transparent?: boolean;
}

export function MobileHeader({
  title = 'Govaly',
  showBack = false,
  backPath,
  showSearch = true,
  transparent = false
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled || !transparent ? 'bg-white shadow-sm border-b border-border/40' : 'bg-transparent'
        }`}
    >
      <div className="safe-area-top" />
      <div className="flex flex-col">
        {/* Top Row: Logo & Actions */}
        <div className="flex items-center justify-between h-14 px-3">
          <div className="flex items-center gap-3">
            {showBack && !isHome ? (
              <button onClick={handleBack} className="p-1.5 -ml-1">
                <ArrowLeft className="h-6 w-6 text-foreground" />
              </button>
            ) : (
              <button className="p-1.5 -ml-1">
                <Menu className="h-6 w-6 text-foreground" />
              </button>
            )}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-black text-primary tracking-tighter uppercase italic">
                GOVALY
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 relative"
            >
              <Bell className="h-6 w-6 text-foreground" strokeWidth={1.5} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-white" />
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="p-2 relative"
            >
              <ShoppingCart className="h-6 w-6 text-foreground" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <User className="h-6 w-6 text-foreground" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Search Row - Integrated with Header on Home */}
        {showSearch && isHome && (
          <div className="px-3 pb-3">
            <div
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 h-11 px-4 bg-secondary/30 rounded-2xl border border-border/10 text-muted-foreground transition-all active:scale-[0.98] shadow-sm"
            >
              <Search className="h-4.5 w-4.5 text-primary" strokeWidth={3} />
              <span className="text-xs font-bold uppercase tracking-tight">Search for products, brands...</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
