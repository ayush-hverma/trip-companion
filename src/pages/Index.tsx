import { useState } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import { TripGrid } from '@/components/trips/TripCard';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { BalanceSheetView } from '@/components/settlements/BalanceSheet';
import { BudgetPlannerView } from '@/components/budget/BudgetPlanner';
import AIChatAssist from '@/components/chat/AIChatAssist';
import { LoyaltyCard, TierComparison } from '@/components/loyalty/LoyaltyCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  mockTrips, 
  mockExpenses, 
  mockLoyaltyProfile, 
  mockChatMessages,
  currentUser 
} from '@/data/mockData';
import { generateBalanceSheet } from '@/services/expenseSplitEngine';
import { createBudgetPlan, updateBudgetSpending } from '@/services/budgetPlanner';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  PieChart, 
  MessageSquare, 
  Trophy,
  ArrowLeft,
  Plus,
} from 'lucide-react';

type View = 'landing' | 'dashboard';

const Index = () => {
  const [view, setView] = useState<View>('landing');
  const [activeTab, setActiveTab] = useState('trips');
  
  // Get active trip for demo
  const activeTrip = mockTrips.find(t => t.status === 'active') || mockTrips[0];
  const tripExpenses = mockExpenses.filter(e => e.tripId === activeTrip.id);
  
  // Generate balance sheet
  const balanceSheet = generateBalanceSheet(
    activeTrip.id,
    mockExpenses,
    activeTrip.participants.map(p => ({ userId: p.userId, user: p.user })),
    activeTrip.baseCurrency
  );
  
  // Generate budget plan
  const budgetPlan = updateBudgetSpending(
    createBudgetPlan(activeTrip.id, activeTrip.budget, 10, activeTrip.baseCurrency),
    mockExpenses
  );

  if (view === 'landing') {
    return (
      <main className="min-h-screen bg-background">
        <HeroSection onGetStarted={() => setView('dashboard')} />
        <FeaturesSection />
        
        {/* Footer */}
        <footer className="py-12 border-t">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>© 2024 TripSplit. Split expenses, travel smarter.</p>
          </div>
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setView('landing')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gradient-ocean">TripSplit</h1>
          </div>
          <Button variant="gradient">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </header>

      {/* Dashboard tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-6 mb-8">
            <TabsTrigger value="trips" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Trips</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="balances" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Balances</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Rewards</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trips">
            <TripGrid 
              trips={mockTrips}
              onTripClick={(id) => console.log('Trip clicked:', id)}
              onCreateTrip={() => console.log('Create trip')}
            />
          </TabsContent>

          <TabsContent value="expenses">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">{activeTrip.name} Expenses</h2>
              <ExpenseList 
                expenses={tripExpenses}
                baseCurrency={activeTrip.baseCurrency}
              />
            </div>
          </TabsContent>

          <TabsContent value="balances">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Balance Sheet</h2>
              <BalanceSheetView 
                balanceSheet={balanceSheet}
                currentUserId={currentUser.id}
              />
            </div>
          </TabsContent>

          <TabsContent value="budget">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Budget Planner</h2>
              <BudgetPlannerView plan={budgetPlan} />
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">AI Travel Assistant</h2>
              <AIChatAssist 
                trip={activeTrip}
                expenses={tripExpenses}
                budget={budgetPlan}
                initialMessages={mockChatMessages}
              />
            </div>
          </TabsContent>

          <TabsContent value="loyalty">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold">Loyalty Rewards</h2>
              <LoyaltyCard profile={mockLoyaltyProfile} />
              <TierComparison currentTier={mockLoyaltyProfile.tier} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Index;