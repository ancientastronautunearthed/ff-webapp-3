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
  energy: number;
  maxEnergy: number;
  strength: number;
  wisdom: number;
  vitality: number;
  charisma: number;
  luck: number;
  class: 'warrior' | 'mage' | 'healer' | 'ranger';
  equipment: {
    weapon?: string;
    armor?: string;
    accessory?: string;
    ring?: string;
    necklace?: string;
  };
  inventory: string[];
  gold: number;
  totalScore: number;
  prestige: number;
  rebornCount: number;
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
  availableQuests: string[];
  dailyStreak: number;
  totalQuestsCompleted: number;
  achievementsUnlocked: string[];
  currentZone: string;
  unlockedZones: string[];
  storyProgress: number;
  chapterUnlocked: number;
  worldEvents: WorldEvent[];
  relationships: { [npcId: string]: number };
  discoveries: string[];
  secrets: string[];
  lastPlayed: Date;
  playTime: number;
  sessionCount: number;
}

interface WorldEvent {
  id: string;
  title: string;
  description: string;
  type: 'story' | 'random' | 'seasonal' | 'emergency';
  active: boolean;
  expiresAt?: Date;
  choices?: EventChoice[];
}

interface EventChoice {
  id: string;
  text: string;
  consequences: string[];
  requirements?: string[];
}

const CHARACTER_CLASSES = {
  warrior: {
    name: 'Coffee Shop Barista',
    description: 'Masters the ancient art of caffeine alchemy and customer service under pressure',
    icon: <Sword className="w-6 h-6" />,
    color: 'text-red-600',
    bonuses: { strength: 2, vitality: 1, energy: 20 }
  },
  mage: {
    name: 'Freelance Debugger',
    description: 'Wields mysterious powers to vanquish code bugs and IT nightmares',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'text-blue-600',
    bonuses: { wisdom: 2, mana: 20, luck: 1 }
  },
  healer: {
    name: 'Pet Cafe Owner',
    description: 'Brings joy to the world through adorable animals and baked goods',
    icon: <Heart className="w-6 h-6" />,
    color: 'text-green-600',
    bonuses: { vitality: 1, wisdom: 1, charisma: 2, maxHealth: 20 }
  },
  ranger: {
    name: 'Plant Whisperer',
    description: 'Maintains the delicate balance between urban life and nature',
    icon: <Compass className="w-6 h-6" />,
    color: 'text-purple-600',
    bonuses: { strength: 1, wisdom: 1, vitality: 1, charisma: 1 }
  }
};

const STORY_CHAPTERS = [
  {
    id: 1,
    title: "The Great WiFi Outage",
    description: "When the internet died, heroes emerged from the most unlikely places...",
    requiredLevel: 1,
    zones: ["Downtown Cafe District", "The Server Room Dungeon"]
  },
  {
    id: 2,
    title: "The Mystery of the Missing Leftovers",
    description: "Someone has been stealing lunches from the office fridge. Justice must be served... cold.",
    requiredLevel: 10,
    zones: ["Corporate Office Towers", "The Breakroom of Despair"]
  },
  {
    id: 3,
    title: "The Social Media Apocalypse",
    description: "When all social platforms merge into one terrible entity, only the chosen few can restore digital balance.",
    requiredLevel: 25,
    zones: ["Silicon Valley Wastelands", "The Algorithm Citadel"]
  },
  {
    id: 4,
    title: "The Last Pizza Slice",
    description: "In a world where pizza has become extinct, one slice remains. The fate of Friday nights hangs in the balance.",
    requiredLevel: 50,
    zones: ["The Frozen Food Tundra", "Mount Pepperoni"]
  },
  {
    id: 5,
    title: "The Great Subscription Cancellation",
    description: "Trapped in an endless loop of subscription services, heroes must find the mythical 'Unsubscribe' button.",
    requiredLevel: 75,
    zones: ["The Streaming Labyrinth", "Customer Service Purgatory"]
  }
];

const LEADERBOARD_CATEGORIES = [
  'totalScore',
  'level',
  'questsCompleted',
  'dailyStreak',
  'prestige',
  'discoveries'
];

