export interface Person {
  id: string;
  name: string;
}

export interface Trip {
  _id: string;
  name: string;
  currency: string;
  budget: number;
  people: Person[];
  expenses: Expense[];
  createdAt: string;
}

export interface Expense {
  id: string;
  payer: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface BudgetCategory {
  name: string;
  amount: number;
  percent?: number;
}

export interface BudgetPlan {
  perDayBudget: number;
  days: number;
  categories: BudgetCategory[];
  allocatedSum: number;
  difference: number;
  alerts: string[];
  aiSuggestion: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  loyaltyScore: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalTrips: number;
  totalSpend: number;
  settlementsOnTime: number;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}