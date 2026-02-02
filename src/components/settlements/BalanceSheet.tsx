import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, Check, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BalanceSheet, UserBalance, SuggestedSettlement, Currency } from '@/types';
import { CURRENCIES } from '@/types';

interface BalanceCardProps {
  balance: UserBalance;
  currency: Currency;
  isCurrentUser?: boolean;
}

const BalanceCard = ({ balance, currency, isCurrentUser }: BalanceCardProps) => {
  const currencyInfo = CURRENCIES.find((c) => c.code === currency);
  const isPositive = balance.netBalance >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${
        isCurrentUser 
          ? 'border-primary/30 bg-primary/5' 
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={balance.user.avatarUrl} />
          <AvatarFallback>{balance.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{balance.user.name}</p>
            {isCurrentUser && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                You
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Paid {currencyInfo?.symbol}{balance.totalPaid.toFixed(2)} • 
            Owes {currencyInfo?.symbol}{balance.totalOwed.toFixed(2)}
          </p>
        </div>

        <div className={`text-right ${isPositive ? 'text-success' : 'text-destructive'}`}>
          <div className="flex items-center gap-1 justify-end">
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-semibold">
              {isPositive ? '+' : ''}{currencyInfo?.symbol}{balance.netBalance.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isPositive ? 'gets back' : 'owes'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

interface SettlementSuggestionProps {
  settlement: SuggestedSettlement;
  currency: Currency;
  onSettle?: () => void;
}

const SettlementSuggestion = ({ settlement, currency, onSettle }: SettlementSuggestionProps) => {
  const currencyInfo = CURRENCIES.find((c) => c.code === currency);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
    >
      {/* From user */}
      <Avatar className="w-10 h-10">
        <AvatarImage src={settlement.fromUser.avatarUrl} />
        <AvatarFallback>{settlement.fromUser.name.charAt(0)}</AvatarFallback>
      </Avatar>
      
      {/* Arrow and amount */}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-px bg-border relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2">
            <span className="text-sm font-semibold text-accent">
              {currencyInfo?.symbol}{settlement.amount.toFixed(2)}
            </span>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-accent shrink-0" />
      </div>

      {/* To user */}
      <Avatar className="w-10 h-10">
        <AvatarImage src={settlement.toUser.avatarUrl} />
        <AvatarFallback>{settlement.toUser.name.charAt(0)}</AvatarFallback>
      </Avatar>

      {/* Settle button */}
      <Button 
        size="sm" 
        variant="soft" 
        onClick={onSettle}
        className="shrink-0"
      >
        <Check className="w-4 h-4 mr-1" />
        Settle
      </Button>
    </motion.div>
  );
};

interface BalanceSheetViewProps {
  balanceSheet: BalanceSheet;
  currentUserId?: string;
  onSettle?: (fromUserId: string, toUserId: string) => void;
}

const BalanceSheetView = ({ balanceSheet, currentUserId, onSettle }: BalanceSheetViewProps) => {
  const currencyInfo = CURRENCIES.find((c) => c.code === balanceSheet.currency);

  return (
    <div className="space-y-6">
      {/* Total spent summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-ocean flex items-center justify-center">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Trip Spending</p>
              <p className="text-3xl font-bold">
                {currencyInfo?.symbol}{balanceSheet.totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Individual Balances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {balanceSheet.balances
            .sort((a, b) => b.netBalance - a.netBalance)
            .map((balance) => (
              <BalanceCard
                key={balance.userId}
                balance={balance}
                currency={balanceSheet.currency}
                isCurrentUser={balance.userId === currentUserId}
              />
            ))}
        </CardContent>
      </Card>

      {/* Suggested settlements */}
      {balanceSheet.suggestedSettlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suggested Settlements</CardTitle>
            <p className="text-sm text-muted-foreground">
              {balanceSheet.suggestedSettlements.length} transaction{balanceSheet.suggestedSettlements.length > 1 ? 's' : ''} to settle up
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {balanceSheet.suggestedSettlements.map((settlement, index) => (
              <SettlementSuggestion
                key={`${settlement.fromUserId}-${settlement.toUserId}`}
                settlement={settlement}
                currency={balanceSheet.currency}
                onSettle={() => onSettle?.(settlement.fromUserId, settlement.toUserId)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {balanceSheet.suggestedSettlements.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-semibold text-lg mb-1">All Settled!</h3>
            <p className="text-muted-foreground text-sm">
              Everyone is squared up. No payments needed.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { BalanceCard, SettlementSuggestion, BalanceSheetView };
