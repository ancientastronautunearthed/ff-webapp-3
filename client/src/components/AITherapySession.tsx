import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart,
  Send,
  Brain,
  MessageCircle,
  Clock,
  Shield,
  Lightbulb,
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Link } from 'wouter';

interface TherapyMessage {
  id: string;
  userId: string;
  message: string;
  isFromTherapist: boolean;
  timestamp: Date;
  sessionPhase?: 'opening' | 'exploration' | 'processing' | 'resolution' | 'closing';
  therapeuticTechnique?: string;
}

interface TherapyInsight {
  type: 'coping' | 'reflection' | 'progress' | 'homework';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export function AITherapySession() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<TherapyMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [therapyInsights, setTherapyInsights] = useState<TherapyInsight[]>([]);
  const [sessionPhase, setSessionPhase] = useState<string>('opening');
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) return;

    // Listen to real-time therapy messages
    const messagesQuery = query(
      collection(db, 'therapySessions'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const therapyMessages: TherapyMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        therapyMessages.push({
          id: doc.id,
          userId: data.userId,
          message: data.message,
          isFromTherapist: data.isFromTherapist,
          timestamp: data.timestamp?.toDate() || new Date(),
          sessionPhase: data.sessionPhase,
          therapeuticTechnique: data.therapeuticTechnique
        });
      });
      setMessages(therapyMessages);
      
      // Check if session is active based on recent messages
      const recentMessages = therapyMessages.filter(
        msg => Date.now() - msg.timestamp.getTime() < 3600000 // 1 hour
      );
      setSessionActive(recentMessages.length > 0);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Unable to process voice input. Please try again.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);

  const startSession = async () => {
    if (!user) return;

    try {
      // Send opening message from therapist
      await addDoc(collection(db, 'therapySessions'), {
        userId: user.uid,
        message: "Hello, I'm here to provide you with a safe, supportive space to explore whatever is on your mind today. I'm an AI therapist with training in psychological therapy, and while I'm not a licensed human therapist, I'm here to listen, understand, and help you work through your thoughts and feelings. What would you like to talk about today?",
        isFromTherapist: true,
        sessionPhase: 'opening',
        therapeuticTechnique: 'person-centered',
        timestamp: serverTimestamp()
      });

      setSessionActive(true);
      setSessionPhase('opening');
      
      toast({
        title: "Therapy Session Started",
        description: "Your confidential therapy session has begun. Take your time.",
      });
    } catch (error) {
      console.error('Error starting therapy session:', error);
      toast({
        title: "Connection Issue",
        description: "Unable to start session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !user || isLoading) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Add user message to Firestore
      await addDoc(collection(db, 'therapySessions'), {
        userId: user.uid,
        message: userMessage,
        isFromTherapist: false,
        sessionPhase: sessionPhase,
        timestamp: serverTimestamp()
      });

      // Get AI therapy response
      const response = await fetch('/api/therapy/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.uid, 
          message: userMessage,
          sessionPhase: sessionPhase
        })
      });

      if (response.ok) {
        const therapyResponse = await response.json();
        
        // Add therapist response to Firestore
        await addDoc(collection(db, 'therapySessions'), {
          userId: user.uid,
          message: therapyResponse.message,
          isFromTherapist: true,
          sessionPhase: therapyResponse.sessionPhase || sessionPhase,
          therapeuticTechnique: therapyResponse.technique,
          timestamp: serverTimestamp()
        });

        // Update session phase if changed
        if (therapyResponse.sessionPhase && therapyResponse.sessionPhase !== sessionPhase) {
          setSessionPhase(therapyResponse.sessionPhase);
        }

        // Update therapy insights
        if (therapyResponse.insights) {
          setTherapyInsights(therapyResponse.insights);
        }

        // Play voice response if voice is enabled
        if (voiceEnabled && therapyResponse.message) {
          playVoiceResponse(therapyResponse.message);
        }
      } else {
        toast({
          title: "Connection Issue",
          description: "I'm having trouble responding right now. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending therapy message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    if (!user) return;

    try {
      // Send closing message from therapist
      await addDoc(collection(db, 'therapySessions'), {
        userId: user.uid,
        message: "Thank you for sharing with me today. Remember that healing is a process, and it's okay to take things one step at a time. If you need support between our conversations, please don't hesitate to reach out to a licensed mental health professional. Take care of yourself.",
        isFromTherapist: true,
        sessionPhase: 'closing',
        therapeuticTechnique: 'supportive',
        timestamp: serverTimestamp()
      });

      setSessionActive(false);
      
      toast({
        title: "Session Ended",
        description: "Your therapy session has been safely concluded.",
      });
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Voice Input Error",
          description: "Unable to start voice recognition. Please check your microphone permissions.",
          variant: "destructive"
        });
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const playVoiceResponse = async (text: string) => {
    if (!voiceEnabled || isPlaying) return;

    try {
      setIsPlaying(true);
      
      const response = await fetch('/api/therapy/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.onerror = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audioRef.current.play();
      } else if (response.status === 500) {
        // Fallback to browser speech synthesis
        setIsPlaying(false);
        playFallbackVoice(text);
      } else {
        setIsPlaying(false);
        toast({
          title: "Voice Output Error",
          description: "Unable to generate voice response.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error playing voice response:', error);
      setIsPlaying(false);
      toast({
        title: "Voice Output Error",
        description: "Unable to play voice response.",
        variant: "destructive"
      });
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    toast({
      title: voiceEnabled ? "Voice Disabled" : "Voice Enabled",
      description: voiceEnabled 
        ? "Therapy sessions will now be text-only." 
        : "You can now speak with your AI therapist using voice.",
    });
  };

  const playFallbackVoice = (text: string) => {
    if ('speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure therapeutic voice characteristics
        utterance.rate = 0.8; // Slower, more thoughtful pace
        utterance.pitch = 0.8; // Lower, calming pitch
        utterance.volume = 0.9;
        
        // Try to use a suitable voice
        const voices = speechSynthesis.getVoices();
        const therapeuticVoice = voices.find(voice => 
          voice.name.includes('Female') || 
          voice.name.includes('Karen') || 
          voice.name.includes('Samantha') ||
          voice.gender === 'female'
        );
        
        if (therapeuticVoice) {
          utterance.voice = therapeuticVoice;
        }
        
        setIsPlaying(true);
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        utterance.onerror = () => {
          setIsPlaying(false);
          console.error('Speech synthesis error');
        };
        
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Fallback voice synthesis error:', error);
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
      toast({
        title: "Voice Not Supported",
        description: "Voice output is not supported in this browser.",
        variant: "destructive"
      });
    }
  };

  const getPhaseIcon = (phase?: string) => {
    switch (phase) {
      case 'opening': return <Heart className="h-4 w-4 text-green-500" />;
      case 'exploration': return <Brain className="h-4 w-4 text-blue-500" />;
      case 'processing': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'resolution': return <Shield className="h-4 w-4 text-purple-500" />;
      case 'closing': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <MessageCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/companion-chat">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to AI Companion
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Therapy Session
          </h1>
          <p className="text-gray-600">
            Confidential therapeutic support with an AI trained in psychological therapy
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This AI therapist has training in psychological therapy but is not a licensed human therapist. 
              For serious mental health concerns, please consult with a licensed mental health professional.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Therapy Chat Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/ai-therapist.png" />
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    <Brain className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                AI Therapist
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    onClick={toggleVoice}
                    variant="outline"
                    size="sm"
                    className={voiceEnabled ? "bg-green-50 text-green-700" : ""}
                  >
                    {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Badge variant={sessionActive ? "default" : "secondary"}>
                    {sessionActive ? "Session Active" : "Ready to Start"}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Session Status */}
              {sessionActive && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getPhaseIcon(sessionPhase)}
                    <span className="text-sm font-medium capitalize">
                      {sessionPhase} Phase
                    </span>
                  </div>
                  <Button 
                    onClick={endSession} 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    End Session
                  </Button>
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                <div className="space-y-4">
                  {messages.length === 0 && !sessionActive && (
                    <div className="text-center text-gray-500 py-8">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-purple-300" />
                      <p className="text-lg font-medium mb-2">Start Your Therapy Session</p>
                      <p className="text-sm mb-4">
                        This is a safe, confidential space to explore your thoughts and feelings.
                        I'm here to listen and support you.
                      </p>
                      <Button onClick={startSession} className="bg-purple-600 hover:bg-purple-700">
                        Begin Session
                      </Button>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromTherapist ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isFromTherapist
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.isFromTherapist && (
                            <div className="mt-1">
                              {getPhaseIcon(message.sessionPhase)}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm">{message.message}</p>
                            {message.therapeuticTechnique && (
                              <p className="text-xs opacity-70 mt-1">
                                Technique: {message.therapeuticTechnique}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              {sessionActive && (
                <div className="space-y-3">
                  {voiceEnabled && (
                    <div className="flex items-center justify-center p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={isListening ? stopListening : startListening}
                          disabled={isLoading || isPlaying}
                          className={`${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="h-4 w-4 mr-2" />
                              Stop Listening
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4 mr-2" />
                              Start Speaking
                            </>
                          )}
                        </Button>
                        {isListening && (
                          <div className="flex items-center gap-2 text-purple-700">
                            <div className="animate-pulse h-2 w-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm">Listening...</span>
                          </div>
                        )}
                        {isPlaying && (
                          <div className="flex items-center gap-2 text-purple-700">
                            <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Speaking...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={voiceEnabled ? "Type or speak your thoughts..." : "Share your thoughts and feelings..."}
                      disabled={isLoading || isListening}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!currentMessage.trim() || isLoading || isListening}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Therapy Insights & Resources */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {therapyInsights.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Insights and coping strategies will appear here during your session.
                    </p>
                  ) : (
                    therapyInsights.map((insight, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          {insight.type === 'coping' && <Shield className="h-4 w-4 text-green-500" />}
                          {insight.type === 'reflection' && <Brain className="h-4 w-4 text-blue-500" />}
                          {insight.type === 'progress' && <Lightbulb className="h-4 w-4 text-yellow-500" />}
                          {insight.type === 'homework' && <Clock className="h-4 w-4 text-purple-500" />}
                          <div className="flex-1">
                            <p className="text-sm font-medium capitalize">
                              {insight.type}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {insight.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Crisis Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Crisis Hotline</p>
                  <p className="text-sm text-red-700">988 - Suicide & Crisis Lifeline</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Text Crisis Line</p>
                  <p className="text-sm text-blue-700">Text HOME to 741741</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Emergency</p>
                  <p className="text-sm text-green-700">Call 911 for immediate help</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}