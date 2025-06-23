import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanionProgress } from '@/contexts/CompanionProgressContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  Trophy, 
  Target, 
  Clock, 
  Flame, 
  Star, 
  Gift, 
  CheckCircle2,
  Calendar,
  Zap,
  Award,
  TrendingUp,
  Users,
  BookOpen,
  Heart
} from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Link } from 'wouter';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'health_tracking' | 'community' | 'research' | 'wellness' | 'streak';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  points: number;
  bonusPoints: number;
  target: number;
  progress: number;
  completed: boolean;
  expiresAt: Date;
  icon: any;
  requirements: string[];
  completionMessage: string;
  unlockCondition?: string;
}

interface ChallengeReward {
  id: string;
  title: string;
  description: string;
  type: 'points' | 'badge' | 'feature' | 'companion_upgrade';
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

// Component for challenge action buttons that navigate to appropriate features
const ChallengeActionButton = ({ challenge }: { challenge: Challenge }) => {
  const getNavigationPath = (challengeId: string): string => {
    switch (challengeId) {
      case 'daily_symptom_track':
        return '/tracker';
      case 'daily_journal':
        return '/journal';
      case 'daily_community':
      case 'weekly_community_leader':
        return '/community';
      case 'weekly_consistency':
        return '/tracker';
      case 'weekly_insights':
        return '/insights';
      case 'research_hero':
        return '/research';
      case 'companion_master':
        return '/companion';
      default:
        return '/dashboard';
    }
  };

  const getButtonText = (challenge: Challenge): string => {
    switch (challenge.id) {
      case 'daily_symptom_track':
        return challenge.progress > 0 ? 'Continue Tracking' : 'Track Symptoms';
      case 'daily_journal':
        return challenge.progress > 0 ? 'Continue Journaling' : 'Write Entry';
      case 'daily_community':
      case 'weekly_community_leader':
        return challenge.progress > 0 ? 'Continue Engaging' : 'Visit Community';
      case 'weekly_consistency':
        return 'Track More Symptoms';
      case 'weekly_insights':
        return 'View AI Insights';
      case 'research_hero':
        return 'Contribute to Research';
      case 'companion_master':
        return 'Upgrade Companion';
      default:
        return challenge.progress > 0 ? 'Continue' : 'Start Challenge';
    }
  };

  return (
    <Link href={getNavigationPath(challenge.id)}>
      <Button size="sm" className="w-full">
        {getButtonText(challenge)}
      </Button>
    </Link>
  );
};

export const ChallengeSystem = () => {
  const { user } = useAuth();
  const { addPoints, tierProgress } = useCompanionProgress();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'upcoming'>('active');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [earnedReward, setEarnedReward] = useState<ChallengeReward | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate dynamic challenges based on user data and progress
  const generateDailyChallenges = (): Challenge[] => {
    const today = new Date();
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return [
      {
        id: 'daily_symptom_track',
        title: 'Daily Symptom Check',
        description: 'Log your symptoms for today',
        type: 'daily',
        category: 'health_tracking',
        difficulty: 'easy',
        points: 25,
        bonusPoints: 10,
        target: 1,
        progress: 0,
        completed: false,
        expiresAt: endOfDay,
        icon: Target,
        requirements: ['Submit at least 1 symptom entry today'],
        completionMessage: 'Great job tracking your health today! Every entry helps identify patterns.'
      },
      {
        id: 'daily_journal',
        title: 'Digital Matchbox Entry',
        description: 'Write in your health journal',
        type: 'daily',
        category: 'health_tracking',
        difficulty: 'easy',
        points: 20,
        bonusPoints: 15,
        target: 1,
        progress: 0,
        completed: false,
        expiresAt: endOfDay,
        icon: BookOpen,
        requirements: ['Create 1 journal entry with at least 50 characters'],
        completionMessage: 'Excellent reflection! Journaling helps process your health journey.'
      },
      {
        id: 'daily_community',
        title: 'Community Connection',
        description: 'Engage with the community forum',
        type: 'daily',
        category: 'community',
        difficulty: 'medium',
        points: 30,
        bonusPoints: 20,
        target: 1,
        progress: 0,
        completed: false,
        expiresAt: endOfDay,
        icon: Users,
        requirements: ['Post or reply in community forum'],
        completionMessage: 'Thanks for supporting the community! Your voice matters.'
      }
    ];
  };

  const generateWeeklyChallenges = (): Challenge[] => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return [
      {
        id: 'weekly_consistency',
        title: 'Consistency Champion',
        description: 'Track symptoms for 5 days this week',
        type: 'weekly',
        category: 'health_tracking',
        difficulty: 'medium',
        points: 100,
        bonusPoints: 50,
        target: 5,
        progress: 0,
        completed: false,
        expiresAt: endOfWeek,
        icon: Calendar,
        requirements: ['Log symptoms on 5 different days this week'],
        completionMessage: 'Incredible consistency! You\'re building great health tracking habits.'
      },
      {
        id: 'weekly_insights',
        title: 'Pattern Detective',
        description: 'Review AI insights 3 times this week',
        type: 'weekly',
        category: 'wellness',
        difficulty: 'medium',
        points: 75,
        bonusPoints: 25,
        target: 3,
        progress: 0,
        completed: false,
        expiresAt: endOfWeek,
        icon: TrendingUp,
        requirements: ['Check AI health insights on 3 different days'],
        completionMessage: 'You\'re becoming a health pattern expert! Knowledge is power.'
      },
      {
        id: 'weekly_community_leader',
        title: 'Community Leader',
        description: 'Help others with 3 helpful forum responses',
        type: 'weekly',
        category: 'community',
        difficulty: 'hard',
        points: 150,
        bonusPoints: 75,
        target: 3,
        progress: 0,
        completed: false,
        expiresAt: endOfWeek,
        icon: Award,
        requirements: ['Receive 3+ likes on forum posts/replies this week'],
        completionMessage: 'You\'re a true community champion! Your help makes a difference.'
      }
    ];
  };

