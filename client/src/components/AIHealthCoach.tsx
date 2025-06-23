import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Calendar, 
  Target, 
  Lightbulb, 
  Award,
  AlertTriangle,
  CheckCircle,
  Zap,
  Sun,
  Moon,
  Cloud
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface HealthInsight {
  id: string;
  type: 'prediction' | 'correlation' | 'achievement' | 'tip' | 'warning';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

interface DailyStreak {
  current: number;
  longest: number;
  target: number;
  category: string;
}

export const AIHealthCoach = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [streaks, setStreaks] = useState<DailyStreak[]>([]);
  const [todaysPrediction, setTodaysPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateDailyInsights();
      calculateStreaks();
      generateTodaysPrediction();
    }
  }, [user]);

  const generateDailyInsights = async () => {
    // Mock AI insights - in production this would call your AI service
    const mockInsights: HealthInsight[] = [
      {
        id: '1',
        type: 'correlation',
        title: 'Weather Pattern Detected',
        description: 'Your symptoms tend to increase 35% when humidity is above 70%. Today\'s humidity is 75%.',
        confidence: 87,
        actionable: true,
        priority: 'high'
      },
      {
        id: '2',
        type: 'achievement',
        title: 'Tracking Milestone Reached!',
        description: 'You\'ve logged symptoms for 14 consecutive days. This consistency helps identify patterns.',
        confidence: 100,
        actionable: false,
        priority: 'medium'
      },
      {
        id: '3',
        type: 'tip',
        title: 'Optimal Tracking Time',
        description: 'Your most accurate symptom logs happen between 8-10 AM. Consider setting a daily reminder.',
        confidence: 73,
        actionable: true,
        priority: 'low'
      },
      {
        id: '4',
        type: 'prediction',
        title: 'Flare Risk Alert',
        description: 'Based on your patterns, there\'s a 68% chance of increased symptoms tomorrow due to weather changes.',
        confidence: 68,
        actionable: true,
        priority: 'high'
      }
    ];

    setInsights(mockInsights);
  };

  const calculateStreaks = () => {
    const mockStreaks: DailyStreak[] = [
      { current: 14, longest: 28, target: 30, category: 'Daily Symptom Logging' },
      { current: 7, longest: 12, target: 14, category: 'Journal Entries' },
      { current: 3, longest: 8, target: 7, category: 'Community Posts' },
      { current: 21, longest: 45, target: 60, category: 'Overall Engagement' }
    ];

    setStreaks(mockStreaks);
  };

  const generateTodaysPrediction = () => {
    const mockPrediction = {
      overallRisk: 'moderate',
      riskPercentage: 65,
      primaryFactors: ['High Humidity (75%)', 'Barometric Pressure Drop', 'Poor Sleep Pattern'],
      recommendations: [
        'Stay hydrated and avoid direct sunlight',
        'Consider antihistamine if itching increases',
        'Plan lighter activities for today',
        'Keep cooling products nearby'
      ],
      timeOfDay: {
        morning: { risk: 'low', intensity: 2 },
        afternoon: { risk: 'high', intensity: 7 },
        evening: { risk: 'moderate', intensity: 5 }
      }
    };

    setTodaysPrediction(mockPrediction);
    setLoading(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return AlertTriangle;
      case 'correlation': return TrendingUp;
      case 'achievement': return Award;
      case 'tip': return Lightbulb;
      case 'warning': return AlertTriangle;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (type === 'achievement') return 'bg-green-100 border-green-300 text-green-800';
    if (type === 'warning' || priority === 'high') return 'bg-red-100 border-red-300 text-red-800';
    if (priority === 'medium') return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-blue-100 border-blue-300 text-blue-800';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTimeIcon = (time: string) => {
    switch (time) {
      case 'morning': return Sun;
      case 'afternoon': return Sun;
      case 'evening': return Moon;
      default: return Cloud;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Health Coach
            <Badge variant="secondary" className="ml-auto">Powered by your data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="insights" className="text-xs">Daily Insights</TabsTrigger>
              <TabsTrigger value="prediction" className="text-xs">Today's Forecast</TabsTrigger>
              <TabsTrigger value="streaks" className="text-xs">Your Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="space-y-4 mt-4">
              <div className="grid gap-4">
                {insights.map((insight) => {
                  const IconComponent = getInsightIcon(insight.type);
                  return (
                    <Alert key={insight.id} className={getInsightColor(insight.type, insight.priority)}>
                      <IconComponent className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <strong className="text-sm">{insight.title}</strong>
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence}% confident
                            </Badge>
                          </div>
                          <p className="text-sm">{insight.description}</p>
                          {insight.actionable && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => {
                                toast({
                                  title: "Action Taken!",
                                  description: "Your health insights are helping you make better decisions.",
                                });
                              }}
                            >
                              Take Action
                            </Button>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="prediction" className="space-y-4 mt-4">
              {todaysPrediction && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Today's Symptom Forecast</h3>
                    <div className="flex items-center justify-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(todaysPrediction.overallRisk)}`}>
                        {todaysPrediction.overallRisk.toUpperCase()} RISK
                      </div>
                      <div className="text-2xl font-bold text-gray-700">
                        {todaysPrediction.riskPercentage}%
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(todaysPrediction.timeOfDay).map(([time, data]: [string, any]) => {
                      const TimeIcon = getTimeIcon(time);
                      return (
                        <Card key={time} className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TimeIcon className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium capitalize">{time}</span>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${getRiskColor(data.risk)}`}>
                            {data.risk} risk
                          </div>
                          <Progress value={data.intensity * 10} className="mt-2" />
                          <span className="text-xs text-gray-500">Intensity: {data.intensity}/10</span>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Key Factors Today:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {todaysPrediction.primaryFactors.map((factor: string, index: number) => (
                        <Badge key={index} variant="outline" className="justify-center">
                          {factor}
                        </Badge>
                      ))}
                    </div>

                    <h4 className="font-semibold text-gray-900 mt-4">Recommended Actions:</h4>
                    <ul className="space-y-2">
                      {todaysPrediction.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="streaks" className="space-y-4 mt-4">
              <div className="grid gap-4">
                {streaks.map((streak, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-sm">{streak.category}</span>
                      </div>
                      <Badge variant={streak.current >= streak.target ? "default" : "secondary"}>
                        {streak.current >= streak.target ? "Target Reached!" : `${streak.current}/${streak.target}`}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Current: {streak.current} days</span>
                        <span>Best: {streak.longest} days</span>
                      </div>
                      <Progress value={(streak.current / streak.target) * 100} />
                      <p className="text-xs text-gray-500">
                        {streak.target - streak.current > 0 
                          ? `${streak.target - streak.current} more days to reach your goal!`
                          : "Goal achieved! Keep it up!"
                        }
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};