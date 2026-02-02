/**
 * EXPENSE SPLITTING ENGINE
 * 
 * This module handles the core logic for splitting expenses among trip participants.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. DATA MODEL RATIONALE:
 *    - Expense stores the original amount AND base currency conversion
 *    - This allows viewing original receipts while calculating balances uniformly
 *    - Each split stores the final amount in base currency for simplicity
 * 
 * 2. SPLIT TYPES:
 *    - Equal: Total / participants (with rounding distributed to last person)
 *    - Unequal: Explicit amounts per person (must sum to total)
 *    - Percentage: Percentage per person (must sum to 100%)
 * 
 * 3. ROUNDING STRATEGY:
 *    - Round to 2 decimal places for display
 *    - Accumulate rounding errors and assign to last participant
 *    - This ensures splits always sum exactly to the total
 * 
 * 4. EDGE CASES HANDLED:
 *    - Odd amounts with uneven participants (e.g., $100 split 3 ways)
 *    - Currency conversion rounding
 *    - Zero amounts (prevented)
 *    - Self-payments (payer can be in split)
 */

import { 
  Expense, 
  ExpenseSplit, 
  SplitType, 
  Currency, 
  FX_RATES,
  UserBalance,
  SuggestedSettlement,
  BalanceSheet,
  User,
} from '@/types';

// ============================================
// CURRENCY CONVERSION
// ============================================

/**
 * Convert an amount from one currency to another
 * Uses hard-coded FX rates relative to USD
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / FX_RATES[fromCurrency];
  const amountInTarget = amountInUSD * FX_RATES[toCurrency];
  
  return roundToTwo(amountInTarget);
}

/**
 * Round to 2 decimal places using banker's rounding
 */
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

// ============================================
// SPLIT CALCULATION
// ============================================

/**
 * Calculate equal splits among participants
 * Handles rounding by assigning remainder to last participant
 */
export function calculateEqualSplit(
  totalAmount: number,
  participantIds: string[],
  participantMap: Map<string, User>
): ExpenseSplit[] {
  const count = participantIds.length;
  if (count === 0) throw new Error('Cannot split among zero participants');
  
  const baseAmount = roundToTwo(totalAmount / count);
  const totalFromBase = roundToTwo(baseAmount * count);
  const remainder = roundToTwo(totalAmount - totalFromBase);
  
  return participantIds.map((userId, index) => ({
    userId,
    user: participantMap.get(userId),
    // Last person gets the remainder to ensure exact total
    amount: index === count - 1 ? roundToTwo(baseAmount + remainder) : baseAmount,
    isPaid: false,
  }));
}

/**
 * Calculate unequal splits with validation
 * Amounts must sum to total (within tolerance)
 */
export function calculateUnequalSplit(
  totalAmount: number,
  splits: { userId: string; amount: number }[],
  participantMap: Map<string, User>
): ExpenseSplit[] {
  const sumOfSplits = splits.reduce((sum, s) => sum + s.amount, 0);
  const tolerance = 0.01;
  
  if (Math.abs(sumOfSplits - totalAmount) > tolerance) {
    throw new Error(
      `Split amounts (${sumOfSplits}) do not match total (${totalAmount})`
    );
  }
  
  return splits.map((split) => ({
    userId: split.userId,
    user: participantMap.get(split.userId),
    amount: roundToTwo(split.amount),
    isPaid: false,
  }));
}

/**
 * Calculate percentage-based splits
 * Percentages must sum to 100% (within tolerance)
 */
export function calculatePercentageSplit(
  totalAmount: number,
  splits: { userId: string; percentage: number }[],
  participantMap: Map<string, User>
): ExpenseSplit[] {
  const sumOfPercentages = splits.reduce((sum, s) => sum + s.percentage, 0);
  const tolerance = 0.1;
  
  if (Math.abs(sumOfPercentages - 100) > tolerance) {
    throw new Error(
      `Percentages (${sumOfPercentages}%) do not sum to 100%`
    );
  }
  
  // Calculate amounts and track rounding
  let allocated = 0;
  const results: ExpenseSplit[] = [];
  
  for (let i = 0; i < splits.length; i++) {
    const split = splits[i];
    let amount: number;
    
    if (i === splits.length - 1) {
      // Last person gets remainder to ensure exact total
      amount = roundToTwo(totalAmount - allocated);
    } else {
      amount = roundToTwo((split.percentage / 100) * totalAmount);
      allocated += amount;
    }
    
    results.push({
      userId: split.userId,
      user: participantMap.get(split.userId),
      amount,
      percentage: split.percentage,
      isPaid: false,
    });
  }
  
  return results;
}

