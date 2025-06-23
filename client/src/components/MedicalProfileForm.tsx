import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CompanionCreatorStep } from './CompanionCreatorStep';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  User, 
  Calendar,
  Scale,
  Ruler,
  Heart,
  AlertTriangle,
  Pill,
  Activity,
  MapPin,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const medicalProfileSchema = z.object({
  // Demographics
  age: z.number().min(1).max(120),
  sex: z.enum(['male', 'female', 'other', 'prefer-not-to-say']),
  height: z.number().min(36).max(96), // inches
  weight: z.number().min(50).max(500), // pounds
  ethnicity: z.string().optional(),
  
  // Geographic
  state: z.string(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  climateZone: z.string().optional(),
  
  // Medical History
  currentDiagnoses: z.array(z.string()).optional(),
  priorDiagnoses: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  foodAllergies: z.array(z.string()).optional(),
  
  // Morgellons Specific
  symptomOnsetDate: z.string(),
  initialSymptoms: z.array(z.string()),
  currentSymptomSeverity: z.number().min(1).max(10),
  fiberObservations: z.array(z.string()).optional(),
  lesionLocations: z.array(z.string()).optional(),
  
  // Lifestyle
  occupation: z.string().optional(),
  smoking: z.enum(['never', 'former', 'current']),
  alcohol: z.enum(['none', 'occasional', 'moderate', 'heavy']),
  exercise: z.enum(['none', 'light', 'moderate', 'heavy']),
  diet: z.string().optional(),
  
  // Environmental Exposures
  chemicalExposures: z.array(z.string()).optional(),
  previousResidence: z.array(z.string()).optional(),
  petExposure: z.array(z.string()).optional(),
  
  // Research Consent
  researchConsent: z.boolean(),
  anonymousDataSharing: z.boolean(),
  contactForStudies: z.boolean().optional()
});

type MedicalProfileData = z.infer<typeof medicalProfileSchema>;

interface MedicalProfileFormProps {
  onComplete: (data: MedicalProfileData) => void;
  isNewUser?: boolean;
}

export const MedicalProfileForm = ({ onComplete, isNewUser = true }: MedicalProfileFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showCompanionCreator, setShowCompanionCreator] = useState(false);
  const [companionData, setCompanionData] = useState<{imageUrl: string, config: any} | null>(null);
  const { toast } = useToast();

  // States/Provinces dropdown options (US, Canada, Mexico)
  const STATES_PROVINCES = [
    // US States and Territories
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
    'Puerto Rico', 'US Virgin Islands', 'American Samoa', 'Guam', 'Northern Mariana Islands',
    
    // Canadian Provinces and Territories
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
    'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
    'Quebec', 'Saskatchewan', 'Yukon',
    
    // Mexican States
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua',
    'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México',
    'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro',
    'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala',
    'Veracruz', 'Yucatán', 'Zacatecas', 'Mexico City'
  ];

  // Ethnicity dropdown options
  const ETHNICITIES = [
    'Hispanic or Latino',
    'Not Hispanic or Latino',
    'White',
    'Black or African American',
    'American Indian or Alaska Native',
    'Asian',
    'Native Hawaiian or Other Pacific Islander',
    'Mixed Race',
    'Middle Eastern or North African',
    'Prefer not to answer',
    'Other'
  ];

  console.log('MedicalProfileForm state:', { currentStep, showCompanionCreator });

  // Define companion creator handlers first
  const handleCompanionCreated = (imageUrl: string, config: any) => {
    console.log('Companion created:', { imageUrl, config });
    setCompanionData({ imageUrl, config });
    
    toast({
      title: "Profile & Companion Complete!",
      description: "Your medical profile and AI companion have been created successfully.",
    });
    
    onComplete();
  };

  const handleSkipCompanion = () => {
    console.log('Companion creation skipped');
    toast({
      title: "Profile Complete!",
      description: "You can create your AI companion later from settings.",
    });
    
    onComplete();
  };

  // Show companion creator if flag is set
  if (showCompanionCreator) {
    console.log('Rendering CompanionCreatorStep');
    return (
      <CompanionCreatorStep
        onComplete={handleCompanionCreated}
        onSkip={handleSkipCompanion}
      />
    );
  }

  const form = useForm<MedicalProfileData>({
    resolver: zodResolver(medicalProfileSchema),
    defaultValues: {
      researchConsent: false,
      anonymousDataSharing: false,
      currentSymptomSeverity: 5,
      smoking: 'never',
      alcohol: 'none',
      exercise: 'moderate',
      currentDiagnoses: [],
      allergies: [],
      initialSymptoms: []
    }
  });

  const commonAllergies = [
    'Penicillin', 'Sulfa drugs', 'Aspirin', 'NSAIDs', 'Latex', 'Shellfish', 
    'Tree nuts', 'Peanuts', 'Eggs', 'Dairy', 'Soy', 'Wheat/Gluten',
    'Pollen', 'Dust mites', 'Pet dander', 'Mold', 'Bee stings', 'Chemical fragrances'
  ];

  const morgellonsSymptoms = [
    'Crawling sensations', 'Stinging sensations', 'Biting sensations',
    'Skin lesions', 'Fiber emergence', 'Intense itching', 'Brain fog',
    'Fatigue', 'Joint pain', 'Memory problems', 'Sleep disturbances',
    'Mood changes', 'Vision problems', 'Digestive issues'
  ];

  const currentDiagnosesList = [
    'Fibromyalgia', 'Chronic Fatigue Syndrome', 'Autoimmune disease',
    'Depression', 'Anxiety', 'PTSD', 'Lyme disease', 'Diabetes',
    'Hypertension', 'Thyroid disorder', 'Arthritis', 'Skin conditions'
  ];

  const bodyAreas = [
    'Face', 'Scalp', 'Arms', 'Hands', 'Torso', 'Back', 'Legs', 'Feet'
  ];

  const onSubmit = async (data: MedicalProfileData) => {
    try {
      // Validate research consent is checked
      if (!data.researchConsent || !data.anonymousDataSharing) {
        toast({
          title: "Research Consent Required",
          description: "Please consent to research participation and data sharing to continue.",
          variant: "destructive",
        });
        return;
      }

      // Add selected arrays to form data
      data.allergies = selectedAllergies;
      data.initialSymptoms = selectedSymptoms;
      
      // Log comprehensive data being collected
      console.log('Comprehensive medical data collected:', {
        demographics: {
          age: data.age,
          sex: data.sex,
          height: data.height,
          weight: data.weight,
          ethnicity: data.ethnicity,
          location: `${data.state}, ${data.zipCode}`
        },
        medicalHistory: {
          diagnoses: data.currentDiagnoses,
          medications: data.currentMedications,
          allergies: data.allergies
        },
        morgellonsProfile: {
          onsetDate: data.symptomOnsetDate,
          severity: data.currentSymptomSeverity,
          symptoms: data.initialSymptoms,
          affectedAreas: data.lesionLocations
        },
        lifestyle: {
          occupation: data.occupation,
          smoking: data.smoking,
          alcohol: data.alcohol,
          exercise: data.exercise,
          diet: data.diet
        },
        environmental: {
          exposures: data.chemicalExposures,
          pets: data.petExposure
        },
        research: {
          consent: data.researchConsent,
          dataSharing: data.anonymousDataSharing,
          contactForStudies: data.contactForStudies || false
        }
      });
      
      toast({
        title: "Medical Profile Complete!",
        description: "Your comprehensive health information and research participation preferences have been saved.",
      });

      // Call onComplete with the validated data
      onComplete(data);
      
    } catch (error) {
      console.error('Error saving medical profile:', error);
      toast({
        title: "Profile Save Error",
        description: "Failed to save medical profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const steps = [
    { number: 1, title: 'Demographics', icon: User },
    { number: 2, title: 'Medical History', icon: Heart },
    { number: 3, title: 'Morgellons Symptoms', icon: Activity },
    { number: 4, title: 'Lifestyle & Environment', icon: MapPin },
    { number: 5, title: 'Research Consent', icon: ShieldCheck }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isNewUser ? 'Complete Your Medical Profile' : 'Update Medical Profile'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Help advance Morgellons research by providing comprehensive health information
          </p>
        </CardHeader>

        {/* Progress Indicator */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive ? 'bg-primary-500 border-primary-500 text-white' :
                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                    'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`absolute w-16 h-0.5 mt-5 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} style={{ left: `${(index * 100) / (steps.length - 1) + 10}%` }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Demographics */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Demographics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age" className="text-sm font-medium text-gray-700 mb-2 block">
                      Age *
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      placeholder="Enter your age"
                      {...form.register('age', { valueAsNumber: true })}
                    />
                    {form.formState.errors.age && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.age.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Sex *</Label>
                    <Select onValueChange={(value) => form.setValue('sex', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sex assigned at birth" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="height" className="text-sm font-medium text-gray-700 mb-2 block">
                      Height (inches) *
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      min="36"
                      max="96"
                      placeholder="e.g., 68"
                      {...form.register('height', { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="weight" className="text-sm font-medium text-gray-700 mb-2 block">
                      Weight (pounds) *
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      min="50"
                      max="500"
                      placeholder="e.g., 150"
                      {...form.register('weight', { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700 mb-2 block">
                      State/Province *
                    </Label>
                    <Select onValueChange={(value) => form.setValue('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state or province" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES_PROVINCES.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700 mb-2 block">
                      ZIP/Postal Code *
                    </Label>
                    <Input
                      id="zipCode"
                      placeholder="e.g., 90210"
                      {...form.register('zipCode')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ethnicity" className="text-sm font-medium text-gray-700 mb-2 block">
                    Ethnicity (Optional)
                  </Label>
                  <Select onValueChange={(value) => form.setValue('ethnicity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      {ETHNICITIES.map((ethnicity) => (
                        <SelectItem key={ethnicity} value={ethnicity}>
                          {ethnicity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Medical History */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h3>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Current Medical Diagnoses
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {currentDiagnosesList.map((diagnosis) => (
                      <label key={diagnosis} className="flex items-center space-x-2">
                        <Checkbox
                          onCheckedChange={(checked) => {
                            const current = form.getValues('currentDiagnoses') || [];
                            if (checked) {
                              form.setValue('currentDiagnoses', [...current, diagnosis]);
                            } else {
                              form.setValue('currentDiagnoses', current.filter(d => d !== diagnosis));
                            }
                          }}
                        />
                        <span className="text-sm">{diagnosis}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Known Allergies & Sensitivities
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    {commonAllergies.map((allergy) => (
                      <label key={allergy} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedAllergies.includes(allergy)}
                          onCheckedChange={() => toggleAllergy(allergy)}
                        />
                        <span className="text-sm">{allergy}</span>
                      </label>
                    ))}
                  </div>
                  {selectedAllergies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedAllergies.map((allergy) => (
                        <Badge key={allergy} variant="secondary" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="currentMedications" className="text-sm font-medium text-gray-700 mb-2 block">
                    Current Medications (List all)
                  </Label>
                  <Textarea
                    id="currentMedications"
                    placeholder="List all current medications, supplements, and dosages..."
                    className="min-h-[100px]"
                    onChange={(e) => form.setValue('currentMedications', e.target.value.split('\n').filter(m => m.trim()))}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Morgellons Symptoms */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Morgellons Symptom Profile</h3>
                
                <div>
                  <Label htmlFor="symptomOnsetDate" className="text-sm font-medium text-gray-700 mb-2 block">
                    When did your symptoms first begin? *
                  </Label>
                  <Input
                    id="symptomOnsetDate"
                    type="date"
                    {...form.register('symptomOnsetDate')}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Initial Symptoms (when symptoms first appeared)
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {morgellonsSymptoms.map((symptom) => (
                      <label key={symptom} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedSymptoms.includes(symptom)}
                          onCheckedChange={() => toggleSymptom(symptom)}
                        />
                        <span className="text-sm">{symptom}</span>
                      </label>
                    ))}
                  </div>
                  {selectedSymptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedSymptoms.map((symptom) => (
                        <Badge key={symptom} variant="secondary" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="currentSymptomSeverity" className="text-sm font-medium text-gray-700 mb-2 block">
                    Current Overall Symptom Severity (1-10) *
                  </Label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Mild</span>
                    <Input
                      id="currentSymptomSeverity"
                      type="range"
                      min="1"
                      max="10"
                      className="flex-1"
                      {...form.register('currentSymptomSeverity', { valueAsNumber: true })}
                    />
                    <span className="text-sm text-gray-500">Severe</span>
                    <span className="text-lg font-bold text-primary-600 min-w-[2rem]">
                      {form.watch('currentSymptomSeverity')}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Primary Lesion/Symptom Locations
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {bodyAreas.map((area) => (
                      <label key={area} className="flex items-center space-x-2">
                        <Checkbox
                          onCheckedChange={(checked) => {
                            const current = form.getValues('lesionLocations') || [];
                            if (checked) {
                              form.setValue('lesionLocations', [...current, area]);
                            } else {
                              form.setValue('lesionLocations', current.filter(l => l !== area));
                            }
                          }}
                        />
                        <span className="text-sm">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Lifestyle & Environment */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifestyle & Environmental Factors</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="occupation" className="text-sm font-medium text-gray-700 mb-2 block">
                      Occupation/Work Environment
                    </Label>
                    <Input
                      id="occupation"
                      placeholder="e.g., Office worker, Healthcare, Construction"
                      {...form.register('occupation')}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Smoking Status</Label>
                    <Select onValueChange={(value) => form.setValue('smoking', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select smoking status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never smoked</SelectItem>
                        <SelectItem value="former">Former smoker</SelectItem>
                        <SelectItem value="current">Current smoker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Alcohol Consumption</Label>
                    <Select onValueChange={(value) => form.setValue('alcohol', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select alcohol consumption" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="occasional">Occasional (1-2 drinks/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (3-7 drinks/week)</SelectItem>
                        <SelectItem value="heavy">Heavy (8+ drinks/week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Exercise Level</Label>
                    <Select onValueChange={(value) => form.setValue('exercise', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="light">Light (1-2 times/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (3-4 times/week)</SelectItem>
                        <SelectItem value="heavy">Heavy (5+ times/week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="diet" className="text-sm font-medium text-gray-700 mb-2 block">
                    Diet Type/Restrictions
                  </Label>
                  <Input
                    id="diet"
                    placeholder="e.g., Standard, Vegetarian, Keto, Gluten-free, etc."
                    {...form.register('diet')}
                  />
                </div>

                <div>
                  <Label htmlFor="chemicalExposures" className="text-sm font-medium text-gray-700 mb-2 block">
                    Chemical/Environmental Exposures
                  </Label>
                  <Textarea
                    id="chemicalExposures"
                    placeholder="List any significant chemical exposures, mold, industrial work, etc."
                    onChange={(e) => form.setValue('chemicalExposures', e.target.value.split('\n').filter(e => e.trim()))}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Research Consent */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Participation</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">Help Advance Morgellons Research</h4>
                  <p className="text-blue-800 text-sm">
                    Your anonymized data can help researchers identify patterns, triggers, and potential treatments 
                    for Morgellons disease. All personal identifiers are removed before analysis.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <Checkbox
                      checked={form.watch('researchConsent')}
                      onCheckedChange={(checked) => form.setValue('researchConsent', !!checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">
                        I consent to participate in Morgellons research *
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        Your symptom data, treatments tried, and outcomes will be anonymized and used for research purposes.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <Checkbox
                      checked={form.watch('anonymousDataSharing')}
                      onCheckedChange={(checked) => form.setValue('anonymousDataSharing', !!checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">
                        Allow anonymous data sharing with medical professionals *
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        Doctors and researchers can access aggregated, anonymized data to identify patterns and correlations.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <Checkbox
                      checked={form.watch('contactForStudies')}
                      onCheckedChange={(checked) => form.setValue('contactForStudies', !!checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">
                        Contact me about future research opportunities (Optional)
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        Receive invitations to participate in clinical studies or surveys related to Morgellons research.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Privacy Protection</h4>
                  <ul className="text-yellow-800 text-sm space-y-1">
                    <li>• All data is encrypted and stored securely</li>
                    <li>• Personal identifiers are removed before research use</li>
                    <li>• You can withdraw consent at any time</li>
                    <li>• Data is only shared with qualified medical researchers</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <Separator />
            <div className="flex justify-between pt-4 bg-gray-50 px-6 py-4 -mx-6 -mb-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="bg-white hover:bg-gray-50 border-gray-300"
              >
                Previous
              </Button>
              
              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-2 border-blue-700"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={!form.watch('researchConsent') || !form.watch('anonymousDataSharing')}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  onClick={(e) => {
                    console.log('Submit button clicked, research consent:', form.watch('researchConsent'), 'data sharing:', form.watch('anonymousDataSharing'));
                    if (!form.watch('researchConsent') || !form.watch('anonymousDataSharing')) {
                      e.preventDefault();
                      toast({
                        title: "Research Consent Required",
                        description: "Please check both research consent checkboxes to continue.",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    // Show companion creator after profile completion
                    console.log('Setting showCompanionCreator to true');
                    setShowCompanionCreator(true);
                  }}
                >
                  Complete Profile & Create Companion
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl mx-auto border-2 border-blue-200 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center border-b border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            Medical Profile Setup
          </CardTitle>
          <p className="text-blue-100 mt-2">
            Help us understand your health journey for personalized insights and research contribution
          </p>
          
          <div className="mt-4">
            <div className="flex justify-center space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    step <= currentStep ? 'bg-white' : 'bg-blue-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-blue-100">Step {currentStep} of 5</p>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}
            
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="bg-white hover:bg-gray-50 border-gray-300"
              >
                Previous
              </Button>
              
              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-2 border-blue-700"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={!form.watch('researchConsent') || !form.watch('anonymousDataSharing')}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  onClick={(e) => {
                    console.log('Submit button clicked, research consent:', form.watch('researchConsent'), 'data sharing:', form.watch('anonymousDataSharing'));
                    if (!form.watch('researchConsent') || !form.watch('anonymousDataSharing')) {
                      e.preventDefault();
                      toast({
                        title: "Research Consent Required",
                        description: "Please check both research consent checkboxes to continue.",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    setShowCompanionCreator(true);
                  }}
                >
                  Complete Profile & Create Companion
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};