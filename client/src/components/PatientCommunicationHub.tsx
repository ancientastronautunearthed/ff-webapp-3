import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  TrendingUp, 
  Brain, 
  Video, 
  Calendar,
  Send,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  FileText,
  Activity,
  Bot
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Patient {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  lastActive: Date;
  symptomSeverity: 'low' | 'moderate' | 'high' | 'critical';
  unreadMessages: number;
  nextAppointment?: Date;
  companionTier: number;
}

interface Message {
  id: string;
  patientId: string;
  senderId: string;
  senderType: 'doctor' | 'patient';
  content: string;
  timestamp: Date;
  read: boolean;
  messageType: 'text' | 'symptom_report' | 'ai_insight' | 'appointment_request';
  attachments?: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface SymptomReport {
  id: string;
  patientId: string;
  date: Date;
  symptoms: {
    itchingIntensity: number;
    crawlingSensations: string;
    newLesionsCount: number;
    fatigueLevel: number;
    mood: string[];
  };
  factors: {
    medications: string[];
    environmentalFactors: string[];
  };
  notes: string;
  aiInsights?: string[];
  reviewed: boolean;
}

interface CompanionInsight {
  id: string;
  patientId: string;
  date: Date;
  type: 'pattern_detection' | 'symptom_prediction' | 'treatment_suggestion' | 'crisis_alert';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  doctorReviewed: boolean;
}

export const PatientCommunicationHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [symptomReports, setSymptomReports] = useState<SymptomReport[]>([]);
  const [companionInsights, setCompanionInsights] = useState<CompanionInsight[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('messages');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, [user]);

  useEffect(() => {
    if (selectedPatient) {
      loadPatientData(selectedPatient.id);
    }
  }, [selectedPatient]);

  const loadPatients = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      // In real implementation, this would load patients assigned to the doctor
      const mockPatients: Patient[] = [
        {
          id: 'patient1',
          name: 'Sarah Chen',
          email: 'sarah.chen@email.com',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          symptomSeverity: 'high',
          unreadMessages: 3,
          nextAppointment: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
          companionTier: 5
        },
        {
          id: 'patient2',
          name: 'Michael Rodriguez',
          email: 'michael.r@email.com',
          lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          symptomSeverity: 'moderate',
          unreadMessages: 1,
          nextAppointment: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          companionTier: 3
        },
        {
          id: 'patient3',
          name: 'Emma Thompson',
          email: 'emma.t@email.com',
          lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          symptomSeverity: 'critical',
          unreadMessages: 7,
          companionTier: 2
        }
      ];
      
      setPatients(mockPatients);
      if (mockPatients.length > 0) {
        setSelectedPatient(mockPatients[0]);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
    setLoading(false);
  };

