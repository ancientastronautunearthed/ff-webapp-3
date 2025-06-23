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
  ChevronRight
} from 'lucide-react';
import { useSymptomEntries } from '@/hooks/useSymptomData';
import { useJournalEntries } from '@/hooks/useJournalData';
import { useAuth } from '@/contexts/AuthContext';
import { MorgellonsAI, type AIInsight, type SymptomPattern } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';

export const AIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [patterns, setPatterns] = useState<SymptomPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  
  const { data: symptomEntries } = useSymptomEntries();
  const { data: journalEntries } = useJournalEntries();
  const { user } = useAuth();
  const { toast } = useToast();

  // Load stored insights on component mount
  useEffect(() => {
    if (user) {
      loadStoredInsights();
    }
  }, [user]);

  const loadStoredInsights = async () => {
    if (!user) return;
    
    try {
      const storedInsights = await MorgellonsAI.getStoredInsights(user.uid);
      setInsights(storedInsights);
      if (storedInsights.length > 0) {
        setLastGenerated(storedInsights[0].createdAt);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const generateInsights = async () => {
    if (!user || !symptomEntries || !journalEntries) return;
    
    setLoading(true);
    try {
      // Generate AI insights
      const newInsights = await MorgellonsAI.generateInsights(user.uid);
      setInsights(newInsights);
      setLastGenerated(new Date());
      
      // Analyze patterns
      const analyzedPatterns = await MorgellonsAI.analyzeSymptomPatterns(
        symptomEntries, 
        journalEntries
      );
      setPatterns(analyzedPatterns);
      
      toast({
        title: "AI Analysis Complete",
        description: `Generated ${newInsights.length} new insights from your health data.`,
      });
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Unable to generate insights. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'correlation': return TrendingUp;
      case 'trend': return Brain;
      case 'recommendation': return Lightbulb;
      case 'warning': return AlertTriangle;
      default: return Target;
    }
  };

  const getInsightColor = (type: string, confidence: number) => {
    const baseColors = {
      correlation: 'blue',
      trend: 'green',
      recommendation: 'purple',
      warning: 'red'
    };
    
    const color = baseColors[type as keyof typeof baseColors] || 'gray';
    const intensity = confidence > 0.8 ? '600' : confidence > 0.6 ? '500' : '400';
    
    return `text-${color}-${intensity}`;
  };

  const canGenerateInsights = symptomEntries && symptomEntries.length >= 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Health Insights</CardTitle>
                <p className="text-sm text-gray-600">
                  Powered by Firebase AI and pattern recognition
                </p>
              </div>
            </div>
            
            <Button
              onClick={generateInsights}
              disabled={loading || !canGenerateInsights}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Analyzing...' : 'Generate Insights'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {!canGenerateInsights && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                Add at least 3 symptom entries to enable AI pattern analysis and insights.
              </AlertDescription>
            </Alert>
          )}

          {lastGenerated && (
            <p className="text-sm text-gray-500">
              Last analysis: {lastGenerated.toLocaleDateString()} at {lastGenerated.toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight) => {
                const Icon = getInsightIcon(insight.type);
                return (
                  <div key={insight.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${getInsightColor(insight.type, insight.confidence)}`} />
                        <div>
                          <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {insight.type}
                            </Badge>
                            <Badge 
                              variant={insight.confidence > 0.8 ? "default" : "outline"} 
                              className="text-xs"
                            >
                              {Math.round(insight.confidence * 100)}% confidence
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{insight.description}</p>
                    
                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-800">Recommendations:</p>
                        <ul className="space-y-1">
                          {insight.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Symptom Patterns */}
      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Detected Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patterns.map((pattern, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{pattern.pattern}</h4>
                    <Badge variant="outline">
                      {Math.round(pattern.confidence * 100)}% match
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{pattern.description}</p>
                  
                  {pattern.triggers.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-800 mb-1">Key Triggers:</p>
                      <div className="flex flex-wrap gap-1">
                        {pattern.triggers.map((trigger, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {pattern.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-800 mb-1">Suggestions:</p>
                      <ul className="space-y-1">
                        {pattern.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                            <Lightbulb className="h-3 w-3 text-yellow-500" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardHeader>
            <CardTitle>Analyzing Your Data...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && insights.length === 0 && canGenerateInsights && (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready for AI Analysis
            </h3>
            <p className="text-gray-600 mb-4">
              Your symptom data is ready for AI pattern analysis. 
              Generate insights to discover correlations and trends.
            </p>
            <Button 
              onClick={generateInsights}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start AI Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};