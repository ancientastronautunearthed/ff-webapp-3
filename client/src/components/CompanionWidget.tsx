import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCompanionProgress } from '@/contexts/CompanionProgressContext';
import { Link } from 'wouter';
import { 
  Heart, 
  MessageCircle, 
  Star, 
  ChevronRight
} from 'lucide-react';

export const CompanionWidget = () => {
  const { tierProgress } = useCompanionProgress();
  
  // Generic AI companion
  const companion = {
    name: "Health Assistant",
    imageUrl: "/api/placeholder/64/64",
    tier: tierProgress?.currentTier || 1,
    active: true
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
              <AvatarImage 
                src={companion.imageUrl} 
                alt={companion.name} 
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white text-lg font-semibold">
                HA
              </AvatarFallback>
            </Avatar>
            
            {/* Active indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <Heart className="w-3 h-3 text-white animate-pulse" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {companion.name}
              </h3>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-0">
                Level {companion.tier}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-2 truncate">
              AI Health Assistant • Morgellons Specialist
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-700">
                  {tierProgress?.totalPoints || 0} points
                </span>
              </div>
              
              <Button asChild variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-2">
                <Link href="/companion">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress to Level {companion.tier + 1}</span>
            <span>{100 - ((tierProgress?.totalPoints || 0) % 100)} points needed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(((tierProgress?.totalPoints || 0) % 100), 100)}%` 
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};