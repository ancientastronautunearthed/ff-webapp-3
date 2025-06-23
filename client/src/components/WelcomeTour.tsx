import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  BookOpen, 
  Users, 
  BarChart3, 
  FileText,
  Video,
  Heart,
  Calendar,
  Brain,
  Target,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Eye,
  Lightbulb,
  MessageCircle,
  Stethoscope,
  TrendingUp
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  tips: string[];
  route?: string;
  highlightElements?: string[];
}

interface WelcomeTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const WelcomeTour = ({ onComplete, onSkip }: WelcomeTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [highlightedElements, setHighlightedElements] = useState<string[]>([]);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Fiber Friends',
      description: 'Your comprehensive health tracking companion designed specifically for Morgellons disease management.',
      icon: Heart,
      route: '/dashboard',
      features: [
        'Secure symptom tracking with pattern recognition',
        'Digital journal for documenting your experience', 
        'Community support from people who understand',
        'AI-powered insights to identify triggers and patterns',
        'Telemedicine appointments with experienced doctors',
        'Gamified progress tracking to encourage daily use'
      ],
      tips: [
        'All your data is encrypted and private',
        'Start with daily check-ins to build baseline data',
        'Connect with the community for support and advice',
        'Use AI insights to discuss patterns with your doctor',
        'Complete daily tasks to earn points and maintain streaks'
      ],
      highlightElements: ['.welcome-header', '.daily-checkin-button', '.quick-actions', '.daily-task-list']
    },
    {
      id: 'symptoms', 
      title: 'Symptom Tracking',
      description: 'Log your daily symptoms with detailed tracking of severity, location, and triggers.',
      icon: Activity,
      route: '/tracker',
      features: [
        'Track symptom severity on a 1-10 scale',
        'Log specific locations affected on your body',
        'Record environmental factors and potential triggers',
        'Add notes and observations for each entry',
        'Use preset options for common symptoms and triggers'
      ],
      tips: [
        'Log symptoms at the same time each day for consistency',
        'Be specific about locations - it helps identify patterns',
        'Note weather, stress levels, and activities',
        'Take photos when appropriate to document changes',
        'Use dropdown menus for faster data entry'
      ],
      highlightElements: ['.symptom-form', '.severity-slider', '.body-map', '.environmental-factors', '.preset-options']
    },
    {
      id: 'journal',
      title: 'Digital Matchbox Journal',
      description: 'Document your daily observations, photos, and experiences in a secure digital space.',
      icon: BookOpen,
      route: '/journal',
      features: [
        'Secure photo uploads with fiber documentation',
        'Daily observation notes and mood tracking',
        'Treatment log with effectiveness ratings',
        'Environmental factor correlation tracking',
        'Privacy-first design with encrypted storage'
      ],
      tips: [
        'Take photos in good lighting for better documentation',
        'Write detailed observations - they help identify patterns',
        'Track treatments and their effectiveness over time',
        'Note environmental changes that coincide with symptoms'
      ],
      highlightElements: ['.journal-entry-form', '.photo-upload', '.treatment-log', '.mood-tracker']
    },
    {
      id: 'community',
      title: 'Community Support',
      description: 'Connect with others who understand your experience in a safe environment.',
      icon: Users,
      route: '/community',
      features: [
        'Moderated discussion forums with topic categories',
        'Private messaging with other members',
        'Share treatment experiences and outcomes',
        'Emotional support from people who understand'
      ],
      tips: [
        'Read community guidelines before posting',
        'Share your experiences to help others learn',
        'Ask questions - the community is here to help',
        'Respect privacy and never share personal medical details'
      ],
      highlightElements: ['.forum-categories', '.discussion-threads', '.support-groups']
    },
    {
      id: 'daily-tasks',
      title: 'Daily Tasks & Gamification',
      description: 'Complete daily health tasks to earn points, maintain streaks, and unlock achievements.',
      icon: Target,
      route: '/dashboard',
      features: [
        'Daily task list with point rewards',
        'Health tracking streaks with encouragement',
        'Achievement system for major milestones',
        'Community challenges and competitions',
        'Progress visualization and celebration'
      ],
      tips: [
        'Complete your daily check-in first each day',
        'Maintain streaks for better AI pattern recognition',
        'Share achievements in the community',
        'Use gamification to build healthy habits',
        'Check weekly challenges for bonus points'
      ],
      highlightElements: ['.daily-task-list', '.gamified-progress', '.achievement-badges', '.streak-counter']
    },
    {
      id: 'telemedicine',
      title: 'Telemedicine Appointments',
      description: 'Connect with verified healthcare providers experienced in Morgellons treatment.',
      icon: Stethoscope,
      route: '/telemedicine',
      features: [
        'Only verified doctors registered in Fiber Friends',
        'Filter by specialty, location, and Morgellons experience',
        'Book telehealth or in-person appointments',
        'View provider credentials and patient reviews',
        'Secure consultation scheduling system'
      ],
      tips: [
        'Filter for providers with Morgellons experience',
        'Read reviews from other patients before booking',
        'Prepare your symptom timeline before appointments',
        'Consider telehealth for initial consultations',
        'Share your Fiber Friends data during consultations'
      ],
      highlightElements: ['.provider-search', '.booking-calendar', '.appointment-types', '.verified-badge']
    },
    {
      id: 'ai-insights',
      title: 'AI Health Coach & Insights',
      description: 'Get intelligent analysis of your data with personalized recommendations and predictions.',
      icon: Brain,
      route: '/dashboard',
      features: [
        'Real-time AI analysis of your health patterns',
        'Personalized daily insights and recommendations',
        'Symptom prediction with confidence levels',
        'Environmental correlation detection',
        'Treatment effectiveness tracking',
        'Smart daily check-ins that adapt to your patterns'
      ],
      tips: [
        'Review AI insights daily for actionable recommendations',
        'Share AI findings with your healthcare providers',
        'Use correlation data to identify your triggers',
        'Trust the AI predictions - they improve with more data',
        'Follow personalized recommendations for better outcomes'
      ],
      highlightElements: ['.ai-health-coach', '.ai-insights', '.correlation-charts', '.recommendations', '.smart-checkin']
    },
    {
      id: 'peer-matching',
      title: 'Peer Matching & Support',
      description: 'Connect with other Morgellons patients for mutual support and shared experiences.',
      icon: Users,
      route: '/peer-matching',
      features: [
        'AI-powered compatibility matching',
        'Preference-based peer recommendations',
        'Symptom overlap and experience level matching',
        'Support type preferences (emotional, practical, crisis)',
        'Interest-based connections beyond health',
        'Privacy controls and communication preferences'
      ],
      tips: [
        'Complete your preferences for better matches',
        'Be open about your support needs',
        'Consider mentoring newer community members',
        'Respect privacy boundaries in all interactions',
        'Share experiences to help others learn'
      ],
      highlightElements: ['.peer-recommendations', '.compatibility-score', '.connection-requests', '.support-preferences']
    }
  ];

  const currentTourStep = tourSteps[currentStep];

  useEffect(() => {
    // Add tour-active class to body
    document.body.classList.add('tour-active');
    
    if (currentTourStep && currentTourStep.route) {
      setLocation(currentTourStep.route);
      
      // Add delay for page content to load before highlighting
      setTimeout(() => {
        highlightElements(currentTourStep.highlightElements || []);
      }, 1500);
    }
    
    // Cleanup function to remove tour-active class
    return () => {
      document.body.classList.remove('tour-active');
    };
  }, [currentStep, currentTourStep, setLocation]);

  const highlightElements = (selectors: string[]) => {
    // Remove previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });

    // Add new highlights with multiple attempts for elements that may load dynamically
    const tryHighlight = (attempt: number = 0) => {
      if (attempt > 5) return; // Stop after 5 attempts
      
      let foundElements = 0;
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.classList.add('tour-highlight');
          foundElements++;
        });
      });

      // If no elements found, try again after a short delay
      if (foundElements === 0 && attempt < 5) {
        setTimeout(() => tryHighlight(attempt + 1), 500);
      }
    };

    tryHighlight();
    setHighlightedElements(selectors);
  };

  const removeHighlights = () => {
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
    setHighlightedElements([]);
  };

  const cleanupTour = () => {
    removeHighlights();
    document.body.classList.remove('tour-active');
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      removeHighlights();
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      removeHighlights();
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    cleanupTour();
    setIsVisible(false);
    onComplete();
  };

  const skipTour = () => {
    cleanupTour();
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Tour modal - positioned at bottom to show page content */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <Card className="w-full max-w-5xl mx-auto bg-white shadow-2xl border-t-4 border-primary-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <currentTourStep.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{currentTourStep.title}</h2>
                  <Badge variant="secondary" className="text-xs">
                    Step {currentStep + 1} of {tourSteps.length}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={skipTour}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Progress value={(currentStep + 1) / tourSteps.length * 100} className="mb-4" />

            <p className="text-base text-gray-700 mb-4">{currentTourStep.description}</p>
            
            {/* Step Progress Indicators (non-clickable) */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tourSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    index === currentStep 
                      ? "bg-primary-500 text-white" 
                      : index < currentStep 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {index < currentStep && <CheckCircle className="h-3 w-3" />}
                  {index === currentStep && <Eye className="h-3 w-3" />}
                  <step.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                  Key Features
                </h3>
                <ul className="space-y-1">
                  {currentTourStep.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {currentTourStep.features.length > 3 && (
                    <li className="text-xs text-gray-500 pl-5">
                      +{currentTourStep.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Lightbulb className="mr-2 h-4 w-4 text-blue-500" />
                  Pro Tips
                </h3>
                <ul className="space-y-1">
                  {currentTourStep.tips.slice(0, 3).map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2 text-xs">
                      <Eye className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                  {currentTourStep.tips.length > 3 && (
                    <li className="text-xs text-gray-500 pl-5">
                      +{currentTourStep.tips.length - 3} more tips
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            {highlightedElements.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 mb-1">
                  <Eye className="h-3 w-3" />
                  <span className="font-medium text-sm">Look for highlighted elements above</span>
                </div>
                <p className="text-xs text-yellow-700">
                  The yellow highlighted areas on the page show the features we're discussing.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {currentStep + 1} of {tourSteps.length}
                </span>
                <Button variant="ghost" onClick={skipTour} size="sm">
                  Skip Tour
                </Button>
                <Button
                  onClick={nextStep}
                  className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600"
                >
                  <span>{currentStep === tourSteps.length - 1 ? 'Complete Tour' : 'Next'}</span>
                  {currentStep === tourSteps.length - 1 ? <CheckCircle className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tour highlight styles */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 40;
          outline: 3px solid #fbbf24 !important;
          outline-offset: 2px;
          border-radius: 8px;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3) !important;
          animation: tour-pulse 2s infinite;
        }
        
        @keyframes tour-pulse {
          0%, 100% { 
            box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3);
          }
          50% { 
            box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.2);
          }
        }
        
        /* Add padding to body when tour is active to prevent content overlap */
        body.tour-active {
          padding-bottom: 350px;
        }
      `}</style>
    </>
  );
};