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
  skills: {
    [skillName: string]: number;
  };
  titles: string[];
  currentTitle?: string;
  petCompanion?: PetCompanion;
  guildMembership?: string;
}

interface PetCompanion {
  id: string;
  name: string;
  species: string;
  level: number;
  xp: number;
  abilities: string[];
  loyalty: number;
  hunger: number;
  happiness: number;
  lastFed: Date;
}

interface NPC {
  id: string;
  name: string;
  role: string;
  location: string;
  personality: string;
  questsAvailable: string[];
  dialogue: string[];
  relationshipLevel: number;
  specialAbility?: string;
}

interface Guild {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  requirements: {
    level: number;
    skills?: { [skillName: string]: number };
  };
  benefits: string[];
  weeklyQuests: string[];
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

const SHOP_ITEMS = [
  {
    id: 'health_potion',
    name: 'Superior Health Potion',
    description: 'Instantly restore full health and gain temporary vitality boost',
    price: 150,
    category: 'consumable',
    icon: <Heart className="w-4 h-4" />,
    color: 'text-red-600',
    effects: { healthRestore: 100, vitality: 5 }
  },
  {
    id: 'xp_booster',
    name: 'Experience Multiplier',
    description: 'Double XP gains for the next 5 quests completed',
    price: 300,
    category: 'booster',
    icon: <Star className="w-4 h-4" />,
    color: 'text-purple-600',
    effects: { xpMultiplier: 2, duration: 5 }
  },
  {
    id: 'lucky_charm',
    name: 'Lucky Rabbit\'s Foot',
    description: 'Permanently increase luck stat and improve quest rewards',
    price: 500,
    category: 'permanent',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-yellow-600',
    effects: { luck: 10, questRewardBonus: 0.2 }
  },
  {
    id: 'energy_crystal',
    name: 'Eternal Energy Crystal',
    description: 'Increase maximum energy and regeneration rate',
    price: 750,
    category: 'equipment',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-blue-600',
    effects: { maxEnergy: 50, energyRegen: 10 }
  },
  {
    id: 'wisdom_tome',
    name: 'Ancient Wisdom Tome',
    description: 'Permanently boost wisdom and unlock advanced quest types',
    price: 1000,
    category: 'permanent',
    icon: <BookOpen className="w-4 h-4" />,
    color: 'text-indigo-600',
    effects: { wisdom: 15, unlocksAdvancedQuests: true }
  }
];

const NPCS: NPC[] = [
  {
    id: 'barista_sage',
    name: 'Sage Brewmaster',
    role: 'Coffee Shop Mentor',
    location: 'Downtown Cafe District',
    personality: 'Wise, caffeine-addicted, speaks in coffee metaphors',
    questsAvailable: ['perfect_latte', 'espresso_enlightenment'],
    dialogue: [
      "Life is like coffee - it's all about the grind, young one.",
      "I've seen many heroes rise and fall... mostly fall due to inadequate caffeine.",
      "The secret to happiness? Finding the perfect coffee-to-milk ratio."
    ],
    relationshipLevel: 0,
    specialAbility: 'Grants +50% XP for daily routine quests when relationship ≥ 50'
  },
  {
    id: 'debug_oracle',
    name: 'Oracle Debugger',
    role: 'Code Whisperer',
    location: 'Silicon Valley Wastelands',
    personality: 'Mysterious, speaks in programming riddles, surprisingly philosophical',
    questsAvailable: ['fix_legacy_code', 'rubber_duck_debugging'],
    dialogue: [
      "Error 404: Motivation not found. Have you tried turning your life off and on again?",
      "In the land of infinite loops, the person with one breakpoint is king.",
      "Sometimes the best code is the code you don't write... but you still have to write it."
    ],
    relationshipLevel: 0,
    specialAbility: 'Unlocks advanced technology quests when relationship ≥ 75'
  },
  {
    id: 'pet_whisperer',
    name: 'Dr. Pawsitive',
    role: 'Animal Therapist',
    location: 'Community Gardens',
    personality: 'Eternally optimistic, talks to animals, somehow they talk back',
    questsAvailable: ['rescue_stray', 'pet_therapy_session'],
    dialogue: [
      "Every creature has a story, even that judgmental cat over there.",
      "Animals are pure love with fur, feathers, or scales attached.",
      "Your pet companion is trying to tell you something important... about snacks."
    ],
    relationshipLevel: 0,
    specialAbility: 'Enables pet companion adoption when relationship ≥ 25'
  },
  {
    id: 'plant_sensei',
    name: 'Sensei Chlorophyll',
    role: 'Green Thumb Master',
    location: 'Urban Jungle',
    personality: 'Patient, speaks slowly, occasionally photosynthesizes mid-conversation',
    questsAvailable: ['save_dying_plant', 'create_garden_oasis'],
    dialogue: [
      "Plants grow at their own pace... unlike deadlines, which seem to sprint.",
      "Every leaf has a lesson. This one says 'water me more, you monster.'",
      "Balance is key - too much sun burns, too little light withers."
    ],
    relationshipLevel: 0,
    specialAbility: 'Provides daily energy regeneration bonuses when relationship ≥ 40'
  }
];

const GUILDS: Guild[] = [
  {
    id: 'coffee_connoisseurs',
    name: 'The Caffeine Crusaders',
    description: 'United in our quest for the perfect brew and conquering Monday mornings',
    memberCount: 1247,
    requirements: { level: 5, skills: { 'Coffee Brewing': 10 } },
    benefits: ['Double gold from morning quests', '+25% XP from daily routines', 'Access to rare coffee items'],
    weeklyQuests: ['Guild Latte Art Contest', 'Monday Morning Survival Challenge']
  },
  {
    id: 'debug_masters',
    name: 'The Infinite Loop Society',
    description: 'Where bugs go to die and developers go to cry (but in solidarity)',
    memberCount: 892,
    requirements: { level: 15, skills: { 'Problem Solving': 25, 'Patience': 20 } },
    benefits: ['Access to legendary debugging tools', 'Stack Overflow privileges', '+50% wisdom gain'],
    weeklyQuests: ['Fix the Unfixable Bug', 'Explain Code to Rubber Duck']
  },
  {
    id: 'life_balancers',
    name: 'The Equilibrium Masters',
    description: 'Seeking the mythical work-life balance through ancient techniques and modern memes',
    memberCount: 2156,
    requirements: { level: 25, skills: { 'Self Care': 30, 'Time Management': 25 } },
    benefits: ['Weekly wellness bonuses', 'Stress reduction abilities', 'Unlimited sick days (in-game)'],
    weeklyQuests: ['Perfect Day Challenge', 'Digital Detox Adventure']
  }
];

const PET_SPECIES = [
  {
    id: 'desk_cat',
    name: 'Keyboard Cat',
    description: 'Mysteriously appears on your keyboard during important video calls',
    abilities: ['Typo Generation', 'Meeting Disruption', 'Infinite Purring'],
    baseStats: { loyalty: 60, intelligence: 85, cuteness: 95 }
  },
  {
    id: 'stress_duck',
    name: 'Rubber Duck',
    description: 'The ultimate debugging companion and existential crisis counselor',
    abilities: ['Problem Solving', 'Silent Judgment', 'Bathroom Motivation'],
    baseStats: { loyalty: 90, intelligence: 70, cuteness: 80 }
  },
  {
    id: 'energy_hamster',
    name: 'Productivity Hamster',
    description: 'Runs endlessly on a wheel, generating pure motivation energy',
    abilities: ['Energy Boost', 'Deadline Reminder', 'Midnight Snack Procurement'],
    baseStats: { loyalty: 75, intelligence: 65, cuteness: 88 }
  }
];

const SKILLS = {
  'Coffee Brewing': 'Master the ancient art of caffeine extraction',
  'Problem Solving': 'Turn impossible problems into merely improbable ones',
  'Time Management': 'Bend the space-time continuum to fit more into your day',
  'Self Care': 'Remember that you\'re a human being, not a productivity machine',
  'Social Navigation': 'Successfully interact with other humans without major incidents',
  'Patience': 'Resist the urge to throw things when technology doesn\'t cooperate',
  'Adaptability': 'Roll with life\'s punches like a caffeinated ninja',
  'Focus': 'Maintain attention span longer than a goldfish in the age of notifications'
};

const TITLES = [
  'Novice Adventurer',
  'Coffee Apprentice',
  'Code Debugger',
  'Life Balancer',
  'Wellness Warrior',
  'Productivity Ninja',
  'Zen Master',
  'Legendary Life Hacker',
  'Supreme Being of Routine'
];

const RANDOM_EVENTS = [
  {
    id: 'coffee_shortage',
    title: 'The Great Coffee Shortage',
    description: 'All coffee shops in the district have run out of beans! The Barista Sage needs your help.',
    type: 'emergency',
    choices: [
      { id: 'help', text: 'Help find emergency coffee supplies', reward: { xp: 100, gold: 50, relationshipBonus: 'barista_sage' } },
      { id: 'ignore', text: 'Ignore and drink tea instead', reward: { xp: 10, wisdom: 2 } }
    ]
  },
  {
    id: 'wifi_blessing',
    title: 'The WiFi Gods Smile Upon You',
    description: 'Your internet connection is mysteriously perfect today! Even the Oracle Debugger is impressed.',
    type: 'blessing',
    choices: [
      { id: 'appreciate', text: 'Appreciate the moment and share the joy', reward: { xp: 50, luck: 1, skillBonus: 'Patience' } }
    ]
  },
  {
    id: 'pet_adoption_day',
    title: 'Mysterious Pet Adoption Event',
    description: 'Dr. Pawsitive has organized a special adoption event! Adorable companions seek worthy heroes.',
    type: 'special',
    choices: [
      { id: 'adopt', text: 'Adopt a loyal companion', reward: { petCompanion: true, relationshipBonus: 'pet_whisperer' } },
      { id: 'volunteer', text: 'Volunteer to help other adoptions', reward: { xp: 75, charisma: 3 } }
    ]
  },
  {
    id: 'guild_recruitment',
    title: 'Guild Recruitment Drive',
    description: 'Local guilds are actively recruiting! Join a community of like-minded adventurers.',
    type: 'social',
    choices: [
      { id: 'explore', text: 'Explore guild options', reward: { xp: 60, guildInvites: true } },
      { id: 'decline', text: 'Prefer the solo adventure life', reward: { wisdom: 3, skillBonus: 'Self Care' } }
    ]
  },
  {
    id: 'skill_master_challenge',
    title: 'Master\'s Challenge Appears',
    description: 'A legendary master has issued a challenge to test your skills! Success brings great rewards.',
    type: 'challenge',
    choices: [
      { id: 'accept', text: 'Accept the challenge', reward: { xp: 200, skillPoints: 5, title: true } },
      { id: 'prepare', text: 'Train first, challenge later', reward: { xp: 50, skillPoints: 2 } }
    ]
  }
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
  const [activeTab, setActiveTab] = useState<'character' | 'quests' | 'inventory' | 'leaderboard' | 'story' | 'shop' | 'npcs' | 'guilds' | 'pets'>('character');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('totalScore');
  const [questFilter, setQuestFilter] = useState<'all' | 'daily' | 'epic'>('all');
  const [showCompletedQuests, setShowCompletedQuests] = useState(false);
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);

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
      rebornCount: 0,
      skills: {
        'Coffee Brewing': 1,
        'Problem Solving': 1,
        'Time Management': 1,
        'Self Care': 1,
        'Social Navigation': 1,
        'Patience': 1,
        'Adaptability': 1,
        'Focus': 1
      },
      titles: ['Novice Adventurer'],
      currentTitle: 'Novice Adventurer'
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

