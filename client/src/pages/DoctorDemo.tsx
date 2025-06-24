import React, { useEffect } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PatientCommunicationHub } from '@/components/PatientCommunicationHub';
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
import { demoDoctor, demoPatientsData } from '@/data/demoDoctor';

export default function DoctorDemo() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Set demo doctor role
    localStorage.setItem('userRole', 'doctor');
    localStorage.setItem('demoDoctor', 'true');
    
    toast({
      title: "Doctor Demo Mode",
      description: "You are now viewing the doctor dashboard with sample data",
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('demoDoctor');
    window.location.href = '/';
  };

  const stateStats = [
    {
      state: 'California',
      totalUsers: 1247,
      activeUsers: 892,
      newThisMonth: 156,
      avgSymptomSeverity: 4.2,
      commonSymptoms: ['Skin irritation', 'Joint pain', 'Fatigue']
    },
    {
      state: 'Texas',
      totalUsers: 1089,
      activeUsers: 743,
      newThisMonth: 134,
      avgSymptomSeverity: 4.7,
      commonSymptoms: ['Crawling sensations', 'Skin lesions', 'Anxiety']
    },
    {
      state: 'Florida',
      totalUsers: 897,
      activeUsers: 612,
      newThisMonth: 98,
      avgSymptomSeverity: 4.1,
      commonSymptoms: ['Fatigue', 'Cognitive issues', 'Sleep problems']
    }
  ];

  const researchInsights = [
    {
      id: '1',
      title: 'Weather Correlation with Symptom Flares',
      category: 'correlation' as const,
      significance: 'high' as const,
      description: 'Strong correlation between barometric pressure changes and joint pain severity',
      dataPoints: 12450,
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      title: 'Environmental Trigger Analysis',
      category: 'treatment' as const,
      significance: 'medium' as const,
      description: 'Patients show 34% improvement with humidity control measures',
      dataPoints: 8900,
      lastUpdated: '2024-01-12'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Fiber Friends - Doctor Portal</h1>
                <p className="text-sm text-gray-600">Demo Dashboard</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Demo Mode
            </Badge>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{demoDoctor.name}</span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Exit Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="communication">Messages</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Patients</p>
                      <p className="text-2xl font-bold text-gray-900">3,233</p>
                      <p className="text-xs text-green-600 mt-1">+388 this month</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">2,247</p>
                      <p className="text-xs text-green-600 mt-1">89% retention</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Severity</p>
                      <p className="text-2xl font-bold text-gray-900">4.3/10</p>
                      <p className="text-xs text-orange-600 mt-1">-0.2 this week</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Research Contributions</p>
                      <p className="text-2xl font-bold text-gray-900">89%</p>
                      <p className="text-xs text-blue-600 mt-1">consent rate</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* State Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stateStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{stat.state}</h4>
                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">{stat.totalUsers}</span> total users
                          </div>
                          <div>
                            <span className="font-medium">{stat.activeUsers}</span> active
                          </div>
                          <div>
                            <span className="font-medium">+{stat.newThisMonth}</span> new
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">Avg severity:</span>
                          <Badge variant="outline" className={
                            stat.avgSymptomSeverity > 4.5 ? 'text-red-700 bg-red-50' :
                            stat.avgSymptomSeverity > 3.5 ? 'text-orange-700 bg-orange-50' :
                            'text-green-700 bg-green-50'
                          }>
                            {stat.avgSymptomSeverity}/10
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Common symptoms:</p>
                        <div className="space-y-1">
                          {stat.commonSymptoms.slice(0, 3).map((symptom, i) => (
                            <Badge key={i} variant="secondary" className="text-xs mr-1">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Overview</CardTitle>
                <p className="text-sm text-gray-600">Comprehensive patient management and communication</p>
              </CardHeader>
              <CardContent>
                <PatientCommunicationHub />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Research Tab */}
          <TabsContent value="research" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Research Insights</CardTitle>
                <p className="text-sm text-gray-600">Latest findings from patient data analysis</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {researchInsights.map((insight) => (
                    <div key={insight.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <Badge variant="outline" className={
                          insight.significance === 'high' ? 'text-red-700 bg-red-50' :
                          insight.significance === 'medium' ? 'text-orange-700 bg-orange-50' :
                          'text-green-700 bg-green-50'
                        }>
                          {insight.significance} significance
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{insight.dataPoints.toLocaleString()} data points</span>
                        <span>Updated {insight.lastUpdated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Communications</CardTitle>
                <p className="text-sm text-gray-600">Secure messaging and consultation management</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Communication Hub</h3>
                  <p className="text-gray-600">Secure messaging system for patient consultation</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Profile</CardTitle>
                <p className="text-sm text-gray-600">Manage your professional information and credentials</p>
              </CardHeader>
              <CardContent>
                <DoctorProfileForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}