import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Stethoscope, 
  GraduationCap, 
  MapPin, 
  Shield,
  UserCheck,
  CheckCircle2,
  Building
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const doctorRegistrationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  medicalLicense: z.string().min(5, 'Medical license number required'),
  licenseState: z.string().min(1, 'License state required'),
  specialty: z.string().min(1, 'Primary specialty required'),
  secondarySpecialties: z.array(z.string()).default([]),
  yearsExperience: z.number().min(0, 'Years of experience required'),
  practiceStates: z.array(z.string()).min(1, 'At least one practice state required'),
  
  // Contact Information
  phone: z.string().min(10, 'Valid phone number required'),
  emergencyContact: z.string().optional(),
  preferredContact: z.enum(['email', 'phone', 'both']).default('email'),
  
  // Practice Information
  institution: z.string().min(2, 'Institution/practice name required'),
  practiceName: z.string().optional(),
  officeAddress: z.string().min(5, 'Office address required'),
  officeCity: z.string().min(2, 'Office city required'),
  officeState: z.string().min(2, 'Office state required'),
  officeZip: z.string().min(5, 'Valid ZIP code required'),
  officePhone: z.string().optional(),
  website: z.string().optional(),
  
  // Education & Credentials
  medicalSchool: z.string().min(3, 'Medical school required'),
  graduationYear: z.number().min(1950).max(new Date().getFullYear()),
  residency: z.string().min(3, 'Residency program required'),
  residencyYear: z.number().optional(),
  fellowship: z.string().optional(),
  fellowshipYear: z.number().optional(),
  boardCertifications: z.array(z.string()).default([]),
  additionalCertifications: z.array(z.string()).default([]),
  medicalLicenseExpiry: z.string().optional(),
  deaNumber: z.string().optional(),
  npiNumber: z.string().min(10, 'Valid NPI number required'),
  
  // Professional Details
  languages: z.array(z.string()).default(['English']),
  hospitalAffiliations: z.array(z.string()).default([]),
  insuranceAccepted: z.array(z.string()).default([]),
  consultationTypes: z.array(z.string()).default([]),
  
  // Service Information
  telehealth: z.boolean().default(true),
  inPerson: z.boolean().default(false),
  houseCalls: z.boolean().default(false),
  emergencyConsults: z.boolean().default(false),
  officeHours: z.string().optional(),
  appointmentDuration: z.number().default(30),
  consultationFee: z.number().optional(),
  acceptsInsurance: z.boolean().default(true),
  paymentMethods: z.array(z.string()).default([]),
  
  // Professional Background
  bio: z.string().min(50, 'Professional bio required (minimum 50 characters)'),
  researchInterests: z.array(z.string()).default([]),
  publications: z.number().default(0),
  teachingExperience: z.boolean().default(false),
  academicAffiliation: z.string().optional(),
  
  // Morgellons Specific
  morgellonsExperience: z.boolean(),
  morgellonsYears: z.number().optional(),
  morgellonsPatients: z.number().optional(),
  morgellonsDescription: z.string().optional(),
  morgellonsTraining: z.array(z.string()).default([]),
  
  // Verification
  termsAccepted: z.boolean().refine(val => val === true, 'Must accept terms'),
  verificationConsent: z.boolean().refine(val => val === true, 'Must consent to verification'),
  backgroundCheck: z.boolean().refine(val => val === true, 'Must consent to background check'),
  
  // Profile Picture
  profilePicture: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const MEDICAL_SPECIALTIES = [
  'Dermatology', 'Internal Medicine', 'Infectious Disease', 'Rheumatology',
  'Neurology', 'Psychiatry', 'Family Medicine', 'Emergency Medicine',
  'Pathology', 'Immunology', 'Pain Management', 'Environmental Medicine',
  'Integrative Medicine', 'Functional Medicine', 'Allergy & Immunology',
  'Endocrinology', 'Gastroenterology', 'Hematology', 'Oncology', 'Other'
];

