import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart,
  Send,
  Sparkles,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  isFromAI: boolean;
  timestamp: Date;
  sentiment?: 'positive' | 'neutral' | 'concerned' | 'supportive';
  suggestions?: string[];
}

interface CompanionInsight {
  type: 'pattern' | 'encouragement' | 'reminder' | 'tip';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export function AIHealthCompanion() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [companionInsights, setCompanionInsights] = useState<CompanionInsight[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Listen to real-time chat messages
    const messagesQuery = query(
      collection(db, 'companionChats'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const chatMessages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        chatMessages.push({
          id: doc.id,
          userId: data.userId,
          message: data.message,
          isFromAI: data.isFromAI,
          timestamp: data.timestamp?.toDate() || new Date(),
          sentiment: data.sentiment,
          suggestions: data.suggestions || []
        });
      });
      setMessages(chatMessages);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load companion insights when component mounts
    if (user) {
      loadCompanionInsights();
    }
  }, [user]);

  const loadCompanionInsights = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/companion/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });

      if (response.ok) {
        const insights = await response.json();
        setCompanionInsights(insights.slice(0, 3)); // Show top 3 insights
      }
    } catch (error) {
      console.error('Error loading companion insights:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !user || isLoading) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Add user message to Firestore
      await addDoc(collection(db, 'companionChats'), {
        userId: user.uid,
        message: userMessage,
        isFromAI: false,
        timestamp: serverTimestamp()
      });

      // Get AI response
      const response = await fetch('/api/companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.uid, 
          message: userMessage 
        })
      });

      if (response.ok) {
        const aiResponse = await response.json();
        
        // Add AI response to Firestore
        await addDoc(collection(db, 'companionChats'), {
          userId: user.uid,
          message: aiResponse.message,
          isFromAI: true,
          timestamp: serverTimestamp(),
          sentiment: aiResponse.sentiment || 'supportive',
          suggestions: aiResponse.suggestions || []
        });

        // Refresh insights after conversation
        await loadCompanionInsights();
      } else {
        toast({
          title: "Connection Issue",
          description: "I'm having trouble responding right now. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'concerned': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'supportive': return <Heart className="h-4 w-4 text-pink-500" />;
      default: return <MessageCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'encouragement': return <Heart className="h-4 w-4 text-pink-500" />;
      case 'reminder': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'tip': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      default: return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Health Companion
          </h1>
          <p className="text-gray-600">
            Your compassionate AI companion is here to support your health journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/ai-companion.png" />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Heart className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                Your Health Companion
                <Badge variant="secondary" className="ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Online
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-pink-300" />
                      <p className="text-lg font-medium mb-2">Welcome to your AI Health Companion</p>
                      <p className="text-sm">
                        I'm here to listen, support, and help you understand your health patterns. 
                        How are you feeling today?
                      </p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromAI ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isFromAI
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.isFromAI && (
                            <div className="mt-1">
                              {getSentimentIcon(message.sentiment)}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm">{message.message}</p>
                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.suggestions.map((suggestion, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-6"
                                    onClick={() => setCurrentMessage(suggestion)}
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share how you're feeling or ask a question..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!currentMessage.trim() || isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Companion Insights */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Companion Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companionInsights.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Start a conversation to receive personalized insights about your health patterns.
                    </p>
                  ) : (
                    companionInsights.map((insight, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium capitalize">
                              {insight.type}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {insight.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setCurrentMessage("How am I doing with my health goals?")}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Check Progress
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setCurrentMessage("What patterns do you notice in my symptoms?")}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Discuss Patterns
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setCurrentMessage("I'm feeling overwhelmed today")}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Need Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}