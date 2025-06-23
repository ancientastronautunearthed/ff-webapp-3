import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CalendarProps } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Video, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Star,
  DollarSign,
  GraduationCap,
  Shield,
  Phone,
  MessageSquare,
  Filter,
  Search,
  ChevronRight,
  User,
  Award,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isSameDay } from 'date-fns';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  credentials: string[];
  rating: number;
  reviewCount: number;
  experience: string;
  location: string;
  languages: string[];
  consultationFee: number;
  availableSlots: string[];
  telehealth: boolean;
  inPerson: boolean;
  morgellonsExperience: boolean;
  image: string;
  bio: string;
  education: string[];
  certifications: string[];
}

interface Appointment {
  id: string;
  providerId: string;
  date: Date;
  time: string;
  type: 'telehealth' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  reasonForVisit: string;
}

export const TelemedicineScheduling = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'telehealth' | 'in-person'>('telehealth');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [morgellonsOnly, setMorgellonsOnly] = useState(true);

  // Real provider data from Firebase
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      // Load only verified and active doctors from Firebase
      const doctorsSnapshot = await getDocs(
        query(
          collection(db, 'doctors'), 
          where('isVerified', '==', true),
          where('isActive', '==', true)
        )
      );
      
      const doctorsData: Provider[] = doctorsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: `Dr. ${data.firstName} ${data.lastName}`,
          specialty: data.specialty,
          credentials: data.credentials || [data.medicalLicense],
          experience: `${data.yearsExperience} years`,
          location: data.location || data.practiceStates?.[0] || 'Not specified',
          rating: data.rating || 4.8,
          reviewCount: data.reviewCount || 0,
          bio: data.bio || `Experienced ${data.specialty} physician with ${data.yearsExperience} years of practice.`,
          telehealth: data.telehealth !== false,
          inPerson: data.inPerson === true,
          consultationFee: data.consultationFee || 150,
          languages: data.languages || ['English'],
          morgellonsExperience: data.morgellonsExperience === true,
          image: data.profileImage || '',
          education: [],
          certifications: []
        };
      });
      
      setProviders(doctorsData);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading providers...</div>
      </div>
    );
  }

  if (providers.length === 0 && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Stethoscope className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Verified Doctors Available</h2>
          <p className="text-gray-600 mb-6">
            Only verified medical professionals who have registered with Fiber Friends will appear here.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              Medical professionals can register through our doctor portal to provide consultations to Morgellons patients.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const availableProviders: Provider[] = providers;


  const filteredProviders = availableProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'all' || provider.specialty.toLowerCase().includes(specialtyFilter.toLowerCase());
    const matchesMorgellons = !morgellonsOnly || provider.morgellonsExperience;
    
    return matchesSearch && matchesSpecialty && matchesMorgellons;
  });

  const timeSlots = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM'
  ];

  const handleBookAppointment = async () => {
    if (!selectedProvider || !selectedDate || !selectedTime || !reasonForVisit) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields to book your appointment.",
        variant: "destructive",
      });
      return;
    }

    try {
      // In production, this would make an API call to book the appointment
      const appointment: Appointment = {
        id: Date.now().toString(),
        providerId: selectedProvider.id,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        status: 'scheduled',
        notes: specialNotes,
        reasonForVisit
      };

      console.log('Booking appointment:', appointment);

      toast({
        title: "Appointment Scheduled!",
        description: `Your ${appointmentType} appointment with ${selectedProvider.name} is confirmed for ${format(selectedDate, 'MMMM d, yyyy')} at ${selectedTime}.`,
      });

      // Reset form
      setSelectedProvider(null);
      setSelectedDate(undefined);
      setSelectedTime('');
      setReasonForVisit('');
      setSpecialNotes('');
      setShowBooking(false);
    } catch (error) {
      toast({
        title: "Booking Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Telemedicine Appointments</h1>
        <p className="text-gray-600 mt-2">
          Connect with healthcare providers experienced in Morgellons disease treatment
        </p>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">Find Providers</TabsTrigger>
          <TabsTrigger value="appointments">My Appointments</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Find Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          {!showBooking ? (
            <>
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search providers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Specialties</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="internal">Internal Medicine</SelectItem>
                        <SelectItem value="psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="infectious">Infectious Disease</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="morgellons"
                        checked={morgellonsOnly}
                        onCheckedChange={(checked) => setMorgellonsOnly(!!checked)}
                      />
                      <Label htmlFor="morgellons" className="text-sm">
                        Morgellons Experience Only
                      </Label>
                    </div>

                    <Badge variant="outline" className="justify-center">
                      {filteredProviders.length} providers found
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Provider List */}
              <div className="grid gap-6">
                {filteredProviders.map((provider) => (
                  <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                            <User className="h-16 w-16 text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
                                <p className="text-lg text-primary-600">{provider.specialty}</p>
                                <div className="flex items-center mt-1">
                                  {provider.credentials.map((cred, index) => (
                                    <Badge key={index} variant="secondary" className="mr-2 text-xs">
                                      {cred}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="ml-1 font-medium">{provider.rating}</span>
                                  <span className="ml-1 text-gray-500">({provider.reviewCount})</span>
                                </div>
                                <p className="text-sm text-gray-600">{provider.experience} experience</p>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700">{provider.bio}</p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{provider.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{provider.languages.join(', ')}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                              <span>${provider.consultationFee} consultation</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {provider.telehealth && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                <Video className="h-3 w-3 mr-1" />
                                Telehealth
                              </Badge>
                            )}
                            {provider.inPerson && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <MapPin className="h-3 w-3 mr-1" />
                                In-Person
                              </Badge>
                            )}
                            {provider.morgellonsExperience && (
                              <Badge variant="outline" className="text-purple-600 border-purple-600">
                                <Award className="h-3 w-3 mr-1" />
                                Morgellons Experience
                              </Badge>
                            )}
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={() => {
                                setSelectedProvider(provider);
                                setShowBooking(true);
                              }}
                              className="bg-primary-600 hover:bg-primary-700"
                            >
                              Book Appointment
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button variant="outline">
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            /* Booking Form */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Book Appointment with {selectedProvider?.name}
                </CardTitle>
                <p className="text-gray-600">{selectedProvider?.specialty} • ${selectedProvider?.consultationFee}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Appointment Type */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Appointment Type
                    </Label>
                    <div className="space-y-2">
                      {selectedProvider?.telehealth && (
                        <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            value="telehealth"
                            checked={appointmentType === 'telehealth'}
                            onChange={(e) => setAppointmentType(e.target.value as 'telehealth')}
                            className="text-primary-600"
                          />
                          <Video className="h-5 w-5 text-blue-500" />
                          <div>
                            <span className="font-medium">Telehealth</span>
                            <p className="text-sm text-gray-500">Video consultation from home</p>
                          </div>
                        </label>
                      )}
                      {selectedProvider?.inPerson && (
                        <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            value="in-person"
                            checked={appointmentType === 'in-person'}
                            onChange={(e) => setAppointmentType(e.target.value as 'in-person')}
                            className="text-primary-600"
                          />
                          <MapPin className="h-5 w-5 text-green-500" />
                          <div>
                            <span className="font-medium">In-Person</span>
                            <p className="text-sm text-gray-500">Visit clinic in {selectedProvider?.location}</p>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Select Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date() || date > addDays(new Date(), 90)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Available Times
                    </Label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {selectedProvider?.availableSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 text-sm border rounded-lg transition-colors ${
                            selectedTime === time
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'border-gray-300 hover:border-primary-600 hover:bg-primary-50'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reason for Visit */}
                <div>
                  <Label htmlFor="reason" className="text-sm font-medium text-gray-700 mb-2 block">
                    Reason for Visit *
                  </Label>
                  <Select value={reasonForVisit} onValueChange={setReasonForVisit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason for visit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initial-consultation">Initial Consultation</SelectItem>
                      <SelectItem value="symptom-management">Symptom Management</SelectItem>
                      <SelectItem value="follow-up">Follow-up Appointment</SelectItem>
                      <SelectItem value="second-opinion">Second Opinion</SelectItem>
                      <SelectItem value="treatment-review">Treatment Review</SelectItem>
                      <SelectItem value="medication-adjustment">Medication Adjustment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Special Notes */}
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                    Special Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific concerns, symptoms, or information you'd like the provider to know beforehand..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowBooking(false)}
                    className="flex-1"
                  >
                    Back to Providers
                  </Button>
                  <Button
                    onClick={handleBookAppointment}
                    disabled={!selectedDate || !selectedTime || !reasonForVisit}
                    className="flex-1 bg-primary-600 hover:bg-primary-700"
                  >
                    Confirm Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Appointments Tab */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming appointments scheduled</p>
                <Button className="mt-4" onClick={() => window.location.hash = '#providers'}>
                  Book Your First Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Preparing for Your Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Before Your Visit</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Prepare your symptom timeline</li>
                      <li>• List current medications</li>
                      <li>• Document recent symptom changes</li>
                      <li>• Prepare questions for your provider</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Technical Requirements</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Stable internet connection</li>
                      <li>• Computer or smartphone with camera</li>
                      <li>• Quiet, private space</li>
                      <li>• Good lighting for video call</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insurance & Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Most providers accept major insurance plans. Telehealth visits are often covered 
                  the same as in-person visits. Check with your insurance provider for specific coverage details.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline">Check Insurance Coverage</Button>
                  <Button variant="outline">Payment Options</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};