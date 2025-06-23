import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  TrendingUp,
  Plus,
  Star,
  Award,
  ThumbsUp,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: any;
  href: string;
  color: string;
}

interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  isCompleted: boolean;
}

export const CommunityEngagementWidget = () => {
  const { user } = useAuth();
  const [weeklyPoints, setWeeklyPoints] = useState(0);
  const [weeklyGoal] = useState(50);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<WeeklyMission[]>([]);

  useEffect(() => {
    loadEngagementData();
  }, []);

  const loadEngagementData = () => {
    // Quick actions to encourage engagement
    const actions: QuickAction[] = [
      {
        id: 'create_post',
        title: 'Share Your Experience',
        description: 'Start a new discussion',
        points: 20,
        icon: MessageCircle,
        href: '/community',
        color: 'bg-blue-500'
      },
      {
        id: 'help_someone',
        title: 'Help Someone Today',
        description: 'Reply to a question',
        points: 15,
        icon: Heart,
        href: '/community',
        color: 'bg-pink-500'
      },
      {
        id: 'give_support',
        title: 'Give Encouragement',
        description: 'Like helpful posts',
        points: 5,
        icon: ThumbsUp,
        href: '/community',
        color: 'bg-green-500'
      }
    ];

    // Weekly missions for sustained engagement
    const missions: WeeklyMission[] = [
      {
        id: 'weekly_posts',
        title: 'Active Contributor',
        description: 'Make 3 meaningful posts this week',
        progress: 1,
        target: 3,
        reward: '75 points + Community Builder badge',
        isCompleted: false
      },
      {
        id: 'help_others',
        title: 'Support Network',
        description: 'Help 5 community members',
        progress: 3,
        target: 5,
        reward: '100 points + Helper badge',
        isCompleted: false
      },
      {
        id: 'engagement_goal',
        title: 'Weekly Engagement',
        description: 'Earn 50 community points',
        progress: 32,
        target: 50,
        reward: '50 bonus points',
        isCompleted: false
      }
    ];

    setQuickActions(actions);
    setWeeklyMissions(missions);
    setWeeklyPoints(32); // Current week's points
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Community Engagement
          <Badge variant="secondary" className="ml-auto">
            {weeklyPoints}/{weeklyGoal} weekly points
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Weekly Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Weekly Goal Progress</span>
            <span>{Math.round((weeklyPoints / weeklyGoal) * 100)}%</span>
          </div>
          <Progress value={(weeklyPoints / weeklyGoal) * 100} className="h-2" />
          <p className="text-xs text-gray-500">
            {weeklyGoal - weeklyPoints} more points to reach your weekly goal!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Quick Actions
          </h4>
          <div className="grid gap-2">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link key={action.id} href={action.href}>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-gray-500">{action.description}</div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        +{action.points}
                      </Badge>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Weekly Missions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Weekly Missions
          </h4>
          <div className="space-y-3">
            {weeklyMissions.map((mission) => (
              <div key={mission.id} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-900">{mission.title}</h5>
                  <Badge variant={mission.isCompleted ? "default" : "secondary"} className="text-xs">
                    {mission.progress}/{mission.target}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">{mission.description}</p>
                <Progress value={(mission.progress / mission.target) * 100} className="h-1 mb-2" />
                <p className="text-xs text-blue-600 font-medium">Reward: {mission.reward}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Community Stats */}
        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">47</div>
              <div className="text-xs text-gray-500">Posts This Month</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">156</div>
              <div className="text-xs text-gray-500">People Helped</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 gap-2">
          <Link href="/community">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Join Community Discussion
            </Button>
          </Link>
          <Link href="/peer-matching">
            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Find Peer Matches
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};