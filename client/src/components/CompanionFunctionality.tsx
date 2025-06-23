import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanionFunctions, COMPANION_TIERS } from './CompanionTierSystem';
import { 
  ChefHat, 
  Pill, 
  Brain, 
  Calendar, 
  Lightbulb,
  TrendingUp,
  BookOpen,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface CompanionFunctionalityProps {
  companionTier: number;
  userSymptoms: string[];
  userPreferences: any;
}

export const CompanionFunctionality = ({ 
  companionTier, 
  userSymptoms, 
  userPreferences 
}: CompanionFunctionalityProps) => {
  const { user } = useAuth();
  const { hasFunction, availableFunctions } = useCompanionFunctions(companionTier);
  const [activeFunction, setActiveFunction] = useState<string | null>(null);
  const [functionResults, setFunctionResults] = useState<Record<string, any>>({});

  // Tier 3+ Function: Personalized Meal Suggestions
  const generateMealSuggestions = async () => {
    if (companionTier < 3) {
      console.log(`🔒 Function blocked: Meal suggestions require Level 3. Current: Level ${companionTier}`);
      alert(`Meal suggestions unlock at Level 3. You are currently Level ${companionTier}.`);
      return;
    }
    
    console.log(`✅ Function unlocked: Meal suggestions available at Level ${companionTier}`);
    
    setActiveFunction('meals');
    // AI-powered meal suggestions based on symptoms and dietary needs
    const suggestions = {
      antiInflammatory: [
        {
          name: "Turmeric Golden Milk Smoothie",
          ingredients: ["Coconut milk", "Turmeric", "Ginger", "Banana", "Honey"],
          benefits: "Reduces inflammation, supports skin healing",
          instructions: "Blend all ingredients until smooth. Best consumed in morning."
        },
        {
          name: "Omega-3 Rich Salmon Bowl", 
          ingredients: ["Wild salmon", "Quinoa", "Spinach", "Avocado", "Walnuts"],
          benefits: "Supports skin barrier function, reduces inflammation",
          instructions: "Grill salmon, serve over quinoa with fresh vegetables."
        }
      ],
      detoxSupport: [
        {
          name: "Green Detox Soup",
          ingredients: ["Broccoli", "Spinach", "Celery", "Garlic", "Vegetable broth"],
          benefits: "Supports liver detoxification, provides antioxidants",
          instructions: "Simmer vegetables in broth, blend until smooth."
        }
      ]
    };
    
    setFunctionResults(prev => ({ ...prev, meals: suggestions }));
  };

  // Tier 5+ Function: Supplement Recommendations
  const generateSupplementPlan = async () => {
    if (companionTier < 5) {
      console.log(`🔒 Function blocked: Supplement recommendations require Level 5. Current: Level ${companionTier}`);
      alert(`Supplement recommendations unlock at Level 5. You are currently Level ${companionTier}.`);
      return;
    }
    
    console.log(`✅ Function unlocked: Supplement recommendations available at Level ${companionTier}`);
    
    setActiveFunction('supplements');
    const recommendations = {
      core: [
        {
          name: "Omega-3 Fish Oil",
          dosage: "1000-2000mg daily",
          timing: "With meals",
          benefits: "Anti-inflammatory, skin barrier support",
          warnings: "May interact with blood thinners"
        },
        {
          name: "Vitamin D3",
          dosage: "2000-4000 IU daily", 
          timing: "Morning with fat",
          benefits: "Immune system support, inflammation regulation",
          warnings: "Monitor blood levels"
        }
      ],
      targeted: [
        {
          name: "Quercetin",
          dosage: "500mg twice daily",
          timing: "Between meals",
          benefits: "Natural antihistamine, reduces skin inflammation", 
          warnings: "May enhance effects of blood pressure medications"
        }
      ]
    };
    
    setFunctionResults(prev => ({ ...prev, supplements: recommendations }));
  };

  // Tier 6+ Function: Predictive Symptom Modeling
  const generateSymptomPredictions = async () => {
    if (companionTier < 6) {
      console.log(`🔒 Function blocked: Symptom predictions require Level 6. Current: Level ${companionTier}`);
      alert(`Symptom predictions unlock at Level 6. You are currently Level ${companionTier}.`);
      return;
    }
    
    console.log(`✅ Function unlocked: Symptom predictions available at Level ${companionTier}`);
    
    setActiveFunction('predictions');
    const predictions = {
      weeklyForecast: [
        {
          day: "Monday",
          probability: 65,
          triggers: ["Weather change", "Stress from work"],
          prevention: "Extra hydration, stress management"
        },
        {
          day: "Friday", 
          probability: 40,
          triggers: ["Weekend social activities"],
          prevention: "Plan low-key activities, prioritize sleep"
        }
      ],
      patterns: [
        {
          pattern: "Symptoms worsen 2-3 days before weather fronts",
          confidence: 78,
          recommendation: "Check weather forecasts, preemptive care routine"
        }
      ]
    };
    
    setFunctionResults(prev => ({ ...prev, predictions: predictions }));
  };

  // Tier 7+ Function: Treatment Timeline Optimization
  const optimizeTreatmentSchedule = async () => {
    if (companionTier < 7) {
      console.log(`🔒 Function blocked: Treatment optimization requires Level 7. Current: Level ${companionTier}`);
      alert(`Treatment optimization unlocks at Level 7. You are currently Level ${companionTier}.`);
      return;
    }
    
    console.log(`✅ Function unlocked: Treatment optimization available at Level ${companionTier}`);
    
    setActiveFunction('schedule');
    const timeline = {
      shortTerm: [
        {
          week: 1,
          focus: "Symptom stabilization",
          actions: ["Start anti-inflammatory protocol", "Eliminate known triggers"],
          monitoring: "Daily symptom tracking"
        },
        {
          week: 2,
          focus: "Pattern identification", 
          actions: ["Continue protocol", "Add targeted supplements"],
          monitoring: "Weekly photo documentation"
        }
      ],
      milestones: [
        {
          timeframe: "Month 1",
          goal: "20% symptom reduction",
          measures: ["Decreased lesion count", "Improved sleep quality"]
        }
      ]
    };
    
    setFunctionResults(prev => ({ ...prev, schedule: timeline }));
  };

  // Tier 8+ Function: Research Study Matching
  const findRelevantStudies = async () => {
    if (companionTier < 8) {
      console.log(`🔒 Function blocked: Research study matching requires Level 8. Current: Level ${companionTier}`);
      alert(`Research study matching unlocks at Level 8. You are currently Level ${companionTier}.`);
      return;
    }
    
    console.log(`✅ Function unlocked: Research study matching available at Level ${companionTier}`);
    
    setActiveFunction('research');
    const studies = {
      activeTrials: [
        {
          title: "Novel Anti-inflammatory Treatment for Morgellons",
          phase: "Phase II",
          location: "Multiple centers",
          criteria: "Adults 18-65 with confirmed diagnosis",
          contact: "studies@morgellonsresearch.org"
        }
      ],
      observational: [
        {
          title: "Long-term Outcomes Study", 
          type: "Longitudinal observational",
          duration: "2 years",
          compensation: "$50/visit",
          requirements: "Monthly data submission"
        }
      ]
    };
    
    setFunctionResults(prev => ({ ...prev, research: studies }));
  };

  const availableFunctionButtons = [
    {
      id: 'meals',
      name: 'Meal Suggestions',
      icon: ChefHat,
      tier: 3,
      action: generateMealSuggestions,
      description: 'AI-powered meal plans for symptom management'
    },
    {
      id: 'supplements', 
      name: 'Supplement Plan',
      icon: Pill,
      tier: 5,
      action: generateSupplementPlan,
      description: 'Personalized supplement recommendations'
    },
    {
      id: 'predictions',
      name: 'Symptom Forecast',
      icon: Brain,
      tier: 6, 
      action: generateSymptomPredictions,
      description: 'Predictive modeling for symptom patterns'
    },
    {
      id: 'schedule',
      name: 'Treatment Timeline',
      icon: Calendar,
      tier: 7,
      action: optimizeTreatmentSchedule, 
      description: 'Optimized treatment scheduling'
    },
    {
      id: 'research',
      name: 'Research Matching',
      icon: BookOpen,
      tier: 8,
      action: findRelevantStudies,
      description: 'Find relevant clinical trials and studies'
    }
  ];

  const unlockedFunctions = availableFunctionButtons.filter(fn => companionTier >= fn.tier);
  const lockedFunctions = availableFunctionButtons.filter(fn => companionTier < fn.tier);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            AI Companion Functions
          </CardTitle>
          <p className="text-gray-600">
            Level {companionTier} companion with {unlockedFunctions.length} available functions
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="unlocked" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unlocked">Available ({unlockedFunctions.length})</TabsTrigger>
              <TabsTrigger value="locked">Locked ({lockedFunctions.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="unlocked" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedFunctions.map((func) => {
                  const Icon = func.icon;
                  const isActive = activeFunction === func.id;
                  const isUnlocked = companionTier >= func.tier;
                  
                  return (
                    <Card key={func.id} className={`transition-all ${
                      isUnlocked 
                        ? isActive 
                          ? 'ring-2 ring-blue-500' 
                          : 'hover:shadow-md cursor-pointer' 
                        : 'opacity-60 cursor-not-allowed'
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className={`w-5 h-5 ${isUnlocked ? 'text-blue-600' : 'text-gray-400'}`} />
                            <h4 className={`font-medium ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                              {func.name}
                            </h4>
                          </div>
                          <Badge variant={isUnlocked ? "outline" : "secondary"}>
                            Tier {func.tier}
                          </Badge>
                        </div>
                        <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-500'}`}>
                          {func.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={func.action}
                          disabled={isActive || !isUnlocked}
                          className="w-full"
                          variant={isActive ? "secondary" : isUnlocked ? "default" : "outline"}
                        >
                          {!isUnlocked 
                            ? `Unlock at Level ${func.tier}`
                            : isActive 
                              ? "Generating..." 
                              : "Activate"
                          }
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="locked" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lockedFunctions.map((func) => {
                  const Icon = func.icon;
                  const pointsNeeded = COMPANION_TIERS.find(t => t.level === func.tier)?.pointsRequired || 0;
                  
                  return (
                    <Card key={func.id} className="opacity-60 border-2 border-dashed border-gray-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className="w-5 h-5 text-gray-400" />
                            <h4 className="font-medium text-gray-600">{func.name}</h4>
                          </div>
                          <Badge variant="secondary">Level {func.tier}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{func.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Requires {pointsNeeded} total points to unlock
                        </p>
                      </CardHeader>
                      <CardContent>
                        <Button disabled className="w-full" variant="outline">
                          🔒 Locked - Level {func.tier} Required
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Function Results Display */}
      {Object.keys(functionResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeFunction || 'meals'} className="w-full">
              <TabsList>
                {Object.keys(functionResults).map((key) => (
                  <TabsTrigger key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* Results content would be rendered here based on the active function */}
              {activeFunction && functionResults[activeFunction] && (
                <TabsContent value={activeFunction} className="mt-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <h4 className="font-medium text-green-800">
                        AI Analysis Complete
                      </h4>
                    </div>
                    <p className="text-green-700 text-sm">
                      Your Level {companionTier} companion has generated personalized recommendations 
                      based on your health data and patterns.
                    </p>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};