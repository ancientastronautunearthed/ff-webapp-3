import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { Hand, User, ClipboardList, Save, Check } from 'lucide-react';
import { SYMPTOM_OPTIONS, TRIGGER_OPTIONS, LOCATION_OPTIONS, TREATMENT_OPTIONS } from './SymptomOptions';

const symptomSchema = z.object({
  date: z.string(),
  itchingIntensity: z.number().min(0).max(10),
  crawlingSensations: z.string(),
  newLesionsCount: z.number().min(0),
  lesionType: z.string(),
  fiberColors: z.array(z.string()),
  fatigueLevel: z.number().min(0).max(10),
  brainFogSeverity: z.string(),
  sleepQuality: z.string(),
  mood: z.array(z.string()),
  medications: z.array(z.string()),
  customMedication: z.string().optional(),
  dietFactors: z.array(z.string()),
  customDiet: z.string().optional(),
  environmentalFactors: z.array(z.string()),
  customEnvironmental: z.string().optional(),
  notes: z.string().optional(),
});

type SymptomFormData = z.infer<typeof symptomSchema>;

export const SymptomTracker = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [itchingValue, setItchingValue] = useState([0]);
  const [fatigueValue, setFatigueValue] = useState([0]);

  const form = useForm<SymptomFormData>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      itchingIntensity: 0,
      crawlingSensations: '',
      newLesionsCount: 0,
      lesionType: '',
      fiberColors: [],
      fatigueLevel: 0,
      brainFogSeverity: '',
      sleepQuality: '',
      mood: [],
      medications: [],
      customMedication: '',
      dietFactors: [],
      customDiet: '',
      environmentalFactors: [],
      customEnvironmental: '',
      notes: '',
    },
  });

  const onSubmit = async (data: SymptomFormData) => {
    setLoading(true);
    try {
      const { createSymptomEntry } = await import('@/lib/firestore');
      const { getCurrentUser } = await import('@/lib/auth');
      
      const user = getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Transform form data into symptom entry format
      const symptomData = {
        date: new Date(data.date),
        symptoms: {
          itchingIntensity: data.itchingIntensity,
          crawlingSensations: data.crawlingSensations,
          newLesionsCount: data.newLesionsCount,
          lesionType: data.lesionType,
          fiberColors: data.fiberColors,
          fatigueLevel: data.fatigueLevel,
          brainFogSeverity: data.brainFogSeverity,
          sleepQuality: data.sleepQuality,
          mood: data.mood
        },
        factors: {
          medications: data.medications,
          customMedication: data.customMedication,
          dietFactors: data.dietFactors,
          customDiet: data.customDiet,
          environmentalFactors: data.environmentalFactors,
          customEnvironmental: data.customEnvironmental
        },
        notes: data.notes
      };

      await createSymptomEntry(user.uid, symptomData);
      
      toast({
        title: "Symptoms Recorded",
        description: "Your symptom entry has been saved successfully.",
      });
      form.reset();
      setItchingValue([0]);
      setFatigueValue([0]);
    } catch (error: any) {
      toast({
        title: "Save Error",
        description: error.message || "Failed to save symptom entry.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Comprehensive Symptom Tracking</h1>
        <p className="text-xl text-gray-600 mt-4">Track your symptoms with precision and discover patterns in your health journey</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Tracking Form */}
        <div className="lg:col-span-2">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hand className="mr-2 h-5 w-5 text-primary-500" />
                  Skin & Sensory Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Itching Intensity
                  </Label>
                  <div className="px-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>None</span>
                      <span>Severe</span>
                    </div>
                    <Slider
                      value={itchingValue}
                      onValueChange={(value) => {
                        setItchingValue(value);
                        form.setValue('itchingIntensity', value[0]);
                      }}
                      max={10}
                      step={1}
                      className="mb-2"
                    />
                    <div className="text-center">
                      <span className="text-lg font-semibold text-primary-600">
                        {itchingValue[0]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Crawling/Biting Sensations
                    </Label>
                    <Select onValueChange={(value) => form.setValue('crawlingSensations', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intensity..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SYMPTOM_OPTIONS.crawlingSensations.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      New Lesions
                    </Label>
                    <div className="flex space-x-3">
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        placeholder="Count"
                        {...form.register('newLesionsCount', { valueAsNumber: true })}
                        className="flex-1"
                      />
                      <Select onValueChange={(value) => form.setValue('lesionType', value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SYMPTOM_OPTIONS.lesionTypes.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Fiber Observations
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {SYMPTOM_OPTIONS.fiberColors.map((option) => (
                      <label key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          onCheckedChange={(checked) => {
                            const current = form.getValues('fiberColors') || [];
                            if (checked) {
                              form.setValue('fiberColors', [...current, option.id]);
                            } else {
                              form.setValue('fiberColors', current.filter(id => id !== option.id));
                            }
                          }}
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-secondary-500" />
                  Systemic & Neurological Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Fatigue Level
                  </Label>
                  <div className="px-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>Energetic</span>
                      <span>Exhausted</span>
                    </div>
                    <Slider
                      value={fatigueValue}
                      onValueChange={(value) => {
                        setFatigueValue(value);
                        form.setValue('fatigueLevel', value[0]);
                      }}
                      max={10}
                      step={1}
                      className="mb-2"
                    />
                    <div className="text-center">
                      <span className="text-lg font-semibold text-secondary-600">
                        {fatigueValue[0]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Brain Fog Severity
                    </Label>
                    <Select onValueChange={(value) => form.setValue('brainFogSeverity', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SYMPTOM_OPTIONS.brainFogLevels.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Sleep Quality
                    </Label>
                    <Select onValueChange={(value) => form.setValue('sleepQuality', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sleep quality..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SYMPTOM_OPTIONS.sleepQuality.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Mood Assessment (Select all that apply)
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {SYMPTOM_OPTIONS.moodOptions.map((option) => (
                      <label key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          onCheckedChange={(checked) => {
                            const current = form.getValues('mood') || [];
                            if (checked) {
                              form.setValue('mood', [...current, option.id]);
                            } else {
                              form.setValue('mood', current.filter(id => id !== option.id));
                            }
                          }}
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5 text-purple-500" />
                  Potential Factors & Triggers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Medications Today
                    </Label>
                    <div className="space-y-2">
                      {SYMPTOM_OPTIONS.medications.map((option) => (
                        <label key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            onCheckedChange={(checked) => {
                              const current = form.getValues('medications') || [];
                              if (checked) {
                                form.setValue('medications', [...current, option.id]);
                              } else {
                                form.setValue('medications', current.filter(id => id !== option.id));
                              }
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                      <Input
                        placeholder="Other medication..."
                        {...form.register('customMedication')}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Diet & Supplements
                    </Label>
                    <div className="space-y-2">
                      {SYMPTOM_OPTIONS.dietFactors.map((option) => (
                        <label key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            onCheckedChange={(checked) => {
                              const current = form.getValues('dietFactors') || [];
                              if (checked) {
                                form.setValue('dietFactors', [...current, option.id]);
                              } else {
                                form.setValue('dietFactors', current.filter(id => id !== option.id));
                              }
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                      <Input
                        placeholder="Other diet factor..."
                        {...form.register('customDiet')}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Environmental Factors
                    </Label>
                    <div className="space-y-2">
                      {SYMPTOM_OPTIONS.environmentalFactors.map((option) => (
                        <label key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            onCheckedChange={(checked) => {
                              const current = form.getValues('environmentalFactors') || [];
                              if (checked) {
                                form.setValue('environmentalFactors', [...current, option.id]);
                              } else {
                                form.setValue('environmentalFactors', current.filter(id => id !== option.id));
                              }
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                      <Input
                        placeholder="Other environmental factor..."
                        {...form.register('customEnvironmental')}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Additional Notes
                  </Label>
                  <Textarea
                    placeholder="Any additional observations, thoughts, or context about today's symptoms..."
                    {...form.register('notes')}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // TODO: Save as draft functionality
                  toast({
                    title: "Draft Saved",
                    description: "Your entry has been saved as a draft.",
                  });
                }}
              >
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
              
              <Button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600"
                disabled={loading}
              >
                <Check className="mr-2 h-4 w-4" />
                Submit Entry
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Entries Completed</span>
                <span className="text-lg font-semibold text-primary-600">3/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tracking Streak</span>
                <span className="text-lg font-semibold text-secondary-600">12 days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">💡 Insight:</span> Sugar intake may correlate with increased itching
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">📈 Progress:</span> Sleep quality improved 30% this week
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