  const triggerRandomEvent = useCallback(() => {
    if (!gameProgress || Math.random() > 0.15) return; // 15% chance

    const availableEvents = RANDOM_EVENTS.filter(event => 
      !gameProgress.worldEvents.some(we => we.id === event.id && we.active)
    );
    
    if (availableEvents.length === 0) return;

    const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    const worldEvent: WorldEvent = {
      id: randomEvent.id,
      title: randomEvent.title,
      description: randomEvent.description,
      type: randomEvent.type as any,
      active: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      choices: randomEvent.choices.map(choice => ({
        id: choice.id,
        text: choice.text,
        consequences: [`Gain ${choice.reward.xp || 0} XP`, `Gain ${choice.reward.gold || 0} Gold`],
        requirements: []
      }))
    };

    setGameProgress(prev => ({
      ...prev!,
      worldEvents: [...prev!.worldEvents, worldEvent]
    }));

    toast({
      title: "Random Event!",
      description: randomEvent.title,
      duration: 5000
    });
  }, [gameProgress, toast]);

  const completeQuest = useCallback((quest: Quest) => {
    if (!gameProgress) return;

    const newProgress = { ...gameProgress };
    
    // Calculate score bonus with difficulty multiplier
    const difficultyMultiplier = {
      'easy': 1,
      'medium': 1.5,
      'hard': 2,
      'epic': 3,
      'legendary': 5
    }[quest.difficulty] || 1;
    
    const scoreMultiplier = 1 + (newProgress.character.level * 0.1) + (newProgress.character.prestige * 0.5);
    const scoreGained = Math.floor(quest.xpReward * scoreMultiplier * difficultyMultiplier);
    newProgress.character.totalScore += scoreGained;

    // Add XP and level up if needed
    let xpGained = quest.xpReward;
    if (newProgress.character.luck > 50) {
      xpGained = Math.floor(xpGained * (1 + (newProgress.character.luck - 50) / 100));
    }
    
    newProgress.character.xp += xpGained;
    newProgress.character.gold += quest.goldReward;
    
    let leveledUp = false;
    while (newProgress.character.xp >= newProgress.character.xpToNext) {
      newProgress.character.xp -= newProgress.character.xpToNext;
      newProgress.character.level += 1;
      newProgress.character.xpToNext = Math.floor(newProgress.character.xpToNext * 1.15);
      leveledUp = true;
      
      // Level up bonuses - more dramatic increases
      newProgress.character.maxHealth += 15 + Math.floor(newProgress.character.vitality / 10);
      newProgress.character.health = newProgress.character.maxHealth;
      newProgress.character.maxMana += 8 + Math.floor(newProgress.character.wisdom / 15);
      newProgress.character.mana = newProgress.character.maxMana;
      newProgress.character.maxEnergy += 10 + Math.floor(newProgress.character.vitality / 12);
      newProgress.character.energy = newProgress.character.maxEnergy;
      
      // Stat increases with class bonuses
      const classData = CHARACTER_CLASSES[newProgress.character.class];
      newProgress.character.strength += Math.floor(Math.random() * 3) + 1 + (classData.bonuses.strength || 0);
      newProgress.character.wisdom += Math.floor(Math.random() * 3) + 1 + (classData.bonuses.wisdom || 0);
      newProgress.character.vitality += Math.floor(Math.random() * 3) + 1 + (classData.bonuses.vitality || 0);
      newProgress.character.charisma += Math.floor(Math.random() * 2) + 1 + (classData.bonuses.charisma || 0);
      newProgress.character.luck += Math.floor(Math.random() * 2) + 1 + (classData.bonuses.luck || 0);
      
      // Prestige system - every 100 levels
      if (newProgress.character.level % 100 === 0) {
        newProgress.character.prestige += 1;
        newProgress.character.rebornCount += 1;
        newProgress.character.totalScore += 10000;
        
        toast({
          title: "PRESTIGE ASCENSION!",
          description: `You have transcended to Prestige ${newProgress.character.prestige}! All future gains are enhanced!`,
          duration: 8000
        });
      }
    }

    // Skill progression based on quest type
    const skillGains: { [key: string]: number } = {};
    switch (quest.category) {
      case 'wellness':
        skillGains['Self Care'] = Math.floor(Math.random() * 3) + 1;
        skillGains['Time Management'] = Math.floor(Math.random() * 2) + 1;
        break;
      case 'community':
        skillGains['Social Navigation'] = Math.floor(Math.random() * 3) + 1;
        skillGains['Patience'] = Math.floor(Math.random() * 2) + 1;
        break;
      case 'tracking':
        skillGains['Focus'] = Math.floor(Math.random() * 3) + 1;
        skillGains['Problem Solving'] = Math.floor(Math.random() * 2) + 1;
        break;
      default:
        const randomSkill = Object.keys(SKILLS)[Math.floor(Math.random() * Object.keys(SKILLS).length)];
        skillGains[randomSkill] = Math.floor(Math.random() * 2) + 1;
    }

    // Apply skill gains
    Object.entries(skillGains).forEach(([skill, gain]) => {
      newProgress.character.skills[skill] = (newProgress.character.skills[skill] || 0) + gain;
    });

    // Title progression
    const totalSkillPoints = Object.values(newProgress.character.skills).reduce((sum, val) => sum + val, 0);
    let newTitle = '';
    if (totalSkillPoints >= 200) newTitle = 'Supreme Being of Routine';
    else if (totalSkillPoints >= 150) newTitle = 'Legendary Life Hacker';
    else if (totalSkillPoints >= 120) newTitle = 'Zen Master';
    else if (totalSkillPoints >= 90) newTitle = 'Productivity Ninja';
    else if (totalSkillPoints >= 60) newTitle = 'Wellness Warrior';
    else if (totalSkillPoints >= 40) newTitle = 'Life Balancer';
    else if (totalSkillPoints >= 25) newTitle = 'Code Debugger';
    else if (totalSkillPoints >= 15) newTitle = 'Coffee Apprentice';

    if (newTitle && !newProgress.character.titles.includes(newTitle)) {
      newProgress.character.titles.push(newTitle);
      newProgress.character.currentTitle = newTitle;
      toast({
        title: "New Title Earned!",
        description: `You are now known as: ${newTitle}`,
        duration: 5000
      });
    }

    // Pet companion care
    if (newProgress.character.petCompanion) {
      const hoursSinceLastFed = (Date.now() - new Date(newProgress.character.petCompanion.lastFed).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastFed > 12) {
        newProgress.character.petCompanion.hunger = Math.max(0, newProgress.character.petCompanion.hunger - 10);
        newProgress.character.petCompanion.happiness = Math.max(0, newProgress.character.petCompanion.happiness - 5);
      }
      
      // Pet gains XP too
      newProgress.character.petCompanion.xp += Math.floor(xpGained * 0.2);
      if (newProgress.character.petCompanion.xp >= newProgress.character.petCompanion.level * 100) {
        newProgress.character.petCompanion.level += 1;
        newProgress.character.petCompanion.xp = 0;
        toast({
          title: "Pet Level Up!",
          description: `${newProgress.character.petCompanion.name} reached level ${newProgress.character.petCompanion.level}!`,
          duration: 3000
        });
      }
    }

    // Add rewards to inventory with luck bonus
    const bonusItems = newProgress.character.luck > 75 && Math.random() < 0.3 ? ['Lucky Bonus Item'] : [];
    newProgress.character.inventory.push(...quest.itemRewards, ...bonusItems);
    
    // Mark quest as completed
    newProgress.completedQuests.push(quest.id);
    newProgress.totalQuestsCompleted += 1;

    // Update daily streak if daily task
    if (quest.dailyTask) {
      newProgress.dailyStreak += 1;
      
      // Streak bonuses
      if (newProgress.dailyStreak % 7 === 0) {
        newProgress.character.gold += 100;
        toast({
          title: "Weekly Streak Bonus!",
          description: "7-day streak achieved! Gained 100 bonus gold!",
          duration: 4000
        });
      }
    }

    // Chapter progression
    if (newProgress.character.level >= STORY_CHAPTERS[newProgress.chapterUnlocked]?.requiredLevel) {
      if (newProgress.chapterUnlocked < STORY_CHAPTERS.length) {
        newProgress.chapterUnlocked += 1;
        toast({
          title: "New Chapter Unlocked!",
          description: `Chapter ${newProgress.chapterUnlocked}: ${STORY_CHAPTERS[newProgress.chapterUnlocked - 1]?.title}`,
          duration: 6000
        });
      }
    }

    setGameProgress(newProgress);

    // Trigger random events
    triggerRandomEvent();

    // Success messages
    toast({
      title: "Quest Completed!",
      description: `Gained ${xpGained} XP, ${quest.goldReward} gold, and ${scoreGained.toLocaleString()} score!`,
      duration: 3000
    });

    if (leveledUp) {
      toast({
        title: "Level Up!",
        description: `Congratulations! You reached level ${newProgress.character.level}!`,
        duration: 5000
      });
    }
  }, [gameProgress, toast, triggerRandomEvent]);

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
        <Button
          variant={activeTab === 'shop' ? 'default' : 'outline'}
          onClick={() => setActiveTab('shop')}
          className="flex items-center gap-2"
        >
          <Gem className="w-4 h-4" />
          Shop
        </Button>
        <Button
          variant={activeTab === 'npcs' ? 'default' : 'outline'}
          onClick={() => setActiveTab('npcs')}
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          NPCs
        </Button>
        <Button
          variant={activeTab === 'guilds' ? 'default' : 'outline'}
          onClick={() => setActiveTab('guilds')}
          className="flex items-center gap-2"
        >
          <Crown className="w-4 h-4" />
          Guilds
        </Button>
        <Button
          variant={activeTab === 'pets' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pets')}
          className="flex items-center gap-2"
        >
          <Heart className="w-4 h-4" />
          Pets
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
                  <span className="text-sm">{gameProgress.character.xp.toLocaleString()}/{gameProgress.character.xpToNext.toLocaleString()}</span>
                </div>
                <Progress value={(gameProgress.character.xp / gameProgress.character.xpToNext) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-600 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Energy
                  </span>
                  <span className="text-sm">{gameProgress.character.energy}/{gameProgress.character.maxEnergy}</span>
                </div>
                <Progress value={(gameProgress.character.energy / gameProgress.character.maxEnergy) * 100} className="h-2" />
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

              {/* Core Stats */}
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

              {/* Current Title */}
              {gameProgress.character.currentTitle && (
                <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mt-4">
                  <div className="text-sm font-medium text-purple-900">Current Title</div>
                  <div className="text-lg font-bold text-purple-600">{gameProgress.character.currentTitle}</div>
                </div>
              )}

              {/* Pet Companion Status */}
              {gameProgress.character.petCompanion && (
                <div className="bg-green-50 rounded-lg p-3 mt-4">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    {gameProgress.character.petCompanion.name} (Lv.{gameProgress.character.petCompanion.level})
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-green-600">{gameProgress.character.petCompanion.loyalty}</div>
                      <div className="text-green-800">Loyalty</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-orange-600">{gameProgress.character.petCompanion.hunger}</div>
                      <div className="text-orange-800">Hunger</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-pink-600">{gameProgress.character.petCompanion.happiness}</div>
                      <div className="text-pink-800">Happy</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Preview */}
              <div className="bg-gray-50 rounded-lg p-3 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Top Skills</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(gameProgress.character.skills)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 4)
                    .map(([skill, level]) => (
                      <div key={skill} className="flex justify-between">
                        <span className="text-gray-600">{skill}</span>
                        <span className="font-bold text-blue-600">{level}</span>
                      </div>
                    ))}
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
                        inventory: ['Survival Kit', 'Motivation Potion', 'Caffeinated Elixir', 'Wisdom Scroll', 'Aqua Crystal', 'Mobility Rune', 'Social Bond', 'Dream Essence', 'Efficiency Crystal', 'Karma Coin'],
                        skills: {
                          'Coffee Brewing': 45,
                          'Problem Solving': 38,
                          'Time Management': 42,
                          'Self Care': 35,
                          'Social Navigation': 29,
                          'Patience': 41,
                          'Adaptability': 33,
                          'Focus': 37
                        },
                        titles: ['Novice Adventurer', 'Coffee Apprentice', 'Code Debugger', 'Life Balancer', 'Wellness Warrior', 'Productivity Ninja'],
                        currentTitle: 'Productivity Ninja',
                        petCompanion: {
                          id: 'demo-pet',
                          name: 'Byte',
                          species: 'Keyboard Cat',
                          level: 8,
                          xp: 45,
                          abilities: ['Typo Generation', 'Meeting Disruption', 'Infinite Purring'],
                          loyalty: 85,
                          hunger: 70,
                          happiness: 90,
                          lastFed: new Date()
                        },
                        guildMembership: 'coffee_connoisseurs'
                      },
                      completedQuests: ['epic-0', 'epic-1', 'epic-2'],
                      dailyStreak: 37,
                      totalQuestsCompleted: 124,
                      achievementsUnlocked: ['First Steps', 'Daily Warrior', 'Coffee Master', 'Social Butterfly', 'Level Crusher', 'Gold Hoarder'],
                      unlockedZones: ['Downtown Cafe District', 'Corporate Office Towers', 'Silicon Valley Wastelands'],
                      chapterUnlocked: 3,
                      storyProgress: 45,
                      relationships: {
                        'barista_sage': 75,
                        'debug_oracle': 45,
                        'pet_whisperer': 60,
                        'plant_sensei': 30
                      }
                    };
                    setGameProgress(demoProgress);
                    toast({
                      title: "Hero Mode Activated!",
                      description: "Welcome back, legendary coffee shop warrior! Your epic journey continues..."
                    });
                  }}
                  className="text-xs"
                >
                  Hero Mode (Test)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quests Tab */}
      {activeTab === 'quests' && (
        <div className="space-y-6">
          {/* Quest Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium">Filter:</span>
                <Button
                  size="sm"
                  variant={questFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setQuestFilter('all')}
                >
                  All Quests
                </Button>
                <Button
                  size="sm"
                  variant={questFilter === 'daily' ? 'default' : 'outline'}
                  onClick={() => setQuestFilter('daily')}
                >
                  Daily Only
                </Button>
                <Button
                  size="sm"
                  variant={questFilter === 'epic' ? 'default' : 'outline'}
                  onClick={() => setQuestFilter('epic')}
                >
                  Epic Only
                </Button>
                <Button
                  size="sm"
                  variant={showCompletedQuests ? 'default' : 'outline'}
                  onClick={() => setShowCompletedQuests(!showCompletedQuests)}
                  className="ml-auto"
                >
                  {showCompletedQuests ? 'Hide' : 'Show'} Completed
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active World Events */}
          {gameProgress.worldEvents.filter(event => event.active).length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-5 h-5" />
                  Active World Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gameProgress.worldEvents.filter(event => event.active).map(event => (
                  <div key={event.id} className="border rounded-lg p-4 bg-white">
                    <h4 className="font-bold text-orange-900">{event.title}</h4>
                    <p className="text-sm text-orange-700 mb-3">{event.description}</p>
                    <div className="flex gap-2">
                      {event.choices?.map(choice => (
                        <Button
                          key={choice.id}
                          size="sm"
                          onClick={() => {
                            // Handle event choice
                            const updatedEvents = gameProgress.worldEvents.map(e => 
                              e.id === event.id ? { ...e, active: false } : e
                            );
                            setGameProgress(prev => ({
                              ...prev!,
                              worldEvents: updatedEvents
                            }));
                            
                            toast({
                              title: "Event Completed!",
                              description: choice.text,
                              duration: 3000
                            });
                          }}
                        >
                          {choice.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Daily Adventures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Adventures
                <Badge className="bg-blue-100 text-blue-800">
                  {availableQuests.filter(q => q.dailyTask && (questFilter === 'all' || questFilter === 'daily')).length} Available
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
                {allQuests.filter(q => 
                  q.dailyTask && 
                  (questFilter === 'all' || questFilter === 'daily') &&
                  (showCompletedQuests || !q.completed)
                ).map((quest) => (
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
                {allQuests.filter(q => 
                  !q.dailyTask && 
                  (questFilter === 'all' || questFilter === 'epic') &&
                  (showCompletedQuests || !q.completed)
                ).map((quest) => (
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

      {/* Shop Tab */}
      {activeTab === 'shop' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gem className="w-5 h-5" />
              Mystical Shop
              <Badge className="bg-yellow-100 text-yellow-800">
                {gameProgress.character.gold.toLocaleString()} Gold
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Enhance your character with magical items and permanent upgrades
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SHOP_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    gameProgress.character.gold >= item.price
                      ? 'hover:border-yellow-300'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (gameProgress.character.gold >= item.price) {
                      const newProgress = { ...gameProgress };
                      newProgress.character.gold -= item.price;
                      
                      // Apply item effects
                      if (item.effects.healthRestore) {
                        newProgress.character.health = Math.min(
                          newProgress.character.health + item.effects.healthRestore,
                          newProgress.character.maxHealth
                        );
                      }
                      if (item.effects.vitality) {
                        newProgress.character.vitality += item.effects.vitality;
                      }
                      if (item.effects.luck) {
                        newProgress.character.luck += item.effects.luck;
                      }
                      if (item.effects.wisdom) {
                        newProgress.character.wisdom += item.effects.wisdom;
                      }
                      if (item.effects.maxEnergy) {
                        newProgress.character.maxEnergy += item.effects.maxEnergy;
                        newProgress.character.energy += item.effects.maxEnergy;
                      }
                      
                      // Add to inventory
                      newProgress.character.inventory.push(item.name);
                      
                      setGameProgress(newProgress);
                      
                      toast({
                        title: "Item Purchased!",
                        description: `You bought ${item.name} for ${item.price} gold!`,
                        duration: 3000
                      });
                    }
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded bg-gray-100 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${
                      gameProgress.character.gold >= item.price ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {item.price} Gold
                    </span>
                    {Object.entries(item.effects).map(([key, value]) => (
                      <span key={key} className="text-xs text-green-600">
                        +{value} {key}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* NPCs Tab */}
      {activeTab === 'npcs' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Characters of the Realm
                <Badge className="bg-blue-100 text-blue-800">
                  {NPCS.length} Available
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NPCS.map((npc) => (
                  <div
                    key={npc.id}
                    className="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
                    onClick={() => setSelectedNPC(npc)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {npc.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold">{npc.name}</h3>
                        <p className="text-sm text-gray-600">{npc.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{npc.personality}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600">📍 {npc.location}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        <span>{gameProgress.relationships?.[npc.id] || 0}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {npc.questsAvailable.length} quests available
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Guilds Tab */}
      {activeTab === 'guilds' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Guild Directory
                <Badge className="bg-purple-100 text-purple-800">
                  {GUILDS.length} Guilds
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GUILDS.map((guild) => {
                  const meetsRequirements = gameProgress.character.level >= guild.requirements.level &&
                    (!guild.requirements.skills || Object.entries(guild.requirements.skills).every(
                      ([skill, required]) => (gameProgress.character.skills[skill] || 0) >= required
                    ));
                  
                  return (
                    <div
                      key={guild.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        meetsRequirements ? 'hover:border-purple-300' : 'opacity-60 border-gray-300'
                      }`}
                      onClick={() => meetsRequirements && setSelectedGuild(guild)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white">
                          <Crown className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold">{guild.name}</h3>
                          <p className="text-sm text-gray-600">{guild.memberCount.toLocaleString()} members</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{guild.description}</p>
                      
                      <div className="space-y-2">
                        <div className="text-xs">
                          <span className="font-medium">Requirements:</span>
                          <div className="text-gray-600 ml-2">
                            Level {guild.requirements.level}
                            {guild.requirements.skills && Object.entries(guild.requirements.skills).map(([skill, level]) => (
                              <div key={skill} className={`text-xs ${
                                (gameProgress.character.skills[skill] || 0) >= level ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {skill}: {level} (have: {gameProgress.character.skills[skill] || 0})
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-xs">
                          <span className="font-medium">Benefits:</span>
                          <ul className="text-gray-600 ml-2">
                            {guild.benefits.slice(0, 2).map((benefit, idx) => (
                              <li key={idx}>• {benefit}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {!meetsRequirements && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 rounded p-2">
                          Requirements not met
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pets Tab */}
      {activeTab === 'pets' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Pet Companions
              {gameProgress.character.petCompanion ? (
                <Badge className="bg-green-100 text-green-800">
                  {gameProgress.character.petCompanion.name} Active
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800">
                  No Pet
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gameProgress.character.petCompanion ? (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
                      🐾
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{gameProgress.character.petCompanion.name}</h3>
                      <p className="text-sm text-gray-600">{gameProgress.character.petCompanion.species}</p>
                      <p className="text-xs text-green-600">Level {gameProgress.character.petCompanion.level}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{gameProgress.character.petCompanion.loyalty}</div>
                      <div className="text-xs text-green-800">Loyalty</div>
                      <Progress value={gameProgress.character.petCompanion.loyalty} className="h-1 mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{gameProgress.character.petCompanion.hunger}</div>
                      <div className="text-xs text-orange-800">Hunger</div>
                      <Progress value={gameProgress.character.petCompanion.hunger} className="h-1 mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-pink-600">{gameProgress.character.petCompanion.happiness}</div>
                      <div className="text-xs text-pink-800">Happiness</div>
                      <Progress value={gameProgress.character.petCompanion.happiness} className="h-1 mt-1" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Abilities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {gameProgress.character.petCompanion.abilities.map((ability, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {ability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        const newProgress = { ...gameProgress };
                        newProgress.character.petCompanion!.hunger = Math.min(100, newProgress.character.petCompanion!.hunger + 20);
                        newProgress.character.petCompanion!.happiness = Math.min(100, newProgress.character.petCompanion!.happiness + 10);
                        newProgress.character.petCompanion!.lastFed = new Date();
                        setGameProgress(newProgress);
                        toast({
                          title: "Pet Fed!",
                          description: `${newProgress.character.petCompanion!.name} is happy and well-fed!`,
                          duration: 3000
                        });
                      }}
                    >
                      🍖 Feed Pet
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newProgress = { ...gameProgress };
                        newProgress.character.petCompanion!.happiness = Math.min(100, newProgress.character.petCompanion!.happiness + 15);
                        newProgress.character.petCompanion!.loyalty = Math.min(100, newProgress.character.petCompanion!.loyalty + 5);
                        setGameProgress(newProgress);
                        toast({
                          title: "Play Time!",
                          description: `${newProgress.character.petCompanion!.name} loves playing with you!`,
                          duration: 3000
                        });
                      }}
                    >
                      🎾 Play
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-lg font-bold mb-2">No Pet Companion Yet</h3>
                <p className="text-gray-600 mb-4">Build relationships with NPCs or participate in special events to adopt a loyal companion!</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PET_SPECIES.map((species) => (
                    <div key={species.id} className="border rounded-lg p-4">
                      <h4 className="font-bold mb-2">{species.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{species.description}</p>
                      <div className="space-y-1 text-xs">
                        {species.abilities.map((ability, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {ability}
                          </div>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3"
                        disabled
                      >
                        Requires Special Event
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gem className="w-5 h-5" />
              Inventory & Skills
              <Badge>{gameProgress.character.inventory.length} Items</Badge>
              <Badge variant="outline">{Object.keys(gameProgress.character.skills).length} Skills</Badge>
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

      {/* NPC Detail Modal */}
      {selectedNPC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedNPC.name.charAt(0)}
                </div>
                <div>
                  <div>{selectedNPC.name}</div>
                  <div className="text-sm font-normal text-gray-600">{selectedNPC.role}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-1">Location:</h4>
                <p className="text-sm text-blue-800">{selectedNPC.location}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3">
                <h4 className="font-medium text-purple-900 mb-1">Personality:</h4>
                <p className="text-sm text-purple-800">{selectedNPC.personality}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Random Dialogue:</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm italic">
                    "{selectedNPC.dialogue[Math.floor(Math.random() * selectedNPC.dialogue.length)]}"
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Relationship Level:</h4>
                <div className="flex items-center gap-2">
                  <Progress value={(gameProgress.relationships?.[selectedNPC.id] || 0)} className="flex-1" />
                  <span className="text-sm font-bold">{gameProgress.relationships?.[selectedNPC.id] || 0}/100</span>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-3">
                <h4 className="font-medium text-yellow-900 mb-1">Special Ability:</h4>
                <p className="text-xs text-yellow-800">{selectedNPC.specialAbility}</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    // Interact with NPC
                    const newProgress = { ...gameProgress };
                    if (!newProgress.relationships) newProgress.relationships = {};
                    newProgress.relationships[selectedNPC.id] = Math.min(100, (newProgress.relationships[selectedNPC.id] || 0) + 5);
                    setGameProgress(newProgress);
                    
                    toast({
                      title: "Pleasant Conversation!",
                      description: `Your relationship with ${selectedNPC.name} improved!`,
                      duration: 3000
                    });
                    setSelectedNPC(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Chat (+5 Relationship)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedNPC(null)}
                >
                  Leave
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Guild Detail Modal */}
      {selectedGuild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <div>{selectedGuild.name}</div>
                  <div className="text-sm font-normal text-gray-600">{selectedGuild.memberCount.toLocaleString()} members</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">{selectedGuild.description}</p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Requirements:</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span className={gameProgress.character.level >= selectedGuild.requirements.level ? 'text-green-600' : 'text-red-600'}>
                        {selectedGuild.requirements.level} (you: {gameProgress.character.level})
                      </span>
                    </div>
                    {selectedGuild.requirements.skills && Object.entries(selectedGuild.requirements.skills).map(([skill, required]) => (
                      <div key={skill} className="flex justify-between">
                        <span>{skill}:</span>
                        <span className={(gameProgress.character.skills[skill] || 0) >= required ? 'text-green-600' : 'text-red-600'}>
                          {required} (you: {gameProgress.character.skills[skill] || 0})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Member Benefits:</h4>
                  <ul className="text-sm space-y-1">
                    {selectedGuild.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Weekly Guild Quests:</h4>
                  <ul className="text-sm space-y-1">
                    {selectedGuild.weeklyQuests.map((quest, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-blue-500" />
                        {quest}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    const meetsRequirements = gameProgress.character.level >= selectedGuild.requirements.level &&
                      (!selectedGuild.requirements.skills || Object.entries(selectedGuild.requirements.skills).every(
                        ([skill, required]) => (gameProgress.character.skills[skill] || 0) >= required
                      ));
                    
                    if (meetsRequirements) {
                      const newProgress = { ...gameProgress };
                      newProgress.character.guildMembership = selectedGuild.id;
                      setGameProgress(newProgress);
                      
                      toast({
                        title: "Guild Joined!",
                        description: `Welcome to ${selectedGuild.name}!`,
                        duration: 5000
                      });
                      setSelectedGuild(null);
                    }
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={gameProgress.character.guildMembership === selectedGuild.id ||
                    gameProgress.character.level < selectedGuild.requirements.level ||
                    (selectedGuild.requirements.skills && Object.entries(selectedGuild.requirements.skills).some(
                      ([skill, required]) => (gameProgress.character.skills[skill] || 0) < required
                    ))}
                >
                  {gameProgress.character.guildMembership === selectedGuild.id ? 'Already Member' : 'Join Guild'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedGuild(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
                  disabled={selectedQuest.completed}
                >
                  {selectedQuest.completed ? 'Already Completed' : 'Complete Quest'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedQuest(null)}
                >
                  Cancel
                </Button>
              </div>
              
              {/* Quest Tips */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-1">Pro Tip:</h5>
                <p className="text-sm text-blue-800">
                  {selectedQuest.difficulty === 'easy' && 'Perfect for building daily habits and maintaining consistency.'}
                  {selectedQuest.difficulty === 'medium' && 'Moderate challenge that builds character and unlocks new abilities.'}
                  {selectedQuest.difficulty === 'hard' && 'Significant challenge with major rewards and stat boosts.'}
                  {selectedQuest.difficulty === 'epic' && 'Legendary quest that transforms your character permanently.'}
                  {selectedQuest.difficulty === 'legendary' && 'The ultimate challenge reserved for true heroes.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};