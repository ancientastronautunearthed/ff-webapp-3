import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DoctorProfileForm } from '@/components/DoctorProfileForm';
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  Activity,
  Stethoscope,
  FileText,
  MessageCircle,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  LogOut,
  User
} from 'lucide-react';

interface StateStatistics {
  state: string;
  totalUsers: number;
  activeUsers: number;
  newThisMonth: number;
  avgSymptomSeverity: number;
  commonSymptoms: string[];
}

interface ResearchInsight {
  id: string;
  title: string;
  category: 'correlation' | 'treatment' | 'demographic' | 'geographic';
  significance: 'high' | 'medium' | 'low';
  description: string;
  dataPoints: number;
  lastUpdated: string;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [stateStats, setStateStats] = useState<StateStatistics[]>([]);
  const [researchInsights, setResearchInsights] = useState<ResearchInsight[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [activeConsultations, setActiveConsultations] = useState(0);

  // Fetch doctor profile
  const { data: doctorProfileData, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/doctors/profile'],
    enabled: !!user
  });

  // Update doctor profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: any) => 
      fetch('/api/doctors/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update profile');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors/profile'] });
      toast({
        title: "Profile Updated",
        description: "Your doctor profile has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    loadDoctorData();
  }, [user]);

  const loadDoctorData = async () => {
    // Check if this is a demo session
    const isDemo = localStorage.getItem('demoDoctor') === 'true';
    
    // Load doctor profile
    const profile = {
      firstName: isDemo ? 'Demo Dr. Sarah' : 'Dr. Sarah',
      lastName: 'Johnson',
      specialty: 'Dermatology',
      institution: 'Mayo Clinic',
      practiceStates: ['California', 'Nevada', 'Arizona'],
      verificationStatus: 'verified',
      morgellonsExperience: true,
      isDemo
    };
    setDoctorProfile(profile);

    // Load state statistics for doctor's practice states
    const mockStateStats: StateStatistics[] = [
      {
        state: 'California',
        totalUsers: 2847,
        activeUsers: 1923,
        newThisMonth: 156,
        avgSymptomSeverity: 6.2,
        commonSymptoms: ['Crawling sensations', 'Skin lesions', 'Fatigue']
      },
      {
        state: 'Nevada',
        totalUsers: 432,
        activeUsers: 298,
        newThisMonth: 23,
        avgSymptomSeverity: 5.8,
        commonSymptoms: ['Skin lesions', 'Joint pain', 'Sleep issues']
      },
      {
        state: 'Arizona',
        totalUsers: 756,
        activeUsers: 521,
        newThisMonth: 41,
        avgSymptomSeverity: 6.4,
        commonSymptoms: ['Fatigue', 'Crawling sensations', 'Brain fog']
      }
    ];
    setStateStats(mockStateStats);

    // Load research insights
    const mockInsights: ResearchInsight[] = [
      {
        id: '1',
        title: 'Weather Correlation Pattern Identified',
        category: 'correlation',
        significance: 'high',
        description: 'Strong correlation between humidity levels above 70% and symptom severity increases in desert climates.',
        dataPoints: 3847,
        lastUpdated: '2 hours ago'
      },
      {
        id: '2',
        title: 'Treatment Response Variation by Age Group',
        category: 'treatment',
        significance: 'medium',
        description: 'Patients aged 45-65 show 23% better response to topical treatments compared to other age groups.',
        dataPoints: 1923,
        lastUpdated: '6 hours ago'
      },
      {
        id: '3',
        title: 'Geographic Cluster Analysis',
        category: 'geographic',
        significance: 'high',
        description: 'Higher concentration of cases in areas with specific soil mineral compositions.',
        dataPoints: 5621,
        lastUpdated: '1 day ago'
      },
      {
        id: '4',
        title: 'Comorbidity Pattern Discovery',
        category: 'demographic',
        significance: 'medium',
        description: 'Significant association with autoimmune conditions in 34% of documented cases.',
        dataPoints: 2156,
        lastUpdated: '2 days ago'
      }
    ];
    setResearchInsights(mockInsights);

    // Calculate totals
    const totalUsers = mockStateStats.reduce((sum, state) => sum + state.totalUsers, 0);
    setTotalPatients(totalUsers);
    setActiveConsultations(8); // Mock active consultations
  };

