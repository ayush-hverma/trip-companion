import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Trip, BudgetPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calculator,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import AIChatAssist from '@/components/chat/AIChatAssist';

export default function BudgetPlannerPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [planResult, setPlanResult] = useState<BudgetPlan | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Form state
  const [totalBudget, setTotalBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categories, setCategories] = useState<{ name: string; val: string }[]>([]);
  const [planning, setPlanning] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    setLoading(true);
    try {
      const list = await api.listTrips();
      setTrips(list || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load trips');
    }
    setLoading(false);
  }

  function openPlanModal(trip: Trip) {
    setSelectedTrip(trip);
    setTotalBudget(String(trip.budget));
    setStartDate('');
    setEndDate('');
    setCategories([]);
    setPlanResult(null);
  }

  function closePlanModal() {
    setSelectedTrip(null);
    setPlanResult(null);
    setShowChat(false);
  }

  function addCategory() {
    setCategories([...categories, { name: '', val: '' }]);
  }

  function removeCategory(index: number) {
    setCategories(categories.filter((_, i) => i !== index));
  }

  function updateCategory(index: number, field: 'name' | 'val', value: string) {
    const updated = [...categories];
    updated[index][field] = value;
    setCategories(updated);
  }

  async function handlePlan() {
    if (!selectedTrip) return;

    setPlanning(true);
    try {
      const result = await api.planTrip(selectedTrip._id, {
        totalBudget: Number(totalBudget || selectedTrip.budget),
        startDate,
        endDate,
        categories: categories.map((c) => ({ name: c.name, amount: c.val })),
      });
      setPlanResult(result);
      toast.success('Budget plan generated!');
    } catch (err) {
      toast.error('Failed to generate plan');
      console.error(err);
    }
    setPlanning(false);
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Budget Planner</h1>
        <p className="text-muted-foreground">
          Select a trip to plan your budget with AI-powered suggestions
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : trips.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No trips found</h3>
            <p className="text-muted-foreground mb-4">
              Create a trip first to start planning your budget
            </p>
            <Button onClick={() => window.location.href = '/create-trip'}>
              Create Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Card key={trip._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{trip.name}</span>
                  <Badge variant="secondary">{trip.currency}</Badge>
                </CardTitle>
                <CardDescription>
                  {trip.people.length} participant{trip.people.length !== 1 && 's'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold">
                    {trip.currency} {trip.budget.toLocaleString()}
                  </span>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => openPlanModal(trip)}
                >
                  <Calculator className="h-4 w-4" />
                  Plan Budget
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Plan Modal */}
      <Dialog open={!!selectedTrip} onOpenChange={(open) => !open && closePlanModal()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Plan Budget for {selectedTrip?.name}
            </DialogTitle>
            <DialogDescription>
              Set your budget parameters and categories for AI suggestions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Budget & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Budget</label>
                <Input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder={String(selectedTrip?.budget || 0)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Budget Categories</label>
                <Button type="button" variant="outline" size="sm" onClick={addCategory}>
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              </div>
              {categories.length > 0 && (
                <div className="space-y-2">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Category name (e.g., Food)"
                        value={cat.name}
                        onChange={(e) => updateCategory(idx, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Amount or %"
                        value={cat.val}
                        onChange={(e) => updateCategory(idx, 'val', e.target.value)}
                        className="w-32"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCategory(idx)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handlePlan} disabled={planning} className="flex-1">
                {planning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Computing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    Generate Plan
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={closePlanModal}>
                Close
              </Button>
            </div>

            {/* Plan Results */}
            {planResult && (
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Budget Plan Results
                </h3>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Per Day</p>
                    <p className="text-lg font-bold">
                      {selectedTrip?.currency} {planResult.perDayBudget}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-lg font-bold">{planResult.days} days</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Allocated</p>
                    <p className="text-lg font-bold">
                      {selectedTrip?.currency} {planResult.allocatedSum}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className={`text-lg font-bold ${planResult.difference < 0 ? 'text-destructive' : 'text-success'}`}>
                      {selectedTrip?.currency} {planResult.difference}
                    </p>
                  </div>
                </div>

                {/* Categories Breakdown */}
                {planResult.categories.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Category Allocations</h4>
                    {planResult.categories.map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{cat.name || `Category ${idx + 1}`}</span>
                          <span className="font-medium">
                            {selectedTrip?.currency} {cat.amount}
                          </span>
                        </div>
                        <Progress 
                          value={(cat.amount / planResult.allocatedSum) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Alerts */}
                {planResult.alerts.length > 0 && (
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                      <div className="space-y-1">
                        {planResult.alerts.map((alert, idx) => (
                          <p key={idx} className="text-sm">{alert}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Suggestion */}
                {planResult.aiSuggestion && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      AI Suggestion
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{planResult.aiSuggestion}</p>
                  </div>
                )}

                {/* Chat Button */}
                <Button 
                  variant="coral" 
                  className="w-full"
                  onClick={() => setShowChat(true)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Ask AI About This Budget
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Chat Modal */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-coral" />
              AI Budget Assistant
            </DialogTitle>
            <DialogDescription>
              Ask questions about your budget plan for {selectedTrip?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <AIChatAssist 
              trip={selectedTrip} 
              budgetPlan={planResult}
              onClose={() => setShowChat(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}