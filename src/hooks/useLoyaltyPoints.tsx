import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LoyaltyInfo {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalEarned: number;
  totalRedeemed: number;
  nextTierPoints: number;
  multiplier: number;
}

const tierConfig = {
  bronze: { min: 0, max: 999, multiplier: 1, name: 'Bronze' },
  silver: { min: 1000, max: 4999, multiplier: 1.25, name: 'Silver' },
  gold: { min: 5000, max: 14999, multiplier: 1.5, name: 'Gold' },
  platinum: { min: 15000, max: Infinity, multiplier: 2, name: 'Platinum' },
};

export function useLoyaltyPoints() {
  const { user } = useAuth();
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoyaltyInfo(null);
      setLoading(false);
      return;
    }

    fetchLoyaltyInfo();
  }, [user]);

  const fetchLoyaltyInfo = async () => {
    try {
      // Calculate points from orders (1 point per ৳10 spent)
      const { data: orders } = await supabase
        .from('orders')
        .select('total, status')
        .eq('user_id', user?.id)
        .eq('status', 'delivered');

      const totalSpent = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const earnedPoints = Math.floor(totalSpent / 10);

      // Get redeemed points from wallet transactions
      const { data: redemptions } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('user_id', user?.id)
        .eq('reference_type', 'loyalty_redemption');

      const redeemedPoints = redemptions?.reduce((sum, r) => sum + Math.abs(r.amount) * 100, 0) || 0;

      const currentPoints = Math.max(0, earnedPoints - redeemedPoints);

      // Determine tier
      let tier: LoyaltyInfo['tier'] = 'bronze';
      for (const [tierName, config] of Object.entries(tierConfig)) {
        if (currentPoints >= config.min && currentPoints <= config.max) {
          tier = tierName as LoyaltyInfo['tier'];
          break;
        }
      }

      const currentTierConfig = tierConfig[tier];
      const nextTierPoints = tier === 'platinum' ? 0 : tierConfig[
        tier === 'bronze' ? 'silver' : tier === 'silver' ? 'gold' : 'platinum'
      ].min - currentPoints;

      setLoyaltyInfo({
        points: currentPoints,
        tier,
        totalEarned: earnedPoints,
        totalRedeemed: redeemedPoints,
        nextTierPoints: Math.max(0, nextTierPoints),
        multiplier: currentTierConfig.multiplier,
      });
    } catch (error) {
      console.error('Error fetching loyalty info:', error);
    } finally {
      setLoading(false);
    }
  };

  const redeemPoints = async (points: number): Promise<boolean> => {
    if (!user || !loyaltyInfo || points > loyaltyInfo.points) {
      return false;
    }

    // 100 points = ৳1 credit
    const creditAmount = points / 100;

    try {
      const { error } = await supabase.rpc('credit_wallet', {
        p_user_id: user.id,
        p_amount: creditAmount,
        p_reference_type: 'loyalty_redemption',
        p_reference_id: user.id,
        p_description: `Redeemed ${points} loyalty points`,
      });

      if (error) throw error;

      await fetchLoyaltyInfo();
      return true;
    } catch (error) {
      console.error('Error redeeming points:', error);
      return false;
    }
  };

  return {
    loyaltyInfo,
    loading,
    redeemPoints,
    tierConfig,
    refresh: fetchLoyaltyInfo,
  };
}
