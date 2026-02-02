import {
  User,
  Trip,
  Expense,
  Settlement,
  PlaceInsight,
  Vendor,
  LoyaltyProfile,
  ChatMessage,
} from '@/types';

// ============================================
// MOCK USERS
// ============================================

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'alex@example.com',
    name: 'Alex Chen',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    phone: '+1-555-0101',
    createdAt: new Date('2023-01-15'),
    loyaltyPoints: 5200,
    tier: 'gold',
    plan: 'pro',
  },
  {
    id: 'user-2',
    email: 'sarah@example.com',
    name: 'Sarah Miller',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    phone: '+1-555-0102',
    createdAt: new Date('2023-03-20'),
    loyaltyPoints: 2100,
    tier: 'silver',
    plan: 'pro',
  },
  {
    id: 'user-3',
    email: 'mike@example.com',
    name: 'Mike Johnson',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    phone: '+1-555-0103',
    createdAt: new Date('2023-06-10'),
    loyaltyPoints: 800,
    tier: 'bronze',
    plan: 'free',
  },
  {
    id: 'user-4',
    email: 'emma@example.com',
    name: 'Emma Wilson',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    phone: '+1-555-0104',
    createdAt: new Date('2023-02-28'),
    loyaltyPoints: 16500,
    tier: 'platinum',
    plan: 'enterprise',
  },
];

export const currentUser = mockUsers[0];

// ============================================
// MOCK TRIPS
// ============================================

export const mockTrips: Trip[] = [
  {
    id: 'trip-1',
    name: 'Tokyo Adventure 2024',
    description: 'Exploring Japanese culture, food, and technology',
    destination: 'Tokyo, Japan',
    baseCurrency: 'USD',
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-25'),
    budget: 5000,
    status: 'active',
    coverImageUrl: '/placeholder.svg',
    createdBy: 'user-1',
    createdAt: new Date('2024-02-01'),
    participants: [
      {
        id: 'tp-1',
        tripId: 'trip-1',
        userId: 'user-1',
        user: mockUsers[0],
        role: 'owner',
        joinedAt: new Date('2024-02-01'),
        netBalance: 245.50,
      },
      {
        id: 'tp-2',
        tripId: 'trip-1',
        userId: 'user-2',
        user: mockUsers[1],
        role: 'member',
        joinedAt: new Date('2024-02-02'),
        netBalance: -120.25,
      },
      {
        id: 'tp-3',
        tripId: 'trip-1',
        userId: 'user-3',
        user: mockUsers[2],
        role: 'member',
        joinedAt: new Date('2024-02-03'),
        netBalance: -125.25,
      },
    ],
  },
  {
    id: 'trip-2',
    name: 'Barcelona Beach Week',
    description: 'Sun, tapas, and architecture',
    destination: 'Barcelona, Spain',
    baseCurrency: 'EUR',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-08'),
    budget: 3000,
    status: 'planning',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15'),
    participants: [
      {
        id: 'tp-4',
        tripId: 'trip-2',
        userId: 'user-1',
        user: mockUsers[0],
        role: 'owner',
        joinedAt: new Date('2024-01-15'),
        netBalance: 0,
      },
      {
        id: 'tp-5',
        tripId: 'trip-2',
        userId: 'user-4',
        user: mockUsers[3],
        role: 'admin',
        joinedAt: new Date('2024-01-16'),
        netBalance: 0,
      },
    ],
  },
  {
    id: 'trip-3',
    name: 'NYC Weekend Getaway',
    description: 'Broadway, Central Park, and pizza',
    destination: 'New York, USA',
    baseCurrency: 'USD',
    startDate: new Date('2023-12-20'),
    endDate: new Date('2023-12-23'),
    budget: 2000,
    status: 'completed',
    createdBy: 'user-2',
    createdAt: new Date('2023-11-01'),
    participants: [
      {
        id: 'tp-6',
        tripId: 'trip-3',
        userId: 'user-1',
        user: mockUsers[0],
        role: 'member',
        joinedAt: new Date('2023-11-02'),
        netBalance: 0,
      },
      {
        id: 'tp-7',
        tripId: 'trip-3',
        userId: 'user-2',
        user: mockUsers[1],
        role: 'owner',
        joinedAt: new Date('2023-11-01'),
        netBalance: 0,
      },
    ],
  },
];

// ============================================
// MOCK EXPENSES
// ============================================

