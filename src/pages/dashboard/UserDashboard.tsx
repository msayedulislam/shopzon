import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Package, Heart, MapPin, Wallet, Settings, LogOut, Menu } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const menuItems = [
  { icon: User, label: 'Profile', path: '/dashboard' },
  { icon: Package, label: 'My Orders', path: '/dashboard/orders' },
  { icon: Heart, label: 'Wishlist', path: '/dashboard/wishlist' },
  { icon: MapPin, label: 'Addresses', path: '/dashboard/addresses' },
  { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

export default function UserDashboard() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);

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

  const handleSignOut = async () => {
    await signOut();
  };

  const Sidebar = () => (
    <div className="space-y-1">
      {/* User Info */}
      <div className="p-4 bg-secondary/50 rounded-xl mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{profile?.full_name || 'User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            location.pathname === item.path
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-secondary'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      ))}

      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="h-5 w-5" />
        <span>Sign Out</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="bg-card rounded-2xl p-4 shadow-sm sticky top-24">
                <Sidebar />
              </div>
            </aside>

            {/* Mobile Menu */}
            <div className="lg:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Menu className="h-4 w-4" />
                    Menu
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px]">
                  <div className="mt-6">
                    <Sidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <Outlet context={{ profile, fetchProfile }} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
