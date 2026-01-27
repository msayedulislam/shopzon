import { useState } from 'react';
import { Gift, Star, Trophy, Sparkles, ChevronRight, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints';
import { formatPrice } from '@/data/mockData';
import { toast } from 'sonner';

const tierIcons = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
};

const tierColors = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-purple-400 to-purple-600',
};

export function LoyaltyPointsWidget({ compact = false }: { compact?: boolean }) {
  const { loyaltyInfo, loading, redeemPoints, tierConfig } = useLoyaltyPoints();
  const [isOpen, setIsOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  if (loading || !loyaltyInfo) {
    return null;
  }

  const handleRedeem = async () => {
    const points = parseInt(redeemAmount);
    if (isNaN(points) || points < 100) {
      toast.error('Minimum redemption is 100 points');
      return;
    }
    if (points > loyaltyInfo.points) {
      toast.error('Insufficient points');
      return;
    }

    setRedeeming(true);
    const success = await redeemPoints(points);
    setRedeeming(false);

    if (success) {
      toast.success(`Redeemed ${points} points for ${formatPrice(points / 100)} credit!`);
      setRedeemAmount('');
      setIsOpen(false);
    } else {
      toast.error('Failed to redeem points');
    }
  };

  const currentTier = tierConfig[loyaltyInfo.tier];
  const nextTier = loyaltyInfo.tier === 'platinum' ? null : tierConfig[
    loyaltyInfo.tier === 'bronze' ? 'silver' : loyaltyInfo.tier === 'silver' ? 'gold' : 'platinum'
  ];
  const progressToNextTier = nextTier 
    ? ((loyaltyInfo.points - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${tierColors[loyaltyInfo.tier]} text-white`}>
                <Gift className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Loyalty Points</p>
                <p className="font-bold text-lg">{loyaltyInfo.points.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                {tierIcons[loyaltyInfo.tier]} {loyaltyInfo.tier.charAt(0).toUpperCase() + loyaltyInfo.tier.slice(1)}
              </Badge>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </motion.button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Loyalty Rewards
            </DialogTitle>
          </DialogHeader>
          <LoyaltyDetails 
            loyaltyInfo={loyaltyInfo}
            progressToNextTier={progressToNextTier}
            redeemAmount={redeemAmount}
            setRedeemAmount={setRedeemAmount}
            handleRedeem={handleRedeem}
            redeeming={redeeming}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Loyalty Rewards
          </span>
          <Badge variant="outline" className="gap-1">
            {tierIcons[loyaltyInfo.tier]} {loyaltyInfo.tier.charAt(0).toUpperCase() + loyaltyInfo.tier.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LoyaltyDetails 
          loyaltyInfo={loyaltyInfo}
          progressToNextTier={progressToNextTier}
          redeemAmount={redeemAmount}
          setRedeemAmount={setRedeemAmount}
          handleRedeem={handleRedeem}
          redeeming={redeeming}
        />
      </CardContent>
    </Card>
  );
}

function LoyaltyDetails({ 
  loyaltyInfo, 
  progressToNextTier, 
  redeemAmount, 
  setRedeemAmount, 
  handleRedeem, 
  redeeming 
}: any) {
  return (
    <div className="space-y-4">
      {/* Points Display */}
      <div className={`p-4 rounded-xl bg-gradient-to-br ${tierColors[loyaltyInfo.tier]} text-white text-center`}>
        <Sparkles className="h-8 w-8 mx-auto mb-2" />
        <p className="text-3xl font-bold">{loyaltyInfo.points.toLocaleString()}</p>
        <p className="text-sm opacity-90">Available Points</p>
        <p className="text-xs mt-1 opacity-75">{loyaltyInfo.multiplier}x earning multiplier</p>
      </div>

      {/* Progress to Next Tier */}
      {loyaltyInfo.tier !== 'platinum' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to next tier</span>
            <span className="font-medium">{loyaltyInfo.nextTierPoints} pts to go</span>
          </div>
          <Progress value={progressToNextTier} className="h-2" />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 rounded-lg bg-secondary">
          <p className="text-xl font-bold text-green-600">{loyaltyInfo.totalEarned.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Earned</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary">
          <p className="text-xl font-bold text-primary">{loyaltyInfo.totalRedeemed.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Redeemed</p>
        </div>
      </div>

      {/* Redeem Section */}
      <div className="space-y-3 pt-2 border-t">
        <p className="text-sm font-medium flex items-center gap-2">
          <Coins className="h-4 w-4" />
          Redeem Points (100 pts = ৳1)
        </p>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter points"
            value={redeemAmount}
            onChange={(e) => setRedeemAmount(e.target.value)}
            min={100}
            max={loyaltyInfo.points}
          />
          <Button onClick={handleRedeem} disabled={redeeming || !redeemAmount}>
            {redeeming ? 'Redeeming...' : 'Redeem'}
          </Button>
        </div>
        {redeemAmount && parseInt(redeemAmount) >= 100 && (
          <p className="text-sm text-muted-foreground">
            You'll receive {formatPrice(parseInt(redeemAmount) / 100)} wallet credit
          </p>
        )}
      </div>

      {/* How to Earn */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        <p className="font-medium">How to earn:</p>
        <p>• Earn 1 point for every ৳10 spent</p>
        <p>• Higher tiers = higher earning multiplier</p>
        <p>• Points never expire!</p>
      </div>
    </div>
  );
}
