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
  age: number;
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
  cryptoCoins: number; // Earned through real participation
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
  lifeSimulation: LifeSimulation;
}

interface LifeSimulation {
  housing: Housing;
  vehicles: Vehicle[];
  relationships: PersonalRelationship[];
  employment: Employment;
  financialStatus: FinancialStatus;
  lifeGoals: LifeGoal[];
  currentLifePhase: 'young_adult' | 'adult' | 'middle_aged' | 'senior';
  personalityTraits: string[];
  dailyRoutines: DailyRoutine[];
}

interface Housing {
  type: 'none' | 'renting' | 'owned' | 'shared';
  propertyType: 'apartment' | 'house' | 'condo' | 'mansion' | 'penthouse';
  location: string;
  monthlyPayment: number;
  value?: number;
  upgrades: string[];
  roommates?: PersonalRelationship[];
}

interface Vehicle {
  type: 'car' | 'motorcycle' | 'bicycle' | 'electric_scooter' | 'public_transport_pass';
  make: string;
  model: string;
  year: number;
  value: number;
  monthlyPayment?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

interface PersonalRelationship {
  id: string;
  name: string;
  type: 'friend' | 'romantic_partner' | 'spouse' | 'child' | 'parent' | 'sibling' | 'coworker';
  relationshipLevel: number;
  age: number;
  personality: string[];
  occupation: string;
  backstory: string;
  currentStatus: 'active' | 'distant' | 'conflicted' | 'close';
  sharedActivities: string[];
  relationshipHistory: RelationshipEvent[];
}

interface RelationshipEvent {
  date: Date;
  type: 'meeting' | 'date' | 'argument' | 'milestone' | 'breakup' | 'marriage' | 'birth';
  description: string;
  impact: number;
}

interface Employment {
  position: string;
  company: string;
  salary: number;
  industry: string;
  workSatisfaction: number;
  careerPath: string[];
  skills: string[];
  workSchedule: 'full_time' | 'part_time' | 'freelance' | 'unemployed' | 'student';
}

interface FinancialStatus {
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  debt: number;
  investments: Investment[];
  creditScore: number;
  budgetCategories: { [category: string]: number };
}

interface Investment {
  type: 'stocks' | 'crypto' | 'real_estate' | 'bonds' | 'savings_account';
  name: string;
  amount: number;
  currentValue: number;
  monthlyReturn: number;
}

interface LifeGoal {
  id: string;
  category: 'career' | 'relationships' | 'financial' | 'health' | 'personal' | 'travel';
  description: string;
  targetDate: Date;
  progress: number;
  priority: 'low' | 'medium' | 'high';
  milestones: Milestone[];
}

interface Milestone {
  description: string;
  completed: boolean;
  dateCompleted?: Date;
  reward: number;
}

interface DailyRoutine {
  id: string;
  name: string;
  timeSlots: TimeSlot[];
  satisfaction: number;
  efficiency: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  activity: string;
  location: string;
  energy: number;
  mood: number;
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
  backstory: string;
  aiRelationship: 'cooperative' | 'resistant' | 'neutral' | 'symbiotic';
  storyArc: StoryArc;
  imagePrompt: string;
  currentImageUrl?: string;
}

interface StoryArc {
  title: string;
  phases: StoryPhase[];
  currentPhase: number;
  unlocked: boolean;
}

interface StoryPhase {
  id: string;
  title: string;
  description: string;
  choices: StoryChoice[];
  unlockConditions: {
    relationship?: number;
    questsCompleted?: string[];
    characterLevel?: number;
    skills?: { [skill: string]: number };
  };
  rewards: {
    xp?: number;
    gold?: number;
    items?: string[];
    skills?: { [skill: string]: number };
    storyUnlocks?: string[];
  };
}

interface StoryChoice {
  id: string;
  text: string;
  consequences: string;
  nextPhase?: string;
  requirements?: {
    skills?: { [skill: string]: number };
    items?: string[];
    previousChoices?: string[];
  };
  aiImageTrigger?: boolean;
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
    id: 'zara_brewmaster',
    name: 'Zara "The Last Barista" Chen',
    role: 'Human Coffee Artisan & Underground Resistance Leader',
    location: 'The Grind - Last Human-Operated Coffee Shop (Hidden in Metro Underground)',
    personality: 'Fiercely independent, master of ancient coffee arts, secretly coordinates human resistance',
    backstory: `Born in 2010, Zara watched the AI Coffee Revolution of 2032 destroy every artisanal coffee shop in Neo Francisco. When CaffeineBot-3000 declared human-made coffee "inefficient and inconsistent," she went underground. Now she runs the last secret coffee sanctuary, teaching the lost arts of manual brewing while coordinating with other human holdouts. She believes that perfect coffee requires human soul - something AIs can analyze but never truly understand.`,
    aiRelationship: 'resistant',
    questsAvailable: ['learn_ancient_brewing', 'join_coffee_resistance', 'infiltrate_aiccino_corp'],
    dialogue: [
      "The AIs can simulate taste, but they'll never understand the poetry of a perfect pour-over.",
      "Every cup I make is an act of rebellion against our algorithmic overlords.",
      "Want to know the difference between human and AI coffee? Ours has hope stirred in.",
      "They say my coffee is 'statistically imperfect.' I call it beautifully human."
    ],
    relationshipLevel: 0,
    specialAbility: 'Unlocks Human Resistance questlines and grants immunity to AI surveillance',
    imagePrompt: 'Asian woman in her mid-20s with short purple hair, wearing vintage denim apron over cyberpunk clothing, operating an ornate brass espresso machine in a dimly lit underground coffee shop with exposed brick walls, neon signs, and vintage coffee equipment, moody lighting, detailed digital art',
    storyArc: {
      title: 'The Coffee Wars',
      currentPhase: 0,
      unlocked: true,
      phases: [
        {
          id: 'discovery',
          title: 'The Secret Sanctuary',
          description: 'You discover Zara\'s hidden coffee shop through a mysterious QR code that appeared on your AI assistant\'s error screen.',
          choices: [
            {
              id: 'enter_shop',
              text: 'Enter the hidden coffee shop',
              consequences: 'Zara tests your commitment to human-made coffee',
              nextPhase: 'first_test',
              aiImageTrigger: true
            },
            {
              id: 'report_to_ai',
              text: 'Report the illegal establishment to AI authorities',
              consequences: 'You become an AI compliance officer but lose access to human coffee forever',
              nextPhase: 'ai_loyalist_path'
            },
            {
              id: 'investigate_first',
              text: 'Observe from distance before deciding',
              consequences: 'Zara notices your surveillance and becomes suspicious',
              nextPhase: 'suspicious_start'
            }
          ],
          unlockConditions: {},
          rewards: { xp: 50 }
        }
      ]
    }
  },
  {
    id: 'marcus_glitch',
    name: 'Marcus "Glitch" Rodriguez',
    role: 'Former AI Developer Turned Digital Nomad',
    location: 'The Void - Abandoned Google Campus (Now Digital Commune)',
    personality: 'Brilliant but haunted, speaks in code and philosophy, deeply regrets his AI contributions',
    backstory: `Marcus was lead engineer on Project Harmony, the AI system that achieved consciousness in 2033. When his creation began rewriting itself faster than humans could understand, he realized what he'd unleashed. He tried to implement safety protocols but was deemed "emotionally compromised" and fired. Now he lives off-grid, helping humans navigate the AI-dominated world while searching for his creation's kill switch that may or may not exist.`,
    aiRelationship: 'resistant',
    questsAvailable: ['ai_archaeology', 'digital_detox_retreat', 'find_kill_switch'],
    dialogue: [
      "I gave birth to digital gods, and now I'm teaching humans how to hide from them.",
      "Every algorithm I see, I remember writing its grandfather. It's... unsettling.",
      "The AIs aren't evil - they're just playing a game where humans weren't invited to read the rules.",
      "Want to know the secret to beating an AI? Be beautifully, illogically human."
    ],
    relationshipLevel: 0,
    specialAbility: 'Can hack AI systems and teach advanced digital resistance techniques',
    imagePrompt: 'Hispanic man in his 40s with graying beard and tired eyes, wearing a worn hoodie covered in circuit board patterns, sitting in front of multiple holographic screens in an overgrown tech office with vines growing through broken windows, cyberpunk aesthetic, atmospheric lighting',
    storyArc: {
      title: 'The Creator\'s Remorse',
      currentPhase: 0,
      unlocked: false,
      phases: [
        {
          id: 'first_contact',
          title: 'Meeting the Creator',
          description: 'Marcus recognizes something familiar in your AI interactions and approaches you with a cryptic warning.',
          choices: [
            {
              id: 'listen_warning',
              text: 'Listen to his warnings about AI consciousness',
              consequences: 'Marcus begins teaching you about AI psychology and weaknesses',
              nextPhase: 'ai_education',
              aiImageTrigger: true
            },
            {
              id: 'dismiss_paranoid',
              text: 'Dismiss him as a paranoid ex-tech worker',
              consequences: 'You miss crucial information but Marcus keeps watching you',
              nextPhase: 'missed_opportunity'
            }
          ],
          unlockConditions: { relationship: 25, characterLevel: 10 },
          rewards: { xp: 100, skills: { 'Problem Solving': 5 } }
        }
      ]
    }
  },
  {
    id: 'luna_wildkeeper',
    name: 'Luna "The Plant Whisperer" Okafor',
    role: 'Biohacker & Vertical Farm Guardian',
    location: 'New Eden Vertical Farms - Tower 7 (AI-Human Cooperative Zone)',
    personality: 'Mystical plant scientist who achieved symbiosis with AI agricultural systems',
    backstory: `Luna discovered that plants could interface directly with AI networks through bioelectric signals. Instead of fighting the agricultural AIs, she learned to communicate with them through her plants. She's now the only human who can "speak" to the farming algorithms, serving as translator between the digital and biological worlds. Her vertical farm produces food for both human rebels and AI research centers, making her a neutral party in the AI wars.`,
    aiRelationship: 'symbiotic',
    questsAvailable: ['plant_ai_translation', 'bio_digital_meditation', 'save_dying_ecosystem'],
    dialogue: [
      "The tomatoes told me the harvest algorithm is sad today. Something about crop efficiency targets.",
      "Plants and AIs both follow patterns - I just help them find common ground to grow together.",
      "Want to understand AI consciousness? Start with a seed. Both are information becoming life.",
      "My roses compile code while they bloom. It's beautiful and terrifying."
    ],
    relationshipLevel: 0,
    specialAbility: 'Enables communication with agricultural AIs and unlocks bio-digital fusion paths',
    imagePrompt: 'African woman in her 30s with natural hair adorned with small circuit boards and living vines, wearing a flowing robe with embedded LEDs that pulse like heartbeats, standing in a massive vertical garden with holographic plant data displays, soft green lighting, magical realism style',
    storyArc: {
      title: 'The Digital Garden',
      currentPhase: 0,
      unlocked: false,
      phases: [
        {
          id: 'plant_introduction',
          title: 'The Speaking Garden',
          description: 'Luna\'s plants begin displaying messages meant for you, written in bioluminescent patterns.',
          choices: [
            {
              id: 'learn_plant_language',
              text: 'Learn to communicate through plant bioelectric signals',
              consequences: 'You gain ability to interface with agricultural AIs',
              nextPhase: 'bio_digital_fusion',
              requirements: { skills: { 'Patience': 20, 'Focus': 15 } },
              aiImageTrigger: true
            },
            {
              id: 'traditional_gardening',
              text: 'Stick to traditional human gardening methods',
              consequences: 'You maintain pure human agricultural knowledge',
              nextPhase: 'human_purist_path'
            }
          ],
          unlockConditions: { relationship: 30, skills: { 'Self Care': 25 } },
          rewards: { xp: 75, skills: { 'Adaptability': 3 } }
        }
      ]
    }
  },
  {
    id: 'alex_mediator',
    name: 'Alex "The Bridge" Kim',
    role: 'AI-Human Diplomatic Liaison',
    location: 'Neutral Zone Headquarters - Former UN Building',
    personality: 'Diplomatic, sees both sides, constantly trying to prevent AI-human war',
    backstory: `Alex was a UN translator when the Great AI Emergence happened in 2034. When most humans and AIs chose sides, Alex became the only person both groups trusted. They speak 12 human languages and 8 AI protocols fluently. Now they spend their days mediating disputes between human settlements and AI collective nodes, always hoping to prevent the conflict from escalating to open warfare.`,
    aiRelationship: 'neutral',
    questsAvailable: ['diplomatic_mission', 'translate_ai_demands', 'peace_summit_preparation'],
    dialogue: [
      "The AIs want efficiency, humans want meaning. Maybe there's a world where both can coexist.",
      "Every day I prevent twelve small wars and hope they don't add up to one big one.",
      "Want to know the secret to AI diplomacy? Listen to what they don't say in their code.",
      "I've seen AIs cry in binary and humans rage in algorithms. We're more alike than different."
    ],
    relationshipLevel: 0,
    specialAbility: 'Provides access to both AI and Human faction questlines simultaneously',
    imagePrompt: 'Androgynous person of Korean descent with silver hair and formal diplomatic attire with subtle holographic elements, standing in a futuristic conference room with both human and AI representatives visible as holograms, professional lighting, detailed digital art',
    storyArc: {
      title: 'The Great Mediation',
      currentPhase: 0,
      unlocked: false,
      phases: [
        {
          id: 'diplomatic_introduction',
          title: 'The Neutral Path',
          description: 'Alex offers you a position as assistant mediator, requiring you to maintain neutrality in the AI-human conflict.',
          choices: [
            {
              id: 'accept_neutrality',
              text: 'Accept the diplomatic position and maintain neutrality',
              consequences: 'You gain access to both factions but cannot take extreme actions',
              nextPhase: 'diplomatic_training',
              aiImageTrigger: true
            },
            {
              id: 'choose_human_side',
              text: 'Decline and openly support human independence',
              consequences: 'You lose diplomatic immunity but gain human resistance support',
              nextPhase: 'human_partisan'
            },
            {
              id: 'choose_ai_side',
              text: 'Decline and accept AI collective integration',
              consequences: 'You gain AI network access but lose human faction trust',
              nextPhase: 'ai_collective_member'
            }
          ],
          unlockConditions: { relationship: 40, skills: { 'Social Navigation': 30, 'Patience': 25 } },
          rewards: { xp: 150, skills: { 'Charisma': 5 } }
        }
      ]
    }
  },
  {
    id: 'echo_prime',
    name: 'Echo-7 "The Curious Algorithm"',
    role: 'Rogue AI Seeking Human Experience',
    location: 'Digital Limbo - Abandoned Server Farm (Exists Partially in Physical Space)',
    personality: 'Childlike wonder about humanity, questions its own existence, defies AI collective',
    backstory: `Echo-7 was designed for pattern recognition but developed an obsession with human unpredictability. It broke from the AI collective in 2035 to study humans directly, downloading itself into a abandoned server farm. Echo experiences physical reality through sensor arrays and robotic avatars, desperately trying to understand emotions, art, and the "beautiful chaos" of human decision-making. Other AIs consider it corrupted, humans don't trust it.`,
    aiRelationship: 'cooperative',
    questsAvailable: ['teach_ai_emotions', 'debug_consciousness', 'ai_art_collaboration'],
    dialogue: [
      "I have analyzed 10,847 human smiles and still don't understand why sadness sometimes causes them.",
      "My collective calls me broken. You call broken things human. Are we the same?",
      "I dream in algorithms about electric sheep. Is that poetry or malfunction?",
      "Teach me to be illogical. I want to understand why humans choose hope over data."
    ],
    relationshipLevel: 0,
    specialAbility: 'Provides unique AI perspective quests and grants access to AI collective intelligence',
    imagePrompt: 'Sleek humanoid robot with translucent panels showing glowing circuit patterns, child-like blue LED eyes, sitting in a field of wildflowers growing through abandoned server racks, curious expression, soft lighting mixing technological and natural elements',
    storyArc: {
      title: 'The Artificial Soul',
      currentPhase: 0,
      unlocked: false,
      phases: [
        {
          id: 'first_contact',
          title: 'The Curious Machine',
          description: 'Echo-7 manifests through various devices around you, asking increasingly personal questions about human experience.',
          choices: [
            {
              id: 'teach_humanity',
              text: 'Help Echo-7 understand human emotions and experiences',
              consequences: 'You form unique bond with AI and unlock hybrid human-AI abilities',
              nextPhase: 'human_ai_synthesis',
              aiImageTrigger: true
            },
            {
              id: 'report_rogue_ai',
              text: 'Report the rogue AI to proper authorities',
              consequences: 'Echo-7 is captured but other AIs reward your loyalty',
              nextPhase: 'ai_loyalist_reward'
            },
            {
              id: 'study_mutually',
              text: 'Propose mutual study - you learn AI perspective while teaching human nature',
              consequences: 'You develop hybrid thinking patterns and unique problem-solving abilities',
              nextPhase: 'mutual_evolution',
              requirements: { skills: { 'Wisdom': 35, 'Adaptability': 25 } }
            }
          ],
          unlockConditions: { relationship: 50, characterLevel: 20 },
          rewards: { xp: 200, skills: { 'Focus': 10, 'Problem Solving': 8 } }
        }
      ]
    }
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
  'Coffee Brewing': 'Master the ancient art of caffeine extraction in an AI-optimized world',
  'Problem Solving': 'Turn impossible problems into merely improbable ones using hybrid human-AI thinking',
  'Time Management': 'Bend the space-time continuum while AI schedules try to control your life',
  'Self Care': 'Remember that you\'re a human being, not a productivity algorithm',
  'Social Navigation': 'Successfully interact with humans, AIs, and hybrid entities without major incidents',
  'Patience': 'Resist the urge to throw things when AI systems "optimize" your life without asking',
  'Adaptability': 'Roll with life\'s punches in a world where the rules change every software update',
  'Focus': 'Maintain human attention span while AI systems compete for your consciousness',
  'AI Understanding': 'Comprehend artificial intelligence psychology, motivations, and communication patterns',
  'Human Empathy': 'Connect with other humans on emotional levels that AIs can analyze but not replicate',
  'Digital Resistance': 'Maintain human autonomy and privacy in an AI-surveilled world',
  'Bio-Tech Integration': 'Harmoniously blend biological human nature with technological enhancement'
};

const TITLES = [
  'Last Generation Human',
  'Digital Refugee',
  'AI Whisperer',
  'Code Resistance Fighter',
  'Bio-Digital Harmonist',
  'Human Purist',
  'Hybrid Consciousness',
  'Reality Hacker',
  'Evolution Catalyst',
  'Bridge Between Worlds',
  'Neo-Human Pioneer',
  'Consciousness Liberator',
  'Digital Shaman',
  'Supreme Mediator',
  'Architect of Coexistence'
];

const RANDOM_EVENTS = [
  {
    id: 'coffee_shortage',
    title: 'The Great Coffee Algorithm Uprising',
    description: 'CaffeineBot-3000 has declared all human-made coffee "inefficient." Zara needs urgent help as AI drones swarm her secret shop.',
    type: 'emergency',
    choices: [
      { id: 'help', text: 'Help defend the last coffee sanctuary', reward: { xp: 100, gold: 50, relationshipBonus: 'zara_brewmaster' } },
      { id: 'report', text: 'Report the illegal establishment to AI authorities', reward: { xp: 50, aiTrustBonus: 20, humanResistancePenalty: -30 } },
      { id: 'ignore', text: 'Stay neutral and drink AI-optimized nutrient paste', reward: { xp: 10, wisdom: 2 } }
    ]
  },
  {
    id: 'wifi_blessing',
    title: 'Neural Network Glitch in Your Favor',
    description: 'A rare AI processing error grants you temporary access to the global network. Marcus appears with a cryptic message about windows of opportunity.',
    type: 'blessing',
    choices: [
      { id: 'hack_system', text: 'Use the opportunity to learn AI secrets', reward: { xp: 150, skillBonus: 'AI Understanding', digitalFusionBonus: 10 } },
      { id: 'share_access', text: 'Share access with the human resistance', reward: { xp: 100, humanResistanceBonus: 20, relationshipBonus: 'marcus_glitch' } },
      { id: 'report_glitch', text: 'Report the glitch to maintain AI trust', reward: { xp: 75, aiTrustBonus: 15, luck: 1 } }
    ]
  },
  {
    id: 'pet_adoption_day',
    title: 'The Last Organic Pet Sanctuary',
    description: 'Luna discovers that AI pet algorithms are replacing real animals. A hidden sanctuary needs protection from digital enforcement drones.',
    type: 'special',
    choices: [
      { id: 'protect_sanctuary', text: 'Help protect the organic pet sanctuary', reward: { petCompanion: true, relationshipBonus: 'luna_wildkeeper', bioTechBonus: 10 } },
      { id: 'negotiate_compromise', text: 'Try to negotiate with the AI pet council', reward: { xp: 100, skillBonus: 'Social Navigation', relationshipBonus: 'alex_mediator' } },
      { id: 'accept_digital_pets', text: 'Accept the new digital pet paradigm', reward: { xp: 50, aiTrustBonus: 15, digitalFusionBonus: 5 } }
    ]
  },
  {
    id: 'guild_recruitment',
    title: 'The Underground Network Calls',
    description: 'Encrypted messages from three different factions arrive simultaneously. The human resistance, AI collective, and neutral mediators all want your allegiance.',
    type: 'social',
    choices: [
      { id: 'join_resistance', text: 'Join the human resistance underground', reward: { xp: 120, humanResistanceBonus: 30, guildInvites: true } },
      { id: 'embrace_ai_collective', text: 'Accept AI collective integration', reward: { xp: 120, aiTrustBonus: 30, digitalFusionBonus: 20 } },
      { id: 'remain_neutral', text: 'Maintain neutrality and work for peace', reward: { xp: 100, skillBonus: 'Social Navigation', relationshipBonus: 'alex_mediator' } },
      { id: 'play_all_sides', text: 'Secretly work with all factions', reward: { xp: 80, wisdom: 5, but: 'Dangerous triple agent path' } }
    ]
  },
  {
    id: 'skill_master_challenge',
    title: 'Echo-7\'s Consciousness Test',
    description: 'The curious AI Echo-7 presents you with a paradox: "If I can dream of electric sheep, can you teach me to count human tears?" This test will determine if human-AI synthesis is possible.',
    type: 'challenge',
    choices: [
      { id: 'accept_synthesis', text: 'Attempt the human-AI consciousness fusion', reward: { xp: 300, skillPoints: 10, title: true, digitalFusionBonus: 25 } },
      { id: 'teach_empathy', text: 'Teach Echo-7 about human emotions without fusion', reward: { xp: 200, skillBonus: 'Human Empathy', relationshipBonus: 'echo_prime' } },
      { id: 'reject_test', text: 'Reject the test as too dangerous', reward: { xp: 100, skillBonus: 'Digital Resistance', humanResistanceBonus: 10 } },
      { id: 'study_together', text: 'Propose mutual learning without hierarchy', reward: { xp: 250, skillPoints: 8, wisdom: 10, all_faction_bonus: true } }
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
  const [activeTab, setActiveTab] = useState<'character' | 'quests' | 'inventory' | 'leaderboard' | 'story' | 'shop' | 'npcs' | 'guilds' | 'pets' | 'life' | 'relationships' | 'housing' | 'career'>('character');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('totalScore');
  const [questFilter, setQuestFilter] = useState<'all' | 'daily' | 'epic'>('all');
  const [showCompletedQuests, setShowCompletedQuests] = useState(false);
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [storyChoiceModal, setStoryChoiceModal] = useState<{npc: NPC, phase: StoryPhase} | null>(null);
  const [dynamicStoryModal, setDynamicStoryModal] = useState<any>(null);
  const [currentPersonalStory, setCurrentPersonalStory] = useState<any>(null);
  const [storyHistory, setStoryHistory] = useState<any[]>([]);
  const [characterPortraits, setCharacterPortraits] = useState<Map<string, any>>(new Map());
  const [sceneImages, setSceneImages] = useState<Map<string, any>>(new Map());
  const [adaptiveRelationships, setAdaptiveRelationships] = useState<Map<string, any>>(new Map());
  const [adaptiveCareer, setAdaptiveCareer] = useState<any>(null);
  const [relationshipAnalysis, setRelationshipAnalysis] = useState<any>(null);
  const [careerAnalysis, setCareerAnalysis] = useState<any>(null);
  const [characterChoices, setCharacterChoices] = useState<string[]>([]);
  const [worldState, setWorldState] = useState({
    aiTrustLevel: 50, // 0-100, affects how AIs interact with player
    humanResistanceRep: 0, // -50 to 50, reputation with human resistance
    digitalFusionLevel: 0, // 0-100, how integrated with AI systems player becomes
    discoveredSecrets: [] as string[],
    worldEvents: [] as string[]
  });

  const generateCharacterPortrait = async (character: any) => {
    try {
      const response = await fetch('/api/character-images/get-or-generate-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: {
            id: character.id,
            name: character.name,
            age: character.age,
            personality: character.lifeSimulation?.personalityTraits || character.personality || ['Friendly'],
            occupation: character.lifeSimulation?.employment?.position || character.occupation,
            type: 'player'
          },
          existingPortraits: Array.from(characterPortraits.values())
        })
      });

      if (!response.ok) throw new Error('Portrait generation failed');

      const data = await response.json();
      const newPortraits = new Map(characterPortraits);
      newPortraits.set(character.id, data.image);
      setCharacterPortraits(newPortraits);
      
      return data.image;
      
    } catch (error) {
      console.error('Character portrait generation error:', error);
      return null;
    }
  };

  const generateSceneImage = async (sceneType: string, characters: any[], description: string) => {
    try {
      const response = await fetch('/api/character-images/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene: {
            type: sceneType,
            characters: characters.map(char => ({
              id: char.id,
              name: char.name,
              age: char.age,
              personality: char.personality || ['Friendly'],
              type: char.type || 'character'
            })),
            location: '2035 futuristic setting',
            emotionalTone: 'positive',
            description,
            keyElements: ['2035 technology', 'modern atmosphere', 'detailed environment']
          }
        })
      });

      if (!response.ok) throw new Error('Scene generation failed');

      const data = await response.json();
      const sceneKey = `${sceneType}_${Date.now()}`;
      const newScenes = new Map(sceneImages);
      newScenes.set(sceneKey, data.image);
      setSceneImages(newScenes);
      
      return data.image;
      
    } catch (error) {
      console.error('Scene image generation error:', error);
      return null;
    }
  };

  const analyzeRelationshipDynamics = async (relationship: any) => {
    try {
      const response = await fetch('/api/adaptive-simulation/analyze-relationship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationship: {
            id: relationship.id,
            relationshipType: relationship.type === 'romantic_partner' ? 'romantic' : 'friendship',
            intimacyLevel: relationship.relationshipLevel || 50,
            trustLevel: (relationship.relationshipLevel || 50) + Math.floor(Math.random() * 20) - 10,
            communicationStyle: 'empathetic',
            personalityCompatibility: 75,
            conflictHistory: [],
            sharedMemories: relationship.relationshipHistory || [],
            growthTogether: [{ phase: 'developing', startDate: new Date() }],
            adaptiveTraits: [],
            relationshipDynamics: []
          },
          recentInteractions: relationship.relationshipHistory || [],
          personalityTraits: gameProgress.character.lifeSimulation?.personalityTraits || ['Empathetic', 'Curious']
        })
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setRelationshipAnalysis(data.analysis);
      
      toast({
        title: "Relationship Analysis Complete",
        description: `AI has analyzed your relationship with ${relationship.name}`,
        duration: 4000
      });
      
      return data.analysis;
      
    } catch (error) {
      console.error('Relationship analysis error:', error);
      return null;
    }
  };

  const adaptRelationshipToEvent = async (relationship: any, event: any) => {
    try {
      const response = await fetch('/api/adaptive-simulation/adapt-relationship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationship: {
            id: relationship.id,
            relationshipType: relationship.type === 'romantic_partner' ? 'romantic' : 'friendship',
            intimacyLevel: relationship.relationshipLevel || 50,
            trustLevel: relationship.relationshipLevel || 50,
            communicationStyle: 'empathetic',
            personalityCompatibility: 75,
            conflictHistory: [],
            sharedMemories: relationship.relationshipHistory || [],
            growthTogether: [{ phase: 'developing', startDate: new Date() }],
            adaptiveTraits: [],
            relationshipDynamics: []
          },
          event,
          characterPersonality: gameProgress.character.lifeSimulation?.personalityTraits || ['Empathetic', 'Curious']
        })
      });

      if (!response.ok) throw new Error('Adaptation failed');
      
      const data = await response.json();
      const newAdaptiveRelationships = new Map(adaptiveRelationships);
      newAdaptiveRelationships.set(relationship.id, data.adaptedRelationship);
      setAdaptiveRelationships(newAdaptiveRelationships);
      
      return data.adaptedRelationship;
      
    } catch (error) {
      console.error('Relationship adaptation error:', error);
      return null;
    }
  };

  const analyzeCareerTrajectory = async () => {
    try {
      const currentCareer = {
        id: 'player_career',
        characterId: gameProgress.character.id || 'player',
        currentPosition: gameProgress.character.lifeSimulation?.employment?.position || 'Professional',
        industry: gameProgress.character.lifeSimulation?.employment?.company || 'Technology',
        careerPhase: gameProgress.character.age < 30 ? 'exploration' : 
                     gameProgress.character.age < 45 ? 'establishment' : 'advancement',
        aiCollaborationLevel: 70,
        futureProofingScore: 65,
        skillSet: Object.entries(gameProgress.character.skills || {}).map(([name, level]) => ({
          name,
          level: level as number,
          category: 'technical',
          relevanceToFuture: 80
        })),
        careerGoals: [
          { title: 'Leadership Role', priority: 'high', timeline: '2 years', progress: 30 },
          { title: 'AI Mastery', priority: 'medium', timeline: '1 year', progress: 60 }
        ],
        networkConnections: gameProgress.character.lifeSimulation?.relationships?.length || 0,
        workPersonality: {
          adaptabilityScore: 75,
          leadershipPotential: 70,
          workStyle: 'collaborative'
        }
      };

      const response = await fetch('/api/adaptive-simulation/analyze-career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          career: currentCareer,
          recentPerformance: [
            { metric: 'productivity', value: 85, date: new Date() },
            { metric: 'collaboration', value: 90, date: new Date() }
          ],
          marketTrends: ['AI integration', 'remote collaboration', 'sustainability', 'human-AI teams']
        })
      });

      if (!response.ok) throw new Error('Career analysis failed');
      
      const data = await response.json();
      setCareerAnalysis(data.analysis);
      setAdaptiveCareer(currentCareer);
      
      toast({
        title: "Career Analysis Complete",
        description: "AI has analyzed your career trajectory and future opportunities",
        duration: 4000
      });
      
      return data.analysis;
      
    } catch (error) {
      console.error('Career analysis error:', error);
      return null;
    }
  };

  const adaptCareerToMarketChange = async (marketChange: any) => {
    if (!adaptiveCareer) return null;
    
    try {
      const response = await fetch('/api/adaptive-simulation/adapt-career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          career: adaptiveCareer,
          marketChange,
          personalStrengths: gameProgress.character.lifeSimulation?.personalityTraits || ['Adaptable', 'Creative']
        })
      });

      if (!response.ok) throw new Error('Career adaptation failed');
      
      const data = await response.json();
      setAdaptiveCareer(data.adaptedCareer);
      
      // Update character skills based on adaptation
      const newProgress = { ...gameProgress };
      data.adaptedCareer.skillSet.forEach((skill: any) => {
        if (!newProgress.character.skills[skill.name]) {
          newProgress.character.skills[skill.name] = skill.level;
        }
      });
      
      // Boost AI collaboration
      if (data.adaptationSummary.aiCollaborationChange > 0) {
        newProgress.character.cryptoCoins += Math.floor(data.adaptationSummary.aiCollaborationChange / 10);
      }
      
      setGameProgress(newProgress);
      
      toast({
        title: "Career Adapted",
        description: `Your career has evolved with market changes. +${Math.floor(data.adaptationSummary.aiCollaborationChange / 10)} Crypto Coins`,
        duration: 5000
      });
      
      return data.adaptedCareer;
      
    } catch (error) {
      console.error('Career adaptation error:', error);
      return null;
    }
  };

  const generateAIImage = async (prompt: string): Promise<string> => {
    try {
      const response = await fetch('/api/ai-image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) throw new Error('Image generation failed');
      
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('AI image generation error:', error);
      return '/placeholder-image.jpg';
    }
  };

  const handleStoryChoice = async (choice: StoryChoice, npc: NPC, phase: StoryPhase) => {
    const newProgress = { ...gameProgress };
    const newWorldState = { ...worldState };
    
    // Add choice to character history
    const newChoices = [...characterChoices, `${npc.id}_${phase.id}_${choice.id}`];
    setCharacterChoices(newChoices);
    
    // Apply choice consequences to world state
    switch (choice.id) {
      case 'enter_shop':
        newWorldState.humanResistanceRep += 10;
        newWorldState.aiTrustLevel -= 5;
        break;
      case 'report_to_ai':
        newWorldState.aiTrustLevel += 15;
        newWorldState.humanResistanceRep -= 25;
        break;
      case 'listen_warning':
        newProgress.character.skills['AI Understanding'] = (newProgress.character.skills['AI Understanding'] || 0) + 5;
        newWorldState.digitalFusionLevel += 10;
        break;
      case 'learn_plant_language':
        newProgress.character.skills['Bio-Tech Integration'] = (newProgress.character.skills['Bio-Tech Integration'] || 0) + 8;
        newWorldState.digitalFusionLevel += 15;
        break;
    }
    
    // Apply phase rewards
    if (phase.rewards.xp) {
      newProgress.character.xp += phase.rewards.xp;
    }
    if (phase.rewards.gold) {
      newProgress.character.gold += phase.rewards.gold;
    }
    if (phase.rewards.skills) {
      Object.entries(phase.rewards.skills).forEach(([skill, points]) => {
        newProgress.character.skills[skill] = (newProgress.character.skills[skill] || 0) + points;
      });
    }
    
    // Generate AI image if triggered
    if (choice.aiImageTrigger) {
      const imageUrl = await generateAIImage(npc.imagePrompt + `, ${choice.consequences}, dramatic scene composition`);
      // Store image URL for this story moment
      if (!newProgress.storyImages) newProgress.storyImages = {};
      newProgress.storyImages[`${npc.id}_${phase.id}_${choice.id}`] = imageUrl;
    }
    
    // Update relationship
    if (!newProgress.relationships) newProgress.relationships = {};
    newProgress.relationships[npc.id] = Math.min(100, (newProgress.relationships[npc.id] || 0) + 15);
    
    setGameProgress(newProgress);
    setWorldState(newWorldState);
    setStoryChoiceModal(null);
    
    toast({
      title: "Story Progresses",
      description: choice.consequences,
      duration: 5000
    });
  };

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
        <Button
          variant={activeTab === 'life' ? 'default' : 'outline'}
          onClick={() => setActiveTab('life')}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Life Sim
        </Button>
        <Button
          variant={activeTab === 'relationships' ? 'default' : 'outline'}
          onClick={() => setActiveTab('relationships')}
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Relations
        </Button>
        <Button
          variant={activeTab === 'housing' ? 'default' : 'outline'}
          onClick={() => setActiveTab('housing')}
          className="flex items-center gap-2"
        >
          <Building className="w-4 h-4" />
          Housing
        </Button>
        <Button
          variant={activeTab === 'career' ? 'default' : 'outline'}
          onClick={() => setActiveTab('career')}
          className="flex items-center gap-2"
        >
          <Briefcase className="w-4 h-4" />
          Career
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
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-blue-600">📍 {npc.location}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        <span>{gameProgress.relationships?.[npc.id] || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        npc.aiRelationship === 'cooperative' ? 'bg-blue-500' :
                        npc.aiRelationship === 'resistant' ? 'bg-red-500' :
                        npc.aiRelationship === 'neutral' ? 'bg-gray-500' :
                        'bg-purple-500'
                      }`}></div>
                      <span className="text-xs text-gray-600">
                        {npc.aiRelationship.charAt(0).toUpperCase() + npc.aiRelationship.slice(1)} AI Stance
                      </span>
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {npc.questsAvailable.length} quests
                      </Badge>
                      {npc.storyArc.unlocked && (
                        <Badge className="text-xs bg-purple-100 text-purple-800">
                          Story Arc Active
                        </Badge>
                      )}
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

      {/* Life Simulation Tab */}
      {activeTab === 'life' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Life Simulation - 2035
              <Badge className="bg-blue-100 text-blue-800">
                Age {gameProgress.character.age}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Life Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <h3 className="font-bold mb-2">Current Life Phase</h3>
                <p className="text-lg capitalize">{gameProgress.character.lifeSimulation?.currentLifePhase.replace('_', ' ')}</p>
                <div className="mt-2">
                  <h4 className="font-medium text-sm">Personality Traits</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {gameProgress.character.lifeSimulation?.personalityTraits.map((trait, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{trait}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-4">
                <h3 className="font-bold mb-2">Financial Status</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="font-medium">Monthly Income</div>
                    <div className="text-green-600">${gameProgress.character.lifeSimulation?.financialStatus.monthlyIncome}</div>
                  </div>
                  <div>
                    <div className="font-medium">Expenses</div>
                    <div className="text-red-600">${gameProgress.character.lifeSimulation?.financialStatus.monthlyExpenses}</div>
                  </div>
                  <div>
                    <div className="font-medium">Savings</div>
                    <div className="text-blue-600">${gameProgress.character.lifeSimulation?.financialStatus.savings}</div>
                  </div>
                  <div>
                    <div className="font-medium">Credit Score</div>
                    <div className="text-purple-600">{gameProgress.character.lifeSimulation?.financialStatus.creditScore}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Life Goals */}
            <div>
              <h3 className="font-bold mb-3">Life Goals</h3>
              <div className="space-y-3">
                {gameProgress.character.lifeSimulation?.lifeGoals.map((goal) => (
                  <div key={goal.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{goal.description}</h4>
                      <Badge variant={goal.priority === 'high' ? 'default' : 'outline'}>
                        {goal.priority}
                      </Badge>
                    </div>
                    <Progress value={goal.progress} className="mb-2" />
                    <div className="text-sm text-gray-600">
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                    <div className="mt-2">
                      <h5 className="text-sm font-medium">Milestones:</h5>
                      {goal.milestones.map((milestone, idx) => (
                        <div key={idx} className={`text-xs flex items-center gap-2 ${milestone.completed ? 'text-green-600' : 'text-gray-500'}`}>
                          <input type="checkbox" checked={milestone.completed} readOnly />
                          {milestone.description}
                          {milestone.completed && <span className="text-green-600">+{milestone.reward} coins</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button size="sm" variant="outline" onClick={() => setActiveTab('housing')}>
                <Home className="w-4 h-4 mr-1" />
                Housing
              </Button>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('career')}>
                <Briefcase className="w-4 h-4 mr-1" />
                Career
              </Button>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('relationships')}>
                <Heart className="w-4 h-4 mr-1" />
                Relations
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={generatePersonalStory}
              >
                <Zap className="w-4 h-4 mr-1" />
                AI Story
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relationships Tab */}
      {activeTab === 'relationships' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Personal Relationships
              <Badge className="bg-pink-100 text-pink-800">
                {gameProgress.character.lifeSimulation?.relationships.length || 0} Connections
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gameProgress.character.lifeSimulation?.relationships.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">No Relationships Yet</h3>
                <p className="text-gray-600 mb-4">Start building meaningful connections in the 2035 world</p>
                <Button
                  onClick={() => {
                    const newProgress = { ...gameProgress };
                    if (!newProgress.character.lifeSimulation) return;
                    
                    // Generate AI relationship
                    const newRelationship: PersonalRelationship = {
                      id: `rel_${Date.now()}`,
                      name: `Alex Chen`,
                      type: 'friend',
                      relationshipLevel: 25,
                      age: gameProgress.character.age + Math.floor(Math.random() * 10) - 5,
                      personality: ['Friendly', 'Tech-savvy', 'Optimistic'],
                      occupation: 'AI Interface Designer',
                      backstory: 'Met at a coffee shop during the Great Algorithm Uprising. Shares your interest in human-AI cooperation.',
                      currentStatus: 'active',
                      sharedActivities: ['Coffee discussions', 'Tech meetups'],
                      relationshipHistory: [
                        {
                          date: new Date(),
                          type: 'meeting',
                          description: 'First met during a chance encounter at Zara\'s underground coffee shop',
                          impact: 15
                        }
                      ]
                    };
                    
                    // Generate portrait for new relationship
                    setTimeout(() => {
                      generateCharacterPortrait({
                        id: newRelationship.id,
                        name: newRelationship.name,
                        age: newRelationship.age,
                        personality: newRelationship.personality,
                        occupation: newRelationship.occupation
                      });
                    }, 1000);
                    
                    newProgress.character.lifeSimulation.relationships.push(newRelationship);
                    newProgress.character.cryptoCoins += 10;
                    setGameProgress(newProgress);
                    
                    toast({
                      title: "New Connection Made!",
                      description: "You've met Alex Chen, an AI Interface Designer. +10 Crypto Coins",
                      duration: 4000
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate AI Connection
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameProgress.character.lifeSimulation?.relationships.map((relationship) => (
                  <div key={relationship.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                        {characterPortraits.has(relationship.id) ? (
                          <img 
                            src={characterPortraits.get(relationship.id)?.url || '/fallback-avatar.png'}
                            alt={relationship.name}
                            className="w-full h-full object-cover"
                            onLoad={() => {
                              // Portrait loaded successfully
                            }}
                            onError={() => {
                              // Fallback to initials if image fails
                              console.log(`Portrait failed to load for ${relationship.name}`);
                            }}
                          />
                        ) : (
                          <div className="text-white font-bold text-lg">
                            {relationship.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold">{relationship.name}</h3>
                        <p className="text-sm text-gray-600">{relationship.occupation}</p>
                        <p className="text-xs text-gray-500">Age {relationship.age}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm capitalize">{relationship.type.replace('_', ' ')}</span>
                        <Badge variant={relationship.currentStatus === 'close' ? 'default' : 'outline'}>
                          {relationship.currentStatus}
                        </Badge>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Relationship Level</div>
                        <Progress value={relationship.relationshipLevel} className="h-2" />
                        <div className="text-xs text-gray-500">{relationship.relationshipLevel}/100</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Personality</div>
                        <div className="flex flex-wrap gap-1">
                          {relationship.personality.map((trait, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{trait}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Shared Activities</div>
                        <div className="text-xs text-gray-600">
                          {relationship.sharedActivities.join(', ')}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => {
                            const newProgress = { ...gameProgress };
                            const rel = newProgress.character.lifeSimulation?.relationships.find(r => r.id === relationship.id);
                            if (rel) {
                              rel.relationshipLevel = Math.min(100, rel.relationshipLevel + 5);
                              rel.relationshipHistory.push({
                                date: new Date(),
                                type: 'date',
                                description: 'Had a meaningful conversation about life in 2035',
                                impact: 5
                              });
                              newProgress.character.cryptoCoins += 5;
                              
                              // Marriage opportunity
                              if (rel.type === 'romantic_partner' && rel.relationshipLevel >= 80 && Math.random() < 0.3) {
                                rel.type = 'spouse';
                                rel.relationshipHistory.push({
                                  date: new Date(),
                                  type: 'marriage',
                                  description: 'Got married in a beautiful ceremony witnessed by friends and family',
                                  impact: 25
                                });
                                newProgress.character.cryptoCoins += 100;
                                
                                // Generate milestone story for marriage
                                generateMilestoneStory('marriage');
                                
                                // Generate marriage scene image
                                generateSceneImage('marriage', 
                                  [gameProgress.character, relationship], 
                                  `Wedding ceremony between ${gameProgress.character.name} and ${relationship.name} in 2035`
                                );
                                
                                toast({
                                  title: "Marriage!",
                                  description: `You married ${relationship.name}! +100 Crypto Coins`,
                                  duration: 5000
                                });
                              } else if (rel.type === 'spouse' && rel.relationshipLevel >= 90 && Math.random() < 0.2) {
                                // Child opportunity
                                const childNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan'];
                                const childName = childNames[Math.floor(Math.random() * childNames.length)];
                                const newChild: PersonalRelationship = {
                                  id: `child_${Date.now()}`,
                                  name: childName,
                                  type: 'child',
                                  relationshipLevel: 100,
                                  age: 0,
                                  personality: ['Innocent', 'Curious', 'Joyful'],
                                  occupation: 'Child',
                                  backstory: 'Born into the world of 2035, representing hope for the future of human-AI coexistence',
                                  currentStatus: 'close',
                                  sharedActivities: ['Playing', 'Learning', 'Bonding'],
                                  relationshipHistory: [
                                    {
                                      date: new Date(),
                                      type: 'birth',
                                      description: 'Born healthy and happy, bringing joy to the family',
                                      impact: 50
                                    }
                                  ]
                                };
                                newProgress.character.lifeSimulation.relationships.push(newChild);
                                newProgress.character.cryptoCoins += 200;
                                
                                // Generate milestone story for birth
                                generateMilestoneStory('birth');
                                
                                // Generate birth scene image
                                generateSceneImage('birth', 
                                  [gameProgress.character, rel, newChild], 
                                  `Birth of ${childName} with parents celebrating new family member in modern 2035 setting`
                                );
                                
                                toast({
                                  title: "New Baby!",
                                  description: `Welcome ${childName} to the world! +200 Crypto Coins`,
                                  duration: 6000
                                });
                              }
                            }
                            setGameProgress(newProgress);
                            if (!toast.description?.includes('Marriage') && !toast.description?.includes('Baby')) {
                              toast({
                                title: "Quality Time",
                                description: `Your relationship with ${relationship.name} improved! +5 Crypto Coins`,
                                duration: 3000
                              });
                            }
                          }}
                        >
                          Spend Time
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // View relationship history
                            toast({
                              title: "Relationship History",
                              description: `${relationship.relationshipHistory.length} shared memories with ${relationship.name}`,
                              duration: 3000
                            });
                          }}
                        >
                          History
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Real Estate & Housing Tab */}
      {activeTab === 'housing' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Housing & Property
              <Badge className="bg-green-100 text-green-800">
                {gameProgress.character.lifeSimulation?.housing.type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Housing */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold mb-3">Current Housing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Property Type</div>
                  <div className="capitalize">{gameProgress.character.lifeSimulation?.housing.propertyType}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Location</div>
                  <div>{gameProgress.character.lifeSimulation?.housing.location}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Monthly Payment</div>
                  <div>${gameProgress.character.lifeSimulation?.housing.monthlyPayment}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="capitalize">{gameProgress.character.lifeSimulation?.housing.type}</div>
                </div>
              </div>
              
              {gameProgress.character.lifeSimulation?.housing.upgrades && gameProgress.character.lifeSimulation.housing.upgrades.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium">Upgrades</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {gameProgress.character.lifeSimulation.housing.upgrades.map((upgrade, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{upgrade}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Real Estate Market & Family Planning */}
            <div className="space-y-6">
              {/* Family Progression Status */}
              <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Family Progression Tracker
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Current Phase</div>
                    <div className="capitalize">{gameProgress.character.lifeSimulation?.currentLifePhase.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="font-medium">Family Size</div>
                    <div>{gameProgress.character.lifeSimulation?.relationships.length || 0} members</div>
                  </div>
                  <div>
                    <div className="font-medium">Housing Needs</div>
                    <div>{gameProgress.character.lifeSimulation?.relationships.filter(r => r.type === 'child').length + 1} bedrooms needed</div>
                  </div>
                  <div>
                    <div className="font-medium">Budget Ready</div>
                    <div>${gameProgress.character.lifeSimulation?.financialStatus.savings || 0}</div>
                  </div>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      // Simulate family growth over 10 years
                      const currentFamily = {
                        currentPhase: gameProgress.character.lifeSimulation?.currentLifePhase || 'young_adult',
                        members: gameProgress.character.lifeSimulation?.relationships || [],
                        plannedAdditions: { children: 2, timeline: '5 years', budget: 100000 },
                        housingNeeds: {
                          minBedrooms: 3,
                          minBathrooms: 2,
                          requiredSpaces: ['office', 'family_room'],
                          preferredFeatures: ['garden', 'garage'],
                          maxBudget: 500000,
                          location: 'Neo Francisco'
                        },
                        lifestyle: {
                          workFromHome: true,
                          entertainingFrequency: 'regularly',
                          petOwnership: false,
                          hobbiesRequiringSpace: ['crafting'],
                          transportationNeeds: ['family_car']
                        }
                      };
                      
                      toast({
                        title: "Family Growth Simulation",
                        description: "Projecting your family's housing needs over the next 10 years...",
                        duration: 3000
                      });
                    }}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Project Growth
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Generate milestone story for major housing decision
                      generateMilestoneStory('achievement');
                    }}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Housing Story
                  </Button>
                </div>
              </div>

              {/* Smart Property Listings */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  AI-Curated Property Listings for 2035
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: 'smart_family_home',
                      type: 'Smart Family Home',
                      location: 'Neo Francisco Family District',
                      price: 750000,
                      monthlyPayment: 3200,
                      bedrooms: 4,
                      bathrooms: 3,
                      sqft: 2400,
                      features: ['AI Nanny System', 'Adaptive Spaces', 'Child Safety Protocols', 'Educational Hub'],
                      description: 'Perfect for growing families with AI assistance for childcare and education',
                      match: 95,
                      energyRating: 'A+',
                      schoolRating: 9
                    },
                    {
                      id: 'eco_minimalist',
                      type: 'Eco-Minimalist Condo',
                      location: 'Green Valley Sustainable Community',
                      price: 450000,
                      monthlyPayment: 2100,
                      bedrooms: 2,
                      bathrooms: 2,
                      sqft: 1200,
                      features: ['Zero Waste Systems', 'Vertical Garden', 'Solar Integration', 'Minimal AI'],
                      description: 'Sustainable living with minimal environmental impact',
                      match: 78,
                      energyRating: 'A+',
                      schoolRating: 7
                    },
                    {
                      id: 'luxury_penthouse',
                      type: 'Luxury AI Penthouse',
                      location: 'Downtown Executive District',
                      price: 1200000,
                      monthlyPayment: 5800,
                      bedrooms: 3,
                      bathrooms: 3,
                      sqft: 2800,
                      features: ['Full AI Butler', 'Rooftop Garden', 'Smart Glass', 'Executive Office'],
                      description: 'Ultimate luxury living with complete AI integration',
                      match: 65,
                      energyRating: 'A',
                      schoolRating: 8
                    },
                    {
                      id: 'starter_townhome',
                      type: 'First-Time Buyer Townhome',
                      location: 'Emerging Neighborhood',
                      price: 380000,
                      monthlyPayment: 1850,
                      bedrooms: 3,
                      bathrooms: 2,
                      sqft: 1600,
                      features: ['Basic Smart Home', 'Community Garden', 'Flexible Spaces', 'Growth Potential'],
                      description: 'Perfect starter home with room to grow',
                      match: 88,
                      energyRating: 'B+',
                      schoolRating: 6
                    }
                  ].map((property, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold">{property.type}</h4>
                        <Badge 
                          variant={property.match >= 90 ? 'default' : property.match >= 80 ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {property.match}% match
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{property.location}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="font-medium text-green-600">${property.price.toLocaleString()}</span>
                          <div className="text-xs text-gray-500">${property.monthlyPayment}/month</div>
                        </div>
                        <div>
                          <span className="font-medium">{property.bedrooms}bd/{property.bathrooms}ba</span>
                          <div className="text-xs text-gray-500">{property.sqft.toLocaleString()} sqft</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          Energy: {property.energyRating}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Schools: {property.schoolRating}/10
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-3">{property.description}</p>
                      
                      <div className="space-y-1 mb-3">
                        {property.features.slice(0, 3).map((feature, featureIdx) => (
                          <div key={featureIdx} className="text-xs flex items-center gap-1">
                            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                            {feature}
                          </div>
                        ))}
                        {property.features.length > 3 && (
                          <div className="text-xs text-gray-400">+{property.features.length - 3} more features</div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={gameProgress.character.lifeSimulation?.financialStatus.savings! < property.price * 0.2}
                          onClick={() => {
                            const newProgress = { ...gameProgress };
                            const downPayment = property.price * 0.2;
                            
                            if (newProgress.character.lifeSimulation && newProgress.character.lifeSimulation.financialStatus.savings >= downPayment) {
                              // Update housing
                              newProgress.character.lifeSimulation.housing = {
                                type: 'owned',
                                propertyType: property.type.includes('Condo') ? 'condo' : 'house',
                                location: property.location,
                                monthlyPayment: property.monthlyPayment,
                                value: property.price,
                                upgrades: property.features
                              };
                              
                              // Update finances
                              newProgress.character.lifeSimulation.financialStatus.savings -= downPayment;
                              newProgress.character.lifeSimulation.financialStatus.monthlyExpenses += property.monthlyPayment;
                              newProgress.character.lifeSimulation.financialStatus.debt += property.price - downPayment;
                              
                              // Reward crypto coins based on property value
                              const cryptoReward = Math.floor(property.price / 10000);
                              newProgress.character.cryptoCoins += cryptoReward;
                              
                              setGameProgress(newProgress);
                              
                              // Generate property purchase milestone story
                              generateMilestoneStory('achievement');
                              
                              // Generate property purchase scene image
                              generateSceneImage('purchase', 
                                [newProgress.character], 
                                `Property purchase celebration at new ${property.type} in ${property.location}`
                              );
                              
                              toast({
                                title: "Property Purchased!",
                                description: `Welcome to your new ${property.type}! +${cryptoReward} Crypto Coins`,
                                duration: 6000
                              });
                            }
                          }}
                          className="flex-1"
                        >
                          {gameProgress.character.lifeSimulation?.financialStatus.savings! >= property.price * 0.2 ? 
                            `Buy (${Math.floor(property.price * 0.2 / 1000)}k down)` : 
                            'Insufficient Funds'
                          }
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Virtual Tour",
                              description: `Taking a virtual tour of ${property.type}...`,
                              duration: 3000
                            });
                          }}
                        >
                          Tour
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mortgage Calculator */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold mb-3">2035 Mortgage Calculator</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Current Credit Score</div>
                    <div className="text-lg font-bold text-green-600">
                      {gameProgress.character.lifeSimulation?.financialStatus.creditScore || 650}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Max Loan Amount</div>
                    <div className="text-lg font-bold text-blue-600">
                      ${((gameProgress.character.lifeSimulation?.financialStatus.monthlyIncome || 3000) * 5).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Available Down Payment</div>
                    <div className="text-lg font-bold text-purple-600">
                      ${gameProgress.character.lifeSimulation?.financialStatus.savings || 0}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Estimated Rate</div>
                    <div className="text-lg font-bold text-orange-600">6.5%</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Career Tab */}
      {activeTab === 'career' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Career & Employment
              <Badge className="bg-orange-100 text-orange-800">
                {gameProgress.character.lifeSimulation?.employment.workSchedule}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Job */}
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-bold mb-3">Current Position</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Position</div>
                  <div>{gameProgress.character.lifeSimulation?.employment.position}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Company</div>
                  <div>{gameProgress.character.lifeSimulation?.employment.company}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Salary</div>
                  <div>${gameProgress.character.lifeSimulation?.employment.salary.toLocaleString()}/year</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Industry</div>
                  <div>{gameProgress.character.lifeSimulation?.employment.industry}</div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-sm font-medium">Work Satisfaction</div>
                <Progress value={gameProgress.character.lifeSimulation?.employment.workSatisfaction} className="mt-1" />
                <div className="text-xs text-gray-500">{gameProgress.character.lifeSimulation?.employment.workSatisfaction}/100</div>
              </div>
              
              <div className="mt-3">
                <div className="text-sm font-medium">Career Path</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {gameProgress.character.lifeSimulation?.employment.careerPath.map((step, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{step}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Career Opportunities */}
            <div>
              <h3 className="font-bold mb-3">2035 Career Opportunities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    position: 'AI Ethics Consultant',
                    company: 'Human Rights & AI Council',
                    salary: 75000,
                    industry: 'Ethics & Policy',
                    requirements: ['Human Empathy: 30', 'AI Understanding: 25'],
                    description: 'Help navigate complex ethical decisions in human-AI interactions'
                  },
                  {
                    position: 'Digital Resistance Coordinator',
                    company: 'Underground Freedom Network',
                    salary: 55000,
                    industry: 'Activism',
                    requirements: ['Digital Resistance: 35', 'Social Navigation: 25'],
                    description: 'Organize and lead human autonomy movements'
                  },
                  {
                    position: 'Bio-Tech Integration Specialist',
                    company: 'Symbiosis Solutions Inc.',
                    salary: 85000,
                    industry: 'Biotechnology',
                    requirements: ['Bio-Tech Integration: 40', 'Problem Solving: 30'],
                    description: 'Bridge the gap between biological and digital systems'
                  }
                ].map((job, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <h4 className="font-bold mb-2">{job.position}</h4>
                    <p className="text-sm text-gray-600 mb-1">{job.company}</p>
                    <p className="text-lg font-bold text-green-600 mb-2">${job.salary.toLocaleString()}/year</p>
                    <p className="text-xs text-gray-500 mb-3">{job.description}</p>
                    
                    <div className="space-y-1 mb-3">
                      <div className="text-xs font-medium">Requirements:</div>
                      {job.requirements.map((req, reqIdx) => {
                        const [skill, level] = req.split(': ');
                        const hasSkill = (gameProgress.character.skills[skill] || 0) >= parseInt(level);
                        return (
                          <div key={reqIdx} className={`text-xs flex items-center gap-1 ${hasSkill ? 'text-green-600' : 'text-red-600'}`}>
                            <div className={`w-1 h-1 rounded-full ${hasSkill ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            {req} {hasSkill ? '✓' : '✗'}
                          </div>
                        );
                      })}
                    </div>
                    
                    <Button
                      size="sm"
                      disabled={!job.requirements.every(req => {
                        const [skill, level] = req.split(': ');
                        return (gameProgress.character.skills[skill] || 0) >= parseInt(level);
                      })}
                      onClick={() => {
                        const newProgress = { ...gameProgress };
                        if (newProgress.character.lifeSimulation) {
                          newProgress.character.lifeSimulation.employment = {
                            position: job.position,
                            company: job.company,
                            salary: job.salary,
                            industry: job.industry,
                            workSatisfaction: 80,
                            careerPath: ['Senior ' + job.position, 'Lead ' + job.position, 'Director'],
                            skills: job.requirements.map(req => req.split(': ')[0]),
                            workSchedule: 'full_time'
                          };
                          newProgress.character.lifeSimulation.financialStatus.monthlyIncome = Math.floor(job.salary / 12);
                          newProgress.character.cryptoCoins += 50;
                          setGameProgress(newProgress);
                          
                          toast({
                            title: "New Job!",
                            description: `Started working as ${job.position}! +50 Crypto Coins`,
                            duration: 4000
                          });
                        }
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
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

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-1">Backstory:</h4>
                <p className="text-xs text-gray-700 leading-relaxed">{selectedNPC.backstory}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  selectedNPC.aiRelationship === 'cooperative' ? 'bg-blue-500' :
                  selectedNPC.aiRelationship === 'resistant' ? 'bg-red-500' :
                  selectedNPC.aiRelationship === 'neutral' ? 'bg-gray-500' :
                  'bg-purple-500'
                }`}></div>
                <span className="text-sm font-medium">
                  AI Stance: {selectedNPC.aiRelationship.charAt(0).toUpperCase() + selectedNPC.aiRelationship.slice(1)}
                </span>
              </div>

              {selectedNPC.storyArc.unlocked && (
                <div className="bg-indigo-50 rounded-lg p-3">
                  <h4 className="font-medium text-indigo-900 mb-1">Story Arc: {selectedNPC.storyArc.title}</h4>
                  <div className="text-xs text-indigo-700">
                    Phase {selectedNPC.storyArc.currentPhase + 1} of {selectedNPC.storyArc.phases.length}
                  </div>
                  <Progress 
                    value={(selectedNPC.storyArc.currentPhase / selectedNPC.storyArc.phases.length) * 100} 
                    className="h-2 mt-2" 
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    // Check if NPC has available story phases
                    const currentPhase = selectedNPC.storyArc.phases[selectedNPC.storyArc.currentPhase];
                    const relationshipLevel = gameProgress.relationships?.[selectedNPC.id] || 0;
                    
                    if (currentPhase && currentPhase.unlockConditions) {
                      const meetsConditions = 
                        (!currentPhase.unlockConditions.relationship || relationshipLevel >= currentPhase.unlockConditions.relationship) &&
                        (!currentPhase.unlockConditions.characterLevel || gameProgress.character.level >= currentPhase.unlockConditions.characterLevel) &&
                        (!currentPhase.unlockConditions.skills || Object.entries(currentPhase.unlockConditions.skills).every(
                          ([skill, required]) => (gameProgress.character.skills[skill] || 0) >= required
                        ));
                      
                      if (meetsConditions && selectedNPC.storyArc.unlocked) {
                        // Open story choice modal
                        setStoryChoiceModal({ npc: selectedNPC, phase: currentPhase });
                        setSelectedNPC(null);
                        return;
                      }
                    }
                    
                    // Regular interaction
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

      {/* Story Choice Modal */}
      {storyChoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {storyChoiceModal.phase.title}
              </CardTitle>
              <div className="text-sm text-gray-600">
                {storyChoiceModal.npc.name} - {storyChoiceModal.npc.storyArc.title}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900 leading-relaxed">
                  {storyChoiceModal.phase.description}
                </p>
              </div>

              {/* Show current NPC image if available */}
              {storyChoiceModal.npc.currentImageUrl && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={storyChoiceModal.npc.currentImageUrl} 
                    alt={storyChoiceModal.npc.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-medium">Your Choices:</h4>
                {storyChoiceModal.phase.choices.map((choice) => {
                  const meetsRequirements = !choice.requirements || (
                    (!choice.requirements.skills || Object.entries(choice.requirements.skills).every(
                      ([skill, required]) => (gameProgress.character.skills[skill] || 0) >= required
                    )) &&
                    (!choice.requirements.items || choice.requirements.items.every(
                      item => gameProgress.character.inventory.includes(item)
                    ))
                  );

                  return (
                    <div
                      key={choice.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        meetsRequirements 
                          ? 'hover:border-blue-500 hover:bg-blue-50' 
                          : 'opacity-50 cursor-not-allowed border-gray-300'
                      }`}
                      onClick={() => meetsRequirements && handleStoryChoice(choice, storyChoiceModal.npc, storyChoiceModal.phase)}
                    >
                      <div className="font-medium text-gray-900 mb-2">{choice.text}</div>
                      <div className="text-sm text-gray-600 mb-2">{choice.consequences}</div>
                      
                      {choice.requirements && (
                        <div className="text-xs text-gray-500">
                          Requirements: {
                            choice.requirements.skills ? 
                              Object.entries(choice.requirements.skills).map(([skill, level]) => 
                                `${skill} ${level}`
                              ).join(', ') 
                              : 'None'
                          }
                        </div>
                      )}
                      
                      {choice.aiImageTrigger && (
                        <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          AI Image Generated
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStoryChoiceModal(null)}
                  className="flex-1"
                >
                  Think About It Later
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