export const mockExpenses: Expense[] = [
  {
    id: 'exp-1',
    tripId: 'trip-1',
    description: 'Shinjuku Hotel - 3 nights',
    amount: 45000,
    currency: 'JPY',
    amountInBaseCurrency: 301.00,
    category: 'accommodation',
    paidBy: 'user-1',
    paidByUser: mockUsers[0],
    splitType: 'equal',
    splits: [
      { userId: 'user-1', user: mockUsers[0], amount: 100.33, isPaid: true },
      { userId: 'user-2', user: mockUsers[1], amount: 100.33, isPaid: false },
      { userId: 'user-3', user: mockUsers[2], amount: 100.34, isPaid: false },
    ],
    date: new Date('2024-03-15'),
    createdAt: new Date('2024-03-15'),
  },
  {
    id: 'exp-2',
    tripId: 'trip-1',
    description: 'Sushi dinner at Tsukiji',
    amount: 15000,
    currency: 'JPY',
    amountInBaseCurrency: 100.33,
    category: 'food',
    paidBy: 'user-1',
    paidByUser: mockUsers[0],
    splitType: 'unequal',
    splits: [
      { userId: 'user-1', user: mockUsers[0], amount: 40.00, isPaid: true },
      { userId: 'user-2', user: mockUsers[1], amount: 35.33, isPaid: false },
      { userId: 'user-3', user: mockUsers[2], amount: 25.00, isPaid: false },
    ],
    notes: 'Mike had the cheaper set menu',
    date: new Date('2024-03-16'),
    createdAt: new Date('2024-03-16'),
  },
  {
    id: 'exp-3',
    tripId: 'trip-1',
    description: 'JR Pass - 7 days',
    amount: 29650,
    currency: 'JPY',
    amountInBaseCurrency: 198.33,
    category: 'transport',
    paidBy: 'user-2',
    paidByUser: mockUsers[1],
    splitType: 'equal',
    splits: [
      { userId: 'user-1', user: mockUsers[0], amount: 66.11, isPaid: false },
      { userId: 'user-2', user: mockUsers[1], amount: 66.11, isPaid: true },
      { userId: 'user-3', user: mockUsers[2], amount: 66.11, isPaid: false },
    ],
    date: new Date('2024-03-15'),
    createdAt: new Date('2024-03-15'),
  },
  {
    id: 'exp-4',
    tripId: 'trip-1',
    description: 'TeamLab Borderless tickets',
    amount: 9600,
    currency: 'JPY',
    amountInBaseCurrency: 64.21,
    category: 'activities',
    paidBy: 'user-3',
    paidByUser: mockUsers[2],
    splitType: 'equal',
    splits: [
      { userId: 'user-1', user: mockUsers[0], amount: 21.40, isPaid: false },
      { userId: 'user-2', user: mockUsers[1], amount: 21.40, isPaid: false },
      { userId: 'user-3', user: mockUsers[2], amount: 21.41, isPaid: true },
    ],
    date: new Date('2024-03-17'),
    createdAt: new Date('2024-03-17'),
  },
  {
    id: 'exp-5',
    tripId: 'trip-1',
    description: 'Ramen lunch',
    amount: 3600,
    currency: 'JPY',
    amountInBaseCurrency: 24.08,
    category: 'food',
    paidBy: 'user-1',
    paidByUser: mockUsers[0],
    splitType: 'percentage',
    splits: [
      { userId: 'user-1', user: mockUsers[0], amount: 9.63, percentage: 40, isPaid: true },
      { userId: 'user-2', user: mockUsers[1], amount: 7.22, percentage: 30, isPaid: false },
      { userId: 'user-3', user: mockUsers[2], amount: 7.23, percentage: 30, isPaid: false },
    ],
    notes: 'Alex had extra toppings',
    date: new Date('2024-03-18'),
    createdAt: new Date('2024-03-18'),
  },
];

// ============================================
// MOCK SETTLEMENTS
// ============================================

export const mockSettlements: Settlement[] = [
  {
    id: 'settle-1',
    tripId: 'trip-3',
    fromUserId: 'user-1',
    fromUser: mockUsers[0],
    toUserId: 'user-2',
    toUser: mockUsers[1],
    amount: 150.00,
    currency: 'USD',
    status: 'completed',
    method: 'venmo',
    settledAt: new Date('2023-12-24'),
    createdAt: new Date('2023-12-23'),
  },
];

// ============================================
// MOCK PLACE INSIGHTS
// ============================================

