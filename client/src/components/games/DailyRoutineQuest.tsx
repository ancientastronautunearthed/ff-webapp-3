import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Sword, 
  Shield, 
  Zap,
  Heart,
  Star,
  Trophy,
  Crown,
  Gem,
  Map,
  Compass,
  BookOpen,
  Sparkles,
  Target,
  Calendar,
  CheckCircle,
  Clock,
  Sun,
  Moon,
  Droplets,
  Apple,
  Dumbbell,
  Brain,
  Users,
  Stethoscope,
  Camera,
  FileText
} from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Character {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength: number;
  wisdom: number;
  vitality: number;
  class: 'warrior' | 'mage' | 'healer' | 'ranger';
  equipment: {
    weapon?: string;
    armor?: string;
    accessory?: string;
  };
  inventory: string[];
}

interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'wellness' | 'tracking' | 'community' | 'medical';
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  xpReward: number;
  goldReward: number;
  itemRewards: string[];
  requirements: string[];
  completed: boolean;
  dailyTask: boolean;
  realWorldAction: string;
  icon: React.ReactNode;
  color: string;
}

interface GameProgress {
  character: Character;
  completedQuests: string[];
  dailyStreak: number;
  totalQuestsCompleted: number;
  achievementsUnlocked: string[];
  currentZone: string;
  unlockedZones: string[];
  lastPlayed: Date;
}

const CHARACTER_CLASSES = {
  warrior: {
    name: 'Health Warrior',
    description: 'Masters physical wellness and symptom tracking',
    icon: <Sword className="w-6 h-6" />,
    color: 'text-red-600',
    bonuses: { strength: 2, vitality: 1 }
  },
  mage: {
    name: 'Knowledge Seeker',
    description: 'Excels at research and understanding patterns',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'text-blue-600',
    bonuses: { wisdom: 2, mana: 20 }
  },
  healer: {
    name: 'Wellness Guardian',
    description: 'Focuses on recovery and community support',
    icon: <Heart className="w-6 h-6" />,
    color: 'text-green-600',
    bonuses: { vitality: 1, wisdom: 1, maxHealth: 20 }
  },
  ranger: {
    name: 'Balance Keeper',
    description: 'Maintains harmony between all aspects of health',
    icon: <Compass className="w-6 h-6" />,
    color: 'text-purple-600',
    bonuses: { strength: 1, wisdom: 1, vitality: 1 }
  }
};

const DAILY_QUESTS: Omit<Quest, 'id' | 'completed'>[] = [
  {
    title: 'Morning Symptom Check',
    description: 'Start your day by logging how you feel',
    category: 'tracking',
    difficulty: 'easy',
    xpReward: 25,
    goldReward: 10,
    itemRewards: ['Health Potion'],
    requirements: ['Log at least 1 symptom'],
    dailyTask: true,
    realWorldAction: 'Complete symptom tracker entry',
    icon: <Sun className="w-4 h-4" />,
    color: 'bg-yellow-500'
  },
  {
    title: 'Digital Matchbox Entry',
    description: 'Document your daily observations',
    category: 'tracking',
    difficulty: 'easy',
    xpReward: 30,
    goldReward: 15,
    itemRewards: ['Journal Scroll'],
    requirements: ['Create journal entry'],
    dailyTask: true,
    realWorldAction: 'Write in Digital Matchbox',
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-blue-500'
  },
  {
    title: 'Hydration Quest',
    description: 'Maintain proper hydration levels',
    category: 'wellness',
    difficulty: 'easy',
    xpReward: 20,
    goldReward: 5,
    itemRewards: ['Crystal Vial'],
    requirements: ['Drink 8 glasses of water'],
    dailyTask: true,
    realWorldAction: 'Track water intake',
    icon: <Droplets className="w-4 h-4" />,
    color: 'bg-cyan-500'
  },
  {
    title: 'Mindful Movement',
    description: 'Engage in gentle physical activity',
    category: 'wellness',
    difficulty: 'medium',
    xpReward: 40,
    goldReward: 20,
    itemRewards: ['Strength Charm'],
    requirements: ['10+ minutes of movement'],
    dailyTask: true,
    realWorldAction: 'Complete exercise or stretching',
    icon: <Dumbbell className="w-4 h-4" />,
    color: 'bg-orange-500'
  },
  {
    title: 'Community Connection',
    description: 'Engage with fellow adventurers',
    category: 'community',
    difficulty: 'medium',
    xpReward: 35,
    goldReward: 25,
    itemRewards: ['Friendship Token'],
    requirements: ['Forum post or peer interaction'],
    dailyTask: true,
    realWorldAction: 'Participate in community forum',
    icon: <Users className="w-4 h-4" />,
    color: 'bg-purple-500'
  },
  {
    title: 'Evening Reflection',
    description: 'End your day with mindful observation',
    category: 'wellness',
    difficulty: 'easy',
    xpReward: 25,
    goldReward: 10,
    itemRewards: ['Wisdom Pearl'],
    requirements: ['Evening symptom or mood check'],
    dailyTask: true,
    realWorldAction: 'Complete evening reflection',
    icon: <Moon className="w-4 h-4" />,
    color: 'bg-indigo-500'
  }
];

