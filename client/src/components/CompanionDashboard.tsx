import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanionProgress } from '@/contexts/CompanionProgressContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  MessageSquare, 
  Brain, 
  TrendingUp, 
  Settings,
  Heart,
  Sparkles,
  Star,
  Zap
} from 'lucide-react';
import { CompanionChat } from './CompanionChat';
import { CompanionInsights } from './CompanionInsights';
import { CompanionTierSystem } from './CompanionTierSystem';
import { CompanionFunctionality } from './CompanionFunctionality';
import { ProgressTracker } from './ProgressTracker';
import { DynamicFunctionGating } from './DynamicFunctionGating';


export const CompanionDashboard = () => {
  const { user } = useAuth();
  const { tierProgress, loading: progressLoading } = useCompanionProgress();
  const [activeTab, setActiveTab] = useState('progress');
  const [companionImage, setCompanionImage] = useState<string | null>(null);
  const [companionConfig, setCompanionConfig] = useState<any>(null);

  useEffect(() => {
    const loadCompanionData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.companionImage) {
              setCompanionImage(userData.companionImage);
            }
            if (userData.companionConfig) {
              setCompanionConfig(userData.companionConfig);
            }
          }
        } catch (error) {
          console.log('Could not load companion data:', error);
        }
      }
    };

    loadCompanionData();
  }, [user]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {companionImage && (
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={companionImage} />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {companionConfig?.customName || 'AI Health Companion'}
            </h1>
            <p className="text-gray-600 mt-2">
              Level {tierProgress?.currentTier || 1} • {companionConfig?.species || 'Health Assistant'} • {tierProgress?.totalPoints || 0} points
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Learning Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            Level {tierProgress?.currentTier || 1}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Companion Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="demo" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Demo
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Access
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="functions" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Functions
          </TabsTrigger>
          <TabsTrigger value="tier" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Evolution
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <ProgressTracker />
        </TabsContent>

        <TabsContent value="demo" className="space-y-4">
          <CompanionDemo />
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <DynamicFunctionGating />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <CompanionChat />
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <CompanionFunctionality 
            companionTier={tierProgress.currentTier}
            userSymptoms={['skin lesions', 'fatigue', 'joint pain']}
            userPreferences={{}}
          />
        </TabsContent>

        <TabsContent value="tier" className="space-y-4">
          <CompanionTierSystem 
            currentPoints={tierProgress.totalPoints}
            onTierUnlock={(tier) => {
              // Tier unlock is now handled by the progress context
            }}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <CompanionInsights />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Companion Settings</CardTitle>
              <p className="text-gray-600">Customize your AI companion's behavior and preferences</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {companionConfig && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Current Configuration</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Species:</span>
                        <span className="text-blue-800 ml-2">{companionConfig.species}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Personality:</span>
                        <span className="text-blue-800 ml-2">{companionConfig.personality}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Expertise:</span>
                        <span className="text-blue-800 ml-2">{companionConfig.expertise}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Environment:</span>
                        <span className="text-blue-800 ml-2">{companionConfig.environment}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Advanced companion settings and customization options will be available here.
                  </p>
                  <Button variant="outline" className="mt-4" disabled>
                    Customize Companion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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