import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlaneTakeoff, Users, Plus, X, DollarSign, Loader2 } from 'lucide-react';

const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
];

export default function CreateTripPage() {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [budget, setBudget] = useState('');
  const [people, setPeople] = useState<string[]>([]);
  const [personName, setPersonName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addPerson = () => {
    if (!personName.trim()) return;
    if (people.includes(personName.trim())) {
      toast.error('Person already added');
      return;
    }
    setPeople([...people, personName.trim()]);
    setPersonName('');
  };

  const removePerson = (index: number) => {
    setPeople(people.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a trip name');
      return;
    }
    if (!budget || Number(budget) <= 0) {
      toast.error('Please enter a valid budget');
      return;
    }
    if (people.length === 0) {
      toast.error('Please add at least one person');
      return;
    }

    setIsLoading(true);
    try {
      await api.createTrip({
        name: name.trim(),
        currency,
        budget: Number(budget),
        people: people.map(p => ({ name: p })),
      });
      toast.success('Trip created successfully!');
      // Reset form
      setName('');
      setBudget('');
      setPeople([]);
    } catch (error) {
      toast.error('Failed to create trip');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Create a Trip</h1>
        <p className="text-muted-foreground">
          Start planning your adventure by setting up trip details and adding participants.
        </p>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlaneTakeoff className="h-5 w-5 text-primary" />
            Trip Details
          </CardTitle>
          <CardDescription>
            Fill in the basic information about your trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trip Name</label>
              <Input
                placeholder="e.g., Summer Europe Adventure"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Currency & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Budget</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="h-12 pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Add People */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Add Participants
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter person's name"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPerson())}
                  className="h-12"
                />
                <Button 
                  type="button" 
                  onClick={addPerson}
                  variant="secondary"
                  className="h-12 px-4"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* People List */}
              {people.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-4 bg-muted/50 rounded-lg">
                  {people.map((person, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="px-3 py-1.5 text-sm flex items-center gap-2"
                    >
                      {person}
                      <button
                        type="button"
                        onClick={() => removePerson(index)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Trip...
                </>
              ) : (
                <>
                  <PlaneTakeoff className="h-4 w-4" />
                  Create Trip
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}