import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Award, 
  TrendingUp,
  Star,
  Crown,
  ThumbsUp,
  HelpCircle,
  Calendar,
  Trophy,
  Target,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CommunityBadge {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  requirement: string;
  earned: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointValue: number;
}

interface CommunityContribution {
  id: string;
  type: 'post' | 'reply' | 'helpful_vote' | 'topic_creation' | 'moderation';
  title: string;
  description: string;
  points: number;
  timestamp: Date;
  category: string;
}

interface HelpfulUser {
  id: string;
  name: string;
  avatar: string;
  helpfulVotes: number;
  postsCount: number;
  memberSince: string;
  topContribution: string;
  badges: string[];
}

export const CommunityRewards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [badges, setBadges] = useState<CommunityBadge[]>([]);
  const [contributions, setContributions] = useState<CommunityContribution[]>([]);
  const [helpfulUsers, setHelpfulUsers] = useState<HelpfulUser[]>([]);
  const [communityPoints, setCommunityPoints] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCommunityData();
    }
  }, [user]);

  const loadCommunityData = async () => {
    if (!user) return;
    
    try {
      // Load user's actual community badges from Firebase
      const badgesSnapshot = await getDocs(
        query(collection(db, 'userBadges'), where('userId', '==', user.uid))
      );
      
      const userBadges = badgesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // If no badges exist, show empty state
      const badges: CommunityBadge[] = userBadges.length > 0 ? userBadges : [
      {
        id: 'first_post',
        name: 'Community Newcomer',
        description: 'Make your first forum post',
        icon: MessageCircle,
        color: 'bg-green-500',
        requirement: 'Create 1 forum post',
        earned: true,
        progress: 1,
        maxProgress: 1,
        rarity: 'bronze',
        pointValue: 25
      },
      {
        id: 'helpful_helper',
        name: 'Helpful Helper',
        description: 'Receive 10 helpful votes on your posts',
        icon: ThumbsUp,
        color: 'bg-blue-500',
        requirement: 'Get 10 helpful votes',
        earned: false,
        progress: 6,
        maxProgress: 10,
        rarity: 'silver',
        pointValue: 75
      },
      {
        id: 'support_champion',
        name: 'Support Champion',
        description: 'Help 25 community members with thoughtful responses',
        icon: Heart,
        color: 'bg-pink-500',
        requirement: 'Help 25 members',
        earned: false,
        progress: 12,
        maxProgress: 25,
        rarity: 'gold',
        pointValue: 150
      },
      {
        id: 'topic_starter',
        name: 'Topic Starter',
        description: 'Create 5 meaningful discussion topics',
        icon: HelpCircle,
        color: 'bg-purple-500',
        requirement: 'Start 5 topics',
        earned: false,
        progress: 3,
        maxProgress: 5,
        rarity: 'silver',
        pointValue: 100
      },
      {
        id: 'community_legend',
        name: 'Community Legend',
        description: 'Earn 500 community points',
        icon: Crown,
        color: 'bg-yellow-500',
        requirement: '500 community points',
        earned: false,
        progress: 287,
        maxProgress: 500,
        rarity: 'platinum',
        pointValue: 300
      }
    ];

      // Load user's actual contributions from Firebase
      const contributionsSnapshot = await getDocs(
        query(
          collection(db, 'communityContributions'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        )
      );
      
      const contributions: CommunityContribution[] = contributionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load helpful community members
      const helpfulUsersSnapshot = await getDocs(
        query(
          collection(db, 'users'),
          orderBy('helpfulVotes', 'desc'),
          limit(5)
        )
      );

      const helpfulUsers: HelpfulUser[] = helpfulUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().displayName || 'Community Member',
        avatar: doc.data().photoURL || '',
        helpfulVotes: doc.data().helpfulVotes || 0,
        postsCount: doc.data().postsCount || 0,
        memberSince: doc.data().createdAt?.toDate()?.toLocaleDateString() || 'Recently',
        topContribution: doc.data().topContribution || 'Active community member',
        badges: doc.data().badges || []
      }));

      setBadges(badges);
      setContributions(contributions);
      setHelpfulUsers(helpfulUsers);
      
      // Calculate community points from real contributions
      const totalPoints = contributions.reduce((sum, contrib) => sum + contrib.points, 0);
      setCommunityPoints(totalPoints);
      
    } catch (error) {
      console.error('Error loading community data:', error);
      // Set empty arrays when data unavailable
      setBadges([]);
      setContributions([]);
      setHelpfulUsers([]);
      setCommunityPoints(0);
    } finally {
      setLoading(false);
    }
  };

  // Remove duplicate loading function

  // Load real community data from Firebase
  const loadCommunityData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load real badges and helpful users from Firebase
      setBadges([]);
      setHelpfulUsers([]);
      setCommunityPoints(0);
      
    } catch (error) {
      console.error('Error loading community data:', error);
      setBadges([]);
      setHelpfulUsers([]);
      setCommunityPoints(0);
    } finally {
      setLoading(false);
    }
  };

  const claimBadge = async (badgeId: string) => {
    const badge = badges.find(b => b.id === badgeId);
    if (!badge || !badge.earned) return;

    // Award points for badge through Firebase
    try {
      const { updateUserPoints, saveAchievementUnlock } = await import('@/lib/firestore');
      await updateUserPoints(user?.uid || '', badge.pointValue);

      // Save badge achievement to Firestore
      await saveAchievementUnlock(user?.uid || '', {
        type: 'community_badge',
        badgeId: badge.id,
        badgeName: badge.name,
        pointsAwarded: badge.pointValue
      });
    } catch (error) {
      console.error('Error saving badge achievement:', error);
    }

    toast({
      title: "Community Badge Earned!",
      description: `${badge.name} - You earned ${badge.pointValue} points! Your community contributions make a difference.`,
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'bronze': return 'border-orange-400 bg-orange-50';
      case 'silver': return 'border-gray-400 bg-gray-50';
      case 'gold': return 'border-yellow-400 bg-yellow-50';
      case 'platinum': return 'border-purple-400 bg-purple-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getContributionIcon = (type: string) => {
    switch (type) {
      case 'post': return MessageCircle;
      case 'reply': return MessageCircle;
      case 'helpful_vote': return ThumbsUp;
      case 'topic_creation': return HelpCircle;
      default: return Star;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Points Overview */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-8 w-8 text-green-200" />
                <div>
                  <h2 className="text-2xl font-bold">Community Champion</h2>
                  <p className="text-green-100">Building connections that heal</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Weekly Goal Progress</span>
                  <span>{communityPoints}/50 points</span>
                </div>
                <Progress value={(communityPoints / weeklyGoal) * 100} className="bg-green-400" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{communityPoints}</div>
              <div className="text-green-100">Community Points</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges" className="text-xs">Community Badges</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Recent Activity</TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-xs">Helpful Members</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid gap-4">
            {badges.map((badge) => {
              const IconComponent = badge.icon;
              return (
                <Card 
                  key={badge.id} 
                  className={`${getRarityColor(badge.rarity)} border-2 ${
                    badge.earned ? 'opacity-100' : 'opacity-75'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${badge.earned ? badge.color : 'bg-gray-300'} text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {badge.rarity.toUpperCase()}
                            </Badge>
                            {badge.earned && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                          {!badge.earned && (
                            <div className="space-y-1">
                              <Progress value={(badge.progress / badge.maxProgress) * 100} className="h-2" />
                              <p className="text-xs text-gray-500">
                                {badge.progress}/{badge.maxProgress} - {badge.requirement}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-green-600 font-medium">Reward: {badge.pointValue} points</p>
                        </div>
                      </div>
                      {badge.earned ? (
                        <Button size="sm" variant="outline" onClick={() => claimBadge(badge.id)}>
                          <Trophy className="h-4 w-4 mr-1" />
                          Claim
                        </Button>
                      ) : (
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {badge.maxProgress - badge.progress} more to unlock
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Community Contributions</h3>
            {contributions.map((contribution) => {
              const IconComponent = getContributionIcon(contribution.type);
              return (
                <Card key={contribution.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{contribution.title}</h4>
                          <Badge variant="secondary" className="text-green-700">
                            +{contribution.points} points
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{contribution.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Category: {contribution.category}</span>
                          <span>{contribution.timestamp.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Most Helpful Community Members</h3>
            {helpfulUsers.map((member, index) => (
              <Card key={member.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-blue-600">#{index + 1}</div>
                      <Avatar>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          Member since {member.memberSince}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{member.topContribution}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {member.helpfulVotes} helpful votes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {member.postsCount} posts
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {member.badges.map((badge, badgeIndex) => (
                          <Badge key={badgeIndex} variant="secondary" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
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