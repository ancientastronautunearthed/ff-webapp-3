import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  GraduationCap, 
  MapPin, 
  Shield,
  UserCheck,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
  specialty: z.string().min(1, 'Specialty required'),
  yearsExperience: z.number().min(0, 'Years of experience required'),
  practiceStates: z.array(z.string()).min(1, 'At least one practice state required'),
  institution: z.string().min(2, 'Institution/practice name required'),
  morgellonsExperience: z.boolean(),
  morgellonsDescription: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'Must accept terms'),
  verificationConsent: z.boolean().refine(val => val === true, 'Must consent to verification')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type DoctorRegistrationData = z.infer<typeof doctorRegistrationSchema>;

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
  'Pathology', 'Immunology', 'Pain Management', 'Other'
];

export default function DoctorLogin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);

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
      morgellonsExperience: false,
      termsAccepted: false,
      verificationConsent: false
    }
  });

  const watchedStates = watch('practiceStates') || [];
  const watchedMorgellonsExp = watch('morgellonsExperience');

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const { loginWithEmail } = await import('@/lib/auth');
      await loginWithEmail(data.email, data.password);
      
      // Set doctor role in localStorage
      localStorage.setItem('userRole', 'doctor');
      
      toast({
        title: "Welcome Back, Doctor",
        description: "Successfully logged in to your medical dashboard.",
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (data: DoctorRegistrationData) => {
    setIsLoading(true);
    try {
      // Register with Firebase
      const { registerWithEmail } = await import('@/lib/auth');
      await registerWithEmail(data.email, data.password);
      
      // Save doctor profile to Firestore
      const { createDoctorProfile } = await import('@/lib/firestore');
      await createDoctorProfile({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        medicalLicense: data.medicalLicense,
        specialty: data.specialty,
        yearsExperience: data.yearsExperience,
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
      <Card className="w-full max-w-2xl">
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
            // Registration Form
            <form onSubmit={handleSubmit(handleRegistration)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Personal Information
                </h3>
                
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
                      placeholder="Smith"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Professional Email</Label>
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
                      placeholder="Minimum 8 characters"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>
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

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Professional Information
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
                    <Label htmlFor="specialty">Primary Specialty</Label>
                    <Select onValueChange={(value) => setValue('specialty', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      {...register('yearsExperience', { valueAsNumber: true })}
                      placeholder="10"
                    />
                    {errors.yearsExperience && (
                      <p className="text-sm text-red-600">{errors.yearsExperience.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution/Practice</Label>
                    <Input
                      id="institution"
                      {...register('institution')}
                      placeholder="Hospital or clinic name"
                    />
                    {errors.institution && (
                      <p className="text-sm text-red-600">{errors.institution.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Practice States */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  States of Practice
                </h3>
                <p className="text-sm text-gray-600">
                  Select all states where you are licensed to practice
                </p>
                
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-4">
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

              {/* Morgellons Experience */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Morgellons Disease Experience
                </h3>

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
                  <div className="space-y-2">
                    <Label htmlFor="morgellonsDescription">
                      Describe your experience (optional)
                    </Label>
                    <Textarea
                      id="morgellonsDescription"
                      {...register('morgellonsDescription')}
                      placeholder="Briefly describe your experience with Morgellons patients..."
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Terms and Verification */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="termsAccepted"
                    onCheckedChange={(checked) => setValue('termsAccepted', !!checked)}
                  />
                  <Label htmlFor="termsAccepted" className="text-sm">
                    I agree to the medical professional terms of service and code of ethics
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
                    I consent to verification of my medical credentials and background check
                  </Label>
                </div>
                {errors.verificationConsent && (
                  <p className="text-sm text-red-600">{errors.verificationConsent.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Verification Required</span>
                  </div>
                  <p className="text-sm text-amber-700 mt-1">
                    All doctor accounts require verification before platform access is granted.
                    This typically takes 24-48 hours.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Submitting Registration...' : 'Register Medical Account'}
                </Button>

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
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}