import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Stethoscope, 
  MessageCircle, 
  Clock,
  AlertCircle,
  CheckCircle,
  ThumbsUp,
  Calendar,
  Users,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DoctorResponseForm } from '@/components/DoctorResponseForm';

const questionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  urgency: z.enum(['low', 'medium', 'high']),
  anonymousPost: z.boolean().default(false)
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface DoctorQuestion {
  id: string;
  title: string;
  category: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  askedBy: string;
  askedAt: Date;
  status: 'open' | 'answered' | 'consultation_scheduled';
  views: number;
  responses: DoctorResponse[];
  isAnonymous: boolean;
}

interface DoctorResponse {
  id: string;
  doctorName: string;
  specialty: string;
  verificationStatus: 'verified' | 'pending';
  response: string;
  respondedAt: Date;
  helpfulVotes: number;
  followUpAvailable: boolean;
}

const QUESTION_CATEGORIES = [
  'Symptom Management',
  'Treatment Options',
  'Diagnostic Questions',
  'Medication Inquiries',
  'Lifestyle & Diet',
  'Mental Health Support',
  'Second Opinion',
  'Emergency Guidance'
];

export const AskDoctorForum = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<DoctorQuestion[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<DoctorQuestion | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema)
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { getDoctorConsultations } = await import('@/lib/firestore');
      const consultations = await getDoctorConsultations();
      
      // Convert Firestore data to DoctorQuestion format
      const formattedQuestions: DoctorQuestion[] = consultations.map(consultation => ({
        id: consultation.id,
        title: consultation.title || 'Medical Question',
        category: consultation.category || 'General',
        description: consultation.description || '',
        urgency: consultation.urgency || 'medium',
        askedBy: consultation.isAnonymous ? 'Anonymous' : consultation.askedBy || 'User',
        askedAt: consultation.createdAt ? consultation.createdAt.toDate() : new Date(),
        status: consultation.status || 'open',
        views: consultation.views || 0,
        responses: consultation.responses || [],
        isAnonymous: consultation.isAnonymous || false
      }));

      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      // Fallback to sample data for demo
      loadSampleQuestions();
    }
  };

  const loadSampleQuestions = () => {
    // Sample data for demonstration
    const mockQuestions: DoctorQuestion[] = [
      {
        id: '1',
        title: 'Recurring skin lesions despite treatment - next steps?',
        category: 'Treatment Options',
        description: 'I\'ve been dealing with recurring skin lesions for 8 months. My dermatologist has tried topical antibiotics and anti-inflammatory creams, but they keep coming back. The lesions are small, raised, and sometimes have fiber-like material. What other treatment approaches should I discuss with my doctor?',
        urgency: 'medium',
        askedBy: 'Sarah M.',
        askedAt: new Date(Date.now() - 3600000 * 6),
        status: 'answered',
        views: 47,
        isAnonymous: false,
        responses: [
          {
            id: 'r1',
            doctorName: 'Dr. Jennifer Martinez',
            specialty: 'Dermatology',
            verificationStatus: 'verified',
            response: 'Based on your description, this sounds challenging. I\'d recommend discussing with your dermatologist about: 1) Bacterial culture of the lesions to identify specific pathogens, 2) Consideration of systemic antibiotics if topical treatments aren\'t effective, 3) Biopsy if not already done. The fiber-like material you mention should definitely be examined. I\'d be happy to schedule a consultation to review your case in detail.',
            respondedAt: new Date(Date.now() - 3600000 * 2),
            helpfulVotes: 12,
            followUpAvailable: true
          }
        ]
      },
      {
        id: '2',
        title: 'Managing fatigue and brain fog - supplement recommendations?',
        category: 'Symptom Management',
        description: 'I experience severe fatigue and brain fog daily. Basic blood work shows normal results. Are there specific supplements or lifestyle changes that have helped other patients? My doctor suggested it might be related to inflammation.',
        urgency: 'low',
        askedBy: 'Anonymous',
        askedAt: new Date(Date.now() - 3600000 * 12),
        status: 'open',
        views: 23,
        isAnonymous: true,
        responses: []
      },
      {
        id: '3',
        title: 'Sleep disturbances and crawling sensations at night',
        category: 'Symptom Management',
        description: 'The crawling sensations are worst at night, making it impossible to sleep. I\'ve tried antihistamines and topical cooling gels. What other approaches might help with nighttime symptoms?',
        urgency: 'high',
        askedBy: 'Michael R.',
        askedAt: new Date(Date.now() - 3600000 * 18),
        status: 'answered',
        views: 89,
        isAnonymous: false,
        responses: [
          {
            id: 'r2',
            doctorName: 'Dr. Robert Chen',
            specialty: 'Sleep Medicine',
            verificationStatus: 'verified',
            response: 'Sleep disruption is particularly challenging. Consider discussing these options with your physician: 1) Sleep study to rule out other sleep disorders, 2) Gabapentin or pregabalin for neuropathic sensations, 3) Cool environment and moisture control in bedroom, 4) Relaxation techniques before bed. I can provide a consultation to develop a comprehensive sleep management plan.',
            respondedAt: new Date(Date.now() - 3600000 * 8),
            helpfulVotes: 18,
            followUpAvailable: true
          }
        ]
      }
    ];

    setQuestions(mockQuestions);
  };

  const submitQuestion = async (data: QuestionFormData) => {
    try {
      const questionData = {
        title: data.title,
        category: data.category,
        description: data.description,
        urgency: data.urgency,
        askedBy: data.anonymousPost ? 'Anonymous' : user?.displayName || 'User',
        userId: user?.uid,
        isAnonymous: data.anonymousPost,
        status: 'open',
        views: 0,
        responses: [],
        type: 'forum_question',
        createdAt: new Date()
      };

      // Save to Firestore
      const { createDoctorConsultation } = await import('@/lib/firestore');
      await createDoctorConsultation(questionData);

      // Create local question object for immediate UI update
      const newQuestion: DoctorQuestion = {
        id: Date.now().toString(),
        title: data.title,
        category: data.category,
        description: data.description,
        urgency: data.urgency,
        askedBy: data.anonymousPost ? 'Anonymous' : user?.displayName || 'User',
        askedAt: new Date(),
        status: 'open',
        views: 0,
        responses: [],
        isAnonymous: data.anonymousPost
      };

      setQuestions(prev => [newQuestion, ...prev]);
      setIsAsking(false);
      reset();

      toast({
        title: "Question Posted",
        description: "Your question has been posted. Doctors will be notified and can respond.",
      });
    } catch (error) {
      console.error('Error posting question:', error);
      toast({
        title: "Error",
        description: "Failed to post question. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="text-blue-600">Open</Badge>;
      case 'answered':
        return <Badge variant="default" className="bg-green-600">Answered</Badge>;
      case 'consultation_scheduled':
        return <Badge variant="default" className="bg-purple-600">Consultation Scheduled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleDoctorResponse = (questionId: string) => {
    // Check if user is a doctor (demo or real)
    const isDemoDoctor = localStorage.getItem('demoDoctor') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    if (isDemoDoctor || userRole === 'doctor') {
      setRespondingTo(questionId);
    } else {
      toast({
        title: "Access Restricted",
        description: "Only verified medical professionals can respond to questions.",
        variant: "destructive"
      });
    }
  };

  const onResponseSubmitted = (questionId: string, response: any) => {
    // Update the question with the new response
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          responses: [...q.responses, response],
          status: 'answered' as const
        };
      }
      return q;
    }));
    setRespondingTo(null);
  };

  if (isAsking) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Ask a Doctor
            </CardTitle>
            <p className="text-gray-600">
              Get professional medical guidance from verified physicians
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(submitQuestion)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Question Title</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Brief, descriptive title for your question"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select onValueChange={(value) => setValue('urgency', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General question</SelectItem>
                      <SelectItem value="medium">Medium - Concerning symptoms</SelectItem>
                      <SelectItem value="high">High - Urgent guidance needed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.urgency && (
                    <p className="text-sm text-red-600">{errors.urgency.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Provide detailed information about your symptoms, duration, treatments tried, and specific questions you have..."
                  rows={6}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Important Disclaimer</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  This forum provides general medical information only. It does not replace professional medical advice, diagnosis, or treatment. In emergencies, contact your local emergency services immediately.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymousPost"
                    {...register('anonymousPost')}
                    className="rounded"
                  />
                  <Label htmlFor="anonymousPost" className="text-sm">
                    Post anonymously
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAsking(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Post Question
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            Ask a Doctor
          </h1>
          <p className="text-gray-600 mt-2">
            Get professional medical guidance from verified physicians in our community
          </p>
        </div>
        <Button onClick={() => setIsAsking(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ask a Question
        </Button>
      </div>

      <div className="grid gap-6">
        {questions.map((question) => (
          <div key={question.id}>
            <Card className={`border-l-4 ${getUrgencyColor(question.urgency)}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{question.title}</h3>
                    {getStatusBadge(question.status)}
                    <Badge variant="outline" className="text-xs">
                      {question.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>Asked by {question.askedBy}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {question.askedAt.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {question.views} views
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{question.description}</p>
                  
                  {question.responses.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Medical Responses</h4>
                      {question.responses.map((response) => (
                        <div key={response.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>Dr</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-green-900">{response.doctorName}</span>
                                <Badge variant="outline" className="text-xs bg-green-100">
                                  {response.specialty}
                                </Badge>
                                {response.verificationStatus === 'verified' && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <span className="text-sm text-green-600">
                                Responded {response.respondedAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{response.response}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Helpful ({response.helpfulVotes})
                              </Button>
                            </div>
                            
                            {response.followUpAvailable && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Calendar className="h-3 w-3 mr-1" />
                                Schedule Consultation
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Doctor Response Section */}
                  <div className="mt-4 pt-4 border-t">
                    {question.responses.length === 0 ? (
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-3">No medical responses yet</p>
                        <Button
                          size="sm"
                          onClick={() => handleDoctorResponse(question.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Stethoscope className="h-4 w-4 mr-2" />
                          Provide Medical Response
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {question.responses.length} Medical Response(s)
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDoctorResponse(question.id)}
                          >
                            Add Response
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            </Card>
            {respondingTo === question.id && (
              <div className="mt-4">
                <DoctorResponseForm
                  questionId={question.id}
                  questionTitle={question.title}
                  onResponseSubmitted={(response) => onResponseSubmitted(question.id, response)}
                  onCancel={() => setRespondingTo(null)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};