import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Wrench, 
  ShoppingCart, 
  ExternalLink, 
  Star, 
  DollarSign,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendations?: ProductRecommendation[];
  actionItems?: string[];
}

interface ProductRecommendation {
  id: string;
  name: string;
  description: string;
  price: string;
  rating: number;
  category: string;
  amazonUrl: string;
  benefits: string[];
  considerations: string[];
  suitability: string;
}

interface TechAssistantChatProps {
  assistantConfig?: any;
  assistantImage?: string;
}

export const TechAssistantChat: React.FC<TechAssistantChatProps> = ({
  assistantConfig,
  assistantImage
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    if (assistantConfig && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `Hello! I'm ${assistantConfig.name || 'your Technology Assistant'}, specialized in ${assistantConfig.expertise || 'technology solutions'} for Morgellons support. I can recommend tools, devices, and products available on Amazon that may help with your symptoms and environmental factors. 

What specific area would you like help with today? I can suggest:
• Air purifiers and humidity control devices
• Mold testing and detection equipment
• Special clothing and protective gear
• Sleep environment improvements
• Skin care devices and tools
• Documentation and monitoring equipment

Just describe your needs or ask about any specific symptoms you'd like to address!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [assistantConfig]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const speakMessage = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tech-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          userId: user?.uid,
          assistantConfig,
          messageHistory: messages.slice(-5) // Last 5 messages for context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from tech assistant');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        recommendations: data.recommendations,
        actionItems: data.actionItems
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (voiceEnabled) {
        speakMessage(data.response);
      }

    } catch (error) {
      console.error('Tech assistant error:', error);
      toast({
        title: "Assistant Unavailable",
        description: "Unable to get response from your technology assistant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRecommendations = (recommendations: ProductRecommendation[]) => {
    if (!recommendations || recommendations.length === 0) return null;

    return (
      <div className="mt-4 space-y-3">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          Recommended Products
        </h4>
        
        <div className="grid gap-3">
          {recommendations.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{product.name}</h5>
                  <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{product.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <DollarSign className="h-3 w-3" />
                    <span>{product.price}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant="outline">{product.suitability}</Badge>
              </div>
              
              {product.benefits && product.benefits.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-green-700 mb-1">Benefits:</p>
                  <ul className="text-xs text-green-600 space-y-1">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {product.considerations && product.considerations.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-orange-700 mb-1">Considerations:</p>
                  <ul className="text-xs text-orange-600 space-y-1">
                    {product.considerations.map((consideration, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {consideration}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button
                size="sm"
                onClick={() => window.open(product.amazonUrl, '_blank')}
                className="w-full"
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                View on Amazon
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderActionItems = (actionItems: string[]) => {
    if (!actionItems || actionItems.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4" />
          Next Steps
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {actionItems.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-blue-600 font-medium">{index + 1}.</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-full max-w-4xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={assistantImage} alt="Tech Assistant" />
              <AvatarFallback>
                <Wrench className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            {assistantConfig?.name || 'Technology Assistant'}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {assistantConfig?.expertise || 'Tech Expert'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={voiceEnabled ? 'text-blue-600' : 'text-gray-400'}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          Get personalized recommendations for Morgellons-related tools and products
          {voiceEnabled && <span className="text-blue-600 ml-1">• Voice enabled</span>}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={assistantImage} alt="Tech Assistant" />
                    <AvatarFallback>
                      <Wrench className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-lg px-4 py-2' 
                    : 'bg-gray-100 rounded-lg px-4 py-2'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.role === 'assistant' && (
                    <>
                      {renderRecommendations(message.recommendations || [])}
                      {renderActionItems(message.actionItems || [])}
                    </>
                  )}
                  
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback>
                      <span className="text-xs">You</span>
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={assistantImage} alt="Tech Assistant" />
                  <AvatarFallback>
                    <Wrench className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about tools, devices, or products for Morgellons support..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("I need help with air quality in my bedroom")}
              disabled={isLoading}
            >
              Air Quality
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("What clothing materials are best for sensitive skin?")}
              disabled={isLoading}
            >
              Clothing
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("I need tools to document my symptoms")}
              disabled={isLoading}
            >
              Documentation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Help me improve my sleep environment")}
              disabled={isLoading}
            >
              Sleep Setup
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};