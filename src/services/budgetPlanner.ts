/**
 * BUDGET PLANNER SERVICE
 * 
 * Provides budget allocation, tracking, and alerting for trips.
 * 
 * DESIGN:
 * - Rule-based logic (no ML required)
 * - Real-time alerts for overspending
 * - Category-wise tracking
 */

import {
  BudgetPlan,
  CategoryAllocation,
  CategorySpending,
  BudgetAlert,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
  Currency,
  Expense,
} from '@/types';
import { roundToTwo } from './expenseSplitEngine';

// Default category allocation percentages
const DEFAULT_ALLOCATIONS: Record<ExpenseCategory, number> = {
  accommodation: 35,
  transport: 20,
  food: 20,
  activities: 10,
  shopping: 5,
  entertainment: 5,
  health: 2,
  other: 3,
};

/**
 * Create a budget plan with category allocations
 */
export function createBudgetPlan(
  tripId: string,
  totalBudget: number,
  duration: number,
  currency: Currency,
  customAllocations?: Partial<Record<ExpenseCategory, number>>
): BudgetPlan {
  const allocations = { ...DEFAULT_ALLOCATIONS, ...customAllocations };
  
  // Normalize allocations to ensure they sum to 100%
  const total = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  const normalizedAllocations: CategoryAllocation[] = EXPENSE_CATEGORIES.map(
    (cat) => ({
      category: cat.value,
      percentage: roundToTwo((allocations[cat.value] / total) * 100),
      allocated: roundToTwo((allocations[cat.value] / total) * totalBudget),
    })
  );
  
  return {
    tripId,
    totalBudget,
    currency,
    duration,
    dailyBudget: roundToTwo(totalBudget / duration),
    categoryAllocations: normalizedAllocations,
    actualSpending: normalizedAllocations.map((a) => ({
      category: a.category,
      allocated: a.allocated,
      spent: 0,
      remaining: a.allocated,
      percentUsed: 0,
    })),
    alerts: [],
  };
}

/**
 * Update spending from expenses and generate alerts
 */
export function updateBudgetSpending(
  plan: BudgetPlan,
  expenses: Expense[]
): BudgetPlan {
  const tripExpenses = expenses.filter((e) => e.tripId === plan.tripId);
  
  // Aggregate spending by category
  const spendingByCategory = new Map<ExpenseCategory, number>();
  EXPENSE_CATEGORIES.forEach((cat) => spendingByCategory.set(cat.value, 0));
  
  tripExpenses.forEach((expense) => {
    const current = spendingByCategory.get(expense.category) || 0;
    spendingByCategory.set(
      expense.category,
      current + expense.amountInBaseCurrency
    );
  });
  
  // Calculate spending for each category
  const actualSpending: CategorySpending[] = plan.categoryAllocations.map(
    (allocation) => {
      const spent = roundToTwo(spendingByCategory.get(allocation.category) || 0);
      const remaining = roundToTwo(allocation.allocated - spent);
      const percentUsed = allocation.allocated > 0
        ? roundToTwo((spent / allocation.allocated) * 100)
        : 0;
      
      return {
        category: allocation.category,
        allocated: allocation.allocated,
        spent,
        remaining,
        percentUsed,
      };
    }
  );
  
  // Generate alerts
  const alerts: BudgetAlert[] = [];
  const totalSpent = tripExpenses.reduce(
    (sum, e) => sum + e.amountInBaseCurrency,
    0
  );
  
  // Overall budget alerts
  const overallPercentUsed = (totalSpent / plan.totalBudget) * 100;
  
  if (overallPercentUsed >= 100) {
    alerts.push({
      id: `alert-over-budget`,
      type: 'danger',
      message: `You've exceeded your total budget by ${roundToTwo(totalSpent - plan.totalBudget)} ${plan.currency}!`,
      createdAt: new Date(),
    });
  } else if (overallPercentUsed >= 80) {
    alerts.push({
      id: `alert-budget-warning`,
      type: 'warning',
      message: `You've used ${roundToTwo(overallPercentUsed)}% of your total budget.`,
      createdAt: new Date(),
    });
  }
  
  // Category-specific alerts
  actualSpending.forEach((spending) => {
    if (spending.percentUsed >= 100) {
      alerts.push({
        id: `alert-cat-over-${spending.category}`,
        type: 'danger',
        message: `${getCategoryLabel(spending.category)} budget exceeded by ${Math.abs(spending.remaining)} ${plan.currency}`,
        category: spending.category,
        createdAt: new Date(),
      });
    } else if (spending.percentUsed >= 80) {
      alerts.push({
        id: `alert-cat-warn-${spending.category}`,
        type: 'warning',
        message: `${getCategoryLabel(spending.category)} is at ${roundToTwo(spending.percentUsed)}% of budget`,
        category: spending.category,
        createdAt: new Date(),
      });
    }
  });
  
  return {
    ...plan,
    actualSpending,
    alerts,
  };
}

/**
 * Calculate remaining daily budget
 */
export function calculateRemainingDailyBudget(
  plan: BudgetPlan,
  expenses: Expense[],
  daysRemaining: number
): number {
  const totalSpent = expenses
    .filter((e) => e.tripId === plan.tripId)
    .reduce((sum, e) => sum + e.amountInBaseCurrency, 0);
  
  const remaining = plan.totalBudget - totalSpent;
  
  if (daysRemaining <= 0) return 0;
  
  return roundToTwo(remaining / daysRemaining);
}

/**
 * Get budget insights for AI chat
 */
export function getBudgetInsights(
  plan: BudgetPlan,
  expenses: Expense[]
): string[] {
  const insights: string[] = [];
  const updatedPlan = updateBudgetSpending(plan, expenses);
  
  // Find highest spending category
  const sortedSpending = [...updatedPlan.actualSpending].sort(
    (a, b) => b.spent - a.spent
  );
  
  if (sortedSpending[0] && sortedSpending[0].spent > 0) {
    insights.push(
      `Highest spending: ${getCategoryLabel(sortedSpending[0].category)} (${roundToTwo(sortedSpending[0].spent)} ${plan.currency})`
    );
  }
  
  // Find categories with remaining budget
  const underBudget = updatedPlan.actualSpending.filter(
    (s) => s.percentUsed < 50 && s.allocated > 0
  );
  if (underBudget.length > 0) {
    insights.push(
      `Categories with room to spend: ${underBudget.map((s) => getCategoryLabel(s.category)).join(', ')}`
    );
  }
  
  // Daily pace check
  const totalSpent = expenses
    .filter((e) => e.tripId === plan.tripId)
    .reduce((sum, e) => sum + e.amountInBaseCurrency, 0);
  
  const paceVsDailyBudget = (totalSpent / plan.duration) / plan.dailyBudget;
  if (paceVsDailyBudget > 1.2) {
    insights.push(
      `⚠️ Spending ${roundToTwo((paceVsDailyBudget - 1) * 100)}% above daily budget pace`
    );
  } else if (paceVsDailyBudget < 0.8) {
    insights.push(
      `✅ Spending ${roundToTwo((1 - paceVsDailyBudget) * 100)}% below daily budget pace`
    );
  }
  
  return insights;
}

function getCategoryLabel(category: ExpenseCategory): string {
  return EXPENSE_CATEGORIES.find((c) => c.value === category)?.label || category;
}
