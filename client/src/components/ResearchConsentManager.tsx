import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Database, FileText, Heart, MapPin, Clock, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useResearchConsent, useCreateResearchConsent, useUpdateResearchConsent } from '@/hooks/useResearchConsent';

const researchConsentSchema = z.object({
  generalResearchConsent: z.boolean(),
  symptomDataConsent: z.boolean(),
  journalDataConsent: z.boolean(),
  demographicDataConsent: z.boolean(),
  treatmentDataConsent: z.boolean(),
  locationDataConsent: z.boolean(),
  dataRetentionYears: z.number().min(1).max(50),
  allowDataSharing: z.boolean(),
  allowCommercialUse: z.boolean(),
});

type ConsentFormData = z.infer<typeof researchConsentSchema>;

const dataCategories = [
  {
    key: 'symptomDataConsent' as keyof ConsentFormData,
    title: 'Symptom Data',
    description: 'Symptom severity ratings, timing, triggers, and correlations',
    icon: Heart,
    examples: ['Pain levels', 'Symptom frequency', 'Environmental triggers'],
    sensitivity: 'Medium',
  },
  {
    key: 'journalDataConsent' as keyof ConsentFormData,
    title: 'Journal Entries',
    description: 'Personal observations and experiences (text only, no photos)',
    icon: FileText,
    examples: ['Daily observations', 'Treatment notes', 'Mood tracking'],
    sensitivity: 'High',
  },
  {
    key: 'demographicDataConsent' as keyof ConsentFormData,
    title: 'Demographics',
    description: 'Age group, gender, general location (city/state level)',
    icon: Users,
    examples: ['Age range', 'Gender identity', 'Geographic region'],
    sensitivity: 'Low',
  },
  {
    key: 'treatmentDataConsent' as keyof ConsentFormData,
    title: 'Treatment Data',
    description: 'Medications, therapies, and treatment effectiveness',
    icon: Database,
    examples: ['Medication names', 'Treatment outcomes', 'Side effects'],
    sensitivity: 'High',
  },
  {
    key: 'locationDataConsent' as keyof ConsentFormData,
    title: 'Location Data',
    description: 'General geographic patterns (no specific addresses)',
    icon: MapPin,
    examples: ['Climate zone', 'Urban vs rural', 'Regional patterns'],
    sensitivity: 'Medium',
  },
];

