import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Leaf, 
  Play, 
  Pause, 
  RotateCcw,
  Heart,
  Star,
  Wind,
  Sun,
  Flower,
  TreePine,
  Sparkles,
  Timer,
  Volume2,
  VolumeX
} from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdEmpty: number;
  cycles: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  benefits: string[];
  icon: React.ReactNode;
}

interface PlantType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlockRequirement: number; // minutes of practice needed
  stages: string[];
}

interface GardenProgress {
  totalMinutes: number;
  sessionsCompleted: number;
  plantsUnlocked: string[];
  currentGarden: { [plantId: string]: number }; // plant stage (0-4)
  streakDays: number;
  lastSession: Date;
  favoritePattern: string;
}

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    name: '4-4-4-4 Box Breathing',
    description: 'Equal counts for calm focus',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdEmpty: 4,
    cycles: 8,
    difficulty: 'Beginner',
    benefits: ['Reduces anxiety', 'Improves focus', 'Calms nervous system'],
    icon: <Wind className="w-4 h-4" />
  },
  {
    id: 'calm',
    name: '4-7-8 Calming Breath',
    description: 'Extended exhale for relaxation',
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdEmpty: 0,
    cycles: 6,
    difficulty: 'Intermediate',
    benefits: ['Promotes sleep', 'Reduces stress', 'Slows heart rate'],
    icon: <Heart className="w-4 h-4" />
  },
  {
    id: 'energy',
    name: '6-2-6-2 Energizing',
    description: 'Balanced rhythm for vitality',
    inhale: 6,
    hold: 2,
    exhale: 6,
    holdEmpty: 2,
    cycles: 10,
    difficulty: 'Intermediate',
    benefits: ['Increases energy', 'Improves circulation', 'Enhances alertness'],
    icon: <Sun className="w-4 h-4" />
  },
  {
    id: 'deep',
    name: '8-4-8-4 Deep Practice',
    description: 'Extended breath for advanced practitioners',
    inhale: 8,
    hold: 4,
    exhale: 8,
    holdEmpty: 4,
    cycles: 12,
    difficulty: 'Advanced',
    benefits: ['Deep relaxation', 'Meditation preparation', 'Stress mastery'],
    icon: <Sparkles className="w-4 h-4" />
  }
];

const PLANT_TYPES: PlantType[] = [
  {
    id: 'flower',
    name: 'Calming Flowers',
    description: 'Beautiful blooms that represent peace',
    icon: <Flower className="w-6 h-6" />,
    color: 'text-pink-500',
    unlockRequirement: 0,
    stages: ['Seed', 'Sprout', 'Growing', 'Budding', 'Full Bloom']
  },
  {
    id: 'tree',
    name: 'Strength Trees',
    description: 'Tall trees symbolizing inner strength',
    icon: <TreePine className="w-6 h-6" />,
    color: 'text-green-600',
    unlockRequirement: 15,
    stages: ['Seed', 'Sapling', 'Young Tree', 'Mature Tree', 'Ancient Tree']
  },
  {
    id: 'herb',
    name: 'Healing Herbs',
    description: 'Medicinal plants for wellness',
    icon: <Leaf className="w-6 h-6" />,
    color: 'text-green-500',
    unlockRequirement: 30,
    stages: ['Seed', 'Sprout', 'Leafy', 'Mature', 'Medicinal']
  },
  {
    id: 'lotus',
    name: 'Wisdom Lotus',
    description: 'Sacred flowers of enlightenment',
    icon: <Star className="w-6 h-6" />,
    color: 'text-purple-500',
    unlockRequirement: 60,
    stages: ['Seed', 'Floating', 'Rising', 'Opening', 'Enlightened']
  }
];

