import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, Calendar, Users, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trip, TripStatus } from '@/types';
import { CURRENCIES } from '@/types';
import { format } from 'date-fns';

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
}

const statusConfig: Record<TripStatus, { label: string; className: string }> = {
  planning: { label: 'Planning', className: 'status-planning' },
  active: { label: 'Active', className: 'status-active' },
  completed: { label: 'Completed', className: 'status-completed' },
  archived: { label: 'Archived', className: 'status-completed' },
};

const TripCard = ({ trip, onClick }: TripCardProps) => {
  const currencyInfo = CURRENCIES.find((c) => c.code === trip.baseCurrency);
  const status = statusConfig[trip.status];
  
  // Calculate total balance for current user (mock)
  const userBalance = trip.participants[0]?.netBalance || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group cursor-pointer overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
        onClick={onClick}
      >
        {/* Cover gradient */}
        <div className={`h-24 ${trip.status === 'active' ? 'bg-gradient-ocean' : trip.status === 'planning' ? 'bg-gradient-aurora' : 'bg-gradient-to-r from-muted to-muted/50'} relative`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-white/30" />
          </div>
          <Badge className={`absolute top-3 right-3 ${status.className}`}>
            {status.label}
          </Badge>
        </div>

        <CardContent className="p-5">
          {/* Title & destination */}
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
            {trip.name}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span>{trip.destination}</span>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {format(trip.startDate, 'MMM d')} - {format(trip.endDate, 'MMM d, yyyy')}
            </span>
          </div>

          {/* Budget & Balance */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Budget</p>
              <p className="font-semibold">
                {currencyInfo?.symbol}{trip.budget.toLocaleString()}
              </p>
            </div>
            <div className={`rounded-lg p-3 ${userBalance >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
              <p className="text-xs text-muted-foreground mb-1">Your Balance</p>
              <div className="flex items-center gap-1">
                {userBalance >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-success" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                )}
                <p className={`font-semibold ${userBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {userBalance >= 0 ? '+' : ''}{currencyInfo?.symbol}{Math.abs(userBalance).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {trip.participants.slice(0, 3).map((participant) => (
                  <Avatar key={participant.id} className="w-7 h-7 border-2 border-card">
                    <AvatarImage src={participant.user.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {participant.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {trip.participants.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">
                    +{trip.participants.length - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {trip.participants.length} travelers
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface TripGridProps {
  trips: Trip[];
  onTripClick?: (tripId: string) => void;
  onCreateTrip?: () => void;
}

const TripGrid = ({ trips, onTripClick, onCreateTrip }: TripGridProps) => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Create new trip card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className="h-full min-h-[280px] border-dashed border-2 hover:border-primary/50 cursor-pointer group transition-all duration-300 flex items-center justify-center"
          onClick={onCreateTrip}
        >
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Create New Trip</h3>
            <p className="text-sm text-muted-foreground">
              Start planning your next adventure
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trip cards */}
      {trips.map((trip) => (
        <TripCard 
          key={trip.id} 
          trip={trip} 
          onClick={() => onTripClick?.(trip.id)}
        />
      ))}
    </div>
  );
};

export { TripCard, TripGrid };