  const loadPatientData = async (patientId: string) => {
    try {
      // Load messages
      const mockMessages: Message[] = [
        {
          id: 'msg1',
          patientId: patientId,
          senderId: patientId,
          senderType: 'patient',
          content: 'Hi Dr. Smith, I\'ve been experiencing increased crawling sensations over the past few days. My AI companion suggested it might be related to the recent weather changes. Could we discuss adjusting my treatment?',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false,
          messageType: 'text',
          priority: 'high'
        },
        {
          id: 'msg2',
          patientId: patientId,
          senderId: 'doctor1',
          senderType: 'doctor',
          content: 'Thank you for reaching out. I\'ve reviewed your recent symptom reports and AI companion insights. Let\'s schedule a telehealth appointment to discuss treatment adjustments. I see your companion has identified some interesting patterns.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: true,
          messageType: 'text',
          priority: 'normal'
        }
      ];

      // Load symptom reports
      const mockSymptomReports: SymptomReport[] = [
        {
          id: 'report1',
          patientId: patientId,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          symptoms: {
            itchingIntensity: 7,
            crawlingSensations: 'severe',
            newLesionsCount: 3,
            fatigueLevel: 8,
            mood: ['anxious', 'frustrated']
          },
          factors: {
            medications: ['antihistamine', 'topical steroid'],
            environmentalFactors: ['high humidity', 'mold exposure']
          },
          notes: 'Symptoms worse after cleaning basement. AI companion suggested mold connection.',
          aiInsights: [
            'Pattern detected: Symptoms correlate with high humidity (85% accuracy)',
            'Recommendation: Environmental mold testing suggested',
            'Alert: Symptom intensity increasing over 7-day trend'
          ],
          reviewed: false
        }
      ];

      // Load companion insights
      const mockCompanionInsights: CompanionInsight[] = [
        {
          id: 'insight1',
          patientId: patientId,
          date: new Date(Date.now() - 6 * 60 * 60 * 1000),
          type: 'pattern_detection',
          title: 'Environmental Trigger Pattern Identified',
          description: 'AI analysis shows 78% correlation between basement cleaning activities and symptom flares. Patient reports mold smell during cleaning.',
          confidence: 78,
          actionable: true,
          doctorReviewed: false
        },
        {
          id: 'insight2',
          patientId: patientId,
          date: new Date(Date.now() - 12 * 60 * 60 * 1000),
          type: 'symptom_prediction',
          title: 'Potential Symptom Escalation Predicted',
          description: 'Based on current trend analysis, AI predicts 68% likelihood of symptom escalation in next 48-72 hours without intervention.',
          confidence: 68,
          actionable: true,
          doctorReviewed: false
        }
      ];

      setMessages(mockMessages);
      setSymptomReports(mockSymptomReports);
      setCompanionInsights(mockCompanionInsights);
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPatient) return;

    const message: Message = {
      id: Date.now().toString(),
      patientId: selectedPatient.id,
      senderId: user?.uid || 'doctor1',
      senderType: 'doctor',
      content: newMessage,
      timestamp: new Date(),
      read: true,
      messageType: 'text',
      priority: 'normal'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    toast({
      title: "Message Sent",
      description: `Message sent to ${selectedPatient.name}`,
    });
  };

  const markInsightReviewed = async (insightId: string) => {
    setCompanionInsights(prev => prev.map(insight => 
      insight.id === insightId 
        ? { ...insight, doctorReviewed: true }
        : insight
    ));

    toast({
      title: "Insight Reviewed",
      description: "AI companion insight marked as reviewed",
    });
  };

  const markReportReviewed = async (reportId: string) => {
    setSymptomReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, reviewed: true }
        : report
    ));

    toast({
      title: "Report Reviewed",
      description: "Symptom report marked as reviewed",
    });
  };

  const scheduleAppointment = () => {
    // This would integrate with telehealth scheduling system
    toast({
      title: "Appointment Scheduling",
      description: "Telehealth appointment scheduling would open here",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern_detection': return <TrendingUp className="h-4 w-4" />;
      case 'symptom_prediction': return <Brain className="h-4 w-4" />;
      case 'treatment_suggestion': return <FileText className="h-4 w-4" />;
      case 'crisis_alert': return <AlertCircle className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || patient.symptomSeverity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading patient communication hub...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Patient List Sidebar */}
      <div className="w-1/3 border-r bg-gray-50 p-4">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Communications</h2>
            
            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Severity Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Patient List */}
          <div className="space-y-2">
            {filteredPatients.map((patient) => (
              <Card 
                key={patient.id}
                className={`cursor-pointer transition-colors ${
                  selectedPatient?.id === patient.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedPatient(patient)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={patient.avatar} />
                      <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">{patient.name}</h3>
                        {patient.unreadMessages > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {patient.unreadMessages}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getSeverityColor(patient.symptomSeverity)}>
                          {patient.symptomSeverity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Tier {patient.companionTier}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Last active: {patient.lastActive.toLocaleDateString()}
                      </p>
                      
                      {patient.nextAppointment && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Next: {patient.nextAppointment.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Communication Area */}
      <div className="flex-1 flex flex-col">
        {selectedPatient ? (
          <>
            {/* Patient Header */}
            <div className="border-b bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedPatient.avatar} />
                    <AvatarFallback>{selectedPatient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h1>
                    <p className="text-gray-600">{selectedPatient.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={scheduleAppointment}>
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Call
                  </Button>
                  <Button size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 m-4">
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="symptoms" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Symptoms
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Reports
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="messages" className="h-full flex flex-col m-4 mt-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.senderType === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          message.senderType === 'doctor' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-800 border'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                            {message.priority === 'high' && (
                              <Badge className="bg-red-500 text-white text-xs">High Priority</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Type your message to the patient..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      rows={3}
                    />
                    <Button onClick={sendMessage} className="self-end">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="symptoms" className="h-full overflow-y-auto m-4 mt-0">
                  <div className="space-y-4">
                    {symptomReports.map((report) => (
                      <Card key={report.id} className={`${!report.reviewed ? 'border-blue-200 bg-blue-50' : ''}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              Symptom Report - {report.date.toLocaleDateString()}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                              {!report.reviewed && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  Needs Review
                                </Badge>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => markReportReviewed(report.id)}
                                disabled={report.reviewed}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {report.reviewed ? 'Reviewed' : 'Mark Reviewed'}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Symptoms</h4>
                              <ul className="text-sm space-y-1">
                                <li>Itching intensity: {report.symptoms.itchingIntensity}/10</li>
                                <li>Crawling sensations: {report.symptoms.crawlingSensations}</li>
                                <li>New lesions: {report.symptoms.newLesionsCount}</li>
                                <li>Fatigue level: {report.symptoms.fatigueLevel}/10</li>
                                <li>Mood: {report.symptoms.mood.join(', ')}</li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Factors</h4>
                              <ul className="text-sm space-y-1">
                                <li><strong>Medications:</strong> {report.factors.medications.join(', ')}</li>
                                <li><strong>Environmental:</strong> {report.factors.environmentalFactors.join(', ')}</li>
                              </ul>
                            </div>
                          </div>
                          
                          {report.notes && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Patient Notes</h4>
                              <p className="text-sm text-gray-700">{report.notes}</p>
                            </div>
                          )}

                          {report.aiInsights && report.aiInsights.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">AI Companion Insights</h4>
                              <ul className="text-sm space-y-1">
                                {report.aiInsights.map((insight, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <Bot className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="h-full overflow-y-auto m-4 mt-0">
                  <div className="space-y-4">
                    {companionInsights.map((insight) => (
                      <Card key={insight.id} className={`${!insight.doctorReviewed ? 'border-purple-200 bg-purple-50' : ''}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-purple-100 rounded-full">
                                {getInsightIcon(insight.type)}
                              </div>
                              <div>
                                <CardTitle className="text-lg">{insight.title}</CardTitle>
                                <p className="text-sm text-gray-600">
                                  {insight.date.toLocaleDateString()} • {insight.confidence}% confidence
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {insight.actionable && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Actionable
                                </Badge>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => markInsightReviewed(insight.id)}
                                disabled={insight.doctorReviewed}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {insight.doctorReviewed ? 'Reviewed' : 'Mark Reviewed'}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{insight.description}</p>
                          {insight.type === 'crisis_alert' && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-red-800 font-medium text-sm">
                                Crisis Alert: Immediate attention may be required
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reports" className="h-full overflow-y-auto m-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Comprehensive Patient Reports</CardTitle>
                      <p className="text-gray-600">Generate and download detailed reports for clinical use</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                          <Download className="h-6 w-6 mb-2" />
                          <span>Symptom Timeline Report</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                          <Download className="h-6 w-6 mb-2" />
                          <span>AI Insights Summary</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                          <Download className="h-6 w-6 mb-2" />
                          <span>Treatment Response Analysis</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                          <Download className="h-6 w-6 mb-2" />
                          <span>Environmental Correlation Report</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
              <p className="text-gray-600">Choose a patient from the list to view their communications and data</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};