const DYNAMIC_QUESTS: Omit<Quest, 'id' | 'completed'>[] = [
  {
    title: 'The Morning Coffee Ritual',
    description: 'Brew the perfect cup to start your heroic day',
    category: 'wellness',
    difficulty: 'easy',
    xpReward: 25,
    goldReward: 10,
    itemRewards: ['Caffeinated Elixir'],
    requirements: ['Complete morning routine'],
    dailyTask: true,
    realWorldAction: 'Start your day with intention',
    icon: <Sun className="w-4 h-4" />,
    color: 'bg-yellow-500'
  },
  {
    title: 'The Daily Chronicle',
    description: 'Record your adventures for future generations of heroes',
    category: 'tracking',
    difficulty: 'easy',
    xpReward: 30,
    goldReward: 15,
    itemRewards: ['Wisdom Scroll'],
    requirements: ['Document your day'],
    dailyTask: true,
    realWorldAction: 'Reflect and journal',
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-blue-500'
  },
  {
    title: 'The Hydration Salvation',
    description: 'Prevent the great dehydration disaster of the modern office',
    category: 'wellness',
    difficulty: 'easy',
    xpReward: 20,
    goldReward: 5,
    itemRewards: ['Aqua Crystal'],
    requirements: ['Stay properly hydrated'],
    dailyTask: true,
    realWorldAction: 'Drink water regularly',
    icon: <Droplets className="w-4 h-4" />,
    color: 'bg-cyan-500'
  },
  {
    title: 'Escape the Desk Prison',
    description: 'Break free from the ergonomic shackles of modern life',
    category: 'wellness',
    difficulty: 'medium',
    xpReward: 40,
    goldReward: 20,
    itemRewards: ['Mobility Rune'],
    requirements: ['Move your body'],
    dailyTask: true,
    realWorldAction: 'Get some physical activity',
    icon: <Dumbbell className="w-4 h-4" />,
    color: 'bg-orange-500'
  },
  {
    title: 'The Social Network',
    description: 'Connect with other humans in this strange digital realm',
    category: 'community',
    difficulty: 'medium',
    xpReward: 35,
    goldReward: 25,
    itemRewards: ['Social Bond'],
    requirements: ['Meaningful interaction'],
    dailyTask: true,
    realWorldAction: 'Connect with others',
    icon: <Users className="w-4 h-4" />,
    color: 'bg-purple-500'
  },
  {
    title: 'The Nighttime Wind-Down',
    description: 'Prepare for the great sleep adventure',
    category: 'wellness',
    difficulty: 'easy',
    xpReward: 25,
    goldReward: 10,
    itemRewards: ['Dream Essence'],
    requirements: ['Evening wind-down routine'],
    dailyTask: true,
    realWorldAction: 'End day mindfully',
    icon: <Moon className="w-4 h-4" />,
    color: 'bg-indigo-500'
  },
  {
    title: 'The Great Productivity Hack',
    description: 'Discover one small way to make tomorrow slightly less chaotic',
    category: 'wellness',
    difficulty: 'medium',
    xpReward: 50,
    goldReward: 30,
    itemRewards: ['Efficiency Crystal'],
    requirements: ['Plan or organize something'],
    dailyTask: true,
    realWorldAction: 'Improve your systems',
    icon: <Target className="w-4 h-4" />,
    color: 'bg-green-500'
  },
  {
    title: 'The Unexpected Kindness',
    description: 'Spread a little chaos... the good kind',
    category: 'community',
    difficulty: 'easy',
    xpReward: 35,
    goldReward: 20,
    itemRewards: ['Karma Coin'],
    requirements: ['Do something nice'],
    dailyTask: true,
    realWorldAction: 'Perform random act of kindness',
    icon: <Heart className="w-4 h-4" />,
    color: 'bg-pink-500'
  }
];

