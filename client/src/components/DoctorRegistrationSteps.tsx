import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  MapPin, 
  Shield,
  Building,
  Stethoscope,
  Clock,
  DollarSign,
  FileText
} from 'lucide-react';

// Import all the constants from DoctorLogin
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

export const MEDICAL_SPECIALTIES = [
  'Dermatology', 'Internal Medicine', 'Infectious Disease', 'Rheumatology',
  'Neurology', 'Psychiatry', 'Family Medicine', 'Emergency Medicine',
  'Pathology', 'Immunology', 'Pain Management', 'Environmental Medicine',
  'Integrative Medicine', 'Functional Medicine', 'Allergy & Immunology',
  'Endocrinology', 'Gastroenterology', 'Hematology', 'Oncology', 'Other'
];

export const BOARD_CERTIFICATIONS = [
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

export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi', 'Other'
];

export const INSURANCE_TYPES = [
  'Medicare', 'Medicaid', 'Blue Cross Blue Shield', 'Aetna', 'Cigna',
  'UnitedHealthcare', 'Humana', 'Kaiser Permanente', 'Anthem',
  'Private Pay', 'HSA/FSA', 'Workers Compensation', 'Other'
];

export const CONSULTATION_TYPES = [
  'Initial Consultation', 'Follow-up Visit', 'Second Opinion',
  'Treatment Planning', 'Diagnostic Review', 'Telehealth Consultation',
  'Emergency Consultation', 'Research Consultation'
];

export const PAYMENT_METHODS = [
  'Cash', 'Credit Card', 'Debit Card', 'Check', 'PayPal',
  'Venmo', 'Zelle', 'Bank Transfer', 'HSA/FSA', 'Insurance Direct Billing'
];

export const MORGELLONS_TRAINING = [
  'Charles E. Holman Morgellons Disease Foundation Training',
  'International Lyme and Associated Diseases Society (ILADS)',
  'Biotoxin Illness Certification',
  'Mold and Mycotoxin Training',
  'Environmental Medicine Certification',
  'Functional Medicine Training',
  'Self-directed Research and Study',
  'Other'
];

interface RegistrationStepProps {
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  toggleArrayField: (fieldName: string, value: string) => void;
  toggleState: (state: string) => void;
}

export const Step2MedicalCredentials: React.FC<RegistrationStepProps> = ({
  register, watch, setValue, errors, toggleArrayField
}) => {
  const watchedSecondarySpecialties = watch('secondarySpecialties') || [];
  const watchedBoardCerts = watch('boardCertifications') || [];

  return (
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
          <Label htmlFor="licenseState">License State</Label>
          <Select onValueChange={(value) => setValue('licenseState', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select license state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.licenseState && (
            <p className="text-sm text-red-600">{errors.licenseState.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <Label htmlFor="deaNumber">DEA Number (Optional)</Label>
          <Input
            id="deaNumber"
            {...register('deaNumber')}
            placeholder="AB1234567"
          />
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

      {/* Secondary Specialties */}
      <div className="space-y-4">
        <Label>Secondary Specialties (Optional)</Label>
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-4">
          {MEDICAL_SPECIALTIES.map((specialty) => (
            <div key={specialty} className="flex items-center space-x-2">
              <Checkbox
                id={`secondary-${specialty}`}
                checked={watchedSecondarySpecialties.includes(specialty)}
                onCheckedChange={() => toggleArrayField('secondarySpecialties', specialty)}
              />
              <Label htmlFor={`secondary-${specialty}`} className="text-sm">
                {specialty}
              </Label>
            </div>
          ))}
        </div>
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
          <Label htmlFor="residencyYear">Residency Completion Year (Optional)</Label>
          <Input
            id="residencyYear"
            type="number"
            {...register('residencyYear', { valueAsNumber: true })}
            placeholder="2014"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fellowship">Fellowship (Optional)</Label>
          <Input
            id="fellowship"
            {...register('fellowship')}
            placeholder="Infectious Disease Fellowship"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fellowshipYear">Fellowship Completion Year (Optional)</Label>
          <Input
            id="fellowshipYear"
            type="number"
            {...register('fellowshipYear', { valueAsNumber: true })}
            placeholder="2015"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsExperience">Total Years of Experience</Label>
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

      {/* Board Certifications */}
      <div className="space-y-4">
        <Label>Board Certifications</Label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-4">
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
  );
};

export const Step3PracticeInformation: React.FC<RegistrationStepProps> = ({
  register, watch, setValue, errors, toggleState
}) => {
  const watchedStates = watch('practiceStates') || [];
  const watchedLanguages = watch('languages') || [];

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-900 flex items-center gap-2">
        <Building className="h-4 w-4" />
        Practice Information & Location
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="officePhone">Office Phone (Optional)</Label>
          <Input
            id="officePhone"
            type="tel"
            {...register('officePhone')}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            type="url"
            {...register('website')}
            placeholder="https://drsmith.com"
          />
        </div>
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

      {/* Languages */}
      <div className="space-y-4">
        <Label>Languages Spoken</Label>
        <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto border rounded-lg p-4">
          {LANGUAGES.map((language) => (
            <div key={language} className="flex items-center space-x-2">
              <Checkbox
                id={`language-${language}`}
                checked={watchedLanguages.includes(language)}
                onCheckedChange={() => toggleArrayField('languages', language)}
              />
              <Label htmlFor={`language-${language}`} className="text-sm">
                {language}
              </Label>
            </div>
          ))}
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
    </div>
  );
};