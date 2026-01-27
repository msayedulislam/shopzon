import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Package, Heart, MapPin, LogOut, Wallet, Settings, 
  ChevronRight, ArrowLeft, Camera, Bell, ShoppingBag, 
  CreditCard, Gift, HelpCircle, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileBottomNav } from './MobileBottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const quickActions = [
  { icon: Package, label: 'Orders', path: '/dashboard/orders', color: 'from-orange-500 to-amber-400' },
  { icon: Heart, label: 'Wishlist', path: '/wishlist', color: 'from-rose-500 to-pink-400' },
  { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet', color: 'from-emerald-500 to-teal-400' },
  { icon: Gift, label: 'Coupons', path: '/dashboard/coupons', color: 'from-purple-500 to-violet-400' },
];

const menuSections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Edit Profile', description: 'Update your personal info', path: '/dashboard/profile' },
      { icon: MapPin, label: 'Saved Addresses', description: 'Manage delivery locations', path: '/dashboard/addresses' },
      { icon: CreditCard, label: 'Payment Methods', description: 'Cards & saved payments', path: '/dashboard/payments' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', description: 'Alerts & updates', path: '/notifications' },
      { icon: Settings, label: 'Settings', description: 'App preferences', path: '/dashboard/settings' },
      { icon: Shield, label: 'Privacy & Security', description: 'Password & data', path: '/dashboard/security' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help Center', description: 'FAQs & support', path: '/help' },
    ]
  },
];

export function MobileDashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, wallet: 0 });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
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

  const fetchStats = async () => {
    if (!user) return;
    
    // Fetch order count
    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    // Fetch wishlist count
    const { count: wishlistCount } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    // Fetch wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();
    
    setStats({
      orders: orderCount || 0,
      wishlist: wishlistCount || 0,
      wallet: wallet?.balance || 0,
    });
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background dark:from-background dark:to-background pb-20">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-xl border-b border-border/50 safe-area-top">
          <div className="flex items-center gap-3 h-14 px-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold">My Account</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
            <User className="h-12 w-12 text-primary/60" />
          </div>
          <h2 className="font-semibold text-xl mb-2">Welcome!</h2>
          <p className="text-sm text-muted-foreground text-center mb-8 max-w-[280px]">
            Sign in to access your orders, wishlist, and personalized recommendations
          </p>
          <Link 
            to="/login" 
            className="px-10 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Sign In
          </Link>
          <Link to="/register" className="mt-4 text-sm text-primary font-medium">
            Create an account
          </Link>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background dark:from-background dark:to-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-xl border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold">My Account</h1>
          </div>
          <Link to="/notifications" className="p-2 relative rounded-full hover:bg-secondary/80 transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-card" />
          </Link>
        </div>
      </header>

      <div className="px-4 pt-4 pb-6 space-y-5">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl p-5 text-white shadow-xl shadow-primary/20"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white" />
          </div>
          
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-18 w-18 border-3 border-white/30 shadow-lg">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-white/20 text-white font-bold text-xl backdrop-blur-sm">
                  {getInitials(profile?.full_name || user?.email || 'User')}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white text-primary flex items-center justify-center shadow-lg">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-xl truncate">
                {profile?.full_name || 'Welcome!'}
              </h2>
              <p className="text-sm text-white/80 truncate mt-0.5">
                {user?.email || profile?.phone}
              </p>
              <Link 
                to="/dashboard/profile" 
                className="inline-flex items-center gap-1 text-xs font-medium text-white/90 mt-2 hover:text-white transition-colors"
              >
                View Profile <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="relative grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.orders}</p>
              <p className="text-xs text-white/70 mt-0.5">Orders</p>
            </div>
            <div className="text-center border-x border-white/20">
              <p className="text-2xl font-bold">{stats.wishlist}</p>
              <p className="text-xs text-white/70 mt-0.5">Wishlist</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">৳{stats.wallet}</p>
              <p className="text-xs text-white/70 mt-0.5">Wallet</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-3"
        >
          {quickActions.map((action, index) => (
            <Link
              key={action.path}
              to={action.path}
              className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-center">{action.label}</span>
            </Link>
          ))}
        </motion.div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + sectionIndex * 0.05 }}
            className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-4 pb-2">
              {section.title}
            </h3>
            <div className="divide-y divide-border/50">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/50 active:bg-secondary transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-foreground/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Sign Out */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleSignOut}
          className="w-full bg-white dark:bg-card rounded-2xl border border-destructive/20 p-4 flex items-center justify-center gap-3 text-destructive hover:bg-destructive/5 active:bg-destructive/10 transition-colors shadow-sm"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-semibold">Sign Out</span>
        </motion.button>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground pt-2">
          Jhuri v1.0.0
        </p>
      </div>

      <MobileBottomNav />
    </div>
  );
}
