import { useState, useRef, useEffect } from 'react';
import { Trip, BudgetPlan, ChatMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIChatAssistProps {
  trip: Trip | null;
  budgetPlan: BudgetPlan | null;
  onClose: () => void;
}

// Stubbed AI responses based on context
function generateAIResponse(message: string, trip: Trip | null, plan: BudgetPlan | null): string {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('breakdown') || lowerMsg.includes('explain') || lowerMsg.includes('summary')) {
    if (plan) {
      let response = `Here's your budget breakdown for **${trip?.name}**:\n\n`;
      response += `📅 **Duration:** ${plan.days} days\n`;
      response += `💰 **Daily Budget:** ${trip?.currency} ${plan.perDayBudget}\n`;
      response += `📊 **Total Allocated:** ${trip?.currency} ${plan.allocatedSum}\n\n`;
      
      if (plan.categories.length > 0) {
        response += `**Category Breakdown:**\n`;
        plan.categories.forEach(cat => {
          const percent = ((cat.amount / plan.allocatedSum) * 100).toFixed(1);
          response += `• ${cat.name}: ${trip?.currency} ${cat.amount} (${percent}%)\n`;
        });
      }
      
      if (plan.difference > 0) {
        response += `\n✅ You have ${trip?.currency} ${plan.difference} remaining in your budget.`;
      } else if (plan.difference < 0) {
        response += `\n⚠️ You're ${trip?.currency} ${Math.abs(plan.difference)} over budget.`;
      }
      
      return response;
    }
    return "I don't have a budget plan to analyze yet. Please generate a budget plan first!";
  }
  
  if (lowerMsg.includes('save') || lowerMsg.includes('reduce') || lowerMsg.includes('cut')) {
    return `Here are some tips to **save money** on your trip:\n\n` +
      `1. 🍽️ **Food:** Cook some meals if you have kitchen access. Street food is often delicious and cheap!\n` +
      `2. 🚌 **Transport:** Use public transportation instead of taxis. Consider day passes.\n` +
      `3. 🎫 **Activities:** Look for free walking tours and city passes for attractions.\n` +
      `4. 🏨 **Accommodation:** Book in advance and consider staying slightly outside the center.\n` +
      `5. 💱 **Currency:** Avoid airport exchanges - use local ATMs for better rates.`;
  }
  
  if (lowerMsg.includes('split') || lowerMsg.includes('share') || lowerMsg.includes('divide')) {
    if (trip && trip.people.length > 0) {
      const perPerson = trip.budget / trip.people.length;
      return `For **${trip.name}** with ${trip.people.length} participants:\n\n` +
        `Equal split: **${trip.currency} ${perPerson.toFixed(2)}** per person\n\n` +
        `Participants: ${trip.people.map(p => p.name).join(', ')}\n\n` +
        `Would you like me to help calculate a custom split based on different percentages?`;
    }
    return "I need trip participant information to calculate splits. Please ensure your trip has people added.";
  }
  
  if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest') || lowerMsg.includes('advice')) {
    return `Based on your budget, here are my **recommendations**:\n\n` +
      `📌 **Allocation Tips:**\n` +
      `• Accommodation: 35-40% of budget\n` +
      `• Food & Dining: 25-30%\n` +
      `• Activities & Attractions: 15-20%\n` +
      `• Transportation: 10-15%\n` +
      `• Emergency Fund: 5-10%\n\n` +
      `💡 **Pro Tip:** Always keep 10% as a buffer for unexpected expenses!`;
  }
  
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return `Hello! 👋 I'm your AI budget assistant. I can help you with:\n\n` +
      `• 📊 **Explain** your budget breakdown\n` +
      `• 💡 **Suggest** ways to save money\n` +
      `• ➗ **Calculate** expense splits\n` +
      `• 🎯 **Recommend** budget allocations\n\n` +
      `What would you like to know about your trip budget?`;
  }
  
  return `I understand you're asking about "${message}". Here's what I can help with:\n\n` +
    `• Ask me to **explain the breakdown** of your budget\n` +
    `• Ask for **tips to save money**\n` +
    `• Ask about **splitting expenses**\n` +
    `• Request **budget recommendations**\n\n` +
    `Try asking something like "Explain my budget breakdown" or "How can I save money?"`;
}

export default function AIChatAssist({ trip, budgetPlan }: AIChatAssistProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! 👋 I'm your AI budget assistant for **${trip?.name || 'your trip'}**. I can help explain your budget breakdown, suggest savings, and answer questions. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiResponse = generateAIResponse(input.trim(), trip, budgetPlan);
    
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-coral flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  msg.role === 'user'
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
                )}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content.split('**').map((part, idx) => 
                    idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                  )}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-coral flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your budget..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {['Explain breakdown', 'Save money tips', 'Split expenses'].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setInput(suggestion)}
              disabled={isTyping}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}