  const generateSpecialChallenges = (): Challenge[] => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return [
      {
        id: 'research_hero',
        title: 'Research Hero',
        description: 'Contribute to 3 research studies',
        type: 'special',
        category: 'research',
        difficulty: 'legendary',
        points: 500,
        bonusPoints: 250,
        target: 3,
        progress: 0,
        completed: false,
        expiresAt: nextMonth,
        icon: Trophy,
        requirements: ['Complete 3 research surveys', 'Maintain data sharing consent'],
        completionMessage: 'You\'re a research hero! Your contributions advance medical understanding.',
        unlockCondition: 'Complete 10 daily challenges first'
      },
      {
        id: 'companion_master',
        title: 'AI Companion Master',
        description: 'Reach Companion Tier 5 or higher',
        type: 'special',
        category: 'wellness',
        difficulty: 'legendary',
        points: 1000,
        bonusPoints: 500,
        target: 5,
        progress: tierProgress?.currentTier || 1,
        completed: (tierProgress?.currentTier || 1) >= 5,
        expiresAt: nextMonth,
        icon: Heart,
        requirements: ['Reach AI Companion Tier 5', 'Unlock advanced companion features'],
        completionMessage: 'Master level achieved! Your companion is now highly evolved.',
        unlockCondition: 'Complete 5 weekly challenges'
      }
    ];
  };

  // Load user's challenge progress
  useEffect(() => {
    const loadChallengeData = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        // Generate all available challenges
        const dailyChallenges = generateDailyChallenges();
        const weeklyChallenges = generateWeeklyChallenges();
        const specialChallenges = generateSpecialChallenges();
        
        const allChallenges = [...dailyChallenges, ...weeklyChallenges, ...specialChallenges];
        
        // Load user's progress from Firebase
        const userChallengesDoc = await getDoc(doc(db, 'userChallenges', user.uid));
        if (userChallengesDoc.exists()) {
          const userData = userChallengesDoc.data();
          const userProgress = userData.progress || {};
          const completed = userData.completed || [];
          
          // Update challenges with user progress
          const updatedChallenges = allChallenges.map(challenge => ({
            ...challenge,
            progress: userProgress[challenge.id] || 0,
            completed: completed.includes(challenge.id)
          }));
          
          setChallenges(updatedChallenges);
          setCompletedChallenges(completed);
        } else {
          setChallenges(allChallenges);
        }
      } catch (error) {
        console.error('Error loading challenge data:', error);
        // Still show challenges even if Firebase fails
        const allChallenges = [
          ...generateDailyChallenges(),
          ...generateWeeklyChallenges(),
          ...generateSpecialChallenges()
        ];
        setChallenges(allChallenges);
      }
      setLoading(false);
    };

    loadChallengeData();
  }, [user, tierProgress]);

  // Update challenge progress
  const updateChallengeProgress = async (challengeId: string, increment: number = 1) => {
    if (!user?.uid) return;

    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge || challenge.completed) return;

      const newProgress = Math.min(challenge.progress + increment, challenge.target);
      const isCompleted = newProgress >= challenge.target;

      // Update local state
      setChallenges(prev => prev.map(c => 
        c.id === challengeId 
          ? { ...c, progress: newProgress, completed: isCompleted }
          : c
      ));

      // Update Firebase
      const userChallengesRef = doc(db, 'userChallenges', user.uid);
      const updateData: any = {
        [`progress.${challengeId}`]: newProgress
      };

      if (isCompleted) {
        updateData[`completed`] = [...completedChallenges, challengeId];
        setCompletedChallenges(prev => [...prev, challengeId]);

        // Award points
        const totalPoints = challenge.points + challenge.bonusPoints;
        await addPoints(challenge.title, totalPoints, challenge.category);

        // Show completion notification
        toast({
          title: "Challenge Completed!",
          description: `${challenge.title} - +${totalPoints} points earned!`,
        });

        // Check for special rewards
        if (challenge.difficulty === 'legendary') {
          const reward: ChallengeReward = {
            id: `reward_${challengeId}`,
            title: `${challenge.title} Master`,
            description: 'Legendary challenge completion badge',
            type: 'badge',
            value: challenge.bonusPoints,
            rarity: 'legendary',
            unlockedAt: new Date()
          };
          setEarnedReward(reward);
          setShowRewardModal(true);
        }
      }

      await setDoc(userChallengesRef, updateData, { merge: true });

    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  // Navigate user to the appropriate page to complete challenge
  const navigateToChallenge = (challenge: Challenge) => {
    switch (challenge.id) {
      case 'daily_symptom_track':
      case 'weekly_consistency':
        setLocation('/tracker');
        toast({
          title: "Challenge Started",
          description: "Complete your symptom tracking to progress this challenge!",
        });
        break;
      case 'daily_journal':
        setLocation('/journal');
        toast({
          title: "Challenge Started", 
          description: "Write a journal entry to complete this challenge!",
        });
        break;
      case 'daily_community':
      case 'weekly_community_leader':
        setLocation('/community');
        toast({
          title: "Challenge Started",
          description: "Engage with the community to progress this challenge!",
        });
        break;
      case 'weekly_insights':
        setLocation('/insights');
        toast({
          title: "Challenge Started",
          description: "Review your AI health insights to complete this challenge!",
        });
        break;
      case 'research_hero':
        setLocation('/research');
        toast({
          title: "Challenge Started",
          description: "Participate in research studies to complete this challenge!",
        });
        break;
      case 'companion_master':
        setLocation('/companion');
        toast({
          title: "Challenge Started",
          description: "Interact with your AI companion to progress your tier!",
        });
        break;
      default:
        toast({
          title: "Challenge Available",
          description: "Complete the required actions in the app to progress this challenge!",
        });
    }
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'legendary': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: Challenge['type']) => {
    switch (type) {
      case 'daily': return 'bg-blue-500';
      case 'weekly': return 'bg-indigo-500';
      case 'monthly': return 'bg-purple-500';
      case 'special': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const activeChallenges = challenges.filter(c => !c.completed && new Date() < c.expiresAt);
  const completedChallengesData = challenges.filter(c => c.completed);
  const upcomingChallenges = challenges.filter(c => c.unlockCondition);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-gray-600">Loading challenges...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge System Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Daily Challenges
            <Badge variant="secondary" className="ml-auto">
              {completedChallengesData.length} completed
            </Badge>
          </CardTitle>
          <p className="text-gray-600">
            Complete challenges to earn bonus points and unlock special rewards for your AI companion.
          </p>
        </CardHeader>
      </Card>

      {/* Challenge Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'active', label: 'Active', count: activeChallenges.length },
          { id: 'completed', label: 'Completed', count: completedChallengesData.length },
          { id: 'upcoming', label: 'Upcoming', count: upcomingChallenges.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeTab === 'active' ? activeChallenges :
          activeTab === 'completed' ? completedChallengesData :
          upcomingChallenges
        ).map(challenge => {
          const IconComponent = challenge.icon;
          const progressPercentage = (challenge.progress / challenge.target) * 100;
          
          return (
            <Card key={challenge.id} className={`relative overflow-hidden ${
              challenge.completed ? 'bg-green-50 border-green-200' : ''
            }`}>
              {challenge.type === 'special' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${getTypeColor(challenge.type)} text-white`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{challenge.title}</h3>
                      <p className="text-xs text-gray-600">{challenge.description}</p>
                    </div>
                  </div>
                  {challenge.completed && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    +{challenge.points + challenge.bonusPoints} pts
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress}/{challenge.target}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {/* Requirements */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Requirements:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {challenge.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-gray-400">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Expiry */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>
                      {challenge.type === 'daily' ? 'Expires today' :
                       challenge.type === 'weekly' ? 'Expires this week' :
                       'Expires this month'}
                    </span>
                  </div>

                  {/* Action Button */}
                  {!challenge.completed && !challenge.unlockCondition && (
                    <ChallengeActionButton challenge={challenge} />
                  )}

                  {challenge.unlockCondition && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Unlock condition:</span> {challenge.unlockCondition}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {(activeTab === 'active' ? activeChallenges : 
        activeTab === 'completed' ? completedChallengesData : 
        upcomingChallenges).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'active' ? 'No Active Challenges' :
               activeTab === 'completed' ? 'No Completed Challenges Yet' :
               'No Upcoming Challenges'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'active' ? 'All challenges are completed! Check back tomorrow for new ones.' :
               activeTab === 'completed' ? 'Complete your first challenge to see it here.' :
               'Unlock special challenges by completing daily and weekly tasks.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reward Modal */}
      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Gift className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Legendary Reward!</h2>
                  <p className="text-gray-600">{earnedReward?.title}</p>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <p className="text-gray-600">{earnedReward?.description}</p>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              {earnedReward?.rarity} reward
            </Badge>
            <Button onClick={() => setShowRewardModal(false)} className="w-full">
              Awesome!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};