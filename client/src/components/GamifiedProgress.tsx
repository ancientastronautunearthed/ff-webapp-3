import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Flame, 
  Target, 
  Users, 
  Calendar,
  TrendingUp,
  Award,
  Star,
  Crown,
  Zap,
  Brain,
  CheckCircle,
  Clock,
  Gift,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'tracking' | 'patterns' | 'community' | 'milestone';
  icon: any;
  earned: boolean;
  progress: number;
  maxProgress: number;
  reward: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedDate?: Date;
}

interface Streak {
  type: 'daily_logging' | 'journal_entries' | 'community_posts';
  current: number;
  longest: number;
  target: number;
  title: string;
  description: string;
  lastActive: Date;
  nextMilestone: number;
  encouragement: string;
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'group';
  startDate: Date;
  endDate: Date;
  progress: number;
  target: number;
  participants: number;
  reward: string;
  status: 'active' | 'completed' | 'upcoming';
  userRank?: number;
}

export const GamifiedProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [progressToNext, setProgressToNext] = useState(0);

  useEffect(() => {
    if (user) {
      loadGameProgress();
      loadAchievements();
      loadStreaks();
      loadChallenges();
    }
  }, [user]);

  const loadGameProgress = () => {
    // Load user's gaming progress from localStorage or API
    const savedPoints = parseInt(localStorage.getItem('totalPoints') || '340');
    const savedLevel = parseInt(localStorage.getItem('userLevel') || '3');
    
    setTotalPoints(savedPoints);
    setLevel(savedLevel);
    
    // Calculate progress to next level (every 200 points = new level)
    const pointsInCurrentLevel = savedPoints % 200;
    setProgressToNext(pointsInCurrentLevel);
  };

  const loadAchievements = () => {
    const mockAchievements: Achievement[] = [
      {
        id: 'first_entry',
        title: 'First Steps',
        description: 'Log your first symptom entry',
        category: 'tracking',
        icon: CheckCircle,
        earned: true,
        progress: 1,
        maxProgress: 1,
        reward: '10 points',
        rarity: 'common',
        earnedDate: new Date('2024-06-15')
      },
      {
        id: 'week_warrior',
        title: 'Week Warrior',
        description: 'Log symptoms for 7 consecutive days',
        category: 'tracking',
        icon: Flame,
        earned: true,
        progress: 7,
        maxProgress: 7,
        reward: '50 points',
        rarity: 'rare',
        earnedDate: new Date('2024-06-20')
      },
      {
        id: 'pattern_detective',
        title: 'Pattern Detective',
        description: 'AI discovers your first correlation pattern',
        category: 'patterns',
        icon: Brain,
        earned: true,
        progress: 1,
        maxProgress: 1,
        reward: '75 points + Special Badge',
        rarity: 'epic'
      },
      {
        id: 'community_helper',
        title: 'Community Helper',
        description: 'Help 5 community members with thoughtful responses',
        category: 'community',
        icon: Users,
        earned: false,
        progress: 2,
        maxProgress: 5,
        reward: '30 points',
        rarity: 'common'
      },
      {
        id: 'data_champion',
        title: 'Data Champion',
        description: 'Contribute 30 days of research data',
        category: 'milestone',
        icon: Trophy,
        earned: false,
        progress: 14,
        maxProgress: 30,
        reward: '200 points + Research Certificate',
        rarity: 'legendary'
      },
      {
        id: 'insight_master',
        title: 'Insight Master',
        description: 'Unlock 10 AI-generated health insights',
        category: 'patterns',
        icon: Sparkles,
        earned: false,
        progress: 6,
        maxProgress: 10,
        reward: '100 points',
        rarity: 'epic'
      }
    ];

    setAchievements(mockAchievements);
  };

  const loadStreaks = () => {
    const mockStreaks: Streak[] = [
      {
        type: 'daily_logging',
        current: 14,
        longest: 28,
        target: 30,
        title: 'Daily Tracking Streak',
        description: 'Consecutive days of symptom logging',
        lastActive: new Date(),
        nextMilestone: 30,
        encouragement: "You're on fire! Just 16 more days to reach your monthly goal!"
      },
      {
        type: 'journal_entries',
        current: 5,
        longest: 12,
        target: 7,
        title: 'Digital Matchbox Streak',
        description: 'Regular journal documentation',
        lastActive: new Date(),
        nextMilestone: 7,
        encouragement: "Great progress! 2 more entries to complete your weekly goal."
      },
      {
        type: 'community_posts',
        current: 3,
        longest: 8,
        target: 5,
        title: 'Community Engagement',
        description: 'Active forum participation',
        lastActive: new Date(Date.now() - 86400000), // Yesterday
        nextMilestone: 5,
        encouragement: "Share your experience! Connect with others to maintain your streak."
      }
    ];

    setStreaks(mockStreaks);
  };

  const loadChallenges = () => {
    const mockChallenges: CommunityChallenge[] = [
      {
        id: 'june_tracking',
        title: 'June Tracking Challenge',
        description: 'Log symptoms every day this month',
        type: 'group',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
        progress: 23,
        target: 30,
        participants: 1247,
        reward: 'Special June Champion Badge + 300 points',
        status: 'active',
        userRank: 156
      },
      {
        id: 'pattern_hunters',
        title: 'Pattern Hunters',
        description: 'Help AI discover 1000 new correlations this month',
        type: 'group',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
        progress: 687,
        target: 1000,
        participants: 892,
        reward: 'Research Contribution Certificate',
        status: 'active'
      },
      {
        id: 'community_builder',
        title: 'Community Builder',
        description: 'Make 20 helpful forum posts',
        type: 'individual',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-07-15'),
        progress: 8,
        target: 20,
        participants: 234,
        reward: 'Community Leader Badge + 150 points',
        status: 'active'
      }
    ];

    setChallenges(mockChallenges);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityBadge = (rarity: string) => {
    const colors = {
      common: 'bg-gray-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500'
    };
    return colors[rarity] || colors.common;
  };

  const claimReward = (achievementId: string) => {
    toast({
      title: "Achievement Unlocked!",
      description: "Congratulations! You've earned new points and rewards.",
    });
  };

  const joinChallenge = (challengeId: string) => {
    toast({
      title: "Challenge Joined!",
      description: "Good luck! Track your progress in the challenges tab.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Level and Points Overview */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Crown className="h-8 w-8 text-yellow-300" />
                <div>
                  <h2 className="text-2xl font-bold">Level {level}</h2>
                  <p className="text-blue-100">Health Tracking Champion</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress to Level {level + 1}</span>
                  <span>{progressToNext}/200 XP</span>
                </div>
                <Progress value={(progressToNext / 200) * 100} className="bg-blue-400" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{totalPoints}</div>
              <div className="text-blue-100">Total Points</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <Card 
                  key={achievement.id} 
                  className={`${getRarityColor(achievement.rarity)} border-2 ${
                    achievement.earned ? 'opacity-100' : 'opacity-75'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${achievement.earned ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <IconComponent className={`h-6 w-6 ${achievement.earned ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                            <Badge className={`text-xs ${getRarityBadge(achievement.rarity)} text-white`}>
                              {achievement.rarity.toUpperCase()}
                            </Badge>
                            {achievement.earned && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          {!achievement.earned && (
                            <div className="space-y-1">
                              <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                              <p className="text-xs text-gray-500">
                                {achievement.progress}/{achievement.maxProgress}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-blue-600 font-medium">Reward: {achievement.reward}</p>
                        </div>
                      </div>
                      {achievement.earned && (
                        <Button size="sm" variant="outline" onClick={() => claimReward(achievement.id)}>
                          <Gift className="h-4 w-4 mr-1" />
                          Claimed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4">
          <div className="grid gap-4">
            {streaks.map((streak) => (
              <Card key={streak.type} className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <Flame className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{streak.title}</h3>
                        <p className="text-sm text-gray-600">{streak.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {streak.current} days
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress to {streak.nextMilestone} days</span>
                      <span>{streak.current}/{streak.nextMilestone}</span>
                    </div>
                    <Progress value={(streak.current / streak.nextMilestone) * 100} />
                    
                    <Alert className="bg-blue-50 border-blue-200">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        {streak.encouragement}
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Best streak: {streak.longest} days</span>
                      <span>Last active: {streak.lastActive.toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        {challenge.type === 'group' ? <Users className="h-5 w-5 text-green-600" /> : <Target className="h-5 w-5 text-green-600" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                          <Badge variant={challenge.type === 'group' ? 'default' : 'secondary'}>
                            {challenge.type === 'group' ? 'Group' : 'Individual'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {Math.round((challenge.progress / challenge.target) * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">Complete</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Progress value={(challenge.progress / challenge.target) * 100} />
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{challenge.progress}/{challenge.target}</span>
                      <span>{challenge.participants} participants</span>
                    </div>

                    {challenge.userRank && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-gray-700">Your rank: #{challenge.userRank}</span>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Reward</p>
                          <p className="text-xs text-gray-600">{challenge.reward}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Ends {challenge.endDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => joinChallenge(challenge.id)}
                    >
                      View Progress
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};