export const BreathingGarden: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gardenProgress, setGardenProgress] = useState<GardenProgress | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('inhale');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const loadGardenProgress = useCallback(async () => {
    if (!user?.uid) {
      const demoProgress: GardenProgress = {
        totalMinutes: 0,
        sessionsCompleted: 0,
        plantsUnlocked: ['flower'],
        currentGarden: { flower: 0 },
        streakDays: 0,
        lastSession: new Date(),
        favoritePattern: 'box'
      };
      setGardenProgress(demoProgress);
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const progress = userData.gardenProgress || {
          totalMinutes: 0,
          sessionsCompleted: 0,
          plantsUnlocked: ['flower'],
          currentGarden: { flower: 0 },
          streakDays: 0,
          lastSession: new Date(),
          favoritePattern: 'box'
        };
        setGardenProgress(progress);
      } else {
        const newProgress: GardenProgress = {
          totalMinutes: 0,
          sessionsCompleted: 0,
          plantsUnlocked: ['flower'],
          currentGarden: { flower: 0 },
          streakDays: 0,
          lastSession: new Date(),
          favoritePattern: 'box'
        };
        setGardenProgress(newProgress);
      }
    } catch (error) {
      console.error('Error loading garden progress:', error);
      const fallbackProgress: GardenProgress = {
        totalMinutes: 0,
        sessionsCompleted: 0,
        plantsUnlocked: ['flower'],
        currentGarden: { flower: 0 },
        streakDays: 0,
        lastSession: new Date(),
        favoritePattern: 'box'
      };
      setGardenProgress(fallbackProgress);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const saveProgress = useCallback(async (progress: GardenProgress) => {
    if (!user?.uid) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        gardenProgress: progress
      });
    } catch (error) {
      console.error('Error saving garden progress:', error);
    }
  }, [user?.uid]);

  const playSound = useCallback((frequency: number, duration: number) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  const startBreathingSession = useCallback(() => {
    setIsActive(true);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setTimeRemaining(selectedPattern.inhale);
    setSessionMinutes(0);
    playSound(440, 0.2); // Start chime
  }, [selectedPattern, playSound]);

  const stopBreathingSession = useCallback(() => {
    setIsActive(false);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setTimeRemaining(0);
  }, []);

  const completeSession = useCallback(async () => {
    if (!gardenProgress) return;

    const sessionDuration = Math.ceil((selectedPattern.cycles * 
      (selectedPattern.inhale + selectedPattern.hold + selectedPattern.exhale + selectedPattern.holdEmpty)) / 60);

    // Check if it's a new day for streak calculation
    const today = new Date().toDateString();
    const lastSessionDate = new Date(gardenProgress.lastSession).toDateString();
    const isNewDay = today !== lastSessionDate;
    
    // Calculate new streak
    let newStreak = gardenProgress.streakDays;
    if (isNewDay) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = yesterday.toDateString() === lastSessionDate;
      newStreak = wasYesterday ? gardenProgress.streakDays + 1 : 1;
    }

    const updatedProgress: GardenProgress = {
      ...gardenProgress,
      totalMinutes: gardenProgress.totalMinutes + sessionDuration,
      sessionsCompleted: gardenProgress.sessionsCompleted + 1,
      lastSession: new Date(),
      streakDays: newStreak,
      favoritePattern: selectedPattern.id
    };

    // Check for new plant unlocks
    const newUnlocks: string[] = [];
    PLANT_TYPES.forEach(plant => {
      if (!updatedProgress.plantsUnlocked.includes(plant.id) && 
          updatedProgress.totalMinutes >= plant.unlockRequirement) {
        updatedProgress.plantsUnlocked.push(plant.id);
        updatedProgress.currentGarden[plant.id] = 0;
        newUnlocks.push(plant.name);
      }
    });

    // Grow existing plants
    updatedProgress.plantsUnlocked.forEach(plantId => {
      const currentStage = updatedProgress.currentGarden[plantId] || 0;
      if (currentStage < 4) { // Max stage is 4
        const growthChance = 0.3 + (sessionDuration * 0.1); // Higher chance for longer sessions
        if (Math.random() < growthChance) {
          updatedProgress.currentGarden[plantId] = currentStage + 1;
        }
      }
    });

    setGardenProgress(updatedProgress);
    await saveProgress(updatedProgress);

    // Show completion message
    toast({
      title: "Session Complete!",
      description: `Great work! You practiced for ${sessionDuration} minutes. ${newUnlocks.length > 0 ? `New plants unlocked: ${newUnlocks.join(', ')}` : 'Your garden is growing!'}`
    });

    setIsActive(false);
    setSessionMinutes(sessionMinutes + sessionDuration);
    playSound(523, 0.5); // Completion chime
  }, [gardenProgress, selectedPattern, saveProgress, toast, playSound, sessionMinutes]);

  // Breathing session timer
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Move to next phase
          let nextPhase: typeof currentPhase;
          let nextTime: number;
          
          switch (currentPhase) {
            case 'inhale':
              nextPhase = 'hold';
              nextTime = selectedPattern.hold;
              playSound(550, 0.1);
              break;
            case 'hold':
              nextPhase = 'exhale';
              nextTime = selectedPattern.exhale;
              playSound(440, 0.1);
              break;
            case 'exhale':
              nextPhase = 'holdEmpty';
              nextTime = selectedPattern.holdEmpty;
              playSound(330, 0.1);
              break;
            case 'holdEmpty':
              const nextCycleNum = currentCycle + 1;
              if (nextCycleNum >= selectedPattern.cycles) {
                completeSession();
                return 0;
              }
              setCurrentCycle(nextCycleNum);
              nextPhase = 'inhale';
              nextTime = selectedPattern.inhale;
              playSound(440, 0.1);
              break;
          }
          
          setCurrentPhase(nextPhase);
          return nextTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeRemaining, currentPhase, currentCycle, selectedPattern, completeSession, playSound]);

  useEffect(() => {
    loadGardenProgress();
  }, [loadGardenProgress]);

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'holdEmpty': return 'Hold Empty';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale': return 'text-blue-600';
      case 'hold': return 'text-purple-600';
      case 'exhale': return 'text-green-600';
      case 'holdEmpty': return 'text-orange-600';
    }
  };

  const renderGarden = () => {
    if (!gardenProgress) return null;

    return (
      <div className="bg-gradient-to-b from-sky-100 to-green-100 rounded-lg p-6 min-h-48">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Your Mindfulness Garden</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PLANT_TYPES.filter(plant => gardenProgress.plantsUnlocked.includes(plant.id)).map(plant => {
            const stage = gardenProgress.currentGarden[plant.id] || 0;
            const stageNames = plant.stages;
            
            return (
              <div key={plant.id} className="text-center">
                <div className={`text-4xl mb-2 ${plant.color} transform transition-transform hover:scale-110`}>
                  {plant.icon}
                </div>
                <p className="text-sm font-medium text-gray-700">{plant.name}</p>
                <p className="text-xs text-gray-600">{stageNames[stage]}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${(stage / 4) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {gardenProgress.plantsUnlocked.length < PLANT_TYPES.length && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Practice more to unlock new plants! Next unlock at {PLANT_TYPES.find(p => !gardenProgress.plantsUnlocked.includes(p.id))?.unlockRequirement} minutes.
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-green-600" />
          Stress Relief Breathing Garden
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Grow your mindfulness garden through breathing practice</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={soundEnabled ? 'text-blue-600' : 'text-gray-400'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Garden Display */}
        {renderGarden()}

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-blue-50 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-600">{gardenProgress?.totalMinutes || 0}</div>
            <div className="text-xs text-blue-800">Total Minutes</div>
          </div>
          <div className="text-center bg-green-50 rounded-lg p-3">
            <div className="text-lg font-bold text-green-600">{gardenProgress?.sessionsCompleted || 0}</div>
            <div className="text-xs text-green-800">Sessions</div>
          </div>
          <div className="text-center bg-orange-50 rounded-lg p-3">
            <div className="text-lg font-bold text-orange-600">{gardenProgress?.streakDays || 0}</div>
            <div className="text-xs text-orange-800">Day Streak</div>
          </div>
        </div>

        {/* Breathing Session */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Breathing Practice</h3>
          
          {/* Pattern Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {BREATHING_PATTERNS.map(pattern => (
              <div
                key={pattern.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedPattern.id === pattern.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => !isActive && setSelectedPattern(pattern)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {pattern.icon}
                  <span className="font-medium text-sm">{pattern.name}</span>
                  <Badge variant={pattern.difficulty === 'Beginner' ? 'default' : pattern.difficulty === 'Intermediate' ? 'secondary' : 'destructive'} className="text-xs">
                    {pattern.difficulty}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{pattern.description}</p>
              </div>
            ))}
          </div>

          {/* Breathing Interface */}
          {isActive ? (
            <div className="text-center space-y-4">
              <div className={`text-4xl font-bold ${getPhaseColor()}`}>
                {getPhaseInstruction()}
              </div>
              <div className="text-2xl font-mono text-gray-700">
                {timeRemaining}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Timer className="w-4 h-4" />
                Cycle {currentCycle + 1} of {selectedPattern.cycles}
              </div>
              <Progress 
                value={(currentCycle / selectedPattern.cycles) * 100} 
                className="w-full max-w-xs mx-auto"
              />
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={stopBreathingSession}>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-gray-600">
                <p className="font-medium">{selectedPattern.name}</p>
                <p className="text-sm">{selectedPattern.description}</p>
                <p className="text-xs mt-1">
                  {selectedPattern.inhale}-{selectedPattern.hold}-{selectedPattern.exhale}-{selectedPattern.holdEmpty} 
                  × {selectedPattern.cycles} cycles
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={startBreathingSession} className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start Practice
                </Button>
                <Button variant="outline" onClick={() => setSelectedPattern(BREATHING_PATTERNS[0])}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          )}

          {/* Benefits */}
          {!isActive && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Benefits of {selectedPattern.name}:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                {selectedPattern.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};