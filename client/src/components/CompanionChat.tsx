import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Brain, TrendingUp, AlertCircle, Lightbulb, Heart, Bot, User, Volume2, VolumeX, Play, Pause, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { synthesizeSpeech, VoiceConfig } from '@/lib/textToSpeech';

interface Message {
  id: string;
  role: 'user' | 'companion';
  content: string;
  timestamp: Date;
  type?: 'insight' | 'pattern' | 'recommendation' | 'concern' | 'encouragement';
  confidence?: number;
  relatedData?: string[];
}

interface CompanionMemory {
  userId: string;
  patterns: HealthPattern[];
  preferences: UserPreference[];
  insights: string[];
  learningProgress: number;
  lastInteraction: Date;
  personalityAdaptations: Record<string, any>;
}

interface HealthPattern {
  id: string;
  type: 'symptom' | 'trigger' | 'treatment' | 'lifestyle';
  pattern: string;
  confidence: number;
  frequency: number;
  lastObserved: Date;
  relatedFactors: string[];
}

interface UserPreference {
  category: string;
  preference: string;
  strength: number;
  learnedFrom: string[];
}

export const CompanionChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [companionMemory, setCompanionMemory] = useState<CompanionMemory | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      initializeCompanion();
      loadChatHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeCompanion = async () => {
    try {
      const response = await fetch('/api/companion/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.uid }),
      });
      
      if (response.ok) {
        const memory = await response.json();
        setCompanionMemory(memory);
        
        // Add welcome message based on learning progress
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          role: 'companion',
          content: generateWelcomeMessage(memory),
          timestamp: new Date(),
          type: 'encouragement'
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to initialize companion:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/companion/chat-history?userId=${user?.uid}`);
      if (response.ok) {
        const history = await response.json();
        setMessages(prev => [...prev, ...history]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const generateWelcomeMessage = (memory: CompanionMemory): string => {
    if (memory.learningProgress < 0.1) {
      return "Hello! I'm your new AI health companion. I'm here to learn about your health journey and provide personalized support. How are you feeling today?";
    } else if (memory.learningProgress < 0.5) {
      return `Welcome back! I've been learning about your health patterns. I've noticed ${memory.patterns.length} patterns in your data. What would you like to discuss today?`;
    } else {
      const recentPattern = memory.patterns[0];
      return `Hello again! Based on our previous conversations, I remember you've been working on ${recentPattern?.pattern}. How has that been going for you?`;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/companion/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
          message: input,
          context: {
            recentMessages: messages.slice(-5),
            companionMemory
          }
        }),
      });

      if (response.ok) {
        const { reply, updatedMemory, insights } = await response.json();
        
        const companionMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'companion',
          content: reply.content,
          timestamp: new Date(),
          type: reply.type,
          confidence: reply.confidence,
          relatedData: reply.relatedData
        };

        setMessages(prev => [...prev, companionMessage]);
        setCompanionMemory(updatedMemory);

        // Add any new insights as separate messages
        if (insights && insights.length > 0) {
          const insightMessages = insights.map((insight: any, index: number) => ({
            id: (Date.now() + 2 + index).toString(),
            role: 'companion' as const,
            content: insight.content,
            timestamp: new Date(),
            type: insight.type,
            confidence: insight.confidence
          }));
          
          setTimeout(() => {
            setMessages(prev => [...prev, ...insightMessages]);
          }, 1000);
        }

      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to reach your companion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'insight': return <Brain className="w-4 h-4" />;
      case 'pattern': return <TrendingUp className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'concern': return <AlertCircle className="w-4 h-4" />;
      case 'encouragement': return <Heart className="w-4 h-4" />;
      default: return null;
    }
  };

  const getMessageColor = (type?: string) => {
    switch (type) {
      case 'insight': return 'bg-purple-50 border-purple-200';
      case 'pattern': return 'bg-blue-50 border-blue-200';
      case 'recommendation': return 'bg-green-50 border-green-200';
      case 'concern': return 'bg-orange-50 border-orange-200';
      case 'encouragement': return 'bg-pink-50 border-pink-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/api/companion/avatar" alt="Companion" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              Your AI Health Companion
            </CardTitle>
            
            {companionMemory && (
              <div className="flex gap-2 text-sm">
                <Badge variant="secondary">
                  Learning: {Math.round(companionMemory.learningProgress * 100)}%
                </Badge>
                <Badge variant="outline">
                  {companionMemory.patterns.length} Patterns
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg border ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : getMessageColor(message.type)
                    }`}
                  >
                    {message.role === 'companion' && message.type && (
                      <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                        {getMessageIcon(message.type)}
                        <span className="capitalize">{message.type}</span>
                        {message.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(message.confidence * 100)}% confident
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {message.relatedData && message.relatedData.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.relatedData.map((data, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {data}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about your health patterns, get recommendations, or just chat..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("How are my symptoms trending lately?")}
                disabled={isLoading}
              >
                Symptom Trends
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("What patterns have you noticed in my data?")}
                disabled={isLoading}
              >
                Pattern Analysis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("Any recommendations for me today?")}
                disabled={isLoading}
              >
                Today's Advice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};