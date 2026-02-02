import { motion } from 'framer-motion';
import { 
  Map, 
  DollarSign, 
  Users, 
  BarChart3, 
  Sparkles, 
  HeadphonesIcon,
  ArrowUpRight,
} from 'lucide-react';

const features = [
  {
    icon: Map,
    title: 'Trip Management',
    description: 'Create trips, set budgets, and invite friends. Multiple currencies supported.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: DollarSign,
    title: 'Smart Expense Splitting',
    description: 'Equal, unequal, or percentage splits. Automatic currency conversion.',
    color: 'bg-success/10 text-success',
  },
  {
    icon: Users,
    title: 'Minimal Settlements',
    description: 'Our algorithm suggests the fewest transactions to balance the group.',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: BarChart3,
    title: 'Budget Planning',
    description: 'Set category budgets, track spending, and get alerts before overspending.',
    color: 'bg-warning/10 text-warning',
  },
  {
    icon: Sparkles,
    title: 'AI Assistant',
    description: 'Ask questions about your expenses, get optimization tips and travel advice.',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    icon: HeadphonesIcon,
    title: 'Human Support',
    description: 'Escalate complex issues to real humans with our Pro and Enterprise plans.',
    color: 'bg-blue-500/10 text-blue-500',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Everything you need to travel together
          </h2>
          <p className="text-lg text-muted-foreground">
            From planning to settlement, we've got you covered with intelligent tools
            that make group travel expenses effortless.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="group h-full bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  {feature.title}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
