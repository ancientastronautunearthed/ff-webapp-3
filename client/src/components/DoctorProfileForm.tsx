import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  Building,
  Clock,
  Upload,
  DollarSign,
  Shield,
  Award
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
    languages: doctorData?.languages || ['English'],
    hospitalAffiliations: doctorData?.hospitalAffiliations || [],
    insuranceAccepted: doctorData?.insuranceAccepted || [],
    telehealth: doctorData?.telehealth ?? true,
    inPerson: doctorData?.inPerson ?? true,
    officeHours: doctorData?.officeHours || '',
    appointmentTypes: doctorData?.appointmentTypes || [],
    consultationFee: doctorData?.consultationFee || '',
    morgellonsExperience: doctorData?.morgellonsExperience ?? false,
    morgellonsDescription: doctorData?.morgellonsDescription || ''
  });

  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newAffiliation, setNewAffiliation] = useState('');
  const [newInsurance, setNewInsurance] = useState('');
  const [newAppointmentType, setNewAppointmentType] = useState('');

  const commonLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'
  ];

  const commonInsurances = [
    'Blue Cross Blue Shield', 'Aetna', 'Cigna', 'United Healthcare', 
    'Medicare', 'Medicaid', 'Kaiser Permanente', 'Anthem', 'Humana'
  ];

  const appointmentTypeOptions = [
    'Initial Consultation', 'Follow-up Visit', 'Telehealth Consultation', 
    'Second Opinion', 'Urgent Care', 'Annual Physical', 'Preventive Care'
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

  const addToArray = (field: string, value: string, setValue: (val: string) => void) => {
    if (value.trim() && !formData[field as keyof typeof formData].includes(value)) {
      handleInputChange(field, [...formData[field as keyof typeof formData], value.trim()]);
      setValue('');
    }
  };

  const removeFromArray = (field: string, index: number) => {
    const newArray = [...formData[field as keyof typeof formData]];
    newArray.splice(index, 1);
    handleInputChange(field, newArray);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image & Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Professional Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={formData.profileImage} />
              <AvatarFallback>
                {(doctorData?.firstName?.[0] || 'D') + (doctorData?.lastName?.[0] || 'R')}
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
            {doctorData?.isVerified && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
              <Input
                id="consultationFee"
                type="number"
                value={formData.consultationFee}
                onChange={(e) => handleInputChange('consultationFee', Number(e.target.value))}
                placeholder="250"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Describe your experience, specializations, and approach to patient care..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Office Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Office Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 space-y-2">
            <Label htmlFor="officeAddress">Office Address</Label>
            <Input
              id="officeAddress"
              value={formData.officeAddress}
              onChange={(e) => handleInputChange('officeAddress', e.target.value)}
              placeholder="123 Medical Plaza, Suite 500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="officeCity">City</Label>
            <Input
              id="officeCity"
              value={formData.officeCity}
              onChange={(e) => handleInputChange('officeCity', e.target.value)}
              placeholder="San Francisco"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="officeState">State</Label>
            <Input
              id="officeState"
              value={formData.officeState}
              onChange={(e) => handleInputChange('officeState', e.target.value)}
              placeholder="CA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="officeZip">ZIP Code</Label>
            <Input
              id="officeZip"
              value={formData.officeZip}
              onChange={(e) => handleInputChange('officeZip', e.target.value)}
              placeholder="94102"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="officeHours">Office Hours</Label>
            <Input
              id="officeHours"
              value={formData.officeHours}
              onChange={(e) => handleInputChange('officeHours', e.target.value)}
              placeholder="Monday-Friday 8:00 AM - 5:00 PM"
            />
          </div>
        </CardContent>
      </Card>

      {/* Education & Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Education & Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicalSchool">Medical School</Label>
              <Input
                id="medicalSchool"
                value={formData.medicalSchool}
                onChange={(e) => handleInputChange('medicalSchool', e.target.value)}
                placeholder="UCSF School of Medicine"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="residency">Residency Program</Label>
              <Input
                id="residency"
                value={formData.residency}
                onChange={(e) => handleInputChange('residency', e.target.value)}
                placeholder="Stanford Dermatology Residency"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Board Certifications</Label>
            <div className="flex gap-2">
              <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Add board certification"
              />
              <Button
                type="button"
                onClick={() => addToArray('boardCertifications', newCertification, setNewCertification)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.boardCertifications.map((cert, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeFromArray('boardCertifications', index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Languages & Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Languages & Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Languages Spoken</Label>
            <div className="flex gap-2">
              <Select value={newLanguage} onValueChange={setNewLanguage}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {commonLanguages.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={() => addToArray('languages', newLanguage, setNewLanguage)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.languages.map((lang, index) => (
                <Badge key={index} variant="secondary">
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeFromArray('languages', index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Telehealth Services</Label>
                <p className="text-sm text-gray-600">Offer virtual consultations</p>
              </div>
              <Switch
                checked={formData.telehealth}
                onCheckedChange={(checked) => handleInputChange('telehealth', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>In-Person Visits</Label>
                <p className="text-sm text-gray-600">Accept office visits</p>
              </div>
              <Switch
                checked={formData.inPerson}
                onCheckedChange={(checked) => handleInputChange('inPerson', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Appointment Types</Label>
            <div className="flex gap-2">
              <Select value={newAppointmentType} onValueChange={setNewAppointmentType}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypeOptions.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={() => addToArray('appointmentTypes', newAppointmentType, setNewAppointmentType)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.appointmentTypes.map((type, index) => (
                <Badge key={index} variant="secondary">
                  {type}
                  <button
                    type="button"
                    onClick={() => removeFromArray('appointmentTypes', index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Networks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Professional Networks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Hospital Affiliations</Label>
            <div className="flex gap-2">
              <Input
                value={newAffiliation}
                onChange={(e) => setNewAffiliation(e.target.value)}
                placeholder="Add hospital affiliation"
              />
              <Button
                type="button"
                onClick={() => addToArray('hospitalAffiliations', newAffiliation, setNewAffiliation)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.hospitalAffiliations.map((affiliation, index) => (
                <Badge key={index} variant="secondary">
                  {affiliation}
                  <button
                    type="button"
                    onClick={() => removeFromArray('hospitalAffiliations', index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Insurance Accepted</Label>
            <div className="flex gap-2">
              <Select value={newInsurance} onValueChange={setNewInsurance}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select insurance" />
                </SelectTrigger>
                <SelectContent>
                  {commonInsurances.map(insurance => (
                    <SelectItem key={insurance} value={insurance}>
                      {insurance}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={() => addToArray('insuranceAccepted', newInsurance, setNewInsurance)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.insuranceAccepted.map((insurance, index) => (
                <Badge key={index} variant="secondary">
                  {insurance}
                  <button
                    type="button"
                    onClick={() => removeFromArray('insuranceAccepted', index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Morgellons Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Morgellons Disease Expertise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Morgellons Experience</Label>
              <p className="text-sm text-gray-600">Do you have experience treating Morgellons disease?</p>
            </div>
            <Switch
              checked={formData.morgellonsExperience}
              onCheckedChange={(checked) => handleInputChange('morgellonsExperience', checked)}
            />
          </div>

          {formData.morgellonsExperience && (
            <div className="space-y-2">
              <Label htmlFor="morgellonsDescription">Describe Your Morgellons Experience</Label>
              <Textarea
                id="morgellonsDescription"
                value={formData.morgellonsDescription}
                onChange={(e) => handleInputChange('morgellonsDescription', e.target.value)}
                placeholder="Describe your experience treating Morgellons disease, research involvement, or specialized training..."
                rows={3}
              />
            </div>
          )}
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