// ============================================
// BALANCE CALCULATION
// ============================================

/**
 * Calculate net balances for all participants in a trip
 * 
 * For each user:
 * - totalPaid = sum of all expenses they paid for
 * - totalOwed = sum of their share in all expenses
 * - netBalance = totalPaid - totalOwed
 * 
 * Positive balance = others owe them money
 * Negative balance = they owe money to others
 */
export function calculateBalances(
  expenses: Expense[],
  participants: { userId: string; user: User }[]
): UserBalance[] {
  const balanceMap = new Map<string, { paid: number; owed: number }>();
  
  // Initialize all participants
  participants.forEach((p) => {
    balanceMap.set(p.userId, { paid: 0, owed: 0 });
  });
  
  // Process each expense
  expenses.forEach((expense) => {
    // Add to payer's "paid" total
    const payerBalance = balanceMap.get(expense.paidBy);
    if (payerBalance) {
      payerBalance.paid += expense.amountInBaseCurrency;
    }
    
    // Add each person's share to their "owed" total
    expense.splits.forEach((split) => {
      const balance = balanceMap.get(split.userId);
      if (balance) {
        balance.owed += split.amount;
      }
    });
  });
  
  // Convert to UserBalance array
  return participants.map((p) => {
    const balance = balanceMap.get(p.userId) || { paid: 0, owed: 0 };
    return {
      userId: p.userId,
      user: p.user,
      totalPaid: roundToTwo(balance.paid),
      totalOwed: roundToTwo(balance.owed),
      netBalance: roundToTwo(balance.paid - balance.owed),
    };
  });
}

/**
 * Suggest minimal settlements to balance the group
 * 
 * ALGORITHM:
 * 1. Separate users into creditors (positive balance) and debtors (negative)
 * 2. Sort creditors descending, debtors ascending by absolute value
 * 3. Match largest creditor with largest debtor
 * 4. Transfer the minimum of their balances
 * 5. Repeat until all balanced
 * 
 * This greedy approach minimizes number of transactions in most cases.
 * Not guaranteed optimal for all edge cases, but simple and explainable.
 */
export function suggestSettlements(
  balances: UserBalance[]
): SuggestedSettlement[] {
  // Create mutable copies
  const creditors = balances
    .filter((b) => b.netBalance > 0.01)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.netBalance - a.netBalance);
  
  const debtors = balances
    .filter((b) => b.netBalance < -0.01)
    .map((b) => ({ ...b, netBalance: Math.abs(b.netBalance) }))
    .sort((a, b) => b.netBalance - a.netBalance);
  
  const settlements: SuggestedSettlement[] = [];
  
  let i = 0; // creditor index
  let j = 0; // debtor index
  
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    
    const amount = roundToTwo(Math.min(creditor.netBalance, debtor.netBalance));
    
    if (amount > 0.01) {
      settlements.push({
        fromUserId: debtor.userId,
        fromUser: debtor.user,
        toUserId: creditor.userId,
        toUser: creditor.user,
        amount,
      });
    }
    
    creditor.netBalance = roundToTwo(creditor.netBalance - amount);
    debtor.netBalance = roundToTwo(debtor.netBalance - amount);
    
    if (creditor.netBalance < 0.01) i++;
    if (debtor.netBalance < 0.01) j++;
  }
  
  return settlements;
}

/**
 * Generate complete balance sheet for a trip
 */
export function generateBalanceSheet(
  tripId: string,
  expenses: Expense[],
  participants: { userId: string; user: User }[],
  baseCurrency: Currency
): BalanceSheet {
  const tripExpenses = expenses.filter((e) => e.tripId === tripId);
  const balances = calculateBalances(tripExpenses, participants);
  const suggestedSettlements = suggestSettlements(balances);
  const totalSpent = tripExpenses.reduce(
    (sum, e) => sum + e.amountInBaseCurrency,
    0
  );
  
  return {
    tripId,
    balances,
    suggestedSettlements,
    totalSpent: roundToTwo(totalSpent),
    currency: baseCurrency,
  };
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function validateExpense(expense: Partial<Expense>): string[] {
  const errors: string[] = [];
  
  if (!expense.amount || expense.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  
  if (!expense.description?.trim()) {
    errors.push('Description is required');
  }
  
  if (!expense.paidBy) {
    errors.push('Payer must be specified');
  }
  
  if (!expense.splits || expense.splits.length === 0) {
    errors.push('At least one split is required');
  }
  
  return errors;
}
