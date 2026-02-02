/**
 * AI CHAT ASSIST SERVICE (Stubbed)
 * 
 * This module provides AI-powered chat assistance for users.
 * Currently uses rule-based responses; designed for easy AI integration.
 * 
 * DESIGN:
 * - Prompt templates for different query types
 * - Input/output logging for analytics
 * - Context-aware responses (trip, expenses, budget)
 * 
 * PROMPT ENGINEERING NOTES:
 * - Each prompt type has structured context
 * - Responses formatted as markdown
 * - Includes actionable suggestions
 */

import { ChatMessage, Trip, Expense, BudgetPlan } from '@/types';
import { EXPENSE_CATEGORIES } from '@/types';

// ============================================
// PROMPT TEMPLATES
// ============================================

type PromptType = 
  | 'expense_breakdown'
  | 'budget_optimization'
  | 'settlement_help'
  | 'travel_tips'
  | 'general';

interface PromptContext {
  trip?: Trip;
  expenses?: Expense[];
  budget?: BudgetPlan;
  userQuery: string;
}

/**
 * Detect the intent of the user's query
 */
function detectIntent(query: string): PromptType {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('spent') || lowerQuery.includes('expense') || lowerQuery.includes('breakdown')) {
    return 'expense_breakdown';
  }
  if (lowerQuery.includes('budget') || lowerQuery.includes('save') || lowerQuery.includes('optimize')) {
    return 'budget_optimization';
  }
  if (lowerQuery.includes('settle') || lowerQuery.includes('owe') || lowerQuery.includes('pay')) {
    return 'settlement_help';
  }
  if (lowerQuery.includes('tip') || lowerQuery.includes('suggest') || lowerQuery.includes('recommend')) {
    return 'travel_tips';
  }
  
  return 'general';
}

/**
 * Build the prompt for AI (or rule-based response)
 */
function buildPrompt(context: PromptContext): string {
  const { trip, expenses, budget, userQuery } = context;
  const intent = detectIntent(userQuery);
  
  // This would be sent to an AI API in production
  // Format: System context + User query
  
  let systemContext = `You are TripSplit AI, a helpful assistant for trip expense management.\n`;
  
  if (trip) {
    systemContext += `\nCurrent Trip: ${trip.name}\n`;
    systemContext += `Destination: ${trip.destination}\n`;
    systemContext += `Budget: ${trip.budget} ${trip.baseCurrency}\n`;
    systemContext += `Participants: ${trip.participants.length}\n`;
  }
  
  if (expenses && expenses.length > 0) {
    const total = expenses.reduce((sum, e) => sum + e.amountInBaseCurrency, 0);
    systemContext += `\nTotal expenses: ${total.toFixed(2)} ${trip?.baseCurrency || 'USD'}\n`;
    
    // Category breakdown
    const byCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amountInBaseCurrency;
    });
    systemContext += `Spending by category: ${JSON.stringify(byCategory)}\n`;
  }
  
  if (budget) {
    systemContext += `\nBudget status: ${budget.alerts.length > 0 ? 'Has alerts' : 'On track'}\n`;
  }
  
  systemContext += `\nUser query type: ${intent}\n`;
  systemContext += `\n---\nUser: ${userQuery}`;
  
  return systemContext;
}

/**
 * Generate AI response (stubbed with rule-based logic)
 * In production, this would call OpenAI/Anthropic/etc.
 */
export async function generateAIResponse(
  userMessage: string,
  context: {
    trip?: Trip;
    expenses?: Expense[];
    budget?: BudgetPlan;
  }
): Promise<string> {
  const intent = detectIntent(userMessage);
  const prompt = buildPrompt({ ...context, userQuery: userMessage });
  
  // Log for analytics (would go to DB in production)
  console.log('[AI Chat] Prompt built:', { intent, promptLength: prompt.length });
  
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Rule-based responses based on intent
  switch (intent) {
    case 'expense_breakdown':
      return generateExpenseBreakdownResponse(context);
    case 'budget_optimization':
      return generateBudgetOptimizationResponse(context);
    case 'settlement_help':
      return generateSettlementHelpResponse(context);
    case 'travel_tips':
      return generateTravelTipsResponse(context);
    default:
      return generateGeneralResponse(userMessage);
  }
}

// ============================================
// RESPONSE GENERATORS
// ============================================

function generateExpenseBreakdownResponse(context: {
  trip?: Trip;
  expenses?: Expense[];
}): string {
  const { expenses = [], trip } = context;
  
  if (expenses.length === 0) {
    return "You haven't logged any expenses for this trip yet. Would you like me to help you add one?";
  }
  
  const total = expenses.reduce((sum, e) => sum + e.amountInBaseCurrency, 0);
  const currency = trip?.baseCurrency || 'USD';
  
  // Group by category
  const byCategory: Record<string, { amount: number; count: number }> = {};
  expenses.forEach((e) => {
    if (!byCategory[e.category]) {
      byCategory[e.category] = { amount: 0, count: 0 };
    }
    byCategory[e.category].amount += e.amountInBaseCurrency;
    byCategory[e.category].count += 1;
  });
  
  let response = `Here's your expense breakdown for **${trip?.name || 'this trip'}**:\n\n`;
  response += `**Total Spent:** ${total.toFixed(2)} ${currency}\n\n`;
  response += `| Category | Amount | % of Total |\n`;
  response += `|----------|--------|------------|\n`;
  
  Object.entries(byCategory)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .forEach(([category, data]) => {
      const catInfo = EXPENSE_CATEGORIES.find((c) => c.value === category);
      const percentage = ((data.amount / total) * 100).toFixed(1);
      response += `| ${catInfo?.icon || '📦'} ${catInfo?.label || category} | ${data.amount.toFixed(2)} ${currency} | ${percentage}% |\n`;
    });
  
  response += `\nWould you like suggestions for optimizing any category?`;
  
  return response;
}

