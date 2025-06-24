import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  RotateCcw,
  Trophy,
  Star,
  Clock,
  Target,
  TrendingUp,
  Zap,
  Heart,
  Thermometer,
  Activity,
  Eye,
  Wind,
  Droplets,
  Sun,
  Moon,
  CloudRain,
  Pill,
  Coffee,
  Apple
} from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface MemoryCard {
  id: string;
  type: 'symptom' | 'trigger' | 'treatment' | 'correlation';
  value: string;
  icon: React.ReactNode;
  color: string;
  matchId: string; // Cards with same matchId are pairs
  isFlipped: boolean;
  isMatched: boolean;
  patternInsight?: string;
}

interface GameLevel {
  id: string;
  name: string;
  description: string;
  gridSize: number; // 4x4, 6x4, etc.
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  timeLimit: number; // seconds
  unlockRequirement: number; // previous levels completed
  rewards: {
    points: number;
    insights: string[];
  };
}

interface MemoryGameProgress {
  levelsCompleted: number[];
  totalGamesPlayed: number;
  bestTimes: { [levelId: string]: number };
  totalPatterns: number;
  accuracyRate: number;
  streakDays: number;
  lastPlayed: Date;
  discoveredPatterns: string[];
}

const SYMPTOM_ICONS = {
  'Skin Crawling': <Activity className="w-4 h-4" />,
  'Fatigue': <Heart className="w-4 h-4" />,
  'Brain Fog': <Brain className="w-4 h-4" />,
  'Joint Pain': <Zap className="w-4 h-4" />,
  'Itching': <Eye className="w-4 h-4" />,
  'Lesions': <Target className="w-4 h-4" />,
  'Insomnia': <Moon className="w-4 h-4" />,
  'Anxiety': <TrendingUp className="w-4 h-4" />
};

const TRIGGER_ICONS = {
  'High Humidity': <Droplets className="w-4 h-4" />,
  'Heat': <Sun className="w-4 h-4" />,
  'Stress': <Brain className="w-4 h-4" />,
  'Poor Sleep': <Moon className="w-4 h-4" />,
  'Sugar': <Coffee className="w-4 h-4" />,
  'Rain': <CloudRain className="w-4 h-4" />,
  'Exercise': <Activity className="w-4 h-4" />,
  'Alcohol': <Droplets className="w-4 h-4" />
};

const TREATMENT_ICONS = {
  'Rest': <Moon className="w-4 h-4" />,
  'Medication': <Pill className="w-4 h-4" />,
  'Cool Shower': <Droplets className="w-4 h-4" />,
  'Meditation': <Brain className="w-4 h-4" />,
  'Nutrition': <Apple className="w-4 h-4" />,
  'Hydration': <Droplets className="w-4 h-4" />,
  'Fresh Air': <Wind className="w-4 h-4" />,
  'Gentle Movement': <Activity className="w-4 h-4" />
};

const GAME_LEVELS: GameLevel[] = [
  {
    id: 'basic_symptoms',
    name: 'Basic Symptom Recognition',
    description: 'Match common symptoms with their typical triggers',
    gridSize: 8, // 4x2 grid
    difficulty: 'Easy',
    timeLimit: 90,
    unlockRequirement: 0,
    rewards: {
      points: 50,
      insights: ['Recognizing basic symptom patterns']
    }
  },
  {
    id: 'trigger_patterns',
    name: 'Environmental Triggers',
    description: 'Identify connections between environmental factors and symptoms',
    gridSize: 12, // 4x3 grid
    difficulty: 'Medium',
    timeLimit: 120,
    unlockRequirement: 1,
    rewards: {
      points: 100,
      insights: ['Weather sensitivity patterns', 'Environmental trigger awareness']
    }
  },
  {
    id: 'treatment_matching',
    name: 'Effective Treatments',
    description: 'Match symptoms with their most effective treatments',
    gridSize: 16, // 4x4 grid
    difficulty: 'Medium',
    timeLimit: 150,
    unlockRequirement: 2,
    rewards: {
      points: 150,
      insights: ['Treatment effectiveness patterns', 'Personalized care strategies']
    }
  },
  {
    id: 'complex_correlations',
    name: 'Complex Health Correlations',
    description: 'Advanced pattern recognition with multiple variables',
    gridSize: 20, // 5x4 grid
    difficulty: 'Hard',
    timeLimit: 180,
    unlockRequirement: 3,
    rewards: {
      points: 250,
      insights: ['Multi-factor health patterns', 'Advanced correlation analysis']
    }
  },
  {
    id: 'master_patterns',
    name: 'Master Pattern Detective',
    description: 'Expert-level pattern recognition and health insights',
    gridSize: 24, // 6x4 grid
    difficulty: 'Expert',
    timeLimit: 240,
    unlockRequirement: 4,
    rewards: {
      points: 400,
      insights: ['Master-level pattern recognition', 'Comprehensive health understanding']
    }
  }
];