const EPIC_QUESTS: Omit<Quest, 'id' | 'completed'>[] = [
  {
    title: 'The Profile of Destiny',
    description: 'Create a legendary profile that will echo through the ages',
    category: 'tracking',
    difficulty: 'medium',
    xpReward: 100,
    goldReward: 50,
    itemRewards: ['Identity Medallion', 'Legacy Scroll'],
    requirements: ['Complete personal profile'],
    dailyTask: false,
    realWorldAction: 'Set up your character profile',
    icon: <Star className="w-4 h-4" />,
    color: 'bg-red-500'
  },
  {
    title: 'The Digital Familiar',
    description: 'Summon an AI companion to guide you through the chaos of modern life',
    category: 'tracking',
    difficulty: 'hard',
    xpReward: 150,
    goldReward: 75,
    itemRewards: ['AI Bond Crystal', 'Digital Familiar'],
    requirements: ['Create AI companion'],
    dailyTask: false,
    realWorldAction: 'Set up AI companion',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'bg-pink-500'
  },
  {
    title: 'The Data Whisperer',
    description: 'Uncover the mysterious patterns hidden in the chaos of daily life',
    category: 'tracking',
    difficulty: 'hard',
    xpReward: 200,
    goldReward: 100,
    itemRewards: ['Pattern Decoder', 'Insight Prism'],
    requirements: ['Track activities for 30 days', 'Discover patterns'],
    dailyTask: false,
    realWorldAction: 'Build tracking habits',
    icon: <Target className="w-4 h-4" />,
    color: 'bg-green-500'
  },
  {
    title: 'The Community Guardian',
    description: 'Rise to become a legendary figure in the realm of social connection',
    category: 'community',
    difficulty: 'epic',
    xpReward: 300,
    goldReward: 150,
    itemRewards: ['Guardian Crown', 'Social Nexus'],
    requirements: ['Make meaningful connections', 'Help others', 'Build community'],
    dailyTask: false,
    realWorldAction: 'Become a community leader',
    icon: <Crown className="w-4 h-4" />,
    color: 'bg-yellow-600'
  },
  {
    title: 'The Great Rebalancing',
    description: 'Achieve the legendary work-life balance that scholars say is impossible',
    category: 'wellness',
    difficulty: 'epic',
    xpReward: 500,
    goldReward: 250,
    itemRewards: ['Balance Stone', 'Harmony Amulet'],
    requirements: ['Maintain consistency for 90 days'],
    dailyTask: false,
    realWorldAction: 'Create sustainable life balance',
    icon: <Compass className="w-4 h-4" />,
    color: 'bg-purple-600'
  },
  {
    title: 'The Ascension Protocol',
    description: 'Transcend mortal limitations and unlock infinite potential',
    category: 'wellness',
    difficulty: 'legendary',
    xpReward: 1000,
    goldReward: 500,
    itemRewards: ['Phoenix Feather', 'Rebirth Crystal'],
    requirements: ['Reach level 100', 'Complete all epic quests'],
    dailyTask: false,
    realWorldAction: 'Achieve personal transformation',
    icon: <Trophy className="w-4 h-4" />,
    color: 'bg-gradient-to-r from-purple-600 to-pink-600'
  }
];

