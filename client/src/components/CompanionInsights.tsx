import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Clock, 
  Activity, 
  Heart,
  BarChart3,
  Lightbulb,
  Users,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

interface CompanionInsights {
  patterns: HealthPattern[];
  insights: string[];
  learningProgress: number;
  preferences: UserPreference[];
}

export const CompanionInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<CompanionInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user]);

  const fetchInsights = async () => {
    try {
      const response = await fetch(`/api/companion/insights?userId=${user?.uid}`);
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Failed to fetch companion insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'symptom': return <Activity className="w-4 h-4" />;
      case 'trigger': return <Target className="w-4 h-4" />;
      case 'treatment': return <Heart className="w-4 h-4" />;
      case 'lifestyle': return <Clock className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'symptom': return 'border-red-200 bg-red-50';
      case 'trigger': return 'border-orange-200 bg-orange-50';
      case 'treatment': return 'border-green-200 bg-green-50';
      case 'lifestyle': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Yet</h3>
          <p className="text-gray-500">
            Your AI companion needs more data to provide personalized insights. 
            Continue tracking your symptoms and chatting with your companion.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Learning Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Companion Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Learning Progress</span>
                <span>{Math.round(insights.learningProgress * 100)}%</span>
              </div>
              <Progress value={insights.learningProgress * 100} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {insights.patterns.length}
                </div>
                <div className="text-sm text-gray-500">Patterns Identified</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {insights.insights.length}
                </div>
                <div className="text-sm text-gray-500">Insights Generated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {insights.preferences.length}
                </div>
                <div className="text-sm text-gray-500">Preferences Learned</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Insights */}
      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patterns">Health Patterns</TabsTrigger>
          <TabsTrigger value="insights">Key Insights</TabsTrigger>
          <TabsTrigger value="preferences">Learned Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          {insights.patterns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Patterns Yet</h3>
                <p className="text-gray-500">
                  Keep tracking your symptoms and your companion will start identifying patterns in your data.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {insights.patterns.map((pattern) => (
                <Card key={pattern.id} className={`border ${getPatternColor(pattern.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-white border">
                          {getPatternIcon(pattern.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {pattern.pattern}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span>Observed {pattern.frequency} times</span>
                            <span>•</span>
                            <span>Last: {new Date(pattern.lastObserved).toLocaleDateString()}</span>
                          </div>
                          {pattern.relatedFactors.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {pattern.relatedFactors.map((factor, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="secondary" 
                          className={`capitalize ${getConfidenceColor(pattern.confidence)}`}
                        >
                          {pattern.type}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          {Math.round(pattern.confidence * 100)}% confident
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {insights.insights.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Lightbulb className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Yet</h3>
                <p className="text-gray-500">
                  Chat with your companion to receive personalized insights about your health journey.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {insights.insights.map((insight, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{insight}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          {insights.preferences.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Learning Your Preferences</h3>
                <p className="text-gray-500">
                  Your companion is still learning your communication style and preferences.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {insights.preferences.map((preference, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {preference.category}
                        </h4>
                        <p className="text-gray-600 capitalize">
                          {preference.preference.replace('_', ' ')}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {preference.learnedFrom.map((source, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {source.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {Math.round(preference.strength * 100)}% confidence
                        </div>
                        <Progress 
                          value={preference.strength * 100} 
                          className="h-2 w-16 mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Continue Learning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Add Symptom Entry
            </Button>
            <Button variant="outline" className="justify-start">
              <Heart className="w-4 h-4 mr-2" />
              Chat with Companion
            </Button>
            <Button variant="outline" className="justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Data Trends
            </Button>
            <Button variant="outline" className="justify-start">
              <Lightbulb className="w-4 h-4 mr-2" />
              Get Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};