import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { PeerConnectionManager } from './PeerConnectionManager';
import { CommunityEventManager } from './CommunityEventManager';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  UserPlus, 
  Search,
  Filter,
  MapPin,
  Calendar,
  TrendingUp,
  Shield,
  Award,
  Lightbulb,
  Handshake,
  Globe,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CommunityMember {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  diagnosisDate: Date;
  companionTier: number;
  lastActive: Date;
  isOnline: boolean;
  bio?: string;
  interests: string[];
  supportPreferences: string[];
  symptoms: string[];
  experienceLevel: 'new' | 'intermediate' | 'experienced' | 'mentor';
  privacyLevel: 'open' | 'selective' | 'private';
  connectionCount: number;
  helpfulnessScore: number;
  specializations: string[];
}

interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  requestedAt: Date;
  acceptedAt?: Date;
  connectionType: 'peer_support' | 'mentor_mentee' | 'research_partner' | 'local_buddy';
  sharedInterests: string[];
  matchScore: number;
}

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  isPrivate: boolean;
  createdBy: string;
  createdAt: Date;
  tags: string[];
  meetingSchedule?: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    dayOfWeek: string;
    time: string;
    timezone: string;
  };
  nextMeeting?: Date;
  moderators: string[];
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'support_group' | 'qa_session' | 'workshop' | 'social';
  organizer: string;
  organizerName: string;
  scheduledFor: Date;
  duration: number; // minutes
  maxParticipants?: number;
  registeredCount: number;
  isVirtual: boolean;
  location?: string;
  meetingLink?: string;
  tags: string[];
  targetAudience: string[];
}

