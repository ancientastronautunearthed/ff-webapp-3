import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  Shield, 
  Zap,
  Heart,
  Clock,
  AlertTriangle,
  Trophy,
  Skull,
  Plus,
  ArrowUp,
  FileText,
  CreditCard,
  Banknote,
  Building2,
  Phone,
  Users,
  HelpCircle
} from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Bill {
  id: string;
  type: 'specialist' | 'test' | 'prescription' | 'emergency' | 'imaging' | 'therapy';
  name: string;
  cost: number;
  description: string;
  icon: React.ReactNode;
  color: string;
  stackHeight: number;
}

interface Enemy {
  id: string;
  type: 'denial' | 'collections' | 'deductible' | 'copay' | 'outOfNetwork' | 'priorAuth';
  name: string;
  damage: number;
  health: number;
  maxHealth: number;
  speed: number;
  position: number;
  icon: React.ReactNode;
  color: string;
  reward: number;
}

interface Defense {
  id: string;
  type: 'insurance' | 'fsa' | 'family' | 'lawyer' | 'advocate' | 'savings';
  name: string;
  damage: number;
  range: number;
  cost: number;
  description: string;
  icon: React.ReactNode;
  color: string;
  position?: number;
  cooldown: number;
  lastFired: number;
}

interface GameState {
  money: number;
  health: number;
  maxHealth: number;
  wave: number;
  score: number;
  bills: Bill[];
  enemies: Enemy[];
  defenses: Defense[];
  gameActive: boolean;
  waveActive: boolean;
  billTowerHeight: number;
}

interface TowerDefenseProgress {
  highestWave: number;
  totalGamesPlayed: number;
  totalBillsStacked: number;
  totalMoneySaved: number;
  achievementsUnlocked: string[];
  lastPlayed: Date;
}

const BILL_TYPES: Omit<Bill, 'id' | 'stackHeight'>[] = [
  {
    type: 'specialist',
    name: 'Dermatologist Visit',
    cost: 350,
    description: '"Have you tried moisturizer?"',
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-red-500'
  },
  {
    type: 'test',
    name: 'Mystery Blood Panel',
    cost: 890,
    description: 'Tests for everything except what you have',
    icon: <HelpCircle className="w-4 h-4" />,
    color: 'bg-purple-500'
  },
  {
    type: 'prescription',
    name: 'Anti-Anxiety Meds',
    cost: 120,
    description: 'For your "imaginary" symptoms',
    icon: <Plus className="w-4 h-4" />,
    color: 'bg-blue-500'
  },
  {
    type: 'emergency',
    name: 'ER Visit',
    cost: 2400,
    description: 'Where they tell you to see your primary care',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'bg-red-600'
  },
  {
    type: 'imaging',
    name: 'MRI Scan',
    cost: 1800,
    description: 'Shows nothing conclusive',
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-gray-600'
  },
  {
    type: 'therapy',
    name: 'Physical Therapy',
    cost: 180,
    description: 'For your "stress-related" symptoms',
    icon: <Heart className="w-4 h-4" />,
    color: 'bg-green-500'
  }
];

const ENEMY_TYPES: Omit<Enemy, 'id' | 'health' | 'maxHealth' | 'position'>[] = [
  {
    type: 'denial',
    name: 'Insurance Denial',
    damage: 500,
    speed: 2,
    icon: <Shield className="w-4 h-4" />,
    color: 'text-red-600',
    reward: 100
  },
  {
    type: 'collections',
    name: 'Collections Agency',
    damage: 1000,
    speed: 1,
    icon: <Phone className="w-4 h-4" />,
    color: 'text-red-800',
    reward: 300
  },
  {
    type: 'deductible',
    name: 'Annual Deductible',
    damage: 800,
    speed: 1.5,
    icon: <CreditCard className="w-4 h-4" />,
    color: 'text-orange-600',
    reward: 150
  },
  {
    type: 'copay',
    name: 'Specialist Copay',
    damage: 200,
    speed: 3,
    icon: <Banknote className="w-4 h-4" />,
    color: 'text-yellow-600',
    reward: 50
  },
  {
    type: 'outOfNetwork',
    name: 'Out of Network Surprise',
    damage: 1500,
    speed: 1,
    icon: <Building2 className="w-4 h-4" />,
    color: 'text-purple-600',
    reward: 400
  },
  {
    type: 'priorAuth',
    name: 'Prior Authorization Delay',
    damage: 300,
    speed: 2.5,
    icon: <Clock className="w-4 h-4" />,
    color: 'text-blue-600',
    reward: 80
  }
];

