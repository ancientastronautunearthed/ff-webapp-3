import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  Send,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const responseSchema = z.object({
  response: z.string().min(50, 'Response must be at least 50 characters'),
  followUpAvailable: z.boolean().default(false),
  disclaimerAgreed: z.boolean().refine(val => val === true, 'Must agree to medical disclaimer')
});

type ResponseFormData = z.infer<typeof responseSchema>;

interface DoctorResponseFormProps {
  questionId: string;
  questionTitle: string;
  onResponseSubmitted: (response: any) => void;
  onCancel: () => void;
}

export const DoctorResponseForm = ({ 
  questionId, 
  questionTitle, 
  onResponseSubmitted, 
  onCancel 
}: DoctorResponseFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      followUpAvailable: false,
      disclaimerAgreed: false
    }
  });

  const watchedFollowUp = watch('followUpAvailable');

  const submitResponse = async (data: ResponseFormData) => {
    setIsSubmitting(true);
    try {
      // Get doctor profile from demo or localStorage
      const isDemoDoctor = localStorage.getItem('demoDoctor') === 'true';
      
      const responseData = {
        doctorName: isDemoDoctor ? 'Demo Dr. Sarah Johnson' : 'Dr. Sarah Johnson',
        specialty: 'Dermatology',
        verificationStatus: 'verified',
        response: data.response,
        followUpAvailable: data.followUpAvailable,
        helpfulVotes: 0
      };

      // Save to Firestore
      const { addDoctorResponse } = await import('@/lib/firestore');
      await addDoctorResponse(questionId, responseData);

      onResponseSubmitted({
        id: Date.now().toString(),
        ...responseData,
        respondedAt: new Date()
      });

      toast({
        title: "Response Posted",
        description: "Your medical response has been posted. The patient will be notified.",
      });
    } catch (error) {
      console.error('Error posting response:', error);
      toast({
        title: "Error",
        description: "Failed to post response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-blue-600" />
          Respond to: {questionTitle}
          <Badge variant="outline" className="ml-auto">
            Medical Professional Response
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(submitResponse)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="response">Medical Response</Label>
            <Textarea
              id="response"
              {...register('response')}
              placeholder="Provide your professional medical guidance. Remember to include disclaimers about seeking in-person medical care when appropriate..."
              rows={8}
              className="min-h-32"
            />
            {errors.response && (
              <p className="text-sm text-red-600">{errors.response.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUpAvailable"
                checked={watchedFollowUp}
                onCheckedChange={(checked) => setValue('followUpAvailable', !!checked)}
              />
              <Label htmlFor="followUpAvailable" className="text-sm">
                I am available for follow-up consultation if needed
              </Label>
            </div>

            {watchedFollowUp && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Follow-up Consultation Available</span>
                </div>
                <p className="text-sm text-blue-700">
                  Patients will see a "Schedule Consultation" button to book a follow-up appointment with you.
                </p>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Medical Disclaimer Required</span>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              All responses must include appropriate medical disclaimers and recommend in-person care when necessary.
            </p>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="disclaimerAgreed"
                onCheckedChange={(checked) => setValue('disclaimerAgreed', !!checked)}
              />
              <Label htmlFor="disclaimerAgreed" className="text-sm">
                I agree that this response includes appropriate medical disclaimers and does not replace professional medical diagnosis or treatment. I recommend in-person medical care when appropriate.
              </Label>
            </div>
            {errors.disclaimerAgreed && (
              <p className="text-sm text-red-600 mt-2">{errors.disclaimerAgreed.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                'Posting Response...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Medical Response
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};