export const DailyRoutineQuest: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'character' | 'quests' | 'inventory' | 'leaderboard' | 'story'>('character');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('totalScore');

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
      energy: 100 + (classData.bonuses.energy || 0),
      maxEnergy: 100 + (classData.bonuses.energy || 0),
      strength: 10 + (classData.bonuses.strength || 0),
      wisdom: 10 + (classData.bonuses.wisdom || 0),
      vitality: 10 + (classData.bonuses.vitality || 0),
      charisma: 10 + (classData.bonuses.charisma || 0),
      luck: 10 + (classData.bonuses.luck || 0),
      class: characterClass,
      equipment: {},
      inventory: ['Survival Kit', 'Motivation Potion'],
      gold: 100,
      totalScore: 0,
      prestige: 0,
      rebornCount: 0
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
          availableQuests: [],
          dailyStreak: 0,
          totalQuestsCompleted: 0,
          achievementsUnlocked: [],
          currentZone: 'Downtown Cafe District',
          unlockedZones: ['Downtown Cafe District'],
          storyProgress: 0,
          chapterUnlocked: 1,
          worldEvents: [],
          relationships: {},
          discoveries: [],
          secrets: [],
          lastPlayed: new Date(),
          playTime: 0,
          sessionCount: 0
        };
        setGameProgress(progress);
      }
    } catch (error) {
      console.error('Error loading quest progress:', error);
      const fallbackProgress: GameProgress = {
        character: createNewCharacter('warrior'),
        completedQuests: [],
        availableQuests: [],
        dailyStreak: 0,
        totalQuestsCompleted: 0,
        achievementsUnlocked: [],
        currentZone: 'Downtown Cafe District',
        unlockedZones: ['Downtown Cafe District'],
        storyProgress: 0,
        chapterUnlocked: 1,
        worldEvents: [],
        relationships: {},
        discoveries: [],
        secrets: [],
        lastPlayed: new Date(),
        playTime: 0,
        sessionCount: 0
      };
      setGameProgress(fallbackProgress);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const completeQuest = useCallback((quest: Quest) => {
    if (!gameProgress) return;

    const newProgress = { ...gameProgress };
    
    // Calculate score bonus
    const scoreMultiplier = 1 + (newProgress.character.level * 0.1) + (newProgress.prestige * 0.5);
    const scoreGained = Math.floor(quest.xpReward * scoreMultiplier);
    newProgress.character.totalScore += scoreGained;

    // Add XP and level up if needed
    newProgress.character.xp += quest.xpReward;
    newProgress.character.gold += quest.goldReward;
    
    while (newProgress.character.xp >= newProgress.character.xpToNext) {
      newProgress.character.xp -= newProgress.character.xpToNext;
      newProgress.character.level += 1;
      newProgress.character.xpToNext = Math.floor(newProgress.character.xpToNext * 1.15);
      
      // Level up bonuses - more dramatic increases
      newProgress.character.maxHealth += 15;
      newProgress.character.health = newProgress.character.maxHealth;
      newProgress.character.maxMana += 8;
      newProgress.character.mana = newProgress.character.maxMana;
      newProgress.character.maxEnergy += 10;
      newProgress.character.energy = newProgress.character.maxEnergy;
      
      // Stat increases
      newProgress.character.strength += Math.floor(Math.random() * 3) + 1;
      newProgress.character.wisdom += Math.floor(Math.random() * 3) + 1;
      newProgress.character.vitality += Math.floor(Math.random() * 3) + 1;
      newProgress.character.charisma += Math.floor(Math.random() * 2) + 1;
      newProgress.character.luck += Math.floor(Math.random() * 2) + 1;
      
      // Prestige system - every 100 levels
      if (newProgress.character.level % 100 === 0) {
        newProgress.character.prestige += 1;
        newProgress.character.rebornCount += 1;
        newProgress.character.totalScore += 10000;
      }
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

  const generateDailyQuests = useCallback((): Quest[] => {
    if (!gameProgress) return [];
    
    // Generate 3-5 random daily quests
    const numQuests = 3 + Math.floor(Math.random() * 3);
    const selectedQuests: Quest[] = [];
    const availableQuests = [...DYNAMIC_QUESTS];
    
    for (let i = 0; i < numQuests && availableQuests.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableQuests.length);
      const quest = availableQuests.splice(randomIndex, 1)[0];
      selectedQuests.push({
        ...quest,
        id: `daily-${Date.now()}-${i}`,
        completed: false
      });
    }
    
    return selectedQuests;
  }, [gameProgress]);

  const getAllQuests = useCallback((): Quest[] => {
    const dailyQuests = generateDailyQuests();
    
    const epicQuests: Quest[] = EPIC_QUESTS.map((quest, index) => ({
      ...quest,
      id: `epic-${index}`,
      completed: gameProgress?.completedQuests.includes(`epic-${index}`) || false
    }));

    return [...dailyQuests, ...epicQuests];
  }, [gameProgress, generateDailyQuests]);

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
      <div className="flex gap-2 flex-wrap">
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
          variant={activeTab === 'story' ? 'default' : 'outline'}
          onClick={() => setActiveTab('story')}
          className="flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Story
        </Button>
        <Button
          variant={activeTab === 'inventory' ? 'default' : 'outline'}
          onClick={() => setActiveTab('inventory')}
          className="flex items-center gap-2"
        >
          <Gem className="w-4 h-4" />
          Inventory
        </Button>
        <Button
          variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
          onClick={() => setActiveTab('leaderboard')}
          className="flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          Leaderboard
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
                  <span className="text-sm font-medium text-red-600 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Health
                  </span>
                  <span className="text-sm">{gameProgress.character.health}/{gameProgress.character.maxHealth}</span>
                </div>
                <Progress value={(gameProgress.character.health / gameProgress.character.maxHealth) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Mana
                  </span>
                  <span className="text-sm">{gameProgress.character.mana}/{gameProgress.character.maxMana}</span>
                </div>
                <Progress value={(gameProgress.character.mana / gameProgress.character.maxMana) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-600 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Experience
                  </span>
                  <span className="text-sm">{gameProgress.character.xp}/{gameProgress.character.xpToNext}</span>
                </div>
                <Progress value={(gameProgress.character.xp / gameProgress.character.xpToNext) * 100} className="h-2" />
              </div>

              {/* Equipment */}
              {Object.keys(gameProgress.character.equipment).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Equipment</h4>
                  <div className="space-y-1">
                    {gameProgress.character.equipment.weapon && (
                      <div className="flex items-center gap-2 text-xs">
                        <Sword className="w-3 h-3 text-orange-600" />
                        <span>{gameProgress.character.equipment.weapon}</span>
                      </div>
                    )}
                    {gameProgress.character.equipment.armor && (
                      <div className="flex items-center gap-2 text-xs">
                        <Shield className="w-3 h-3 text-blue-600" />
                        <span>{gameProgress.character.equipment.armor}</span>
                      </div>
                    )}
                    {gameProgress.character.equipment.accessory && (
                      <div className="flex items-center gap-2 text-xs">
                        <Gem className="w-3 h-3 text-purple-600" />
                        <span>{gameProgress.character.equipment.accessory}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-5 gap-2 pt-4">
                <div className="text-center bg-red-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-red-600">{gameProgress.character.strength}</div>
                  <div className="text-xs text-red-800">Strength</div>
                </div>
                <div className="text-center bg-blue-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-blue-600">{gameProgress.character.wisdom}</div>
                  <div className="text-xs text-blue-800">Wisdom</div>
                </div>
                <div className="text-center bg-green-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-green-600">{gameProgress.character.vitality}</div>
                  <div className="text-xs text-green-800">Vitality</div>
                </div>
                <div className="text-center bg-purple-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-purple-600">{gameProgress.character.charisma}</div>
                  <div className="text-xs text-purple-800">Charisma</div>
                </div>
                <div className="text-center bg-yellow-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-yellow-600">{gameProgress.character.luck}</div>
                  <div className="text-xs text-yellow-800">Luck</div>
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
                <div className="text-center bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg p-3">
                  <div className="text-2xl font-bold">{gameProgress.character.totalScore.toLocaleString()}</div>
                  <div className="text-xs opacity-90">Total Score</div>
                </div>
                <div className="text-center bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-lg p-3">
                  <div className="text-2xl font-bold">{gameProgress.character.gold.toLocaleString()}</div>
                  <div className="text-xs opacity-90">Gold Coins</div>
                </div>
                <div className="text-center bg-blue-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-600">{gameProgress.dailyStreak}</div>
                  <div className="text-xs text-blue-800">Daily Streak</div>
                </div>
                <div className="text-center bg-green-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-600">{gameProgress.totalQuestsCompleted}</div>
                  <div className="text-xs text-green-800">Quests Done</div>
                </div>
                <div className="text-center bg-purple-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-600">{gameProgress.character.prestige}</div>
                  <div className="text-xs text-purple-800">Prestige</div>
                </div>
                <div className="text-center bg-red-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-red-600">{gameProgress.character.rebornCount}</div>
                  <div className="text-xs text-red-800">Rebirths</div>
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
                        level: 42,
                        xp: 1845,
                        xpToNext: 2100,
                        health: 680,
                        maxHealth: 680,
                        mana: 285,
                        maxMana: 285,
                        energy: 520,
                        maxEnergy: 520,
                        strength: 78,
                        wisdom: 65,
                        vitality: 82,
                        charisma: 43,
                        luck: 29,
                        totalScore: 156780,
                        gold: 8420,
                        prestige: 0,
                        rebornCount: 0,
                        equipment: {
                          weapon: 'Legendary Coffee Grinder',
                          armor: 'Ergonomic Chair of Power',
                          accessory: 'Ring of WiFi Stability',
                          ring: 'Band of Infinite Patience',
                          necklace: 'Amulet of Work-Life Balance'
                        },
                        inventory: ['Survival Kit', 'Motivation Potion', 'Caffeinated Elixir', 'Wisdom Scroll', 'Aqua Crystal', 'Mobility Rune', 'Social Bond', 'Dream Essence', 'Efficiency Crystal', 'Karma Coin']
                      },
                      completedQuests: ['epic-0', 'epic-1', 'epic-2'],
                      dailyStreak: 37,
                      totalQuestsCompleted: 124,
                      achievementsUnlocked: ['First Steps', 'Daily Warrior', 'Coffee Master', 'Social Butterfly', 'Level Crusher', 'Gold Hoarder'],
                      unlockedZones: ['Downtown Cafe District', 'Corporate Office Towers', 'Silicon Valley Wastelands'],
                      chapterUnlocked: 3,
                      storyProgress: 45
                    };
                    setGameProgress(demoProgress);
                    toast({
                      title: "Hero Mode Activated!",
                      description: "Welcome back, legendary coffee shop warrior! Your epic journey continues..."
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
          {/* Daily Adventures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Adventures
                <Badge className="bg-blue-100 text-blue-800">
                  {availableQuests.filter(q => q.dailyTask).length} Available
                </Badge>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={generateDailyQuests}
                  className="ml-auto"
                >
                  Refresh Adventures
                </Button>
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

          {/* Epic Quests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Epic Quests
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

      {/* Story Tab */}
      {activeTab === 'story' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              The Chronicles of Modern Life
              <Badge>Chapter {gameProgress.chapterUnlocked}</Badge>
            </CardTitle>
            <p className="text-sm text-gray-600">
              An epic tale of coffee, code, and the pursuit of work-life balance
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {STORY_CHAPTERS.map((chapter) => (
              <div
                key={chapter.id}
                className={`border rounded-lg p-4 ${
                  gameProgress.chapterUnlocked >= chapter.id
                    ? 'border-green-200 bg-green-50'
                    : gameProgress.character.level >= chapter.requiredLevel
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    variant={gameProgress.chapterUnlocked >= chapter.id ? 'default' : 'outline'}
                    className="w-16 justify-center"
                  >
                    Ch. {chapter.id}
                  </Badge>
                  <h3 className="font-semibold">{chapter.title}</h3>
                  {gameProgress.chapterUnlocked >= chapter.id && (
                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{chapter.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-purple-600">Required Level: {chapter.requiredLevel}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-blue-600">Zones: {chapter.zones.join(', ')}</span>
                </div>
                {gameProgress.character.level < chapter.requiredLevel && (
                  <p className="text-xs text-red-600 mt-2">
                    Reach level {chapter.requiredLevel} to unlock this chapter
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Global Leaderboard
              <div className="ml-auto flex gap-2">
                {LEADERBOARD_CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs"
                  >
                    {category === 'totalScore' ? 'Score' : 
                     category === 'questsCompleted' ? 'Quests' :
                     category === 'dailyStreak' ? 'Streak' :
                     category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Mock leaderboard data */}
              {[
                { rank: 1, name: 'CoffeeKing42', score: 1250000, level: 87, badge: '👑' },
                { rank: 2, name: 'CodeWizard', score: 980000, level: 73, badge: '🥈' },
                { rank: 3, name: 'PlantWhisperer', score: 875000, level: 69, badge: '🥉' },
                { rank: 4, name: 'DebugMaster', score: 720000, level: 61, badge: '⭐' },
                { rank: 5, name: 'You', score: gameProgress.character.totalScore, level: gameProgress.character.level, badge: '🔥' }
              ].map((player) => (
                <div
                  key={player.rank}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    player.name === 'You' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{player.badge}</span>
                  <span className="font-bold text-lg w-8">#{player.rank}</span>
                  <span className="font-medium flex-1">{player.name}</span>
                  <Badge variant="outline">Lv. {player.level}</Badge>
                  <span className="font-bold text-purple-600">{player.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                🏆 Leaderboards reset monthly with special rewards for top performers!
              </p>
            </div>
          </CardContent>
        </Card>
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