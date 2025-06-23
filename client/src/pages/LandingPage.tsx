import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';
import {
  Heart,
  Users,
  BarChart3,
  Shield,
  Microscope,
  Calendar,
  MessageSquare,
  Award,
  Play,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Clock,
  Target,
  Stethoscope,
  BookOpen,
  Camera,
  Brain,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [symptomIntensity, setSymptomIntensity] = useState([5]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [journalText, setJournalText] = useState('');

  const demoSymptoms = [
    'Skin crawling sensations',
    'Fiber emergence',
    'Lesions or sores',
    'Fatigue',
    'Brain fog',
    'Joint pain'
  ];

  const features = [
    {
      id: 'tracking',
      icon: Heart,
      title: 'Comprehensive Symptom Tracking',
      description: 'Log detailed symptoms with severity scales, triggers, and environmental factors',
      demo: true
    },
    {
      id: 'journal',
      icon: BookOpen,
      title: 'Digital Matchbox Journal',
      description: 'Secure, encrypted journaling with photo documentation capabilities',
      demo: true
    },
    {
      id: 'ai',
      icon: Brain,
      title: 'AI Health Coach',
      description: 'Personalized insights, pattern recognition, and health predictions',
      demo: true
    },
    {
      id: 'community',
      icon: Users,
      title: 'Peer Support Community',
      description: 'Connect with others, share experiences, and find support',
      demo: true
    },
    {
      id: 'data',
      icon: BarChart3,
      title: 'Data Visualization',
      description: 'Interactive charts showing trends, correlations, and patterns',
      demo: true
    },
    {
      id: 'doctor',
      icon: Stethoscope,
      title: 'Ask a Doctor Forum',
      description: 'Get professional medical guidance from verified healthcare providers',
      demo: true
    },
    {
      id: 'research',
      icon: Microscope,
      title: 'Research Participation',
      description: 'Contribute to Morgellons research while maintaining privacy',
      demo: false
    },
    {
      id: 'gamification',
      icon: Award,
      title: 'Gamified Progress',
      description: 'Achievements, streaks, and rewards that make tracking engaging',
      demo: true
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      location: "California",
      text: "Fiber Friends helped me identify patterns I never noticed. The AI insights are incredible.",
      rating: 5
    },
    {
      name: "Dr. James R.",
      location: "Texas",
      text: "As a physician, I appreciate the detailed reporting features for patient consultations.",
      rating: 5
    },
    {
      name: "Maria L.",
      location: "Florida",
      text: "The community support has been life-changing. I finally found people who understand.",
      rating: 5
    }
  ];

  const stats = [
    { label: "Active Users", value: "2,500+", icon: Users },
    { label: "Symptoms Tracked", value: "150K+", icon: Heart },
    { label: "Research Contributions", value: "1,200+", icon: Microscope },
    { label: "Community Posts", value: "8,500+", icon: MessageSquare }
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const renderSymptomTrackingDemo = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Select Symptoms</label>
        <div className="grid grid-cols-2 gap-2">
          {demoSymptoms.map(symptom => (
            <div key={symptom} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedSymptoms.includes(symptom)}
                onCheckedChange={() => handleSymptomToggle(symptom)}
              />
              <span className="text-sm">{symptom}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">
          Severity Level: {symptomIntensity[0]}/10
        </label>
        <Slider
          value={symptomIntensity}
          onValueChange={setSymptomIntensity}
          max={10}
          min={1}
          step={1}
          className="w-full"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Environmental Factors</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select triggers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stress">High Stress</SelectItem>
            <SelectItem value="weather">Weather Changes</SelectItem>
            <SelectItem value="diet">Dietary Changes</SelectItem>
            <SelectItem value="chemicals">Chemical Exposure</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button className="w-full bg-blue-600 hover:bg-blue-700">
        Log Symptoms
      </Button>
    </div>
  );

  const renderJournalDemo = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Journal Entry</label>
        <Textarea
          placeholder="Document your observations, thoughts, and experiences..."
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          rows={4}
        />
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">Click to add photos</p>
        <p className="text-xs text-gray-500">Secure, encrypted storage</p>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Mood</label>
        <div className="flex space-x-2">
          {['😢', '😟', '😐', '🙂', '😊'].map((emoji, index) => (
            <Button key={index} variant="outline" size="sm">
              {emoji}
            </Button>
          ))}
        </div>
      </div>
      
      <Button className="w-full bg-green-600 hover:bg-green-700">
        Save Entry
      </Button>
    </div>
  );

  const renderAIDemo = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">AI Health Coach</span>
        </div>
        <p className="text-sm text-blue-800">
          "Based on your recent entries, I've noticed your symptoms tend to worsen during high-stress periods. Consider stress management techniques."
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Pattern Recognition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Stress-Symptom Correlation</span>
              <span className="font-medium">87%</span>
            </div>
            <Progress value={87} />
            <div className="flex justify-between text-sm">
              <span>Weather Sensitivity</span>
              <span className="font-medium">65%</span>
            </div>
            <Progress value={65} />
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-900">Prediction</span>
        </div>
        <p className="text-xs text-yellow-800 mt-1">
          Based on weather forecast, symptoms may increase this weekend
        </p>
      </div>
    </div>
  );

  const renderDataDemo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Weekly Trend</span>
            </div>
            <p className="text-2xl font-bold text-green-600">↓ 23%</p>
            <p className="text-xs text-gray-600">Symptom improvement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Tracking Streak</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">14</p>
            <p className="text-xs text-gray-600">Days in a row</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Symptom Correlation Chart</h4>
        <div className="space-y-2">
          {['Sleep Quality', 'Stress Level', 'Weather', 'Diet'].map((factor, index) => (
            <div key={factor} className="flex items-center justify-between">
              <span className="text-sm">{factor}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${[75, 60, 45, 30][index]}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">{[75, 60, 45, 30][index]}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            Trusted by 2,500+ Morgellons Patients
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Journey to Understanding
            <span className="text-blue-600 block">Starts Here</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Fiber Friends is the comprehensive health tracking and community support platform 
            specifically designed for people with Morgellons disease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-3"
              onClick={() => setActiveDemo('tracking')}
            >
              <Play className="mr-2 h-5 w-5" />
              Try Interactive Demo
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features Grid with Interactive Demos */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features Built for Your Needs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-3">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  {feature.demo && (
                    <Dialog open={activeDemo === feature.id} onOpenChange={(open) => setActiveDemo(open ? feature.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Play className="mr-2 h-4 w-4" />
                          Try Demo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <feature.icon className="h-5 w-5 text-blue-600" />
                            <span>{feature.title} Demo</span>
                          </DialogTitle>
                        </DialogHeader>
                        {feature.id === 'tracking' && renderSymptomTrackingDemo()}
                        {feature.id === 'journal' && renderJournalDemo()}
                        {feature.id === 'ai' && renderAIDemo()}
                        {feature.id === 'data' && renderDataDemo()}
                        {feature.id === 'community' && (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                            <p className="text-gray-600 mb-4">Connect with our supportive community</p>
                            <Link href="/register">
                              <Button>Join Community</Button>
                            </Link>
                          </div>
                        )}
                        {feature.id === 'doctor' && (
                          <div className="text-center py-8">
                            <Stethoscope className="h-12 w-12 mx-auto text-green-600 mb-4" />
                            <p className="text-gray-600 mb-4">Get professional medical guidance</p>
                            <Link href="/register">
                              <Button>Ask a Doctor</Button>
                            </Link>
                          </div>
                        )}
                        {feature.id === 'gamification' && (
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <Award className="h-5 w-5 text-purple-600" />
                                <span className="font-medium">Achievement Unlocked!</span>
                              </div>
                              <p className="text-sm text-purple-800">7-Day Tracking Streak</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">Level 3</p>
                                <p className="text-xs text-gray-600">Health Tracker</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">1,250</p>
                                <p className="text-xs text-gray-600">XP Points</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Trusted by Our Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of others who have found support, insights, and hope with Fiber Friends.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8 py-3">
                Create Free Account
              </Button>
            </Link>
            <Link href="/doctor">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
                Healthcare Provider Access
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}