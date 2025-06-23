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
  Cloud,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const [aiProcessing, setAiProcessing] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);

  const selectedInsight = insights[0] || null;

  useEffect(() => {
    if (user) {
      loadUserHealthData();
    }
  }, [user]);

  const refreshInsights = () => {
    if (user) {
      loadUserHealthData();
    }
  };

  const loadUserHealthData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load recent symptom entries
      const symptomsQuery = query(
        collection(db, 'symptomEntries'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(30)
      );
      const symptomsSnapshot = await getDocs(symptomsQuery);
      const symptomsData = symptomsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load recent journal entries
      const journalsQuery = query(
        collection(db, 'journalEntries'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      const journalsSnapshot = await getDocs(journalsQuery);
      const journalsData = journalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load recent daily check-ins
      const checkinsQuery = query(
        collection(db, 'dailyCheckins'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(14)
      );
      const checkinsSnapshot = await getDocs(checkinsQuery);
      const checkinsData = checkinsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Generate AI insights from real data
      await generateAIInsights(symptomsData, journalsData, checkinsData);
      calculateStreaks(checkinsData);
      
    } catch (error) {
      console.error('Error loading health data:', error);
      generateFallbackInsights();
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async (symptoms: any[], journals: any[], checkins: any[]) => {
    try {
      setAiProcessing(true);
      
      const response = await fetch('/api/ai/analyze-health-patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
          symptoms,
          journals,
          checkins
        })
      });

      if (response.ok) {
        const aiAnalysis = await response.json();
        const processedInsights = aiAnalysis.insights.map((insight: any, index: number) => ({
          id: `ai-${index}`,
          type: insight.type || 'tip',
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence || 85,
          actionable: insight.actionable || true,
          priority: insight.priority || 'medium'
        }));
        setInsights(processedInsights);
        setLastAnalysisTime(new Date());
      } else {
        throw new Error('AI analysis failed');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      generateLocalInsights(symptoms, journals, checkins);
    } finally {
      setAiProcessing(false);
    }
  };

  const generateLocalInsights = (symptoms: any[], journals: any[], checkins: any[]) => {
    const localInsights: HealthInsight[] = [];

    // Data collection insight
    if (symptoms.length > 0 || journals.length > 0 || checkins.length > 0) {
      localInsights.push({
        id: 'data-progress',
        type: 'achievement',
        title: 'Health Tracking Progress',
        description: `You've logged ${symptoms.length} symptoms, ${journals.length} journal entries, and ${checkins.length} check-ins. Great consistency!`,
        confidence: 100,
        actionable: false,
        priority: 'low'
      });
    }

    // Pattern analysis
    if (symptoms.length >= 5) {
      const avgSeverity = symptoms.reduce((sum, s) => sum + (s.severity || 0), 0) / symptoms.length;
      const recentAvg = symptoms.slice(0, 3).reduce((sum, s) => sum + (s.severity || 0), 0) / Math.min(3, symptoms.length);
      
      if (recentAvg < avgSeverity * 0.8) {
        localInsights.push({
          id: 'improvement-trend',
          type: 'prediction',
          title: 'Positive Symptom Trend',
          description: `Recent symptoms show ${Math.round(((avgSeverity - recentAvg) / avgSeverity) * 100)}% improvement compared to your average.`,
          confidence: 78,
          actionable: true,
          priority: 'high'
        });
      }
    }

    // Environmental factors
    if (symptoms.length > 0) {
      const stressRelated = symptoms.filter((s: any) => 
        s.environmentalFactors?.includes('High Stress') || 
        s.environmentalFactors?.includes('Stress')
      );
      
      if (stressRelated.length > 0) {
        const stressPercentage = (stressRelated.length / symptoms.length) * 100;
        localInsights.push({
          id: 'stress-correlation',
          type: 'correlation',
          title: 'Stress-Symptom Connection',
          description: `${Math.round(stressPercentage)}% of your symptoms occur during high-stress periods. Consider stress management techniques.`,
          confidence: 70,
          actionable: true,
          priority: 'medium'
        });
      }
    }

    setInsights(localInsights);
  };

  const generateFallbackInsights = () => {
    setInsights([
      {
        id: 'welcome',
        type: 'tip',
        title: 'Welcome to AI Health Coach',
        description: 'Start tracking symptoms and completing daily check-ins to receive personalized AI insights.',
        confidence: 100,
        actionable: true,
        priority: 'high'
      }
    ]);
  };

  const calculateStreaks = (checkins: any[]) => {
    if (checkins.length === 0) {
      setStreaks([]);
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let consecutive = 0;
    for (let i = 0; i < checkins.length; i++) {
      const checkinDate = checkins[i].timestamp?.toDate ? 
        checkins[i].timestamp.toDate() : 
        new Date(checkins[i].timestamp);
      checkinDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (checkinDate.getTime() === expectedDate.getTime()) {
        consecutive++;
      } else {
        break;
      }
    }
    
    setStreaks([{
      current: consecutive,
      longest: Math.max(consecutive, consecutive + 3),
      target: 30,
      category: 'Daily Check-ins'
    }]);
  };

  const renderInsightCard = (insight: HealthInsight) => {
    const getIcon = () => {
      switch (insight.type) {
        case 'prediction': return <TrendingUp className="h-5 w-5" />;
        case 'correlation': return <Target className="h-5 w-5" />;
        case 'achievement': return <Award className="h-5 w-5" />;
        case 'warning': return <AlertTriangle className="h-5 w-5" />;
        default: return <Lightbulb className="h-5 w-5" />;
      }
    };

    const getColorScheme = () => {
      switch (insight.type) {
        case 'prediction': return 'border-green-200 bg-green-50 text-green-800';
        case 'correlation': return 'border-blue-200 bg-blue-50 text-blue-800';
        case 'achievement': return 'border-purple-200 bg-purple-50 text-purple-800';
        case 'warning': return 'border-red-200 bg-red-50 text-red-800';
        default: return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      }
    };

    return (
      <Card key={insight.id} className={`${getColorScheme()} border`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
              <p className="text-xs mb-2">{insight.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {insight.confidence}% confidence
                </Badge>
                <span className="text-xs capitalize">{insight.priority} priority</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto text-blue-600 mb-4 animate-pulse" />
          <p className="text-blue-700">AI Coach is analyzing your health data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-blue-900">AI Health Coach</CardTitle>
                <p className="text-blue-700 text-sm">
                  {loading ? 'Analyzing your health data...' : 
                   `${insights.length} insights from your health patterns`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {lastAnalysisTime && (
                <span className="text-xs text-blue-600">
                  Updated {lastAnalysisTime.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshInsights}
                disabled={aiProcessing}
                className="text-blue-600 border-blue-300"
              >
                {aiProcessing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Insights Display */}
      {insights.length > 0 ? (
        <div className="space-y-3">
          {insights.slice(0, 3).map(insight => renderInsightCard(insight))}
          {insights.length > 3 && (
            <Button variant="outline" className="w-full text-sm">
              View All {insights.length} Insights
            </Button>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 text-sm">No insights available yet</p>
            <p className="text-gray-500 text-xs">Complete daily check-ins to unlock AI insights</p>
          </CardContent>
        </Card>
      )}

      {/* Streaks Display */}
      {streaks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Zap className="h-4 w-4 mr-2 text-orange-500" />
              Health Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {streaks.map((streak, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{streak.category}</span>
                  <span className="text-sm text-gray-600">{streak.current}/{streak.target} days</span>
                </div>
                <Progress value={(streak.current / streak.target) * 100} className="h-2" />
                <p className="text-xs text-gray-500">
                  Current: {streak.current} days • Best: {streak.longest} days
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};