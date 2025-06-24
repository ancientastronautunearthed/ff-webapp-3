import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Globe,
  Video,
  Plus,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  MessageCircle,
  Lightbulb,
  Heart,
  Share,
  Bell
} from 'lucide-react';

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'support_group' | 'qa_session' | 'workshop' | 'social' | 'research_presentation';
  organizer: {
    id: string;
    name: string;
    avatar?: string;
    expertise: string[];
  };
  scheduledFor: Date;
  duration: number; // minutes
  maxParticipants?: number;
  registeredCount: number;
  waitlistCount: number;
  isVirtual: boolean;
  location?: string;
  meetingLink?: string;
  requiresApproval: boolean;
  tags: string[];
  targetAudience: string[];
  resources: {
    type: 'document' | 'link' | 'video';
    title: string;
    url: string;
  }[];
  registrationDeadline?: Date;
  cost?: number;
  isUserRegistered: boolean;
  feedback?: {
    rating: number;
    comments: number;
  };
}

interface EventRegistration {
  eventId: string;
  userId: string;
  registeredAt: Date;
  status: 'confirmed' | 'waitlist' | 'pending_approval';
  reminderPreferences: {
    dayBefore: boolean;
    hourBefore: boolean;
    fifteenMinutes: boolean;
  };
  questions?: {
    question: string;
    answer: string;
  }[];
}

