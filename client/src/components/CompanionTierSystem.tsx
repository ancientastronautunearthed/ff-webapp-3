import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Star, 
  Lock, 
  Unlock, 
  ChefHat, 
  Pill, 
  Brain, 
  Heart, 
  Calendar, 
  Lightbulb,
  TrendingUp,
  BookOpen,
  Zap,
  Shield,
  Activity
} from 'lucide-react';

// Companion tier definitions with point thresholds and unlocked features
export const COMPANION_TIERS = [
  {
    level: 1,
    name: "Sprout Companion",
    pointsRequired: 0,
    icon: Heart,
    color: "bg-green-100 text-green-700",
    features: [
      "Basic health check-ins",
      "Simple symptom logging reminders",
      "Encouraging messages"
    ]
  },
  {
    level: 2,
    name: "Growing Companion", 
    pointsRequired: 100,
    icon: Activity,
    color: "bg-blue-100 text-blue-700",
    features: [
      "Pattern recognition in symptoms",
      "Weekly progress summaries",
      "Basic mood tracking insights"
    ]
  },
  {
    level: 3,
    name: "Wise Companion",
    pointsRequired: 300,
    icon: Brain,
    color: "bg-purple-100 text-purple-700", 
    features: [
      "Personalized meal suggestions",
      "Trigger identification analysis",
      "Sleep pattern correlations"
    ]
  },
  {
    level: 4,
    name: "Caring Companion",
    pointsRequired: 600,
    icon: ChefHat,
    color: "bg-orange-100 text-orange-700",
    features: [
      "Custom recipe recommendations",
      "Nutritional analysis for symptoms",
      "Dietary trigger warnings"
    ]
  },
  {
    level: 5,
    name: "Healing Companion",
    pointsRequired: 1000,
    icon: Pill,
    color: "bg-red-100 text-red-700",
    features: [
      "Supplement recommendations",
      "Drug interaction warnings", 
      "Treatment effectiveness tracking"
    ]
  },
  {
    level: 6,
    name: "Intuitive Companion",
    pointsRequired: 1500,
    icon: Lightbulb,
    color: "bg-yellow-100 text-yellow-700",
    features: [
      "Predictive symptom modeling",
      "Environmental factor analysis",
      "Personalized wellness plans"
    ]
  },
  {
    level: 7,
    name: "Strategic Companion",
    pointsRequired: 2200,
    icon: Calendar,
    color: "bg-indigo-100 text-indigo-700",
    features: [
      "Advanced appointment scheduling",
      "Treatment timeline optimization",
      "Research study matching"
    ]
  },
  {
    level: 8,
    name: "Expert Companion",
    pointsRequired: 3000,
    icon: BookOpen,
    color: "bg-teal-100 text-teal-700",
    features: [
      "Latest research summaries",
      "Clinical trial recommendations",
      "Medical literature analysis"
    ]
  },
  {
    level: 9,
    name: "Sage Companion",
    pointsRequired: 4000,
    icon: TrendingUp,
    color: "bg-pink-100 text-pink-700",
    features: [
      "Long-term health forecasting",
      "Quality of life optimization",
      "Comprehensive care coordination"
    ]
  },
  {
    level: 10,
    name: "Master Companion",
    pointsRequired: 5500,
    icon: Shield,
    color: "bg-gold-100 text-gold-700",
    features: [
      "AI-powered treatment protocols",
      "Precision medicine insights",
      "Holistic health ecosystem management"
    ]
  }
];

interface CompanionTierSystemProps {
  currentPoints: number;
  onTierUnlock?: (tier: number) => void;
}

