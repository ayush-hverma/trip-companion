import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Info, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BudgetPlan, CategorySpending, BudgetAlert, EXPENSE_CATEGORIES } from '@/types';
import { CURRENCIES } from '@/types';

interface CategoryProgressProps {
  spending: CategorySpending;
  currency: string;
}

const CategoryProgress = ({ spending, currency }: CategoryProgressProps) => {
  const category = EXPENSE_CATEGORIES.find((c) => c.value === spending.category);
  const currencyInfo = CURRENCIES.find((c) => c.code === currency);
  const isOverBudget = spending.percentUsed > 100;
  const isWarning = spending.percentUsed > 80;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-xl border border-border bg-card"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
          {category?.icon || '📦'}
        </div>
        <div className="flex-1">
          <h4 className="font-medium">{category?.label || spending.category}</h4>
          <p className="text-sm text-muted-foreground">
            {currencyInfo?.symbol}{spending.spent.toFixed(2)} of {currencyInfo?.symbol}{spending.allocated.toFixed(2)}
          </p>
        </div>
        <div className={`text-right ${
          isOverBudget ? 'text-destructive' : isWarning ? 'text-warning' : 'text-muted-foreground'
        }`}>
          <span className="text-sm font-medium">{Math.min(spending.percentUsed, 100).toFixed(0)}%</span>
        </div>
      </div>
      
      <Progress 
        value={Math.min(spending.percentUsed, 100)} 
        className={`h-2 ${
          isOverBudget 
            ? '[&>div]:bg-destructive' 
            : isWarning 
              ? '[&>div]:bg-warning' 
              : '[&>div]:bg-success'
        }`}
      />
      
      {spending.remaining !== 0 && (
        <p className={`text-xs mt-2 ${spending.remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
          {spending.remaining >= 0 ? (
            <>+{currencyInfo?.symbol}{spending.remaining.toFixed(2)} remaining</>
          ) : (
            <>{currencyInfo?.symbol}{Math.abs(spending.remaining).toFixed(2)} over budget</>
          )}
        </p>
      )}
    </motion.div>
  );
};

interface AlertItemProps {
  alert: BudgetAlert;
}

const AlertItem = ({ alert }: AlertItemProps) => {
  const icons = {
    warning: AlertTriangle,
    danger: AlertTriangle,
    info: Info,
  };
  const Icon = icons[alert.type];
  
  const colors = {
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-primary/10 text-primary border-primary/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 p-4 rounded-xl border ${colors[alert.type]}`}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm">{alert.message}</p>
    </motion.div>
  );
};

interface BudgetPlannerViewProps {
  plan: BudgetPlan;
}

const BudgetPlannerView = ({ plan }: BudgetPlannerViewProps) => {
  const currencyInfo = CURRENCIES.find((c) => c.code === plan.currency);
  const totalSpent = plan.actualSpending.reduce((sum, s) => sum + s.spent, 0);
  const totalRemaining = plan.totalBudget - totalSpent;
  const overallPercentUsed = (totalSpent / plan.totalBudget) * 100;

  return (
    <div className="space-y-6">
      {/* Overall budget summary */}
      <Card className="overflow-hidden">
        <div className={`h-2 ${
          overallPercentUsed > 100 
            ? 'bg-destructive' 
            : overallPercentUsed > 80 
              ? 'bg-warning' 
              : 'bg-gradient-ocean'
        }`} style={{ width: `${Math.min(overallPercentUsed, 100)}%` }} />
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
              <p className="text-2xl font-bold">
                {currencyInfo?.symbol}{plan.totalBudget.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Spent</p>
              <p className="text-2xl font-bold">
                {currencyInfo?.symbol}{totalSpent.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Remaining</p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                {totalRemaining >= 0 ? '+' : ''}{currencyInfo?.symbol}{totalRemaining.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily budget */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Suggested Daily Budget</p>
              <p className="text-xl font-bold">
                {currencyInfo?.symbol}{plan.dailyBudget.toFixed(2)} / day
              </p>
            </div>
            <div className="ml-auto text-right text-muted-foreground">
              <p className="text-sm">{plan.duration} day trip</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {plan.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Budget Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Category breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.actualSpending
            .sort((a, b) => b.spent - a.spent)
            .map((spending) => (
              <CategoryProgress
                key={spending.category}
                spending={spending}
                currency={plan.currency}
              />
            ))}
        </CardContent>
      </Card>
    </div>
  );
};

export { CategoryProgress, AlertItem, BudgetPlannerView };
