import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Database, 
  FileBarChart, 
  Download, 
  Shield, 
  Calendar,
  TrendingUp,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Activity,
  FileText,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock data for demonstration
const aggregatedStats = {
  totalParticipants: 1247,
  activeStudies: 8,
  dataPointsCollected: 45782,
  avgParticipationTime: "8.3 months",
  consentedDataTypes: {
    symptoms: 892,
    demographics: 1121,
    treatments: 734,
    journals: 456,
    location: 623
  }
};

const studyData = [
  {
    id: "MORG-2024-001",
    title: "Environmental Triggers in Morgellons Disease",
    pi: "Dr. Sarah Chen",
    institution: "Johns Hopkins University",
    participants: 156,
    status: "active",
    startDate: "2024-01-15",
    dataTypes: ["symptoms", "location", "demographics"],
    progress: 67
  },
  {
    id: "MORG-2024-002", 
    title: "Treatment Response Patterns Analysis",
    pi: "Dr. Michael Rodriguez",
    institution: "Mayo Clinic",
    participants: 203,
    status: "active",
    startDate: "2024-03-01",
    dataTypes: ["symptoms", "treatments", "demographics"],
    progress: 45
  },
  {
    id: "MORG-2023-005",
    title: "Long-term Symptom Progression Study",
    pi: "Dr. Jennifer Lee",
    institution: "Stanford Medicine", 
    participants: 89,
    status: "completed",
    startDate: "2023-06-01",
    dataTypes: ["symptoms", "journals", "treatments"],
    progress: 100
  }
];

const symptomTrends = [
  { month: 'Jan', avgSeverity: 6.2, participants: 234 },
  { month: 'Feb', avgSeverity: 5.8, participants: 267 },
  { month: 'Mar', avgSeverity: 6.1, participants: 289 },
  { month: 'Apr', avgSeverity: 5.9, participants: 312 },
  { month: 'May', avgSeverity: 6.3, participants: 334 },
  { month: 'Jun', avgSeverity: 6.0, participants: 356 }
];

const geographicData = [
  { region: 'West Coast', participants: 342, color: '#3B82F6' },
  { region: 'Southeast', participants: 298, color: '#10B981' },
  { region: 'Northeast', participants: 245, color: '#F59E0B' },
  { region: 'Midwest', participants: 189, color: '#EF4444' },
  { region: 'Southwest', participants: 173, color: '#8B5CF6' }
];

const treatmentEffectiveness = [
  { treatment: 'Antihistamines', responders: 67, nonResponders: 23, totalUsers: 90 },
  { treatment: 'Topical Antibiotics', responders: 45, nonResponders: 34, totalUsers: 79 },
  { treatment: 'Antifungals', responders: 38, nonResponders: 28, totalUsers: 66 },
  { treatment: 'Immunosuppressants', responders: 29, nonResponders: 15, totalUsers: 44 },
  { treatment: 'Alternative Medicine', responders: 52, nonResponders: 31, totalUsers: 83 }
];

export const ResearchDashboardEnhanced = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  const [selectedDataType, setSelectedDataType] = useState('all');
  const [loading, setLoading] = useState(false);

  const exportData = async (format: string) => {
    setLoading(true);
    try {
      // Here you would call your API to export data
      console.log(`Exporting data in ${format} format`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Analytics Dashboard</h1>
          <p className="text-xl text-gray-600 mt-2">
            Aggregated insights from patient-contributed data
          </p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportData('csv')} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            {loading ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-blue-600">{aggregatedStats.totalParticipants.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Studies</p>
                <p className="text-2xl font-bold text-green-600">{aggregatedStats.activeStudies}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Points</p>
                <p className="text-2xl font-bold text-purple-600">{aggregatedStats.dataPointsCollected.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Participation</p>
                <p className="text-2xl font-bold text-orange-600">{aggregatedStats.avgParticipationTime}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="studies">Active Studies</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="ethics">Ethics & Consent</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Consent Data Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-blue-500" />
                Consented Data Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                {Object.entries(aggregatedStats.consentedDataTypes).map(([type, count]) => (
                  <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600 capitalize">{type}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Symptom Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                Symptom Severity Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={symptomTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="avgSeverity" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Average Severity"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Effectiveness */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
                Treatment Response Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={treatmentEffectiveness}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="treatment" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="responders" fill="#10B981" name="Responders" />
                    <Bar dataKey="nonResponders" fill="#EF4444" name="Non-responders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="studies" className="space-y-6">
          <div className="grid gap-6">
            {studyData.map((study) => (
              <Card key={study.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{study.title}</h3>
                        <Badge variant={study.status === 'active' ? 'default' : 'secondary'}>
                          {study.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Principal Investigator:</span> {study.pi}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Institution:</span> {study.institution}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Study ID:</span> {study.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{study.participants}</p>
                      <p className="text-sm text-gray-500">participants</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      {study.dataTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Started {new Date(study.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${study.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{study.progress}% complete</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Advanced Analytics Content */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="font-semibold">87.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Data Accuracy</span>
                    <span className="font-semibold">94.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Consistency Score</span>
                    <span className="font-semibold">91.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Participation Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Daily Active Users</span>
                    <span className="font-semibold">342</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Weekly Retention</span>
                    <span className="font-semibold">78.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Session Length</span>
                    <span className="font-semibold">12.4 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-green-500" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={geographicData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ region, percent }) => `${region} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="participants"
                    >
                      {geographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid md:grid-cols-5 gap-4">
                {geographicData.map((region) => (
                  <div key={region.region} className="text-center">
                    <div 
                      className="w-4 h-4 rounded mx-auto mb-2" 
                      style={{ backgroundColor: region.color }}
                    ></div>
                    <p className="text-sm font-medium text-gray-900">{region.region}</p>
                    <p className="text-xs text-gray-500">{region.participants} participants</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ethics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  Consent Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valid Consents</span>
                    <span className="font-semibold text-green-600">100%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recent Withdrawals</span>
                    <span className="font-semibold">12 (0.96%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Consent Renewals Due</span>
                    <span className="font-semibold">23</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-blue-500" />
                  Data Privacy Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Anonymization Rate</span>
                    <span className="font-semibold text-green-600">100%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Access Audits</span>
                    <span className="font-semibold">Weekly</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Security Incidents</span>
                    <span className="font-semibold text-green-600">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>IRB Approvals & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studyData.map((study) => (
                  <div key={study.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{study.title}</p>
                      <p className="text-sm text-gray-600">{study.institution}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600">IRB Approved</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};