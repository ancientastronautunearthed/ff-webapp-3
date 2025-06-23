import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  MapPin, 
  Heart, 
  Pill, 
  Home, 
  Globe, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Users,
  Activity,
  Stethoscope,
  FlaskConical
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const medicalProfileSchema = z.object({
  // Demographics
  ageRange: z.string().min(1, "Age range is required"),
  gender: z.string().optional(),
  ethnicity: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  
  // Geographic
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  climateZone: z.string().optional(),
  
  // Medical History
  diagnosisYear: z.number().min(1990).max(new Date().getFullYear()).optional(),
  initialSymptoms: z.array(z.string()).min(1, "At least one initial symptom is required"),
  currentSymptoms: z.array(z.string()).min(1, "At least one current symptom is required"),
  symptomSeverity: z.number().min(1).max(10),
  otherConditions: z.array(z.string()),
  allergies: z.array(z.string()),
  medications: z.array(z.string()),
  
  // Lifestyle
  smokingStatus: z.string(),
  alcoholUse: z.string(),
  exerciseFrequency: z.string(),
  dietType: z.string().optional(),
  stressLevel: z.number().min(1).max(10),
  sleepQuality: z.number().min(1).max(10),
  
  // Environmental
  livingEnvironment: z.string(),
  waterSource: z.string(),
  housingType: z.string().optional(),
  petExposure: z.boolean(),
  chemicalExposure: z.array(z.string()),
  
  // Research participation
  willingToParticipate: z.boolean(),
  preferredContactMethod: z.string().optional(),
  availabilityForStudies: z.string().optional(),
  compensationPreference: z.string().optional(),
});

type MedicalProfileData = z.infer<typeof medicalProfileSchema>;

const steps = [
  { id: 'demographics', title: 'Demographics', icon: User },
  { id: 'location', title: 'Location & Environment', icon: MapPin },
  { id: 'medical', title: 'Medical History', icon: Stethoscope },
  { id: 'lifestyle', title: 'Lifestyle Factors', icon: Activity },
  { id: 'research', title: 'Research Participation', icon: FlaskConical },
];

const symptomOptions = [
  'Fiber-like structures from skin',
  'Crawling/stinging sensations',
  'Skin lesions or sores',
  'Fatigue',
  'Brain fog/cognitive issues',
  'Joint pain',
  'Sleep disturbances',
  'Mood changes',
  'Digestive issues',
  'Hair loss',
  'Vision problems',
  'Other neurological symptoms'
];

const conditionOptions = [
  'Lyme Disease',
  'Fibromyalgia',
  'Chronic Fatigue Syndrome',
  'Autoimmune Disorder',
  'Depression/Anxiety',
  'Diabetes',
  'Thyroid Disorder',
  'Skin Conditions',
  'Allergies',
  'Other'
];

const allergyOptions = [
  'Food allergies',
  'Environmental allergies',
  'Drug allergies',
  'Chemical sensitivities',
  'Metal allergies',
  'None known'
];

const chemicalExposureOptions = [
  'Pesticides/Herbicides',
  'Industrial chemicals',
  'Cleaning products',
  'Paint/Solvents',
  'Cosmetics/Personal care',
  'Building materials',
  'None known'
];

interface MedicalOnboardingProps {
  onComplete: (data: MedicalProfileData) => void;
  onSkip?: () => void;
}