export const CompanionTierSystem = ({ currentPoints, onTierUnlock }: CompanionTierSystemProps) => {
  const { user } = useAuth();
  const [currentTier, setCurrentTier] = useState(1);
  const [previousTier, setPreviousTier] = useState(1);

  // Calculate current tier based on points
  useEffect(() => {
    const newTier = COMPANION_TIERS.reduce((tier, current) => {
      return currentPoints >= current.pointsRequired ? current.level : tier;
    }, 1);

    if (newTier > currentTier) {
      setPreviousTier(currentTier);
      setCurrentTier(newTier);
      onTierUnlock?.(newTier);
    } else {
      setCurrentTier(newTier);
    }
  }, [currentPoints, currentTier, onTierUnlock]);

  const getCurrentTierData = () => {
    return COMPANION_TIERS.find(tier => tier.level === currentTier) || COMPANION_TIERS[0];
  };

  const getNextTierData = () => {
    return COMPANION_TIERS.find(tier => tier.level === currentTier + 1);
  };

  const getProgressToNextTier = () => {
    const nextTier = getNextTierData();
    if (!nextTier) return 100; // Max level reached

    const currentTierData = getCurrentTierData();
    const pointsInCurrentTier = currentPoints - currentTierData.pointsRequired;
    const pointsNeededForNext = nextTier.pointsRequired - currentTierData.pointsRequired;
    
    return Math.min((pointsInCurrentTier / pointsNeededForNext) * 100, 100);
  };

  const tierData = getCurrentTierData();
  const nextTierData = getNextTierData();
  const progress = getProgressToNextTier();
  const TierIcon = tierData.icon;

  return (
    <div className="space-y-6">
      {/* Current Tier Display */}
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${tierData.color.replace('text-', 'bg-').replace('100', '500')}`} />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${tierData.color}`}>
                <TierIcon className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl">{tierData.name}</CardTitle>
                <p className="text-gray-600">Level {tierData.level} • {currentPoints} points</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              Level {currentTier}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Unlock className="w-4 h-4 mr-2 text-green-600" />
                Unlocked Features
              </h4>
              <ul className="space-y-1">
                {tierData.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {nextTierData && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">Progress to {nextTierData.name}</h4>
                  <span className="text-sm text-gray-500">
                    {currentPoints} / {nextTierData.pointsRequired} points
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-gray-500 mt-1">
                  {nextTierData.pointsRequired - currentPoints} points until next level
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tier Overview Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Companion Evolution Path</CardTitle>
          <p className="text-gray-600">Unlock new AI capabilities as you engage with your health journey</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPANION_TIERS.map((tier) => {
              const isUnlocked = currentPoints >= tier.pointsRequired;
              const isCurrent = tier.level === currentTier;
              const TierIcon = tier.icon;

              return (
                <div
                  key={tier.level}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50'
                      : isUnlocked
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-full ${tier.color} ${!isUnlocked ? 'opacity-50' : ''}`}>
                      <TierIcon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center space-x-2">
                      {isUnlocked ? (
                        <Unlock className="w-4 h-4 text-green-600" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                      {isCurrent && (
                        <Badge variant="default" className="text-xs">Current</Badge>
                      )}
                    </div>
                  </div>
                  
                  <h4 className={`font-medium mb-1 ${!isUnlocked ? 'text-gray-500' : ''}`}>
                    {tier.name}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">
                    Level {tier.level} • {tier.pointsRequired} points
                  </p>
                  
                  <ul className="space-y-1">
                    {tier.features.slice(0, 2).map((feature, index) => (
                      <li key={index} className={`text-xs ${!isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                        • {feature}
                      </li>
                    ))}
                    {tier.features.length > 2 && (
                      <li className={`text-xs ${!isUnlocked ? 'text-gray-400' : 'text-gray-500'}`}>
                        + {tier.features.length - 2} more...
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook to get available companion functions based on tier
export const useCompanionFunctions = (tierLevel: number) => {
  const getAvailableFunctions = () => {
    const unlockedTiers = COMPANION_TIERS.filter(tier => tier.level <= tierLevel);
    return unlockedTiers.flatMap(tier => tier.features);
  };

  const hasFunction = (functionName: string) => {
    return getAvailableFunctions().some(feature => 
      feature.toLowerCase().includes(functionName.toLowerCase())
    );
  };

  return {
    availableFunctions: getAvailableFunctions(),
    hasFunction,
    tierLevel,
    maxTier: COMPANION_TIERS.length
  };
};