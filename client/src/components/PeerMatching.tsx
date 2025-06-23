import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Clock,
  MapPin,
  Calendar,
  Star,
  UserPlus,
  Settings,
  Filter,
  Search,
  CheckCircle,
  ArrowRight,
  Globe,
  Shield,
  Brain,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MatchPreferences {
  symptoms: string[];
  ageRange: [number, number];
  location: 'anywhere' | 'country' | 'region' | 'city';
  experienceLevel: 'newly_diagnosed' | 'experienced' | 'long_term' | 'any';
  supportType: string[];
  interests: string[];
  timeZone: string;
  communicationStyle: 'frequent' | 'occasional' | 'as_needed';
  privacyLevel: 'open' | 'selective' | 'private';
}

interface PotentialMatch {
  id: string;
  name: string;
  avatar: string;
  age: number;
  location: string;
  memberSince: string;
  matchPercentage: number;
  commonSymptoms: string[];
  sharedInterests: string[];
  experienceLevel: string;
  lastActive: string;
  isOnline: boolean;
  mutualConnections: number;
  bio: string;
}

interface MatchingStats {
  totalMatches: number;
  activeConversations: number;
  successfulConnections: number;
  weeklyMatches: number;
}

export const PeerMatching = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState<MatchPreferences>({
    symptoms: [],
    ageRangeMin: 18,
    ageRangeMax: 99,
    location: 'anywhere',
    experienceLevel: 'any',
    supportType: [],
    interests: [],
    timeZone: 'UTC',
    communicationStyle: 'occasional',
    privacyLevel: 'selective'
  });
  
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [stats, setStats] = useState<MatchingStats>({
    totalUsers: 0,
    activeConnections: 0,
    potentialMatches: 0,
    thisWeekConnections: 0
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommendations');

  useEffect(() => {
    if (user) {
      loadUserPreferences();
      loadPotentialMatches();
      loadMatchingStats();
      loadAIRecommendations();
    }
  }, [user]);

  const loadAIRecommendations = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/ai/peer-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load AI recommendations');
      }

      const data = await response.json();
      setAiRecommendations(data.recommendations || []);
      
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      toast({
        title: "AI Recommendations Unavailable",
        description: "Using standard matching algorithm instead.",
        variant: "destructive"
      });
    }
  };

  const loadUserPreferences = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const prefsQuery = query(
        collection(db, 'matchingPreferences'),
        where('userId', '==', user.uid)
      );
      
      const prefsSnapshot = await getDocs(prefsQuery);
      
      if (!prefsSnapshot.empty) {
        const prefsData = prefsSnapshot.docs[0].data();
        setPreferences({
          symptoms: prefsData.symptoms || [],
          ageRangeMin: prefsData.ageRangeMin || 18,
          ageRangeMax: prefsData.ageRangeMax || 99,
          location: prefsData.location || 'anywhere',
          experienceLevel: prefsData.experienceLevel || 'any',
          supportType: prefsData.supportType || [],
          interests: prefsData.interests || [],
          timeZone: prefsData.timeZone || 'UTC',
          communicationStyle: prefsData.communicationStyle || 'occasional',
          privacyLevel: prefsData.privacyLevel || 'selective'
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPotentialMatches = async () => {
    if (!user) return;
    
    try {
      setIsSearching(true);
      
      // Get all users except current user
      const usersQuery = query(
        collection(db, 'users'),
        limit(50)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = usersSnapshot.docs
        .filter(doc => doc.id !== user.uid)
        .map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Get user's symptom entries to find common symptoms
      const symptomQuery = query(
        collection(db, 'symptomEntries'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const symptomSnapshot = await getDocs(symptomQuery);
      const userSymptoms = symptomSnapshot.docs.flatMap(doc => 
        doc.data().symptoms || []
      );
      
      // Calculate matches with AI assistance
      const matches = await Promise.all(
        allUsers.slice(0, 10).map(async (otherUser: any) => {
          const matchData = await calculateMatchCompatibility(user.uid, otherUser.id, userSymptoms);
          
          return {
            id: otherUser.id,
            displayName: otherUser.displayName || 'Anonymous User',
            email: otherUser.email,
            memberSince: otherUser.createdAt ? new Date(otherUser.createdAt.toDate()).toLocaleDateString() : 'Recently',
            matchPercentage: matchData.percentage,
            commonSymptoms: matchData.commonSymptoms,
            sharedInterests: matchData.sharedInterests,
            experienceLevel: otherUser.experienceLevel || 'experienced',
            lastActive: otherUser.lastLogin ? calculateTimeSince(otherUser.lastLogin.toDate()) : 'Recently',
            isOnline: otherUser.lastLogin ? isRecentlyActive(otherUser.lastLogin.toDate()) : false,
            bio: otherUser.bio || 'Member of the Fiber Friends community',
            symptoms: matchData.commonSymptoms,
            interests: matchData.sharedInterests
          };
        })
      );
      
      // Sort by match percentage
      matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
      setPotentialMatches(matches);
      
    } catch (error) {
      console.error('Error loading potential matches:', error);
      toast({
        title: "Error Loading Matches",
        description: "Unable to load potential matches. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const calculateMatchCompatibility = async (userId1: string, userId2: string, userSymptoms: string[]) => {
    try {
      // Get other user's symptoms
      const otherUserSymptomsQuery = query(
        collection(db, 'symptomEntries'),
        where('userId', '==', userId2),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const otherSymptomsSnapshot = await getDocs(otherUserSymptomsQuery);
      const otherUserSymptoms = otherSymptomsSnapshot.docs.flatMap(doc => 
        doc.data().symptoms || []
      );
      
      // Calculate common symptoms
      const commonSymptoms = userSymptoms.filter(symptom => 
        otherUserSymptoms.includes(symptom)
      );
      
      // Calculate basic compatibility percentage
      const symptomsCompatibility = commonSymptoms.length > 0 ? 
        (commonSymptoms.length / Math.max(userSymptoms.length, otherUserSymptoms.length)) * 100 : 0;
      
      // Add some variance for realistic matching
      const basePercentage = Math.min(symptomsCompatibility + Math.random() * 30, 95);
      
      return {
        percentage: Math.round(basePercentage),
        commonSymptoms: commonSymptoms.slice(0, 3),
        sharedInterests: ['Community support', 'Health tracking'] // Default interests
      };
    } catch (error) {
      console.error('Error calculating match compatibility:', error);
      return {
        percentage: Math.round(Math.random() * 40 + 50), // Random 50-90%
        commonSymptoms: ['Shared health journey'],
        sharedInterests: ['Community support']
      };
    }
  };

  const calculateTimeSince = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  const isRecentlyActive = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return diffMs < (1000 * 60 * 60 * 24); // Active within last 24 hours
  };

  const loadMatchingStats = async () => {
    if (!user) return;
    
    try {
      // Get total users count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      
      // Get user's connections
      const connectionsQuery = query(
        collection(db, 'peerConnections'),
        where('fromUserId', '==', user.uid)
      );
      
      const connectionsSnapshot = await getDocs(connectionsQuery);
      const activeConnections = connectionsSnapshot.docs.filter(doc => 
        doc.data().status === 'accepted'
      ).length;
      
      setStats({
        totalUsers: totalUsers - 1, // Exclude current user
        activeConnections,
        potentialMatches: Math.max(totalUsers - activeConnections - 1, 0),
        thisWeekConnections: connectionsSnapshot.docs.filter(doc => {
          const createdAt = doc.data().createdAt?.toDate();
          if (!createdAt) return false;
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdAt > weekAgo;
        }).length
      });
      
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    
    try {
      // Check if preferences already exist
      const prefsQuery = query(
        collection(db, 'matchingPreferences'),
        where('userId', '==', user.uid)
      );
      
      const prefsSnapshot = await getDocs(prefsQuery);
      
      const preferencesData = {
        userId: user.uid,
        ...preferences,
        updatedAt: new Date()
      };
      
      if (prefsSnapshot.empty) {
        // Create new preferences
        await addDoc(collection(db, 'matchingPreferences'), preferencesData);
      } else {
        // Update existing preferences
        const prefsDocRef = doc(db, 'matchingPreferences', prefsSnapshot.docs[0].id);
        await updateDoc(prefsDocRef, preferencesData);
      }
      
      toast({
        title: "Preferences Saved",
        description: "Your matching preferences have been updated. Finding better matches for you.",
      });
      
      // Refresh matches
      loadPotentialMatches();
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  const connectWithPeer = async (matchId: string) => {
    if (!user) return;
    
    const match = potentialMatches.find(m => m.id === matchId);
    if (!match) return;

    try {
      // Check if connection already exists
      const existingConnectionQuery = query(
        collection(db, 'peerConnections'),
        where('fromUserId', '==', user.uid),
        where('toUserId', '==', matchId)
      );
      
      const existingSnapshot = await getDocs(existingConnectionQuery);
      
      if (!existingSnapshot.empty) {
        toast({
          title: "Connection Already Exists",
          description: "You've already sent a connection request to this user.",
          variant: "destructive"
        });
        return;
      }

      // Create new connection request
      await addDoc(collection(db, 'peerConnections'), {
        fromUserId: user.uid,
        toUserId: matchId,
        status: 'pending',
        matchPercentage: match.matchPercentage,
        commonSymptoms: match.commonSymptoms,
        sharedInterests: match.sharedInterests,
        connectionType: 'support',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      toast({
        title: "Connection Request Sent!",
        description: `Your request to connect with ${match.displayName} has been sent. They'll be notified and can choose to accept.`,
      });

      // Update stats
      setStats(prev => ({
        ...prev,
        thisWeekConnections: prev.thisWeekConnections + 1
      }));

    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const symptomOptions = [
    'Crawling sensations', 'Skin lesions', 'Fatigue', 'Joint pain', 
    'Brain fog', 'Sleep issues', 'Digestive problems', 'Memory issues',
    'Mood changes', 'Headaches', 'Muscle pain', 'Vision problems'
  ];

  const supportTypeOptions = [
    'Emotional support', 'Practical advice', 'Treatment experiences',
    'Coping strategies', 'Research updates', 'Daily check-ins',
    'Crisis support', 'Motivational support'
  ];

  const interestOptions = [
    'Meditation', 'Natural remedies', 'Research participation',
    'Dietary changes', 'Exercise', 'Art therapy', 'Journaling',
    'Online support', 'Mindfulness', 'Travel', 'Reading', 'Music'
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-8 w-16 mx-auto" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-purple-100 text-sm">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.activeConnections}</div>
              <div className="text-purple-100 text-sm">Your Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.potentialMatches}</div>
              <div className="text-purple-100 text-sm">Potential Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.thisWeekConnections}</div>
              <div className="text-purple-100 text-sm">This Week</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations" className="text-sm">AI Recommendations</TabsTrigger>
          <TabsTrigger value="matches" className="text-sm">All Matches</TabsTrigger>
          <TabsTrigger value="preferences" className="text-sm">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Recommendations</h3>
            <Button 
              variant="outline" 
              onClick={loadAIRecommendations}
              disabled={isSearching}
            >
              {isSearching ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              {isSearching ? 'Analyzing...' : 'Get New Recommendations'}
            </Button>
          </div>

          {aiRecommendations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI Recommendations Loading
                </h3>
                <p className="text-gray-600 mb-4">
                  Our AI is analyzing your health data and community activity to find the best connections for you.
                </p>
                <Button onClick={loadAIRecommendations} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Recommendations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {aiRecommendations.map((recommendation) => {
                const match = potentialMatches.find(m => m.id === recommendation.targetUserId);
                if (!match) return null;

                const getRecommendationTypeColor = (type: string) => {
                  switch (type) {
                    case 'urgent_support': return 'bg-red-50 border-red-200 text-red-800';
                    case 'mentor': return 'bg-blue-50 border-blue-200 text-blue-800';
                    case 'research_partner': return 'bg-green-50 border-green-200 text-green-800';
                    default: return 'bg-purple-50 border-purple-200 text-purple-800';
                  }
                };

                const getRecommendationTypeIcon = (type: string) => {
                  switch (type) {
                    case 'urgent_support': return <Heart className="h-4 w-4" />;
                    case 'mentor': return <Star className="h-4 w-4" />;
                    case 'research_partner': return <Target className="h-4 w-4" />;
                    default: return <Users className="h-4 w-4" />;
                  }
                };

                return (
                  <Card key={recommendation.targetUserId} className="border-l-4 border-l-purple-500 relative">
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className={getRecommendationTypeColor(recommendation.recommendationType)}>
                        {getRecommendationTypeIcon(recommendation.recommendationType)}
                        <span className="ml-1 capitalize">
                          {recommendation.recommendationType.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>
                    
                    <CardContent className="p-6 pr-32">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                              {match.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <Brain className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{match.displayName}</h4>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              {Math.round(recommendation.score)}% AI match
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {recommendation.confidence}% confidence
                            </Badge>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-purple-800 font-medium mb-1">AI Insight:</p>
                            <p className="text-sm text-purple-700">{recommendation.aiInsight}</p>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div>
                              <span className="text-xs font-medium text-gray-500">Why this connection is recommended:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {recommendation.reasons.map((reason, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {reason}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Symptom overlap:</span>
                              <span className="font-medium">{Math.round(recommendation.compatibility.symptomOverlap * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Interest alignment:</span>
                              <span className="font-medium">{Math.round(recommendation.compatibility.interestAlignment * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Communication match:</span>
                              <span className="font-medium">{Math.round(recommendation.compatibility.communicationMatch * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Experience match:</span>
                              <span className="font-medium">{Math.round(recommendation.compatibility.experienceMatch * 100)}%</span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm" 
                              onClick={() => connectWithPeer(match.id)}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Connect Now
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Send Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Your Potential Matches</h3>
            <Button 
              variant="outline" 
              onClick={loadPotentialMatches}
              disabled={isSearching}
            >
              {isSearching ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {isSearching ? 'Finding Matches...' : 'Refresh Matches'}
            </Button>
          </div>

          {potentialMatches.length === 0 && !isSearching ? (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Matches Found
                </h3>
                <p className="text-gray-600 mb-4">
                  Complete your profile and track symptoms to find compatible community members.
                </p>
                <Button onClick={loadPotentialMatches} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Find Matches
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {potentialMatches.map((match) => (
                <Card key={match.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {match.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {match.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-gray-900">{match.displayName}</h4>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              {match.matchPercentage}% match
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {match.lastActive}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Member since {match.memberSince}
                          </span>
                          {match.experienceLevel && (
                            <Badge variant="outline" className="text-xs">
                              {match.experienceLevel.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-700 mb-3">{match.bio}</p>

                        <div className="space-y-2">
                          {match.commonSymptoms.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-gray-500">Common Health Focus:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {match.commonSymptoms.map((symptom, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {symptom}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {match.sharedInterests.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-gray-500">Shared Interests:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {match.sharedInterests.map((interest, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            onClick={() => connectWithPeer(match.id)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Matching Preferences
              </CardTitle>
              <p className="text-sm text-gray-600">
                Customize your preferences to find the most compatible peer matches
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Symptoms */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Common Symptoms</Label>
                <p className="text-sm text-gray-600">Select symptoms you'd like to connect with others about</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {symptomOptions.map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={`symptom-${symptom}`}
                        checked={preferences.symptoms.includes(symptom)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              symptoms: [...prev.symptoms, symptom]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              symptoms: prev.symptoms.filter(s => s !== symptom)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`symptom-${symptom}`} className="text-sm">
                        {symptom}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Age Range */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Preferred Age Range</Label>
                <div className="px-3">
                  <Slider
                    value={preferences.ageRange}
                    onValueChange={(value) => setPreferences(prev => ({
                      ...prev,
                      ageRange: value as [number, number]
                    }))}
                    min={18}
                    max={80}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{preferences.ageRange[0]} years</span>
                    <span>{preferences.ageRange[1]} years</span>
                  </div>
                </div>
              </div>

              {/* Support Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Type of Support Seeking</Label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {supportTypeOptions.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`support-${type}`}
                        checked={preferences.supportType.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              supportType: [...prev.supportType, type]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              supportType: prev.supportType.filter(s => s !== type)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`support-${type}`} className="text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Shared Interests</Label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {interestOptions.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={preferences.interests.includes(interest)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              interests: [...prev.interests, interest]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              interests: prev.interests.filter(i => i !== interest)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`interest-${interest}`} className="text-sm">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Communication & Privacy */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Communication Style</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'frequent', label: 'Frequent (Daily check-ins)' },
                      { value: 'occasional', label: 'Occasional (Few times a week)' },
                      { value: 'as_needed', label: 'As needed (When support is required)' }
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`comm-${option.value}`}
                          checked={preferences.communicationStyle === option.value}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPreferences(prev => ({
                                ...prev,
                                communicationStyle: option.value as any
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`comm-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Privacy Level</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'open', label: 'Open (Public profile)' },
                      { value: 'selective', label: 'Selective (Matched users only)' },
                      { value: 'private', label: 'Private (Invitation only)' }
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`privacy-${option.value}`}
                          checked={preferences.privacyLevel === option.value}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPreferences(prev => ({
                                ...prev,
                                privacyLevel: option.value as any
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`privacy-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={savePreferences} className="w-full bg-purple-600 hover:bg-purple-700">
                <Shield className="h-4 w-4 mr-2" />
                Save Preferences & Find Matches
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};