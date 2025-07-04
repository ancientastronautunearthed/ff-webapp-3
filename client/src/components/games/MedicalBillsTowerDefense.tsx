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
  },
  {
    type: 'specialist',
    name: 'Rheumatologist',
    cost: 425,
    description: '"Maybe try yoga?"',
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-orange-500'
  },
  {
    type: 'test',
    name: 'Allergy Panel',
    cost: 680,
    description: 'Testing for everything except fiber sensitivity',
    icon: <HelpCircle className="w-4 h-4" />,
    color: 'bg-indigo-500'
  },
  {
    type: 'prescription',
    name: 'Topical Steroids',
    cost: 85,
    description: 'The universal "solution"',
    icon: <Plus className="w-4 h-4" />,
    color: 'bg-teal-500'
  },
  {
    type: 'emergency',
    name: 'Urgent Care',
    cost: 850,
    description: '"Have you Googled your symptoms?"',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'bg-yellow-600'
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
  },
  {
    id: 'savings',
    type: 'savings',
    name: 'Emergency Fund',
    damage: 250,
    range: 90,
    cost: 600,
    description: 'Your rainy day stash',
    icon: <Banknote className="w-4 h-4" />,
    color: 'bg-yellow-500',
    cooldown: 2200,
    lastFired: 0
  },
  {
    id: 'gofundme',
    type: 'advocate',
    name: 'GoFundMe',
    damage: 600,
    range: 110,
    cost: 200,
    description: 'Crowdsourced medical bankruptcy prevention',
    icon: <Users className="w-4 h-4" />,
    color: 'bg-indigo-500',
    cooldown: 3500,
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
    if (gameState.money < 100) {
      toast({
        title: "Not Enough Money",
        description: "Need at least $100 to add a bill",
        variant: "destructive"
      });
      return;
    }

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
      score: prev.score + newBill.cost
    }));

    toast({
      title: `New Medical Bill: ${newBill.name}`,
      description: `$${newBill.cost} - ${newBill.description}`,
      duration: 3000
    });
  }, [gameState.money, gameState.billTowerHeight, toast]);

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

    toast({
      title: `Wave ${gameState.wave} Started!`,
      description: `${waveSize} financial attacks incoming!`,
      duration: 2000
    });
  }, [gameState.wave, toast]);

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
          <div className="text-center bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-colors">
            <div className="text-lg font-bold text-green-600">${gameState.money.toLocaleString()}</div>
            <div className="text-xs text-green-800">Available Funds</div>
          </div>
          <div className={`text-center rounded-lg p-3 transition-colors ${
            gameState.health > 50 ? 'bg-green-50 hover:bg-green-100' : 
            gameState.health > 25 ? 'bg-yellow-50 hover:bg-yellow-100' : 
            'bg-red-50 hover:bg-red-100'
          }`}>
            <div className={`text-lg font-bold ${
              gameState.health > 50 ? 'text-green-600' : 
              gameState.health > 25 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>{gameState.health}%</div>
            <div className={`text-xs ${
              gameState.health > 50 ? 'text-green-800' : 
              gameState.health > 25 ? 'text-yellow-800' : 
              'text-red-800'
            }`}>Financial Health</div>
          </div>
          <div className="text-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-colors">
            <div className="text-lg font-bold text-blue-600">{gameState.billTowerHeight}</div>
            <div className="text-xs text-blue-800">Bills Stacked</div>
          </div>
          <div className="text-center bg-purple-50 rounded-lg p-3 hover:bg-purple-100 transition-colors">
            <div className="text-lg font-bold text-purple-600">${gameState.score.toLocaleString()}</div>
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
            {gameState.gameActive && (
              <Button 
                onClick={addBill} 
                disabled={gameState.money < 100}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medical Bill
              </Button>
            )}
          </div>
          <Progress value={(gameState.health / gameState.maxHealth) * 100} className="w-32" />
        </div>

        {/* Defense Selection */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Choose Your Financial Defense
            {selectedDefense && (
              <Badge variant="outline" className="ml-2">
                {selectedDefense.name} Selected
              </Badge>
            )}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {DEFENSE_TYPES.map((defense) => (
              <div
                key={defense.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:scale-105 ${
                  selectedDefense?.id === defense.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : gameState.money >= defense.cost
                      ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
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
                  <span className={`font-bold ${defense.cost === 0 ? 'text-green-600' : gameState.money >= defense.cost ? 'text-green-600' : 'text-red-600'}`}>
                    {defense.cost === 0 ? 'FREE' : `$${defense.cost}`}
                  </span>
                  <span className="text-blue-600">{defense.damage} DMG</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-purple-600">Range: {defense.range}</span>
                  <span className="text-orange-600">{defense.cooldown/1000}s CD</span>
                </div>
              </div>
            ))}
          </div>
          {selectedDefense && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
              Click on a defense position to place your {selectedDefense.name}
            </div>
          )}
        </div>

        {/* Game Field */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 min-h-80 relative overflow-hidden">
          <div className="absolute top-2 left-2">
            <Badge variant="outline">Financial Battlefield</Badge>
          </div>
          
          {/* Enemy Path */}
          <div className="absolute top-16 left-0 w-full h-2 bg-red-200 rounded opacity-50" />
          
          {/* Defense Positions */}
          {[80, 180, 280, 380, 480].map((position) => (
            <div
              key={position}
              className={`absolute top-12 w-14 h-14 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-75 transition-all ${
                selectedDefense ? 'border-blue-500 border-solid bg-blue-50' : ''
              }`}
              style={{ left: `${position}px` }}
              onClick={() => selectedDefense && placeDefense(selectedDefense, position)}
            >
              {gameState.defenses.find(d => d.position === position) ? (
                <div className={`w-full h-full rounded-lg ${gameState.defenses.find(d => d.position === position)?.color} flex flex-col items-center justify-center text-white shadow-lg relative`}>
                  <div className="text-sm">
                    {gameState.defenses.find(d => d.position === position)?.icon}
                  </div>
                  <div className="absolute -bottom-1 left-0 right-0 text-xs text-center bg-black bg-opacity-50 rounded-b">
                    ${gameState.defenses.find(d => d.position === position)?.damage}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Plus className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}

          {/* Enemy Path Line */}
          <div className="absolute top-16 left-0 w-full h-1 bg-red-300 rounded opacity-60" />
          <div className="absolute top-16 left-0 w-2 h-2 bg-red-500 rounded-full -mt-0.5" />
          <div className="absolute top-16 right-0 w-2 h-2 bg-red-600 rounded-full -mt-0.5" />

          {/* Enemies */}
          {gameState.enemies.map((enemy) => (
            <div
              key={enemy.id}
              className="absolute top-14 transition-all duration-100 z-10"
              style={{ left: `${Math.min(enemy.position, 520)}px` }}
            >
              <div className={`w-10 h-10 rounded-lg border-2 border-red-500 bg-white flex items-center justify-center ${enemy.color} shadow-md hover:scale-110 transition-transform`}>
                {enemy.icon}
              </div>
              <div className="w-12 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    enemy.health / enemy.maxHealth > 0.6 ? 'bg-red-500' :
                    enemy.health / enemy.maxHealth > 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                />
              </div>
              <div className="text-xs text-center mt-1 font-bold text-red-600 bg-white rounded px-1">
                ${enemy.damage}
              </div>
            </div>
          ))}

          {/* Defense Range Indicators */}
          {selectedDefense && gameState.defenses.map((defense) => (
            <div
              key={`range-${defense.id}`}
              className="absolute top-12 border border-blue-300 bg-blue-100 bg-opacity-30 rounded-full pointer-events-none"
              style={{
                left: `${(defense.position || 0) - defense.range/2 + 28}px`,
                width: `${defense.range}px`,
                height: `${defense.range}px`,
                top: `${48 - defense.range/2 + 28}px`
              }}
            />
          ))}

          {/* Bill Tower */}
          <div className="absolute bottom-4 right-4">
            <div className="flex flex-col-reverse items-center">
              {gameState.bills.slice(-10).map((bill, index) => (
                <div
                  key={bill.id}
                  className={`w-20 h-4 ${bill.color} rounded mb-0.5 flex items-center justify-center text-white text-xs shadow-sm hover:scale-105 transition-transform`}
                  style={{ 
                    zIndex: index,
                    transform: `translateX(${Math.sin(index * 0.5) * 2}px)` // Slight wobble effect
                  }}
                  title={`${bill.name}: $${bill.cost} - ${bill.description}`}
                >
                  {bill.icon}
                  <span className="ml-1">${bill.cost}</span>
                </div>
              ))}
              {gameState.billTowerHeight > 10 && (
                <div className="text-xs text-gray-600 bg-white rounded px-1 mb-1">
                  +{gameState.billTowerHeight - 10} more bills...
                </div>
              )}
              {gameState.billTowerHeight > 0 && (
                <Badge variant="secondary" className="mb-2 bg-red-100 text-red-800">
                  Tower: ${gameState.bills.reduce((sum, bill) => sum + bill.cost, 0).toLocaleString()}
                </Badge>
              )}
              {gameState.billTowerHeight === 0 && (
                <div className="text-xs text-gray-500 text-center">
                  Add medical bills<br/>to build tower
                </div>
              )}
            </div>
          </div>

          {/* Game Status */}
          {!gameState.gameActive && gameState.wave > 1 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="bg-white rounded-lg p-6 text-center shadow-2xl">
                <Skull className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Financial Bankruptcy!</h3>
                <p className="text-gray-600 mb-2">Survived {gameState.wave - 1} waves</p>
                <p className="text-sm text-gray-500 mb-2">Total Medical Bills: ${gameState.score.toLocaleString()}</p>
                <p className="text-xs text-blue-600">Bills Stacked: {gameState.billTowerHeight}</p>
                <Button 
                  onClick={startGame} 
                  className="mt-4 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {gameState.gameActive && !gameState.waveActive && gameState.enemies.length === 0 && gameState.wave > 1 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-600 text-white">
                Wave {gameState.wave - 1} Complete!
              </Badge>
            </div>
          )}
        </div>

        {/* Demo Progress and Quick Actions */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-2">
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
                  achievementsUnlocked: ['Survivor', 'Bill Stacker', 'Wave Master', 'Bankruptcy Avoider']
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
            {gameState.gameActive && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setGameState(prev => ({
                    ...prev,
                    money: prev.money + 1000
                  }));
                  toast({
                    title: "Emergency Funds Added",
                    description: "+$1000 for testing purposes"
                  });
                }}
                className="text-xs"
              >
                Add Test Funds
              </Button>
            )}
          </div>
          {!gameState.gameActive && (
            <div className="text-center bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-800 mb-2">Ready to defend against financial attacks?</p>
              <p className="text-xs text-blue-600">Start a game to stack medical bills and survive bankruptcy!</p>
            </div>
          )}
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