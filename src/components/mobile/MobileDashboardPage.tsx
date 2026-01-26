import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Package, Heart, MapPin, LogOut, Wallet, Settings, 
  ChevronRight, ArrowLeft, Camera, Bell, ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileBottomNav } from './MobileBottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const menuSections = [
  {
    title: 'My Account',
    items: [
      { icon: User, label: 'Profile', path: '/dashboard/profile', color: 'bg-blue-500/10 text-blue-600' },
      { icon: Package, label: 'My Orders', path: '/dashboard/orders', color: 'bg-orange-500/10 text-orange-600' },
      { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet', color: 'bg-emerald-500/10 text-emerald-600' },
      { icon: Heart, label: 'Wishlist', path: '/wishlist', color: 'bg-rose-500/10 text-rose-600' },
    ]
  },
  {
    title: 'Settings',
    items: [
      { icon: MapPin, label: 'Addresses', path: '/dashboard/addresses', color: 'bg-purple-500/10 text-purple-600' },
      { icon: Bell, label: 'Notifications', path: '/notifications', color: 'bg-amber-500/10 text-amber-600' },
      { icon: Settings, label: 'Settings', path: '/dashboard/settings', color: 'bg-gray-500/10 text-gray-600' },
    ]
  },
];

const stats = [
  { label: 'Orders', value: '12', icon: ShoppingBag, color: 'text-blue-600' },
  { label: 'Wishlist', value: '8', icon: Heart, color: 'text-rose-600' },
  { label: 'Wallet', value: '৳250', icon: Wallet, color: 'text-emerald-600' },
];

export function MobileDashboardPage() {
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-secondary/30 dark:bg-background pb-20">
        <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
          <div className="flex items-center gap-3 h-14 px-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold">My Account</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="font-semibold mb-2">Please login</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Login to access your account
          </p>
          <Link to="/login" className="px-8 py-2.5 bg-primary text-white rounded-full font-medium">
            Login
          </Link>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold">My Account</h1>
          </div>
          <Link to="/notifications" className="p-2 relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </Link>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-card rounded-2xl p-4 border border-border/50"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                  {getInitials(profile?.full_name || user?.email || 'User')}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-lg truncate">
                {profile?.full_name || 'Welcome!'}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email || profile?.phone}
              </p>
            </div>
            <Link to="/dashboard/profile">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="bg-white dark:bg-card rounded-xl p-3 border border-border/50 text-center"
            >
              <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
              <p className="font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + sectionIndex * 0.05 }}
            className="bg-white dark:bg-card rounded-2xl border border-border/50 overflow-hidden"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 pt-4 pb-2">
              {section.title}
            </h3>
            <div className="divide-y divide-border/50">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-full ${item.color} flex items-center justify-center`}>
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="flex-1 font-medium text-sm">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Sign Out */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          onClick={handleSignOut}
          className="w-full bg-white dark:bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-3 text-destructive hover:bg-destructive/5 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-4.5 w-4.5" />
          </div>
          <span className="font-medium text-sm">Sign Out</span>
        </motion.button>
      </div>

      <MobileBottomNav />
    </div>
  );
}
