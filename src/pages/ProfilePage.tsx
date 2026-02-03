import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User as UserIcon, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Award,
  Star,
  Target
} from 'lucide-react';
import { User } from '@/types';

// Mock user data - in real app this would come from API
const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  avatar: undefined,
  loyaltyScore: 750,
  tier: 'Gold',
  totalTrips: 12,
  totalSpend: 15420,
  settlementsOnTime: 95,
  joinedAt: '2023-06-15',
};

const tierConfig = {
  Bronze: { color: 'bg-amber-700', min: 0, max: 300, next: 'Silver' },
  Silver: { color: 'bg-slate-400', min: 300, max: 600, next: 'Gold' },
  Gold: { color: 'bg-yellow-500', min: 600, max: 1000, next: 'Platinum' },
  Platinum: { color: 'bg-gradient-to-r from-purple-500 to-pink-500', min: 1000, max: 2000, next: null },
};

export default function ProfilePage() {
  const user = mockUser;
  const tier = tierConfig[user.tier];
  const progressToNext = tier.next 
    ? ((user.loyaltyScore - tier.min) / (tier.max - tier.min)) * 100
    : 100;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground">
          View your account details, loyalty status, and trip history
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-display font-bold mb-1">{user.name}</h2>
                <p className="text-muted-foreground mb-3">{user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Member since {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </Badge>
                  <Badge className={`${tier.color} text-white`}>
                    <Trophy className="h-3 w-3 mr-1" />
                    {user.tier} Member
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Score Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-coral" />
              Loyalty Score
            </CardTitle>
            <CardDescription>
              Your rewards progress based on trips and spending
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <div className="h-32 w-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{user.loyaltyScore}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
                <Star className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 fill-yellow-500" />
              </div>
            </div>

            {tier.next && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{user.tier}</span>
                  <span>{tier.next}</span>
                </div>
                <Progress value={progressToNext} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {tier.max - user.loyaltyScore} more points to {tier.next}
                </p>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">How to earn points:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Target className="h-3 w-3" /> +50 points per trip completed
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3" /> +1 point per $10 spent
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" /> +10 bonus for on-time settlements
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Your Statistics
            </CardTitle>
            <CardDescription>
              Summary of your trip activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-primary">{user.totalTrips}</div>
                <div className="text-sm text-muted-foreground">Total Trips</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-coral">${(user.totalSpend / 1000).toFixed(1)}k</div>
                <div className="text-sm text-muted-foreground">Total Spend</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center col-span-2">
                <div className="text-3xl font-bold text-success">{user.settlementsOnTime}%</div>
                <div className="text-sm text-muted-foreground">On-time Settlements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Benefits */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {user.tier} Member Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              {user.tier === 'Gold' || user.tier === 'Platinum' ? (
                <>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">5% Cashback</h4>
                      <p className="text-xs text-muted-foreground">On partner vendors</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-coral/10 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-coral" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Priority Support</h4>
                      <p className="text-xs text-muted-foreground">24/7 human agent access</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                      <Award className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Exclusive Deals</h4>
                      <p className="text-xs text-muted-foreground">Member-only discounts</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-3 text-center py-6">
                  <p className="text-muted-foreground">
                    Upgrade to Gold for premium benefits!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}