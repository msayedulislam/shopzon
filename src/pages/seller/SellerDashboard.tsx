import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  Store,
  AlertCircle,
  TrendingUp,
  Star,
  Bell,
  ChevronRight,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/seller/dashboard' },
  { icon: Package, label: 'Products', path: '/seller/dashboard/products' },
  { icon: ShoppingBag, label: 'Orders', path: '/seller/dashboard/orders' },
  { icon: DollarSign, label: 'Earnings', path: '/seller/dashboard/earnings' },
  { icon: Settings, label: 'Settings', path: '/seller/dashboard/settings' },
];

export default function SellerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSeller();
    }
  }, [user]);

  const fetchSeller = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        navigate('/seller/register');
        return;
      }

      setSeller(data);
    } catch (error) {
      console.error('Error fetching seller:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-card">
      {/* Logo */}
      <div className="p-5 border-b">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-xl">J</span>
          </div>
          <div>
            <span className="font-display font-bold text-lg">Jhuri</span>
            <p className="text-xs text-muted-foreground">Seller Center</p>
          </div>
        </Link>
      </div>

      {/* Seller Info Card */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12 border-2 border-primary/30">
            <AvatarImage src={seller?.logo_url} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {seller?.shop_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold truncate">{seller?.shop_name}</p>
            <Badge
              className={`text-xs ${
                seller?.status === 'active'
                  ? 'bg-green-100 text-green-700 border-0'
                  : seller?.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700 border-0'
                  : 'bg-red-100 text-red-700 border-0'
              }`}
            >
              {seller?.status}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded-lg bg-background/50">
            <p className="text-sm font-bold text-primary">{formatPrice(seller?.balance || 0)}</p>
            <p className="text-xs text-muted-foreground">Balance</p>
          </div>
          <div className="p-2 rounded-lg bg-background/50">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <p className="text-sm font-bold">{seller?.rating?.toFixed(1) || '0.0'}</p>
            </div>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
        </div>
      </div>

      {/* Pending Approval Notice */}
      {seller?.status === 'pending' && (
        <div className="px-4 pb-4">
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">Pending Approval</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-0.5">
                  Your seller account is under review. This usually takes 24-48 hours. You'll be notified once approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspended Notice */}
      {seller?.status === 'suspended' && (
        <div className="px-4 pb-4">
          <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-red-800 dark:text-red-200">Account Suspended</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
                  Your seller account has been suspended. Please contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-4">
          Menu
        </p>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/seller/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-secondary text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full hover:bg-secondary transition-colors text-muted-foreground"
        >
          <Home className="h-5 w-5" />
          <span>Back to Store</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-secondary/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 border-r shrink-0 sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="hidden lg:flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <h1 className="font-semibold">Seller Dashboard</h1>
            {seller?.status === 'pending' && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border-0 animate-pulse">
                Pending Approval
              </Badge>
            )}
            {seller?.status === 'suspended' && (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 border-0">
                Suspended
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l">
              <Avatar className="h-8 w-8">
                <AvatarImage src={seller?.logo_url} />
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {seller?.shop_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{seller?.shop_name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet context={{ seller, fetchSeller }} />
        </main>
      </div>
    </div>
  );
}
