import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CommunityConnectionPuzzle } from './CommunityConnectionPuzzle';
import { BreathingGarden } from './BreathingGarden';
import { SymptomMemoryMatch } from './SymptomMemoryMatch';
import { 
  Gamepad2, 
  Puzzle, 
  Heart, 
  Brain,
  Leaf,
  Star,
  Trophy,
  Users,
  Sparkles
} from 'lucide-react';

interface GameInfo {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Mindfulness' | 'Community' | 'Physical' | 'Cognitive';
  available: boolean;
  comingSoon?: boolean;
}

const WELLNESS_GAMES: GameInfo[] = [
  {
    id: 'community_puzzle',
    title: 'Community Connection Puzzle',
    description: 'Build beautiful puzzles by engaging with the community and supporting others',
    icon: <Puzzle className="w-5 h-5" />,
    color: 'from-blue-500 to-purple-600',
    difficulty: 'Easy',
    category: 'Community',
    available: true
  },
  {
    id: 'breathing_garden',
    title: 'Stress Relief Breathing Garden',
    description: 'Grow a virtual garden through guided breathing exercises and meditation',
    icon: <Leaf className="w-5 h-5" />,
    color: 'from-green-500 to-teal-600',
    difficulty: 'Easy',
    category: 'Mindfulness',
    available: true
  },
  {
    id: 'memory_patterns',
    title: 'Symptom Pattern Memory',
    description: 'Memory matching game to help identify health patterns and triggers',
    icon: <Brain className="w-5 h-5" />,
    color: 'from-orange-500 to-red-600',
    difficulty: 'Medium',
    category: 'Cognitive',
    available: true
  },
  {
    id: 'routine_quest',
    title: 'Daily Routine Builder Quest',
    description: 'RPG-style adventure where real health tasks advance your character',
    icon: <Trophy className="w-5 h-5" />,
    color: 'from-yellow-500 to-orange-600',
    difficulty: 'Medium',
    category: 'Physical',
    available: false,
    comingSoon: true
  },
  {
    id: 'mindful_focus',
    title: 'Mindful Fiber Focus',
    description: 'Meditation game with calming fiber art visualization and progressive relaxation',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-600',
    difficulty: 'Easy',
    category: 'Mindfulness',
    available: false,
    comingSoon: true
  },
  {
    id: 'energy_defense',
    title: 'Energy Level Tower Defense',
    description: 'Defend against energy drains using real wellness strategies',
    icon: <Star className="w-5 h-5" />,
    color: 'from-cyan-500 to-blue-600',
    difficulty: 'Hard',
    category: 'Cognitive',
    available: false,
    comingSoon: true
  }
];

export const WellnessGamesHub: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>('memory_patterns');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Community': return 'bg-blue-100 text-blue-800';
      case 'Mindfulness': return 'bg-green-100 text-green-800';
      case 'Physical': return 'bg-orange-100 text-orange-800';
      case 'Cognitive': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderGame = () => {
    switch (selectedGame) {
      case 'community_puzzle':
        return <CommunityConnectionPuzzle />;
      case 'breathing_garden':
        return <BreathingGarden />;
      case 'memory_patterns':
        return <SymptomMemoryMatch />;
      default:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="py-8 text-center">
              <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon!</h3>
              <p className="text-gray-600">This wellness game is currently in development.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Gamepad2 className="h-8 w-8 text-blue-600" />
          Personal Wellness Games
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Interactive wellness games designed to support your health journey while making daily activities more engaging and rewarding.
        </p>
      </div>

      <Tabs value={selectedGame || ''} onValueChange={setSelectedGame} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Game</h2>
          
          <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full h-auto p-1 bg-gray-100">
            {WELLNESS_GAMES.map((game) => (
              <TabsTrigger
                key={game.id}
                value={game.id}
                disabled={!game.available}
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm p-0 h-auto"
              >
                <div className="p-3 w-full">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center mx-auto mb-2 text-white`}>
                    {game.icon}
                  </div>
                  <p className="text-xs font-medium text-center">{game.title}</p>
                  {game.comingSoon && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      Soon
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Game Details */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Game Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {WELLNESS_GAMES.map((game) => (
                    <div
                      key={game.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedGame === game.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!game.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => game.available && setSelectedGame(game.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center text-white flex-shrink-0`}>
                          {game.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {game.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {game.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge size="sm" className={getCategoryColor(game.category)}>
                              {game.category}
                            </Badge>
                            <Badge size="sm" className={getDifficultyColor(game.difficulty)}>
                              {game.difficulty}
                            </Badge>
                          </div>
                          {game.comingSoon && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Games Completed</span>
                    <Badge variant="secondary">0/6</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Points</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Daily Streak</span>
                    <Badge variant="secondary">0 days</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {WELLNESS_GAMES.map((game) => (
              <TabsContent key={game.id} value={game.id} className="mt-0">
                {renderGame()}
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
};