const STORY_QUESTS: Omit<Quest, 'id' | 'completed'>[] = [
  {
    title: 'The Great Health Archive',
    description: 'Complete your medical profile to unlock ancient knowledge',
    category: 'medical',
    difficulty: 'medium',
    xpReward: 100,
    goldReward: 50,
    itemRewards: ['Tome of Health', 'Profile Medallion'],
    requirements: ['Complete medical profile'],
    dailyTask: false,
    realWorldAction: 'Fill out complete medical information',
    icon: <Stethoscope className="w-4 h-4" />,
    color: 'bg-red-500'
  },
  {
    title: 'The Companion Bond',
    description: 'Create your AI companion to aid in your journey',
    category: 'health',
    difficulty: 'hard',
    xpReward: 150,
    goldReward: 75,
    itemRewards: ['Companion Crystal', 'Bond of Trust'],
    requirements: ['Create AI companion'],
    dailyTask: false,
    realWorldAction: 'Complete AI companion creation',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'bg-pink-500'
  },
  {
    title: 'Pattern Recognition Master',
    description: 'Discover the hidden connections in your health data',
    category: 'tracking',
    difficulty: 'hard',
    xpReward: 200,
    goldReward: 100,
    itemRewards: ['Pattern Lens', 'Insight Gem'],
    requirements: ['Complete 30 symptom entries', 'View AI insights'],
    dailyTask: false,
    realWorldAction: 'Track symptoms for pattern analysis',
    icon: <Target className="w-4 h-4" />,
    color: 'bg-green-500'
  },
  {
    title: 'Community Champion',
    description: 'Become a beacon of support for other adventurers',
    category: 'community',
    difficulty: 'epic',
    xpReward: 300,
    goldReward: 150,
    itemRewards: ['Champion\'s Crown', 'Helping Hand Badge'],
    requirements: ['10 forum posts', '5 peer connections', 'Help 3 new users'],
    dailyTask: false,
    realWorldAction: 'Build strong community connections',
    icon: <Crown className="w-4 h-4" />,
    color: 'bg-yellow-600'
  }
];

