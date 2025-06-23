import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Brain, 
  TrendingUp, 
  Settings,
  Heart,
  Sparkles
} from 'lucide-react';
import { CompanionChat } from './CompanionChat';
import { CompanionInsights } from './CompanionInsights';

export const CompanionDashboard = () => {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Health Companion</h1>
          <p className="text-gray-600 mt-2">
            Your personal AI companion learns from your health journey to provide tailored support and insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Learning Active
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Companion Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Knowledge Base
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <CompanionChat />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <CompanionInsights />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Pattern Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Detailed analysis of patterns your companion has identified in your health data.
              </p>
              <CompanionInsights />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Companion Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Your companion builds knowledge from multiple sources to provide better support:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Personal Health Data</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Symptom tracking entries</li>
                        <li>• Journal observations</li>
                        <li>• Treatment responses</li>
                        <li>• Lifestyle factors</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Conversation Learning</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Communication preferences</li>
                        <li>• Emotional patterns</li>
                        <li>• Support needs</li>
                        <li>• Information interests</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Pattern Recognition</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Symptom correlations</li>
                        <li>• Trigger identification</li>
                        <li>• Time-based patterns</li>
                        <li>• Treatment effectiveness</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Adaptive Responses</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Personalized recommendations</li>
                        <li>• Contextual support</li>
                        <li>• Proactive insights</li>
                        <li>• Learning improvements</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h3 className="font-medium text-blue-900 mb-2">Privacy & Security</h3>
                  <p className="text-sm text-blue-800">
                    All learning happens securely within your personal companion instance. 
                    Your data is never shared with other users or external parties. 
                    You can reset your companion's learning at any time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};