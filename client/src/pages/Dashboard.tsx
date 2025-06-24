import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Home,
  Activity,
  Brain,
  Users,
  Calendar,
  MessageSquare,
  Stethoscope,
  BarChart3,
  Settings,
  Menu,
  X,
  Plus,
  Target,
  Award,
  Heart,
  Zap,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

// Import existing components
import { DailyTaskList } from '@/components/DailyTaskList';
import { SymptomTracker } from '@/components/SymptomTracker';
import { DigitalMatchbox } from '@/components/DigitalMatchbox';
import { AIHealthCoach } from '@/components/AIHealthCoach';
import { AIInsights } from '@/components/AIInsights';
import { CommunityForum } from '@/components/CommunityForum';
import { PeerMatching } from '@/components/PeerMatching';
import CalendarView from '@/pages/CalendarView';
import { DataVisualization } from '@/components/DataVisualization';
import { GamifiedProgress } from '@/components/GamifiedProgress';
import { CompanionWidget } from '@/components/CompanionWidget';
import { TelemedicineScheduling } from '@/components/TelemedicineScheduling';
import { ResearchDashboardEnhanced } from '@/components/ResearchDashboardEnhanced';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component?: React.ComponentType;
  badge?: string;
  description?: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const navigationSections: NavigationSection[] = [
  {
    title: "Overview",
    items: [
      {
        id: 'home',
        label: 'Dashboard Home',
        icon: Home,
        description: 'Daily tasks, quick actions, and overview'
      }
    ]
  },
  {
    title: "Health Tracking",
    items: [
      {
        id: 'symptoms',
        label: 'Symptom Tracker',
        icon: Activity,
        component: SymptomTracker,
        description: 'Log and track your symptoms'
      },
      {
        id: 'journal',
        label: 'Digital Matchbox',
        icon: MessageSquare,
        component: DigitalMatchbox,
        description: 'Private journal and observations'
      },
      {
        id: 'calendar',
        label: 'Calendar View',
        icon: Calendar,
        component: CalendarView,
        description: 'Monthly overview and yearly heatmap'
      },
      {
        id: 'data-viz',
        label: 'Data & Insights',
        icon: BarChart3,
        component: DataVisualization,
        description: 'Charts and pattern analysis'
      }
    ]
  },
  {
    title: "AI & Support",
    items: [
      {
        id: 'ai-coach',
        label: 'AI Health Coach',
        icon: Brain,
        component: AIHealthCoach,
        description: 'Personalized health insights'
      },
      {
        id: 'ai-insights',
        label: 'AI Insights',
        icon: Zap,
        component: AIInsights,
        description: 'Pattern detection and predictions'
      },
      {
        id: 'companion',
        label: 'AI Companion',
        icon: Heart,
        description: 'Your personal health companion'
      }
    ]
  },
  {
    title: "Community",
    items: [
      {
        id: 'forum',
        label: 'Community Forum',
        icon: Users,
        component: CommunityForum,
        description: 'Connect with others'
      },
      {
        id: 'peer-matching',
        label: 'Peer Matching',
        icon: Target,
        component: PeerMatching,
        description: 'Find compatible connections'
      },
      {
        id: 'progress',
        label: 'Rewards & Progress',
        icon: Award,
        component: GamifiedProgress,
        description: 'Achievements and challenges'
      }
    ]
  },
  {
    title: "Professional Care",
    items: [
      {
        id: 'telemedicine',
        label: 'Find Support',
        icon: Stethoscope,
        component: TelemedicineScheduling,
        description: 'Schedule appointments with doctors'
      }
    ]
  },
  {
    title: "Research",
    items: [
      {
        id: 'research',
        label: 'Research Dashboard',
        icon: TrendingUp,
        component: ResearchDashboardEnhanced,
        description: 'Contribute to research studies'
      }
    ]
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ActiveComponent = navigationSections
    .flatMap(section => section.items)
    .find(item => item.id === activeSection)?.component;

  const renderHomeView = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.displayName || 'User'}!
            </h2>
            <p className="text-gray-600 mt-1">
              Let's continue your health journey together
            </p>
          </div>
          <CompanionWidget />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-xl font-semibold">5 Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-xl font-semibold">12 Days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Points</p>
                <p className="text-xl font-semibold">2,450</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Connections</p>
                <p className="text-xl font-semibold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Tasks - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Today's Health Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DailyTaskList />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => setActiveSection('symptoms')} 
                className="w-full justify-start" 
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Log Symptoms
              </Button>
              <Button 
                onClick={() => setActiveSection('journal')} 
                className="w-full justify-start" 
                variant="outline"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Journal Entry
              </Button>
              <Button 
                onClick={() => setActiveSection('ai-coach')} 
                className="w-full justify-start" 
                variant="outline"
              >
                <Brain className="h-4 w-4 mr-2" />
                Get AI Insights
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Symptom entry logged</span>
                  <span className="text-gray-500 ml-auto">2h ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Journal entry added</span>
                  <span className="text-gray-500 ml-auto">1d ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>New connection made</span>
                  <span className="text-gray-500 ml-auto">2d ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderSidebarItem = (item: NavigationItem) => (
    <button
      key={item.id}
      onClick={() => {
        setActiveSection(item.id);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
        activeSection === item.id
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-700 hover:bg-gray-100'
      } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
      title={sidebarCollapsed ? item.label : undefined}
    >
      <item.icon className={`h-5 w-5 flex-shrink-0 ${
        activeSection === item.id ? 'text-blue-600' : 'text-gray-500'
      }`} />
      {!sidebarCollapsed && (
        <>
          <span className="font-medium truncate">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-72'
      } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Sidebar Header */}
        <div className={`p-4 border-b border-gray-200 ${sidebarCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">Fiber Friends</h1>
                  <p className="text-xs text-gray-500">Health Companion</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <nav className={`p-2 space-y-1 ${sidebarCollapsed ? 'px-1' : ''}`}>
            {navigationSections.map((section) => (
              <div key={section.title}>
                {!sidebarCollapsed && (
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map(renderSidebarItem)}
                </div>
                {!sidebarCollapsed && <Separator className="my-3" />}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'
      }`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {navigationSections
                    .flatMap(section => section.items)
                    .find(item => item.id === activeSection)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500">
                  {navigationSections
                    .flatMap(section => section.items)
                    .find(item => item.id === activeSection)?.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback>
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {activeSection === 'home' ? (
            renderHomeView()
          ) : ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Feature coming soon...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}