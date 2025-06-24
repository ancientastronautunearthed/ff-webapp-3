import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Wrench, 
  Cpu, 
  ShoppingCart, 
  Lightbulb, 
  Zap, 
  Settings, 
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface TechAssistantConfig {
  expertise: string;
  personality: string;
  style: string;
  tone: string;
  focus: string;
  experience: string;
  specialization: string;
  customName?: string;
  customTraits?: string;
}

interface TechAssistantCreatorProps {
  onAssistantCreated: (imageUrl: string, config: TechAssistantConfig) => void;
  onSkip: () => void;
}

export const TechAssistantCreator: React.FC<TechAssistantCreatorProps> = ({ 
  onAssistantCreated, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<TechAssistantConfig>({
    expertise: '',
    personality: '',
    style: '',
    tone: '',
    focus: '',
    experience: '',
    specialization: '',
    customName: '',
    customTraits: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const totalSteps = 6;

  const expertiseOptions = [
    { value: 'environmental-tech', label: 'Environmental Technology Expert', description: 'Air purifiers, humidity control, mold detection' },
    { value: 'medical-devices', label: 'Medical Device Specialist', description: 'Health monitoring, therapeutic devices, diagnostic tools' },
    { value: 'smart-home', label: 'Smart Home Advisor', description: 'IoT sensors, automation, environmental monitoring' },
    { value: 'research-tools', label: 'Research Tools Specialist', description: 'Testing kits, documentation tools, data collection' },
    { value: 'wellness-tech', label: 'Wellness Technology Guide', description: 'Fitness trackers, sleep monitors, stress management' },
    { value: 'general-tech', label: 'General Technology Advisor', description: 'Comprehensive technology recommendations' }
  ];

  const personalityOptions = [
    { value: 'analytical', label: 'Analytical', description: 'Data-driven, methodical, thorough in research' },
    { value: 'innovative', label: 'Innovative', description: 'Forward-thinking, creative, explores cutting-edge solutions' },
    { value: 'practical', label: 'Practical', description: 'Budget-conscious, realistic, focuses on proven solutions' },
    { value: 'empathetic', label: 'Empathetic', description: 'Understanding, patient, considers individual needs' },
    { value: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic, optimistic, encouraging about new tech' },
    { value: 'meticulous', label: 'Meticulous', description: 'Detail-oriented, careful, ensures safety and compatibility' }
  ];

  const styleOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal, authoritative, evidence-based' },
    { value: 'friendly', label: 'Friendly', description: 'Warm, approachable, conversational' },
    { value: 'technical', label: 'Technical', description: 'Detailed specifications, technical explanations' },
    { value: 'simplified', label: 'Simplified', description: 'Easy to understand, jargon-free explanations' },
    { value: 'collaborative', label: 'Collaborative', description: 'Interactive, asks questions, involves you in decisions' }
  ];

  const toneOptions = [
    { value: 'confident', label: 'Confident', description: 'Assured, decisive, expert knowledge' },
    { value: 'supportive', label: 'Supportive', description: 'Encouraging, understanding, non-judgmental' },
    { value: 'curious', label: 'Curious', description: 'Inquisitive, explores options, asks clarifying questions' },
    { value: 'cautious', label: 'Cautious', description: 'Careful, considers risks, emphasizes safety' },
    { value: 'optimistic', label: 'Optimistic', description: 'Positive, hopeful, focuses on solutions' }
  ];

  const focusOptions = [
    { value: 'symptom-relief', label: 'Symptom Relief', description: 'Tools that directly address Morgellons symptoms' },
    { value: 'environmental', label: 'Environmental Control', description: 'Air quality, humidity, allergen management' },
    { value: 'monitoring', label: 'Health Monitoring', description: 'Tracking, measurement, documentation tools' },
    { value: 'comfort', label: 'Comfort & Wellness', description: 'Daily living aids, comfort improvements' },
    { value: 'research', label: 'Research Support', description: 'Tools for studying and understanding conditions' },
    { value: 'holistic', label: 'Holistic Approach', description: 'Comprehensive lifestyle and environmental support' }
  ];

  const experienceOptions = [
    { value: 'beginner', label: 'Beginner-Friendly', description: 'Simple recommendations, easy setup' },
    { value: 'intermediate', label: 'Intermediate', description: 'Moderate complexity, some technical knowledge' },
    { value: 'advanced', label: 'Advanced', description: 'Complex solutions, technical expertise expected' },
    { value: 'mixed', label: 'Mixed Levels', description: 'Options for all technical comfort levels' }
  ];

  const specializationOptions = [
    { value: 'air-quality', label: 'Air Quality Management', description: 'Purifiers, filters, humidity control, mold prevention' },
    { value: 'skin-care', label: 'Skin Care Technology', description: 'UV devices, moisturizing systems, protective equipment' },
    { value: 'sleep-environment', label: 'Sleep Environment', description: 'Bedding, air control, noise management, lighting' },
    { value: 'stress-management', label: 'Stress Management', description: 'Meditation apps, biofeedback, relaxation tools' },
    { value: 'documentation', label: 'Documentation Tools', description: 'Cameras, measurement tools, tracking devices' },
    { value: 'comprehensive', label: 'Comprehensive Support', description: 'All categories with personalized recommendations' }
  ];

  const handleStepForward = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateConfig = (field: keyof TechAssistantConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return config.expertise !== '';
      case 2: return config.personality !== '';
      case 3: return config.style !== '';
      case 4: return config.tone !== '';
      case 5: return config.focus !== '';
      case 6: return config.experience !== '' && config.specialization !== '';
      default: return false;
    }
  };

  const createImagePrompt = (config: TechAssistantConfig): string => {
    const expertiseMap: Record<string, string> = {
      'environmental-tech': 'wearing safety goggles and holding air quality monitoring devices',
      'medical-devices': 'in a white lab coat with medical diagnostic equipment',
      'smart-home': 'surrounded by IoT devices and smart home technology',
      'research-tools': 'with scientific instruments and testing equipment',
      'wellness-tech': 'with fitness trackers and wellness monitoring devices',
      'general-tech': 'with various technological tools and gadgets'
    };

    const personalityMap: Record<string, string> = {
      'analytical': 'thoughtful expression, analyzing data on multiple screens',
      'innovative': 'creative and forward-thinking appearance with futuristic elements',
      'practical': 'approachable and down-to-earth with practical tools',
      'empathetic': 'warm and understanding expression with gentle demeanor',
      'enthusiastic': 'energetic and optimistic with bright, engaging presence',
      'meticulous': 'precise and careful appearance with organized workspace'
    };

    const styleMap: Record<string, string> = {
      'professional': 'formal business attire in a clean, organized environment',
      'friendly': 'casual but neat clothing in a welcoming space',
      'technical': 'technical gear and equipment with complex displays',
      'simplified': 'clean, minimal aesthetic with simple, accessible tools',
      'collaborative': 'interactive workspace with collaborative elements'
    };

    return `Create a professional AI technology assistant character who is ${personalityMap[config.personality] || 'helpful and knowledgeable'}, ${expertiseMap[config.expertise] || 'with various tech tools'}, ${styleMap[config.style] || 'in a professional setting'}. The character should appear trustworthy, expert, and specialized in Morgellons-related technology solutions. Include elements showing their focus on ${config.focus} and ${config.specialization}. High quality, professional portrait style, technology-focused background.`;
  };

  const generateAssistant = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    
    try {
      // Generate AI name based on configuration
      const namePrompt = `Generate a professional name for an AI technology assistant specialized in Morgellons support tools. The assistant has ${config.expertise} expertise, ${config.personality} personality, and focuses on ${config.focus}. Return only the name.`;
      
      const nameResponse = await fetch('/api/ai-assistant/generate-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: namePrompt })
      });
      
      let assistantName = config.customName || 'TechAssist';
      if (nameResponse.ok) {
        const nameData = await nameResponse.json();
        assistantName = nameData.name || assistantName;
      }

      // Generate image
      const imagePrompt = createImagePrompt(config);
      const imageResponse = await fetch('/api/ai-image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: imagePrompt,
          userId: user.uid,
          type: 'tech-assistant'
        })
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to generate assistant image');
      }

      const imageData = await imageResponse.json();
      
      // Save assistant configuration to Firebase
      const assistantConfig = {
        ...config,
        name: assistantName,
        imageUrl: imageData.imageUrl,
        createdAt: new Date(),
        type: 'technology-assistant'
      };

      await setDoc(doc(db, 'users', user.uid), {
        techAssistantConfig: assistantConfig,
        techAssistantImage: imageData.imageUrl
      }, { merge: true });

      toast({
        title: "Technology Assistant Created!",
        description: `Meet ${assistantName}, your personal Morgellons technology expert.`
      });

      onAssistantCreated(imageData.imageUrl, config);
      
    } catch (error) {
      console.error('Failed to create tech assistant:', error);
      toast({
        title: "Creation Failed",
        description: "Unable to create your technology assistant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Wrench className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Choose Your Assistant's Expertise</h3>
              <p className="text-gray-600">What type of technology recommendations do you need most?</p>
            </div>
            
            <div className="grid gap-3">
              {expertiseOptions.map((option) => (
                <div
                  key={option.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    config.expertise === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateConfig('expertise', option.value)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                    {config.expertise === option.value && (
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Cpu className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Assistant Personality</h3>
              <p className="text-gray-600">How should your assistant approach recommendations?</p>
            </div>
            
            <div className="grid gap-3">
              {personalityOptions.map((option) => (
                <div
                  key={option.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    config.personality === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateConfig('personality', option.value)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                    {config.personality === option.value && (
                      <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Settings className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Communication Style</h3>
              <p className="text-gray-600">How should your assistant communicate with you?</p>
            </div>
            
            <div className="grid gap-3">
              {styleOptions.map((option) => (
                <div
                  key={option.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    config.style === option.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateConfig('style', option.value)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                    {config.style === option.value && (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Lightbulb className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Assistant Tone</h3>
              <p className="text-gray-600">What tone works best for your interactions?</p>
            </div>
            
            <div className="grid gap-3">
              {toneOptions.map((option) => (
                <div
                  key={option.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    config.tone === option.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateConfig('tone', option.value)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                    {config.tone === option.value && (
                      <CheckCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Zap className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Primary Focus</h3>
              <p className="text-gray-600">What area should your assistant prioritize?</p>
            </div>
            
            <div className="grid gap-3">
              {focusOptions.map((option) => (
                <div
                  key={option.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    config.focus === option.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateConfig('focus', option.value)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                    {config.focus === option.value && (
                      <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <ShoppingCart className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Final Configuration</h3>
              <p className="text-gray-600">Complete your assistant's setup</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2">Technical Experience Level</Label>
                <Select value={config.experience} onValueChange={(value) => updateConfig('experience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-600">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2">Specialization Area</Label>
                <Select value={config.specialization} onValueChange={(value) => updateConfig('specialization', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-600">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="customName" className="text-sm font-medium mb-2">Custom Name (Optional)</Label>
                <Input
                  id="customName"
                  value={config.customName}
                  onChange={(e) => updateConfig('customName', e.target.value)}
                  placeholder="Enter a custom name for your assistant"
                />
              </div>
              
              <div>
                <Label htmlFor="customTraits" className="text-sm font-medium mb-2">Additional Traits (Optional)</Label>
                <Textarea
                  id="customTraits"
                  value={config.customTraits}
                  onChange={(e) => updateConfig('customTraits', e.target.value)}
                  placeholder="Describe any specific traits or preferences you'd like your assistant to have"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-blue-600" />
          Create Your Technology Assistant
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStep()}
        
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleStepBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onSkip}>
              Skip for Now
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={handleStepForward}
                disabled={!isStepComplete()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={generateAssistant}
                disabled={!isStepComplete() || isGenerating}
              >
                {isGenerating ? 'Creating Assistant...' : 'Create Assistant'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};