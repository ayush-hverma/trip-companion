import { motion } from 'framer-motion';
import { Receipt, ArrowRight, Clock, Check, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Expense, EXPENSE_CATEGORIES } from '@/types';
import { CURRENCIES } from '@/types';
import { format } from 'date-fns';

interface ExpenseListItemProps {
  expense: Expense;
  baseCurrency?: string;
  onClick?: () => void;
}

const ExpenseListItem = ({ expense, baseCurrency = 'USD', onClick }: ExpenseListItemProps) => {
  const category = EXPENSE_CATEGORIES.find((c) => c.value === expense.category);
  const currencyInfo = CURRENCIES.find((c) => c.code === baseCurrency);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
      className="group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors"
      onClick={onClick}
    >
      {/* Category icon */}
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
        {category?.icon || '📦'}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium truncate">{expense.description}</h4>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {category?.label || expense.category}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Avatar className="w-5 h-5">
              <AvatarImage src={expense.paidByUser?.avatarUrl} />
              <AvatarFallback className="text-[10px]">
                {expense.paidByUser?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{expense.paidByUser?.name} paid</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{format(expense.date, 'MMM d')}</span>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className="font-semibold text-lg">
          {currencyInfo?.symbol}{expense.amountInBaseCurrency.toFixed(2)}
        </p>
        {expense.currency !== baseCurrency && (
          <p className="text-xs text-muted-foreground">
            ({expense.amount.toLocaleString()} {expense.currency})
          </p>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </motion.div>
  );
};

interface ExpenseListProps {
  expenses: Expense[];
  baseCurrency?: string;
  onExpenseClick?: (expenseId: string) => void;
}

const ExpenseList = ({ expenses, baseCurrency = 'USD', onExpenseClick }: ExpenseListProps) => {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Receipt className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg mb-1">No expenses yet</h3>
        <p className="text-muted-foreground text-sm">
          Add your first expense to start tracking
        </p>
      </div>
    );
  }

  // Group expenses by date
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const dateKey = format(expense.date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => {
        const dayExpenses = groupedExpenses[dateKey];
        const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amountInBaseCurrency, 0);
        const currencyInfo = CURRENCIES.find((c) => c.code === baseCurrency);
        
        return (
          <div key={dateKey}>
            {/* Date header */}
            <div className="flex items-center justify-between mb-2 px-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {format(new Date(dateKey), 'EEEE, MMMM d')}
              </h3>
              <span className="text-sm font-medium">
                {currencyInfo?.symbol}{dayTotal.toFixed(2)}
              </span>
            </div>
            
            {/* Expenses for this day */}
            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {dayExpenses.map((expense) => (
                <ExpenseListItem
                  key={expense.id}
                  expense={expense}
                  baseCurrency={baseCurrency}
                  onClick={() => onExpenseClick?.(expense.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { ExpenseListItem, ExpenseList };