const DEFENSE_TYPES: Defense[] = [
  {
    id: 'insurance',
    type: 'insurance',
    name: 'Good Insurance',
    damage: 300,
    range: 100,
    cost: 500,
    description: 'Covers some things sometimes',
    icon: <Shield className="w-4 h-4" />,
    color: 'bg-blue-500',
    cooldown: 2000,
    lastFired: 0
  },
  {
    id: 'fsa',
    type: 'fsa',
    name: 'FSA Account',
    damage: 200,
    range: 80,
    cost: 300,
    description: 'Use it or lose it',
    icon: <CreditCard className="w-4 h-4" />,
    color: 'bg-green-500',
    cooldown: 1500,
    lastFired: 0
  },
  {
    id: 'family',
    type: 'family',
    name: 'Family Support',
    damage: 400,
    range: 120,
    cost: 0,
    description: 'Emotional and financial backup',
    icon: <Users className="w-4 h-4" />,
    color: 'bg-purple-500',
    cooldown: 3000,
    lastFired: 0
  },
  {
    id: 'lawyer',
    type: 'lawyer',
    name: 'Medical Lawyer',
    damage: 800,
    range: 150,
    cost: 1000,
    description: 'Fight the system',
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-red-500',
    cooldown: 4000,
    lastFired: 0
  },
  {
    id: 'advocate',
    type: 'advocate',
    name: 'Patient Advocate',
    damage: 350,
    range: 100,
    cost: 400,
    description: 'Someone who actually listens',
    icon: <Heart className="w-4 h-4" />,
    color: 'bg-pink-500',
    cooldown: 2500,
    lastFired: 0
  }
];

