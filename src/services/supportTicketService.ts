/**
 * HUMAN AGENT ESCALATION SERVICE
 * 
 * Handles user requests for human support (paid plan feature).
 * 
 * FLOW:
 * 1. User requests help
 * 2. System checks plan eligibility
 * 3. If eligible, ticket is created
 * 4. User receives confirmation
 */

import {
  SupportTicket,
  TicketPriority,
  User,
  UserPlan,
} from '@/types';

// Plan features
const PLAN_SUPPORT_LEVELS: Record<UserPlan, {
  canAccessHumanAgent: boolean;
  maxTicketsPerMonth: number;
  priorityLevel: TicketPriority;
  responseTimeHours: number;
}> = {
  free: {
    canAccessHumanAgent: false,
    maxTicketsPerMonth: 0,
    priorityLevel: 'low',
    responseTimeHours: 72,
  },
  pro: {
    canAccessHumanAgent: true,
    maxTicketsPerMonth: 3,
    priorityLevel: 'medium',
    responseTimeHours: 24,
  },
  enterprise: {
    canAccessHumanAgent: true,
    maxTicketsPerMonth: -1, // Unlimited
    priorityLevel: 'high',
    responseTimeHours: 4,
  },
};

let ticketIdCounter = 0;

/**
 * Check if user can create a support ticket
 */
export function checkSupportEligibility(
  user: User,
  existingTicketsThisMonth: number
): {
  eligible: boolean;
  reason?: string;
  upgradeRequired?: boolean;
} {
  const planLevel = PLAN_SUPPORT_LEVELS[user.plan];
  
  if (!planLevel.canAccessHumanAgent) {
    return {
      eligible: false,
      reason: 'Human agent support is available on Pro and Enterprise plans.',
      upgradeRequired: true,
    };
  }
  
  if (
    planLevel.maxTicketsPerMonth !== -1 &&
    existingTicketsThisMonth >= planLevel.maxTicketsPerMonth
  ) {
    return {
      eligible: false,
      reason: `You've reached your limit of ${planLevel.maxTicketsPerMonth} support tickets this month.`,
      upgradeRequired: true,
    };
  }
  
  return { eligible: true };
}

/**
 * Create a support ticket
 */
export function createSupportTicket(
  user: User,
  subject: string,
  description: string,
  tripId?: string
): SupportTicket | { error: string } {
  const eligibility = checkSupportEligibility(user, 0); // In reality, check DB
  
  if (!eligibility.eligible) {
    return { error: eligibility.reason || 'Not eligible for support' };
  }
  
  const planLevel = PLAN_SUPPORT_LEVELS[user.plan];
  ticketIdCounter += 1;
  
  const ticket: SupportTicket = {
    id: `ticket-${ticketIdCounter}-${Date.now()}`,
    userId: user.id,
    tripId,
    subject,
    description,
    status: 'open',
    priority: planLevel.priorityLevel,
    createdAt: new Date(),
  };
  
  console.log('[Support] Ticket created:', ticket.id);
  
  return ticket;
}

/**
 * Get expected response time based on plan
 */
export function getExpectedResponseTime(user: User): string {
  const planLevel = PLAN_SUPPORT_LEVELS[user.plan];
  const hours = planLevel.responseTimeHours;
  
  if (hours < 24) {
    return `${hours} hours`;
  }
  return `${Math.round(hours / 24)} business days`;
}

/**
 * Format ticket for display
 */
export function formatTicketStatus(ticket: SupportTicket): {
  statusLabel: string;
  statusColor: 'success' | 'warning' | 'muted' | 'destructive';
} {
  switch (ticket.status) {
    case 'open':
      return { statusLabel: 'Open', statusColor: 'warning' };
    case 'in_progress':
      return { statusLabel: 'In Progress', statusColor: 'success' };
    case 'resolved':
      return { statusLabel: 'Resolved', statusColor: 'success' };
    case 'closed':
      return { statusLabel: 'Closed', statusColor: 'muted' };
    default:
      return { statusLabel: 'Unknown', statusColor: 'muted' };
  }
}
