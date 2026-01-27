import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Package, Heart, MapPin, LogOut, Wallet, Settings, 
  ChevronRight, Menu, ShoppingBag, Bell, HelpCircle, 
  CreditCard, Gift, Shield, Truck, RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const quickActions = [
  { icon: Package, label: 'My Orders', path: '/dashboard/orders', bgColor: 'bg-primary/10', iconColor: 'text-primary' },
  { icon: Truck, label: 'Track Order', path: '/dashboard/orders', bgColor: 'bg-blue-500/10', iconColor: 'text-blue-500' },
  { icon: RotateCcw, label: 'Returns', path: '/dashboard/orders', bgColor: 'bg-orange-500/10', iconColor: 'text-orange-500' },
  { icon: HelpCircle, label: 'Help', path: '/help', bgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
];

const menuItems = [
  { icon: User, label: 'Edit Profile', path: '/dashboard/profile' },
  { icon: MapPin, label: 'Saved Addresses', path: '/dashboard/addresses' },
  { icon: Heart, label: 'My Wishlist', path: '/wishlist' },
  { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
  { icon: Gift, label: 'Coupons', path: '/dashboard/coupons' },
  { icon: CreditCard, label: 'Payment Methods', path: '/dashboard/payments' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  { icon: Shield, label: 'Privacy & Security', path: '/dashboard/security' },
  { icon: HelpCircle, label: 'Help Center', path: '/help' },
];

export function MobileDashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary/30 dark:bg-background pb-20">
        <MobileHeader showBack title="My Account" />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-primary/60" />
          </div>
          <h2 className="font-semibold text-lg mb-2">Welcome!</h2>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-[260px]">
            Sign in to access your orders and personalized experience
          </p>
          <Link 
            to="/login" 
            className="px-8 py-2.5 bg-primary text-white rounded-full font-medium text-sm"
          >
            Sign In
          </Link>
          <Link to="/register" className="mt-3 text-sm text-primary font-medium">
            Create an account
          </Link>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background pb-20 pt-3">
      <div className="px-3 pb-4 space-y-3">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card dark:bg-card/80 rounded-xl p-3 border border-border/50"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary text-white font-semibold text-sm">
                {getInitials(profile?.full_name || user?.email || 'User')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm truncate">
                {profile?.full_name || 'Welcome!'}
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                My Account
              </p>
            </div>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  <Menu className="h-4 w-4 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <div className="flex flex-col h-full">
                  {/* Menu Header */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-primary text-white text-sm">
                          {getInitials(profile?.full_name || user?.email || 'User')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <nav className="flex-1 py-2 overflow-y-auto">
                    {menuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                      >
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.label}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                      </Link>
                    ))}
                  </nav>

                  {/* Sign Out */}
                  <div className="p-4 border-t border-border">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.div>

        {/* Greeting Card with CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 rounded-xl p-4 text-white"
        >
          <p className="text-xs text-white/70 mb-0.5">{getGreeting()},</p>
          <h3 className="text-lg font-bold mb-1.5">
            {profile?.full_name || 'Welcome!'}
          </h3>
          <p className="text-xs text-white/80 mb-4">
            Here's what's happening with your orders today.
          </p>
          <Link 
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-xs font-medium transition-colors"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Continue Shopping
          </Link>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-2"
        >
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="flex flex-col items-center gap-1.5 p-3 bg-card dark:bg-card/80 rounded-xl border border-border/50"
            >
              <div className={`w-10 h-10 rounded-xl ${action.bgColor} flex items-center justify-center`}>
                <action.icon className={`h-5 w-5 ${action.iconColor}`} />
              </div>
              <span className="text-[10px] font-medium text-center leading-tight">{action.label}</span>
            </Link>
          ))}
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card dark:bg-card/80 rounded-xl border border-border/50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
            <h3 className="text-xs font-semibold">Quick Links</h3>
            <Link to="/dashboard/orders" className="text-xs text-primary font-medium">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            <Link to="/dashboard/orders" className="flex items-center gap-3 px-3 py-3 hover:bg-secondary/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">My Orders</p>
                <p className="text-[10px] text-muted-foreground">Track and manage orders</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/wishlist" className="flex items-center gap-3 px-3 py-3 hover:bg-secondary/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <Heart className="h-4 w-4 text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Wishlist</p>
                <p className="text-[10px] text-muted-foreground">Your saved items</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/dashboard/wallet" className="flex items-center gap-3 px-3 py-3 hover:bg-secondary/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Wallet</p>
                <p className="text-[10px] text-muted-foreground">Balance & transactions</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/dashboard/addresses" className="flex items-center gap-3 px-3 py-3 hover:bg-secondary/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Addresses</p>
                <p className="text-[10px] text-muted-foreground">Manage delivery addresses</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </motion.div>

        {/* Sign Out Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleSignOut}
          className="w-full bg-card dark:bg-card/80 rounded-xl border border-destructive/20 p-3 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </motion.button>

        {/* Version */}
        <p className="text-center text-[10px] text-muted-foreground pt-1">
          Jhuri v1.0.0
        </p>
      </div>

      <MobileBottomNav />
    </div>
  );
}
