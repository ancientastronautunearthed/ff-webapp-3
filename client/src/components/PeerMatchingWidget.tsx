import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  UserPlus,
  ArrowRight,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';

interface QuickMatch {
  id: string;
  name: string;
  avatar: string;
  matchPercentage: number;
  commonSymptoms: string[];
  isOnline: boolean;
}

export const PeerMatchingWidget = () => {
  const { user } = useAuth();
  const [quickMatches, setQuickMatches] = useState<QuickMatch[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);

  useEffect(() => {
    if (user) {
      loadQuickMatches();
    }
  }, [user]);

  const loadQuickMatches = async () => {
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
        console.error('Failed to load peer recommendations');
        setQuickMatches([]);
        setTotalMatches(0);
        return;
      }

      const data = await response.json();
      const recommendations = data.recommendations || [];
      
      // Convert AI recommendations to quick matches format
      const quickMatches: QuickMatch[] = recommendations.slice(0, 3).map((rec: any, index: number) => ({
        id: rec.targetUserId,
        name: `User ${index + 1}`, // Anonymous display for privacy
        avatar: '',
        matchPercentage: Math.round(rec.score),
        commonSymptoms: rec.reasons.slice(0, 2),
        isOnline: false // Real online status would require presence system
      }));

      setQuickMatches(quickMatches);
      setTotalMatches(data.totalEvaluated || 0);
      
    } catch (error) {
      console.error('Error loading quick matches:', error);
      setQuickMatches([]);
      setTotalMatches(0);
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Peer Matches
          <Badge variant="secondary" className="ml-auto">
            {totalMatches} potential matches
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-purple-600">{totalMatches}</div>
            <div className="text-xs text-gray-500">Total Matches</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">8</div>
            <div className="text-xs text-gray-500">Active Chats</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">23</div>
            <div className="text-xs text-gray-500">Connections</div>
          </div>
        </div>

        {/* Top Matches Preview */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Top Matches For You</h4>
          {quickMatches.map((match) => (
            <div key={match.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={match.avatar} alt={match.name} />
                  <AvatarFallback>{match.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {match.isOnline && (
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{match.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {match.matchPercentage}%
                  </Badge>
                </div>
                <div className="flex gap-1 mt-1">
                  {match.commonSymptoms.slice(0, 2).map((symptom, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="bg-purple-50 rounded-lg p-3 space-y-2">
          <h5 className="text-sm font-medium text-purple-900">Smart Matching Features</h5>
          <div className="space-y-1 text-xs text-purple-700">
            <div className="flex items-center gap-2">
              <Heart className="h-3 w-3" />
              <span>Symptom-based compatibility</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-3 w-3" />
              <span>Interest & support type matching</span>
            </div>
            <div className="flex items-center gap-2">
              <UserPlus className="h-3 w-3" />
              <span>Privacy-focused connections</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Link href="/peer-matching">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Users className="h-4 w-4 mr-2" />
              View All Matches
            </Button>
          </Link>
          <Link href="/peer-matching?tab=preferences">
            <Button variant="outline" className="w-full">
              Update Preferences
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};