import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  Menu,
  LayoutDashboard,
  ChevronRight,
  Settings,
  Wallet
} from 'lucide-react';
import { GovalyHeader } from '@/components/layout/GovalyHeader';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileDashboardPage } from '@/components/mobile/MobileDashboardPage';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';


const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard', exact: true },
  { icon: User, label: 'Profile', path: '/dashboard/profile' },
  { icon: Package, label: 'My Orders', path: '/dashboard/orders' },
  { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
  { icon: Heart, label: 'Wishlist', path: '/dashboard/wishlist' },
  { icon: MapPin, label: 'Addresses', path: '/dashboard/addresses' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

export default function UserDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setProfile(data);
  };

  // Get page title from current path
  const getPageTitle = () => {
    const pathMap: { [key: string]: string } = {
      '/dashboard/profile': 'Edit Profile',
      '/dashboard/orders': 'My Orders',
      '/dashboard/wallet': 'Wallet',
      '/dashboard/wishlist': 'Wishlist',
      '/dashboard/addresses': 'Saved Addresses',
      '/dashboard/settings': 'Settings',
      '/dashboard/coupons': 'Coupons',
      '/dashboard/payments': 'Payment Methods',
      '/dashboard/security': 'Privacy & Security',
    };
    return pathMap[location.pathname] || 'Dashboard';
  };

  // Show dedicated mobile dashboard only on exact /dashboard route
  if (isMobile && location.pathname === '/dashboard') {
    return <MobileDashboardPage />;
  }

  // Show mobile-friendly layout for sub-pages on mobile
  if (isMobile) {
    return (
      <div className="min-h-screen bg-secondary/30 dark:bg-background pb-20">
        <MobileHeader showBack backPath="/dashboard" title={getPageTitle()} />
        <div className="p-4">
          <Outlet context={{ profile, fetchProfile }} />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (item: typeof menuItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full bg-white dark:bg-card">
      {/* User Info */}
      <div className="p-6">
        <div className="flex flex-col items-center gap-4 p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700" />
          <Avatar className="h-20 w-20 border-4 border-white shadow-xl">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground font-black text-2xl">
              {getInitials(profile?.full_name || user?.email || 'User')}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-black text-lg uppercase tracking-tight italic">
              {profile?.full_name || 'Govaly User'}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6">
        <Separator className="bg-border/50" />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                onNavigate?.();
                navigate(item.path);
              }}
              className={cn(
                'flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden',
                active
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'hover:bg-primary/5 text-foreground'
              ) + ' w-full text-left'}
            >
              <item.icon className={cn(
                'h-5 w-5 transition-all duration-300',
                active ? 'stroke-[3px]' : 'group-hover:text-primary group-hover:scale-110'
              )} />
              <span className="flex-1 text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              <ChevronRight className={cn(
                'h-4 w-4 transition-all duration-300',
                active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'
              )} strokeWidth={3} />
            </button>
          );
        })}
      </nav>

      <div className="px-6">
        <Separator className="bg-border/50" />
      </div>

      {/* Sign Out */}
      <div className="p-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-4 px-6 py-4 rounded-2xl w-full text-primary font-black uppercase tracking-widest hover:bg-primary/5 transition-all duration-300"
        >
          <LogOut className="h-5 w-5" strokeWidth={3} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GovalyHeader />
      <main className="flex-1">
        <div className="container py-6 lg:py-8">
          <div className="lg:hidden mb-10">
            <div className="flex items-center justify-between bg-white dark:bg-card rounded-[2.5rem] p-6 border border-border/5 shadow-xl shadow-primary/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-5 relative z-10">
                <Avatar className="h-14 w-14 border-4 border-white dark:border-card shadow-lg">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs uppercase">
                    {getInitials(profile?.full_name || user?.email || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1 italic">Authorized</p>
                  <p className="font-black text-sm uppercase tracking-tighter italic">{profile?.full_name || 'Govaly Member'}</p>
                </div>
              </div>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-border/10 bg-secondary/30 relative z-10">
                    <Menu className="h-6 w-6 text-primary" strokeWidth={3} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0 border-r-border/5">
                  <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex gap-6 lg:gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-[280px] shrink-0">
              <div className="bg-card rounded-2xl border border-border shadow-sm sticky top-24 overflow-hidden">
                <Sidebar />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <Outlet context={{ profile, fetchProfile }} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