  const handleLogout = () => {
    // Clear doctor session data
    localStorage.removeItem('userRole');
    localStorage.removeItem('demoDoctor');
    
    toast({
      title: "Logged Out",
      description: "You have been logged out of the doctor portal.",
    });
    
    // Redirect to login
    window.location.href = '/';
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'correlation': return TrendingUp;
      case 'treatment': return Stethoscope;
      case 'demographic': return Users;
      case 'geographic': return MapPin;
      default: return BarChart3;
    }
  };

  if (!doctorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medical dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Stethoscope className="h-8 w-8 text-blue-600" />
                Medical Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {doctorProfile.firstName} {doctorProfile.lastName} - {doctorProfile.specialty}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                {doctorProfile?.isDemo ? 'Demo Account' : 'Verified Physician'}
              </Badge>
              <Link href="/ask-doctor">
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask a Doctor Forum
                </Button>
              </Link>
              {doctorProfile?.isDemo && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  Demo Mode - Sample Data
                </Badge>
              )}
              <Button variant="outline" onClick={handleLogout} className="ml-auto">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPatients.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">In your practice states</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Consultations</p>
                  <p className="text-2xl font-bold text-gray-900">{activeConsultations}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Pending responses</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stateStats.reduce((sum, state) => sum + state.newThisMonth, 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Symptom Severity</p>
                  <p className="text-2xl font-bold text-gray-900">6.1</p>
                </div>
                <Activity className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Across all states</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="state-overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="state-overview">State Overview</TabsTrigger>
            <TabsTrigger value="research-insights">Research Insights</TabsTrigger>
            <TabsTrigger value="consultation-queue">Consultation Queue</TabsTrigger>
          </TabsList>

          <TabsContent value="state-overview" className="space-y-6">
            <div className="grid gap-6">
              {stateStats.map((stateStat) => (
                <Card key={stateStat.state} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      {stateStat.state}
                      <Badge variant="secondary" className="ml-auto">
                        {stateStat.totalUsers} total users
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Active Users</span>
                            <span className="font-medium">{stateStat.activeUsers}</span>
                          </div>
                          <Progress 
                            value={(stateStat.activeUsers / stateStat.totalUsers) * 100} 
                            className="h-2"
                          />
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Avg Severity</span>
                            <span className="font-medium">{stateStat.avgSymptomSeverity}/10</span>
                          </div>
                          <Progress 
                            value={stateStat.avgSymptomSeverity * 10} 
                            className="h-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900">Most Common Symptoms</h4>
                        {stateStat.commonSymptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline" className="mr-2">
                            {symptom}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900">This Month</h4>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm">+{stateStat.newThisMonth} new users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{Math.round(stateStat.activeUsers * 0.8)} daily active</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="research-insights" className="space-y-6">
            <div className="grid gap-4">
              {researchInsights.map((insight) => {
                const IconComponent = getCategoryIcon(insight.category);
                return (
                  <Card 
                    key={insight.id} 
                    className={`border-l-4 ${getSignificanceColor(insight.significance)}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-white rounded-lg">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                              <Badge 
                                variant={insight.significance === 'high' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {insight.significance} significance
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{insight.dataPoints.toLocaleString()} data points</span>
                              <span>Updated {insight.lastUpdated}</span>
                              <span className="capitalize">{insight.category}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="consultation-queue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  Active Consultations
                  <Badge variant="secondary" className="ml-auto">
                    {activeConsultations} pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: activeConsultations }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Patient Query #{1000 + i}</h4>
                          <p className="text-sm text-gray-600">
                            Question about symptom management and treatment options
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {i < 3 ? `${2 + i} hours ago` : `${i - 2} days ago`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm">
                        Respond
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}