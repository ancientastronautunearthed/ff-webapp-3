import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFile } from '@/lib/storage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Award,
  Building2,
  Clock,
  Upload,
  X,
  Plus
} from 'lucide-react';

interface DoctorProfileFormProps {
  doctorData?: any;
  onSave?: (data: any) => void;
}

export const DoctorProfileForm = ({ doctorData, onSave }: DoctorProfileFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: doctorData?.name || '',
    email: doctorData?.email || user?.email || '',
    specialty: doctorData?.specialty || '',
    licenseNumber: doctorData?.licenseNumber || '',
    state: doctorData?.state || '',
    yearsExperience: doctorData?.yearsExperience || '',
    morgellonsExperience: doctorData?.morgellonsExperience || false,
    profileImage: doctorData?.profileImage || '',
    bio: doctorData?.bio || '',
    phone: doctorData?.phone || '',
    officeAddress: doctorData?.officeAddress || '',
    officeCity: doctorData?.officeCity || '',
    officeState: doctorData?.officeState || '',
    officeZip: doctorData?.officeZip || '',
    medicalSchool: doctorData?.medicalSchool || '',
    residency: doctorData?.residency || '',
    boardCertifications: doctorData?.boardCertifications || [],
    languages: doctorData?.languages || [],
    hospitalAffiliations: doctorData?.hospitalAffiliations || [],
    insuranceAccepted: doctorData?.insuranceAccepted || [],
    telehealth: doctorData?.telehealth || false,
    officeHours: doctorData?.officeHours || '',
    appointmentTypes: doctorData?.appointmentTypes || []
  });

  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newAffiliation, setNewAffiliation] = useState('');
  const [newInsurance, setNewInsurance] = useState('');

  const specialties = [
    'Dermatology',
    'Internal Medicine',
    'Family Medicine',
    'Infectious Disease',
    'Psychiatry',
    'Neurology',
    'Rheumatology',
    'Immunology',
    'Pain Management',
    'Integrative Medicine'
  ];

  const appointmentTypes = [
    'Initial Consultation',
    'Follow-up Visit',
    'Urgent Care',
    'Telehealth Consultation',
    'Second Opinion',
    'Treatment Planning'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) return;

    setUploadingImage(true);
    try {
      const imageUrl = await uploadFile(file, `doctors/${user.uid}/profile`);
      handleInputChange('profileImage', imageUrl);
      toast({
        title: "Image Uploaded",
        description: "Profile image updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const addArrayItem = (field: string, value: string, setValue: (val: string) => void) => {
    if (value.trim()) {
      handleInputChange(field, [...formData[field as keyof typeof formData] as string[], value.trim()]);
      setValue('');
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentArray = formData[field as keyof typeof formData] as string[];
    handleInputChange(field, currentArray.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the onSave callback with form data
      if (onSave) {
        await onSave(formData);
      }

      toast({
        title: "Profile Updated",
        description: "Your doctor profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderArrayField = (
    title: string,
    field: string,
    newValue: string,
    setNewValue: (val: string) => void,
    placeholder: string
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="flex gap-2">
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          size="sm"
          onClick={() => addArrayItem(field, newValue, setNewValue)}
          disabled={!newValue.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(formData[field as keyof typeof formData] as string[]).map((item, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {item}
            <button
              type="button"
              onClick={() => removeArrayItem(field, index)}
              className="ml-1 hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={formData.profileImage} />
              <AvatarFallback>
                {formData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="profile-image" className="cursor-pointer">
                <Button type="button" variant="outline" disabled={uploadingImage} asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </span>
                </Button>
              </Label>
              <Input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty *</Label>
            <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="years-experience">Years of Experience</Label>
            <Input
              id="years-experience"
              type="number"
              value={formData.yearsExperience}
              onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
              min="0"
              max="50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="license-number">Medical License Number *</Label>
            <Input
              id="license-number"
              value={formData.licenseNumber}
              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
              required
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Share your experience, approach to patient care, and expertise..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Office Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Office Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 space-y-2">
            <Label htmlFor="office-address">Office Address</Label>
            <Input
              id="office-address"
              value={formData.officeAddress}
              onChange={(e) => handleInputChange('officeAddress', e.target.value)}
              placeholder="123 Medical Center Dr, Suite 100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-city">City</Label>
            <Input
              id="office-city"
              value={formData.officeCity}
              onChange={(e) => handleInputChange('officeCity', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-state">State</Label>
            <Input
              id="office-state"
              value={formData.officeState}
              onChange={(e) => handleInputChange('officeState', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-zip">ZIP Code</Label>
            <Input
              id="office-zip"
              value={formData.officeZip}
              onChange={(e) => handleInputChange('officeZip', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-hours">Office Hours</Label>
            <Input
              id="office-hours"
              value={formData.officeHours}
              onChange={(e) => handleInputChange('officeHours', e.target.value)}
              placeholder="Mon-Fri 9AM-5PM"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Professional Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medical-school">Medical School</Label>
              <Input
                id="medical-school"
                value={formData.medicalSchool}
                onChange={(e) => handleInputChange('medicalSchool', e.target.value)}
                placeholder="University Medical School"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="residency">Residency</Label>
              <Input
                id="residency"
                value={formData.residency}
                onChange={(e) => handleInputChange('residency', e.target.value)}
                placeholder="Hospital Residency Program"
              />
            </div>
          </div>

          {renderArrayField(
            'Board Certifications',
            'boardCertifications',
            newCertification,
            setNewCertification,
            'American Board of Dermatology'
          )}

          {renderArrayField(
            'Languages Spoken',
            'languages',
            newLanguage,
            setNewLanguage,
            'English, Spanish, etc.'
          )}

          {renderArrayField(
            'Hospital Affiliations',
            'hospitalAffiliations',
            newAffiliation,
            setNewAffiliation,
            'City General Hospital'
          )}

          {renderArrayField(
            'Insurance Accepted',
            'insuranceAccepted',
            newInsurance,
            setNewInsurance,
            'Blue Cross, Aetna, etc.'
          )}
        </CardContent>
      </Card>

      {/* Practice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Practice Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Morgellons Disease Experience</Label>
              <p className="text-sm text-gray-600">Do you have experience treating Morgellons disease?</p>
            </div>
            <Switch
              checked={formData.morgellonsExperience}
              onCheckedChange={(checked) => handleInputChange('morgellonsExperience', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Telehealth Services</Label>
              <p className="text-sm text-gray-600">Do you offer virtual appointments?</p>
            </div>
            <Switch
              checked={formData.telehealth}
              onCheckedChange={(checked) => handleInputChange('telehealth', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Appointment Types Offered</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {appointmentTypes.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`appointment-${type}`}
                    checked={formData.appointmentTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInputChange('appointmentTypes', [...formData.appointmentTypes, type]);
                      } else {
                        handleInputChange('appointmentTypes', formData.appointmentTypes.filter(t => t !== type));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`appointment-${type}`} className="text-sm">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
};