const PATTERN_PAIRS = {
  basic_symptoms: [
    { symptom: 'Skin Crawling', trigger: 'High Humidity', insight: 'Humidity often triggers tactile sensations' },
    { symptom: 'Fatigue', trigger: 'Poor Sleep', insight: 'Sleep quality directly affects energy levels' },
    { symptom: 'Brain Fog', trigger: 'Stress', insight: 'Stress impairs cognitive function' },
    { symptom: 'Joint Pain', trigger: 'Rain', insight: 'Barometric pressure changes affect joint discomfort' }
  ],
  trigger_patterns: [
    { symptom: 'Itching', trigger: 'Heat', insight: 'Heat increases skin sensitivity and irritation' },
    { symptom: 'Lesions', trigger: 'Sugar', insight: 'High sugar intake can worsen skin conditions' },
    { symptom: 'Insomnia', trigger: 'Anxiety', insight: 'Mental stress disrupts sleep patterns' },
    { symptom: 'Fatigue', trigger: 'Exercise', insight: 'Overexertion can trigger post-exertional malaise' },
    { symptom: 'Brain Fog', trigger: 'Alcohol', insight: 'Alcohol affects cognitive clarity' },
    { symptom: 'Skin Crawling', trigger: 'Stress', insight: 'Psychological stress manifests in physical sensations' }
  ],
  treatment_matching: [
    { symptom: 'Fatigue', treatment: 'Rest', insight: 'Quality rest is fundamental for energy restoration' },
    { symptom: 'Joint Pain', treatment: 'Gentle Movement', insight: 'Light activity can reduce joint stiffness' },
    { symptom: 'Itching', treatment: 'Cool Shower', insight: 'Cool water provides immediate relief from itching' },
    { symptom: 'Brain Fog', treatment: 'Meditation', insight: 'Mindfulness practices improve mental clarity' },
    { symptom: 'Insomnia', treatment: 'Medication', insight: 'Targeted medication can restore sleep cycles' },
    { symptom: 'Lesions', treatment: 'Nutrition', insight: 'Proper nutrition supports skin healing' },
    { symptom: 'Anxiety', treatment: 'Fresh Air', insight: 'Nature exposure reduces stress hormones' },
    { symptom: 'Skin Crawling', treatment: 'Hydration', insight: 'Proper hydration supports nerve function' }
  ]
};

