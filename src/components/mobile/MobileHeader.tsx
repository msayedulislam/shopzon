import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showNotification?: boolean;
}

export function MobileHeader({ 
  title = 'Jhuri', 
  showBack = false, 
  showSearch = true,
  showNotification = true 
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isHome = location.pathname === '/';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left - Back Button or Brand */}
        <div className="flex items-center gap-3 min-w-[40px]">
          {showBack && !isHome ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-secondary/80 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
          ) : null}
        </div>

        {/* Center - Title */}
        <h1 
          className="text-lg font-bold text-foreground flex-1 text-center"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {isHome ? (
            <span>
              <span className="text-primary">Jhu</span>ri
            </span>
          ) : (
            title
          )}
        </h1>

        {/* Right - Action Icons */}
        <div className="flex items-center gap-1 min-w-[40px] justify-end">
          {showSearch && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products')}
              className="p-2 rounded-full hover:bg-secondary/80 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </motion.button>
          )}
          {showNotification && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-secondary/80 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
