import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useChallengeProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const updateChallengeProgress = async (actionType: string, challengeData?: any) => {
    if (!user?.uid) return;

    try {
      const userChallengesRef = doc(db, 'userChallenges', user.uid);
      const userChallengesDoc = await getDoc(userChallengesRef);
      
      let data = userChallengesDoc.exists() ? userChallengesDoc.data() : {};
      const currentProgress = data.progress || {};
      const completed = data.completed || [];
      
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
      let newCompletions: string[] = [];
      
      for (const challengeId of affectedChallenges) {
        const current = currentProgress[challengeId] || 0;
        const newProgress = current + 1;
        currentProgress[challengeId] = newProgress;
        
        // Check if challenge is completed
        const challengeTargets: Record<string, number> = {
          'daily_symptom_track': 1,
          'daily_journal': 1,
          'daily_community': 1,
          'weekly_consistency': 5,
          'weekly_community_leader': 3,
          'weekly_insights': 3,
          'research_hero': 3,
        };
        
        const target = challengeTargets[challengeId] || 1;
        if (newProgress >= target && !completed.includes(challengeId)) {
          completed.push(challengeId);
          newCompletions.push(challengeId);
        }
      }

      // Update Firebase
      await setDoc(userChallengesRef, {
        progress: currentProgress,
        completed: completed,
        lastUpdated: new Date()
      }, { merge: true });

      // Show completion notifications
      for (const challengeId of newCompletions) {
        const challengeTitles: Record<string, string> = {
          'daily_symptom_track': 'Daily Symptom Check',
          'daily_journal': 'Digital Matchbox Entry',
          'daily_community': 'Community Connection',
          'weekly_consistency': 'Consistency Champion',
          'weekly_community_leader': 'Community Leader',
          'weekly_insights': 'Pattern Detective',
          'research_hero': 'Research Hero',
        };
        
        const title = challengeTitles[challengeId] || 'Challenge';
        toast({
          title: "Challenge Completed!",
          description: `${title} - Bonus points earned!`,
        });
      }

    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  return { updateChallengeProgress };
};