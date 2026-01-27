import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
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
import { Header } from '@/components/layout/Header';
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

  // Show dedicated mobile dashboard on mobile devices
  if (isMobile) {
    return <MobileDashboardPage />;
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
    <div className="flex flex-col h-full">
      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-transparent rounded-xl">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(profile?.full_name || user?.email || 'User')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {profile?.full_name || 'Welcome'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Menu Items */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                active
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-secondary text-foreground'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 transition-transform',
                !active && 'group-hover:scale-110'
              )} />
              <span className="flex-1 font-medium">{item.label}</span>
              {!active && (
                <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-2" />

      {/* Sign Out */}
      <div className="p-2">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-destructive hover:bg-destructive/10 transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-6 lg:py-8">
          {/* Mobile Header */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(profile?.full_name || user?.email || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{profile?.full_name || 'Welcome'}</p>
                  <p className="text-xs text-muted-foreground">My Account</p>
                </div>
              </div>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
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
