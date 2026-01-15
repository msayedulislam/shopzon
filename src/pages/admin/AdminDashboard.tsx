import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Store,
  Tag,
  Layers,
  Ticket,
  FileText,
  Settings,
  LogOut,
  Menu,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Store, label: 'Sellers', path: '/admin/sellers' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
  { icon: Layers, label: 'Categories', path: '/admin/categories' },
  { icon: Tag, label: 'Brands', path: '/admin/brands' },
  { icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
  { icon: FileText, label: 'Audit Logs', path: '/admin/logs' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const Sidebar = () => (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">B</span>
          </div>
          <div>
            <span className="font-display font-bold">BDMart</span>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Admin Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">Administrator</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
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
        </div>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t">
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-card border-r shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="hidden lg:block">
            <h1 className="font-semibold">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Store
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 bg-secondary/30 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
