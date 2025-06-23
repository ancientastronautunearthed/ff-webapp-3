import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MedicalProfileForm } from '@/components/MedicalProfileForm';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function ProfileSetup() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileComplete = async (profileData: any) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Save medical profile to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        medicalProfile: profileData,
        profileComplete: true,
        researchOptIn: profileData.researchConsent,
        anonymousDataSharing: profileData.anonymousDataSharing,
        updatedAt: new Date()
      });

      // Also create a separate medical profiles collection for research
      if (profileData.researchConsent) {
        const anonymizedProfile = {
          ...profileData,
          anonymousId: `anon_${Date.now()}`,
          submittedAt: new Date(),
          // Remove any identifying information
          email: undefined,
          name: undefined
        };
        
        // In production, save to medical profiles collection
        console.log('Anonymized profile ready for research:', anonymizedProfile);
      }

      toast({
        title: "Profile Complete!",
        description: "Thank you for contributing to Morgellons research. Your data helps advance understanding.",
      });

      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Profile save error:', error);
      toast({
        title: "Profile Save Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Fiber Friends!</h1>
          <p className="text-gray-600 mt-2">
            Let's set up your comprehensive medical profile to help advance Morgellons research
          </p>
        </div>
        
        <MedicalProfileForm 
          onComplete={handleProfileComplete}
          isNewUser={true}
        />
        
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-700">Saving your profile...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}