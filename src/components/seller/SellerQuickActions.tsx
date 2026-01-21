import { Link } from 'react-router-dom';
import { 
  Plus, 
  ShoppingBag, 
  DollarSign, 
  Settings, 
  Package,
  Wallet,
  TrendingUp,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Add Product',
    description: 'List a new product',
    icon: Plus,
    href: '/seller/dashboard/products?action=new',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'View Orders',
    description: 'Manage customer orders',
    icon: ShoppingBag,
    href: '/seller/dashboard/orders',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Request Payout',
    description: 'Withdraw your earnings',
    icon: Wallet,
    href: '/seller/dashboard/earnings?tab=payout',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'View Analytics',
    description: 'Track performance',
    icon: TrendingUp,
    href: '/seller/dashboard#analytics',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

export function SellerQuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {quickActions.map((action) => (
        <Link key={action.title} to={action.href}>
          <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className={`p-3 rounded-xl ${action.bgColor} group-hover:scale-110 transition-transform`}>
                <action.icon className={`h-6 w-6 ${action.color}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
