import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Search, Bell, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showNotification?: boolean;
  transparent?: boolean;
}

export function MobileHeader({ 
  title = 'Jhuri', 
  showBack = false, 
  showSearch = true,
  showNotification = true,
  transparent = false
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <motion.header 
      initial={false}
      animate={{
        backgroundColor: scrolled || !transparent ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
      }}
      className={`sticky top-0 z-50 safe-area-top transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-sm' : transparent ? '' : 'bg-white/85 dark:bg-card/85 backdrop-blur-xl'
      } ${scrolled || !transparent ? 'border-b border-border/30' : ''}`}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left - Back Button or Brand */}
        <div className="flex items-center gap-2 min-w-[80px]">
          {showBack && !isHome ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className="w-9 h-9 rounded-full bg-secondary/80 dark:bg-secondary flex items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4.5 w-4.5 text-foreground" />
            </motion.button>
          ) : null}
        </div>

        {/* Center - Title/Brand */}
        <motion.div 
          className="flex-1 flex justify-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isHome ? (
            <Link to="/" className="flex items-center gap-1.5">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center"
              >
                <span 
                  className="text-xl font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <span className="bg-gradient-to-r from-primary via-primary to-rose-500 bg-clip-text text-transparent">Jhu</span>
                  <span className="text-foreground">ri</span>
                </span>
              </motion.div>
            </Link>
          ) : (
            <h1 
              className="text-base font-semibold text-foreground truncate max-w-[180px]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {title}
            </h1>
          )}
        </motion.div>

        {/* Right - Action Icons */}
        <div className="flex items-center gap-1 min-w-[80px] justify-end">
          {showSearch && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/search')}
              className="w-9 h-9 rounded-full bg-secondary/60 dark:bg-secondary/40 flex items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Search"
            >
              <Search className="h-4.5 w-4.5 text-muted-foreground" />
            </motion.button>
          )}
          {showNotification && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/notifications')}
              className="w-9 h-9 rounded-full bg-secondary/60 dark:bg-secondary/40 flex items-center justify-center hover:bg-secondary transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-card" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
