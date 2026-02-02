import { motion } from 'framer-motion';
import { Trophy, Star, Gift, ArrowUp, Sparkles, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LoyaltyProfile, LoyaltyTier, LOYALTY_TIERS } from '@/types';

const tierColors: Record<LoyaltyTier, { bg: string; text: string; icon: string }> = {
  bronze: { bg: 'bg-amber-700/10', text: 'text-amber-700', icon: '🥉' },
  silver: { bg: 'bg-slate-400/10', text: 'text-slate-500', icon: '🥈' },
  gold: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', icon: '🥇' },
  platinum: { bg: 'bg-purple-500/10', text: 'text-purple-600', icon: '💎' },
};

interface LoyaltyCardProps {
  profile: LoyaltyProfile;
}

const LoyaltyCard = ({ profile }: LoyaltyCardProps) => {
  const tierConfig = tierColors[profile.tier];
  const tierInfo = LOYALTY_TIERS[profile.tier];
  const progressToNext = profile.nextTierPoints
    ? ((profile.points - tierInfo.minPoints) / (profile.nextTierPoints - tierInfo.minPoints)) * 100
    : 100;

  return (
    <Card className="overflow-hidden">
      {/* Tier banner */}
      <div className={`${tierConfig.bg} p-6 border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{tierConfig.icon}</span>
            <div>
              <p className="text-sm text-muted-foreground">Your Status</p>
              <h3 className={`text-2xl font-bold capitalize ${tierConfig.text}`}>
                {profile.tier} Member
              </h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="text-3xl font-bold">{profile.points.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress to next tier */}
        {profile.nextTierPoints && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Progress to next tier
              </span>
              <span className="font-medium">
                {profile.nextTierPoints - profile.points} points to go
              </span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted rounded-xl">
            <p className="text-2xl font-bold">{profile.totalTrips}</p>
            <p className="text-xs text-muted-foreground">Trips</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-xl">
            <p className="text-2xl font-bold">${(profile.totalSpent / 1000).toFixed(1)}k</p>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-xl">
            <p className="text-2xl font-bold">{profile.settlementScore}</p>
            <p className="text-xs text-muted-foreground">Settlement Score</p>
          </div>
        </div>

        {/* Current discount */}
        {profile.discountPercentage > 0 && (
          <div className="flex items-center gap-3 p-4 bg-success/10 rounded-xl border border-success/20 mb-6">
            <Gift className="w-6 h-6 text-success" />
            <div>
              <p className="font-medium text-success">
                {profile.discountPercentage}% Discount Active
              </p>
              <p className="text-sm text-muted-foreground">
                Applied to all premium features
              </p>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Your Benefits
          </h4>
          <div className="space-y-2">
            {profile.benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 text-sm"
              >
                <Check className="w-4 h-4 text-success shrink-0" />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface TierComparisonProps {
  currentTier: LoyaltyTier;
}

const TierComparison = ({ currentTier }: TierComparisonProps) => {
  const tiers: LoyaltyTier[] = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tier Benefits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {tiers.map((tier, index) => {
            const config = tierColors[tier];
            const info = LOYALTY_TIERS[tier];
            const isActive = index <= currentIndex;
            const isCurrent = tier === currentTier;

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-xl border text-center ${
                  isCurrent 
                    ? 'border-primary bg-primary/5' 
                    : isActive 
                      ? 'border-border bg-card' 
                      : 'border-dashed border-border bg-muted/30'
                }`}
              >
                {isCurrent && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">
                    Current
                  </Badge>
                )}
                <span className="text-2xl block mb-2">{config.icon}</span>
                <p className={`font-medium capitalize ${isActive ? config.text : 'text-muted-foreground'}`}>
                  {tier}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {info.discount}% off
                </p>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export { LoyaltyCard, TierComparison };
