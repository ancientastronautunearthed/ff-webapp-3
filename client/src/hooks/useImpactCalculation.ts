import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ImpactCalculationEngine } from '@/lib/impactCalculation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ImpactScore {
  userId: string;
  researchScore: number;
  supportScore: number;
  knowledgeScore: number;
  mentoringScore: number;
  consistencyScore: number;
  totalScore: number;
  lastCalculated: Date;
}

export const useImpactCalculation = () => {
  const { user } = useAuth();
  const [impactScore, setImpactScore] = useState<ImpactScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (!user) {
      setImpactScore(null);
      setLoading(false);
      return;
    }

    // Listen to real-time updates of user's impact score
    const unsubscribe = onSnapshot(
      doc(db, 'userImpactScores', user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setImpactScore({
            userId: user.uid,
            researchScore: data.researchScore || 0,
            supportScore: data.supportScore || 0,
            knowledgeScore: data.knowledgeScore || 0,
            mentoringScore: data.mentoringScore || 0,
            consistencyScore: data.consistencyScore || 0,
            totalScore: data.totalScore || 0,
            lastCalculated: data.lastCalculated?.toDate() || new Date()
          });
        } else {
          // No impact score exists, trigger initial calculation
          recalculateScore();
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to impact score:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const recalculateScore = async () => {
    if (!user || calculating) return;

    try {
      setCalculating(true);
      await ImpactCalculationEngine.updateUserImpactScore(user.uid);
    } catch (error) {
      console.error('Error recalculating impact score:', error);
    } finally {
      setCalculating(false);
    }
  };

  const shouldRecalculate = () => {
    if (!impactScore) return false;
    
    const now = new Date();
    const lastCalc = new Date(impactScore.lastCalculated);
    const hoursSinceLastCalc = (now.getTime() - lastCalc.getTime()) / (1000 * 60 * 60);
    
    // Recalculate if it's been more than 6 hours
    return hoursSinceLastCalc > 6;
  };

  return {
    impactScore,
    loading,
    calculating,
    recalculateScore,
    shouldRecalculate: shouldRecalculate()
  };
};

export default useImpactCalculation;