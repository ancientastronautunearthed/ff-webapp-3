import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Heart, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CompanionConfig {
  species: string;
  personality: string;
  expertise: string;
  appearance: string;
  environment: string;
  customAnswers: Record<string, string>;
}

interface CompanionCreatorStepProps {
  onComplete: (imageUrl: string, config: CompanionConfig) => void;
  onSkip: () => void;
}

export const CompanionCreatorStep = ({ onComplete, onSkip }: CompanionCreatorStepProps) => {
  const [config, setConfig] = useState<CompanionConfig>({
    species: '',
    personality: '',
    expertise: '',
    appearance: '',
    environment: '',
    customAnswers: {}
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  console.log('CompanionCreatorStep rendered');

  const questions = [
    {
      id: 'species',
      title: 'What type of companion would you like?',
      description: 'Choose your AI health companion\'s form',
      options: [
        { value: 'wise-owl', label: 'Wise Owl', description: 'Knowledgeable and observant' },
        { value: 'gentle-dolphin', label: 'Gentle Dolphin', description: 'Empathetic and intuitive' },
        { value: 'mystical-fox', label: 'Mystical Fox', description: 'Clever and mysterious' },
        { value: 'healing-tree-spirit', label: 'Tree Spirit', description: 'Ancient wisdom and grounding' },
        { value: 'crystal-dragon', label: 'Crystal Dragon', description: 'Powerful and protective' }
      ]
    },
    {
      id: 'personality',
      title: 'What personality should your companion have?',
      description: 'How they communicate and support you',
      options: [
        { value: 'encouraging-cheerleader', label: 'Encouraging Cheerleader', description: 'Positive and motivating' },
        { value: 'calm-meditation-guide', label: 'Zen Master', description: 'Peaceful and mindful' },
        { value: 'scientific-researcher', label: 'Scientific Researcher', description: 'Analytical and thorough' },
        { value: 'compassionate-friend', label: 'Compassionate Friend', description: 'Understanding and supportive' },
        { value: 'wise-mentor', label: 'Wise Mentor', description: 'Experienced and guiding' }
      ]
    },
    {
      id: 'expertise',
      title: 'What should your companion specialize in?',
      description: 'Their area of expertise within Morgellons health',
      options: [
        { value: 'symptom-pattern-detective', label: 'Pattern Detective', description: 'Spots trends and connections' },
        { value: 'holistic-wellness-coach', label: 'Wellness Coach', description: 'Lifestyle and natural remedies' },
        { value: 'stress-management-therapist', label: 'Stress Therapist', description: 'Mental health and coping' },
        { value: 'nutrition-specialist', label: 'Nutrition Expert', description: 'Diet and supplements' },
        { value: 'research-coordinator', label: 'Research Guide', description: 'Latest studies and treatments' }
      ]
    },
    {
      id: 'appearance',
      title: 'How should your companion look?',
      description: 'Visual style and aesthetic preferences',
      options: [
        { value: 'ethereal-glowing', label: 'Ethereal & Glowing', description: 'Soft light and mystical aura' },
        { value: 'nature-inspired', label: 'Nature-Inspired', description: 'Earthy colors and textures' },
        { value: 'crystalline-geometric', label: 'Crystalline', description: 'Geometric patterns and crystals' },
        { value: 'warm-friendly', label: 'Warm & Friendly', description: 'Approachable and comforting' },
        { value: 'elegant-sophisticated', label: 'Elegant & Wise', description: 'Refined and distinguished' }
      ]
    },
    {
      id: 'environment',
      title: 'Where does your companion feel most at home?',
      description: 'The setting that represents their energy',
      options: [
        { value: 'healing-garden', label: 'Healing Garden', description: 'Peaceful botanical sanctuary' },
        { value: 'cosmic-observatory', label: 'Cosmic Observatory', description: 'Starlit wisdom space' },
        { value: 'crystal-cave', label: 'Crystal Cave', description: 'Mystical underground chamber' },
        { value: 'forest-library', label: 'Forest Library', description: 'Nature meets knowledge' },
        { value: 'floating-island', label: 'Sky Island', description: 'Magical floating realm' }
      ]
    }
  ];

  const currentQuestion = questions[currentStep];

  const handleOptionSelect = (value: string) => {
    setConfig(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateCompanionImage = async () => {
    setIsGenerating(true);
    try {
      const prompt = createImagePrompt(config);
      console.log('Generating companion with prompt:', prompt);
      
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Companion image generated successfully:', data.imageUrl);
      
      toast({
        title: "Companion Created!",
        description: "Your AI health companion has been successfully generated.",
      });

      // Call onComplete which should transition to the next step
      console.log('Calling onComplete with:', { imageUrl: data.imageUrl, config });
      onComplete(data.imageUrl, config);
    } catch (error) {
      console.error('Error generating companion:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to create your companion. Please try again or skip for now.",
        variant: "destructive",
      });
      setIsGenerating(false); // Reset state on error
    }
    // Don't reset isGenerating on success - let parent handle it
  };

  const createImagePrompt = (config: CompanionConfig): string => {
    return `Create a beautiful, friendly AI health companion character. 
    Species/Type: ${config.species}. 
    Personality: ${config.personality}. 
    Expertise: Morgellons disease specialist who is a ${config.expertise}. 
    Visual Style: ${config.appearance} with healing, medical, and mystical elements. 
    Environment: Set in a ${config.environment}. 
    The character should look wise, compassionate, and knowledgeable about health and wellness. 
    Include subtle medical or healing symbols, crystals, plants, or other elements that suggest expertise in rare diseases and holistic health. 
    Style: Digital art, fantasy illustration, warm and inviting, professional but magical, high quality, detailed.`;
  };

  const isStepComplete = () => {
    const value = config[currentQuestion.id as keyof CompanionConfig];
    return value && value.trim() !== '';
  };

  const allStepsComplete = () => {
    return questions.every(q => {
      const value = config[q.id as keyof CompanionConfig];
      return value && value.trim() !== '';
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-purple-600">
            <Sparkles className="w-8 h-8" />
            Create Your AI Health Companion
          </div>
          <p className="text-gray-600 text-lg">
            Design a personalized AI companion who will be your expert guide in managing Morgellons disease
          </p>
          <div className="flex justify-center space-x-2 mt-4">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="border-2 border-purple-200">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                {currentStep + 1}
              </span>
              {currentQuestion.title}
            </CardTitle>
            <p className="text-gray-600">{currentQuestion.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {currentQuestion.options.map((option) => (
                <Label
                  key={option.value}
                  className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-purple-400 ${
                    config[currentQuestion.id as keyof CompanionConfig] === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleOptionSelect(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{option.label}</span>
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option.value}
                      checked={config[currentQuestion.id as keyof CompanionConfig] === option.value}
                      onChange={() => handleOptionSelect(option.value)}
                      className="text-purple-500"
                    />
                  </div>
                  <span className="text-sm text-gray-500 mt-1">{option.description}</span>
                </Label>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0 || isGenerating}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                console.log('Skip button clicked');
                onSkip();
              }}
              disabled={isGenerating}
            >
              Skip & Continue
            </Button>
            
            {currentStep < questions.length - 1 ? (
              <Button
                onClick={nextStep}
                disabled={!isStepComplete() || isGenerating}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={generateCompanionImage}
                disabled={!allStepsComplete() || isGenerating}
                className="min-w-[140px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Companion
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {allStepsComplete() && currentStep === questions.length - 1 && (
          <Card className="border-purple-300 bg-purple-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-600" />
                Your Companion Preview
              </h3>
              <div className="space-y-2 text-sm">
                {questions.map((q) => {
                  const value = config[q.id as keyof CompanionConfig];
                  const displayValue = q.options.find(opt => opt.value === value)?.label;
                  
                  return (
                    <div key={q.id} className="flex justify-between">
                      <span className="text-gray-600">{q.title.split(' ')[0]}:</span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {displayValue}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};