import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCompanionProgress } from '@/contexts/CompanionProgressContext';
import { Link } from 'wouter';
import { Lock, Star, TrendingUp } from 'lucide-react';

interface TierGateProps {
  requiredTier: number;
  featureName: string;
  description: string;
  children: React.ReactNode;
  showUpgrade?: boolean;
}

export const TierGate: React.FC<TierGateProps> = ({ 
  requiredTier, 
  featureName, 
  description, 
  children, 
  showUpgrade = true 
}) => {
  const { tierProgress } = useCompanionProgress();
  const currentTier = tierProgress?.currentTier || 1;
  const hasAccess = currentTier >= requiredTier;

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <Card className="relative overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-600" />
      
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-3 rounded-full bg-gray-200">
              <Lock className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {featureName} - Tier {requiredTier} Required
            </h3>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="outline" className="text-xs">
                Current: Tier {currentTier}
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                Required: Tier {requiredTier}
              </Badge>
            </div>
          </div>

          {showUpgrade && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                Earn {((requiredTier - currentTier) * 100)} more points to unlock this feature
              </p>
              <Link href="/companion">
                <Button size="sm" variant="outline" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Upgrade Companion
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Predefined tier gates for common features
export const AdvancedInsightsTierGate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TierGate
    requiredTier={3}
    featureName="Advanced AI Insights"
    description="Unlock detailed health pattern analysis and personalized recommendations"
    children={children}
  />
);

export const PredictiveAnalyticsTierGate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TierGate
    requiredTier={5}
    featureName="Predictive Health Analytics"
    description="Get AI-powered predictions about symptom trends and flare-ups"
    children={children}
  />
);

export const ResearchRecommendationsTierGate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TierGate
    requiredTier={4}
    featureName="Research Study Recommendations"
    description="Receive personalized research study suggestions based on your profile"
    children={children}
  />
);

export const PersonalizedMealPlansTierGate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TierGate
    requiredTier={6}
    featureName="Personalized Meal Planning"
    description="AI-generated meal plans tailored to your symptom patterns and triggers"
    children={children}
  />
);

export const SymptomPredictionTierGate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TierGate
    requiredTier={7}
    featureName="Symptom Prediction System"
    description="Advanced AI predicts potential symptom flares 24-48 hours in advance"
    children={children}
  />
);

export const ComprehensiveReportsTierGate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TierGate
    requiredTier={8}
    featureName="Comprehensive Health Reports"
    description="Detailed provider-ready reports with AI analysis and recommendations"
    children={children}
  />
);

export const ExpertConsultationTierGate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TierGate
    requiredTier={9}
    featureName="AI Expert Consultation"
    description="Direct consultation with advanced AI medical expert trained on latest research"
    children={children}
  />
);

export const MasterCompanionTierGate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TierGate
    requiredTier={10}
    featureName="Master Companion Features"
    description="Unlock all premium features including research coordination and clinical trial matching"
    children={children}
  />
);