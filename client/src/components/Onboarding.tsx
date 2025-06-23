import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, ArrowLeft, Heart, Shield, Users, BarChart3, MessageSquare, FileText, Calendar, FlaskConical } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MedicalOnboarding } from '@/components/MedicalOnboarding';
import { ResearchConsentManager } from '@/components/ResearchConsentManager';
import { WelcomeTour } from '@/components/WelcomeTour';
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

type OnboardingPhase = 'welcome' | 'medical-profile' | 'research-consent' | 'tour' | 'complete';

export const Onboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>('welcome');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Fiber Friends',
      description: 'Your comprehensive Morgellons health companion',
      icon: Heart,
      completed: completedSteps.has('welcome'),
    },
    {
      id: 'profile',
      title: 'Medical Profile',
      description: 'Share your health information for personalized insights and research',
      icon: Users,
      completed: completedSteps.has('profile'),
    },
    {
      id: 'research',
      title: 'Research Participation',
      description: 'Help advance Morgellons research with your anonymized data',
      icon: FlaskConical,
      completed: completedSteps.has('research'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Your data is encrypted and completely secure',
      icon: Shield,
      completed: completedSteps.has('privacy'),
    },
    {
      id: 'features',
      title: 'App Features',
      description: 'Discover symptom tracking, journaling, and community features',
      icon: BarChart3,
      completed: completedSteps.has('features'),
    },
    {
      id: 'community',
      title: 'Join the Community',
      description: 'Connect with others and share experiences safely',
      icon: MessageSquare,
      completed: completedSteps.has('community'),
    },
  ];

  const handleStepComplete = () => {
    const currentStepId = steps[currentStep].id;
    setCompletedSteps(prev => new Set([...prev, currentStepId]));

    if (currentStepId === 'profile') {
      setCurrentPhase('medical-profile');
    } else if (currentStepId === 'research') {
      setCurrentPhase('research-consent');
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentPhase('tour');
    }
  };

  const handleMedicalProfileComplete = (data: any) => {
    console.log('Medical profile completed with data points:', Object.keys(data).length);
    console.log('Research consent status:', {
      researchConsent: data.researchConsent,
      anonymousDataSharing: data.anonymousDataSharing,
      contactForStudies: data.contactForStudies
    });
    
    // Validate research consent was provided
    if (!data.researchConsent || !data.anonymousDataSharing) {
      toast({
        title: "Research Consent Required",
        description: "Please complete the research consent section to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setCompletedSteps(prev => new Set([...prev, 'profile']));
    setCurrentStep(2); // Move to research step
    setCurrentPhase('welcome');
    
    toast({
      title: "Medical Profile & Research Consent Complete!",
      description: "Your comprehensive health information and research participation preferences have been saved.",
    });
  };

  const handleMedicalProfileSkip = () => {
    setCurrentStep(2); // Move to research step
    setCurrentPhase('welcome');
  };

  const handleResearchConsentComplete = () => {
    setCompletedSteps(prev => new Set([...prev, 'research']));
    setCurrentStep(3); // Move to privacy step
    setCurrentPhase('welcome');
  };

  const handleTourComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setCurrentPhase('complete');
    console.log('Onboarding complete - medical data captured for research');
  };

  const handleTourSkip = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setCurrentPhase('complete');
    console.log('Tour skipped - medical data still captured for research');
  };

  if (currentPhase === 'tour') {
    return <WelcomeTour onComplete={handleTourComplete} onSkip={handleTourSkip} />;
  }

  if (currentPhase === 'medical-profile') {
    return <MedicalOnboarding onComplete={handleMedicalProfileComplete} onSkip={handleMedicalProfileSkip} />;
  }

  if (currentPhase === 'research-consent') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Research Participation</h2>
          <p className="text-lg text-gray-600">
            Help advance Morgellons research by choosing what data you're comfortable sharing.
          </p>
        </div>
        <ResearchConsentManager />
        <div className="flex justify-center">
          <Button onClick={handleResearchConsentComplete} className="bg-blue-600 hover:bg-blue-700">
            Continue to App Features
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (currentPhase === 'complete') {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Card>
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Fiber Friends!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Your onboarding is complete. You can now start tracking your symptoms, 
              journaling, and connecting with the community.
            </p>
            <Button onClick={() => { 
              localStorage.setItem('onboardingComplete', 'true');
              window.location.href = '/dashboard';
            }} className="bg-blue-600 hover:bg-blue-700">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Fiber Friends</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Help advance Morgellons research by sharing your health journey. 
            Your comprehensive medical profile will contribute to breakthrough discoveries while providing you with personalized insights.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </p>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= currentStep 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 ${
                      index < currentStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              {React.createElement(steps[currentStep].icon, { className: "mr-2 h-6 w-6 text-blue-500" })}
              {steps[currentStep].title}
            </CardTitle>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <div className="text-center space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Your Journey Starts Here</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div>
                      <h4 className="font-medium mb-2">What we'll collect:</h4>
                      <ul className="space-y-1 text-left">
                        <li>• Demographics & location</li>
                        <li>• Medical history & symptoms</li>
                        <li>• Lifestyle factors</li>
                        <li>• Research preferences</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">How this helps:</h4>
                      <ul className="space-y-1 text-left">
                        <li>• Identify symptom patterns</li>
                        <li>• Improve treatments</li>
                        <li>• Support research</li>
                        <li>• Personalized insights</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <Button onClick={handleStepComplete} className="bg-blue-600 hover:bg-blue-700 px-8">
                  Start Medical Profile Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="text-center space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Comprehensive Medical Profile</h3>
                  <p className="text-green-800 mb-4">
                    We'll collect detailed information about your health journey to help researchers 
                    understand Morgellons disease better and provide you with personalized insights.
                  </p>
                  <div className="text-sm text-green-700 text-left">
                    <h4 className="font-medium mb-2">This includes:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="space-y-1">
                        <li>• Age, gender, ethnicity</li>
                        <li>• Geographic location</li>
                        <li>• Symptom history & severity</li>
                        <li>• Other medical conditions</li>
                      </ul>
                      <ul className="space-y-1">
                        <li>• Lifestyle factors</li>
                        <li>• Environmental exposures</li>
                        <li>• Research participation preferences</li>
                        <li>• Treatment history</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <Button onClick={handleStepComplete} className="bg-green-600 hover:bg-green-700 px-8">
                  Begin Medical Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Additional steps for research, privacy, features, community */}
            {currentStep >= 2 && (
              <div className="text-center space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{steps[currentStep].title}</h3>
                  <p className="text-gray-700 mb-4">{steps[currentStep].description}</p>
                  
                  {currentStep === 2 && (
                    <div className="text-sm text-gray-600 text-left">
                      <h4 className="font-medium mb-2">Research Participation Benefits:</h4>
                      <ul className="space-y-1">
                        <li>• Contribute to medical breakthroughs</li>
                        <li>• Help future patients</li>
                        <li>• Receive aggregated research insights</li>
                        <li>• Optional compensation for participation</li>
                      </ul>
                    </div>
                  )}
                  
                  {currentStep === 3 && (
                    <div className="text-sm text-gray-600 text-left">
                      <h4 className="font-medium mb-2">Your Privacy & Security:</h4>
                      <ul className="space-y-1">
                        <li>• All data is encrypted and anonymized</li>
                        <li>• You control what data is shared</li>
                        <li>• Can withdraw consent at any time</li>
                        <li>• HIPAA compliant data handling</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  
                  <Button 
                    onClick={currentStep === steps.length - 1 ? handleStepComplete : () => setCurrentStep(currentStep + 1)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
