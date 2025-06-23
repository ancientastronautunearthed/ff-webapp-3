import { useCompanionProgress } from '@/contexts/CompanionProgressContext';
import { COMPANION_TIERS } from '@/components/CompanionTierSystem';

export interface FunctionAccessStatus {
  unlocked: boolean;
  tier: number;
  pointsRequired: number;
  pointsNeeded: number;
  message: string;
  progressPercent: number;
  category: 'available' | 'soon' | 'locked';
}

export const useCompanionAccess = () => {
  const { tierProgress } = useCompanionProgress();

  const hasAccess = (requiredTier: number): boolean => {
    return tierProgress.currentTier >= requiredTier;
  };

  const getAccessMessage = (requiredTier: number): string => {
    if (hasAccess(requiredTier)) {
      return 'Available';
    }
    
    const tierData = COMPANION_TIERS.find(t => t.level === requiredTier);
    const pointsNeeded = tierData ? tierData.pointsRequired - tierProgress.totalPoints : 0;
    
    return `Unlock at Level ${requiredTier} (${pointsNeeded} more points needed)`;
  };

  const getFunctionStatus = (requiredTier: number): FunctionAccessStatus => {
    const unlocked = hasAccess(requiredTier);
    const tierData = COMPANION_TIERS.find(t => t.level === requiredTier);
    const pointsRequired = tierData?.pointsRequired || 0;
    const pointsNeeded = unlocked ? 0 : pointsRequired - tierProgress.totalPoints;
    const progressPercent = pointsRequired > 0 ? Math.min((tierProgress.totalPoints / pointsRequired) * 100, 100) : 0;
    
    let category: 'available' | 'soon' | 'locked' = 'locked';
    if (unlocked) {
      category = 'available';
    } else if (pointsNeeded <= 50) { // Within 50 points of unlocking
      category = 'soon';
    }
    
    return {
      unlocked,
      tier: requiredTier,
      pointsRequired,
      pointsNeeded,
      message: getAccessMessage(requiredTier),
      progressPercent,
      category
    };
  };

  const getAvailableFunctions = () => {
    const allFunctions = [
      { name: 'Basic Chat', tier: 1, category: 'communication' },
      { name: 'Symptom Logging', tier: 1, category: 'tracking' },
      { name: 'Daily Check-ins', tier: 2, category: 'tracking' },
      { name: 'Meal Suggestions', tier: 3, category: 'recommendations' },
      { name: 'Pattern Analysis', tier: 4, category: 'analysis' },
      { name: 'Supplement Recommendations', tier: 5, category: 'recommendations' },
      { name: 'Symptom Predictions', tier: 6, category: 'predictions' },
      { name: 'Treatment Optimization', tier: 7, category: 'optimization' },
      { name: 'Research Matching', tier: 8, category: 'research' },
      { name: 'Advanced Analytics', tier: 9, category: 'analytics' },
      { name: 'Comprehensive Reports', tier: 10, category: 'reports' }
    ];

    return allFunctions.map(func => ({
      ...func,
      status: getFunctionStatus(func.tier)
    }));
  };

  const getNextUnlock = () => {
    const allFunctions = getAvailableFunctions();
    const lockedFunctions = allFunctions.filter(f => !f.status.unlocked);
    
    if (lockedFunctions.length === 0) return null;
    
    return lockedFunctions.reduce((closest, current) => 
      current.status.pointsNeeded < closest.status.pointsNeeded ? current : closest
    );
  };

  const canUseFunction = (functionName: string): boolean => {
    const functionTierMap: Record<string, number> = {
      'chat': 1,
      'symptom-logging': 1,
      'daily-checkins': 2,
      'meal-suggestions': 3,
      'pattern-analysis': 4,
      'supplement-recommendations': 5,
      'symptom-predictions': 6,
      'treatment-optimization': 7,
      'research-matching': 8,
      'advanced-analytics': 9,
      'comprehensive-reports': 10
    };

    const requiredTier = functionTierMap[functionName];
    return requiredTier ? hasAccess(requiredTier) : false;
  };

  return {
    hasAccess,
    getAccessMessage,
    getFunctionStatus,
    getAvailableFunctions,
    getNextUnlock,
    canUseFunction,
    currentTier: tierProgress.currentTier,
    totalPoints: tierProgress.totalPoints,
    tierProgress
  };
};