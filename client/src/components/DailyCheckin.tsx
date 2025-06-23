import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Heart,
  Brain,
  Moon,
  Utensils,
  Activity,
  Smile,
  Frown,
  Meh,
  ThermometerSun,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  CheckCircle,
  X
} from 'lucide-react';

interface DailyCheckinProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface CheckinData {
  overallWellbeing: number;
  energyLevel: number;
  painLevel: number;
  sleepQuality: number;
  sleepHours: number;
  mood: string;
  stressLevel: number;
  symptoms: string[];
  medications: string;
  notes: string;
  weather: string;
  activities: string[];
}

export const DailyCheckin = ({ isOpen, onClose, onComplete }: DailyCheckinProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [checkinData, setCheckinData] = useState<CheckinData>({
    overallWellbeing: 5,
    energyLevel: 5,
    painLevel: 5,
    sleepQuality: 5,
    sleepHours: 7,
    mood: '',
    stressLevel: 5,
    symptoms: [],
    medications: '',
    notes: '',
    weather: '',
    activities: []
  });

  const commonSymptoms = [
    'Skin crawling sensations',
    'Fiber emergence',
    'Lesions or sores',
    'Fatigue',
    'Brain fog',
    'Joint pain',
    'Muscle aches',
    'Headache',
    'Sleep disturbance',
    'Mood changes'
  ];

  const commonActivities = [
    'Exercise',
    'Meditation',
    'Reading',
    'Outdoor time',
    'Social interaction',
    'Work/Study',
    'Household tasks',
    'Creative activities',
    'Rest/Relaxation'
  ];

  const moodOptions = [
    { value: 'very-happy', label: 'Very Happy', icon: Smile, color: 'text-green-600' },
    { value: 'happy', label: 'Happy', icon: Smile, color: 'text-green-500' },
    { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-yellow-500' },
    { value: 'sad', label: 'Sad', icon: Frown, color: 'text-orange-500' },
    { value: 'very-sad', label: 'Very Sad', icon: Frown, color: 'text-red-500' }
  ];

  const weatherOptions = [
    { value: 'sunny', label: 'Sunny', icon: Sun },
    { value: 'cloudy', label: 'Cloudy', icon: Cloud },
    { value: 'rainy', label: 'Rainy', icon: CloudRain },
    { value: 'windy', label: 'Windy', icon: Wind },
    { value: 'hot', label: 'Hot', icon: ThermometerSun }
  ];

  const handleSymptomToggle = (symptom: string) => {
    setCheckinData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleActivityToggle = (activity: string) => {
    setCheckinData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const checkIfAlreadyCompleted = async () => {
    if (!user) return false;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const checkinQuery = query(
        collection(db, 'dailyCheckins'),
        where('userId', '==', user.uid),
        where('timestamp', '>=', today),
        where('timestamp', '<', tomorrow)
      );

      const snapshot = await getDocs(checkinQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking existing checkin:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Check if already completed today
    const alreadyCompleted = await checkIfAlreadyCompleted();
    if (alreadyCompleted) {
      toast({
        title: "Already Completed",
        description: "You've already completed your daily check-in today!",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const checkinRecord = {
        userId: user.uid,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0],
        ...checkinData
      };

      await addDoc(collection(db, 'dailyCheckins'), checkinRecord);

      // Also create a symptom entry if symptoms were reported
      if (checkinData.symptoms.length > 0) {
        const symptomEntry = {
          userId: user.uid,
          timestamp: serverTimestamp(),
          symptoms: checkinData.symptoms,
          severity: checkinData.painLevel,
          location: 'General',
          environmentalFactors: checkinData.stressLevel > 6 ? ['High Stress'] : [],
          notes: `Daily check-in: ${checkinData.notes}`,
          weather: checkinData.weather
        };

        await addDoc(collection(db, 'symptomEntries'), symptomEntry);
      }

      toast({
        title: "Check-in Complete!",
        description: "Your daily health check-in has been recorded successfully.",
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving checkin:', error);
      toast({
        title: "Error",
        description: "Failed to save your check-in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Heart className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">How are you feeling today?</h3>
        <p className="text-gray-600 text-sm">Rate your overall wellbeing and energy</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Overall Wellbeing: {checkinData.overallWellbeing}/10</Label>
          <Slider
            value={[checkinData.overallWellbeing]}
            onValueChange={(value) => setCheckinData(prev => ({ ...prev, overallWellbeing: value[0] }))}
            max={10}
            min={1}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Energy Level: {checkinData.energyLevel}/10</Label>
          <Slider
            value={[checkinData.energyLevel]}
            onValueChange={(value) => setCheckinData(prev => ({ ...prev, energyLevel: value[0] }))}
            max={10}
            min={1}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Exhausted</span>
            <span>Energetic</span>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Pain Level: {checkinData.painLevel}/10</Label>
          <Slider
            value={[checkinData.painLevel]}
            onValueChange={(value) => setCheckinData(prev => ({ ...prev, painLevel: value[0] }))}
            max={10}
            min={1}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>No pain</span>
            <span>Severe pain</span>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Stress Level: {checkinData.stressLevel}/10</Label>
          <Slider
            value={[checkinData.stressLevel]}
            onValueChange={(value) => setCheckinData(prev => ({ ...prev, stressLevel: value[0] }))}
            max={10}
            min={1}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Relaxed</span>
            <span>Very stressed</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Moon className="h-12 w-12 mx-auto text-blue-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Sleep & Mood</h3>
        <p className="text-gray-600 text-sm">Tell us about your sleep and emotional state</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Sleep Quality: {checkinData.sleepQuality}/10</Label>
          <Slider
            value={[checkinData.sleepQuality]}
            onValueChange={(value) => setCheckinData(prev => ({ ...prev, sleepQuality: value[0] }))}
            max={10}
            min={1}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Hours of Sleep</Label>
          <Input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={checkinData.sleepHours}
            onChange={(e) => setCheckinData(prev => ({ ...prev, sleepHours: parseFloat(e.target.value) || 0 }))}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Current Mood</Label>
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((mood) => {
              const IconComponent = mood.icon;
              return (
                <button
                  key={mood.value}
                  onClick={() => setCheckinData(prev => ({ ...prev, mood: mood.value }))}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    checkinData.mood === mood.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className={`h-6 w-6 mx-auto mb-1 ${mood.color}`} />
                  <span className="text-xs">{mood.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Activity className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Symptoms & Activities</h3>
        <p className="text-gray-600 text-sm">Track your symptoms and daily activities</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-3 block">Current Symptoms (select all that apply)</Label>
          <div className="grid grid-cols-2 gap-2">
            {commonSymptoms.map((symptom) => (
              <div key={symptom} className="flex items-center space-x-2">
                <Checkbox
                  checked={checkinData.symptoms.includes(symptom)}
                  onCheckedChange={() => handleSymptomToggle(symptom)}
                />
                <span className="text-sm">{symptom}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Today's Activities</Label>
          <div className="grid grid-cols-3 gap-2">
            {commonActivities.map((activity) => (
              <div key={activity} className="flex items-center space-x-2">
                <Checkbox
                  checked={checkinData.activities.includes(activity)}
                  onCheckedChange={() => handleActivityToggle(activity)}
                />
                <span className="text-sm">{activity}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Weather Today</Label>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {weatherOptions.map((weather) => {
              const IconComponent = weather.icon;
              return (
                <button
                  key={weather.value}
                  onClick={() => setCheckinData(prev => ({ ...prev, weather: weather.value }))}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    checkinData.weather === weather.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                  <span className="text-xs">{weather.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Brain className="h-12 w-12 mx-auto text-purple-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
        <p className="text-gray-600 text-sm">Any medications or other observations</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="medications" className="text-sm font-medium">Medications Taken Today</Label>
          <Textarea
            id="medications"
            value={checkinData.medications}
            onChange={(e) => setCheckinData(prev => ({ ...prev, medications: e.target.value }))}
            placeholder="List any medications, supplements, or treatments..."
            rows={3}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
          <Textarea
            id="notes"
            value={checkinData.notes}
            onChange={(e) => setCheckinData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any other observations about your health today..."
            rows={4}
            className="mt-2"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>Wellbeing: {checkinData.overallWellbeing}/10</p>
            <p>Energy: {checkinData.energyLevel}/10</p>
            <p>Sleep: {checkinData.sleepHours} hours, quality {checkinData.sleepQuality}/10</p>
            <p>Symptoms: {checkinData.symptoms.length} reported</p>
            <p>Activities: {checkinData.activities.length} completed</p>
          </div>
        </div>
      </div>
    </div>
  );



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Daily Health Check-in</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded ${
                  i + 1 <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">Step {step} of {totalSteps}</p>
        </DialogHeader>

        <div className="py-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Previous
          </Button>
          
          {step < totalSteps ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Complete Check-in'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};