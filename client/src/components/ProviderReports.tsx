import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  Share, 
  Eye, 
  Calendar,
  TrendingUp,
  Activity,
  Info
} from 'lucide-react';

const reportSchema = z.object({
  timePeriod: z.string().min(1, 'Please select a time period'),
  symptoms: z.array(z.string()).min(1, 'Please select at least one symptom'),
  includeCorrelations: z.array(z.string()),
  selectedPhotos: z.array(z.string()).max(3, 'Maximum 3 photos allowed'),
});

type ReportFormData = z.infer<typeof reportSchema>;

// Mock data for available photos
const mockPhotos = [
  { id: '1', title: 'Dec 15 - Fiber observation (arm lesion)', date: 'Dec 15, 2024' },
  { id: '2', title: 'Dec 10 - New eruption (leg)', date: 'Dec 10, 2024' },
  { id: '3', title: 'Dec 8 - Healing progress (forearm)', date: 'Dec 8, 2024' },
  { id: '4', title: 'Dec 5 - Skin texture changes', date: 'Dec 5, 2024' },
  { id: '5', title: 'Dec 3 - Fiber color comparison', date: 'Dec 3, 2024' },
];

export const ProviderReports = () => {
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      timePeriod: '',
      symptoms: ['itching', 'fatigue', 'brainFog', 'sleepQuality'],
      includeCorrelations: ['dietSupplements', 'medications'],
      selectedPhotos: [],
    },
  });

  const onSubmit = async (data: ReportFormData) => {
    setLoading(true);
    try {
      // TODO: Generate PDF report using jsPDF with Firebase data
      console.log('Generating report with data:', data);
      
      // Simulate report generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setReportGenerated(true);
      toast({
        title: "Report Generated",
        description: "Your provider-ready health summary has been successfully generated.",
      });
    } catch (error: any) {
      toast({
        title: "Generation Error",
        description: error.message || "Failed to generate report.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const symptomOptions = [
    { id: 'itching', label: 'Itching intensity', defaultChecked: true },
    { id: 'fatigue', label: 'Fatigue levels', defaultChecked: true },
    { id: 'brainFog', label: 'Brain fog', defaultChecked: true },
    { id: 'sleepQuality', label: 'Sleep quality', defaultChecked: true },
    { id: 'lesionCount', label: 'Lesion count', defaultChecked: false },
    { id: 'fiberObservations', label: 'Fiber observations', defaultChecked: false },
  ];

  const correlationOptions = [
    { id: 'dietSupplements', label: 'Diet and supplement correlations', defaultChecked: true },
    { id: 'medications', label: 'Medication effects', defaultChecked: true },
    { id: 'environmental', label: 'Environmental triggers', defaultChecked: false },
  ];

  const handleSymptomChange = (symptomId: string, checked: boolean) => {
    const currentSymptoms = form.getValues('symptoms');
    if (checked) {
      form.setValue('symptoms', [...currentSymptoms, symptomId]);
    } else {
      form.setValue('symptoms', currentSymptoms.filter(id => id !== symptomId));
    }
  };

  const handleCorrelationChange = (correlationId: string, checked: boolean) => {
    const currentCorrelations = form.getValues('includeCorrelations');
    if (checked) {
      form.setValue('includeCorrelations', [...currentCorrelations, correlationId]);
    } else {
      form.setValue('includeCorrelations', currentCorrelations.filter(id => id !== correlationId));
    }
  };

  const handlePhotoChange = (photoId: string, checked: boolean) => {
    const currentPhotos = form.getValues('selectedPhotos');
    if (checked && currentPhotos.length < 3) {
      form.setValue('selectedPhotos', [...currentPhotos, photoId]);
    } else if (!checked) {
      form.setValue('selectedPhotos', currentPhotos.filter(id => id !== photoId));
    } else {
      toast({
        title: "Photo Limit Reached",
        description: "You can select a maximum of 3 photos for your report.",
        variant: "destructive",
      });
    }
  };

  if (reportGenerated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Report Ready</h2>
            <p className="text-green-800 mb-6">
              Your provider-ready health summary has been generated successfully.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="mr-2 h-4 w-4" />
                Download PDF Report
              </Button>
              <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
                <Share className="mr-2 h-4 w-4" />
                Share with Provider
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => setReportGenerated(false)}
              className="text-green-700 hover:text-green-800"
            >
              Generate Another Report
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Provider-Ready Health Reports</h1>
        <p className="text-xl text-gray-600 mt-4">Generate professional summaries to share with your healthcare team</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Report Generator */}
        <div>
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary-500" />
                Generate Health Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Time Period Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Report Time Period
                  </Label>
                  <Select onValueChange={(value) => form.setValue('timePeriod', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="60">Last 2 months</SelectItem>
                      <SelectItem value="90">Last 3 months</SelectItem>
                      <SelectItem value="180">Last 6 months</SelectItem>
                      <SelectItem value="custom">Custom date range</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.timePeriod && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.timePeriod.message}</p>
                  )}
                </div>

                {/* Symptom Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Include Symptoms
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {symptomOptions.map((option) => (
                      <label key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          defaultChecked={option.defaultChecked}
                          onCheckedChange={(checked) => handleSymptomChange(option.id, checked as boolean)}
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {form.formState.errors.symptoms && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.symptoms.message}</p>
                  )}
                </div>

                {/* Correlation Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Include Factor Correlations
                  </Label>
                  <div className="space-y-2">
                    {correlationOptions.map((option) => (
                      <label key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          defaultChecked={option.defaultChecked}
                          onCheckedChange={(checked) => handleCorrelationChange(option.id, checked as boolean)}
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Photo Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Include Photos (Select up to 3)
                  </Label>
                  <ScrollArea className="h-32 border border-gray-300 rounded-lg p-4">
                    <div className="space-y-2">
                      {mockPhotos.map((photo) => (
                        <label key={photo.id} className="flex items-center space-x-2 text-sm">
                          <Checkbox
                            onCheckedChange={(checked) => handlePhotoChange(photo.id, checked as boolean)}
                          />
                          <span className="flex-1">{photo.title}</span>
                          <span className="text-gray-500 text-xs">{photo.date}</span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                  {form.formState.errors.selectedPhotos && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.selectedPhotos.message}</p>
                  )}
                </div>

                <Separator />

                <Button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Activity className="mr-2 h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate PDF Report
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-gray-500 text-center">
                  Report will be generated as a professional 1-2 page PDF summary
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview */}
        <div>
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5 text-secondary-500" />
                Report Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Health Summary Report</h4>
                <p className="text-sm text-gray-600">Patient: [Name] | Period: Nov 15 - Dec 15, 2024</p>
              </div>

              {/* Key Symptoms Section */}
              <div>
                <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-primary-500" />
                  Key Symptoms Tracked
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Itching Intensity:</span>
                    <span className="font-medium text-secondary-600">4.2/10 (↓ from 5.8)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Fatigue Level:</span>
                    <span className="font-medium text-gray-600">6.1/10 (→ stable)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sleep Quality:</span>
                    <span className="font-medium text-green-600">Good (↑ 25%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Brain Fog Severity:</span>
                    <span className="font-medium text-purple-600">3.1/10 (improving)</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Correlations Section */}
              <div>
                <h5 className="font-medium text-gray-800 mb-3">Notable Correlations</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    High sugar intake correlates with +65% itching
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Antihistamine use reduces itching by 40%
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Stress levels increase brain fog by 30%
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Provider Note */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  For Healthcare Providers
                </h5>
                <p className="text-sm text-blue-800">
                  This report represents patient-tracked symptom data over the specified period. 
                  Correlations are based on patient observations and may warrant clinical investigation.
                  All data was collected using a validated symptom tracking methodology.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download Sample
                </Button>
                <Button className="flex-1 bg-secondary-500 hover:bg-secondary-600">
                  <Share className="mr-2 h-4 w-4" />
                  Share Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
