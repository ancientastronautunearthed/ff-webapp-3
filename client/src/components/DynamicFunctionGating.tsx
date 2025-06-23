import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCompanionProgress } from '@/contexts/CompanionProgressContext';
import { useCompanionAccess } from '@/hooks/useCompanionAccess';
import { COMPANION_TIERS } from './CompanionTierSystem';
import { 
  Lock, 
  Unlock, 
  Star, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface FunctionGateProps {
  functionName: string;
  requiredTier: number;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
  category?: 'health' | 'analysis' | 'recommendations' | 'advanced';
}

export const FunctionGate: React.FC<FunctionGateProps> = ({
  functionName,
  requiredTier,
  description,
  icon: Icon,
  children,
  category = 'health'
}) => {
  const { hasAccess, getFunctionStatus, currentTier, totalPoints } = useCompanionAccess();
  const functionStatus = getFunctionStatus(requiredTier);
  
  const isUnlocked = hasAccess(requiredTier);
  const tierData = COMPANION_TIERS.find(t => t.level === requiredTier);
  const progressPercent = tierData ? Math.min((totalPoints / tierData.pointsRequired) * 100, 100) : 0;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'health': return 'text-green-600 bg-green-50 border-green-200';
      case 'analysis': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'recommendations': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'advanced': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isUnlocked) {
    return (
      <div className="relative">
        <div className="absolute -top-2 -right-2 z-10">
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Unlocked
          </Badge>
        </div>
        {children}
      </div>
    );
  }

  return (
    <Card className={`relative border-2 border-dashed ${getCategoryColor(category)} opacity-75`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Icon className="w-6 h-6 text-gray-400" />
              <Lock className="w-3 h-3 absolute -bottom-1 -right-1 text-red-500 bg-white rounded-full p-0.5" />
            </div>
            <div>
              <h4 className="font-medium text-gray-700">{functionName}</h4>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            Level {requiredTier}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress to unlock</span>
            <span className="font-medium text-gray-800">
              {totalPoints} / {tierData?.pointsRequired || 0} points
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span>Unlock Requirements</span>
          </div>
          <ul className="text-xs text-gray-500 space-y-1 ml-6">
            <li>• Reach Level {requiredTier} ({functionStatus.pointsNeeded} more points needed)</li>
            <li>• Complete health tracking activities to earn points</li>
            <li>• Engage with community features for bonus points</li>
          </ul>
        </div>

        <Button disabled className="w-full" variant="outline">
          <Lock className="w-4 h-4 mr-2" />
          Locked - Level {requiredTier} Required
        </Button>
      </CardContent>
    </Card>
  );
};

export const DynamicFunctionGating: React.FC = () => {
  const { tierProgress } = useCompanionProgress();
  const { currentTier, totalPoints } = useCompanionAccess();

  const functionCategories = [
    {
      name: 'Basic Health Functions',
      description: 'Essential health tracking and basic insights',
      functions: [
        { name: 'Basic Chat', tier: 1, category: 'health' as const },
        { name: 'Symptom Logging', tier: 1, category: 'health' as const },
        { name: 'Daily Check-ins', tier: 2, category: 'health' as const }
      ]
    },
    {
      name: 'AI Analysis & Insights',
      description: 'Intelligent pattern recognition and health analytics',
      functions: [
        { name: 'Meal Suggestions', tier: 3, category: 'recommendations' as const },
        { name: 'Pattern Analysis', tier: 4, category: 'analysis' as const },
        { name: 'Supplement Recommendations', tier: 5, category: 'recommendations' as const }
      ]
    },
    {
      name: 'Advanced AI Features',
      description: 'Predictive modeling and advanced personalization',
      functions: [
        { name: 'Symptom Predictions', tier: 6, category: 'advanced' as const },
        { name: 'Treatment Optimization', tier: 7, category: 'advanced' as const },
        { name: 'Research Matching', tier: 8, category: 'advanced' as const }
      ]
    },
    {
      name: 'Expert-Level Functions',
      description: 'Professional-grade analysis and comprehensive insights',
      functions: [
        { name: 'Advanced Analytics', tier: 9, category: 'advanced' as const },
        { name: 'Comprehensive Reports', tier: 10, category: 'advanced' as const }
      ]
    }
  ];

  const getUnlockedCount = (functions: any[]) => {
    return functions.filter(f => currentTier >= f.tier).length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Function Access Overview
          </CardTitle>
          <p className="text-gray-600">
            Your AI companion unlocks new capabilities as you progress through tiers by actively engaging with health tracking.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {functionCategories.map((category, idx) => {
              const unlockedCount = getUnlockedCount(category.functions);
              const totalCount = category.functions.length;
              const progressPercent = (unlockedCount / totalCount) * 100;
              
              return (
                <Card key={idx} className="text-center">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm mb-2">{category.name}</h4>
                    <div className="text-2xl font-bold mb-1">
                      {unlockedCount}/{totalCount}
                    </div>
                    <Progress value={progressPercent} className="h-2 mb-2" />
                    <p className="text-xs text-gray-600">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {functionCategories.map((category, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <p className="text-sm text-gray-600">{category.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.functions.map((func, funcIdx) => {
                const isUnlocked = currentTier >= func.tier;
                const tierData = COMPANION_TIERS.find(t => t.level === func.tier);
                const progressPercent = tierData ? Math.min((totalPoints / tierData.pointsRequired) * 100, 100) : 0;
                
                return (
                  <div key={funcIdx} className={`flex items-center justify-between p-3 rounded-lg border ${
                    isUnlocked 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      {isUnlocked ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <span className={`font-medium ${isUnlocked ? 'text-green-900' : 'text-gray-600'}`}>
                          {func.name}
                        </span>
                        {!isUnlocked && (
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={progressPercent} className="h-1 w-16" />
                            <span className="text-xs text-gray-500">
                              {tierData?.pointsRequired ? tierData.pointsRequired - totalPoints : 0} pts needed
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={isUnlocked ? "default" : "secondary"} className="text-xs">
                      L{func.tier}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};