import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Package,
  Users,
  ShoppingBag,
  FileText,
  Tag,
  Megaphone,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Bell,
  Zap,
  BarChart3,
  Shield,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const quickActions = [
  { icon: Plus, label: 'Add Product', path: '/admin/products', color: 'bg-blue-500', action: 'add-product' },
  { icon: Users, label: 'Add User', path: '/admin/users', color: 'bg-green-500', action: 'add-user' },
  { icon: Tag, label: 'Create Coupon', path: '/admin/coupons', color: 'bg-purple-500', action: 'add-coupon' },
  { icon: Megaphone, label: 'New Campaign', path: '/admin/campaigns', color: 'bg-orange-500', action: 'add-campaign' },
  { icon: ShoppingBag, label: 'View Orders', path: '/admin/orders', color: 'bg-primary' },
  { icon: FileText, label: 'Generate Report', path: '/admin/reports', color: 'bg-cyan-500' },
  { icon: Bell, label: 'Send Notification', path: '/admin/notifications', color: 'bg-yellow-500' },
  { icon: Settings, label: 'Settings', path: '/admin/settings', color: 'bg-gray-500' },
];

const bulkActions = [
  { icon: Package, label: 'Export Products', action: 'export-products' },
  { icon: Users, label: 'Export Users', action: 'export-users' },
  { icon: ShoppingBag, label: 'Export Orders', action: 'export-orders' },
  { icon: Download, label: 'Download Backup', action: 'download-backup' },
  { icon: Upload, label: 'Import Data', action: 'import-data' },
  { icon: RefreshCw, label: 'Sync Inventory', action: 'sync-inventory' },
];

export function AdminQuickActions() {
  const [isOpen, setIsOpen] = useState(false);

  const handleBulkAction = (action: string) => {
    toast.success(`${action.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} initiated`);
    setIsOpen(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.path}>
              <Button
                variant="ghost"
                className="w-full h-auto flex flex-col items-center gap-2 p-3 hover:bg-secondary"
              >
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="text-xs text-center font-medium leading-tight">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <BarChart3 className="h-4 w-4" />
                Bulk Operations
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Operations</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {bulkActions.map((action) => (
                  <Button
                    key={action.action}
                    variant="outline"
                    className="h-auto flex flex-col items-center gap-2 p-4"
                    onClick={() => handleBulkAction(action.action)}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