export const MedicalBillsTowerDefense: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gameProgress, setGameProgress] = useState<TowerDefenseProgress | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    money: 1000,
    health: 100,
    maxHealth: 100,
    wave: 1,
    score: 0,
    bills: [],
    enemies: [],
    defenses: [],
    gameActive: false,
    waveActive: false,
    billTowerHeight: 0
  });
  const [selectedDefense, setSelectedDefense] = useState<Defense | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    if (!user?.uid) {
      const demoProgress: TowerDefenseProgress = {
        highestWave: 0,
        totalGamesPlayed: 0,
        totalBillsStacked: 0,
        totalMoneySaved: 0,
        achievementsUnlocked: [],
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
        const progress = userData.towerDefenseProgress || {
          highestWave: 0,
          totalGamesPlayed: 0,
          totalBillsStacked: 0,
          totalMoneySaved: 0,
          achievementsUnlocked: [],
          lastPlayed: new Date()
        };
        setGameProgress(progress);
      }
    } catch (error) {
      console.error('Error loading tower defense progress:', error);
      const fallbackProgress: TowerDefenseProgress = {
        highestWave: 0,
        totalGamesPlayed: 0,
        totalBillsStacked: 0,
        totalMoneySaved: 0,
        achievementsUnlocked: [],
        lastPlayed: new Date()
      };
      setGameProgress(fallbackProgress);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const startGame = useCallback(() => {
    setGameState({
      money: 1000,
      health: 100,
      maxHealth: 100,
      wave: 1,
      score: 0,
      bills: [],
      enemies: [],
      defenses: [],
      gameActive: true,
      waveActive: false,
      billTowerHeight: 0
    });
  }, []);

  const addBill = useCallback(() => {
    const billType = BILL_TYPES[Math.floor(Math.random() * BILL_TYPES.length)];
    const newBill: Bill = {
      ...billType,
      id: `bill-${Date.now()}`,
      stackHeight: gameState.billTowerHeight + 1
    };

    setGameState(prev => ({
      ...prev,
      bills: [...prev.bills, newBill],
      billTowerHeight: prev.billTowerHeight + 1,
      money: prev.money - newBill.cost,
      score: prev.score + newBill.cost
    }));

    toast({
      title: `New Bill Added: ${newBill.name}`,
      description: `$${newBill.cost} - ${newBill.description}`,
      duration: 3000
    });
  }, [gameState.billTowerHeight, toast]);

  const placeDefense = useCallback((defense: Defense, position: number) => {
    if (gameState.money < defense.cost) {
      toast({
        title: "Not Enough Money",
        description: `Need $${defense.cost} to place ${defense.name}`,
        variant: "destructive"
      });
      return;
    }

    const newDefense: Defense = {
      ...defense,
      id: `defense-${Date.now()}`,
      position
    };

    setGameState(prev => ({
      ...prev,
      defenses: [...prev.defenses, newDefense],
      money: prev.money - defense.cost
    }));

    setSelectedDefense(null);
    toast({
      title: `${defense.name} Placed`,
      description: defense.description
    });
  }, [gameState.money, toast]);

  const spawnWave = useCallback(() => {
    const waveSize = Math.min(3 + gameState.wave, 8);
    const newEnemies: Enemy[] = [];

    for (let i = 0; i < waveSize; i++) {
      const enemyType = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
      const baseHealth = 200 + (gameState.wave * 50);
      
      newEnemies.push({
        ...enemyType,
        id: `enemy-${Date.now()}-${i}`,
        health: baseHealth,
        maxHealth: baseHealth,
        position: 0
      });
    }

    setGameState(prev => ({
      ...prev,
      enemies: newEnemies,
      waveActive: true
    }));
  }, [gameState.wave]);

  const updateGame = useCallback(() => {
    setGameState(prev => {
      if (!prev.gameActive) return prev;

      let newState = { ...prev };
      const currentTime = Date.now();

      // Move enemies
      newState.enemies = newState.enemies.map(enemy => ({
        ...enemy,
        position: enemy.position + enemy.speed
      }));

      // Check if enemies reached the end
      const reachedEnd = newState.enemies.filter(enemy => enemy.position >= 500);
      if (reachedEnd.length > 0) {
        const totalDamage = reachedEnd.reduce((sum, enemy) => sum + enemy.damage, 0);
        newState.health = Math.max(0, newState.health - totalDamage);
        newState.enemies = newState.enemies.filter(enemy => enemy.position < 500);
        
        if (newState.health <= 0) {
          newState.gameActive = false;
          toast({
            title: "Bankruptcy!",
            description: "Your medical bills have overwhelmed your finances!",
            variant: "destructive"
          });
        }
      }

      // Defense shooting
      newState.defenses.forEach(defense => {
        if (currentTime - defense.lastFired > defense.cooldown) {
          const target = newState.enemies.find(enemy => 
            Math.abs(enemy.position - (defense.position || 0)) <= defense.range
          );
          
          if (target) {
            defense.lastFired = currentTime;
            target.health -= defense.damage;
            
            if (target.health <= 0) {
              newState.money += target.reward;
              newState.score += target.reward;
              newState.enemies = newState.enemies.filter(e => e.id !== target.id);
            }
          }
        }
      });

      // Check wave completion
      if (newState.waveActive && newState.enemies.length === 0) {
        newState.waveActive = false;
        newState.wave += 1;
        newState.money += 200; // Wave completion bonus
        
        toast({
          title: `Wave ${newState.wave - 1} Complete!`,
          description: `+$200 bonus. Prepare for the next wave!`
        });
      }

      return newState;
    });
  }, [toast]);

  // Game loop
  useEffect(() => {
    if (!gameState.gameActive) return;

    const gameLoop = setInterval(updateGame, 100);
    return () => clearInterval(gameLoop);
  }, [gameState.gameActive, updateGame]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          Medical Bills Tower Defense
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Stack bills while defending against financial attacks!</p>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Wave {gameState.wave}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Game Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center bg-green-50 rounded-lg p-3">
            <div className="text-lg font-bold text-green-600">${gameState.money}</div>
            <div className="text-xs text-green-800">Available Funds</div>
          </div>
          <div className="text-center bg-red-50 rounded-lg p-3">
            <div className="text-lg font-bold text-red-600">{gameState.health}%</div>
            <div className="text-xs text-red-800">Financial Health</div>
          </div>
          <div className="text-center bg-blue-50 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-600">{gameState.billTowerHeight}</div>
            <div className="text-xs text-blue-800">Bills Stacked</div>
          </div>
          <div className="text-center bg-purple-50 rounded-lg p-3">
            <div className="text-lg font-bold text-purple-600">{gameState.score}</div>
            <div className="text-xs text-purple-800">Total Spent</div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
          <div className="flex gap-2">
            <Button onClick={startGame} disabled={gameState.gameActive} className="bg-green-600 hover:bg-green-700">
              {gameState.gameActive ? 'Game Active' : 'Start New Game'}
            </Button>
            {gameState.gameActive && !gameState.waveActive && (
              <Button onClick={spawnWave} className="bg-red-600 hover:bg-red-700">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Next Wave
              </Button>
            )}
            {gameState.gameActive && gameState.money >= 100 && (
              <Button onClick={addBill} className="bg-yellow-600 hover:bg-yellow-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Bill ($100+)
              </Button>
            )}
          </div>
          <Progress value={(gameState.health / gameState.maxHealth) * 100} className="w-32" />
        </div>

        {/* Defense Selection */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Choose Your Defense</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DEFENSE_TYPES.map((defense) => (
              <div
                key={defense.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedDefense?.id === defense.id
                    ? 'border-blue-500 bg-blue-50'
                    : gameState.money >= defense.cost
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => gameState.money >= defense.cost && setSelectedDefense(defense)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1 rounded ${defense.color} text-white`}>
                    {defense.icon}
                  </div>
                  <span className="font-medium text-sm">{defense.name}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{defense.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-600">${defense.cost}</span>
                  <span className="text-blue-600">{defense.damage} DMG</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Field */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 min-h-64 relative">
          <div className="absolute top-2 left-2">
            <Badge variant="outline">Financial Path</Badge>
          </div>
          
          {/* Defense Positions */}
          {[100, 200, 300, 400].map((position) => (
            <div
              key={position}
              className={`absolute top-20 w-12 h-12 border-2 border-dashed border-gray-400 rounded cursor-pointer hover:bg-white hover:bg-opacity-50 ${
                selectedDefense ? 'border-blue-500' : ''
              }`}
              style={{ left: `${position}px` }}
              onClick={() => selectedDefense && placeDefense(selectedDefense, position)}
            >
              {gameState.defenses.find(d => d.position === position) && (
                <div className={`w-full h-full rounded ${gameState.defenses.find(d => d.position === position)?.color} flex items-center justify-center text-white`}>
                  {gameState.defenses.find(d => d.position === position)?.icon}
                </div>
              )}
            </div>
          ))}

          {/* Enemies */}
          {gameState.enemies.map((enemy) => (
            <div
              key={enemy.id}
              className="absolute top-32 transition-all duration-100"
              style={{ left: `${enemy.position}px` }}
            >
              <div className={`w-8 h-8 rounded border-2 border-red-500 bg-white flex items-center justify-center ${enemy.color}`}>
                {enemy.icon}
              </div>
              <div className="w-12 bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className="bg-red-500 h-1 rounded-full transition-all"
                  style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                />
              </div>
            </div>
          ))}

          {/* Bill Tower */}
          <div className="absolute bottom-4 right-4">
            <div className="flex flex-col-reverse items-center">
              {gameState.bills.slice(-10).map((bill, index) => (
                <div
                  key={bill.id}
                  className={`w-16 h-4 ${bill.color} rounded mb-1 flex items-center justify-center text-white text-xs`}
                  style={{ zIndex: index }}
                >
                  {bill.icon}
                </div>
              ))}
              {gameState.billTowerHeight > 0 && (
                <Badge variant="secondary" className="mb-2">
                  ${gameState.bills.reduce((sum, bill) => sum + bill.cost, 0).toLocaleString()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Demo Progress */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (!gameProgress) return;
              const demoProgress: TowerDefenseProgress = {
                ...gameProgress,
                highestWave: 15,
                totalGamesPlayed: 25,
                totalBillsStacked: 127,
                totalMoneySaved: 8450,
                achievementsUnlocked: ['Survivor', 'Bill Stacker', 'Wave Master']
              };
              setGameProgress(demoProgress);
              toast({
                title: "Demo Progress Applied",
                description: "Game now shows demo achievements and statistics!"
              });
            }}
            className="text-xs"
          >
            Demo Progress (Test)
          </Button>
        </div>

        {/* Achievements */}
        {gameProgress && gameProgress.achievementsUnlocked.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Achievements Unlocked
            </h4>
            <div className="flex flex-wrap gap-2">
              {gameProgress.achievementsUnlocked.map((achievement, index) => (
                <Badge key={index} variant="outline" className="text-yellow-700 border-yellow-300">
                  {achievement}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};