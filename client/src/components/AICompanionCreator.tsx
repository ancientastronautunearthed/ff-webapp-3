import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateImage } from '@/lib/gemini';

interface CompanionConfig {
  species: string;
  personality: string;
  expertise: string;
  appearance: string;
  environment: string;
  customName?: string;
}

interface AICompanionCreatorProps {
  onCompanionCreated: (imageUrl: string, config: CompanionConfig) => void;
  onSkip: () => void;
}

export const AICompanionCreator = ({ onCompanionCreated, onSkip }: AICompanionCreatorProps) => {
  const [config, setConfig] = useState<CompanionConfig>({
    species: '',
    personality: '',
    expertise: '',
    appearance: '',
    environment: '',
    customName: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const questions = [
    {
      id: 'species',
      title: 'What type of companion would you like?',
      description: 'Choose the species of your AI health companion',
      options: [
        { value: 'wise-owl', label: 'Wise Owl', description: 'Knowledgeable and observant' },
        { value: 'gentle-dolphin', label: 'Gentle Dolphin', description: 'Empathetic and intuitive' },
        { value: 'mystical-fox', label: 'Mystical Fox', description: 'Clever and mysterious' },
        { value: 'healing-tree-spirit', label: 'Tree Spirit', description: 'Ancient wisdom and grounding' },
        { value: 'crystal-dragon', label: 'Crystal Dragon', description: 'Powerful and protective' },
        { value: 'custom', label: 'Other...', description: 'Describe your own idea' }
      ]
    },
    {
      id: 'personality',
      title: 'What personality should your companion have?',
      description: 'This affects how they communicate and support you',
      options: [
        { value: 'encouraging-cheerleader', label: 'Encouraging Cheerleader', description: 'Positive and motivating' },
        { value: 'calm-meditation-guide', label: 'Zen Master', description: 'Peaceful and mindful' },
        { value: 'scientific-researcher', label: 'Scientific Researcher', description: 'Analytical and thorough' },
        { value: 'compassionate-friend', label: 'Compassionate Friend', description: 'Understanding and supportive' },
        { value: 'wise-mentor', label: 'Wise Mentor', description: 'Experienced and guiding' },
        { value: 'custom', label: 'Other...', description: 'Describe a different personality' }
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
        { value: 'research-coordinator', label: 'Research Guide', description: 'Latest studies and treatments' },
        { value: 'custom', label: 'Other...', description: 'Different specialization' }
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
        { value: 'elegant-sophisticated', label: 'Elegant & Wise', description: 'Refined and distinguished' },
        { value: 'custom', label: 'Other...', description: 'Describe your vision' }
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
        { value: 'floating-island', label: 'Sky Island', description: 'Magical floating realm' },
        { value: 'custom', label: 'Other...', description: 'Describe a unique setting' }
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

  const handleCustomInput = (value: string) => {
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
      // Create a detailed prompt from the user's selections
      const prompt = createImagePrompt(config);
      
      // Generate the image using Google AI
      const imageUrl = await generateImage(prompt);
      
      toast({
        title: "Companion Created!",
        description: "Your AI health companion has been successfully generated.",
      });

      onCompanionCreated(imageUrl, config);
    } catch (error) {
      console.error('Error generating companion:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to create your companion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createImagePrompt = (config: CompanionConfig): string => {
    const speciesDesc = config.species === 'custom' ? config.customName : config.species;
    const personalityDesc = config.personality === 'custom' ? config.customName : config.personality;
    const expertiseDesc = config.expertise === 'custom' ? config.customName : config.expertise;
    const appearanceDesc = config.appearance === 'custom' ? config.customName : config.appearance;
    const environmentDesc = config.environment === 'custom' ? config.customName : config.environment;

    return `Create a beautiful, friendly AI health companion character. 
    Species/Type: ${speciesDesc}. 
    Personality: ${personalityDesc}. 
    Expertise: Morgellons disease specialist who is a ${expertiseDesc}. 
    Visual Style: ${appearanceDesc} with healing, medical, and mystical elements. 
    Environment: Set in a ${environmentDesc}. 
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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
          <Sparkles className="w-6 h-6" />
          Create Your AI Health Companion
        </div>
        <p className="text-muted-foreground">
          Design a personalized AI companion who will be your expert guide in managing Morgellons disease
        </p>
        <div className="flex justify-center space-x-2 mt-4">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
              {currentStep + 1}
            </span>
            {currentQuestion.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{currentQuestion.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {currentQuestion.options.map((option) => (
              <div key={option.value}>
                <Label
                  className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                    config[currentQuestion.id as keyof CompanionConfig] === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-muted'
                  }`}
                  onClick={() => handleOptionSelect(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option.value}
                      checked={config[currentQuestion.id as keyof CompanionConfig] === option.value}
                      onChange={() => handleOptionSelect(option.value)}
                      className="text-primary"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                </Label>
                
                {option.value === 'custom' && config[currentQuestion.id as keyof CompanionConfig] === 'custom' && (
                  <div className="mt-2">
                    <Textarea
                      placeholder="Describe your custom idea..."
                      value={config.customName || ''}
                      onChange={(e) => handleCustomInput(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip}>
            Skip for Now
          </Button>
          
          {currentStep < questions.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepComplete()}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={generateCompanionImage}
              disabled={!allStepsComplete() || isGenerating}
              className="min-w-[120px]"
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
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Your Companion Preview</h3>
            <div className="space-y-2 text-sm">
              {questions.map((q) => {
                const value = config[q.id as keyof CompanionConfig];
                const displayValue = value === 'custom' 
                  ? config.customName 
                  : q.options.find(opt => opt.value === value)?.label;
                
                return (
                  <div key={q.id} className="flex justify-between">
                    <span className="text-muted-foreground">{q.title.split(' ')[0]}:</span>
                    <Badge variant="secondary">{displayValue}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};