import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  Store, 
  Package, 
  CreditCard,
  ChevronRight,
  Sparkles,
  Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  icon: typeof Store;
}

interface SellerOnboardingChecklistProps {
  seller: {
    id: string;
    shop_name: string;
    description: string | null;
    logo_url: string | null;
    address: string | null;
    email: string | null;
  };
}

export function SellerOnboardingChecklist({ seller }: SellerOnboardingChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkProgress();
  }, [seller]);

  const checkProgress = async () => {
    if (!seller?.id) return;

    try {
      // Check if seller has products
      const { count: productCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', seller.id);

      // Check if seller has requested a payout (indicates payout setup awareness)
      const { count: payoutCount } = await supabase
        .from('seller_payouts')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', seller.id);

      // Store info complete check
      const storeInfoComplete = Boolean(
        seller.description &&
        seller.logo_url &&
        seller.address &&
        seller.email
      );

      const hasProducts = (productCount || 0) > 0;
      const hasPayoutSetup = (payoutCount || 0) > 0 || storeInfoComplete; // Consider it done if store is fully set up

      setChecklist([
        {
          id: 'store-info',
          title: 'Complete Store Information',
          description: 'Add logo, description, address, and email to build trust with customers.',
          completed: storeInfoComplete,
          link: '/seller/dashboard/settings',
          icon: Store,
        },
        {
          id: 'first-product',
          title: 'Add Your First Product',
          description: 'List your first product to start selling on Shopzon.',
          completed: hasProducts,
          link: '/seller/dashboard/products',
          icon: Package,
        },
        {
          id: 'payout-setup',
          title: 'Understand Payout Process',
          description: 'Review earnings and learn how to request payouts when ready.',
          completed: hasPayoutSetup,
          link: '/seller/dashboard/earnings',
          icon: CreditCard,
        },
      ]);
    } catch (error) {
      console.error('Error checking onboarding progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  // Check localStorage for dismissal
  useEffect(() => {
    const dismissedKey = `seller-onboarding-dismissed-${seller?.id}`;
    const isDismissed = localStorage.getItem(dismissedKey) === 'true';
    setDismissed(isDismissed);
  }, [seller?.id]);

  const handleDismiss = () => {
    const dismissedKey = `seller-onboarding-dismissed-${seller?.id}`;
    localStorage.setItem(dismissedKey, 'true');
    setDismissed(true);
  };

  if (loading || dismissed || allCompleted) {
    // Show completion celebration briefly if all completed
    if (allCompleted && !dismissed) {
      return (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-800 dark:text-green-200">
                    🎉 Onboarding Complete!
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Your store is fully set up. Start selling and watch your business grow!
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-green-700 hover:text-green-800 hover:bg-green-100"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Getting Started</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete these steps to maximize your store's potential
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{completedCount}/{totalCount}</span>
            <p className="text-xs text-muted-foreground">completed</p>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2 mt-4" />
      </CardHeader>
      <CardContent className="space-y-3">
        {checklist.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
              item.completed 
                ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                : 'bg-background hover:bg-secondary border border-border hover:border-primary/30'
            }`}
          >
            <div className={`p-2 rounded-lg ${
              item.completed 
                ? 'bg-green-100 dark:bg-green-900/50'
                : 'bg-primary/10'
            }`}>
              <item.icon className={`h-5 w-5 ${
                item.completed 
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-primary'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`font-medium ${item.completed ? 'text-green-700 dark:text-green-300' : ''}`}>
                  {item.title}
                </p>
                {item.completed && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{item.description}</p>
            </div>
            {!item.completed && (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