const BOARD_CERTIFICATIONS = [
  'American Board of Internal Medicine',
  'American Board of Dermatology',
  'American Board of Psychiatry and Neurology',
  'American Board of Family Medicine',
  'American Board of Emergency Medicine',
  'American Board of Pathology',
  'American Board of Allergy and Immunology',
  'American Board of Medical Specialties',
  'Other'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi', 'Other'
];

const INSURANCE_TYPES = [
  'Medicare', 'Medicaid', 'Blue Cross Blue Shield', 'Aetna', 'Cigna',
  'UnitedHealthcare', 'Humana', 'Kaiser Permanente', 'Anthem',
  'Private Pay', 'HSA/FSA', 'Workers Compensation', 'Other'
];

const CONSULTATION_TYPES = [
  'Initial Consultation', 'Follow-up Visit', 'Second Opinion',
  'Treatment Planning', 'Diagnostic Review', 'Telehealth Consultation',
  'Emergency Consultation', 'Research Consultation'
];

const PAYMENT_METHODS = [
  'Cash', 'Credit Card', 'Debit Card', 'Check', 'PayPal',
  'Venmo', 'Zelle', 'Bank Transfer', 'HSA/FSA', 'Insurance Direct Billing'
];

const MORGELLONS_TRAINING = [
  'Charles E. Holman Morgellons Disease Foundation Training',
  'International Lyme and Associated Diseases Society (ILADS)',
  'Biotoxin Illness Certification',
  'Mold and Mycotoxin Training',
  'Environmental Medicine Certification',
  'Functional Medicine Training',
  'Self-directed Research and Study',
  'Other'
];

type DoctorRegistrationData = z.infer<typeof doctorRegistrationSchema>;

