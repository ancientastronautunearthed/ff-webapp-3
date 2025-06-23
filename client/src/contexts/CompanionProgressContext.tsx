import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { COMPANION_TIERS } from '@/components/CompanionTierSystem';

interface PointSource {
  id: string;
  action: string;
  points: number;
  timestamp: Date;
  category: 'health_tracking' | 'community' | 'research' | 'engagement' | 'milestone';
}

interface TierProgress {
  currentTier: number;
  totalPoints: number;
  pointsInCurrentTier: number;
  pointsToNextTier: number;
  progressPercentage: number;
  unlockedFeatures: string[];
  recentUnlocks: string[];
}

interface CompanionProgressData {
  userId: string;
  totalPoints: number;
  currentTier: number;
  pointHistory: PointSource[];
  tierUnlockHistory: Array<{
    tier: number;
    unlockedAt: Date;
    celebrationShown: boolean;
  }>;
  lastUpdated: Date;
  dailyPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  streaks: {
    dailyLogin: number;
    symptomTracking: number;
    journaling: number;
    communityEngagement: number;
  };
}

interface CompanionProgressContextType {
  progressData: CompanionProgressData | null;
  tierProgress: TierProgress;
  loading: boolean;
  addPoints: (points: number, action: string, category: PointSource['category']) => Promise<void>;
  getTierProgress: () => TierProgress;
  checkTierUnlock: () => boolean;
  markCelebrationShown: (tier: number) => Promise<void>;
  resetProgress: () => Promise<void>;
  getPointsBreakdown: () => Record<string, number>;
}

const CompanionProgressContext = createContext<CompanionProgressContextType | undefined>(undefined);

export const useCompanionProgress = () => {
  const context = useContext(CompanionProgressContext);
  if (!context) {
    throw new Error('useCompanionProgress must be used within CompanionProgressProvider');
  }
  return context;
};

// Point values for different actions
export const POINT_VALUES = {
  // Health Tracking
  DAILY_CHECKIN: 10,
  SYMPTOM_ENTRY: 15,
  JOURNAL_ENTRY: 20,
  PHOTO_UPLOAD: 5,
  MEDICATION_LOG: 10,
  SLEEP_LOG: 8,
  MOOD_LOG: 8,
  
  // Community Engagement
  FORUM_POST: 25,
  FORUM_REPLY: 10,
  HELPFUL_VOTE_RECEIVED: 5,
  COMMUNITY_SUPPORT: 15,
  
  // Research Participation
  RESEARCH_CONSENT: 50,
  SURVEY_COMPLETION: 30,
  DATA_SHARING: 20,
  
  // Engagement & Milestones
  PROFILE_COMPLETION: 100,
  FIRST_WEEK_STREAK: 50,
  MONTHLY_STREAK: 200,
  COMPANION_CHAT: 5,
  FEATURE_DISCOVERY: 10
};

interface CompanionProgressProviderProps {
  children: ReactNode;
}

