import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TechAssistantCreator } from './TechAssistantCreator';
import { TechAssistantChat } from './TechAssistantChat';
import { 
  Wrench, 
  ShoppingCart, 
  Settings,
  MessageSquare,
  Lightbulb,
  Star,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export const TechAssistantDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [techAssistantImage, setTechAssistantImage] = useState<string | null>(null);
  const [techAssistantConfig, setTechAssistantConfig] = useState<any>(null);
  const [hasAssistant, setHasAssistant] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTechAssistantData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.techAssistantImage) {
              setTechAssistantImage(userData.techAssistantImage);
              setHasAssistant(true);
            }
            if (userData.techAssistantConfig) {
              setTechAssistantConfig(userData.techAssistantConfig);
            }
          }
        } catch (error) {
          console.log('Could not load tech assistant data:', error);
        }
      }
      setLoading(false);
    };

    loadTechAssistantData();
  }, [user]);

  const handleAssistantCreated = (imageUrl: string, config: any) => {
    setTechAssistantImage(imageUrl);
    setTechAssistantConfig(config);
    setHasAssistant(true);
    setActiveTab('chat');
  };

  const handleSkipCreation = () => {
    setHasAssistant(true);
    setActiveTab('chat');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <p className="text-gray-600">Loading Technology Assistant...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAssistant) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <Wrench className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Technology Assistant
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get personalized recommendations for tools, devices, and products that can help 
            with Morgellons symptoms and environmental factors. Your assistant will suggest 
            items available on Amazon based on your specific needs.
          </p>
        </div>
        
        <TechAssistantCreator 
          onAssistantCreated={handleAssistantCreated}
          onSkip={handleSkipCreation}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {techAssistantImage && (
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={techAssistantImage} />
                <AvatarFallback>
                  <Wrench className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 border-3 border-white rounded-full flex items-center justify-center">
                <ShoppingCart className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {techAssistantConfig?.name || 'Technology Assistant'}
            </h1>
            <p className="text-gray-600 mt-2">
              {techAssistantConfig?.expertise || 'Technology Expert'} • 
              {techAssistantConfig?.specialization || 'Comprehensive Support'} • 
              Amazon Product Specialist
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Recommendations Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            {techAssistantConfig?.personality || 'Helpful'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <TechAssistantChat 
            assistantConfig={techAssistantConfig}
            assistantImage={techAssistantImage}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Product Categories</CardTitle>
              <p className="text-gray-600">Browse common recommendations for Morgellons support</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'Air Purifiers', icon: '🌬️', count: '15+ products' },
                  { name: 'Humidity Control', icon: '💧', count: '12+ products' },
                  { name: 'Testing Kits', icon: '🧪', count: '8+ products' },
                  { name: 'Bedding & Textiles', icon: '🛏️', count: '20+ products' },
                  { name: 'Monitoring Devices', icon: '📊', count: '10+ products' },
                  { name: 'Skincare Tools', icon: '🧴', count: '18+ products' }
                ].map((category) => (
                  <div key={category.name} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <p className="text-xs text-gray-600">{category.count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recommendation Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Air Quality Solutions</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div className="w-12 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-600">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sleep Environment</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div className="w-10 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-600">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Documentation Tools</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div className="w-8 h-2 bg-purple-500 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-600">50%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">94%</div>
                    <p className="text-sm text-gray-600">Recommendation Satisfaction</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <p className="text-sm text-gray-600">Products Recommended</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">$89</div>
                    <p className="text-sm text-gray-600">Average Product Price</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assistant Configuration</CardTitle>
              <p className="text-gray-600">Customize your technology assistant's behavior and preferences</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {techAssistantConfig && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Current Configuration</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Expertise:</span>
                        <span className="text-blue-800 ml-2">{techAssistantConfig.expertise}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Personality:</span>
                        <span className="text-blue-800 ml-2">{techAssistantConfig.personality}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Style:</span>
                        <span className="text-blue-800 ml-2">{techAssistantConfig.style}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Focus:</span>
                        <span className="text-blue-800 ml-2">{techAssistantConfig.focus}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <Button onClick={() => {
                    setHasAssistant(false);
                    setTechAssistantConfig(null);
                    setTechAssistantImage(null);
                  }}>
                    Create New Assistant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};