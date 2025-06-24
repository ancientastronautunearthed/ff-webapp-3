import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  UserCheck, 
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  MapPin,
  Calendar,
  AlertCircle,
  Handshake,
  Brain,
  Zap
} from 'lucide-react';

interface PeerConnection {
  id: string;
  userId: string;
  connectedUser: {
    id: string;
    name: string;
    avatar?: string;
    location: string;
    companionTier: number;
    experienceLevel: string;
    specializations: string[];
    lastActive: Date;
  };
  connectionType: 'peer_support' | 'mentor_mentee' | 'research_partner' | 'local_buddy';
  status: 'pending' | 'accepted' | 'declined';
  requestedAt: Date;
  acceptedAt?: Date;
  matchScore: number;
  sharedInterests: string[];
  communicationPreferences: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    preferredTimes: string[];
    methods: ('messaging' | 'video' | 'phone' | 'email')[];
  };
  connectionGoals: string[];
  notes?: string;
}

interface ConnectionRequest {
  id: string;
  fromUser: {
    id: string;
    name: string;
    avatar?: string;
    location: string;
    experienceLevel: string;
    bio: string;
  };
  toUserId: string;
  connectionType: string;
  message: string;
  requestedAt: Date;
  status: 'pending';
}

interface ConnectionRecommendation {
  user: {
    id: string;
    name: string;
    avatar?: string;
    location: string;
    experienceLevel: string;
    specializations: string[];
    bio: string;
  };
  matchScore: number;
  reasons: string[];
  sharedSymptoms: string[];
  sharedInterests: string[];
  recommendationType: 'high_match' | 'local_support' | 'mentor_opportunity' | 'research_partner';
}

