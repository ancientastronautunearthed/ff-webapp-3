import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Microscope, 
  Shield, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Info,
  Download
} from 'lucide-react';

const consentSchema = z.object({
  dataAnonymized: z.boolean().refine(val => val === true, 'You must acknowledge data anonymization'),
  consentToContribute: z.boolean().refine(val => val === true, 'You must consent to data contribution'),
  receiveUpdates: z.boolean(),
});

type ConsentFormData = z.infer<typeof consentSchema>;

export const ResearchOptIn = () => {
  const [loading, setLoading] = useState(false);
  const [isOptedIn, setIsOptedIn] = useState(false);
  const { toast } = useToast();

  const form = useForm<ConsentFormData>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      dataAnonymized: false,
      consentToContribute: false,
      receiveUpdates: false,
    },
  });

  const onSubmit = async (data: ConsentFormData) => {
    setLoading(true);
    try {
      const { updateUserInFirestore } = await import('@/lib/firestore');
      const { getCurrentUser } = await import('@/lib/auth');
      
      const user = getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update user's research opt-in status in Firestore
      await updateUserInFirestore(user.uid, {
        researchOptIn: true
      });
      
      setIsOptedIn(true);
      toast({
        title: "Research Participation Enabled",
        description: "Thank you for contributing to patient-led research. Your anonymized data will help advance understanding of Morgellons.",
      });
    } catch (error: any) {
      toast({
        title: "Consent Error",
        description: error.message || "Failed to process research consent.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawConsent = async () => {
    setLoading(true);
    try {
      const { updateUserInFirestore } = await import('@/lib/firestore');
      const { getCurrentUser } = await import('@/lib/auth');
      
      const user = getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update user's research opt-in status in Firestore
      await updateUserInFirestore(user.uid, {
        researchOptIn: false
      });
      
      setIsOptedIn(false);
      toast({
        title: "Research Participation Withdrawn",
        description: "You have successfully withdrawn from research participation.",
      });
    } catch (error: any) {
      toast({
        title: "Withdrawal Error",
        description: error.message || "Failed to withdraw research consent.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dataWeCollect = [
    { text: 'Anonymized symptom severity trends', included: true },
    { text: 'Factor correlation patterns', included: true },
    { text: 'Treatment response data', included: true },
    { text: 'Aggregated demographics', included: true },
  ];

  const dataNeverShared = [
    { text: 'Personal identifying information', included: false },
    { text: 'Photos or videos from your journal', included: false },
    { text: 'Specific journal entries', included: false },
    { text: 'Location or contact information', included: false },
  ];

  if (isOptedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Research Participation Active</h2>
            <p className="text-green-800 mb-6">
              Thank you for contributing to patient-led research. Your anonymized data is helping advance understanding of Morgellons.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                className="border-green-600 text-green-700 hover:bg-green-100"
              >
                <FileText className="mr-2 h-4 w-4" />
                View Research Updates
              </Button>
              <Button 
                variant="outline" 
                onClick={handleWithdrawConsent}
                disabled={loading}
                className="border-red-600 text-red-700 hover:bg-red-100"
              >
                Withdraw Consent
              </Button>
            </div>
            
            <p className="text-sm text-green-700 mt-4">
              You can withdraw from research participation at any time without affecting your app access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Microscope className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Join the Patient-Led Research Initiative
          </CardTitle>
          <p className="text-xl text-gray-600 mt-4">
            Help advance understanding of Morgellons through collective data
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* What We Collect vs Never Share */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                What We'll Collect
              </h3>
              <ul className="space-y-3">
                {dataWeCollect.map((item, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <XCircle className="mr-2 h-5 w-5 text-red-500" />
                What We'll Never Share
              </h3>
              <ul className="space-y-3">
                {dataNeverShared.map((item, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <XCircle className="h-4 w-4 text-red-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* How This Helps Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Info className="mr-2 h-5 w-5" />
              How This Helps Our Community
            </h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              By pooling our anonymous data, we can identify patterns that individual tracking cannot reveal. 
              This collective knowledge helps validate our experiences and may guide future research directions.
              You'll receive regular updates on insights discovered from community data, making you an active 
              participant in advancing understanding of this condition.
            </p>
          </div>

          {/* Research Impact Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 mb-1">1,247</div>
              <div className="text-sm text-gray-600">Potential Participants</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 mb-1">50,000+</div>
              <div className="text-sm text-gray-600">Data Points Available</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 mb-1">12</div>
              <div className="text-sm text-gray-600">Research Questions</div>
            </div>
          </div>

          {/* Consent Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="dataAnonymized"
                  {...form.register('dataAnonymized')}
                  className="mt-1"
                />
                <Label htmlFor="dataAnonymized" className="text-gray-700 leading-relaxed">
                  I understand that my data will be anonymized and aggregated with other participants' data, 
                  and that no personally identifiable information will be shared.
                </Label>
              </div>
              {form.formState.errors.dataAnonymized && (
                <p className="text-sm text-red-600 ml-6">{form.formState.errors.dataAnonymized.message}</p>
              )}

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consentToContribute"
                  {...form.register('consentToContribute')}
                  className="mt-1"
                />
                <Label htmlFor="consentToContribute" className="text-gray-700 leading-relaxed">
                  I consent to contributing my symptom tracking data to the research database to help 
                  advance understanding of Morgellons disease.
                </Label>
              </div>
              {form.formState.errors.consentToContribute && (
                <p className="text-sm text-red-600 ml-6">{form.formState.errors.consentToContribute.message}</p>
              )}

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="receiveUpdates"
                  {...form.register('receiveUpdates')}
                  className="mt-1"
                />
                <Label htmlFor="receiveUpdates" className="text-gray-700 leading-relaxed">
                  I want to receive research updates and insights from the community data analysis.
                </Label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                className="flex-1 bg-indigo-500 hover:bg-indigo-600"
                disabled={loading}
              >
                <Microscope className="mr-2 h-4 w-4" />
                Join Research Initiative
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // TODO: Show full consent document
                  toast({
                    title: "Full Consent Form",
                    description: "The detailed consent document will be displayed here.",
                  });
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Read Full Consent Form
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              You can withdraw from research participation at any time in your account settings. 
              Withdrawal will not affect your access to the app or any of its features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
