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
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-background pb-24 pt-4">
      <div className="px-4 pb-4 space-y-6">
        {/* Profile Card - Premium Glass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden p-6 rounded-[2.5rem] bg-white dark:bg-card border border-border/5 shadow-xl shadow-primary/5 group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-700" />
          <div className="flex items-center gap-4 relative">
            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary text-white font-black text-xl">
                {getInitials(profile?.full_name || user?.email || 'User')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black uppercase tracking-tighter italic truncate">
                {profile?.full_name || 'Govaly User'}
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                {user?.email}
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/settings')}
              className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center active:scale-95 transition-all"
            >
              <Settings className="h-4.5 w-4.5 text-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Quick Stats / Greeting */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary p-5 rounded-[2rem] text-white shadow-lg shadow-primary/30 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 p-2 opacity-20">
              <ShoppingBag className="h-10 w-10 text-white" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/70 mb-1">{getGreeting()}</p>
            <h3 className="text-sm font-black uppercase tracking-tight italic">Shop Now</h3>
            <Link to="/products" className="mt-4 inline-flex items-center text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-full">
              Explore <ChevronRight className="h-3 w-3 ml-1" strokeWidth={3} />
            </Link>
          </div>

          <div className="bg-white dark:bg-card p-5 rounded-[2rem] border border-border/5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-orange-500" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Orders</p>
                <h4 className="text-sm font-black uppercase tracking-tighter">My List</h4>
              </div>
            </div>
            <Link to="/dashboard/orders" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center">
              View Orders <ChevronRight className="h-3 w-3 ml-1" strokeWidth={3} />
            </Link>
          </div>
        </div>

        {/* Quick Actions Grid - High Density */}
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-card rounded-3xl border border-border/5 shadow-sm active:scale-95 transition-all"
            >
              <div className={`w-10 h-10 rounded-2xl ${action.bgColor} flex items-center justify-center`}>
                <action.icon className={`h-5 w-5 ${action.iconColor}`} strokeWidth={2.5} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-tight">{action.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>

        {/* Main Menu Sections */}
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border/10">
            <h3 className="text-[12px] font-black uppercase tracking-widest italic">My Account</h3>
          </div>
          <div className="divide-y divide-border/5">
            {menuItems.slice(0, 7).map((item, index) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-all w-full text-left active:bg-secondary/50 group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <item.icon className="h-4.5 w-4.5" strokeWidth={2.5} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest flex-1">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={3} />
              </button>
            ))}
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full h-14 bg-white dark:bg-card rounded-[2rem] border-2 border-primary/10 flex items-center justify-center gap-3 text-primary active:scale-[0.98] transition-all shadow-sm"
        >
          <LogOut className="h-5 w-5" strokeWidth={3} />
          <span className="text-xs font-black uppercase tracking-widest">Sign Out from Account</span>
        </button>

        {/* Version */}
        <div className="flex flex-col items-center pt-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
            Govaly v1.0.0
          </p>
          <div className="mt-2 h-1 w-12 rounded-full bg-border/20" />
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
