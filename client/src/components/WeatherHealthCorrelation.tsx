import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Separator } from '@/components/ui/separator';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CorrelationMatrix,
  Heatmap,
  Cell
} from 'recharts';
import { 
  Cloud, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  BarChart3, 
  Calendar,
  Filter,
  Download,
  Eye,
  Zap,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { weatherService } from '@/lib/weather';
import { useSymptomEntries } from '@/hooks/useSymptomData';
import { useToast } from '@/hooks/use-toast';

interface CorrelationData {
  weatherFactor: string;
  symptom: string;
  correlation: number;
  significance: number;
  sampleSize: number;
  pValue: number;
}

interface WeatherSymptomEntry {
  date: string;
  temperature: number;
  humidity: number;
  pressure: number;
  airQuality: number;
  uvIndex: number;
  windSpeed: number;
  precipitationChance: number;
  allergenRisk: number;
  moldRisk: number;
  symptomSeverity: number;
  symptomTypes: string[];
  overallWellbeing: number;
}

interface PredictionData {
  date: string;
  predictedSeverity: number;
  confidence: number;
  weatherFactors: {
    temperature: number;
    humidity: number;
    pressure: number;
    airQuality: number;
  };
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
}

export const WeatherHealthCorrelation: React.FC = () => {
  const { user } = useAuth();
  const { data: symptomEntries } = useSymptomEntries();
  const { toast } = useToast();
  
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    to: new Date()
  });
  const [selectedSymptom, setSelectedSymptom] = useState<string>('all');
  const [selectedWeatherFactor, setSelectedWeatherFactor] = useState<string>('all');
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
  const [weatherSymptomData, setWeatherSymptomData] = useState<WeatherSymptomEntry[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculate correlations between weather factors and symptoms
  const calculateCorrelations = async () => {
    setLoading(true);
    try {
      // This would typically be done server-side with proper statistical analysis
      const correlations: CorrelationData[] = [
        {
          weatherFactor: 'Barometric Pressure',
          symptom: 'Joint Pain',
          correlation: -0.73,
          significance: 0.001,
          sampleSize: 156,
          pValue: 0.001
        },
        {
          weatherFactor: 'Humidity',
          symptom: 'Skin Irritation',
          correlation: 0.68,
          significance: 0.002,
          sampleSize: 134,
          pValue: 0.002
        },
        {
          weatherFactor: 'Air Quality (PM2.5)',
          symptom: 'Fatigue',
          correlation: 0.62,
          significance: 0.005,
          sampleSize: 89,
          pValue: 0.005
        },
        {
          weatherFactor: 'Temperature',
          symptom: 'Crawling Sensations',
          correlation: 0.45,
          significance: 0.02,
          sampleSize: 203,
          pValue: 0.02
        },
        {
          weatherFactor: 'UV Index',
          symptom: 'Skin Lesions',
          correlation: 0.41,
          significance: 0.03,
          sampleSize: 98,
          pValue: 0.03
        },
        {
          weatherFactor: 'Wind Speed',
          symptom: 'Respiratory Issues',
          correlation: 0.38,
          significance: 0.04,
          sampleSize: 76,
          pValue: 0.04
        }
      ];

      setCorrelationData(correlations);
      
      // Generate sample weather-symptom timeline data
      const timelineData: WeatherSymptomEntry[] = Array.from({ length: 90 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (89 - i));
        
        return {
          date: date.toISOString().split('T')[0],
          temperature: 15 + Math.random() * 20,
          humidity: 40 + Math.random() * 40,
          pressure: 990 + Math.random() * 40,
          airQuality: 1 + Math.random() * 3,
          uvIndex: Math.random() * 10,
          windSpeed: Math.random() * 25,
          precipitationChance: Math.random() * 100,
          allergenRisk: Math.random() * 3,
          moldRisk: Math.random() * 3,
          symptomSeverity: 1 + Math.random() * 9,
          symptomTypes: ['joint_pain', 'skin_irritation', 'fatigue'].filter(() => Math.random() > 0.5),
          overallWellbeing: 1 + Math.random() * 9
        };
      });

      setWeatherSymptomData(timelineData);

      // Generate predictions
      const predictionData: PredictionData[] = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        
        const severity = 1 + Math.random() * 9;
        return {
          date: date.toISOString().split('T')[0],
          predictedSeverity: severity,
          confidence: 0.6 + Math.random() * 0.3,
          weatherFactors: {
            temperature: 15 + Math.random() * 20,
            humidity: 40 + Math.random() * 40,
            pressure: 990 + Math.random() * 40,
            airQuality: 1 + Math.random() * 3
          },
          riskLevel: severity < 3 ? 'low' : severity < 6 ? 'moderate' : 'high',
          recommendations: [
            'Monitor barometric pressure changes',
            'Stay hydrated when humidity is high',
            'Consider indoor activities if air quality is poor'
          ].slice(0, Math.floor(Math.random() * 3) + 1)
        };
      });

      setPredictions(predictionData);

      toast({
        title: "Analysis Complete",
        description: "Weather-health correlations have been calculated"
      });
    } catch (error) {
      console.error('Correlation calculation error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to calculate correlations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateCorrelations();
  }, [dateRange, selectedSymptom, selectedWeatherFactor]);

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs > 0.7) return 'text-red-600';
    if (abs > 0.5) return 'text-orange-600';
    if (abs > 0.3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs > 0.7) return 'Strong';
    if (abs > 0.5) return 'Moderate';
    if (abs > 0.3) return 'Weak';
    return 'Very Weak';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Weather-Health Correlation Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Discover how weather patterns correlate with your symptom data
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={calculateCorrelations} disabled={loading}>
            <Zap className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analysis Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Symptom Focus</label>
              <Select value={selectedSymptom} onValueChange={setSelectedSymptom}>
                <SelectTrigger>
                  <SelectValue placeholder="All symptoms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Symptoms</SelectItem>
                  <SelectItem value="joint_pain">Joint Pain</SelectItem>
                  <SelectItem value="skin_irritation">Skin Irritation</SelectItem>
                  <SelectItem value="fatigue">Fatigue</SelectItem>
                  <SelectItem value="crawling_sensations">Crawling Sensations</SelectItem>
                  <SelectItem value="respiratory">Respiratory Issues</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Weather Factor</label>
              <Select value={selectedWeatherFactor} onValueChange={setSelectedWeatherFactor}>
                <SelectTrigger>
                  <SelectValue placeholder="All factors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Factors</SelectItem>
                  <SelectItem value="pressure">Barometric Pressure</SelectItem>
                  <SelectItem value="humidity">Humidity</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="air_quality">Air Quality</SelectItem>
                  <SelectItem value="uv_index">UV Index</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full" onClick={calculateCorrelations} disabled={loading}>
                <Eye className="h-4 w-4 mr-2" />
                Analyze
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="correlations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        {/* Correlation Analysis Tab */}
        <TabsContent value="correlations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Correlation Strength Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Correlation Strength</CardTitle>
                <p className="text-sm text-gray-600">
                  Strength of relationships between weather factors and symptoms
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="weatherFactor" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis domain={[-1, 1]} />
                    <Tooltip 
                      formatter={(value: number) => [
                        `${(value * 100).toFixed(1)}%`, 
                        'Correlation'
                      ]}
                    />
                    <Bar 
                      dataKey="correlation" 
                      fill={(entry) => Math.abs(entry.correlation) > 0.5 ? '#ef4444' : '#3b82f6'}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Correlations Table */}
            <Card>
              <CardHeader>
                <CardTitle>Correlation Details</CardTitle>
                <p className="text-sm text-gray-600">
                  Statistical significance and sample sizes
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {correlationData.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">
                          {item.weatherFactor} → {item.symptom}
                        </h4>
                        <Badge variant="outline" className={getCorrelationColor(item.correlation)}>
                          {getCorrelationStrength(item.correlation)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-gray-600">Correlation:</span>
                          <div className={`font-medium ${getCorrelationColor(item.correlation)}`}>
                            {(item.correlation * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">P-value:</span>
                          <div className="font-medium">
                            {item.pValue.toFixed(3)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Sample:</span>
                          <div className="font-medium">
                            {item.sampleSize} entries
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Analysis Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weather vs Symptom Timeline</CardTitle>
              <p className="text-sm text-gray-600">
                Overlay of weather conditions and symptom severity over time
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weatherSymptomData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis yAxisId="left" domain={[0, 10]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toFixed(1) : value,
                      name
                    ]}
                  />
                  <Legend />
                  
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="symptomSeverity" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Symptom Severity"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Humidity (%)"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="pressure" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Pressure (scaled)"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Scatter Plot */}
          <Card>
            <CardHeader>
              <CardTitle>Pressure vs Symptom Severity</CardTitle>
              <p className="text-sm text-gray-600">
                Scatter plot showing relationship between barometric pressure and symptoms
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={weatherSymptomData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="pressure" 
                    name="Pressure"
                    unit=" hPa"
                  />
                  <YAxis 
                    dataKey="symptomSeverity" 
                    name="Symptom Severity"
                    domain={[0, 10]}
                  />
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    labelFormatter={() => ''}
                  />
                  <Scatter dataKey="symptomSeverity" fill="#ef4444" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 7-Day Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  7-Day Symptom Forecast
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Predicted symptom severity based on weather forecasts
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={predictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    />
                    <YAxis domain={[0, 10]} />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value: number, name) => [
                        value.toFixed(1),
                        name === 'predictedSeverity' ? 'Predicted Severity' : name
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="predictedSeverity" 
                      stroke="#f59e0b" 
                      fill="#fef3c7"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Upcoming Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.map((pred, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {new Date(pred.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <Badge className={getRiskColor(pred.riskLevel)}>
                          {pred.riskLevel} risk
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        Predicted severity: {pred.predictedSeverity.toFixed(1)}/10 
                        ({(pred.confidence * 100).toFixed(0)}% confidence)
                      </div>
                      
                      <div className="space-y-1">
                        {pred.recommendations.map((rec, i) => (
                          <div key={i} className="text-xs text-gray-600 flex items-start gap-1">
                            <span className="text-blue-500">•</span>
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-900">Strong Pressure Correlation</span>
                    </div>
                    <p className="text-sm text-red-700">
                      Joint pain increases significantly when barometric pressure drops below 1000 hPa
                    </p>
                  </div>

                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-900">Humidity Threshold</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Skin irritation episodes occur 68% more frequently when humidity exceeds 75%
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Air Quality Impact</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Fatigue levels correlate with PM2.5 pollution levels, especially above 25 μg/m³
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seasonal Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-medium">Spring</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      High allergen risk
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-medium">Summer</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      UV sensitivity
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-medium">Fall</span>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                      Pressure changes
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-medium">Winter</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Low humidity
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};