export const SymptomMemoryMatch: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gameProgress, setGameProgress] = useState<MemoryGameProgress | null>(null);
  const [currentLevel, setCurrentLevel] = useState<GameLevel>(GAME_LEVELS[0]);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGameProgress = useCallback(async () => {
    if (!user?.uid) {
      const demoProgress: MemoryGameProgress = {
        levelsCompleted: [],
        totalGamesPlayed: 0,
        bestTimes: {},
        totalPatterns: 0,
        accuracyRate: 0,
        streakDays: 0,
        lastPlayed: new Date(),
        discoveredPatterns: []
      };
      setGameProgress(demoProgress);
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const progress = userData.memoryGameProgress || {
          levelsCompleted: [],
          totalGamesPlayed: 0,
          bestTimes: {},
          totalPatterns: 0,
          accuracyRate: 0,
          streakDays: 0,
          lastPlayed: new Date(),
          discoveredPatterns: []
        };
        setGameProgress(progress);
      } else {
        const newProgress: MemoryGameProgress = {
          levelsCompleted: [],
          totalGamesPlayed: 0,
          bestTimes: {},
          totalPatterns: 0,
          accuracyRate: 0,
          streakDays: 0,
          lastPlayed: new Date(),
          discoveredPatterns: []
        };
        setGameProgress(newProgress);
      }
    } catch (error) {
      console.error('Error loading memory game progress:', error);
      const fallbackProgress: MemoryGameProgress = {
        levelsCompleted: [],
        totalGamesPlayed: 0,
        bestTimes: {},
        totalPatterns: 0,
        accuracyRate: 0,
        streakDays: 0,
        lastPlayed: new Date(),
        discoveredPatterns: []
      };
      setGameProgress(fallbackProgress);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const generateCards = useCallback((level: GameLevel): MemoryCard[] => {
    const pairs = PATTERN_PAIRS[level.id as keyof typeof PATTERN_PAIRS] || PATTERN_PAIRS.basic_symptoms;
    const cardPairs: MemoryCard[] = [];
    
    pairs.slice(0, level.gridSize / 2).forEach((pair, index) => {
      const matchId = `pair-${index}`;
      
      // Create first card (symptom/trigger)
      const firstKey = Object.keys(pair)[0] as keyof typeof pair;
      const firstValue = pair[firstKey] as string;
      const firstType = firstKey === 'symptom' ? 'symptom' : firstKey === 'trigger' ? 'trigger' : 'treatment';
      const firstIcon = firstType === 'symptom' ? SYMPTOM_ICONS[firstValue as keyof typeof SYMPTOM_ICONS] : 
                      firstType === 'trigger' ? TRIGGER_ICONS[firstValue as keyof typeof TRIGGER_ICONS] :
                      TREATMENT_ICONS[firstValue as keyof typeof TREATMENT_ICONS];
      
      cardPairs.push({
        id: `${matchId}-a`,
        type: firstType as 'symptom' | 'trigger' | 'treatment',
        value: firstValue,
        icon: firstIcon || <Brain className="w-4 h-4" />,
        color: firstType === 'symptom' ? 'bg-red-500' : firstType === 'trigger' ? 'bg-orange-500' : 'bg-green-500',
        matchId,
        isFlipped: false,
        isMatched: false,
        patternInsight: pair.insight
      });

      // Create second card (trigger/treatment)
      const secondKey = Object.keys(pair)[1] as keyof typeof pair;
      const secondValue = pair[secondKey] as string;
      const secondType = secondKey === 'trigger' ? 'trigger' : 'treatment';
      const secondIcon = secondType === 'trigger' ? TRIGGER_ICONS[secondValue as keyof typeof TRIGGER_ICONS] :
                        TREATMENT_ICONS[secondValue as keyof typeof TREATMENT_ICONS];
      
      cardPairs.push({
        id: `${matchId}-b`,
        type: secondType as 'trigger' | 'treatment',
        value: secondValue,
        icon: secondIcon || <Target className="w-4 h-4" />,
        color: secondType === 'trigger' ? 'bg-orange-500' : 'bg-green-500',
        matchId,
        isFlipped: false,
        isMatched: false,
        patternInsight: pair.insight
      });
    });

    // Shuffle cards
    return cardPairs.sort(() => Math.random() - 0.5);
  }, []);

  const startGame = useCallback(() => {
    const newCards = generateCards(currentLevel);
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setGameActive(true);
    setTimeRemaining(currentLevel.timeLimit);
    setMoves(0);
    setGameStartTime(new Date());
  }, [currentLevel, generateCards]);

  const flipCard = useCallback((cardId: string) => {
    if (!gameActive || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    setMoves(prev => prev + 1);

    // Update card state
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    // Check for match after 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setTimeout(() => {
        const [firstId, secondId] = newFlippedCards;
        const firstCard = cards.find(c => c.id === firstId);
        const secondCard = cards.find(c => c.id === secondId);

        if (firstCard && secondCard && firstCard.matchId === secondCard.matchId) {
          // Match found
          setMatchedPairs(prev => [...prev, firstCard.matchId]);
          setCards(prev => prev.map(c => 
            c.matchId === firstCard.matchId ? { ...c, isMatched: true } : c
          ));
          
          toast({
            title: "Pattern Discovered!",
            description: firstCard.patternInsight || "Great pattern recognition!",
            duration: 3000
          });

          // Check if all pairs are matched
          const totalPairs = currentLevel.gridSize / 2;
          const newMatchedCount = matchedPairs.length + 1;
          if (newMatchedCount === totalPairs) {
            setTimeout(() => {
              completeGame(true);
            }, 1000);
          }
        } else {
          // No match - flip cards back
          setCards(prev => prev.map(c => 
            newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
        }
        setFlippedCards([]);
      }, 800);
    }
  }, [gameActive, flippedCards, cards, toast]);

  const completeGame = useCallback(async (won: boolean) => {
    if (!gameProgress || !gameStartTime) return;

    const gameTime = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000);
    const accuracy = matchedPairs.length / (currentLevel.gridSize / 2);
    
    let updatedProgress = { ...gameProgress };
    updatedProgress.totalGamesPlayed += 1;
    updatedProgress.lastPlayed = new Date();

    if (won) {
      // Level completed
      if (!updatedProgress.levelsCompleted.includes(GAME_LEVELS.indexOf(currentLevel))) {
        updatedProgress.levelsCompleted.push(GAME_LEVELS.indexOf(currentLevel));
      }
      
      // Update best time
      if (!updatedProgress.bestTimes[currentLevel.id] || gameTime < updatedProgress.bestTimes[currentLevel.id]) {
        updatedProgress.bestTimes[currentLevel.id] = gameTime;
      }

      // Add discovered patterns
      cards.filter(c => c.isMatched).forEach(card => {
        if (card.patternInsight && !updatedProgress.discoveredPatterns.includes(card.patternInsight)) {
          updatedProgress.discoveredPatterns.push(card.patternInsight);
        }
      });

      updatedProgress.totalPatterns += matchedPairs.length;
      
      toast({
        title: "Level Complete!",
        description: `Great work! You completed "${currentLevel.name}" in ${gameTime} seconds with ${moves} moves.`,
        duration: 5000
      });
    }

    // Update accuracy rate
    updatedProgress.accuracyRate = updatedProgress.totalGamesPlayed > 0 ? 
      (updatedProgress.totalPatterns / updatedProgress.totalGamesPlayed) * 100 : 0;

    setGameProgress(updatedProgress);
    
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          memoryGameProgress: updatedProgress
        });
      } catch (error) {
        console.error('Error saving memory game progress:', error);
      }
    }

    setGameActive(false);
  }, [gameProgress, gameStartTime, matchedPairs, currentLevel, moves, cards, user?.uid, toast]);

  // Game timer
  useEffect(() => {
    if (!gameActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeGame(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, timeRemaining, completeGame]);

  // Check for game completion
  useEffect(() => {
    if (gameActive && matchedPairs.length === currentLevel.gridSize / 2) {
      completeGame(true);
    }
  }, [gameActive, matchedPairs.length, currentLevel.gridSize, completeGame]);

  useEffect(() => {
    loadGameProgress();
  }, [loadGameProgress]);

  const getGridCols = () => {
    if (currentLevel.gridSize <= 8) return 'grid-cols-4';
    if (currentLevel.gridSize <= 12) return 'grid-cols-4';
    if (currentLevel.gridSize <= 16) return 'grid-cols-4';
    if (currentLevel.gridSize <= 20) return 'grid-cols-5';
    return 'grid-cols-6';
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          Symptom Pattern Memory Match
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Discover health patterns through memory matching</p>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            {gameProgress?.totalPatterns || 0} patterns discovered
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center bg-purple-50 rounded-lg p-3 hover:bg-purple-100 transition-colors">
            <div className="text-lg font-bold text-purple-600">{gameProgress?.levelsCompleted.length || 0}</div>
            <div className="text-xs text-purple-800">Levels Complete</div>
          </div>
          <div className="text-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-colors">
            <div className="text-lg font-bold text-blue-600">{gameProgress?.totalGamesPlayed || 0}</div>
            <div className="text-xs text-blue-800">Games Played</div>
          </div>
          <div className="text-center bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-colors">
            <div className="text-lg font-bold text-green-600">{Math.round(gameProgress?.accuracyRate || 0)}%</div>
            <div className="text-xs text-green-800">Accuracy Rate</div>
          </div>
          <div className="text-center bg-orange-50 rounded-lg p-3 hover:bg-orange-100 transition-colors">
            <div className="text-lg font-bold text-orange-600">{gameProgress?.discoveredPatterns.length || 0}</div>
            <div className="text-xs text-orange-800">Insights</div>
          </div>
        </div>
        
        {/* Demo Progress Button for Testing */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (!gameProgress) return;
              const demoProgress: MemoryGameProgress = {
                ...gameProgress,
                levelsCompleted: [0, 1],
                totalGamesPlayed: 8,
                accuracyRate: 85,
                discoveredPatterns: [
                  'Humidity often triggers tactile sensations',
                  'Sleep quality directly affects energy levels',
                  'Stress impairs cognitive function',
                  'Heat increases skin sensitivity'
                ],
                bestTimes: { 'basic_symptoms': 45, 'trigger_patterns': 78 }
              };
              setGameProgress(demoProgress);
              toast({
                title: "Demo Progress Applied",
                description: "Game now has demo progress with completed levels and discovered patterns!"
              });
            }}
            className="text-xs"
          >
            Demo Progress (Test)
          </Button>
        </div>

        {/* Level Selection */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Select Level</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {GAME_LEVELS.map((level, index) => {
              const isUnlocked = !gameProgress || gameProgress.levelsCompleted.length >= level.unlockRequirement;
              const isCompleted = gameProgress?.levelsCompleted.includes(index);
              
              return (
                <div
                  key={level.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    currentLevel.id === level.id
                      ? 'border-purple-500 bg-purple-50'
                      : isUnlocked
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => isUnlocked && !gameActive && setCurrentLevel(level)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{level.name}</span>
                    <div className="flex items-center gap-1">
                      {isCompleted && <Star className="w-4 h-4 text-yellow-500" />}
                      <Badge variant={level.difficulty === 'Easy' ? 'default' : level.difficulty === 'Medium' ? 'secondary' : 'destructive'} className="text-xs">
                        {level.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{level.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{level.gridSize / 2} pairs</span>
                    <span>{level.timeLimit}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Clock className="w-4 h-4" />
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Target className="w-4 h-4" />
              {moves} moves
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Trophy className="w-4 h-4" />
              {matchedPairs.length}/{currentLevel.gridSize / 2} pairs
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={startGame} disabled={gameActive} className="bg-purple-600 hover:bg-purple-700">
              {gameActive ? 'Game Active' : 'Start Game'}
            </Button>
            {gameActive && (
              <Button variant="outline" onClick={() => setGameActive(false)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Game Board */}
        {cards.length > 0 ? (
          <div className={`grid ${getGridCols()} gap-3 max-w-3xl mx-auto`}>
            {cards.map((card) => (
              <div
                key={card.id}
                className={`aspect-square border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  card.isFlipped || card.isMatched
                    ? `${card.color} text-white border-transparent scale-105 shadow-lg`
                    : 'border-gray-300 bg-gray-100 hover:border-gray-400 hover:scale-105 hover:shadow-md'
                } ${card.isMatched ? 'opacity-90' : ''}`}
                onClick={() => flipCard(card.id)}
              >
                <div className="w-full h-full flex flex-col items-center justify-center p-2 relative">
                  {card.isFlipped || card.isMatched ? (
                    <>
                      <div className="text-white mb-1">
                        {card.icon}
                      </div>
                      <span className="text-xs text-center text-white font-medium leading-tight">
                        {card.value}
                      </span>
                      <span className="text-xs text-white opacity-75 capitalize">
                        {card.type}
                      </span>
                      {card.isMatched && (
                        <div className="absolute top-1 right-1">
                          <Star className="w-3 h-3 text-yellow-300" />
                        </div>
                      )}
                    </>
                  ) : (
                    <Brain className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Click "Start Game" to begin pattern matching!</p>
            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-medium text-blue-900 mb-2">How to Play:</h4>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Click cards to flip them and reveal patterns</li>
                <li>• Match symptoms with their triggers or treatments</li>
                <li>• Discover health insights with each successful match</li>
                <li>• Complete levels to unlock harder challenges</li>
                <li>• Beat the timer to earn better scores</li>
              </ul>
            </div>
          </div>
        )}

        {/* Pattern Insights */}
        {gameProgress && gameProgress.discoveredPatterns.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Your Discovered Health Patterns
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {gameProgress.discoveredPatterns.slice(-6).map((pattern, index) => (
                <div key={index} className="text-sm text-green-800 bg-green-100 rounded p-2">
                  <Star className="w-3 h-3 inline mr-1" />
                  {pattern}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};