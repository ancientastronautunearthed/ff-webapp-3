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
            console.log('User data for companion check:', userData);
            
            // Check multiple possible field names for companion data
            const image = userData.companionImage || userData.aiCompanionImage || userData.companion_image;
            const config = userData.companionConfig || userData.aiCompanionConfig || userData.companion_config;
            
            if (image) {
              setCompanionImage(image);
            }
            if (config) {
              setCompanionConfig(config);
            }
            
            // Also check if companion was created during onboarding
            if (userData.onboardingCompleted && userData.hasCompanion && !userData.companionSkipped) {
              // User has completed onboarding with companion, but image might be loading
              if (!image && !config) {
                console.log('User has companion flag but no data found - showing fallback');
                // Show a loading state or basic companion info
                setCompanionConfig({ 
                  customName: 'AI Companion', 
                  species: 'Health Assistant',
                  personality: 'Caring'
                });
              }
            }
          }
        } catch (error) {
          console.log('Could not load companion data:', error);
        }
      }
    };

    loadCompanionData();
  }, [user]);

  if (!companionImage && !companionConfig) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">No AI Companion</h3>
              <p className="text-sm text-gray-600">Create your personalized health companion</p>
            </div>
            <Link href="/companion">
              <Button size="sm" className="w-full">
                Create Companion
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
      
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Companion Avatar and Info */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={companionImage} />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <Heart className="w-2 h-2 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900 truncate">
                  {companionConfig?.customName || 'AI Companion'}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  Level {tierProgress.currentTier}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {companionConfig?.species || 'Health Assistant'} • {companionConfig?.personality || 'Caring'}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{tierProgress.totalPoints}</div>
              <div className="text-xs text-blue-700">Total Points</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{tierProgress.unlockedFeatures.length}</div>
              <div className="text-xs text-purple-700">Features</div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {tierProgress.pointsToNextTier > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Next Level</span>
                <span className="text-gray-500">{tierProgress.pointsToNextTier} points</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${tierProgress.progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Recent Unlock Badge */}
          {tierProgress.recentUnlocks.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  New: {tierProgress.recentUnlocks[0]}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Link href="/companion" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <MessageCircle className="w-3 h-3 mr-1" />
                Chat
              </Button>
            </Link>
            <Link href="/companion" className="flex-1">
              <Button size="sm" className="w-full">
                <TrendingUp className="w-3 h-3 mr-1" />
                Progress
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};