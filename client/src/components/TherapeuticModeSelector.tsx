import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { therapeuticAI } from '@/lib/therapeuticAI';
import { 
  Heart, 
  Brain, 
  BookOpen, 
  Shield, 
  Lightbulb,
  Stethoscope
} from 'lucide-react';

interface TherapeuticMode {
  id: string;
  name: string;
  description: string;
  icon: any;
  sessionType: 'support' | 'education' | 'coping' | 'crisis';
  color: string;
  samplePrompts: string[];
}

interface TherapeuticModeSelectorProps {
  onModeSelect: (mode: TherapeuticMode) => void;
  onQuickPrompt: (prompt: string) => void;
}

export const TherapeuticModeSelector: React.FC<TherapeuticModeSelectorProps> = ({
  onModeSelect,
  onQuickPrompt
}) => {
  const therapeuticModes: TherapeuticMode[] = [
    {
      id: 'emotional_support',
      name: 'Emotional Support',
      description: 'Get validation, comfort, and understanding for your emotional journey',
      icon: Heart,
      sessionType: 'support',
      color: 'bg-pink-500',
      samplePrompts: [
        "I'm feeling overwhelmed by my symptoms today",
        "Nobody believes what I'm going through",
        "I feel so isolated and alone"
      ]
    },
    {
      id: 'morgellons_education',
      name: 'Morgellons Education',
      description: 'Learn about Morgellons, mold connections, and treatment approaches',
      icon: BookOpen,
      sessionType: 'education',
      color: 'bg-blue-500',
      samplePrompts: [
        "What is the connection between mold and Morgellons?",
        "Tell me about biofilms and Morgellons",
        "What are the latest treatment approaches?"
      ]
    },
    {
      id: 'coping_strategies',
      name: 'Coping Strategies',
      description: 'Develop practical tools for managing symptoms and daily challenges',
      icon: Lightbulb,
      sessionType: 'coping',
      color: 'bg-green-500',
      samplePrompts: [
        "How can I manage the crawling sensations?",
        "I need better sleep strategies",
        "Help me cope with medical appointments"
      ]
    },
    {
      id: 'medical_advocacy',
      name: 'Medical Advocacy',
      description: 'Build confidence for healthcare interactions and self-advocacy',
      icon: Stethoscope,
      sessionType: 'support',
      color: 'bg-purple-500',
      samplePrompts: [
        "How do I talk to doctors about Morgellons?",
        "I need help preparing for my appointment",
        "My doctor dismissed my symptoms"
      ]
    },
    {
      id: 'psychotherapy',
      name: 'Therapeutic Counseling',
      description: 'Process trauma, grief, and psychological impacts of chronic illness',
      icon: Brain,
      sessionType: 'support',
      color: 'bg-indigo-500',
      samplePrompts: [
        "I'm dealing with medical trauma",
        "Help me process grief about my health",
        "I need to work through anxiety and depression"
      ]
    },
    {
      id: 'crisis_support',
      name: 'Crisis Support',
      description: 'Immediate support for mental health crises and overwhelming moments',
      icon: Shield,
      sessionType: 'crisis',
      color: 'bg-red-500',
      samplePrompts: [
        "I'm in crisis and need immediate help",
        "I'm having thoughts of self-harm",
        "I can't handle this anymore"
      ]
    }
  ];

  const guidedSessions = [
    {
      title: 'Symptom Management Relaxation',
      description: 'Guided relaxation specifically for sensory symptoms',
      action: () => onQuickPrompt("Please guide me through a relaxation session for managing crawling sensations and skin symptoms")
    },
    {
      title: 'Medical Appointment Prep',
      description: 'Prepare for productive healthcare visits',
      action: () => onQuickPrompt("Help me prepare for my upcoming doctor appointment about Morgellons")
    },
    {
      title: 'Daily Coping Check-in',
      description: 'Assess current challenges and develop coping plans',
      action: () => onQuickPrompt("I'd like to do a daily check-in about my symptoms and coping strategies")
    },
    {
      title: 'Environmental Health Assessment',
      description: 'Explore mold, toxin, and environmental factors',
      action: () => onQuickPrompt("Help me understand environmental factors that might be affecting my health")
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          How can I support you today?
        </h3>
        <p className="text-gray-600">
          Choose a therapeutic mode or try a guided session designed specifically for Morgellons challenges.
        </p>
      </div>

      {/* Therapeutic Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {therapeuticModes.map((mode) => {
          const IconComponent = mode.icon;
          return (
            <Card 
              key={mode.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onModeSelect(mode)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${mode.color} text-white`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{mode.name}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">
                      {mode.sessionType}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-600 mb-3">{mode.description}</p>
                <div className="space-y-1">
                  {mode.samplePrompts.slice(0, 2).map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickPrompt(prompt);
                      }}
                      className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                    >
                      "{prompt.substring(0, 50)}..."
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Guided Sessions */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Guided Sessions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guidedSessions.map((session, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">{session.title}</h5>
                    <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={session.action}
                  className="w-full"
                >
                  Start Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Access Crisis Support */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-red-500 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-red-800">Crisis Support Available 24/7</h5>
              <p className="text-sm text-red-700">
                If you're in immediate distress, I'm here to help or connect you with crisis resources.
              </p>
            </div>
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => onQuickPrompt("I'm in crisis and need immediate support")}
            >
              Get Help Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};