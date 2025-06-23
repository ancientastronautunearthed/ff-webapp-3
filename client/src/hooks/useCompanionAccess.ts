import { useCompanionProgress } from '@/contexts/CompanionProgressContext';
import { COMPANION_TIERS } from '@/components/CompanionTierSystem';
import { COMPANION_FUNCTIONS } from '@/constants/companionFunctions';

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
  const { tierProgress, progressData } = useCompanionProgress();

  const currentTier = progressData?.currentTier || tierProgress?.currentTier || 1;
  const totalPoints = progressData?.totalPoints || tierProgress?.totalPoints || 0;

  const hasAccess = (requiredTier: number): boolean => {
    return currentTier >= requiredTier;
  };

  const getAccessMessage = (requiredTier: number): string => {
    if (hasAccess(requiredTier)) {
      return 'Available';
    }
    
    const tierData = COMPANION_TIERS.find(t => t.level === requiredTier);
    const pointsNeeded = tierData ? tierData.pointsRequired - totalPoints : 0;
    
    return `Unlock at Level ${requiredTier} (${pointsNeeded} more points needed)`;
  };

  const getFunctionStatus = (requiredTier: number): FunctionAccessStatus => {
    const unlocked = hasAccess(requiredTier);
    const tierData = COMPANION_TIERS.find(t => t.level === requiredTier);
    const pointsRequired = tierData?.pointsRequired || 0;
    const pointsNeeded = unlocked ? 0 : pointsRequired - totalPoints;
    const progressPercent = pointsRequired > 0 ? Math.min((totalPoints / pointsRequired) * 100, 100) : 0;
    
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
    return COMPANION_FUNCTIONS.map(func => ({
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
    currentTier,
    totalPoints,
    tierProgress
  };
};