export const mockPlaceInsights: PlaceInsight[] = [
  {
    id: 'place-1',
    location: 'Tokyo',
    country: 'Japan',
    attractions: [
      { name: 'Senso-ji Temple', type: 'Cultural', rating: 4.8, estimatedCost: 0, description: 'Ancient Buddhist temple in Asakusa' },
      { name: 'Shibuya Crossing', type: 'Landmark', rating: 4.5, estimatedCost: 0, description: 'Famous scramble crossing' },
      { name: 'TeamLab Borderless', type: 'Museum', rating: 4.9, estimatedCost: 32, description: 'Digital art museum' },
      { name: 'Tsukiji Outer Market', type: 'Food', rating: 4.7, estimatedCost: 20, description: 'Fresh seafood and street food' },
    ],
    warnings: [
      'Cash is still preferred in many places - carry yen',
      'Some restaurants may not speak English',
      'Tattoos may restrict access to onsens',
    ],
    seasonalNotes: [
      { season: 'spring', note: 'Cherry blossom season (late March - early April)', recommendation: 'recommended' },
      { season: 'summer', note: 'Hot and humid, but many festivals', recommendation: 'neutral' },
      { season: 'fall', note: 'Beautiful autumn colors, comfortable weather', recommendation: 'recommended' },
      { season: 'winter', note: 'Cold but less crowded, illuminations everywhere', recommendation: 'neutral' },
    ],
    averageDailyCost: 150,
    currency: 'USD',
  },
  {
    id: 'place-2',
    location: 'Barcelona',
    country: 'Spain',
    attractions: [
      { name: 'Sagrada Familia', type: 'Architecture', rating: 4.9, estimatedCost: 26, description: 'Gaudí\'s masterpiece basilica' },
      { name: 'Park Güell', type: 'Park', rating: 4.7, estimatedCost: 10, description: 'Colorful mosaic park by Gaudí' },
      { name: 'La Boqueria', type: 'Market', rating: 4.6, estimatedCost: 15, description: 'Famous food market' },
      { name: 'Gothic Quarter', type: 'Historical', rating: 4.5, estimatedCost: 0, description: 'Medieval streets and plazas' },
    ],
    warnings: [
      'Watch for pickpockets in tourist areas',
      'Restaurants don\'t open for dinner until 8-9 PM',
      'Siesta time (2-5 PM) - some shops close',
    ],
    seasonalNotes: [
      { season: 'spring', note: 'Perfect weather, fewer crowds', recommendation: 'recommended' },
      { season: 'summer', note: 'Hot and very crowded, beach season', recommendation: 'neutral' },
      { season: 'fall', note: 'Warm weather, wine harvest festivals', recommendation: 'recommended' },
      { season: 'winter', note: 'Mild but some rain, holiday markets', recommendation: 'neutral' },
    ],
    averageDailyCost: 120,
    currency: 'EUR',
  },
];

// ============================================
// MOCK VENDORS
// ============================================

export const mockVendors: Vendor[] = [
  { id: 'v-1', name: 'Sakura Hotel Group', category: 'hotel', location: 'Tokyo', rating: 4.5, priceRange: 2, website: 'https://sakura-hotel.jp', verified: true },
  { id: 'v-2', name: 'Tokyo Day Tours', category: 'tour_guide', location: 'Tokyo', rating: 4.8, priceRange: 2, contact: '+81-3-1234-5678', verified: true },
  { id: 'v-3', name: 'JR East Travel', category: 'transport', location: 'Tokyo', rating: 4.9, priceRange: 2, website: 'https://jreast.co.jp', verified: true },
  { id: 'v-4', name: 'Hotel Arts Barcelona', category: 'hotel', location: 'Barcelona', rating: 4.7, priceRange: 3, verified: true },
  { id: 'v-5', name: 'Barcelona Bike Tours', category: 'activity', location: 'Barcelona', rating: 4.6, priceRange: 1, verified: true },
];

// ============================================
// MOCK LOYALTY PROFILE
// ============================================

export const mockLoyaltyProfile: LoyaltyProfile = {
  userId: 'user-1',
  totalTrips: 8,
  totalSpent: 12500,
  settlementScore: 95,
  points: 5200,
  tier: 'gold',
  discountPercentage: 10,
  nextTierPoints: 15000,
  benefits: [
    '10% discount on premium features',
    'Unlimited trips',
    'AI budget insights',
    'Export reports',
  ],
};

// ============================================
// MOCK CHAT MESSAGES
// ============================================

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'How much have we spent on food so far in Tokyo?',
    timestamp: new Date('2024-03-18T10:30:00'),
    tripContext: 'trip-1',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'Based on your Tokyo trip expenses, your group has spent **$124.41** on food so far. This includes:\n\n- Sushi dinner at Tsukiji: $100.33\n- Ramen lunch: $24.08\n\nThis is about **18.3%** of your total trip spending and within your food budget allocation. Would you like me to suggest some budget-friendly dining options for the rest of your trip?',
    timestamp: new Date('2024-03-18T10:30:05'),
    tripContext: 'trip-1',
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'Yes, please suggest some options',
    timestamp: new Date('2024-03-18T10:31:00'),
    tripContext: 'trip-1',
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: 'Here are some budget-friendly dining options in Tokyo:\n\n🍜 **Ramen Shops** (~$8-12)\n- Ichiran, Ippudo - famous chains with great quality\n\n🍱 **Convenience Store Meals** (~$5-8)\n- 7-Eleven, Lawson - surprisingly good onigiri and bento boxes\n\n🍛 **Yoshinoya/Matsuya** (~$5-7)\n- Fast, filling beef bowl chains\n\n🍣 **Conveyor Belt Sushi** (~$15-20)\n- Sushiro, Kura Sushi - high quality at low prices\n\nWith 7 days remaining and 3 people, budgeting around $20-25/person/day for food should keep you comfortable!',
    timestamp: new Date('2024-03-18T10:31:10'),
    tripContext: 'trip-1',
  },
];
