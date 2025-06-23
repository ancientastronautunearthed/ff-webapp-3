import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MedicalProfileForm } from '@/components/MedicalProfileForm';
import { 
  Heart, 
  BookOpen, 
  Users, 
  TrendingUp, 
  FileText, 
  Calendar,
  CheckCircle,
  ArrowRight,
  Microscope,
  Shield,
  Sparkles,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

export const Onboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [profileComplete, setProfileComplete] = useState(false);
  const [tourComplete, setTourComplete] = useState(false);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Fiber Friends',
      description: 'Your comprehensive Morgellons health companion',
      icon: Heart,
      completed: false
    },
    {
      id: 'profile',
      title: 'Complete Medical Profile',
      description: 'Help advance research with your health information',
      icon: FileText,
      completed: profileComplete
    },
    {
      id: 'features',
      title: 'Discover Key Features',
      description: 'Learn how to track symptoms and connect with others',
      icon: Sparkles,
      completed: false
    },
    {
      id: 'privacy',
      title: 'Privacy & Research',
      description: 'Understand how your data contributes to research',
      icon: Shield,
      completed: false
    },
    {
      id: 'ready',
      title: 'You\'re All Set!',
      description: 'Start your journey toward better health understanding',
      icon: CheckCircle,
      completed: false
    }
  ];

  const handleProfileComplete = async (profileData: any) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        medicalProfile: profileData,
        profileComplete: true,
        researchOptIn: profileData.researchConsent,
        anonymousDataSharing: profileData.anonymousDataSharing,
        onboardingComplete: false,
        updatedAt: new Date()
      });

      setProfileComplete(true);
      setCurrentStep(2);
      
      toast({
        title: "Medical Profile Complete!",
        description: "Your information will help advance Morgellons research.",
      });
    } catch (error) {
      toast({
        title: "Profile Save Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        onboardingComplete: true,
        updatedAt: new Date()
      });

      toast({
        title: "Welcome to Fiber Friends!",
        description: "You're ready to start tracking your health journey.",
      });

      // Navigate to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      toast({
        title: "Onboarding Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Fiber Friends</h1>
          <p className="text-xl text-gray-600 mb-6">
            Your personal health companion for Morgellons disease
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {onboardingSteps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Welcome Step */}
          {currentStep === 0 && (
            <Card className="shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Welcome to Your Health Journey</CardTitle>
                <p className="text-gray-600 mt-2">
                  Fiber Friends is designed by and for people with Morgellons disease to track symptoms, 
                  share experiences, and contribute to research that advances understanding of this condition.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Activity className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold text-blue-900">Track Symptoms</h3>
                    <p className="text-blue-800 text-sm">Monitor your symptoms with detailed tracking tools designed specifically for Morgellons.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <BookOpen className="h-8 w-8 text-green-600 mb-2" />
                    <h3 className="font-semibold text-green-900">Digital Matchbox</h3>
                    <p className="text-green-800 text-sm">Securely document your observations with photos and detailed notes.</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mb-2" />
                    <h3 className="font-semibold text-purple-900">Connect & Support</h3>
                    <p className="text-purple-800 text-sm">Join a supportive community of people who understand your experience.</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <Microscope className="h-8 w-8 text-orange-600 mb-2" />
                    <h3 className="font-semibold text-orange-900">Advance Research</h3>
                    <p className="text-orange-800 text-sm">Contribute to medical research that could lead to better treatments.</p>
                  </div>
                </div>
                
                <div className="text-center pt-4">
                  <Button onClick={nextStep} className="bg-primary-500 hover:bg-primary-600 px-8">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medical Profile Step */}
          {currentStep === 1 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Medical Profile</h2>
                <p className="text-gray-600">
                  This comprehensive profile helps doctors and researchers identify patterns and develop better treatments.
                </p>
              </div>
              <MedicalProfileForm onComplete={handleProfileComplete} isNewUser={true} />
            </div>
          )}

          {/* Features Tour Step */}
          {currentStep === 2 && (
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Discover Your Health Tools</CardTitle>
                <p className="text-gray-600 mt-2">
                  Explore the powerful features designed to help you understand and manage your health.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Symptom Tracker</h3>
                      <p className="text-gray-600 text-sm">Log daily symptoms with detailed intensity scales and environmental factors.</p>
                      <Badge variant="secondary" className="mt-1">Essential Feature</Badge>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Digital Matchbox</h3>
                      <p className="text-gray-600 text-sm">Secure, encrypted storage for photos and observations of fibers and lesions.</p>
                      <Badge variant="outline" className="mt-1">Privacy Protected</Badge>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">AI Insights</h3>
                      <p className="text-gray-600 text-sm">Get intelligent pattern recognition and correlations from your data.</p>
                      <Badge variant="default" className="mt-1">Powered by AI</Badge>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Calendar View</h3>
                      <p className="text-gray-600 text-sm">Visualize your health journey with calendar heatmaps and trend analysis.</p>
                      <Badge variant="secondary" className="mt-1">Visual Tracking</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button onClick={nextStep} className="bg-primary-500 hover:bg-primary-600">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy & Research Step */}
          {currentStep === 3 && (
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Privacy & Research Impact</CardTitle>
                <p className="text-gray-600 mt-2">
                  Understanding how your data is protected and contributes to medical advancement.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <Shield className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold text-blue-900 mb-2">Your Privacy is Protected</h3>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• All data encrypted in transit and at rest</li>
                      <li>• Personal identifiers removed from research data</li>
                      <li>• You control what information you share</li>
                      <li>• Withdraw consent at any time</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
                    <Microscope className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-purple-900 mb-2">Research Impact</h3>
                    <ul className="text-purple-800 text-sm space-y-1">
                      <li>• Help identify symptom patterns and triggers</li>
                      <li>• Contribute to treatment effectiveness studies</li>
                      <li>• Support geographic distribution research</li>
                      <li>• Advance medical understanding of Morgellons</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Research Ethics</h4>
                  <p className="text-yellow-800 text-sm">
                    Fiber Friends follows strict ethical guidelines for medical research. Your anonymized data 
                    is only shared with qualified medical professionals and researchers working to understand 
                    and treat Morgellons disease. You maintain full control over your participation.
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button onClick={nextStep} className="bg-primary-500 hover:bg-primary-600">
                    I Understand <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ready Step */}
          {currentStep === 4 && (
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-green-900">You're All Set!</CardTitle>
                <p className="text-gray-600 mt-2 text-lg">
                  Welcome to the Fiber Friends community. You're ready to start your health journey.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-green-800">Profile Complete</span>
                    </div>
                    <div className="text-center p-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-green-800">Privacy Secured</span>
                    </div>
                    <div className="text-center p-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Microscope className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-green-800">Research Enrolled</span>
                    </div>
                    <div className="text-center p-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Heart className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-green-800">Ready to Track</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Next Steps</h3>
                    <p className="text-gray-700 text-sm mb-4">
                      Start by logging your first symptom entry or exploring the community to connect with others.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="outline">Log Symptoms</Badge>
                      <Badge variant="outline">Join Community</Badge>
                      <Badge variant="outline">Explore Calendar</Badge>
                      <Badge variant="outline">Read AI Insights</Badge>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                    <Button 
                      onClick={completeOnboarding}
                      className="bg-green-600 hover:bg-green-700 px-8"
                    >
                      Enter Fiber Friends <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {onboardingSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep || (index === 1 && profileComplete);
              
              return (
                <div
                  key={step.id}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};