export const MedicalOnboarding = ({ onComplete, onSkip }: MedicalOnboardingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const form = useForm<MedicalProfileData>({
    resolver: zodResolver(medicalProfileSchema),
    defaultValues: {
      ageRange: '',
      gender: '',
      ethnicity: '',
      education: '',
      occupation: '',
      country: '',
      state: '',
      zipCode: '',
      climateZone: '',
      diagnosisYear: undefined,
      initialSymptoms: [],
      currentSymptoms: [],
      symptomSeverity: 5,
      otherConditions: [],
      allergies: [],
      medications: [],
      smokingStatus: '',
      alcoholUse: '',
      exerciseFrequency: '',
      dietType: '',
      stressLevel: 5,
      sleepQuality: 5,
      livingEnvironment: '',
      waterSource: '',
      housingType: '',
      petExposure: false,
      chemicalExposure: [],
      willingToParticipate: false,
      preferredContactMethod: '',
      availabilityForStudies: '',
      compensationPreference: '',
    },
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: MedicalProfileData) => {
    setLoading(true);
    try {
      // Mark medical profile as complete
      // Save completion status to Firebase
      await setDoc(doc(db, 'userPreferences', user.uid), {
        medicalProfileComplete: true,
        medicalProfileCompletedAt: new Date()
      }, { merge: true });
      
      onComplete(data);
      toast({
        title: "Medical profile completed",
        description: `Thank you for providing comprehensive health information with ${Object.keys(data).length} data points for research.`,
      });
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600">Please sign in to complete your medical profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Medical Profile Setup</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          Help us understand your condition better and contribute to Morgellons research.
          This information will be anonymized and used to identify patterns and improve treatments.
        </p>
        <Progress value={progress} className="w-full max-w-md mx-auto" />
        <p className="text-sm text-gray-500 mt-2">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </p>
      </div>

      {/* Step Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStep 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 ${
                    index < currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Demographics */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-blue-500" />
                  Demographics
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Basic demographic information helps researchers understand patterns across different populations.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="ageRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Range *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your age range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="18-25">18-25</SelectItem>
                          <SelectItem value="26-35">26-35</SelectItem>
                          <SelectItem value="36-45">36-45</SelectItem>
                          <SelectItem value="46-55">46-55</SelectItem>
                          <SelectItem value="56-65">56-65</SelectItem>
                          <SelectItem value="66-75">66-75</SelectItem>
                          <SelectItem value="76+">76+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender Identity</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ethnicity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ethnicity</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ethnicity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="caucasian">Caucasian</SelectItem>
                            <SelectItem value="hispanic">Hispanic/Latino</SelectItem>
                            <SelectItem value="african-american">African American</SelectItem>
                            <SelectItem value="asian">Asian</SelectItem>
                            <SelectItem value="native-american">Native American</SelectItem>
                            <SelectItem value="mixed">Mixed race</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select education" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high-school">High School</SelectItem>
                            <SelectItem value="some-college">Some College</SelectItem>
                            <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                            <SelectItem value="masters">Master's Degree</SelectItem>
                            <SelectItem value="doctorate">Doctorate</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input placeholder="Your occupation (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Location & Environment */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-green-500" />
                  Location & Environment
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Geographic and environmental factors may play a role in Morgellons symptoms.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <FormControl>
                          <Input placeholder="Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input placeholder="State or Province" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code (first 3 digits)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123" 
                            maxLength={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Only first 3 digits for privacy protection
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="climateZone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Climate Zone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select climate" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tropical">Tropical</SelectItem>
                            <SelectItem value="subtropical">Subtropical</SelectItem>
                            <SelectItem value="temperate">Temperate</SelectItem>
                            <SelectItem value="continental">Continental</SelectItem>
                            <SelectItem value="arctic">Arctic</SelectItem>
                            <SelectItem value="desert">Desert</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="livingEnvironment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Living Environment</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select environment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="urban">Urban</SelectItem>
                            <SelectItem value="suburban">Suburban</SelectItem>
                            <SelectItem value="rural">Rural</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="waterSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Water Source</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select water source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="municipal">Municipal/City</SelectItem>
                            <SelectItem value="well">Private Well</SelectItem>
                            <SelectItem value="bottled">Bottled Water</SelectItem>
                            <SelectItem value="filtered">Filtered Tap</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="housingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Housing Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select housing" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="house">Single Family House</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="condo">Condominium</SelectItem>
                            <SelectItem value="mobile">Mobile Home</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="petExposure"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Regular exposure to pets
                        </FormLabel>
                        <FormDescription>
                          Do you live with or have regular contact with pets?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chemicalExposure"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Chemical Exposures (select all that apply)</FormLabel>
                        <FormDescription>
                          Have you been exposed to any of these chemicals regularly?
                        </FormDescription>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {chemicalExposureOptions.map((exposure) => (
                          <FormField
                            key={exposure}
                            control={form.control}
                            name="chemicalExposure"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={exposure}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(exposure)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, exposure])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== exposure
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {exposure}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Medical History */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope className="mr-2 h-5 w-5 text-red-500" />
                  Medical History
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Help us understand your Morgellons experience and medical background.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="diagnosisYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year of Diagnosis/Symptom Onset</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="2020"
                            min={1990}
                            max={new Date().getFullYear()}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="symptomSeverity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Overall Symptom Severity (1-10)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num} - {num <= 3 ? 'Mild' : num <= 6 ? 'Moderate' : num <= 8 ? 'Severe' : 'Very Severe'}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="initialSymptoms"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Initial Symptoms (when condition started)</FormLabel>
                        <FormDescription>
                          Select all symptoms you experienced when your condition first began.
                        </FormDescription>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {symptomOptions.map((symptom) => (
                          <FormField
                            key={symptom}
                            control={form.control}
                            name="initialSymptoms"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={symptom}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(symptom)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, symptom])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== symptom
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-sm">
                                    {symptom}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentSymptoms"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Current Symptoms</FormLabel>
                        <FormDescription>
                          Select all symptoms you currently experience.
                        </FormDescription>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {symptomOptions.map((symptom) => (
                          <FormField
                            key={symptom}
                            control={form.control}
                            name="currentSymptoms"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={symptom}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(symptom)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, symptom])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== symptom
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-sm">
                                    {symptom}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otherConditions"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Other Medical Conditions</FormLabel>
                        <FormDescription>
                          Select any other medical conditions you have been diagnosed with.
                        </FormDescription>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {conditionOptions.map((condition) => (
                          <FormField
                            key={condition}
                            control={form.control}
                            name="otherConditions"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={condition}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(condition)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, condition])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== condition
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-sm">
                                    {condition}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 4: Lifestyle Factors */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-orange-500" />
                  Lifestyle Factors
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Lifestyle factors may influence symptoms and help researchers identify patterns.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="smokingStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Smoking Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select smoking status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="never">Never smoked</SelectItem>
                            <SelectItem value="former">Former smoker</SelectItem>
                            <SelectItem value="current">Current smoker</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alcoholUse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alcohol Use</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select alcohol use" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="occasional">Occasional (1-2 drinks/week)</SelectItem>
                            <SelectItem value="regular">Regular (3-7 drinks/week)</SelectItem>
                            <SelectItem value="heavy">Heavy (8+ drinks/week)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="exerciseFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise Frequency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select exercise frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="rare">Rarely (less than 1x/week)</SelectItem>
                            <SelectItem value="occasional">Occasional (1-2x/week)</SelectItem>
                            <SelectItem value="regular">Regular (3-4x/week)</SelectItem>
                            <SelectItem value="frequent">Frequent (5+ times/week)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dietType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diet Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select diet type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">Standard/Mixed</SelectItem>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                            <SelectItem value="vegan">Vegan</SelectItem>
                            <SelectItem value="keto">Ketogenic</SelectItem>
                            <SelectItem value="paleo">Paleo</SelectItem>
                            <SelectItem value="gluten-free">Gluten-free</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="stressLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Stress Level (1-10)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stress level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num} - {num <= 3 ? 'Low' : num <= 6 ? 'Moderate' : 'High'}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sleepQuality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sleep Quality (1-10)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sleep quality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num} - {num <= 3 ? 'Poor' : num <= 6 ? 'Fair' : 'Good'}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Research Participation */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FlaskConical className="mr-2 h-5 w-5 text-purple-500" />
                  Research Participation
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Help advance Morgellons research and improve treatments for future patients.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="willingToParticipate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-base">
                          I am willing to participate in research studies
                        </FormLabel>
                        <FormDescription>
                          This includes sharing anonymized data and potentially participating in surveys or studies.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('willingToParticipate') && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="preferredContactMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Contact Method for Studies</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select contact method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="app">In-app notifications</SelectItem>
                              <SelectItem value="mail">Physical mail</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availabilityForStudies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability for Studies</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select availability" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="surveys-only">Surveys only</SelectItem>
                              <SelectItem value="low">Low (1-2 hours/month)</SelectItem>
                              <SelectItem value="moderate">Moderate (3-5 hours/month)</SelectItem>
                              <SelectItem value="high">High (6+ hours/month)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="compensationPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compensation Preference</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No compensation needed</SelectItem>
                              <SelectItem value="monetary">Monetary compensation</SelectItem>
                              <SelectItem value="gift-cards">Gift cards</SelectItem>
                              <SelectItem value="donations">Donations to research</SelectItem>
                              <SelectItem value="results">Study results access</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Why participate in research?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Help identify patterns and potential triggers</li>
                    <li>• Contribute to developing better treatments</li>
                    <li>• Support evidence-based medical recognition</li>
                    <li>• Advance understanding of this complex condition</li>
                    <li>• Your privacy and anonymity are always protected</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {onSkip && (
                <Button type="button" variant="ghost" onClick={onSkip}>
                  Skip for now
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Profile
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};