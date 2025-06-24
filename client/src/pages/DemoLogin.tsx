import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  Stethoscope, 
  Users, 
  MessageSquare, 
  Brain, 
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';

export default function DemoLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Simulate demo login
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Demo Account Activated",
        description: "Welcome to the Fiber Friends Doctor Dashboard demo!",
      });

      setLocation('/doctor-dashboard');
    } catch (error) {
      console.error('Demo login error:', error);
      toast({
        title: "Demo Error",
        description: "Failed to load demo account. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fiber Friends Doctor Dashboard Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Experience the complete Patient Communication Hub with real-world scenarios
          </p>
        </div>

        {/* Demo Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                Secure Patient Messaging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Real-time patient communications
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Priority-based message filtering
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Crisis alerts and urgent notifications
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                AI Companion Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Pattern detection and correlations
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Symptom prediction algorithms
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Treatment suggestions and alerts
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Symptom Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Comprehensive symptom report review
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Environmental factor correlations
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Treatment response tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                Telehealth Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Integrated appointment scheduling
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Video consultation access
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Direct patient communication
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Demo Account Info */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
              Demo Doctor Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dr. Maria Elena Rodriguez</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Specialties:</strong> Internal Medicine, Environmental Medicine</p>
                  <p><strong>Morgellons Experience:</strong> 8 years specializing</p>
                  <p><strong>Patients Treated:</strong> 200+ Morgellons patients</p>
                  <p><strong>Research:</strong> 12 published papers</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Demo Features Include:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>4 Active Patients</strong> with varying severity levels</p>
                  <p><strong>11 Unread Messages</strong> including crisis alerts</p>
                  <p><strong>8 AI Insights</strong> pending review</p>
                  <p><strong>Real symptom data</strong> and treatment scenarios</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Scenarios Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Patient Scenarios</CardTitle>
            <p className="text-gray-600">Experience realistic clinical situations with AI-powered insights</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-red-800">Emma Thompson (Critical)</h4>
                  <Badge className="bg-red-500 text-white">Crisis Alert</Badge>
                </div>
                <p className="text-sm text-red-700">
                  Crisis-level symptoms following mold exposure. AI companion triggered emergency alert.
                  Requires immediate intervention and crisis management protocols.
                </p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-orange-800">Sarah Chen (High Severity)</h4>
                  <Badge className="bg-orange-500 text-white">Pattern Detected</Badge>
                </div>
                <p className="text-sm text-orange-700">
                  AI detected 87% correlation between humidity and symptom flares. Biofilm protocol 
                  causing herx reaction. Environmental interventions recommended.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-yellow-800">Michael Rodriguez (Moderate)</h4>
                  <Badge className="bg-yellow-500 text-white">Workplace Exposure</Badge>
                </div>
                <p className="text-sm text-yellow-700">
                  Consistent workplace exposure pattern identified. Joint pain increases 78% 
                  after office visits. Occupational medicine evaluation suggested.
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-green-800">James Wilson (Stable)</h4>
                  <Badge className="bg-green-500 text-white">Treatment Success</Badge>
                </div>
                <p className="text-sm text-green-700">
                  Excellent treatment response with herbal protocol. 65% symptom reduction 
                  over 6 months. AI recommends continuing current approach.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleDemoLogin}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Loading Demo...
              </>
            ) : (
              <>
                <Stethoscope className="w-5 h-5 mr-2" />
                Access Demo Doctor Dashboard
              </>
            )}
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            This demo showcases real Morgellons patient scenarios with AI-powered insights and therapeutic recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}