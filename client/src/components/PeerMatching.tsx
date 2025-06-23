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
  Shield
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
    ageRange: [25, 65],
    location: 'anywhere',
    experienceLevel: 'any',
    supportType: [],
    interests: [],
    timeZone: 'UTC',
    communicationStyle: 'occasional',
    privacyLevel: 'selective'
  });
  
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [stats, setStats] = useState<MatchingStats>({
    totalMatches: 0,
    activeConversations: 0,
    successfulConnections: 0,
    weeklyMatches: 0
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');

  useEffect(() => {
    if (user) {
      loadUserPreferences();
      loadPotentialMatches();
      loadMatchingStats();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    // Load user's matching preferences
    const savedPrefs = localStorage.getItem('matchingPreferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  };

  const loadPotentialMatches = async () => {
    // Generate potential matches based on preferences
    const mockMatches: PotentialMatch[] = [
      {
        id: '1',
        name: 'Sarah J.',
        avatar: '/avatars/sarah.jpg',
        age: 34,
        location: 'California, USA',
        memberSince: 'March 2024',
        matchPercentage: 92,
        commonSymptoms: ['Crawling sensations', 'Skin lesions', 'Fatigue'],
        sharedInterests: ['Meditation', 'Natural remedies', 'Support groups'],
        experienceLevel: 'experienced',
        lastActive: '2 hours ago',
        isOnline: true,
        mutualConnections: 3,
        bio: 'Living with Morgellons for 3 years. Found peace through meditation and community support. Happy to share what has helped me.'
      },
      {
        id: '2',
        name: 'Michael R.',
        avatar: '/avatars/michael.jpg',
        age: 42,
        location: 'Texas, USA',
        memberSince: 'January 2024',
        matchPercentage: 87,
        commonSymptoms: ['Skin lesions', 'Joint pain', 'Brain fog'],
        sharedInterests: ['Research participation', 'Dietary changes', 'Exercise'],
        experienceLevel: 'long_term',
        lastActive: '1 day ago',
        isOnline: false,
        mutualConnections: 2,
        bio: 'Researcher by day, patient advocate always. Interested in data-driven approaches to symptom management.'
      },
      {
        id: '3',
        name: 'Jennifer L.',
        avatar: '/avatars/jennifer.jpg',
        age: 29,
        location: 'Ontario, Canada',
        memberSince: 'May 2024',
        matchPercentage: 84,
        commonSymptoms: ['Crawling sensations', 'Fatigue', 'Sleep issues'],
        sharedInterests: ['Art therapy', 'Journaling', 'Online support'],
        experienceLevel: 'newly_diagnosed',
        lastActive: '30 minutes ago',
        isOnline: true,
        mutualConnections: 1,
        bio: 'Recently diagnosed and looking for understanding friends who get it. Love creative expression as therapy.'
      },
      {
        id: '4',
        name: 'David K.',
        avatar: '/avatars/david.jpg',
        age: 38,
        location: 'London, UK',
        memberSince: 'February 2024',
        matchPercentage: 81,
        commonSymptoms: ['Joint pain', 'Brain fog', 'Skin lesions'],
        sharedInterests: ['Mindfulness', 'Research updates', 'Travel'],
        experienceLevel: 'experienced',
        lastActive: '4 hours ago',
        isOnline: false,
        mutualConnections: 4,
        bio: 'Mindfulness practitioner helping others find calm in the storm. Believe in the power of shared experiences.'
      }
    ];

    setPotentialMatches(mockMatches);
  };

  const loadMatchingStats = () => {
    setStats({
      totalMatches: 156,
      activeConversations: 8,
      successfulConnections: 23,
      weeklyMatches: 12
    });
  };

  const savePreferences = async () => {
    localStorage.setItem('matchingPreferences', JSON.stringify(preferences));
    
    try {
      const { updateUserInFirestore } = await import('@/lib/firestore');
      await updateUserInFirestore(user?.uid || '', {
        matchingPreferences: preferences,
        profileUpdated: new Date().toISOString()
      });
      
      toast({
        title: "Preferences Saved",
        description: "Your matching preferences have been updated. Finding better matches for you.",
      });
      
      // Refresh matches
      setIsSearching(true);
      setTimeout(() => {
        loadPotentialMatches();
        setIsSearching(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const connectWithPeer = async (matchId: string) => {
    const match = potentialMatches.find(m => m.id === matchId);
    if (!match) return;

    try {
      // Save connection request to Firestore
      const { saveCommunityContribution } = await import('@/lib/firestore');
      await saveCommunityContribution(user?.uid || '', {
        type: 'peer_connection',
        targetUserId: matchId,
        matchPercentage: match.matchPercentage,
        requestedAt: new Date().toISOString()
      });

      toast({
        title: "Connection Request Sent!",
        description: `Your request to connect with ${match.name} has been sent. They'll be notified and can choose to accept.`,
      });

      // Update stats
      setStats(prev => ({
        ...prev,
        totalMatches: prev.totalMatches + 1
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

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
              <div className="text-purple-100 text-sm">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.activeConversations}</div>
              <div className="text-purple-100 text-sm">Active Chats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.successfulConnections}</div>
              <div className="text-purple-100 text-sm">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.weeklyMatches}</div>
              <div className="text-purple-100 text-sm">This Week</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="matches" className="text-sm">Potential Matches</TabsTrigger>
          <TabsTrigger value="preferences" className="text-sm">Matching Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Your Potential Matches</h3>
            <Button 
              variant="outline" 
              onClick={() => loadPotentialMatches()}
              disabled={isSearching}
            >
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Finding Matches...' : 'Refresh Matches'}
            </Button>
          </div>

          <div className="grid gap-4">
            {potentialMatches.map((match) => (
              <Card key={match.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={match.avatar} alt={match.name} />
                        <AvatarFallback>{match.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {match.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{match.name}</h4>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            {match.matchPercentage}% match
                          </Badge>
                          {match.mutualConnections > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {match.mutualConnections} mutual
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {match.lastActive}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {match.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Member since {match.memberSince}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {match.experienceLevel.replace('_', ' ')}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{match.bio}</p>

                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500">Common Symptoms:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {match.commonSymptoms.map((symptom, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
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