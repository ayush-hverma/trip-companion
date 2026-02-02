import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, Trip, Expense, BudgetPlan } from '@/types';
import { generateAIResponse, createMessage } from '@/services/aiChatService';
import ReactMarkdown from 'react-markdown';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-gradient-ocean text-white'
      }`}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>

      {/* Message */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser 
          ? 'bg-primary text-primary-foreground rounded-tr-sm' 
          : 'bg-muted rounded-tl-sm'
      }`}>
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface AIChatAssistProps {
  trip?: Trip;
  expenses?: Expense[];
  budget?: BudgetPlan;
  initialMessages?: ChatMessage[];
}

const AIChatAssist = ({ trip, expenses, budget, initialMessages = [] }: AIChatAssistProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = createMessage('user', input.trim(), trip?.id);
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateAIResponse(input, { trip, expenses, budget });
      const assistantMessage = createMessage('assistant', response, trip?.id);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = createMessage(
        'assistant',
        "I'm sorry, I encountered an error. Please try again.",
        trip?.id
      );
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    'How much have we spent on food?',
    'Who owes whom money?',
    'How can we optimize our budget?',
    'Any travel tips for our trip?',
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-ocean flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          AI Travel Assistant
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-ocean flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">How can I help?</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Ask me about expenses, budgets, or get travel tips
                </p>
                
                {/* Suggested questions */}
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedQuestions.map((question) => (
                    <Button
                      key={question}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setInput(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
                    <ChatBubble key={message.id} message={message} />
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-ocean flex items-center justify-center shrink-0">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about expenses, budgets, or tips..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              variant="gradient" 
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChatAssist;
