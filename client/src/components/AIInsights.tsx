import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  AlertTriangle, 
  Target,
  Sparkles,
  RefreshCw,
  Eye,
  ChevronRight,
  Award
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

interface AIInsight {
  id: string;
  type: 'prediction' | 'correlation' | 'achievement' | 'tip' | 'warning';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
  createdAt: Date;
}

interface SymptomPattern {
  id: string;
  pattern: string;
  frequency: number;
  correlation: string;
  recommendation: string;
}

export const AIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [patterns, setPatterns] = useState<SymptomPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [predictionData, setPredictionData] = useState<any>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadHealthDataAndGenerateInsights();
    }
  }, [user]);

  const loadHealthDataAndGenerateInsights = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Load recent symptom entries from Firebase
      const symptomsQuery = query(
        collection(db, 'symptomEntries'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const symptomsSnapshot = await getDocs(symptomsQuery);
      const symptomsData = symptomsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load recent journal entries from Firebase
      const journalsQuery = query(
        collection(db, 'journalEntries'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(30)
      );
      const journalsSnapshot = await getDocs(journalsQuery);
      const journalsData = journalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load recent daily check-ins from Firebase
      const checkinsQuery = query(
        collection(db, 'dailyCheckins'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(21)
      );
      const checkinsSnapshot = await getDocs(checkinsQuery);
      const checkinsData = checkinsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Generate insights using Google AI
      await generateAIInsights(symptomsData, journalsData, checkinsData);
      setLastGenerated(new Date());
    } catch (error) {
      console.error('Error loading health data:', error);
      toast({
        title: "Error Loading Data",
        description: "Could not load your health data for analysis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async (symptoms: any[], journals: any[], checkins: any[]) => {
    try {
      const response = await fetch('/api/ai/analyze-health-patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
          symptoms,
          journals,
          checkins,
          analysisType: 'comprehensive_insights'
        })
      });

      if (response.ok) {
        const aiAnalysis = await response.json();
        
        // Process insights
        if (aiAnalysis.insights) {
          const processedInsights = aiAnalysis.insights.map((insight: any, index: number) => ({
            id: `ai-insight-${index}`,
            type: insight.type || 'tip',
            title: insight.title,
            description: insight.description,
            confidence: insight.confidence || 85,
            actionable: insight.actionable !== false,
            priority: insight.priority || 'medium',
            createdAt: new Date(),
            data: insight.data
          }));
          setInsights(processedInsights);
        }

        // Process patterns
        if (aiAnalysis.patterns) {
          const processedPatterns = aiAnalysis.patterns.map((pattern: any, index: number) => ({
            id: `pattern-${index}`,
            pattern: pattern.pattern,
            frequency: pattern.frequency || 0,
            correlation: pattern.correlation || 'Unknown',
            recommendation: pattern.recommendation || ''
          }));
          setPatterns(processedPatterns);
        }

        // Set prediction data
        if (aiAnalysis.prediction) {
          setPredictionData(aiAnalysis.prediction);
        }

      } else {
        throw new Error('AI analysis request failed');
      }
    } catch (error) {
      console.error('AI insights generation error:', error);
      // Only show actual insights if we have real data
      if (symptoms.length === 0 && journals.length === 0 && checkins.length === 0) {
        setInsights([]);
        toast({
          title: "No Data Available",
          description: "Start tracking your symptoms and daily check-ins to generate AI insights.",
          variant: "default"
        });
      } else {
        toast({
          title: "AI Analysis Unavailable",
          description: "AI service is currently unavailable. Please try again later.",
          variant: "destructive"
        });
      }
    }
  };

  const refreshInsights = () => {
    if (user) {
      loadHealthDataAndGenerateInsights();
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return TrendingUp;
      case 'correlation': return Target;
      case 'achievement': return Award;
      case 'warning': return AlertTriangle;
      default: return Lightbulb;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (type === 'achievement') return 'border-green-300 bg-green-50 text-green-800';
    if (type === 'warning' || priority === 'high') return 'border-red-300 bg-red-50 text-red-800';
    if (priority === 'medium') return 'border-yellow-300 bg-yellow-50 text-yellow-800';
    return 'border-blue-300 bg-blue-50 text-blue-800';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Health Insights
              <Badge variant="outline" className="ml-2">
                Analyzing Real Data
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto text-blue-600 mb-4 animate-pulse" />
              <p className="text-blue-700">Analyzing your health patterns with AI...</p>
              <p className="text-sm text-gray-600 mt-2">This may take a few moments</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Health Insights
              <Badge variant="secondary" className="ml-2">
                {insights.length} Active Insights
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered analysis of your health patterns using Firebase data
              {lastGenerated && (
                <span className="ml-2 text-xs text-blue-600">
                  • Last updated: {lastGenerated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <Button 
            onClick={refreshInsights}
            disabled={loading}
            size="sm"
            className="gap-2"
            variant="outline"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh Analysis
          </Button>
        </CardHeader>

        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <Brain className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Insights Available
                </h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  Complete daily check-ins and track symptoms to generate personalized AI insights 
                  from your health patterns.
                </p>
                <Button onClick={refreshInsights} className="gap-2" disabled={loading}>
                  <RefreshCw className="h-4 w-4" />
                  Analyze My Data
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => {
                const IconComponent = getInsightIcon(insight.type);
                const colorClass = getInsightColor(insight.type, insight.priority);
                
                return (
                  <Alert key={insight.id} className={`border ${colorClass}`}>
                    <IconComponent className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {insight.title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {insight.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">
                            {insight.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <span>AI Generated • {insight.createdAt.toLocaleDateString()}</span>
                            {insight.actionable && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600 font-medium">Actionable</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patterns Section */}
      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Discovered Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patterns.map((pattern) => (
                <div key={pattern.id} className="border rounded-lg p-4 bg-purple-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{pattern.pattern}</h4>
                    <Badge variant="outline">{pattern.frequency}% frequency</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Correlation:</strong> {pattern.correlation}
                  </p>
                  <p className="text-sm text-purple-800">
                    <strong>Recommendation:</strong> {pattern.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Section */}
      {predictionData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Today's Health Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    predictionData.todayRisk === 'low' ? 'text-green-600' :
                    predictionData.todayRisk === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {predictionData.todayRisk.toUpperCase()} RISK DAY
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on your recent patterns
                  </p>
                </div>
              </div>
              
              {predictionData.riskFactors && predictionData.riskFactors.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Key Risk Factors:</h4>
                  <div className="flex flex-wrap gap-2">
                    {predictionData.riskFactors.map((factor: string, index: number) => (
                      <Badge key={index} variant="outline">{factor}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {predictionData.recommendations && predictionData.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {predictionData.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};