export const CompanionProgressProvider = ({ children }: CompanionProgressProviderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progressData, setProgressData] = useState<CompanionProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize or load user progress data
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const progressRef = doc(db, 'companionProgress', user.uid);
    
    const unsubscribe = onSnapshot(progressRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as CompanionProgressData;
        setProgressData({
          ...data,
          lastUpdated: data.lastUpdated?.toDate?.() || new Date(),
          pointHistory: data.pointHistory?.map(p => ({
            ...p,
            timestamp: p.timestamp?.toDate?.() || new Date()
          })) || [],
          tierUnlockHistory: data.tierUnlockHistory?.map(t => ({
            ...t,
            unlockedAt: t.unlockedAt?.toDate?.() || new Date()
          })) || []
        });
      } else {
        // Initialize new progress data
        const initialData: CompanionProgressData = {
          userId: user.uid,
          totalPoints: 0,
          currentTier: 1,
          pointHistory: [],
          tierUnlockHistory: [{
            tier: 1,
            unlockedAt: new Date(),
            celebrationShown: true
          }],
          lastUpdated: new Date(),
          dailyPoints: 0,
          weeklyPoints: 0,
          monthlyPoints: 0,
          streaks: {
            dailyLogin: 0,
            symptomTracking: 0,
            journaling: 0,
            communityEngagement: 0
          }
        };
        
        await setDoc(progressRef, initialData);
        setProgressData(initialData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const addPoints = async (points: number, action: string, category: PointSource['category']) => {
    if (!user?.uid || !progressData) return;

    const newPointEntry: PointSource = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      points,
      timestamp: new Date(),
      category
    };

    const newTotalPoints = progressData.totalPoints + points;
    const newTier = COMPANION_TIERS.reduce((tier, current) => {
      return newTotalPoints >= current.pointsRequired ? current.level : tier;
    }, 1);

    const tierUnlocked = newTier > progressData.currentTier;
    
    const updatedData: Partial<CompanionProgressData> = {
      totalPoints: newTotalPoints,
      currentTier: newTier,
      pointHistory: [...progressData.pointHistory, newPointEntry],
      lastUpdated: new Date(),
      dailyPoints: progressData.dailyPoints + points,
      weeklyPoints: progressData.weeklyPoints + points,
      monthlyPoints: progressData.monthlyPoints + points,
    };

    if (tierUnlocked) {
      updatedData.tierUnlockHistory = [
        ...progressData.tierUnlockHistory,
        {
          tier: newTier,
          unlockedAt: new Date(),
          celebrationShown: false
        }
      ];
    }

    try {
      await updateDoc(doc(db, 'companionProgress', user.uid), updatedData);
      
      // Show point notification
      toast({
        title: `+${points} Points Earned!`,
        description: `${action} • Total: ${newTotalPoints} points`,
      });

      // Show tier unlock notification
      if (tierUnlocked) {
        const tierData = COMPANION_TIERS.find(t => t.level === newTier);
        toast({
          title: "🎉 Companion Evolved!",
          description: `Your companion reached ${tierData?.name} (Level ${newTier})!`,
        });
      }
    } catch (error) {
      console.error('Error adding points:', error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getTierProgress = (): TierProgress => {
    if (!progressData) {
      return {
        currentTier: 1,
        totalPoints: 0,
        pointsInCurrentTier: 0,
        pointsToNextTier: 100,
        progressPercentage: 0,
        unlockedFeatures: [],
        recentUnlocks: []
      };
    }

    const currentTierData = COMPANION_TIERS.find(t => t.level === progressData.currentTier);
    const nextTierData = COMPANION_TIERS.find(t => t.level === progressData.currentTier + 1);
    
    const pointsInCurrentTier = progressData.totalPoints - (currentTierData?.pointsRequired || 0);
    const pointsToNextTier = nextTierData ? 
      nextTierData.pointsRequired - progressData.totalPoints : 0;
    
    const progressPercentage = nextTierData ? 
      (pointsInCurrentTier / (nextTierData.pointsRequired - (currentTierData?.pointsRequired || 0))) * 100 : 100;

    const unlockedFeatures = COMPANION_TIERS
      .filter(tier => tier.level <= progressData.currentTier)
      .flatMap(tier => tier.features);

    const recentUnlocks = progressData.tierUnlockHistory
      .filter(unlock => !unlock.celebrationShown)
      .map(unlock => {
        const tierData = COMPANION_TIERS.find(t => t.level === unlock.tier);
        return tierData?.name || `Level ${unlock.tier}`;
      });

    return {
      currentTier: progressData.currentTier,
      totalPoints: progressData.totalPoints,
      pointsInCurrentTier,
      pointsToNextTier,
      progressPercentage: Math.min(progressPercentage, 100),
      unlockedFeatures,
      recentUnlocks
    };
  };

  const checkTierUnlock = (): boolean => {
    if (!progressData) return false;
    return progressData.tierUnlockHistory.some(unlock => !unlock.celebrationShown);
  };

  const markCelebrationShown = async (tier: number) => {
    if (!user?.uid || !progressData) return;

    const updatedHistory = progressData.tierUnlockHistory.map(unlock => 
      unlock.tier === tier ? { ...unlock, celebrationShown: true } : unlock
    );

    try {
      await updateDoc(doc(db, 'companionProgress', user.uid), {
        tierUnlockHistory: updatedHistory
      });
    } catch (error) {
      console.error('Error marking celebration as shown:', error);
    }
  };

  const resetProgress = async () => {
    if (!user?.uid) return;

    const resetData: CompanionProgressData = {
      userId: user.uid,
      totalPoints: 0,
      currentTier: 1,
      pointHistory: [],
      tierUnlockHistory: [{
        tier: 1,
        unlockedAt: new Date(),
        celebrationShown: true
      }],
      lastUpdated: new Date(),
      dailyPoints: 0,
      weeklyPoints: 0,
      monthlyPoints: 0,
      streaks: {
        dailyLogin: 0,
        symptomTracking: 0,
        journaling: 0,
        communityEngagement: 0
      }
    };

    try {
      await setDoc(doc(db, 'companionProgress', user.uid), resetData);
      toast({
        title: "Progress Reset",
        description: "Companion progress has been reset to Level 1."
      });
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  };

  const getPointsBreakdown = (): Record<string, number> => {
    if (!progressData) return {};

    return progressData.pointHistory.reduce((breakdown, entry) => {
      breakdown[entry.category] = (breakdown[entry.category] || 0) + entry.points;
      return breakdown;
    }, {} as Record<string, number>);
  };

  const tierProgress = getTierProgress();

  return (
    <CompanionProgressContext.Provider
      value={{
        progressData,
        tierProgress,
        loading,
        addPoints,
        getTierProgress,
        checkTierUnlock,
        markCelebrationShown,
        resetProgress,
        getPointsBreakdown
      }}
    >
      {children}
    </CompanionProgressContext.Provider>
  );
};