export default function DoctorLogin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<DoctorRegistrationData>({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: {
      practiceStates: [],
      secondarySpecialties: [],
      boardCertifications: [],
      languages: ['English'],
      hospitalAffiliations: [],
      insuranceAccepted: [],
      consultationTypes: [],
      paymentMethods: [],
      researchInterests: [],
      morgellonsTraining: [],
      morgellonsExperience: false,
      telehealth: true,
      inPerson: false,
      houseCalls: false,
      emergencyConsults: false,
      acceptsInsurance: true,
      teachingExperience: false,
      publications: 0,
      appointmentDuration: 30,
      preferredContact: 'email',
      termsAccepted: false,
      verificationConsent: false,
      backgroundCheck: false
    }
  });

  const watchedStates = watch('practiceStates') || [];
  const watchedMorgellonsExp = watch('morgellonsExperience');
  const watchedBoardCerts = watch('boardCertifications') || [];

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      // Mock login logic for now
      toast({
        title: "Login Successful",
        description: "Welcome to the Fiber Friends medical portal!",
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (data: DoctorRegistrationData) => {
    setIsLoading(true);
    try {
      // Mock registration logic for now
      console.log('Registering doctor:', {
        ...data,
        practiceStates: data.practiceStates,
        institution: data.institution,
        morgellonsExperience: data.morgellonsExperience,
        morgellonsDescription: data.morgellonsDescription || '',
        verificationStatus: 'pending',
        registrationDate: new Date().toISOString()
      });
      
      // Set doctor role
      localStorage.setItem('userRole', 'doctor');
      
      setVerificationStep(true);
      
      toast({
        title: "Registration Submitted",
        description: "Your doctor account has been created. Verification is pending.",
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleState = (state: string) => {
    const currentStates = watchedStates;
    const newStates = currentStates.includes(state)
      ? currentStates.filter(s => s !== state)
      : [...currentStates, state];
    setValue('practiceStates', newStates);
  };

  const toggleArrayField = (fieldName: keyof DoctorRegistrationData, value: string) => {
    const currentValues = watch(fieldName) as string[] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(fieldName, newValues as any);
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImagePreview(result);
        setValue('profilePicture', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getTotalSteps = () => 5;
  
  const canProceedToStep = (step: number) => {
    switch (step) {
      case 1: return true; // Basic info step
      case 2: return watch('email') && watch('password') && watch('firstName') && watch('lastName');
      case 3: return watch('medicalLicense') && watch('specialty') && watch('medicalSchool');
      case 4: return watch('phone') && watch('officeAddress') && watch('bio');
      case 5: return watch('termsAccepted') && watch('verificationConsent') && watch('backgroundCheck');
      default: return false;
    }
  };

  if (verificationStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Registration Submitted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              Your doctor account has been created and is pending verification. 
              You'll receive an email within 24-48 hours with verification status.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
              <ul className="text-sm text-blue-700 space-y-1 text-left">
                <li>• Medical license verification</li>
                <li>• Institutional affiliation check</li>
                <li>• Background verification</li>
                <li>• Platform access granted</li>
              </ul>
            </div>
            <Button 
              onClick={() => setVerificationStep(false)}
              variant="outline"
              className="w-full"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Stethoscope className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">
            {isRegistering ? 'Doctor Registration' : 'Doctor Portal Login'}
          </CardTitle>
          <p className="text-gray-600">
            {isRegistering 
              ? 'Join the Fiber Friends medical professional network'
              : 'Access your medical dashboard and patient insights'
            }
          </p>
        </CardHeader>

        <CardContent>
          {!isRegistering ? (
            // Login Form
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Medical Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="doctor@hospital.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In to Medical Portal'}
              </Button>
              
              <div className="mt-4 text-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full mb-3"
                  onClick={() => window.location.href = '/doctor-demo'}
                >
                  View Demo Doctor Dashboard
                </Button>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsRegistering(true)}
                >
                  New to the platform? Register as a doctor
                </Button>
              </div>
            </form>
          ) : (
            // Registration Form with Steps
            <div className="space-y-6">
              {/* Step Progress Indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  {Array.from({ length: getTotalSteps() }, (_, i) => (
                    <div key={i} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          i + 1 <= currentStep
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {i + 1}
                      </div>
                      {i < getTotalSteps() - 1 && (
                        <div
                          className={`w-12 h-1 mx-2 ${
                            i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  Step {currentStep} of {getTotalSteps()}
                </span>
              </div>

              <form onSubmit={handleSubmit(handleRegistration)} className="space-y-6">
                {/* Step 1: Basic Information & Profile Picture */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Basic Information & Profile Picture
                    </h3>
                    
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {profileImagePreview ? (
                            <img
                              src={profileImagePreview}
                              alt="Profile preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCheck className="h-16 w-16 text-gray-400" />
                          )}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                          onClick={() => document.getElementById('profilePicture')?.click()}
                        >
                          <span className="text-xs">+</span>
                        </Button>
                      </div>
                      <input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                      <p className="text-sm text-gray-600 text-center">
                        Upload a professional headshot (optional but recommended)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...register('firstName')}
                          placeholder="John"
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-600">{errors.firstName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...register('lastName')}
                          placeholder="Doe"
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-600">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Medical Email</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          placeholder="doctor@hospital.com"
                        />
                        {errors.email && (
                          <p className="text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register('phone')}
                          placeholder="(555) 123-4567"
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-600">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          {...register('password')}
                          placeholder="Secure password"
                        />
                        {errors.password && (
                          <p className="text-sm text-red-600">{errors.password.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          {...register('confirmPassword')}
                          placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Medical Credentials */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Medical Credentials & Education
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="medicalLicense">Medical License Number</Label>
                        <Input
                          id="medicalLicense"
                          {...register('medicalLicense')}
                          placeholder="License #"
                        />
                        {errors.medicalLicense && (
                          <p className="text-sm text-red-600">{errors.medicalLicense.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="npiNumber">NPI Number</Label>
                        <Input
                          id="npiNumber"
                          {...register('npiNumber')}
                          placeholder="1234567890"
                        />
                        {errors.npiNumber && (
                          <p className="text-sm text-red-600">{errors.npiNumber.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialty">Primary Specialty</Label>
                      <Select onValueChange={(value) => setValue('specialty', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDICAL_SPECIALTIES.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.specialty && (
                        <p className="text-sm text-red-600">{errors.specialty.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="medicalSchool">Medical School</Label>
                        <Input
                          id="medicalSchool"
                          {...register('medicalSchool')}
                          placeholder="Harvard Medical School"
                        />
                        {errors.medicalSchool && (
                          <p className="text-sm text-red-600">{errors.medicalSchool.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="graduationYear">Graduation Year</Label>
                        <Input
                          id="graduationYear"
                          type="number"
                          {...register('graduationYear', { valueAsNumber: true })}
                          placeholder="2010"
                          min="1950"
                          max={new Date().getFullYear()}
                        />
                        {errors.graduationYear && (
                          <p className="text-sm text-red-600">{errors.graduationYear.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="residency">Residency Program</Label>
                        <Input
                          id="residency"
                          {...register('residency')}
                          placeholder="Johns Hopkins Internal Medicine"
                        />
                        {errors.residency && (
                          <p className="text-sm text-red-600">{errors.residency.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="yearsExperience">Years of Experience</Label>
                        <Input
                          id="yearsExperience"
                          type="number"
                          {...register('yearsExperience', { valueAsNumber: true })}
                          placeholder="10"
                          min="0"
                        />
                        {errors.yearsExperience && (
                          <p className="text-sm text-red-600">{errors.yearsExperience.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Board Certifications */}
                    <div className="space-y-4">
                      <Label>Board Certifications</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-4">
                        {BOARD_CERTIFICATIONS.map((cert) => (
                          <div key={cert} className="flex items-center space-x-2">
                            <Checkbox
                              id={`cert-${cert}`}
                              checked={watchedBoardCerts.includes(cert)}
                              onCheckedChange={() => toggleArrayField('boardCertifications', cert)}
                            />
                            <Label htmlFor={`cert-${cert}`} className="text-sm">
                              {cert}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Practice Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Practice Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="institution">Institution/Hospital</Label>
                        <Input
                          id="institution"
                          {...register('institution')}
                          placeholder="Mayo Clinic"
                        />
                        {errors.institution && (
                          <p className="text-sm text-red-600">{errors.institution.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="practiceName">Practice Name (Optional)</Label>
                        <Input
                          id="practiceName"
                          {...register('practiceName')}
                          placeholder="Smith Family Medicine"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="officeAddress">Office Address</Label>
                      <Input
                        id="officeAddress"
                        {...register('officeAddress')}
                        placeholder="123 Medical Plaza Drive"
                      />
                      {errors.officeAddress && (
                        <p className="text-sm text-red-600">{errors.officeAddress.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="officeCity">City</Label>
                        <Input
                          id="officeCity"
                          {...register('officeCity')}
                          placeholder="Boston"
                        />
                        {errors.officeCity && (
                          <p className="text-sm text-red-600">{errors.officeCity.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="officeState">State</Label>
                        <Select onValueChange={(value) => setValue('officeState', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.officeState && (
                          <p className="text-sm text-red-600">{errors.officeState.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="officeZip">ZIP Code</Label>
                        <Input
                          id="officeZip"
                          {...register('officeZip')}
                          placeholder="02101"
                        />
                        {errors.officeZip && (
                          <p className="text-sm text-red-600">{errors.officeZip.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        {...register('bio')}
                        placeholder="Describe your medical background, experience, and approach to patient care..."
                        rows={4}
                      />
                      {errors.bio && (
                        <p className="text-sm text-red-600">{errors.bio.message}</p>
                      )}
                      <p className="text-xs text-gray-500">Minimum 50 characters required</p>
                    </div>

                    {/* States of Practice */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        States of Practice
                      </h4>
                      <p className="text-sm text-gray-600">
                        Select all states where you are licensed to practice
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-lg p-4">
                        {US_STATES.map((state) => (
                          <div key={state} className="flex items-center space-x-2">
                            <Checkbox
                              id={`state-${state}`}
                              checked={watchedStates.includes(state)}
                              onCheckedChange={() => toggleState(state)}
                            />
                            <Label htmlFor={`state-${state}`} className="text-sm">
                              {state}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {errors.practiceStates && (
                        <p className="text-sm text-red-600">{errors.practiceStates.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Services & Morgellons Experience */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Services & Morgellons Experience
                    </h3>

                    {/* Service Options */}
                    <div className="space-y-4">
                      <Label>Services Offered</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="telehealth"
                            checked={watch('telehealth')}
                            onCheckedChange={(checked) => setValue('telehealth', !!checked)}
                          />
                          <Label htmlFor="telehealth">Telehealth Consultations</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="inPerson"
                            checked={watch('inPerson')}
                            onCheckedChange={(checked) => setValue('inPerson', !!checked)}
                          />
                          <Label htmlFor="inPerson">In-Person Appointments</Label>
                        </div>
                      </div>
                    </div>

                    {/* Morgellons Experience */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Morgellons Disease Experience
                      </h4>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="morgellonsExperience"
                          checked={watchedMorgellonsExp}
                          onCheckedChange={(checked) => setValue('morgellonsExperience', !!checked)}
                        />
                        <Label htmlFor="morgellonsExperience">
                          I have experience treating patients with Morgellons disease
                        </Label>
                      </div>

                      {watchedMorgellonsExp && (
                        <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                          <div className="space-y-2">
                            <Label htmlFor="morgellonsDescription">
                              Describe your experience (optional)
                            </Label>
                            <Textarea
                              id="morgellonsDescription"
                              {...register('morgellonsDescription')}
                              placeholder="Describe your approach to Morgellons treatment, any specialized training, research involvement, etc."
                              rows={3}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: Final Verification */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Verification & Consent
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="termsAccepted"
                          onCheckedChange={(checked) => setValue('termsAccepted', !!checked)}
                        />
                        <Label htmlFor="termsAccepted" className="text-sm">
                          I accept the Terms of Service and agree to maintain professional standards
                          while using this platform for patient care and consultation.
                        </Label>
                      </div>
                      {errors.termsAccepted && (
                        <p className="text-sm text-red-600">{errors.termsAccepted.message}</p>
                      )}

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="verificationConsent"
                          onCheckedChange={(checked) => setValue('verificationConsent', !!checked)}
                        />
                        <Label htmlFor="verificationConsent" className="text-sm">
                          I consent to verification of my medical license, board certifications,
                          and institutional affiliations as part of the credentialing process.
                        </Label>
                      </div>
                      {errors.verificationConsent && (
                        <p className="text-sm text-red-600">{errors.verificationConsent.message}</p>
                      )}

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="backgroundCheck"
                          onCheckedChange={(checked) => setValue('backgroundCheck', !!checked)}
                        />
                        <Label htmlFor="backgroundCheck" className="text-sm">
                          I consent to a background check and verification of my professional
                          standing and any disciplinary actions.
                        </Label>
                      </div>
                      {errors.backgroundCheck && (
                        <p className="text-sm text-red-600">{errors.backgroundCheck.message}</p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Verification Process:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Medical license verification with state boards</li>
                        <li>• Board certification confirmation</li>
                        <li>• Institutional affiliation verification</li>
                        <li>• Professional background check</li>
                        <li>• Review typically completed within 24-48 hours</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  
                  {currentStep < getTotalSteps() ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(Math.min(getTotalSteps(), currentStep + 1))}
                      disabled={!canProceedToStep(currentStep + 1)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Submitting...' : 'Complete Registration'}
                    </Button>
                  )}
                </div>
              </form>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsRegistering(false)}
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}