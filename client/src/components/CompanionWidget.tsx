import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanionProgress } from '@/contexts/CompanionProgressContext';
import { Link } from 'wouter';
import { 
  Heart, 
  MessageCircle, 
  Star, 
  TrendingUp,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const CompanionWidget = () => {
  const { user } = useAuth();
  const { tierProgress } = useCompanionProgress();
  const [companionImage, setCompanionImage] = useState<string | null>(null);
  const [companionConfig, setCompanionConfig] = useState<any>(null);

  useEffect(() => {
    const loadCompanionData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('CompanionWidget: User data loaded:', userData);
            
            // Check for companion data - ONLY use real Firebase data
            const image = userData.companionImage;
            const config = userData.companionConfig;
            const hasCompanion = userData.hasCompanion;
            const companionSkipped = userData.companionSkipped;
            
            console.log('CompanionWidget: Companion status -', {
              hasImage: !!image,
              hasConfig: !!config,
              hasCompanion,
              companionSkipped
            });
            
            if (image) {
              console.log('CompanionWidget: Setting companion image');
              setCompanionImage(image);
            }
            if (config) {
              console.log('CompanionWidget: Setting companion config');
              setCompanionConfig(config);
            }
          } else {
            console.log('CompanionWidget: No user document found');
          }
        } catch (error) {
          console.error('CompanionWidget: Error loading companion data:', error);
        }
      }
    };

    loadCompanionData();
  }, [user]);

  // Show creation prompt if user has no companion data
  if (!companionImage && !companionConfig) {
    console.log('CompanionWidget: No companion data found, showing creation prompt');
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Create AI Companion</h3>
              <p className="text-sm text-gray-600">Design your personalized health guide</p>
            </div>
            <Link href="/companion">
              <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Get Started
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('CompanionWidget: Rendering with real data - tier progress:', tierProgress);
  
  // Helper functions to display companion config data
  const getSpeciesDisplayName = (species: string): string => {
    const speciesMap: Record<string, string> = {
      'wise-owl': 'Wise Owl',
      'gentle-dolphin': 'Gentle Dolphin', 
      'mystical-fox': 'Mystical Fox',
      'healing-tree-spirit': 'Tree Spirit',
      'crystal-dragon': 'Crystal Dragon'
    };
    return speciesMap[species] || species;
  };

  const getPersonalityDisplayName = (personality: string): string => {
    const personalityMap: Record<string, string> = {
      'encouraging-cheerleader': 'Encouraging',
      'calm-meditation-guide': 'Zen Master',
      'scientific-researcher': 'Researcher',
      'compassionate-friend': 'Compassionate',
      'wise-mentor': 'Wise Mentor'
    };
    return personalityMap[personality] || personality;
  };

  const getExpertiseDisplayName = (expertise: string): string => {
    const expertiseMap: Record<string, string> = {
      'symptom-pattern-detective': 'Pattern Detective',
      'holistic-wellness-coach': 'Wellness Coach',
      'stress-management-therapist': 'Stress Therapist',
      'nutrition-specialist': 'Nutrition Expert',
      'research-coordinator': 'Research Guide'
    };
    return expertiseMap[expertise] || expertise;
  };
  
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Companion Avatar */}
          <div className="text-center">
            {companionImage ? (
              <img 
                src={companionImage} 
                alt="AI Companion" 
                className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-purple-200"
                onError={(e) => {
                  console.log('CompanionWidget: Image failed to load:', companionImage);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-purple-500" />
              </div>
            )}
            
            {/* Status Indicator - only show if real companion exists */}
            {(companionImage || companionConfig) && (
              <div className="flex items-center justify-center mt-2 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                AI Companion Active
              </div>
            )}
          </div>

          {/* Companion Info - Only real data */}
          <div className="text-center space-y-1">
            <h3 className="font-medium text-gray-900">
              {companionConfig?.customName || 
               (companionConfig?.species ? getSpeciesDisplayName(companionConfig.species) : 'AI Companion')}
            </h3>
            <p className="text-xs text-gray-600">
              {companionConfig?.personality && companionConfig?.expertise
                ? `${getPersonalityDisplayName(companionConfig.personality)} • ${getExpertiseDisplayName(companionConfig.expertise)}`
                : (companionConfig?.personality || companionConfig?.expertise) 
                  ? `${getPersonalityDisplayName(companionConfig.personality || '')} ${getExpertiseDisplayName(companionConfig.expertise || '')}`
                  : 'Personalized Health Guide'
              }
            </p>
          </div>

          {/* Tier Progress - Only show if user has made real progress */}
          {tierProgress && tierProgress.totalPoints > 0 && tierProgress.currentTier > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Tier {tierProgress.currentTier}</span>
                <span className="text-gray-600">{tierProgress.totalPoints} pts</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, tierProgress.progressPercentage)}%` 
                  }}
                ></div>
              </div>
              {tierProgress.pointsToNextTier > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  {tierProgress.pointsToNextTier} points to next tier
                </p>
              )}
            </div>
          )}

          {/* Action Button */}
          <Link href="/companion">
            <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              {companionImage || companionConfig ? 'Chat with Companion' : 'Visit Companion Dashboard'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};