export const DailyRoutineQuest: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'character' | 'quests' | 'inventory'>('character');

  const createNewCharacter = (characterClass: keyof typeof CHARACTER_CLASSES): Character => {
    const classData = CHARACTER_CLASSES[characterClass];
    return {
      name: `${classData.name}`,
      level: 1,
      xp: 0,
      xpToNext: 100,
      health: 100 + (classData.bonuses.maxHealth || 0),
      maxHealth: 100 + (classData.bonuses.maxHealth || 0),
      mana: 50 + (classData.bonuses.mana || 0),
      maxMana: 50 + (classData.bonuses.mana || 0),
      strength: 10 + (classData.bonuses.strength || 0),
      wisdom: 10 + (classData.bonuses.wisdom || 0),
      vitality: 10 + (classData.bonuses.vitality || 0),
      class: characterClass,
      equipment: {},
      inventory: ['Health Potion', 'Beginner\'s Guide']
    };
  };

  const loadProgress = useCallback(async () => {
    if (!user?.uid) {
      const demoProgress: GameProgress = {
        character: createNewCharacter('warrior'),
        completedQuests: [],
        dailyStreak: 0,
        totalQuestsCompleted: 0,
        achievementsUnlocked: [],
        currentZone: 'Healing Village',
        unlockedZones: ['Healing Village'],
        lastPlayed: new Date()
      };
      setGameProgress(demoProgress);
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const progress = userData.dailyQuestProgress || {
          character: createNewCharacter('warrior'),
          completedQuests: [],
          dailyStreak: 0,
          totalQuestsCompleted: 0,
          achievementsUnlocked: [],
          currentZone: 'Healing Village',
          unlockedZones: ['Healing Village'],
          lastPlayed: new Date()
        };
        setGameProgress(progress);
      }
    } catch (error) {
      console.error('Error loading quest progress:', error);
      const fallbackProgress: GameProgress = {
        character: createNewCharacter('warrior'),
        completedQuests: [],
        dailyStreak: 0,
        totalQuestsCompleted: 0,
        achievementsUnlocked: [],
        currentZone: 'Healing Village',
        unlockedZones: ['Healing Village'],
        lastPlayed: new Date()
      };
      setGameProgress(fallbackProgress);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const completeQuest = useCallback((quest: Quest) => {
    if (!gameProgress) return;

    const newProgress = { ...gameProgress };
    
    // Add XP and level up if needed
    newProgress.character.xp += quest.xpReward;
    while (newProgress.character.xp >= newProgress.character.xpToNext) {
      newProgress.character.xp -= newProgress.character.xpToNext;
      newProgress.character.level += 1;
      newProgress.character.xpToNext = Math.floor(newProgress.character.xpToNext * 1.2);
      
      // Level up bonuses
      newProgress.character.maxHealth += 10;
      newProgress.character.health = newProgress.character.maxHealth;
      newProgress.character.maxMana += 5;
      newProgress.character.mana = newProgress.character.maxMana;
      newProgress.character.strength += 1;
      newProgress.character.wisdom += 1;
      newProgress.character.vitality += 1;
    }

    // Add rewards to inventory
    newProgress.character.inventory.push(...quest.itemRewards);
    
    // Mark quest as completed
    newProgress.completedQuests.push(quest.id);
    newProgress.totalQuestsCompleted += 1;

    // Update daily streak if daily task
    if (quest.dailyTask) {
      newProgress.dailyStreak += 1;
    }

    setGameProgress(newProgress);

    toast({
      title: "Quest Completed!",
      description: `Gained ${quest.xpReward} XP and rewards!`,
      duration: 3000
    });

    if (newProgress.character.level > gameProgress.character.level) {
      toast({
        title: "Level Up!",
        description: `Congratulations! You reached level ${newProgress.character.level}!`,
        duration: 5000
      });
    }
  }, [gameProgress, toast]);

  const getAllQuests = useCallback((): Quest[] => {
    const dailyQuests: Quest[] = DAILY_QUESTS.map((quest, index) => ({
      ...quest,
      id: `daily-${index}`,
      completed: gameProgress?.completedQuests.includes(`daily-${index}`) || false
    }));

    const storyQuests: Quest[] = STORY_QUESTS.map((quest, index) => ({
      ...quest,
      id: `story-${index}`,
      completed: gameProgress?.completedQuests.includes(`story-${index}`) || false
    }));

    return [...dailyQuests, ...storyQuests];
  }, [gameProgress]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!gameProgress) return null;

  const allQuests = getAllQuests();
  const availableQuests = allQuests.filter(q => !q.completed);
  const completedQuests = allQuests.filter(q => q.completed);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-6 w-6 text-blue-600" />
            Daily Routine Builder Quest
            <Badge variant="outline" className="ml-2">
              {gameProgress.currentZone}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">Transform your health routine into an epic RPG adventure!</p>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'character' ? 'default' : 'outline'}
          onClick={() => setActiveTab('character')}
          className="flex items-center gap-2"
        >
          <Sword className="w-4 h-4" />
          Character
        </Button>
        <Button
          variant={activeTab === 'quests' ? 'default' : 'outline'}
          onClick={() => setActiveTab('quests')}
          className="flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          Quests
        </Button>
        <Button
          variant={activeTab === 'inventory' ? 'default' : 'outline'}
          onClick={() => setActiveTab('inventory')}
          className="flex items-center gap-2"
        >
          <Gem className="w-4 h-4" />
          Inventory
        </Button>
      </div>

      {/* Character Tab */}
      {activeTab === 'character' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {CHARACTER_CLASSES[gameProgress.character.class].icon}
                <span className={CHARACTER_CLASSES[gameProgress.character.class].color}>
                  {gameProgress.character.name}
                </span>
                <Badge>Level {gameProgress.character.level}</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">
                {CHARACTER_CLASSES[gameProgress.character.class].description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Health and Mana */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-600">Health</span>
                  <span className="text-sm">{gameProgress.character.health}/{gameProgress.character.maxHealth}</span>
                </div>
                <Progress value={(gameProgress.character.health / gameProgress.character.maxHealth) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">Mana</span>
                  <span className="text-sm">{gameProgress.character.mana}/{gameProgress.character.maxMana}</span>
                </div>
                <Progress value={(gameProgress.character.mana / gameProgress.character.maxMana) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-600">Experience</span>
                  <span className="text-sm">{gameProgress.character.xp}/{gameProgress.character.xpToNext}</span>
                </div>
                <Progress value={(gameProgress.character.xp / gameProgress.character.xpToNext) * 100} className="h-2" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{gameProgress.character.strength}</div>
                  <div className="text-xs text-gray-600">Strength</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{gameProgress.character.wisdom}</div>
                  <div className="text-xs text-gray-600">Wisdom</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{gameProgress.character.vitality}</div>
                  <div className="text-xs text-gray-600">Vitality</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Adventure Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-blue-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-600">{gameProgress.dailyStreak}</div>
                  <div className="text-xs text-blue-800">Daily Streak</div>
                </div>
                <div className="text-center bg-green-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-600">{gameProgress.totalQuestsCompleted}</div>
                  <div className="text-xs text-green-800">Quests Completed</div>
                </div>
                <div className="text-center bg-purple-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-600">{gameProgress.achievementsUnlocked.length}</div>
                  <div className="text-xs text-purple-800">Achievements</div>
                </div>
                <div className="text-center bg-yellow-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-yellow-600">{gameProgress.unlockedZones.length}</div>
                  <div className="text-xs text-yellow-800">Zones Unlocked</div>
                </div>
              </div>

              {/* Demo Progress Button */}
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const demoProgress: GameProgress = {
                      ...gameProgress,
                      character: {
                        ...gameProgress.character,
                        level: 8,
                        xp: 45,
                        xpToNext: 180,
                        strength: 18,
                        wisdom: 16,
                        vitality: 15,
                        inventory: ['Health Potion', 'Wisdom Pearl', 'Strength Charm', 'Companion Crystal', 'Pattern Lens']
                      },
                      dailyStreak: 14,
                      totalQuestsCompleted: 32,
                      achievementsUnlocked: ['First Steps', 'Daily Warrior', 'Knowledge Seeker', 'Community Builder'],
                      unlockedZones: ['Healing Village', 'Wisdom Temple', 'Strength Peaks']
                    };
                    setGameProgress(demoProgress);
                    toast({
                      title: "Demo Progress Applied",
                      description: "Character now has advanced stats and achievements!"
                    });
                  }}
                  className="text-xs"
                >
                  Demo Progress (Test)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quests Tab */}
      {activeTab === 'quests' && (
        <div className="space-y-6">
          {/* Daily Quests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Daily Quests
                <Badge className="bg-blue-100 text-blue-800">
                  {availableQuests.filter(q => q.dailyTask).length} Available
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allQuests.filter(q => q.dailyTask).map((quest) => (
                  <div
                    key={quest.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      quest.completed ? 'bg-green-50 border-green-200' : 'hover:border-blue-300'
                    }`}
                    onClick={() => !quest.completed && setSelectedQuest(quest)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded ${quest.color} text-white`}>
                        {quest.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{quest.title}</h4>
                        <Badge size="sm" className={getDifficultyColor(quest.difficulty)}>
                          {quest.difficulty}
                        </Badge>
                      </div>
                      {quest.completed && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{quest.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-600">{quest.xpReward} XP</span>
                      <span className="text-yellow-600">{quest.goldReward} Gold</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Story Quests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Story Quests
                <Badge className="bg-purple-100 text-purple-800">
                  {availableQuests.filter(q => !q.dailyTask).length} Available
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allQuests.filter(q => !q.dailyTask).map((quest) => (
                  <div
                    key={quest.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      quest.completed ? 'bg-green-50 border-green-200' : 'hover:border-blue-300'
                    }`}
                    onClick={() => !quest.completed && setSelectedQuest(quest)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded ${quest.color} text-white`}>
                        {quest.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{quest.title}</h4>
                        <Badge className={getDifficultyColor(quest.difficulty)}>
                          {quest.difficulty}
                        </Badge>
                      </div>
                      {quest.completed && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{quest.description}</p>
                    <div className="text-xs text-gray-500 mb-3">
                      <strong>Requirements:</strong> {quest.requirements.join(', ')}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-600 font-medium">{quest.xpReward} XP</span>
                      <span className="text-yellow-600 font-medium">{quest.goldReward} Gold</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gem className="w-5 h-5" />
              Inventory
              <Badge>{gameProgress.character.inventory.length} Items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {gameProgress.character.inventory.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <Gem className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quest Detail Modal */}
      {selectedQuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded ${selectedQuest.color} text-white`}>
                  {selectedQuest.icon}
                </div>
                {selectedQuest.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{selectedQuest.description}</p>
              
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2">Real World Action:</h4>
                <p className="text-sm text-blue-800">{selectedQuest.realWorldAction}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedQuest.requirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Rewards:</h4>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-purple-600">{selectedQuest.xpReward} XP</span>
                  <span className="text-yellow-600">{selectedQuest.goldReward} Gold</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedQuest.itemRewards.map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => completeQuest(selectedQuest)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Complete Quest
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedQuest(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};