import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Heart,
  Target,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface ConnectionAnalytics {
  successRate: number;
  preferredTypes: string[];
  recommendations: string[];
}

export const ConnectionAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<ConnectionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/ai/connection-analytics/${user.uid}`);
      
      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
      
    } catch (error) {
      console.error('Error loading connection analytics:', error);
      toast({
        title: "Analytics Unavailable",
        description: "Unable to load connection insights at this time.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.7) return 'text-green-600';
    if (rate >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateMessage = (rate: number) => {
    if (rate >= 0.7) return 'Excellent connection success!';
    if (rate >= 0.4) return 'Good connection rate';
    return 'Room for improvement';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Connection Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Connection Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">
            Make some connections to see your analytics
          </p>
          <Button onClick={loadAnalytics} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Connection Analytics
          <Badge variant="outline" className="ml-auto">
            AI Insights
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Success Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Success Rate</span>
            <span className={`text-lg font-bold ${getSuccessRateColor(analytics.successRate)}`}>
              {Math.round(analytics.successRate * 100)}%
            </span>
          </div>
          
          <Progress 
            value={analytics.successRate * 100} 
            className="h-2"
          />
          
          <p className={`text-sm ${getSuccessRateColor(analytics.successRate)}`}>
            {getSuccessRateMessage(analytics.successRate)}
          </p>
        </div>

        {/* Preferred Connection Types */}
        {analytics.preferredTypes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Your Preferred Connection Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {analytics.preferredTypes.map((type, index) => (
                <Badge 
                  key={type} 
                  variant={index === 0 ? "default" : "secondary"}
                  className="capitalize"
                >
                  {type.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Personalized Recommendations
          </h4>
          <div className="space-y-2">
            {analytics.recommendations.map((recommendation, index) => (
              <div 
                key={index}
                className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={loadAnalytics} 
          variant="outline" 
          className="w-full"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Update Analytics
        </Button>
      </CardContent>
    </Card>
  );
};