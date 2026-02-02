/**
 * LOYALTY & DISCOUNT ENGINE (Simulated)
 * 
 * This module simulates a loyalty program with points, tiers, and discounts.
 * 
 * DESIGN NOTES:
 * 
 * Current Implementation (Rule-Based):
 * - Points based on spending and behavior
 * - Static tier thresholds
 * - Discount percentages per tier
 * 
 * Future ML Evolution:
 * - Features: trip frequency, avg spend, settlement time, category preferences
 * - Model: Predict churn, optimize personalized rewards
 * - Feedback loop: A/B test discount offers, track redemption rates
 */

import {
  LoyaltyProfile,
  LoyaltyTier,
  LOYALTY_TIERS,
  User,
  Settlement,
  Trip,
} from '@/types';

// Points earning rules
const POINTS_PER_DOLLAR_SPENT = 1;
const POINTS_PER_TRIP = 100;
const POINTS_FOR_FAST_SETTLEMENT = 50; // Settle within 24h
const POINTS_FOR_REFERRAL = 500;

/**
 * Calculate loyalty points from user activity
 */
export function calculateLoyaltyPoints(
  totalSpent: number,
  tripsCompleted: number,
  fastSettlements: number,
  referrals: number = 0
): number {
  return Math.floor(
    totalSpent * POINTS_PER_DOLLAR_SPENT +
    tripsCompleted * POINTS_PER_TRIP +
    fastSettlements * POINTS_FOR_FAST_SETTLEMENT +
    referrals * POINTS_FOR_REFERRAL
  );
}

/**
 * Calculate settlement score (0-100)
 * Based on how quickly a user settles their debts
 */
export function calculateSettlementScore(
  settlements: Settlement[],
  userId: string
): number {
  const userSettlements = settlements.filter(
    (s) => s.fromUserId === userId && s.status === 'completed'
  );
  
  if (userSettlements.length === 0) return 100; // Benefit of the doubt
  
  let scoreSum = 0;
  
  userSettlements.forEach((settlement) => {
    if (!settlement.settledAt) {
      scoreSum += 50; // Incomplete data
      return;
    }
    
    const daysToSettle = Math.ceil(
      (settlement.settledAt.getTime() - settlement.createdAt.getTime()) /
      (1000 * 60 * 60 * 24)
    );
    
    // Score based on settlement speed
    if (daysToSettle <= 1) {
      scoreSum += 100;
    } else if (daysToSettle <= 3) {
      scoreSum += 90;
    } else if (daysToSettle <= 7) {
      scoreSum += 75;
    } else if (daysToSettle <= 14) {
      scoreSum += 50;
    } else {
      scoreSum += 25;
    }
  });
  
  return Math.round(scoreSum / userSettlements.length);
}

/**
 * Determine loyalty tier from points
 */
export function getTierFromPoints(points: number): LoyaltyTier {
  if (points >= LOYALTY_TIERS.platinum.minPoints) return 'platinum';
  if (points >= LOYALTY_TIERS.gold.minPoints) return 'gold';
  if (points >= LOYALTY_TIERS.silver.minPoints) return 'silver';
  return 'bronze';
}

/**
 * Get next tier and points needed
 */
export function getNextTierInfo(
  currentPoints: number
): { nextTier: LoyaltyTier | null; pointsNeeded: number } {
  const currentTier = getTierFromPoints(currentPoints);
  
  const tiers: LoyaltyTier[] = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  
  if (currentIndex >= tiers.length - 1) {
    return { nextTier: null, pointsNeeded: 0 };
  }
  
  const nextTier = tiers[currentIndex + 1];
  const pointsNeeded = LOYALTY_TIERS[nextTier].minPoints - currentPoints;
  
  return { nextTier, pointsNeeded };
}

/**
 * Build complete loyalty profile for a user
 */
export function buildLoyaltyProfile(
  user: User,
  trips: Trip[],
  settlements: Settlement[],
  totalSpent: number
): LoyaltyProfile {
  const completedTrips = trips.filter((t) => t.status === 'completed');
  const fastSettlements = settlements.filter((s) => {
    if (s.fromUserId !== user.id || !s.settledAt) return false;
    const hours = (s.settledAt.getTime() - s.createdAt.getTime()) / (1000 * 60 * 60);
    return hours <= 24;
  }).length;
  
  const points = calculateLoyaltyPoints(
    totalSpent,
    completedTrips.length,
    fastSettlements
  );
  
  const tier = getTierFromPoints(points);
  const tierInfo = LOYALTY_TIERS[tier];
  const nextInfo = getNextTierInfo(points);
  
  return {
    userId: user.id,
    totalTrips: trips.length,
    totalSpent,
    settlementScore: calculateSettlementScore(settlements, user.id),
    points,
    tier,
    discountPercentage: tierInfo.discount,
    nextTierPoints: nextInfo.nextTier ? LOYALTY_TIERS[nextInfo.nextTier].minPoints : undefined,
    benefits: tierInfo.benefits,
  };
}

/**
 * Calculate discount for a given amount
 */
export function applyLoyaltyDiscount(
  amount: number,
  tier: LoyaltyTier
): { originalAmount: number; discount: number; finalAmount: number } {
  const discountPercentage = LOYALTY_TIERS[tier].discount;
  const discount = (amount * discountPercentage) / 100;
  
  return {
    originalAmount: amount,
    discount: Math.round(discount * 100) / 100,
    finalAmount: Math.round((amount - discount) * 100) / 100,
  };
}

/**
 * =========================================
 * FUTURE ML EVOLUTION NOTES
 * =========================================
 * 
 * FEATURES TO TRAIN ON:
 * 1. Trip frequency (trips per month/quarter)
 * 2. Average trip spend
 * 3. Settlement velocity (avg time to settle)
 * 4. Category preferences (% spend by category)
 * 5. Group size preferences
 * 6. Seasonal patterns
 * 7. Engagement metrics (app opens, features used)
 * 
 * POTENTIAL MODELS:
 * 1. Churn Prediction: Logistic regression / XGBoost
 *    - Predict users likely to stop using the platform
 *    - Target with retention offers
 * 
 * 2. Dynamic Pricing: Contextual bandit
 *    - Personalize discount offers
 *    - Maximize LTV while minimizing discount spend
 * 
 * 3. Tier Recommendation: Classification
 *    - Suggest optimal tier upgrades
 *    - Show personalized benefits preview
 * 
 * FEEDBACK LOOP:
 * 1. Track offer impressions and redemptions
 * 2. A/B test different discount levels
 * 3. Monitor settlement behavior changes
 * 4. Measure retention impact of tier upgrades
 * 5. Adjust tier thresholds based on engagement data
 */