function generateBudgetOptimizationResponse(context: {
  trip?: Trip;
  expenses?: Expense[];
  budget?: BudgetPlan;
}): string {
  const { trip, expenses = [] } = context;
  
  if (!trip) {
    return "I'd be happy to help optimize your budget! Could you tell me which trip you're working on?";
  }
  
  const totalSpent = expenses.reduce((sum, e) => sum + e.amountInBaseCurrency, 0);
  const remaining = trip.budget - totalSpent;
  const percentUsed = (totalSpent / trip.budget) * 100;
  
  let response = `**Budget Optimization for ${trip.name}**\n\n`;
  response += `💰 **Budget Status:**\n`;
  response += `- Total Budget: ${trip.budget} ${trip.baseCurrency}\n`;
  response += `- Spent: ${totalSpent.toFixed(2)} ${trip.baseCurrency} (${percentUsed.toFixed(1)}%)\n`;
  response += `- Remaining: ${remaining.toFixed(2)} ${trip.baseCurrency}\n\n`;
  
  if (percentUsed > 80) {
    response += `⚠️ **Alert:** You've used most of your budget!\n\n`;
    response += `**Suggestions to save:**\n`;
    response += `1. 🍜 Try local street food instead of restaurants\n`;
    response += `2. 🚌 Use public transit instead of taxis\n`;
    response += `3. 🎫 Look for free walking tours and attractions\n`;
    response += `4. 🏨 Consider staying slightly outside city center\n`;
  } else if (percentUsed > 50) {
    response += `✅ You're on track! Here are tips to stay within budget:\n\n`;
    response += `1. Set a daily spending limit of ${(remaining / 5).toFixed(2)} ${trip.baseCurrency}\n`;
    response += `2. Split big purchases across multiple days\n`;
    response += `3. Look for combo deals on activities\n`;
  } else {
    response += `🎉 Great job! You have plenty of budget remaining.\n\n`;
    response += `Consider splurging on:\n`;
    response += `- A special dining experience\n`;
    response += `- A unique local activity\n`;
    response += `- Quality souvenirs\n`;
  }
  
  return response;
}

function generateSettlementHelpResponse(context: {
  trip?: Trip;
  expenses?: Expense[];
}): string {
  let response = `**Settlement Help**\n\n`;
  response += `To settle up with your group, I recommend:\n\n`;
  response += `1. **Check the Balance Sheet** - See who owes whom\n`;
  response += `2. **Use Suggested Settlements** - Minimizes transactions\n`;
  response += `3. **Settle in Person** - Use cash or your preferred payment app\n`;
  response += `4. **Mark as Settled** - Keep records up to date\n\n`;
  response += `💡 *Tip:* Settling within 24 hours earns you bonus loyalty points!`;
  
  return response;
}

function generateTravelTipsResponse(context: {
  trip?: Trip;
}): string {
  const { trip } = context;
  
  let response = `**Travel Tips`;
  if (trip) {
    response += ` for ${trip.destination}**\n\n`;
  } else {
    response += `**\n\n`;
  }
  
  response += `🌍 **General Tips:**\n`;
  response += `1. Download offline maps before you go\n`;
  response += `2. Notify your bank of travel dates\n`;
  response += `3. Keep digital copies of important documents\n`;
  response += `4. Split cash among group members for safety\n\n`;
  
  response += `💳 **Expense Tips:**\n`;
  response += `1. Designate one person per day to pay for group expenses\n`;
  response += `2. Take photos of receipts immediately\n`;
  response += `3. Log expenses as they happen\n`;
  response += `4. Use the same currency for all entries when possible\n\n`;
  
  response += `Would you like more specific tips about your destination?`;
  
  return response;
}

function generateGeneralResponse(query: string): string {
  return `Thanks for your message! I can help you with:\n\n` +
    `📊 **Expense Breakdowns** - "How much have we spent on food?"\n` +
    `💰 **Budget Tips** - "How can we save money?"\n` +
    `🤝 **Settlements** - "Who owes whom?"\n` +
    `✈️ **Travel Tips** - "Any suggestions for our trip?"\n\n` +
    `What would you like to know?`;
}

// ============================================
// CHAT SESSION MANAGEMENT
// ============================================

let messageIdCounter = 0;

export function createMessage(
  role: 'user' | 'assistant',
  content: string,
  tripContext?: string
): ChatMessage {
  messageIdCounter += 1;
  return {
    id: `msg-${messageIdCounter}-${Date.now()}`,
    role,
    content,
    timestamp: new Date(),
    tripContext,
  };
}

/**
 * Log chat interaction for analytics
 * In production, this would persist to a database
 */
export function logChatInteraction(
  userMessage: ChatMessage,
  assistantMessage: ChatMessage,
  context: { tripId?: string; userId?: string }
): void {
  console.log('[AI Chat Log]', {
    timestamp: new Date().toISOString(),
    userId: context.userId,
    tripId: context.tripId,
    userMessage: userMessage.content.substring(0, 100),
    responseLength: assistantMessage.content.length,
    intent: detectIntent(userMessage.content),
  });
}
