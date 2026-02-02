import { motion } from 'framer-motion';
import { 
  Plane, 
  Wallet, 
  Users, 
  Calculator, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const features = [
  { icon: Calculator, label: 'Smart Splitting' },
  { icon: Wallet, label: 'Multi-Currency' },
  { icon: Users, label: 'Group Management' },
  { icon: MessageSquare, label: 'AI Assistant' },
];

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-ocean opacity-5" />
      
      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-primary/10 blur-3xl"
          animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-40 right-[15%] w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{ y: [0, -40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-success/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 pt-24 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Powered by AI</span>
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-foreground">Split Expenses.</span>
          <br />
          <span className="text-gradient-ocean">Travel Smarter.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          The intelligent way to manage group travel expenses. 
          Multi-currency support, smart settlements, and AI-powered budgeting.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button 
            variant="gradient" 
            size="xl" 
            onClick={onGetStarted}
            className="group"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="xl">
            Watch Demo
          </Button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full shadow-sm"
            >
              <feature.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Hero visual / Mock dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-ocean rounded-2xl blur-3xl opacity-20 -z-10 transform scale-95" />
          
          {/* Dashboard preview card */}
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
              <div className="ml-4 flex-1 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Plane className="w-4 h-4" />
                  TripSplit Dashboard
                </div>
              </div>
            </div>
            
            {/* Content preview */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {/* Trip card preview */}
              <div className="col-span-2 bg-gradient-ocean rounded-xl p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Active Trip</p>
                    <h3 className="text-2xl font-bold">Tokyo Adventure 2024</h3>
                  </div>
                  <div className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    Active
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div>
                    <p className="text-white/70 text-sm">Budget</p>
                    <p className="text-xl font-semibold">$5,000</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Spent</p>
                    <p className="text-xl font-semibold">$687.95</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Travelers</p>
                    <p className="text-xl font-semibold">3</p>
                  </div>
                </div>
              </div>
              
              {/* Balance preview */}
              <div className="space-y-3">
                <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                  <p className="text-muted-foreground text-sm mb-1">You get back</p>
                  <p className="text-success text-2xl font-bold">+$245.50</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-muted-foreground text-sm mb-2">Quick Actions</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-success" />
                      <span>Add expense</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-success" />
                      <span>Settle up</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