export const PeerConnectionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<PeerConnection[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [recommendations, setRecommendations] = useState<ConnectionRecommendation[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<PeerConnection | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnectionData();
  }, [user]);

  const loadConnectionData = async () => {
    setLoading(true);
    try {
      // Load existing connections
      const mockConnections: PeerConnection[] = [
        {
          id: 'conn_1',
          userId: user?.uid || '',
          connectedUser: {
            id: 'user_1',
            name: 'Sarah Chen',
            avatar: null,
            location: 'San Francisco, CA',
            companionTier: 5,
            experienceLevel: 'experienced',
            specializations: ['Environmental Triggers', 'Biofilm Protocols'],
            lastActive: new Date(Date.now() - 30 * 60 * 1000)
          },
          connectionType: 'research_partner',
          status: 'accepted',
          requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          acceptedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          matchScore: 92,
          sharedInterests: ['Environmental Science', 'Research', 'Data Analysis'],
          communicationPreferences: {
            frequency: 'weekly',
            preferredTimes: ['Evening', 'Weekend'],
            methods: ['messaging', 'video']
          },
          connectionGoals: ['Share research findings', 'Collaborate on environmental studies', 'Support each other through flares'],
          notes: 'Connected through environmental triggers discussion. Very knowledgeable about mold testing.'
        }
      ];

      // Load pending requests
      const mockRequests: ConnectionRequest[] = [
        {
          id: 'req_1',
          fromUser: {
            id: 'user_2',
            name: 'Michael Rodriguez',
            avatar: null,
            location: 'Austin, TX',
            experienceLevel: 'intermediate',
            bio: 'Father of two working through workplace exposure challenges. Looking for practical support and guidance.'
          },
          toUserId: user?.uid || '',
          connectionType: 'peer_support',
          message: 'Hi! I saw your posts about managing symptoms while working. I\'m dealing with similar challenges and would love to connect for mutual support.',
          requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'pending'
        }
      ];

      // Load AI-powered recommendations
      const mockRecommendations: ConnectionRecommendation[] = [
        {
          user: {
            id: 'user_3',
            name: 'Dr. Elena Martinez',
            avatar: null,
            location: 'Phoenix, AZ',
            experienceLevel: 'mentor',
            specializations: ['Medical Advocacy', 'Research Interpretation', 'Healthcare Navigation'],
            bio: 'Former physician turned patient advocate. Helping others navigate the medical system with Morgellons.'
          },
          matchScore: 88,
          reasons: [
            'Both interested in medical advocacy',
            'Similar research interests',
            'High helpfulness score',
            'Experienced mentor available'
          ],
          sharedSymptoms: ['Neurological symptoms', 'Fatigue'],
          sharedInterests: ['Medical Research', 'Patient Advocacy', 'Education'],
          recommendationType: 'mentor_opportunity'
        },
        {
          user: {
            id: 'user_4',
            name: 'James Wilson',
            avatar: null,
            location: 'Portland, OR',
            experienceLevel: 'new',
            specializations: [],
            bio: 'Recently diagnosed and looking for guidance. Interested in natural approaches and building a support network.'
          },
          matchScore: 75,
          reasons: [
            'Located in Pacific Northwest',
            'Similar interest in natural approaches',
            'Could benefit from your experience',
            'Active in community discussions'
          ],
          sharedSymptoms: ['Skin issues', 'Sleep problems'],
          sharedInterests: ['Natural Healing', 'Support Groups'],
          recommendationType: 'local_support'
        }
      ];

      setConnections(mockConnections);
      setRequests(mockRequests);
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error loading connection data:', error);
    }
    setLoading(false);
  };

  const acceptConnectionRequest = async (requestId: string) => {
    try {
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast({
        title: "Connection Accepted",
        description: "You've successfully connected with this member.",
      });
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast({
        title: "Error",
        description: "Failed to accept connection request.",
        variant: "destructive",
      });
    }
  };

  const declineConnectionRequest = async (requestId: string) => {
    try {
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast({
        title: "Request Declined",
        description: "The connection request has been declined.",
      });
    } catch (error) {
      console.error('Error declining connection:', error);
      toast({
        title: "Error",
        description: "Failed to decline connection request.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (connectionId: string) => {
    if (!messageText.trim()) return;

    try {
      // In real implementation, this would send the message through the system
      console.log('Sending message:', { connectionId, message: messageText });
      
      setMessageText('');
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const connectWithRecommendation = async (userId: string, type: string) => {
    try {
      // In real implementation, this would send a connection request
      console.log('Sending connection request:', { userId, type });
      
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent.",
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request.",
        variant: "destructive",
      });
    }
  };

  const getConnectionTypeColor = (type: string) => {
    switch (type) {
      case 'peer_support': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mentor_mentee': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'research_partner': return 'bg-green-100 text-green-800 border-green-200';
      case 'local_buddy': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case 'high_match': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'local_support': return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'mentor_opportunity': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'research_partner': return <Zap className="h-4 w-4 text-green-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading connections...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Requests */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Connection Requests
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                {requests.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={request.fromUser.avatar} />
                        <AvatarFallback>
                          {request.fromUser.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{request.fromUser.name}</h3>
                          <Badge className={getConnectionTypeColor(request.connectionType)}>
                            {request.connectionType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {request.fromUser.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {request.fromUser.experienceLevel}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {request.requestedAt.toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{request.fromUser.bio}</p>
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                          <p className="text-sm text-blue-800">"{request.message}"</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        onClick={() => acceptConnectionRequest(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => declineConnectionRequest(request.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-green-500" />
            My Connections
            <Badge className="bg-green-100 text-green-800 border-green-200">
              {connections.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connections.length > 0 ? (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div key={connection.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={connection.connectedUser.avatar} />
                        <AvatarFallback>
                          {connection.connectedUser.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{connection.connectedUser.name}</h3>
                          <Badge className={getConnectionTypeColor(connection.connectionType)}>
                            {connection.connectionType.replace('_', ' ')}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-gray-600">{connection.matchScore}% match</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {connection.connectedUser.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {connection.connectedUser.experienceLevel}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Connected {connection.acceptedAt?.toLocaleDateString()}
                          </div>
                        </div>
                        
                        {/* Specializations */}
                        {connection.connectedUser.specializations.length > 0 && (
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1">
                              {connection.connectedUser.specializations.map((spec, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Shared Interests */}
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Shared Interests:</p>
                          <div className="flex flex-wrap gap-1">
                            {connection.sharedInterests.map((interest, idx) => (
                              <Badge key={idx} className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Connection Goals */}
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Connection Goals:</p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {connection.connectionGoals.map((goal, idx) => (
                              <li key={idx}>{goal}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Notes */}
                        {connection.notes && (
                          <div className="bg-gray-50 border border-gray-200 rounded p-2 mb-3">
                            <p className="text-xs text-gray-700">{connection.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Send Message to {connection.connectedUser.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Type your message..."
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              rows={4}
                            />
                            <Button 
                              onClick={() => sendMessage(connection.id)}
                              disabled={!messageText.trim()}
                              className="w-full"
                            >
                              Send Message
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Handshake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Connections Yet</h3>
              <p className="text-gray-600 text-sm">
                Start building your support network by connecting with community members below.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Recommended Connections
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              AI Powered
            </Badge>
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Based on your profile, interests, and activity, here are connections that might be valuable.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={rec.user.avatar} />
                      <AvatarFallback>
                        {rec.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{rec.user.name}</h3>
                        {getRecommendationTypeIcon(rec.recommendationType)}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">{rec.matchScore}% match</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {rec.user.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {rec.user.experienceLevel}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{rec.user.bio}</p>
                      
                      {/* Why Recommended */}
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Why recommended:</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside">
                          {rec.reasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Shared Elements */}
                      <div className="flex gap-4">
                        {rec.sharedSymptoms.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Shared Symptoms:</p>
                            <div className="flex flex-wrap gap-1">
                              {rec.sharedSymptoms.map((symptom, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {rec.sharedInterests.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Shared Interests:</p>
                            <div className="flex flex-wrap gap-1">
                              {rec.sharedInterests.map((interest, idx) => (
                                <Badge key={idx} className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connect Button */}
                  <div className="ml-4">
                    <Button 
                      size="sm"
                      onClick={() => connectWithRecommendation(rec.user.id, rec.recommendationType)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};