export const CommunityEventManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'webinar',
    scheduledFor: '',
    duration: 60,
    isVirtual: true,
    maxParticipants: 25,
    tags: '',
    targetAudience: 'All Experience Levels'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventData();
  }, [user]);

  const loadEventData = async () => {
    setLoading(true);
    try {
      // Load upcoming events with detailed information
      const mockEvents: CommunityEvent[] = [
        {
          id: 'event_1',
          title: 'Advanced Biofilm Disruption Strategies',
          description: 'Deep dive into the latest research on biofilm formation in Morgellons and evidence-based disruption protocols. Includes Q&A with researchers and patient success stories.',
          type: 'webinar',
          organizer: {
            id: 'org_1',
            name: 'Dr. Sarah Chen',
            avatar: null,
            expertise: ['Environmental Medicine', 'Biofilm Research', 'Morgellons Specialist']
          },
          scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          duration: 90,
          maxParticipants: 50,
          registeredCount: 32,
          waitlistCount: 5,
          isVirtual: true,
          meetingLink: 'https://meet.example.com/biofilm-strategies',
          requiresApproval: false,
          tags: ['Biofilm', 'Treatment', 'Research', 'Advanced'],
          targetAudience: ['Intermediate', 'Experienced'],
          resources: [
            {
              type: 'document',
              title: 'Biofilm Research Summary 2024',
              url: '/resources/biofilm-research-2024.pdf'
            },
            {
              type: 'link',
              title: 'PubMed Biofilm Studies',
              url: 'https://pubmed.ncbi.nlm.nih.gov/biofilm-morgellons'
            }
          ],
          registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          isUserRegistered: false,
          feedback: {
            rating: 4.8,
            comments: 24
          }
        },
        {
          id: 'event_2',
          title: 'Newly Diagnosed Support Circle',
          description: 'Monthly gathering for those recently diagnosed with Morgellons. Safe space to ask questions, share concerns, and connect with others on similar journeys.',
          type: 'support_group',
          organizer: {
            id: 'org_2',
            name: 'Elena Martinez',
            avatar: null,
            expertise: ['Patient Advocacy', 'Peer Support', 'Mental Health']
          },
          scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          duration: 120,
          maxParticipants: 15,
          registeredCount: 12,
          waitlistCount: 0,
          isVirtual: true,
          meetingLink: 'https://meet.example.com/new-diagnosis-support',
          requiresApproval: true,
          tags: ['Support', 'New Diagnosis', 'Emotional Support', 'Q&A'],
          targetAudience: ['New Diagnosis', 'Family Members'],
          resources: [
            {
              type: 'document',
              title: 'Getting Started Guide for New Patients',
              url: '/resources/new-patient-guide.pdf'
            }
          ],
          isUserRegistered: true,
          feedback: {
            rating: 4.9,
            comments: 18
          }
        },
        {
          id: 'event_3',
          title: 'Environmental Testing Workshop: DIY and Professional Methods',
          description: 'Comprehensive workshop covering mold testing, air quality assessment, and environmental factor identification. Hands-on demonstrations and expert guidance.',
          type: 'workshop',
          organizer: {
            id: 'org_3',
            name: 'Michael Rodriguez',
            avatar: null,
            expertise: ['Environmental Science', 'Mold Testing', 'Indoor Air Quality']
          },
          scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          duration: 180,
          maxParticipants: 20,
          registeredCount: 18,
          waitlistCount: 3,
          isVirtual: false,
          location: 'Community Health Center, San Francisco, CA',
          requiresApproval: false,
          tags: ['Environment', 'Testing', 'Hands-on', 'Workshop'],
          targetAudience: ['All Experience Levels'],
          resources: [
            {
              type: 'document',
              title: 'Environmental Testing Checklist',
              url: '/resources/testing-checklist.pdf'
            },
            {
              type: 'video',
              title: 'Pre-workshop Preparation Video',
              url: 'https://youtube.com/workshop-prep'
            }
          ],
          cost: 25,
          isUserRegistered: false,
          feedback: {
            rating: 4.7,
            comments: 31
          }
        },
        {
          id: 'event_4',
          title: 'Research Presentation: Latest Clinical Trial Results',
          description: 'Exclusive presentation of recent clinical trial results for Morgellons treatments. Discussion of implications and future research directions.',
          type: 'research_presentation',
          organizer: {
            id: 'org_4',
            name: 'Dr. James Wilson',
            avatar: null,
            expertise: ['Clinical Research', 'Morgellons Research', 'Medical Statistics']
          },
          scheduledFor: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          duration: 75,
          maxParticipants: 100,
          registeredCount: 67,
          waitlistCount: 0,
          isVirtual: true,
          meetingLink: 'https://meet.example.com/research-presentation',
          requiresApproval: false,
          tags: ['Research', 'Clinical Trials', 'Medical', 'Data'],
          targetAudience: ['Researchers', 'Healthcare Providers', 'Experienced Patients'],
          resources: [
            {
              type: 'document',
              title: 'Study Abstract and Methodology',
              url: '/resources/clinical-trial-abstract.pdf'
            }
          ],
          isUserRegistered: false,
          feedback: {
            rating: 4.6,
            comments: 42
          }
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading event data:', error);
    }
    setLoading(false);
  };

  const registerForEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      if (event.registeredCount >= (event.maxParticipants || Infinity)) {
        toast({
          title: "Event Full",
          description: "This event is full, but you've been added to the waitlist.",
        });
        return;
      }

      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, registeredCount: e.registeredCount + 1, isUserRegistered: true }
          : e
      ));

      toast({
        title: "Registration Successful",
        description: `You've been registered for "${event.title}".`,
      });
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register for the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const unregisterFromEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1), isUserRegistered: false }
          : e
      ));

      toast({
        title: "Unregistered",
        description: `You've been unregistered from "${event.title}".`,
      });
    } catch (error) {
      console.error('Error unregistering from event:', error);
      toast({
        title: "Error",
        description: "Failed to unregister from the event.",
        variant: "destructive",
      });
    }
  };

  const createEvent = async () => {
    try {
      if (!newEvent.title || !newEvent.description || !newEvent.scheduledFor) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const event: CommunityEvent = {
        id: `event_${Date.now()}`,
        title: newEvent.title,
        description: newEvent.description,
        type: newEvent.type as any,
        organizer: {
          id: user?.uid || '',
          name: user?.displayName || 'Anonymous',
          avatar: user?.photoURL || undefined,
          expertise: []
        },
        scheduledFor: new Date(newEvent.scheduledFor),
        duration: newEvent.duration,
        maxParticipants: newEvent.maxParticipants,
        registeredCount: 0,
        waitlistCount: 0,
        isVirtual: newEvent.isVirtual,
        requiresApproval: false,
        tags: newEvent.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        targetAudience: [newEvent.targetAudience],
        resources: [],
        isUserRegistered: false
      };

      setEvents(prev => [event, ...prev]);
      setShowCreateDialog(false);
      setNewEvent({
        title: '',
        description: '',
        type: 'webinar',
        scheduledFor: '',
        duration: 60,
        isVirtual: true,
        maxParticipants: 25,
        tags: '',
        targetAudience: 'All Experience Levels'
      });

      toast({
        title: "Event Created",
        description: "Your event has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'webinar': return <TrendingUp className="h-4 w-4" />;
      case 'support_group': return <Users className="h-4 w-4" />;
      case 'qa_session': return <MessageCircle className="h-4 w-4" />;
      case 'workshop': return <Lightbulb className="h-4 w-4" />;
      case 'social': return <Heart className="h-4 w-4" />;
      case 'research_presentation': return <Star className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'webinar': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'support_group': return 'bg-green-100 text-green-800 border-green-200';
      case 'qa_session': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'workshop': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'social': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'research_presentation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true;
    if (filterType === 'registered') return event.isUserRegistered;
    return event.type === filterType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading events...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Events</h2>
          <p className="text-gray-600">Join educational workshops, support groups, and networking events.</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Events</option>
            <option value="registered">My Events</option>
            <option value="webinar">Webinars</option>
            <option value="support_group">Support Groups</option>
            <option value="workshop">Workshops</option>
            <option value="research_presentation">Research</option>
          </select>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Community Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Event Title</label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your event..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="webinar">Webinar</option>
                      <option value="support_group">Support Group</option>
                      <option value="workshop">Workshop</option>
                      <option value="qa_session">Q&A Session</option>
                      <option value="social">Social Event</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={newEvent.duration}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      min="15"
                      max="480"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Scheduled For</label>
                  <Input
                    type="datetime-local"
                    value={newEvent.scheduledFor}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    value={newEvent.tags}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="mold, environment, research..."
                  />
                </div>
                
                <Button onClick={createEvent} className="w-full">
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getEventTypeColor(event.type)}`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getEventTypeColor(event.type)}>
                              {event.type.replace('_', ' ')}
                            </Badge>
                            {event.cost && (
                              <Badge variant="outline">
                                ${event.cost}
                              </Badge>
                            )}
                            {event.requiresApproval && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Approval Required
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {event.feedback && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{event.feedback.rating}</span>
                            <span>({event.feedback.comments} reviews)</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        Organized by {event.organizer.name}
                      </p>
                      
                      {event.organizer.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {event.organizer.expertise.map((exp, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {exp}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-700 mb-4">
                        {event.description}
                      </p>
                      
                      {/* Event Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {event.scheduledFor.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.scheduledFor.toLocaleTimeString()} ({event.duration}min)
                        </div>
                        <div className="flex items-center gap-1">
                          {event.isVirtual ? (
                            <>
                              <Globe className="h-4 w-4" />
                              Virtual
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4" />
                              In-Person
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.registeredCount}
                          {event.maxParticipants && ` / ${event.maxParticipants}`}
                          {event.waitlistCount > 0 && ` (+${event.waitlistCount} waitlist)`}
                        </div>
                      </div>

                      {/* Location for in-person events */}
                      {!event.isVirtual && event.location && (
                        <div className="text-sm text-gray-600 mb-3">
                          <strong>Location:</strong> {event.location}
                        </div>
                      )}

                      {/* Registration deadline */}
                      {event.registrationDeadline && (
                        <div className="text-sm text-gray-600 mb-3">
                          <strong>Registration Deadline:</strong> {event.registrationDeadline.toLocaleDateString()}
                        </div>
                      )}
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {event.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Target Audience */}
                      <div className="text-xs text-gray-600 mb-3">
                        <span className="font-medium">Target Audience:</span> {event.targetAudience.join(', ')}
                      </div>

                      {/* Resources */}
                      {event.resources.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Event Resources:</p>
                          <div className="space-y-1">
                            {event.resources.map((resource, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-blue-600">
                                <span className="capitalize">{resource.type}:</span>
                                <span className="underline">{resource.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="ml-4 flex flex-col gap-2">
                  {event.isUserRegistered ? (
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-green-200 text-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Registered
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => unregisterFromEvent(event.id)}
                      >
                        Unregister
                      </Button>
                      {event.isVirtual && event.meetingLink && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Video className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => registerForEvent(event.id)}
                      disabled={event.registeredCount >= (event.maxParticipants || Infinity)}
                    >
                      {event.registeredCount >= (event.maxParticipants || Infinity) ? (
                        <>
                          <Users className="h-4 w-4 mr-1" />
                          Join Waitlist
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Register
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-1" />
                    Remind Me
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600">
              {filterType === 'registered' 
                ? "You haven't registered for any events yet."
                : "No events match your current filter. Try adjusting your selection."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};