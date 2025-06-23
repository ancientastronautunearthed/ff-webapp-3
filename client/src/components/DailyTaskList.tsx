import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Zap,
  Heart,
  Brain,
  Users,
  Calendar,
  FileText,
  Star,
  Award,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DailyTask {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'community' | 'data' | 'wellness';
  points: number;
  estimatedTime: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  icon: any;
  href?: string;
  action?: () => void;
}

interface TaskCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  tasks: DailyTask[];
  completedCount: number;
  totalCount: number;
}

export const DailyTaskList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      loadDailyTasks();
    }
  }, [user]);

  useEffect(() => {
    if (categories.length > 0) {
      calculateProgress();
    }
  }, [categories]);

  const loadDailyTasks = async () => {
    if (!user) return;
    
    const today = new Date().toDateString();
    let completedTasks: string[] = [];
    
    try {
      // Load completed tasks from Firebase
      const userTasksDoc = await getDoc(doc(db, 'userTasks', `${user.uid}_${today}`));
      completedTasks = userTasksDoc.exists() ? userTasksDoc.data().completedTasks || [] : [];
    } catch (error) {
      console.error('Error loading completed tasks:', error);
      completedTasks = [];
    }
    
    // Always provide default tasks - 7 key activities for new users
    const taskCategories: TaskCategory[] = [
      {
        id: 'health',
        name: 'Health Tracking',
        icon: Heart,
        color: 'bg-red-500',
        tasks: [
          {
            id: 'daily_checkin',
            title: 'Complete Daily Check-in',
            description: 'Answer adaptive health questions and track wellbeing',
            category: 'health',
            points: 25,
            estimatedTime: '3 min',
            completed: completedTasks.includes('daily_checkin'),
            priority: 'high',
            icon: CheckCircle2,
            action: () => scrollToElement('daily-checkin')
          },
          {
            id: 'track_symptoms',
            title: 'Log Today\'s Symptoms',
            description: 'Record current symptoms, severity, and triggers',
            category: 'health',
            points: 20,
            estimatedTime: '5 min',
            completed: completedTasks.includes('track_symptoms'),
            priority: 'high',
            icon: Target,
            href: '/tracker'
          }
        ],
        completedCount: 0,
        totalCount: 0
      },
      {
        id: 'community',
        name: 'Community Support',
        icon: Users,
        color: 'bg-green-500',
        tasks: [
          {
            id: 'journal_entry',
            title: 'Add Digital Matchbox Entry',
            description: 'Document today\'s observations with photos if needed',
            category: 'community',
            points: 15,
            estimatedTime: '5 min',
            completed: completedTasks.includes('journal_entry'),
            priority: 'high',
            icon: FileText,
            href: '/journal'
          },
          {
            id: 'help_someone',
            title: 'Support a Community Member',
            description: 'Reply to a question or offer encouragement in the forum',
            category: 'community',
            points: 15,
            estimatedTime: '5 min',
            completed: completedTasks.includes('help_someone'),
            priority: 'medium',
            icon: Heart,
            href: '/community'
          }
        ],
        completedCount: 0,
        totalCount: 0
      },
      {
        id: 'data',
        name: 'Research & Insights',
        icon: Brain,
        color: 'bg-blue-500',
        tasks: [
          {
            id: 'review_insights',
            title: 'Review AI Health Insights',
            description: 'Check personalized health predictions and pattern analysis',
            category: 'data',
            points: 10,
            estimatedTime: '3 min',
            completed: completedTasks.includes('review_insights'),
            priority: 'medium',
            icon: Brain,
            action: () => scrollToElement('ai-insights')
          },
          {
            id: 'view_progress',
            title: 'Check Your Data Trends',
            description: 'Review weekly symptom patterns and improvements',
            category: 'data',
            points: 10,
            estimatedTime: '3 min',
            completed: completedTasks.includes('view_progress'),
            priority: 'medium',
            icon: TrendingUp,
            href: '/insights'
          }
        ],
        completedCount: 0,
        totalCount: 0
      },
      {
        id: 'wellness',
        name: 'Personal Wellness',
        icon: Zap,
        color: 'bg-purple-500',
        tasks: [
          {
            id: 'peer_connections',
            title: 'Connect with Peers',
            description: 'Review peer matches and send connection requests',
            category: 'wellness',
            points: 15,
            estimatedTime: '5 min',
            completed: completedTasks.includes('peer_connections'),
            priority: 'medium',
            icon: Users,
            href: '/peer-matching'
          },
          {
            id: 'mindfulness',
            title: 'Practice 5-Minute Mindfulness',
            description: 'Take a moment for breathing exercise or meditation',
            category: 'wellness',
            points: 10,
            estimatedTime: '5 min',
            completed: completedTasks.includes('mindfulness'),
            priority: 'medium',
            icon: Zap,
            action: () => startMindfulnessTimer()
          },
          {
            id: 'plan_tomorrow',
            title: 'Set Tomorrow\'s Intention',
            description: 'Plan one wellness goal for tomorrow',
            category: 'wellness',
            points: 5,
            estimatedTime: '2 min',
            completed: completedTasks.includes('plan_tomorrow'),
            priority: 'low',
            icon: Calendar,
            action: () => openPlanningModal()
          }
        ],
        completedCount: 0,
        totalCount: 0
      }
    ];

    // Calculate completion counts for each category
    taskCategories.forEach(category => {
      category.completedCount = category.tasks.filter(task => task.completed).length;
      category.totalCount = category.tasks.length;
    });

    setCategories(taskCategories);
  };

  const calculateProgress = async () => {
    if (!user) return;
    
    const allTasks = categories.flatMap(cat => cat.tasks);
    const completedTasks = allTasks.filter(task => task.completed);
    const progress = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
    const points = completedTasks.reduce((sum, task) => sum + task.points, 0);
    
    setTotalProgress(progress);
    setTotalPoints(points);
    
    try {
      // Load streak from Firebase
      const streakDoc = await getDoc(doc(db, 'userStreaks', `${user.uid}_daily_logging`));
      const currentStreak = streakDoc.exists() ? streakDoc.data().current || 0 : 0;
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error loading streak:', error);
      setStreak(0);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!user) return;
    
    const today = new Date().toDateString();
    
    try {
      // Get current completed tasks from Firebase
      const userTasksDoc = await getDoc(doc(db, 'userTasks', `${user.uid}_${today}`));
      const completedTasks = userTasksDoc.exists() ? userTasksDoc.data().completedTasks || [] : [];
      
      const newCompletedTasks = completedTasks.includes(taskId)
        ? completedTasks.filter((id: string) => id !== taskId)
        : [...completedTasks, taskId];
      
      // Update Firebase
      await setDoc(doc(db, 'userTasks', `${user.uid}_${today}`), {
        userId: user.uid,
        date: today,
        completedTasks: newCompletedTasks,
        lastUpdated: new Date()
      });
    
      // Update local state immediately for responsiveness
      setCategories(prevCategories => prevCategories.map(category => ({
        ...category,
        tasks: category.tasks.map(task => ({
          ...task,
          completed: newCompletedTasks.includes(task.id)
        })),
        completedCount: category.tasks.filter(task => newCompletedTasks.includes(task.id)).length
      })));
    
      // Award points if completing task
      if (!completedTasks.includes(taskId)) {
        const task = categories.flatMap(cat => cat.tasks).find(t => t.id === taskId);
        if (task) {
          // Update user progress in Firebase
          const userProgressDoc = await getDoc(doc(db, 'userProgress', user.uid));
          const currentPoints = userProgressDoc.exists() ? userProgressDoc.data().totalPoints || 0 : 0;
          const newTotal = currentPoints + task.points;
          const newLevel = Math.floor(newTotal / 200) + 1;
          const newProgressToNext = newTotal % 200;
          
          await updateDoc(doc(db, 'userProgress', user.uid), {
            totalPoints: newTotal,
            level: newLevel,
            progressToNext: newProgressToNext,
            lastUpdated: new Date()
          });
          
          // Log task completion
          await addDoc(collection(db, 'taskCompletions'), {
            userId: user.uid,
            taskId: taskId,
            taskTitle: task.title,
            pointsEarned: task.points,
            completedAt: new Date(),
            date: today
          });
          
          toast({
            title: "Task Completed!",
            description: `Great job! You earned ${task.points} points for "${task.title}"`
          });
        }
      }
      
      calculateProgress();
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "Error",
        description: "Unable to update task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const startMindfulnessTimer = () => {
    toast({
      title: "Mindfulness Practice",
      description: "Take 5 deep breaths. Focus on the present moment."
    });
    
    setTimeout(() => {
      toggleTask('mindfulness');
    }, 5000);
  };

  const openGratitudeModal = async () => {
    const gratitudeItems = prompt("What are 3 things you're grateful for today? (separate with commas):");
    if (gratitudeItems && user) {
      try {
        await setDoc(doc(db, 'gratitudeEntries', `${user.uid}_${new Date().toDateString()}`), {
          userId: user.uid,
          items: gratitudeItems,
          date: new Date().toDateString(),
          createdAt: new Date()
        });
        toggleTask('gratitude');
      } catch (error) {
        console.error('Error saving gratitude:', error);
      }
    }
  };

  const openPlanningModal = async () => {
    const tomorrowPlan = prompt("What's one wellness goal for tomorrow?");
    if (tomorrowPlan && user) {
      try {
        await setDoc(doc(db, 'wellnessPlans', `${user.uid}_${new Date().toDateString()}`), {
          userId: user.uid,
          plan: tomorrowPlan,
          date: new Date().toDateString(),
          createdAt: new Date()
        });
        toggleTask('plan_tomorrow');
      } catch (error) {
        console.error('Error saving wellness plan:', error);
      }
    }
  };

  const handleTaskClick = (task: DailyTask) => {
    if (task.action && typeof task.action === 'function') {
      task.action();
    } else if (task.href) {
      window.location.href = task.href;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Daily Task List
          <Badge variant="secondary" className="ml-auto">
            {Math.round(totalProgress)}% complete
          </Badge>
        </CardTitle>
        <div className="space-y-2">
          <Progress value={totalProgress} className="h-2" />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{totalPoints} points earned today</span>
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              {streak} day streak
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Loading your daily tasks...</p>
          </div>
        ) : categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${category.color} text-white`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <h4 className="font-medium text-sm">{category.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {category.completedCount}/{category.totalCount}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {category.tasks.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No tasks in this category today
                  </div>
                ) : category.tasks.map((task) => {
                  const TaskIcon = task.icon;
                  const TaskComponent = task.href ? Link : 'div';
                  const taskProps = task.href ? { href: task.href } : {};
                  
                  return (
                    <TaskComponent key={task.id} {...taskProps}>
                      <div 
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          task.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        } ${task.href ? 'cursor-pointer' : ''}`}
                        onClick={(e) => {
                          // Don't trigger if clicking checkbox
                          if ((e.target as HTMLElement).closest('button[role="checkbox"]')) return;
                          
                          if (task.href) {
                            window.location.href = task.href;
                          } else if (task.action) {
                            handleTaskClick(task);
                          }
                        }}
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="flex-shrink-0"
                        />
                        
                        <TaskIcon className={`h-4 w-4 flex-shrink-0 ${
                          task.completed ? 'text-green-600' : 'text-gray-500'
                        }`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              task.completed ? 'text-green-900 line-through' : 'text-gray-900'
                            }`}>
                              {task.title}
                            </span>
                            <Badge 
                              variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{task.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-blue-600">+{task.points} points</span>
                            <span className="text-xs text-gray-500">• {task.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                    </TaskComponent>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {totalProgress === 100 && (
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-lg text-center">
            <Award className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-bold">All Tasks Complete!</h3>
            <p className="text-sm">Amazing work today! You've earned {totalPoints} points.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};