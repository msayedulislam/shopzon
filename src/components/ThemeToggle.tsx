import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-white/10 transition-all duration-300">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-12 w-12 rounded-2xl hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 relative overflow-hidden group"
    >
      <Sun className={`h-5 w-5 absolute transition-all duration-500 ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
      <Moon className={`h-5 w-5 absolute transition-all duration-500 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
      
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-amber-500/10'} opacity-0 group-hover:opacity-100`} />
    </Button>
  );
}