export const CommunityNetworkHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateChallengeProgress } = useChallengeProgress();
  const [activeTab, setActiveTab] = useState('discover');
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityData();
    if (user?.uid) {
      trackCommunityEngagement();
    }
  }, [user]);

  const loadCommunityData = async () => {
    setLoading(true);
    try {
      // Load community members with comprehensive data
      const mockMembers: CommunityMember[] = [
        {
          id: 'member_1',
          name: 'Sarah Chen',
          avatar: null,
          location: 'San Francisco, CA',
          diagnosisDate: new Date('2022-03-15'),
          companionTier: 5,
          lastActive: new Date(Date.now() - 30 * 60 * 1000),
          isOnline: true,
          bio: 'Environmental engineer focusing on mold-health connections. Happy to share research and support others on their journey.',
          interests: ['Environmental Science', 'Nutrition', 'Meditation', 'Research'],
          supportPreferences: ['Peer Support', 'Research Collaboration', 'Practical Tips'],
          symptoms: ['Skin lesions', 'Fatigue', 'Cognitive issues'],
          experienceLevel: 'experienced',
          privacyLevel: 'open',
          connectionCount: 23,
          helpfulnessScore: 95,
          specializations: ['Environmental Triggers', 'Biofilm Protocols']
        },
        {
          id: 'member_2',
          name: 'Michael Rodriguez',
          avatar: null,
          location: 'Austin, TX',
          diagnosisDate: new Date('2023-08-10'),
          companionTier: 3,
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isOnline: false,
          bio: 'Father of two, working through workplace exposure challenges. Building a support network for working parents.',
          interests: ['Family Support', 'Workplace Advocacy', 'Stress Management'],
          supportPreferences: ['Emotional Support', 'Practical Advice', 'Crisis Support'],
          symptoms: ['Joint pain', 'Skin lesions', 'Fatigue'],
          experienceLevel: 'intermediate',
          privacyLevel: 'selective',
          connectionCount: 15,
          helpfulnessScore: 87,
          specializations: ['Workplace Accommodation', 'Family Dynamics']
        },
        {
          id: 'member_3',
          name: 'Dr. Elena Martinez',
          avatar: null,
          location: 'Phoenix, AZ',
          diagnosisDate: new Date('2020-11-22'),
          companionTier: 8,
          lastActive: new Date(Date.now() - 45 * 60 * 1000),
          isOnline: true,
          bio: 'Former physician turned patient advocate. Bridging the gap between medical professionals and patient experiences.',
          interests: ['Medical Advocacy', 'Research', 'Education', 'Policy Change'],
          supportPreferences: ['Mentoring', 'Medical Navigation', 'Research Support'],
          symptoms: ['Neurological symptoms', 'Fatigue', 'Sensory issues'],
          experienceLevel: 'mentor',
          privacyLevel: 'open',
          connectionCount: 47,
          helpfulnessScore: 98,
          specializations: ['Medical Advocacy', 'Research Interpretation', 'Healthcare Navigation']
        },
        {
          id: 'member_4',
          name: 'James Wilson',
          avatar: null,
          location: 'Portland, OR',
          diagnosisDate: new Date('2024-01-15'),
          companionTier: 2,
          lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
          isOnline: false,
          bio: 'New to this journey and looking for guidance. Interested in natural approaches and connecting with others.',
          interests: ['Natural Healing', 'Diet & Nutrition', 'Support Groups'],
          supportPreferences: ['Guidance', 'Emotional Support', 'Information Sharing'],
          symptoms: ['Skin issues', 'Anxiety', 'Sleep problems'],
          experienceLevel: 'new',
          privacyLevel: 'selective',
          connectionCount: 3,
          helpfulnessScore: 72,
          specializations: []
        }
      ];

      // Load support groups
      const mockGroups: SupportGroup[] = [
        {
          id: 'group_1',
          name: 'Environmental Triggers Support',
          description: 'Focused on identifying and managing environmental factors that impact Morgellons symptoms.',
          category: 'Research & Education',
          memberCount: 47,
          isPrivate: false,
          createdBy: 'member_1',
          createdAt: new Date('2023-09-15'),
          tags: ['Environment', 'Mold', 'Triggers', 'Research'],
          meetingSchedule: {
            frequency: 'weekly',
            dayOfWeek: 'Wednesday',
            time: '19:00',
            timezone: 'PST'
          },
          nextMeeting: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          moderators: ['member_1', 'member_3']
        },
        {
          id: 'group_2',
          name: 'Newly Diagnosed Circle',
          description: 'Safe space for those recently diagnosed to ask questions, share concerns, and find support.',
          category: 'Support & Guidance',
          memberCount: 28,
          isPrivate: false,
          createdBy: 'member_3',
          createdAt: new Date('2023-11-01'),
          tags: ['New Diagnosis', 'Support', 'Questions', 'Guidance'],
          meetingSchedule: {
            frequency: 'biweekly',
            dayOfWeek: 'Sunday',
            time: '14:00',
            timezone: 'EST'
          },
          nextMeeting: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          moderators: ['member_3']
        },
        {
          id: 'group_3',
          name: 'Working Parents Network',
          description: 'Balancing Morgellons management with work and family responsibilities.',
          category: 'Lifestyle & Family',
          memberCount: 19,
          isPrivate: true,
          createdBy: 'member_2',
          createdAt: new Date('2024-01-20'),
          tags: ['Family', 'Work', 'Balance', 'Support'],
          meetingSchedule: {
            frequency: 'monthly',
            dayOfWeek: 'Saturday',
            time: '10:00',
            timezone: 'CST'
          },
          nextMeeting: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          moderators: ['member_2']
        }
      ];

      // Load community events
      const mockEvents: CommunityEvent[] = [
        {
          id: 'event_1',
          title: 'Mold Testing Workshop: DIY and Professional Options',
          description: 'Learn about different mold testing methods, when to test, and how to interpret results.',
          type: 'workshop',
          organizer: 'member_1',
          organizerName: 'Sarah Chen',
          scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          duration: 90,
          maxParticipants: 25,
          registeredCount: 18,
          isVirtual: true,
          meetingLink: 'https://meet.example.com/mold-workshop',
          tags: ['Mold', 'Testing', 'Environment', 'Education'],
          targetAudience: ['All Experience Levels']
        },
        {
          id: 'event_2',
          title: 'Q&A Session with Dr. Martinez: Medical Advocacy',
          description: 'Interactive session on how to effectively communicate with healthcare providers about Morgellons.',
          type: 'qa_session',
          organizer: 'member_3',
          organizerName: 'Dr. Elena Martinez',
          scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          duration: 60,
          registeredCount: 34,
          isVirtual: true,
          meetingLink: 'https://meet.example.com/medical-advocacy',
          tags: ['Medical Advocacy', 'Healthcare', 'Communication'],
          targetAudience: ['All Experience Levels']
        },
        {
          id: 'event_3',
          title: 'Pacific Northwest Regional Meetup',
          description: 'In-person gathering for members in the Pacific Northwest region.',
          type: 'social',
          organizer: 'member_4',
          organizerName: 'James Wilson',
          scheduledFor: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          duration: 180,
          maxParticipants: 12,
          registeredCount: 8,
          isVirtual: false,
          location: 'Portland Community Center, OR',
          tags: ['Regional', 'In-Person', 'Social', 'Pacific Northwest'],
          targetAudience: ['Pacific Northwest Region']
        }
      ];

      setMembers(mockMembers);
      setSupportGroups(mockGroups);
      setEvents(mockEvents);
      
    } catch (error) {
      console.error('Error loading community data:', error);
    }
    setLoading(false);
  };

  const trackCommunityEngagement = async () => {
    if (user?.uid) {
      await updateChallengeProgress('community_engagement');
    }
  };

  const sendConnectionRequest = async (memberId: string, connectionType: string) => {
    try {
      const connection: Connection = {
        id: `conn_${Date.now()}`,
        userId: user?.uid || '',
        connectedUserId: memberId,
        status: 'pending',
        requestedAt: new Date(),
        connectionType: connectionType as any,
        sharedInterests: [],
        matchScore: 85
      };

      // In real implementation, this would save to Firebase
      console.log('Connection request sent:', connection);

      toast({
        title: "Connection Request Sent",
        description: "Your request has been sent successfully.",
      });

      await updateChallengeProgress('connection_request');
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request.",
        variant: "destructive",
      });
    }
  };

  const joinSupportGroup = async (groupId: string) => {
    try {
      // In real implementation, this would update Firebase
      console.log('Joining support group:', groupId);

      toast({
        title: "Joined Support Group",
        description: "You've successfully joined the support group.",
      });

      await updateChallengeProgress('group_participation');
    } catch (error) {
      console.error('Error joining support group:', error);
      toast({
        title: "Error",
        description: "Failed to join support group.",
        variant: "destructive",
      });
    }
  };

  const registerForEvent = async (eventId: string) => {
    try {
      // In real implementation, this would update Firebase
      console.log('Registering for event:', eventId);

      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, registeredCount: event.registeredCount + 1 }
          : event
      ));

      toast({
        title: "Event Registration Successful",
        description: "You've been registered for the event.",
      });

      await updateChallengeProgress('event_participation');
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Error",
        description: "Failed to register for event.",
        variant: "destructive",
      });
    }
  };

  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'intermediate': return 'bg-green-100 text-green-800 border-green-200';
      case 'experienced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mentor': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'webinar': return <TrendingUp className="h-4 w-4" />;
      case 'support_group': return <Users className="h-4 w-4" />;
      case 'qa_session': return <MessageCircle className="h-4 w-4" />;
      case 'workshop': return <Lightbulb className="h-4 w-4" />;
      case 'social': return <Heart className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = !locationFilter || member.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesExperience = !experienceFilter || member.experienceLevel === experienceFilter;
    return matchesSearch && matchesLocation && matchesExperience;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading community network...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Overview Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-purple-600" />
            Community Network Hub
            <Badge className="bg-green-100 text-green-800 border-green-200 ml-auto">
              {members.filter(m => m.isOnline).length} Online
            </Badge>
          </CardTitle>
          <p className="text-gray-600">
            Connect with peers, join support groups, and participate in community events designed for Morgellons support.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{members.length}</div>
              <div className="text-sm text-gray-600">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{supportGroups.length}</div>
              <div className="text-sm text-gray-600">Support Groups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{events.length}</div>
              <div className="text-sm text-gray-600">Upcoming Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {members.reduce((sum, m) => sum + m.connectionCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Connections</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Handshake className="h-4 w-4" />
            Connections
          </TabsTrigger>
        </TabsList>

        {/* Discover Members Tab */}
        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search members by name, interests, or specializations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-32"
                  />
                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Experience</option>
                    <option value="new">New</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="experienced">Experienced</option>
                    <option value="mentor">Mentor</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        {member.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {member.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={getExperienceBadgeColor(member.experienceLevel)}>
                        {member.experienceLevel}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Member Bio */}
                    <p className="text-sm text-gray-700 line-clamp-2">{member.bio}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>Tier {member.companionTier}</span>
                        <span>{member.connectionCount} connections</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {member.helpfulnessScore}
                        </div>
                      </div>
                    </div>

                    {/* Interests */}
                    <div className="flex flex-wrap gap-1">
                      {member.interests.slice(0, 3).map((interest, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                      {member.interests.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.interests.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Specializations */}
                    {member.specializations.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Specializations:</p>
                        <div className="flex flex-wrap gap-1">
                          {member.specializations.map((spec, idx) => (
                            <Badge key={idx} className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex-1">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Connect
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Connect with {member.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                              Choose the type of connection you'd like to establish:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => sendConnectionRequest(member.id, 'peer_support')}
                              >
                                Peer Support
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => sendConnectionRequest(member.id, 'mentor_mentee')}
                              >
                                {member.experienceLevel === 'mentor' ? 'Mentorship' : 'Learning Partner'}
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => sendConnectionRequest(member.id, 'research_partner')}
                              >
                                Research Partner
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => sendConnectionRequest(member.id, 'local_buddy')}
                              >
                                Local Buddy
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Support Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Support Groups</h2>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {supportGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{group.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {group.isPrivate && (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                          <Shield className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {group.memberCount} members
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700">{group.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {group.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Meeting Schedule */}
                    {group.meetingSchedule && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">
                            {group.meetingSchedule.frequency} • {group.meetingSchedule.dayOfWeek}s at {group.meetingSchedule.time} {group.meetingSchedule.timezone}
                          </span>
                        </div>
                        {group.nextMeeting && (
                          <div className="flex items-center gap-2 text-xs text-blue-600 mt-1">
                            <Clock className="h-3 w-3" />
                            Next meeting: {group.nextMeeting.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <Button 
                      className="w-full" 
                      onClick={() => joinSupportGroup(group.id)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Join Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <CommunityEventManager />
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-6">
          <PeerConnectionManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};