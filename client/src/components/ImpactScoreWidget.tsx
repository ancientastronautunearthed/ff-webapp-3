import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, Zap } from 'lucide-react';
import { useImpactCalculation } from '@/hooks/useImpactCalculation';

export const ImpactScoreWidget = () => {
  const { impactScore, loading, calculating } = useImpactCalculation();

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!impactScore) {
    return (
      <Card className="w-full border-dashed border-2">
        <CardContent className="p-4 text-center">
          <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Start contributing to earn impact points</p>
        </CardContent>
      </Card>
    );
  }

  const getTierColor = (score: number) => {
    if (score >= 5000) return 'from-cyan-400 to-blue-500';
    if (score >= 3000) return 'from-gray-300 to-gray-400';
    if (score >= 1500) return 'from-yellow-400 to-yellow-600';
    if (score >= 500) return 'from-gray-200 to-gray-300';
    return 'from-orange-300 to-orange-400';
  };

  const getTierName = (score: number) => {
    if (score >= 5000) return 'Diamond';
    if (score >= 3000) return 'Platinum';
    if (score >= 1500) return 'Gold';
    if (score >= 500) return 'Silver';
    return 'Bronze';
  };

  const getNextTierTarget = (score: number) => {
    if (score >= 5000) return null;
    if (score >= 3000) return 5000;
    if (score >= 1500) return 3000;
    if (score >= 500) return 1500;
    return 500;
  };

  const nextTarget = getNextTierTarget(impactScore.totalScore);
  const progressToNext = nextTarget ? (impactScore.totalScore / nextTarget) * 100 : 100;

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full bg-gradient-to-r ${getTierColor(impactScore.totalScore)}`}>
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm">Impact Score</div>
              <Badge variant="secondary" className="text-xs">
                {getTierName(impactScore.totalScore)} Tier
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">
              {impactScore.totalScore.toLocaleString()}
            </div>
            {calculating && (
              <div className="text-xs text-gray-500 flex items-center">
                <Zap className="h-3 w-3 mr-1 animate-pulse" />
                Updating...
              </div>
            )}
          </div>
        </div>

        {nextTarget && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Progress to {getTierName(nextTarget)}</span>
              <span>{impactScore.totalScore} / {nextTarget.toLocaleString()}</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-3 text-center">
          <div>
            <div className="text-sm font-semibold text-purple-600">{impactScore.researchScore}</div>
            <div className="text-xs text-gray-500">Research</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-pink-600">{impactScore.supportScore}</div>
            <div className="text-xs text-gray-500">Support</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactScoreWidget;