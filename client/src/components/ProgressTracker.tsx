import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCompanionProgress, POINT_VALUES } from '@/contexts/CompanionProgressContext';
import { COMPANION_TIERS } from './CompanionTierSystem';
import { 
  Star, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Award,
  Target,
  Zap,
  Gift,
  Crown,
  Sparkles
} from 'lucide-react';

export const ProgressTracker = () => {
  const { 
    progressData, 
    tierProgress, 
    addPoints, 
    checkTierUnlock, 
    markCelebrationShown,
    getPointsBreakdown 
  } = useCompanionProgress();
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTier, setCelebrationTier] = useState<number>(0);

  // Check for tier unlocks on mount and data changes
  useEffect(() => {
    if (checkTierUnlock() && progressData) {
      const unshownUnlock = progressData.tierUnlockHistory.find(u => !u.celebrationShown);
      if (unshownUnlock) {
        setCelebrationTier(unshownUnlock.tier);
        setShowCelebration(true);
      }
    }
  }, [progressData, checkTierUnlock]);

  const handleCelebrationClose = async () => {
    setShowCelebration(false);
    if (celebrationTier > 0) {
      await markCelebrationShown(celebrationTier);
    }
  };

  const pointsBreakdown = getPointsBreakdown();
  const currentTierData = COMPANION_TIERS.find(t => t.level === tierProgress.currentTier);
  const nextTierData = COMPANION_TIERS.find(t => t.level === tierProgress.currentTier + 1);
  const TierIcon = currentTierData?.icon || Star;

  // Remove demo functions - production only

  return (
    <>
      <div className="space-y-6">
        {/* Current Progress Overview */}
        <Card className="relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-2 ${currentTierData?.color.replace('text-', 'bg-').replace('100', '500')}`} />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${currentTierData?.color}`}>
                  <TierIcon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">{currentTierData?.name}</CardTitle>
                  <p className="text-gray-600">Level {tierProgress.currentTier} • {tierProgress.totalPoints} total points</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                <Trophy className="w-4 h-4 mr-2" />
                Level {tierProgress.currentTier}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {nextTierData ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700">Progress to {nextTierData.name}</h4>
                    <span className="text-sm text-gray-500">
                      {tierProgress.pointsInCurrentTier} / {nextTierData.pointsRequired - (currentTierData?.pointsRequired || 0)} points
                    </span>
                  </div>
                  <Progress value={tierProgress.progressPercentage} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">
                    {tierProgress.pointsToNextTier} points until {nextTierData.name}
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="font-medium text-blue-900 mb-2">Next Unlock Preview</h5>
                  <ul className="space-y-1">
                    {nextTierData.features.slice(0, 2).map((feature, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-center">
                        <Gift className="w-3 h-3 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Crown className="w-12 h-12 mx-auto text-gold-500 mb-2" />
                <h4 className="font-medium text-gray-900">Maximum Level Reached!</h4>
                <p className="text-gray-600">Your companion has reached its full potential</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Points Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Points Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(pointsBreakdown).map(([category, points]) => (
                <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{points}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {category.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Point History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {progressData?.pointHistory.slice(-10).reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{entry.action}</div>
                    <div className="text-sm text-gray-500">
                      {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {entry.category.replace('_', ' ')}
                    </Badge>
                    <span className="text-lg font-bold text-green-600">+{entry.points}</span>
                  </div>
                </div>
              ))}
              
              {(!progressData?.pointHistory || progressData.pointHistory.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Start earning points by tracking your health!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo Point Actions (for testing) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Earn Points (Demo Actions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                onClick={() => addDemoPoints("Daily Check-in", POINT_VALUES.DAILY_CHECKIN, "health_tracking")}
                className="text-left justify-start"
              >
                <div>
                  <div className="font-medium">Daily Check-in</div>
                  <div className="text-sm text-gray-500">+{POINT_VALUES.DAILY_CHECKIN} points</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => addDemoPoints("Symptom Entry", POINT_VALUES.SYMPTOM_ENTRY, "health_tracking")}
                className="text-left justify-start"
              >
                <div>
                  <div className="font-medium">Log Symptoms</div>
                  <div className="text-sm text-gray-500">+{POINT_VALUES.SYMPTOM_ENTRY} points</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => addDemoPoints("Journal Entry", POINT_VALUES.JOURNAL_ENTRY, "health_tracking")}
                className="text-left justify-start"
              >
                <div>
                  <div className="font-medium">Write Journal</div>
                  <div className="text-sm text-gray-500">+{POINT_VALUES.JOURNAL_ENTRY} points</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => addDemoPoints("Forum Post", POINT_VALUES.FORUM_POST, "community")}
                className="text-left justify-start"
              >
                <div>
                  <div className="font-medium">Create Post</div>
                  <div className="text-sm text-gray-500">+{POINT_VALUES.FORUM_POST} points</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => addDemoPoints("Survey Complete", POINT_VALUES.SURVEY_COMPLETION, "research")}
                className="text-left justify-start"
              >
                <div>
                  <div className="font-medium">Complete Survey</div>
                  <div className="text-sm text-gray-500">+{POINT_VALUES.SURVEY_COMPLETION} points</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => addDemoPoints("Monthly Streak", POINT_VALUES.MONTHLY_STREAK, "engagement")}
                className="text-left justify-start"
              >
                <div>
                  <div className="font-medium">Monthly Streak</div>
                  <div className="text-sm text-gray-500">+{POINT_VALUES.MONTHLY_STREAK} points</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Unlock Celebration Dialog */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Companion Evolved!</h2>
                  <p className="text-gray-600">
                    {COMPANION_TIERS.find(t => t.level === celebrationTier)?.name}
                  </p>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Level {celebrationTier}
              </Badge>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">New Features Unlocked:</h4>
              <ul className="space-y-1">
                {COMPANION_TIERS.find(t => t.level === celebrationTier)?.features.map((feature, index) => (
                  <li key={index} className="text-sm text-green-800 flex items-center">
                    <Award className="w-3 h-3 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <Button onClick={handleCelebrationClose} className="w-full">
              Continue Journey
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};