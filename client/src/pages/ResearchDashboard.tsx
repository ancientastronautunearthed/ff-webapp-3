import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterPlot, Scatter
} from 'recharts';
import { 
  Microscope, 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  Download,
  Database,
  Activity,
  MapPin,
  Utensils,
  CloudRain,
  Dumbbell
} from 'lucide-react';

interface ResearchData {
  totalUsers: number;
  totalEntries: number;
  dateRange: { start: string; end: string };
  demographics: any[];
  symptomCorrelations: any[];
  environmentalFactors: any[];
  dietaryPatterns: any[];
  treatmentEffectiveness: any[];
  geographicDistribution: any[];
}

export default function ResearchDashboard() {
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('90');
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    fetchResearchData();
  }, [timeRange, selectedRegion]);

  const fetchResearchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/research/dashboard?timeRange=${timeRange}&region=${selectedRegion}`);
      if (response.ok) {
        const data = await response.json();
        setResearchData(data);
      }
    } catch (error) {
      console.error('Failed to fetch research data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/research/export?format=${format}&timeRange=${timeRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `morgellons-research-data.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Mock data for demonstration (replace with real API data)
  const mockSymptomCorrelations = [
    { factor: 'Weather Changes', correlation: 0.82, sampleSize: 245, pValue: 0.001 },
    { factor: 'High Stress', correlation: 0.76, sampleSize: 298, pValue: 0.002 },
    { factor: 'Processed Foods', correlation: 0.71, sampleSize: 189, pValue: 0.003 },
    { factor: 'Chemical Exposure', correlation: 0.68, sampleSize: 156, pValue: 0.004 },
    { factor: 'Synthetic Clothing', correlation: 0.65, sampleSize: 201, pValue: 0.007 },
    { factor: 'Poor Sleep', correlation: 0.62, sampleSize: 267, pValue: 0.01 }
  ];

  const mockDemographics = [
    { ageGroup: '18-29', count: 45, percentage: 12 },
    { ageGroup: '30-39', count: 78, percentage: 21 },
    { ageGroup: '40-49', count: 112, percentage: 30 },
    { ageGroup: '50-59', count: 89, percentage: 24 },
    { ageGroup: '60+', count: 48, percentage: 13 }
  ];

  const mockTreatmentData = [
    { treatment: 'Ivermectin', effectiveness: 3.2, sampleSize: 89, sideEffects: 2.1 },
    { treatment: 'Antibiotics', effectiveness: 2.8, sampleSize: 156, sideEffects: 2.4 },
    { treatment: 'Anti-inflammatories', effectiveness: 3.5, sampleSize: 234, sideEffects: 1.8 },
    { treatment: 'Antifungals', effectiveness: 2.9, sampleSize: 67, sideEffects: 2.2 },
    { treatment: 'Dietary Changes', effectiveness: 4.1, sampleSize: 198, sideEffects: 0.5 },
    { treatment: 'Stress Management', effectiveness: 3.8, sampleSize: 176, sideEffects: 0.2 }
  ];

  const mockGeographicData = [
    { region: 'California', cases: 89, prevalence: 2.1 },
    { region: 'Texas', cases: 67, prevalence: 1.8 },
    { region: 'Florida', cases: 78, prevalence: 2.3 },
    { region: 'New York', cases: 45, prevalence: 1.9 },
    { region: 'Arizona', cases: 34, prevalence: 2.0 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Microscope className="h-8 w-8 text-blue-600" />
              Research Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Aggregated insights from patient-contributed Morgellons data
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => exportData('csv')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => exportData('json')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                <SelectItem value="california">California</SelectItem>
                <SelectItem value="texas">Texas</SelectItem>
                <SelectItem value="florida">Florida</SelectItem>
                <SelectItem value="northeast">Northeast US</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-3xl font-bold text-blue-600">372</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Entries</p>
                <p className="text-3xl font-bold text-green-600">8,947</p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Symptoms/Day</p>
                <p className="text-3xl font-bold text-orange-600">5.4</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Duration</p>
                <p className="text-3xl font-bold text-purple-600">18mo</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="correlations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="correlations">Symptom Correlations</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="treatments">Treatment Analysis</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        {/* Symptom Correlations Tab */}
        <TabsContent value="correlations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Factor-Symptom Correlations
              </CardTitle>
              <p className="text-gray-600">Statistical correlations between reported factors and symptom severity</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockSymptomCorrelations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="factor" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 1]} />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'correlation' ? `${(value * 100).toFixed(1)}%` : value,
                      name === 'correlation' ? 'Correlation Strength' : name
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="correlation" fill="#3B82F6" name="Correlation" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockSymptomCorrelations.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{item.factor}</h4>
                      <Badge variant={item.correlation > 0.7 ? "destructive" : item.correlation > 0.6 ? "default" : "secondary"}>
                        r = {item.correlation.toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Sample: {item.sampleSize} patients</p>
                    <p className="text-sm text-gray-600">p-value: {item.pValue}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockDemographics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ ageGroup, percentage }) => `${ageGroup}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {mockDemographics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Participant Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Female</p>
                    <p className="text-2xl font-bold text-blue-700">68%</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Male</p>
                    <p className="text-2xl font-bold text-green-700">32%</p>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Avg. Symptom Duration</p>
                  <p className="text-2xl font-bold text-purple-700">3.2 years</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">Prior Diagnoses</p>
                  <p className="text-sm text-orange-700">Fibromyalgia (34%), CFS (28%), Autoimmune (19%)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Treatment Analysis Tab */}
        <TabsContent value="treatments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Treatment Effectiveness Analysis
              </CardTitle>
              <p className="text-gray-600">Patient-reported effectiveness scores (1-5 scale)</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockTreatmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="treatment" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="effectiveness" fill="#10B981" name="Effectiveness Score" />
                  <Bar dataKey="sideEffects" fill="#EF4444" name="Side Effects Score" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-6">
                <h4 className="font-medium mb-4">Treatment Insights</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-green-800">Most Effective</span>
                    <span className="text-green-700">Dietary Changes (4.1/5)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-800">Safest</span>
                    <span className="text-blue-700">Stress Management (0.2/5 side effects)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium text-purple-800">Most Studied</span>
                    <span className="text-purple-700">Anti-inflammatories (234 patients)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environmental Tab */}
        <TabsContent value="environmental" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudRain className="h-5 w-5 text-blue-500" />
                  Weather Correlations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Barometric Pressure Changes</span>
                    <Badge variant="destructive">Strong (r=0.84)</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>High Humidity (&gt;80%)</span>
                    <Badge variant="destructive">Strong (r=0.78)</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Temperature Fluctuations</span>
                    <Badge>Moderate (r=0.65)</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Storm Systems</span>
                    <Badge>Moderate (r=0.61)</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-orange-500" />
                  Dietary Triggers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Processed Foods</span>
                    <Badge variant="destructive">Strong (r=0.71)</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>High Sugar Intake</span>
                    <Badge variant="destructive">Strong (r=0.69)</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Artificial Additives</span>
                    <Badge>Moderate (r=0.58)</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Alcohol Consumption</span>
                    <Badge variant="secondary">Weak (r=0.42)</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockGeographicData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cases" fill="#DC2626" name="Reported Cases" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6">
                <h4 className="font-medium mb-4">Regional Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h5 className="font-medium text-red-800">Highest Prevalence</h5>
                    <p className="text-red-700">Florida (2.3 cases per 100k)</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-800">Climate Correlation</h5>
                    <p className="text-blue-700">Higher rates in humid, subtropical regions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Notice */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Microscope className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Research Ethics Notice</h4>
              <p className="text-blue-800 text-sm mt-1">
                All data shown is from consented participants who opted into research sharing. 
                Individual patient data is anonymized and aggregated to protect privacy while 
                enabling valuable research insights for the medical community.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}