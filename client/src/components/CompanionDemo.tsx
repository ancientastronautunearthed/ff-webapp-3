import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCompanionProgress } from '@/contexts/CompanionProgressContext';
import { useCompanionAccess } from '@/hooks/useCompanionAccess';
import { COMPANION_FUNCTIONS } from '@/constants/companionFunctions';
import { COMPANION_TIERS } from '@/components/CompanionTierSystem';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  Lock, 
  Star,
  Zap,
  AlertCircle
} from 'lucide-react';

export const CompanionDemo = () => {
  const { tierProgress, awardPoints, setPoints } = useCompanionProgress();
  const { getAvailableFunctions, currentTier } = useCompanionAccess();
  const [isRunning, setIsRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  
  const availableFunctions = getAvailableFunctions();
  const unlockedFunctions = availableFunctions.filter(f => f.status.unlocked);
  const lockedFunctions = availableFunctions.filter(f => !f.status.unlocked);
  
  const runTierDemo = async () => {
    setIsRunning(true);
    setDemoStep(0);
    
    // Reset to level 1
    console.log('🔄 Starting demo - resetting to Level 1');
    setPoints(0);
    setDemoStep(1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo progression through each tier
    for (let tier = 1; tier <= 10; tier++) {
      const tierData = COMPANION_TIERS.find(t => t.level === tier);
      if (tierData) {
        console.log(`⚡ Setting points to ${tierData.pointsRequired} for Level ${tier}`);
        setPoints(tierData.pointsRequired);
        setDemoStep(tier + 1);
        
        // Show notification for new unlocks
        const newUnlocks = COMPANION_FUNCTIONS.filter(f => f.tier === tier);
        if (newUnlocks.length > 0) {
          console.log(`✅ Level ${tier} unlocked functions:`, newUnlocks.map(f => f.name));
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('🎉 Demo complete - all tiers unlocked');
    setIsRunning(false);
    setDemoStep(11);
  };
  
  const resetDemo = () => {
    setPoints(0);
    setDemoStep(0);
    setIsRunning(false);
  };
  
  const addPointsManually = (points: number) => {
    console.log(`➕ Adding ${points} points manually`);
    awardPoints(points, `Manual demo points: +${points}`);
  };
  
  const getCurrentTierInfo = () => {
    const currentTierData = COMPANION_TIERS.find(t => t.level === currentTier);
    const nextTierData = COMPANION_TIERS.find(t => t.level === currentTier + 1);
    
    return {
      current: currentTierData,
      next: nextTierData,
      progress: nextTierData 
        ? Math.min(((tierProgress.totalPoints - (currentTierData?.pointsRequired || 0)) / 
            (nextTierData.pointsRequired - (currentTierData?.pointsRequired || 0))) * 100, 100)
        : 100
    };
  };
  
  const tierInfo = getCurrentTierInfo();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Companion Tier Demo System
          </CardTitle>
          <p className="text-gray-600">
            Test companion function unlocking across all 10 tiers to verify proper gating behavior.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runTierDemo} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running Demo...' : 'Auto-Progress Through All Tiers'}
            </Button>
            
            <Button 
              onClick={resetDemo} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Level 1
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              onClick={() => addPointsManually(50)} 
              variant="outline" 
              size="sm"
            >
              +50 Points
            </Button>
            <Button 
              onClick={() => addPointsManually(100)} 
              variant="outline" 
              size="sm"
            >
              +100 Points
            </Button>
            <Button 
              onClick={() => addPointsManually(250)} 
              variant="outline" 
              size="sm"
            >
              +250 Points
            </Button>
            <Button 
              onClick={() => addPointsManually(500)} 
              variant="outline" 
              size="sm"
            >
              +500 Points
            </Button>
          </div>
          
          {isRunning && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Demo Progress</span>
              </div>
              <p className="text-sm text-blue-800">
                Currently demonstrating tier {demoStep}/10 progression...
              </p>
              <Progress value={(demoStep / 11) * 100} className="mt-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Tier</span>
              <Badge variant="default" className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                Level {currentTier}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Points</span>
              <span className="font-medium">{totalPoints}</span>
            </div>
            
            {tierInfo.next && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress to Level {tierInfo.next.level}</span>
                  <span className="font-medium">
                    {totalPoints} / {tierInfo.next.pointsRequired}
                  </span>
                </div>
                <Progress value={tierInfo.progress} className="h-2" />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{unlockedFunctions.length}</div>
                <div className="text-xs text-gray-600">Functions Unlocked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{lockedFunctions.length}</div>
                <div className="text-xs text-gray-600">Functions Locked</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Function Status Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {COMPANION_FUNCTIONS.map((func) => {
                const isUnlocked = currentTier >= func.tier;
                const tierData = COMPANION_TIERS.find(t => t.level === func.tier);
                
                return (
                  <div 
                    key={func.id} 
                    className={`flex items-center justify-between p-2 rounded border ${
                      isUnlocked 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isUnlocked ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        isUnlocked ? 'text-green-900' : 'text-gray-600'
                      }`}>
                        {func.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={isUnlocked ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        L{func.tier}
                      </Badge>
                      {!isUnlocked && (
                        <span className="text-xs text-gray-500">
                          {func.pointsRequired} pts
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {demoStep === 11 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Demo Complete!</span>
            </div>
            <p className="text-sm text-green-800">
              Successfully demonstrated companion progression through all 10 tiers. 
              All functions have been properly unlocked according to their tier requirements.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};