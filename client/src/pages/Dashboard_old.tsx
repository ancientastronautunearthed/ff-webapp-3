import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSymptomEntries } from '@/hooks/useSymptomData';
import { useJournalEntries } from '@/hooks/useJournalData';
import { getWeeklyStats } from '@/utils/symptomAnalysis';
import { 
  collection, 
  getDocs, 
  query, 
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WelcomeTour } from '@/components/WelcomeTour';
import { AIHealthCoach } from '@/components/AIHealthCoach';
import { SmartDailyCheckin } from '@/components/SmartDailyCheckin';
import { GamifiedProgress } from '@/components/GamifiedProgress';
import { DailyTaskList } from '@/components/DailyTaskList';
import { DailyCheckin } from '@/components/DailyCheckin';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  BookOpen, 
  Users, 
  FileText,
  Plus,
  Eye,
  Lightbulb,
  Target,
  Clock,
  ChevronRight,
  HelpCircle,
  CheckCircle
} from 'lucide-react';
import { PeerMatchingWidget } from '@/components/PeerMatchingWidget';
import { CompanionWidget } from '@/components/CompanionWidget';
import { ChallengeSystem } from '@/components/ChallengeSystem';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: symptomEntries } = useSymptomEntries();
  const { data: journalEntries } = useJournalEntries();
  const [showTour, setShowTour] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinCompleted, setCheckinCompleted] = useState(false);



  useEffect(() => {
    // Don't auto-show tour, only show when user clicks button
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    // Removed auto-show for better UX
    
    // Check if daily check-in was completed today
    checkDailyCheckinStatus();
  }, []);

  const checkDailyCheckinStatus = async () => {
    if (!user) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const checkinQuery = query(
        collection(db, 'dailyCheckins'),
        where('userId', '==', user.uid),
        where('timestamp', '>=', today),
        where('timestamp', '<', tomorrow)
      );

      const snapshot = await getDocs(checkinQuery);
      setCheckinCompleted(!snapshot.empty);
    } catch (error) {
      console.error('Error checking daily checkin status:', error);
    }
  };

  const completeTour = () => {
    console.log('completeTour called');
    localStorage.setItem('hasSeenDashboardTour', 'true');
    setShowTour(false);
    toast({
      title: "Welcome to Fiber Friends!",
      description: "You're all set to start tracking your health journey.",
    });
  };

  const skipTour = () => {
    console.log('skipTour called');
    localStorage.setItem('hasSeenDashboardTour', 'true');
    setShowTour(false);
  };

  const startTour = () => {
    setShowTour(true);
  };

  // Calculate real stats from Firebase data
  const weeklyData = symptomEntries ? getWeeklyStats(symptomEntries) : null;
  const todayStats = {
    entriesCompleted: weeklyData?.trackingDays || 0,
    totalEntries: 7, // Week target
    trackingStreak: weeklyData?.trackingDays || 0,
    completionRate: weeklyData?.completionRate || 0
  };

  // Load real insights from AI analysis
  const [recentInsights, setRecentInsights] = useState<any[]>([]);
  
  useEffect(() => {
    loadAIInsights();
  }, [user, symptomEntries, journalEntries]);

  const loadAIInsights = async () => {
    if (!user || !symptomEntries || !journalEntries) return;
    
    try {
      const response = await fetch('/api/ai/analyze-health-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          symptoms: symptomEntries.slice(0, 30),
          journals: journalEntries.slice(0, 20)
        })
      });

      if (response.ok) {
        const data = await response.json();
        const insights = (data.insights || []).slice(0, 3).map((insight: any) => ({
          type: insight.type,
          title: insight.title,
          description: insight.description,
          color: insight.priority === 'high' ? 'blue' : 'green',
          icon: insight.type === 'prediction' ? TrendingUp : Lightbulb
        }));
        setRecentInsights(insights);
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
      setRecentInsights([]); // Empty array when AI unavailable
    }
  };

  const quickActions = [
    {
      title: 'Track Today\'s Symptoms',
      description: 'Record your current symptoms and factors',
      href: '/tracker',
      icon: Heart,
      color: 'bg-primary-500 hover:bg-primary-600',
      urgent: todayStats.entriesCompleted < 3,
      type: 'link'
    },
    {
      title: 'Complete Daily Check-in',
      description: checkinCompleted ? 'Completed today!' : 'Quick health assessment',
      icon: Target,
      color: checkinCompleted ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600',
      urgent: !checkinCompleted,
      type: 'action',
      action: () => {
        console.log('Daily Check-in clicked!');
        setShowCheckin(true);
      }
    },
    {
      title: 'Add Journal Entry',
      description: 'Document observations in Digital Matchbox',
      href: '/journal',
      icon: BookOpen,
      color: 'bg-secondary-500 hover:bg-secondary-600',
      urgent: false,
      type: 'link'
    },
    {
      title: 'View Community',
      description: 'Connect with others and share experiences',
      href: '/community',
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600',
      urgent: false,
      type: 'link'
    },
    {
      title: 'Generate Report',
      description: 'Create provider-ready health summary',
      href: '/reports',
      icon: FileText,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      urgent: false,
      type: 'link'
    }
  ];

  const weeklyOverview = [
    { day: 'Mon', completed: true, symptoms: 4.2 },
    { day: 'Tue', completed: true, symptoms: 3.8 },
    { day: 'Wed', completed: true, symptoms: 4.1 },
    { day: 'Thu', completed: true, symptoms: 3.6 },
    { day: 'Fri', completed: true, symptoms: 3.9 },
    { day: 'Sat', completed: false, symptoms: 0 },
    { day: 'Sun', completed: false, symptoms: 0 }
  ];

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <>
      {showTour && (
        <WelcomeTour 
          onComplete={() => {
            console.log('Tour onComplete triggered');
            completeTour();
          }}
          onSkip={() => {
            console.log('Tour onSkip triggered');
            skipTour();
          }}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Good {getTimeOfDay()}, {user?.displayName || user?.email?.split('@')[0] || 'there'}!
          </h1>
          <p className="text-xl text-gray-600 mt-2">
            Here's your health tracking overview for today
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCheckin(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 daily-checkin-button"
          >
            <Target className="h-4 w-4 mr-2" />
            Daily Check-in
          </Button>
          <Button
            variant="outline"
            onClick={startTour}
            className="flex items-center gap-2"
            data-tour="take-tour-button"
          >
            <HelpCircle className="h-4 w-4" />
            Take Tour
          </Button>
        </div>
      </div>



      {/* Daily Task List - Main Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <DailyTaskList />
        </div>
        <div className="space-y-6">
          <SmartDailyCheckin />
          <AIHealthCoach />
          {/* AI Companion Widget */}
          <CompanionWidget />
        </div>
      </div>

      {/* Gamified Challenge System */}
      <div className="mb-8">
        <ChallengeSystem />
      </div>


      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8" data-tour="stats-cards">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Progress</p>
                <p className="text-2xl font-bold text-primary-600">
                  {todayStats.entriesCompleted}/{todayStats.totalEntries}
                </p>
              </div>
              <Activity className="h-8 w-8 text-primary-500" />
            </div>
            <Progress value={todayStats.completionRate} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tracking Streak</p>
                <p className="text-2xl font-bold text-secondary-600">{todayStats.trackingStreak} days</p>
              </div>
              <Target className="h-8 w-8 text-secondary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Symptoms</p>
                <p className="text-2xl font-bold text-yellow-600">4.1/10</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-purple-600">5/7 days</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-8" data-tour="quick-actions">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              
              if (action.type === 'action') {
                return (
                  <Card 
                    key={index} 
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => {
                      console.log('Daily Check-in card clicked');
                      action.action();
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {action.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Due today
                          </Badge>
                        )}
                        {action.title.includes('Check-in') && checkinCompleted && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                      <div className="flex items-center text-primary-600 text-sm font-medium">
                        <span className="group-hover:mr-2 transition-all">
                          {checkinCompleted && action.title.includes('Check-in') ? 'View details' : 'Get started'}
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              
              return (
                <Link key={index} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {action.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Due today
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                      <div className="flex items-center text-primary-600 text-sm font-medium">
                        <span className="group-hover:mr-2 transition-all">Get started</span>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Weekly Overview */}
          <Card data-tour="weekly-overview">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary-500" />
                This Week's Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end space-x-2">
                {weeklyOverview.map((day, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="text-xs font-medium text-gray-600">{day.day}</div>
                    <div 
                      className={`w-8 h-12 rounded-md flex items-end justify-center ${
                        day.completed 
                          ? 'bg-primary-500' 
                          : 'bg-gray-200 border-2 border-dashed border-gray-400'
                      }`}
                    >
                      {day.completed && (
                        <div 
                          className="w-6 bg-white rounded-sm mb-1"
                          style={{ height: `${(day.symptoms / 10) * 100}%` }}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.completed ? day.symptoms.toFixed(1) : '—'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View Detailed Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentInsights.length > 0 ? (
                recentInsights.map((insight, index) => {
                  const Icon = insight.icon;
                  return (
                    <div key={index} className={`p-3 rounded-lg ${
                      insight.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                      insight.color === 'green' ? 'bg-green-50 border-green-200' :
                      'bg-gray-50 border-gray-200'
                    } border`}>
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${
                          insight.color === 'blue' ? 'text-blue-600' :
                          insight.color === 'green' ? 'text-green-600' :
                          'text-gray-600'
                        }`} />
                        <div>
                          <p className={`font-medium text-sm ${
                            insight.color === 'blue' ? 'text-blue-800' :
                            insight.color === 'green' ? 'text-green-800' :
                            'text-gray-800'
                          }`}>
                            {insight.title}
                          </p>
                          <p className={`text-xs mt-1 ${
                            insight.color === 'blue' ? 'text-blue-600' :
                            insight.color === 'green' ? 'text-green-600' :
                            'text-gray-600'
                          }`}>
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 text-sm">
                    Start tracking to generate AI insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                Today's Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Evening symptom check</p>
                  <p className="text-xs text-yellow-600">Due in 3 hours</p>
                </div>
                <Button size="sm" variant="outline" className="border-yellow-400 text-yellow-700">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="text-sm font-medium text-blue-800">Take evening medication</p>
                  <p className="text-xs text-blue-600">Antihistamine</p>
                </div>
                <Button size="sm" variant="outline" className="border-blue-400 text-blue-700">
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Companion Widget */}
          <CompanionWidget />
          
          {/* Peer Matching Widget */}
          <PeerMatchingWidget />

          {/* Community Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Community Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    S
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New post in Coping with Itching</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    M
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">3 new replies to your post</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
              </div>
              <Link href="/community">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Users className="mr-2 h-4 w-4" />
                  View Community
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Daily Check-in Modal */}
      <DailyCheckin 
        isOpen={showCheckin} 
        onClose={() => setShowCheckin(false)}
        onComplete={() => {
          setCheckinCompleted(true);
          checkDailyCheckinStatus();
          toast({
            title: "Daily Check-in Complete!",
            description: "Your health data has been recorded for today.",
          });
        }}
      />
      </div>
    </>
  );
}
