import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Grid, label: 'Categories', path: '/categories' },
  { icon: User, label: 'Account', path: '/dashboard' },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-border/40 pb-safe">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 py-1"
            >
              <Icon
                className={`h-6 w-6 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className={`text-[10px] font-bold mt-0.5 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'
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
