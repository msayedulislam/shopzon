import { Link } from 'react-router-dom';
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
  Shield,
  MessageSquare,
  BookOpen,
  DollarSign,
  Truck,
  Megaphone,
  ShieldAlert,
  Activity,
  UserCog,
  RotateCcw,
  Wallet,
  Image,
  Sparkles,
  Database,
  Key,
  PenTool,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { MobileAdminHeader } from './MobileAdminHeader';
import { MobileAdminNav } from './MobileAdminNav';
import { ScrollArea } from '@/components/ui/scroll-area';

const menuSections = [
  {
    title: 'Operations',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
      { icon: Activity, label: 'Activity', path: '/admin/activity' },
      { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
      { icon: RotateCcw, label: 'Refunds', path: '/admin/refunds' },
      { icon: RotateCcw, label: 'Return Requests', path: '/admin/return-requests' },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { icon: Package, label: 'Products', path: '/admin/products' },
      { icon: Package, label: 'Inventory Alerts', path: '/admin/inventory-alerts' },
      { icon: Layers, label: 'Categories', path: '/admin/categories' },
      { icon: Tag, label: 'Brands', path: '/admin/brands' },
    ],
  },
  {
    title: 'Sellers & Users',
    items: [
      { icon: Store, label: 'Sellers', path: '/admin/sellers' },
      { icon: UserCog, label: 'Seller Governance', path: '/admin/seller-governance' },
      { icon: Users, label: 'Users', path: '/admin/users' },
      { icon: Users, label: 'Customer Insights', path: '/admin/customer-insights' },
      { icon: Shield, label: 'Admin Profiles', path: '/admin/profiles' },
    ],
  },
  {
    title: 'Finance & Logistics',
    items: [
      { icon: DollarSign, label: 'Finance', path: '/admin/finance' },
      { icon: Wallet, label: 'Wallets', path: '/admin/wallets' },
      { icon: Truck, label: 'Couriers', path: '/admin/couriers' },
      { icon: ShieldAlert, label: 'Fraud Detection', path: '/admin/fraud' },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { icon: Megaphone, label: 'Campaigns', path: '/admin/campaigns' },
      { icon: Image, label: 'Banners', path: '/admin/banners' },
      { icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
      { icon: Sparkles, label: 'AI Suggestions', path: '/admin/ai-suggestions' },
    ],
  },
  {
    title: 'Content',
    items: [
      { icon: FileText, label: 'Pages', path: '/admin/pages' },
      { icon: BookOpen, label: 'Blog', path: '/admin/blog' },
      { icon: PenTool, label: 'CMS', path: '/admin/cms' },
      { icon: MessageSquare, label: 'Inquiries', path: '/admin/inquiries' },
      { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: FileText, label: 'Reports', path: '/admin/reports' },
      { icon: FileText, label: 'Export Tools', path: '/admin/export-tools' },
      { icon: Activity, label: 'Scheduled Actions', path: '/admin/scheduled-actions' },
      { icon: Key, label: 'Role Presets', path: '/admin/role-presets' },
      { icon: Database, label: 'Backup & Restore', path: '/admin/backup' },
      { icon: Database, label: 'Master Data', path: '/admin/master-data' },
      { icon: FileText, label: 'Audit Logs', path: '/admin/logs' },
      { icon: Activity, label: 'System Health', path: '/admin/system-health' },
      { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ],
  },
];

export default function MobileAdminMenu() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileAdminHeader title="Admin Menu" />
      
      <ScrollArea className="h-[calc(100vh-7.5rem)]">
        <div className="p-4 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {section.title}
              </h2>
              <div className="bg-card rounded-xl border overflow-hidden">
                {section.items.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors ${
                      index !== section.items.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <MobileAdminNav />
    </div>
  );
}
