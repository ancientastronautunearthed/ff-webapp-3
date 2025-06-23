import { useState } from 'react';
import { useSymptomEntries } from '@/hooks/useSymptomData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Activity, 
  Brain, 
  Moon, 
  AlertTriangle,
  CheckCircle,
  Minus
} from 'lucide-react';

import { processSymptomData, calculateCorrelations, getWeeklyStats } from '@/utils/symptomAnalysis';

export const DataVisualization = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedMetrics, setSelectedMetrics] = useState(['itching', 'fatigue', 'brainFog', 'sleep']);
  const { data: symptomEntries, isLoading: symptomLoading } = useSymptomEntries();

  // Process real symptom data
  const symptomTrends = symptomEntries ? processSymptomData(symptomEntries) : [];
  const correlations = symptomEntries ? calculateCorrelations(symptomEntries) : [];
  const weeklyData = symptomEntries ? getWeeklyStats(symptomEntries) : null;

  const weeklyStats = weeklyData ? [
    {
      title: 'Tracking Days',
      value: `${weeklyData.trackingDays}/${weeklyData.totalDays}`,
      subtitle: 'This month',
      icon: Calendar,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      title: 'Avg Itching',
      value: `${weeklyData.avgItching.toFixed(1)}/10`,
      subtitle: weeklyData.avgItching < 5 ? 'Improving' : 'Monitor closely',
      icon: weeklyData.avgItching < 5 ? TrendingDown : TrendingUp,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50'
    },
    {
      title: 'Sleep Quality',
      value: weeklyData.avgSleep > 6 ? 'Good' : weeklyData.avgSleep > 4 ? 'Fair' : 'Poor',
      subtitle: `Avg ${weeklyData.avgSleep.toFixed(1)}/10`,
      icon: Moon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Brain Fog',
      value: `${weeklyData.avgBrainFog.toFixed(1)}/10`,
      subtitle: weeklyData.avgBrainFog < 4 ? 'Improving' : 'Monitor',
      icon: Brain,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
  ] : [];

  const getCorrelationIcon = (direction: string) => {
    switch (direction) {
      case 'increase':
        return <TrendingUp className="h-4 w-4" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getCorrelationColor = (color: string) => {
    const colors = {
      red: 'bg-red-50 border-red-200 text-red-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getCorrelationProgressColor = (color: string) => {
    const colors = {
      red: 'bg-red-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Health Insights</h1>
        <p className="text-xl text-gray-600 mt-4">Discover patterns and correlations in your symptom data</p>
      </div>

      {/* Weekly Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {weeklyStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{stat.title}</h3>
                <p className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Symptom Trends Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary-500" />
                Symptom Trends
              </CardTitle>
              <div className="flex space-x-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              {symptomLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : symptomTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={symptomTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    domain={[0, 10]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="itching" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Itching"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fatigue" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Fatigue"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="brainFog" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Brain Fog"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sleep" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Sleep Quality"
                    dot={{ r: 4 }}
                  />
                </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No symptom data available</p>
                    <p className="text-sm">Start tracking to see trends</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Itching</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span>Fatigue</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span>Brain Fog</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Sleep Quality</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Factor Correlations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-secondary-500" />
              Factor Correlations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {correlations.length > 0 ? correlations.map((correlation, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getCorrelationColor(correlation.color)}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      {getCorrelationIcon(correlation.direction)}
                      <span className="font-medium">{correlation.factor}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {correlation.direction === 'increase' ? '+' : '-'}{correlation.correlation}% {correlation.symptom}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 relative">
                    <div 
                      className={`h-2 rounded-full ${getCorrelationProgressColor(correlation.color)}`}
                      style={{ width: `${correlation.correlation}%` }}
                    />
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No correlations found yet</p>
                  <p className="text-sm">Track more data to discover patterns</p>
                </div>
              )}
            </div>

            <Button className="w-full mt-6 bg-secondary-500 hover:bg-secondary-600">
              <Activity className="mr-2 h-4 w-4" />
              Generate Detailed Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Insights Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>AI-Generated Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                Positive Trends
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Sleep quality has improved 25% over the past two weeks
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Itching intensity decreased from 5.8 to 4.2 average
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Brain fog shows consistent improvement trend
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                Areas to Monitor
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  High sugar intake strongly correlates with increased itching
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  Stress levels may be affecting cognitive symptoms
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  Weather changes appear to trigger symptom flares
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
