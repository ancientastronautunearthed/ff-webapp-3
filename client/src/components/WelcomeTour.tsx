import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  BookOpen, 
  Users, 
  TrendingUp, 
  FileText, 
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Microscope,
  Activity,
  X,
  Video
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
  const [location, navigate] = useLocation();

  const tourSteps: TourStep[] = [
    {
      id: 'dashboard',
      title: 'Your Health Dashboard',
      description: 'Get an overview of your health journey with visual insights and quick actions.',
      icon: TrendingUp,
      route: '/dashboard',
      features: [
        'Today\'s progress tracking with visual indicators',
        'Quick action buttons for symptom tracking',
        'Weekly overview with completion streaks',
        'AI-generated health insights and correlations'
      ],
      tips: [
        'Check your dashboard daily for pattern recognition',
        'Use quick actions for immediate symptom logging',
        'Review weekly trends to identify patterns'
      ],
      highlightElements: ['.quick-actions', '.stats-cards', '.weekly-overview']
    },
    {
      id: 'symptoms',
      title: 'Symptom Tracker',
      description: 'Log detailed symptom information with intensity scales and environmental factors.',
      icon: Heart,
      route: '/tracker',
      features: [
        'Pre-populated symptom categories with clickable selections',
        'Intensity sliders (1-10) for accurate severity tracking',
        'Environmental factors: weather, stress, diet, chemicals',
        'Fiber and lesion documentation with photo support'
      ],
      tips: [
        'Use dropdown menus instead of typing for faster entry',
        'Track environmental factors like weather changes',
        'Log symptoms at the same time daily for consistency',
        'Include photos when documenting new lesions or fibers'
      ],
      highlightElements: ['.symptom-form', '.intensity-sliders', '.factor-checkboxes']
    },
    {
      id: 'journal',
      title: 'Digital Matchbox',
      description: 'Securely document your observations with detailed notes and photos.',
      icon: BookOpen,
      route: '/journal',
      features: [
        'Encrypted photo storage with multiple file support',
        'Rich text editor for detailed observations',
        'Link entries to specific symptom logs',
        'Date and time stamped entries for tracking'
      ],
      tips: [
        'Use good lighting when photographing fibers or lesions',
        'Include ruler or coin for size reference in photos',
        'Write detailed descriptions of texture, color, movement',
        'Link to symptom entries for comprehensive tracking'
      ],
      highlightElements: ['.journal-form', '.photo-upload', '.entry-linking']
    },
    {
      id: 'calendar',
      title: 'Calendar & Trends',
      description: 'Visualize your health journey with calendar views and trend analysis.',
      icon: Calendar,
      route: '/calendar',
      features: [
        'Monthly calendar with color-coded symptom intensity',
        'Yearly heatmap for long-term pattern recognition',
        'Quick entry creation from calendar dates',
        'Visual correlation between environmental factors and symptoms'
      ],
      tips: [
        'Darker colors indicate higher symptom intensity days',
        'Click any date to add entries or view details',
        'Use the yearly view to identify seasonal patterns',
        'Look for clusters of high-intensity days for triggers'
      ],
      highlightElements: ['.calendar-view', '.heatmap', '.date-navigation']
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
      id: 'telemedicine',
      title: 'Telemedicine Appointments',
      description: 'Connect with healthcare providers experienced in Morgellons treatment.',
      icon: Video,
      route: '/telemedicine',
      features: [
        'Search providers with Morgellons experience',
        'Filter by specialty, location, and ratings',
        'Book telehealth or in-person appointments',
        'View provider credentials and patient reviews'
      ],
      tips: [
        'Filter for providers with Morgellons experience',
        'Read reviews from other patients before booking',
        'Prepare your symptom timeline before appointments',
        'Consider telehealth for initial consultations'
      ],
      highlightElements: ['.provider-search', '.booking-calendar', '.appointment-types']
    },
    {
      id: 'insights',
      title: 'AI Health Insights',
      description: 'Get intelligent analysis of your data to identify patterns and correlations.',
      icon: Activity,
      route: '/ai-insights',
      features: [
        'Automated pattern recognition in your symptom data',
        'Environmental correlation analysis (weather, stress, diet)',
        'Treatment effectiveness tracking over time',
        'Personalized recommendations based on your patterns'
      ],
      tips: [
        'Review insights weekly to spot new patterns',
        'Share AI findings with your healthcare providers',
        'Use correlation data to identify your triggers',
        'Track suggested lifestyle changes for effectiveness'
      ],
      highlightElements: ['.ai-patterns', '.correlation-charts', '.recommendations']
    },
    {
      id: 'reports',
      title: 'Provider Reports',
      description: 'Generate professional health summaries to share with your healthcare team.',
      icon: FileText,
      route: '/reports',
      features: [
        'Comprehensive health summaries with symptom trends',
        'Customizable date ranges for specific periods',
        'Professional PDF formatting for medical use',
        'Include photos, notes, and correlation data'
      ],
      tips: [
        'Generate reports 2-3 days before appointments',
        'Include 3-6 months of data for pattern recognition',
        'Print reports and bring copies to consultations',
        'Highlight significant changes or new symptoms'
      ],
      highlightElements: ['.report-generator', '.date-range-selector', '.export-options']
    }
  ];

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  // Navigate to appropriate page when step changes
  useEffect(() => {
    const currentTourStep = tourSteps[currentStep];
    if (currentTourStep.route && location !== currentTourStep.route) {
      navigate(currentTourStep.route);
    }
  }, [currentStep, navigate, location]);

  // Add highlighting effects for specific elements
  useEffect(() => {
    const currentTourStep = tourSteps[currentStep];
    if (currentTourStep.highlightElements) {
      // Add highlighting class to elements
      currentTourStep.highlightElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.classList.add('tour-highlight');
        });
      });

      // Cleanup function to remove highlights
      return () => {
        currentTourStep.highlightElements.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.classList.remove('tour-highlight');
          });
        });
      };
    }
  }, [currentStep]);

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTourStep = tourSteps[currentStep];
  const StepIcon = currentTourStep.icon;

  return (
    <>
      {/* Compact Tour Modal positioned at bottom-right */}
      <div className="fixed bottom-6 right-6 z-50 max-w-md w-80">
      <Card className="shadow-2xl border-2 border-blue-500">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="absolute right-2 top-2"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <StepIcon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl font-bold">{currentTourStep.title}</CardTitle>
            <p className="text-gray-600 mt-2">{currentTourStep.description}</p>
            
            <div className="flex justify-center mt-4">
              <Badge variant="outline">
                Step {currentStep + 1} of {tourSteps.length}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-blue-800 text-sm">
              <strong>Live Demo:</strong> This tour is showing you the actual {currentTourStep.title.toLowerCase()} page. 
              Look around to see the features being described!
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
            <ul className="space-y-2">
              {currentTourStep.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Pro Tips:</h4>
            <ul className="space-y-2">
              {currentTourStep.tips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  </div>
                  <span className="text-sm text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={onSkip}>
                Skip Tour
              </Button>
              <Button 
                onClick={nextStep} 
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                {currentStep === tourSteps.length - 1 ? 'Finish Tour' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2 pt-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-primary-500' : 
                  index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Add CSS for highlighting elements */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.6), 
                      0 0 0 6px rgba(59, 130, 246, 0.3);
          border-radius: 6px;
          transition: all 0.3s ease;
        }
        
        .tour-highlight::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          background: rgba(59, 130, 246, 0.15);
          border-radius: 9px;
          z-index: -1;
          animation: tourPulse 2s infinite;
        }
        
        @keyframes tourPulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};