import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useChallengeProgress = () => {
  const { user } = useAuth();

  const updateChallengeProgress = async (challengeId: string, actionType: string) => {
    if (!user?.uid) return;

    try {
      const userChallengesRef = doc(db, 'userChallenges', user.uid);
      const userChallengesDoc = await getDoc(userChallengesRef);
      
      if (!userChallengesDoc.exists()) return;
      
      const data = userChallengesDoc.data();
      const currentProgress = data.progress || {};
      
      // Define which challenges are affected by which actions
      const challengeMapping: Record<string, string[]> = {
        'symptom_entry': ['daily_symptom_track', 'weekly_consistency'],
        'journal_entry': ['daily_journal'],
        'forum_post': ['daily_community', 'weekly_community_leader'],
        'forum_reply': ['daily_community', 'weekly_community_leader'],
        'ai_insights_view': ['weekly_insights'],
        'research_survey': ['research_hero'],
        'daily_checkin': ['daily_symptom_track'],
      };

      const affectedChallenges = challengeMapping[actionType] || [];
      
      for (const challengeId of affectedChallenges) {
        const current = currentProgress[challengeId] || 0;
        currentProgress[challengeId] = current + 1;
      }

      await updateDoc(userChallengesRef, {
        progress: currentProgress,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  return { updateChallengeProgress };
};