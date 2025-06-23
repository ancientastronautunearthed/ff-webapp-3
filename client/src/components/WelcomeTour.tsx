import { useState } from 'react';
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
  X
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  tips: string[];
}

interface WelcomeTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const WelcomeTour = ({ onComplete, onSkip }: WelcomeTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps: TourStep[] = [
    {
      id: 'dashboard',
      title: 'Your Health Dashboard',
      description: 'Get an overview of your health journey with visual insights and quick actions.',
      icon: TrendingUp,
      features: [
        'Recent symptom trends and patterns',
        'Quick access to log new entries',
        'AI-generated health insights',
        'Upcoming calendar events'
      ],
      tips: [
        'Check your dashboard daily for pattern recognition',
        'Use quick actions for faster data entry'
      ]
    },
    {
      id: 'symptoms',
      title: 'Symptom Tracker',
      description: 'Log detailed symptom information with intensity scales and environmental factors.',
      icon: Heart,
      features: [
        'Comprehensive symptom categories',
        'Intensity rating scales (1-10)',
        'Environmental factor tracking',
        'Photo documentation support'
      ],
      tips: [
        'Log symptoms consistently for better patterns',
        'Include environmental factors like weather or stress',
        'Use the intensity scale honestly for accurate tracking'
      ]
    },
    {
      id: 'journal',
      title: 'Digital Matchbox',
      description: 'Securely document your observations with detailed notes and photos.',
      icon: BookOpen,
      features: [
        'Encrypted photo storage',
        'Detailed observation notes',
        'Link entries to symptom logs',
        'Private and secure documentation'
      ],
      tips: [
        'Take clear, well-lit photos for documentation',
        'Write detailed descriptions of what you observe',
        'Link journal entries to relevant symptom logs'
      ]
    },
    {
      id: 'calendar',
      title: 'Calendar & Trends',
      description: 'Visualize your health journey with calendar views and trend analysis.',
      icon: Calendar,
      features: [
        'Monthly calendar with symptom indicators',
        'Yearly heatmap overview',
        'Pattern recognition visualization',
        'Easy navigation to specific dates'
      ],
      tips: [
        'Look for patterns in the heatmap view',
        'Use calendar navigation to review past entries',
        'Notice correlations between dates and symptoms'
      ]
    },
    {
      id: 'community',
      title: 'Community Support',
      description: 'Connect with others who understand your experience in a safe environment.',
      icon: Users,
      features: [
        'Moderated discussion forums',
        'Topic-based conversations',
        'Share experiences and tips',
        'Support from others with Morgellons'
      ],
      tips: [
        'Be respectful and supportive in discussions',
        'Share what works for you to help others',
        'Use the community for emotional support'
      ]
    },
    {
      id: 'insights',
      title: 'AI Health Insights',
      description: 'Get intelligent analysis of your data to identify patterns and correlations.',
      icon: Activity,
      features: [
        'Pattern recognition in symptoms',
        'Environmental correlation analysis',
        'Treatment effectiveness tracking',
        'Personalized health recommendations'
      ],
      tips: [
        'Review AI insights weekly for new patterns',
        'Use insights to discuss findings with doctors',
        'Track recommended lifestyle changes'
      ]
    },
    {
      id: 'reports',
      title: 'Provider Reports',
      description: 'Generate professional health summaries to share with your healthcare team.',
      icon: FileText,
      features: [
        'Comprehensive health summaries',
        'Customizable date ranges',
        'Professional formatting',
        'Easy sharing with doctors'
      ],
      tips: [
        'Generate reports before doctor appointments',
        'Include 3-6 months of data for comprehensive view',
        'Bring printed reports to medical consultations'
      ]
    }
  ];

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTourStep = tourSteps[currentStep];
  const StepIcon = currentTourStep.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
  );
};