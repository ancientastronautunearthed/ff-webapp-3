import { useCompanionProgress } from '@/contexts/CompanionProgressContext';
import { COMPANION_TIERS } from '@/components/CompanionTierSystem';

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

  const getFunctionStatus = (requiredTier: number) => {
    const unlocked = hasAccess(requiredTier);
    const tierData = COMPANION_TIERS.find(t => t.level === requiredTier);
    
    return {
      unlocked,
      tier: requiredTier,
      pointsRequired: tierData?.pointsRequired || 0,
      pointsNeeded: unlocked ? 0 : (tierData?.pointsRequired || 0) - tierProgress.totalPoints,
      message: getAccessMessage(requiredTier)
    };
  };

  return {
    hasAccess,
    getAccessMessage,
    getFunctionStatus,
    currentTier: tierProgress.currentTier,
    totalPoints: tierProgress.totalPoints
  };
};