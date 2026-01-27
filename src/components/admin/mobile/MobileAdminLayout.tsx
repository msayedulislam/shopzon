import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { Loader2 } from 'lucide-react';
import { MobileAdminHeader } from './MobileAdminHeader';
import { MobileAdminNav } from './MobileAdminNav';

// Map paths to titles
const pathTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/activity': 'Activity',
  '/admin/profiles': 'Admin Profiles',
  '/admin/orders': 'Orders',
  '/admin/refunds': 'Refunds',
  '/admin/return-requests': 'Return Requests',
  '/admin/products': 'Products',
  '/admin/inventory-alerts': 'Inventory Alerts',
  '/admin/sellers': 'Sellers',
  '/admin/seller-governance': 'Seller Governance',
  '/admin/finance': 'Finance',
  '/admin/couriers': 'Couriers',
  '/admin/campaigns': 'Campaigns',
  '/admin/banners': 'Banners',
  '/admin/fraud': 'Fraud Detection',
  '/admin/users': 'Users',
  '/admin/customer-insights': 'Customer Insights',
  '/admin/wallets': 'Wallets',
  '/admin/categories': 'Categories',
  '/admin/brands': 'Brands',
  '/admin/coupons': 'Coupons',
  '/admin/pages': 'Pages',
  '/admin/blog': 'Blog',
  '/admin/inquiries': 'Inquiries',
  '/admin/notifications': 'Notifications',
  '/admin/ai-suggestions': 'AI Suggestions',
  '/admin/reports': 'Reports',
  '/admin/export-tools': 'Export Tools',
  '/admin/scheduled-actions': 'Scheduled Actions',
  '/admin/role-presets': 'Role Presets',
  '/admin/backup': 'Backup & Restore',
  '/admin/master-data': 'Master Data',
  '/admin/logs': 'Audit Logs',
  '/admin/system-health': 'System Health',
  '/admin/cms': 'CMS',
  '/admin/settings': 'Settings',
  '/admin/menu': 'Menu',
};

export default function MobileAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isAdmin } = useAuth();
  const { unreadCount } = useAdminNotifications();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const currentPath = location.pathname;
  const title = pathTitles[currentPath] || 'Admin';
  const showBack = currentPath !== '/admin' && currentPath !== '/admin/menu';

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileAdminHeader 
        title={title} 
        showBack={showBack}
        backPath="/admin/menu"
        unreadCount={unreadCount}
      />
      
      <main className="p-4">
        <Outlet />
      </main>

      <MobileAdminNav unreadCount={unreadCount} />
    </div>
  );
}
