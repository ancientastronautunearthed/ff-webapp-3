import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MessageCircle, 
  Brain, 
  TrendingUp, 
  Calendar, 
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Target,
  Timer,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface QuickQuestion {
  id: string;
  question: string;
  type: 'scale' | 'boolean' | 'choice' | 'text';
  options?: string[];
  importance: 'high' | 'medium' | 'low';
  adaptedFromHistory?: boolean;
}

interface CheckinSuggestion {
  type: 'warning' | 'tip' | 'encouragement' | 'pattern';
  message: string;
  action?: string;
}

export const SmartDailyCheckin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isComplete, setIsComplete] = useState(false);
  const [questions, setQuestions] = useState<QuickQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [suggestions, setSuggestions] = useState<CheckinSuggestion[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkTodaysStatus();
      generateAdaptiveQuestions();
      generateSuggestions();
    }
  }, [user]);

  const checkTodaysStatus = () => {
    // Check if user has already completed today's check-in
    const today = new Date().toDateString();
    const lastCheckin = localStorage.getItem('lastCheckin');
    setIsComplete(lastCheckin === today);
    
    // Get current streak
    const streak = parseInt(localStorage.getItem('checkinStreak') || '0');
    setCurrentStreak(streak);
  };

  const generateAdaptiveQuestions = () => {
    // AI would analyze user's history to generate personalized questions
    const adaptiveQuestions: QuickQuestion[] = [
      {
        id: 'overall_feeling',
        question: 'How are you feeling overall today?',
        type: 'scale',
        importance: 'high'
      },
      {
        id: 'sleep_quality',
        question: 'How was your sleep last night?',
        type: 'choice',
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'],
        importance: 'high',
        adaptedFromHistory: true
      },
      {
        id: 'stress_level',
        question: 'What\'s your stress level today?',
        type: 'scale',
        importance: 'medium'
      },
      {
        id: 'new_symptoms',
        question: 'Any new or unusual symptoms today?',
        type: 'boolean',
        importance: 'high'
      },
      {
        id: 'weather_sensitivity',
        question: 'Are you feeling the weather changes today? (Humidity is high)',
        type: 'boolean',
        importance: 'medium',
        adaptedFromHistory: true
      },
      {
        id: 'treatment_adherence',
        question: 'Did you follow your usual care routine yesterday?',
        type: 'boolean',
        importance: 'medium'
      },
      {
        id: 'mood',
        question: 'How would you describe your mood?',
        type: 'choice',
        options: ['Optimistic', 'Content', 'Neutral', 'Frustrated', 'Worried'],
        importance: 'medium'
      }
    ];

    setQuestions(adaptiveQuestions);
  };

  const generateSuggestions = () => {
    const mockSuggestions: CheckinSuggestion[] = [
      {
        type: 'pattern',
        message: 'I notice you tend to have better days when you check in early. Consider making this a morning routine!',
      },
      {
        type: 'warning',
        message: 'Weather alert: High humidity today may trigger symptoms. Stay hydrated!',
        action: 'View prevention tips'
      },
      {
        type: 'encouragement',
        message: 'You\'ve been consistently tracking for 2 weeks! This data is helping identify your patterns.',
      }
    ];

    setSuggestions(mockSuggestions);
  };

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const submitCheckin = async () => {
    setLoading(true);
    
    try {
      // Save responses to database
      const checkinData = {
        date: new Date().toISOString().split('T')[0],
        responses,
        completedAt: new Date().toISOString()
      };

      // In production, save to your database
      console.log('Saving daily check-in:', checkinData);

      // Update streak
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      localStorage.setItem('checkinStreak', newStreak.toString());
      localStorage.setItem('lastCheckin', new Date().toDateString());
      
      setIsComplete(true);

      toast({
        title: "Daily Check-in Complete!",
        description: `Great job! You're on a ${newStreak}-day streak. Your patterns are helping advance research.`,
      });

      // Generate new insights based on responses
      generateAIFeedback();

    } catch (error) {
      console.error('Error saving check-in:', error);
      toast({
        title: "Error",
        description: "Failed to save your check-in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIFeedback = () => {
    // AI would analyze responses and provide immediate feedback
    const feedback = {
      insight: "Your stress levels seem higher today. Consider some relaxation techniques.",
      prediction: "Based on your responses, tomorrow might be a better day for outdoor activities.",
      recommendation: "Your sleep pattern suggests checking in earlier might help track morning symptoms better."
    };

    toast({
      title: "AI Insight",
      description: feedback.insight,
    });
  };

  const renderQuestion = (question: QuickQuestion) => {
    switch (question.type) {
      case 'scale':
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {question.question}
              {question.adaptedFromHistory && (
                <Badge variant="outline" className="ml-2 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Personalized
                </Badge>
              )}
            </Label>
            <div className="px-3">
              <Slider
                value={[responses[question.id] || 5]}
                onValueChange={(value) => handleResponse(question.id, value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Poor (1)</span>
                <span>Average (5)</span>
                <span>Excellent (10)</span>
              </div>
            </div>
            <div className="text-center">
              <Badge variant="secondary">
                {responses[question.id] || 5}/10
              </Badge>
            </div>
          </div>
        );

      case 'boolean':
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              {question.question}
              {question.adaptedFromHistory && (
                <Badge variant="outline" className="ml-2 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Based on your patterns
                </Badge>
              )}
            </Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={responses[question.id] === true ? "default" : "outline"}
                onClick={() => handleResponse(question.id, true)}
                className="flex-1"
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={responses[question.id] === false ? "default" : "outline"}
                onClick={() => handleResponse(question.id, false)}
                className="flex-1"
              >
                No
              </Button>
            </div>
          </div>
        );

      case 'choice':
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {question.question}
              {question.adaptedFromHistory && (
                <Badge variant="outline" className="ml-2 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Personalized
                </Badge>
              )}
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {question.options?.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={responses[question.id] === option ? "default" : "outline"}
                  onClick={() => handleResponse(question.id, option)}
                  className="justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Today's Check-in Complete!</h3>
              <p className="text-gray-600">
                You're on a {currentStreak}-day streak! Come back tomorrow for your next check-in.
              </p>
            </div>
            <Badge variant="default" className="px-4 py-2">
              <Trophy className="h-4 w-4 mr-2" />
              {currentStreak} Day Streak
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Smart Daily Check-in
          <Badge variant="secondary" className="ml-auto">
            <Timer className="h-3 w-3 mr-1" />
            ~2 min
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Current streak: {currentStreak} days</span>
          <Progress value={Math.min((currentStreak / 30) * 100, 100)} className="flex-1 max-w-32" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights for Today
            </h4>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  suggestion.type === 'warning'
                    ? 'bg-yellow-50 border-l-yellow-400'
                    : suggestion.type === 'encouragement'
                    ? 'bg-green-50 border-l-green-400'
                    : 'bg-blue-50 border-l-blue-400'
                }`}
              >
                <p className="text-sm text-gray-700">{suggestion.message}</p>
                {suggestion.action && (
                  <Button size="sm" variant="outline" className="mt-2">
                    {suggestion.action}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Adaptive Questions */}
        <div className="space-y-6">
          <h4 className="text-sm font-medium text-gray-900">Quick Health Check</h4>
          {questions.map((question) => (
            <Card key={question.id} className="p-4">
              {renderQuestion(question)}
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <Button
          onClick={submitCheckin}
          disabled={loading || Object.keys(responses).length < 3}
          className="w-full"
        >
          {loading ? 'Saving...' : 'Complete Check-in'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Your responses help our AI learn your patterns and provide better insights.
        </p>
      </CardContent>
    </Card>
  );
};