export const ResearchConsentManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const { data: existingConsent, isLoading: consentLoading } = useResearchConsent();
  const createConsentMutation = useCreateResearchConsent();
  const updateConsentMutation = useUpdateResearchConsent();

  const form = useForm<ConsentFormData>({
    resolver: zodResolver(researchConsentSchema),
    defaultValues: {
      generalResearchConsent: existingConsent?.generalResearchConsent || false,
      symptomDataConsent: existingConsent?.symptomDataConsent || false,
      journalDataConsent: existingConsent?.journalDataConsent || false,
      demographicDataConsent: existingConsent?.demographicDataConsent || false,
      treatmentDataConsent: existingConsent?.treatmentDataConsent || false,
      locationDataConsent: existingConsent?.locationDataConsent || false,
      dataRetentionYears: existingConsent?.dataRetentionYears || 5,
      allowDataSharing: existingConsent?.allowDataSharing || false,
      allowCommercialUse: existingConsent?.allowCommercialUse || false,
    },
  });

  // Update form when existing consent loads
  useEffect(() => {
    if (existingConsent) {
      form.reset({
        generalResearchConsent: existingConsent.generalResearchConsent,
        symptomDataConsent: existingConsent.symptomDataConsent,
        journalDataConsent: existingConsent.journalDataConsent,
        demographicDataConsent: existingConsent.demographicDataConsent,
        treatmentDataConsent: existingConsent.treatmentDataConsent,
        locationDataConsent: existingConsent.locationDataConsent,
        dataRetentionYears: existingConsent.dataRetentionYears,
        allowDataSharing: existingConsent.allowDataSharing,
        allowCommercialUse: existingConsent.allowCommercialUse,
      });
    }
  }, [existingConsent, form]);

  const watchGeneralConsent = form.watch('generalResearchConsent');

  useEffect(() => {
    if (!watchGeneralConsent) {
      // If general consent is disabled, disable all specific consents
      form.setValue('symptomDataConsent', false);
      form.setValue('journalDataConsent', false);
      form.setValue('demographicDataConsent', false);
      form.setValue('treatmentDataConsent', false);
      form.setValue('locationDataConsent', false);
      form.setValue('allowDataSharing', false);
      form.setValue('allowCommercialUse', false);
    }
  }, [watchGeneralConsent, form]);

  const onSubmit = async (data: ConsentFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (existingConsent) {
        await updateConsentMutation.mutateAsync({
          consentId: existingConsent.id,
          data
        });
      } else {
        await createConsentMutation.mutateAsync(data);
      }
      
      toast({
        title: "Consent preferences saved",
        description: "Your research participation preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600">Please sign in to manage your research consent preferences.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Research Consent Management</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Help advance Morgellons research by choosing what data you're comfortable sharing. 
          Your privacy and autonomy are our top priorities.
        </p>
      </div>

      {/* Current Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Current Status</h3>
                <p className="text-sm text-gray-600">
                  {watchGeneralConsent ? 'Participating in research' : 'Not participating in research'}
                </p>
              </div>
            </div>
            <Badge variant={watchGeneralConsent ? "default" : "secondary"}>
              {watchGeneralConsent ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General Consent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-500" />
                Research Participation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="generalResearchConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Participate in Research Studies
                      </FormLabel>
                      <FormDescription>
                        Allow your anonymized data to contribute to Morgellons research and help advance 
                        understanding of this condition.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {watchGeneralConsent && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">How your data helps research:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Identify patterns and correlations in symptoms</li>
                        <li>Evaluate treatment effectiveness across populations</li>
                        <li>Support development of better diagnostic criteria</li>
                        <li>Inform evidence-based treatment guidelines</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Categories */}
          {watchGeneralConsent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5 text-green-500" />
                  Data Sharing Preferences
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Choose which types of data you're comfortable sharing for research purposes.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {dataCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.key}>
                      <FormField
                        control={form.control}
                        name={category.key}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start justify-between rounded-lg border p-4">
                            <div className="flex items-start space-x-3 flex-1">
                              <Icon className="h-5 w-5 text-gray-600 mt-1" />
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center space-x-2">
                                  <FormLabel className="text-base font-medium">
                                    {category.title}
                                  </FormLabel>
                                  <Badge 
                                    variant={category.sensitivity === 'High' ? 'destructive' : 
                                            category.sensitivity === 'Medium' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {category.sensitivity} Sensitivity
                                  </Badge>
                                </div>
                                <FormDescription className="text-sm">
                                  {category.description}
                                </FormDescription>
                                <div className="text-xs text-gray-500">
                                  <span className="font-medium">Examples: </span>
                                  {category.examples.join(', ')}
                                </div>
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!watchGeneralConsent}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {index < dataCategories.length - 1 && <Separator className="my-4" />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Advanced Settings */}
          {watchGeneralConsent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-purple-500" />
                  Privacy & Control Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="dataRetentionYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Data Retention Period
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select retention period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 year</SelectItem>
                          <SelectItem value="5">5 years (recommended)</SelectItem>
                          <SelectItem value="10">10 years</SelectItem>
                          <SelectItem value="25">25 years</SelectItem>
                          <SelectItem value="50">Indefinite (50+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How long your data can be used for research after you stop participating.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowDataSharing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Allow Data Sharing with Qualified Researchers
                        </FormLabel>
                        <FormDescription>
                          Share your anonymized data with vetted academic institutions and research organizations.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!watchGeneralConsent}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowCommercialUse"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5 flex-1">
                        <FormLabel className="text-base">
                          Allow Commercial Research Use
                        </FormLabel>
                        <FormDescription>
                          Allow pharmaceutical companies and medical device manufacturers to use 
                          your anonymized data for product development.
                        </FormDescription>
                        <div className="flex items-center space-x-2 mt-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="text-xs text-amber-700">
                            You may be eligible for compensation if your data contributes to commercialized products.
                          </span>
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!watchGeneralConsent}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={loading}
            >
              Reset to Defaults
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Save Consent Preferences
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Privacy Notice */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Rights & Privacy Protection</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">You can always:</h4>
              <ul className="space-y-1">
                <li>• Change your consent preferences at any time</li>
                <li>• Withdraw from research participation completely</li>
                <li>• Request deletion of your contributed data</li>
                <li>• View exactly what data has been shared</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">We guarantee:</h4>
              <ul className="space-y-1">
                <li>• All data is anonymized before sharing</li>
                <li>• No personal identifiers are ever included</li>
                <li>• Only IRB-approved studies can access data</li>
                <li>• Full transparency about data usage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};