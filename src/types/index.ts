// Core Domain Types for TripSplit Platform

// ============================================
// USER & AUTHENTICATION
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: Date;
  loyaltyPoints: number;
  tier: LoyaltyTier;
  plan: UserPlan;
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type UserPlan = 'free' | 'pro' | 'enterprise';

// ============================================
// TRIP & GROUP MANAGEMENT
// ============================================

export interface Trip {
  id: string;
  name: string;
  description?: string;
  destination: string;
  baseCurrency: Currency;
  startDate: Date;
  endDate: Date;
  budget: number;
  status: TripStatus;
  coverImageUrl?: string;
  createdBy: string;
  createdAt: Date;
  participants: TripParticipant[];
}

export type TripStatus = 'planning' | 'active' | 'completed' | 'archived';

export interface TripParticipant {
  id: string;
  tripId: string;
  userId: string;
  user: User;
  role: ParticipantRole;
  joinedAt: Date;
  netBalance: number; // Positive = owed money, Negative = owes money
}

export type ParticipantRole = 'owner' | 'admin' | 'member';

// ============================================
// EXPENSE SPLITTING ENGINE
// ============================================

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: Currency;
  amountInBaseCurrency: number; // Converted amount
  category: ExpenseCategory;
  paidBy: string; // User ID
  paidByUser?: User;
  splitType: SplitType;
  splits: ExpenseSplit[];
  receipt?: string; // URL to receipt image
  notes?: string;
  date: Date;
  createdAt: Date;
}

export type SplitType = 'equal' | 'unequal' | 'percentage';

export interface ExpenseSplit {
  userId: string;
  user?: User;
  amount: number; // In base currency
  percentage?: number; // For percentage splits
  isPaid: boolean;
}

export type ExpenseCategory = 
  | 'accommodation'
  | 'transport'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'other';

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'accommodation', label: 'Accommodation', icon: '🏨' },
  { value: 'transport', label: 'Transport', icon: '✈️' },
  { value: 'food', label: 'Food & Drinks', icon: '🍽️' },
  { value: 'activities', label: 'Activities', icon: '🎭' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'health', label: 'Health', icon: '💊' },
  { value: 'other', label: 'Other', icon: '📦' },
];

// ============================================
// SETTLEMENTS & BALANCES
// ============================================

export interface Settlement {
  id: string;
  tripId: string;
  fromUserId: string;
  fromUser?: User;
  toUserId: string;
  toUser?: User;
  amount: number;
  currency: Currency;
  status: SettlementStatus;
  method?: PaymentMethod;
  settledAt?: Date;
  createdAt: Date;
}

export type SettlementStatus = 'pending' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'venmo' | 'paypal' | 'other';

export interface BalanceSheet {
  tripId: string;
  balances: UserBalance[];
  suggestedSettlements: SuggestedSettlement[];
  totalSpent: number;
  currency: Currency;
}

export interface UserBalance {
  userId: string;
  user: User;
  totalPaid: number;
  totalOwed: number;
  netBalance: number; // Positive = gets money back, Negative = needs to pay
}

export interface SuggestedSettlement {
  fromUserId: string;
  fromUser: User;
  toUserId: string;
  toUser: User;
  amount: number;
}

// ============================================
// BUDGET PLANNER
// ============================================

export interface BudgetPlan {
  tripId: string;
  totalBudget: number;
  currency: Currency;
  duration: number; // Days
  dailyBudget: number;
  categoryAllocations: CategoryAllocation[];
  actualSpending: CategorySpending[];
  alerts: BudgetAlert[];
}

export interface CategoryAllocation {
  category: ExpenseCategory;
  allocated: number;
  percentage: number;
}

export interface CategorySpending {
  category: ExpenseCategory;
  allocated: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface BudgetAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  category?: ExpenseCategory;
  createdAt: Date;
}

// ============================================
// CURRENCIES & FX
// ============================================

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR' | 'AUD' | 'CAD' | 'SGD' | 'THB' | 'MXN';

export const CURRENCIES: { code: Currency; name: string; symbol: string }[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
];

// Hard-coded FX rates (relative to USD) for simulation
export const FX_RATES: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  INR: 83.12,
  AUD: 1.53,
  CAD: 1.36,
  SGD: 1.34,
  THB: 35.50,
  MXN: 17.15,
};

// ============================================
// LOYALTY & DISCOUNTS
// ============================================

export interface LoyaltyProfile {
  userId: string;
  totalTrips: number;
  totalSpent: number;
  settlementScore: number; // 0-100, based on timely settlements
  points: number;
  tier: LoyaltyTier;
  discountPercentage: number;
  nextTierPoints?: number;
  benefits: string[];
}

export const LOYALTY_TIERS: Record<LoyaltyTier, { minPoints: number; discount: number; benefits: string[] }> = {
  bronze: {
    minPoints: 0,
    discount: 0,
    benefits: ['Basic expense tracking', 'Up to 3 trips'],
  },
  silver: {
    minPoints: 1000,
    discount: 5,
    benefits: ['5% discount on premium features', 'Up to 10 trips', 'Priority support'],
  },
  gold: {
    minPoints: 5000,
    discount: 10,
    benefits: ['10% discount', 'Unlimited trips', 'AI budget insights', 'Export reports'],
  },
  platinum: {
    minPoints: 15000,
    discount: 20,
    benefits: ['20% discount', 'Dedicated support', 'Custom integrations', 'Team features'],
  },
};

// ============================================
// AI CHAT ASSIST
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tripContext?: string;
}

export interface ChatSession {
  id: string;
  tripId?: string;
  messages: ChatMessage[];
  createdAt: Date;
}

// ============================================
// TRAVEL INTELLIGENCE
// ============================================

export interface PlaceInsight {
  id: string;
  location: string;
  country: string;
  attractions: Attraction[];
  warnings: string[];
  seasonalNotes: SeasonalNote[];
  averageDailyCost: number;
  currency: Currency;
}

export interface Attraction {
  name: string;
  type: string;
  rating: number;
  estimatedCost: number;
  description: string;
}

export interface SeasonalNote {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  note: string;
  recommendation: 'recommended' | 'avoid' | 'neutral';
}

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  location: string;
  rating: number;
  priceRange: 1 | 2 | 3;
  contact?: string;
  website?: string;
  verified: boolean;
}

export type VendorCategory = 'hotel' | 'restaurant' | 'tour_guide' | 'transport' | 'activity';

// ============================================
// SUPPORT TICKETS
// ============================================

export interface SupportTicket {
  id: string;
  userId: string;
  tripId?: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
  resolvedAt?: Date;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
