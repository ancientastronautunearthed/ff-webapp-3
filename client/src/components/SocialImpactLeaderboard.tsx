import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Heart, 
  Users, 
  BookOpen, 
  Lightbulb,
  Award,
  Star,
  TrendingUp,
  Calendar,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  totalImpactScore: number;
  researchContributions: number;
  communitySupport: number;
  knowledgeSharing: number;
  mentoring: number;
  badges: Achievement[];
  currentStreak: number;
  joinedDate: Date;
  lastActivity: Date;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  category: 'research' | 'community' | 'knowledge' | 'mentoring' | 'milestone';
  requirement: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

interface ImpactMetric {
  category: string;
  description: string;
  weight: number;
  userScore: number;
  maxScore: number;
}

export const SocialImpactLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<LeaderboardUser | null>(null);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (user) {
      loadLeaderboardData();
    }
  }, [user, timeRange]);

  const loadLeaderboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load top users based on impact scores
      const leaderboardQuery = query(
        collection(db, 'userImpactScores'),
        orderBy('totalScore', 'desc'),
        limit(50)
      );
      
      const leaderboardSnapshot = await getDocs(leaderboardQuery);
      const topUsers: LeaderboardUser[] = [];
      
      for (const docSnap of leaderboardSnapshot.docs) {
        const impactData = docSnap.data();
        
        // Get user profile data
        const userDoc = await getDoc(doc(db, 'users', docSnap.id));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        // Get user achievements
        const achievementsQuery = query(
          collection(db, 'userAchievements'),
          where('userId', '==', docSnap.id)
        );
        const achievementsSnapshot = await getDocs(achievementsQuery);
        const userAchievements = achievementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        topUsers.push({
          id: docSnap.id,
          name: userData.displayName || userData.firstName || 'Community Member',
          avatar: userData.photoURL || '',
          totalImpactScore: impactData.totalScore || 0,
          researchContributions: impactData.researchScore || 0,
          communitySupport: impactData.supportScore || 0,
          knowledgeSharing: impactData.knowledgeScore || 0,
          mentoring: impactData.mentoringScore || 0,
          badges: userAchievements,
          currentStreak: impactData.currentStreak || 0,
          joinedDate: userData.createdAt?.toDate() || new Date(),
          lastActivity: impactData.lastActivity?.toDate() || new Date(),
          tier: calculateUserTier(impactData.totalScore || 0)
        });
      }
      
      setLeaderboardUsers(topUsers);
      
      // Find current user's rank and profile
      const userIndex = topUsers.findIndex(u => u.id === user.uid);
      setUserRank(userIndex >= 0 ? userIndex + 1 : 0);
      
      if (userIndex >= 0) {
        setUserProfile(topUsers[userIndex]);
      } else {
        // Load current user's data even if not in top 50
        await loadCurrentUserProfile();
      }
      
      // Load user's impact metrics
      await loadUserImpactMetrics();
      
      // Load available achievements
      await loadAchievements();
      
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      setLeaderboardUsers([]);
      setUserRank(0);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUserProfile = async () => {
    if (!user) return;
    
    try {
      const impactDoc = await getDoc(doc(db, 'userImpactScores', user.uid));
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (impactDoc.exists() && userDoc.exists()) {
        const impactData = impactDoc.data();
        const userData = userDoc.data();
        
        // Get user achievements
        const achievementsQuery = query(
          collection(db, 'userAchievements'),
          where('userId', '==', user.uid)
        );
        const achievementsSnapshot = await getDocs(achievementsQuery);
        const userAchievements = achievementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUserProfile({
          id: user.uid,
          name: userData.displayName || userData.firstName || 'You',
          avatar: userData.photoURL || '',
          totalImpactScore: impactData.totalScore || 0,
          researchContributions: impactData.researchScore || 0,
          communitySupport: impactData.supportScore || 0,
          knowledgeSharing: impactData.knowledgeScore || 0,
          mentoring: impactData.mentoringScore || 0,
          badges: userAchievements,
          currentStreak: impactData.currentStreak || 0,
          joinedDate: userData.createdAt?.toDate() || new Date(),
          lastActivity: impactData.lastActivity?.toDate() || new Date(),
          tier: calculateUserTier(impactData.totalScore || 0)
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadUserImpactMetrics = async () => {
    if (!user) return;
    
    try {
      // Calculate user's impact metrics from their activities
      const metrics: ImpactMetric[] = [
        {
          category: 'Research Participation',
          description: 'Contributing valuable data to studies',
          weight: 30,
          userScore: userProfile?.researchContributions || 0,
          maxScore: 1000
        },
        {
          category: 'Community Support',
          description: 'Helping other members with empathy and advice',
          weight: 25,
          userScore: userProfile?.communitySupport || 0,
          maxScore: 800
        },
        {
          category: 'Knowledge Sharing',
          description: 'Sharing insights and educational content',
          weight: 20,
          userScore: userProfile?.knowledgeSharing || 0,
          maxScore: 600
        },
        {
          category: 'Mentoring',
          description: 'Guiding newcomers and providing support',
          weight: 15,
          userScore: userProfile?.mentoring || 0,
          maxScore: 400
        },
        {
          category: 'Consistency',
          description: 'Regular engagement and activity streaks',
          weight: 10,
          userScore: userProfile?.currentStreak ? userProfile.currentStreak * 10 : 0,
          maxScore: 300
        }
      ];
      
      setImpactMetrics(metrics);
    } catch (error) {
      console.error('Error loading impact metrics:', error);
      setImpactMetrics([]);
    }
  };

  const loadAchievements = async () => {
    try {
      // Define meaningful achievements
      const availableAchievements: Achievement[] = [
        {
          id: 'research_pioneer',
          name: 'Research Pioneer',
          description: 'Contributed data to 5+ research studies',
          icon: Lightbulb,
          color: 'text-purple-600',
          category: 'research',
          requirement: 'Participate in 5 research studies',
          points: 500,
          rarity: 'epic'
        },
        {
          id: 'community_pillar',
          name: 'Community Pillar',
          description: 'Provided support to 50+ community members',
          icon: Heart,
          color: 'text-pink-600',
          category: 'community',
          requirement: 'Help 50 community members',
          points: 750,
          rarity: 'legendary'
        },
        {
          id: 'knowledge_guardian',
          name: 'Knowledge Guardian',
          description: 'Shared educational content 25+ times',
          icon: BookOpen,
          color: 'text-blue-600',
          category: 'knowledge',
          requirement: 'Share 25 educational posts',
          points: 400,
          rarity: 'rare'
        },
        {
          id: 'mentor_extraordinaire',
          name: 'Mentor Extraordinaire',
          description: 'Successfully mentored 10+ newcomers',
          icon: Users,
          color: 'text-green-600',
          category: 'mentoring',
          requirement: 'Mentor 10 new members',
          points: 600,
          rarity: 'epic'
        },
        {
          id: 'consistency_champion',
          name: 'Consistency Champion',
          description: 'Maintained 30-day engagement streak',
          icon: Calendar,
          color: 'text-orange-600',
          category: 'milestone',
          requirement: '30-day streak',
          points: 300,
          rarity: 'rare'
        },
        {
          id: 'impact_titan',
          name: 'Impact Titan',
          description: 'Reached 5000+ total impact score',
          icon: Trophy,
          color: 'text-yellow-600',
          category: 'milestone',
          requirement: '5000 impact points',
          points: 1000,
          rarity: 'legendary'
        }
      ];
      
      setAchievements(availableAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
      setAchievements([]);
    }
  };

  const calculateUserTier = (score: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' => {
    if (score >= 5000) return 'diamond';
    if (score >= 3000) return 'platinum';
    if (score >= 1500) return 'gold';
    if (score >= 500) return 'silver';
    return 'bronze';
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'bg-gradient-to-r from-cyan-400 to-blue-500';
      case 'platinum': return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'silver': return 'bg-gradient-to-r from-gray-200 to-gray-300';
      case 'bronze': return 'bg-gradient-to-r from-orange-300 to-orange-400';
      default: return 'bg-gray-100';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-orange-400" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const calculateImpactGrowth = () => {
    // Calculate growth potential based on current metrics
    const totalPossible = impactMetrics.reduce((sum, metric) => sum + metric.maxScore, 0);
    const currentTotal = impactMetrics.reduce((sum, metric) => sum + metric.userScore, 0);
    return Math.round((currentTotal / totalPossible) * 100);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Social Impact Leaderboard</h1>
        <p className="text-xl text-gray-600">Recognizing meaningful contributions to our community and research</p>
      </div>

      {/* User's Current Standing */}
      {userProfile && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${getTierColor(userProfile.tier)}`}>
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Your Impact Standing</h3>
                  <p className="text-gray-600">Rank #{userRank > 0 ? userRank : '50+'} • {userProfile.tier.charAt(0).toUpperCase() + userProfile.tier.slice(1)} Tier</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{userProfile.totalImpactScore.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Impact Points</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userProfile.researchContributions}</div>
                <div className="text-sm text-gray-600">Research</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{userProfile.communitySupport}</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userProfile.knowledgeSharing}</div>
                <div className="text-sm text-gray-600">Knowledge</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userProfile.mentoring}</div>
                <div className="text-sm text-gray-600">Mentoring</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-600">Current Streak: {userProfile.currentStreak} days</span>
              </div>
              <div className="flex space-x-1">
                {userProfile.badges.slice(0, 3).map((badge, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {badge.name}
                  </Badge>
                ))}
                {userProfile.badges.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{userProfile.badges.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="metrics">Impact Metrics</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Top Contributors</h2>
            <div className="flex space-x-2">
              <Button
                variant={timeRange === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('week')}
              >
                This Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('month')}
              >
                This Month
              </Button>
              <Button
                variant={timeRange === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('all')}
              >
                All Time
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboardUsers.map((user, index) => (
              <Card key={user.id} className={index < 3 ? 'border-2 border-yellow-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(index + 1)}
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-lg">{user.name}</div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getTierColor(user.tier)} variant="secondary">
                            {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {user.badges.length} achievement{user.badges.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {user.totalImpactScore.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Impact Points</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-sm font-semibold text-purple-600">{user.researchContributions}</div>
                      <div className="text-xs text-gray-500">Research</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-pink-600">{user.communitySupport}</div>
                      <div className="text-xs text-gray-500">Support</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-blue-600">{user.knowledgeSharing}</div>
                      <div className="text-xs text-gray-500">Knowledge</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-green-600">{user.mentoring}</div>
                      <div className="text-xs text-gray-500">Mentoring</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Your Impact Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {calculateImpactGrowth()}%
                  </div>
                  <div className="text-gray-600">Overall Impact Potential</div>
                  <Progress value={calculateImpactGrowth()} className="mt-2" />
                </div>
                
                {impactMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{metric.category}</div>
                        <div className="text-sm text-gray-600">{metric.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{metric.userScore} / {metric.maxScore}</div>
                        <div className="text-sm text-gray-500">{metric.weight}% weight</div>
                      </div>
                    </div>
                    <Progress value={(metric.userScore / metric.maxScore) * 100} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Meaningful Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const isUnlocked = userProfile?.badges.some(badge => badge.id === achievement.id);
                  const IconComponent = achievement.icon;
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isUnlocked 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${isUnlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <IconComponent className={`h-6 w-6 ${achievement.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{achievement.name}</h3>
                            <Badge variant={isUnlocked ? 'default' : 'secondary'} className="text-xs">
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">{achievement.requirement}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs font-semibold">{achievement.points} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialImpactLeaderboard;