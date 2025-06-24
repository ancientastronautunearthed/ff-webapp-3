import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Puzzle, 
  Users, 
  Heart, 
  Trophy, 
  Star, 
  MessageCircle,
  HandHeart,
  CheckCircle,
  Lock,
  Sparkles
} from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PuzzlePiece {
  id: string;
  type: 'forum_post' | 'forum_reply' | 'peer_connection' | 'helpful_vote' | 'support_message' | 'encouragement';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  points: number;
  unlocked: boolean;
  completedAt?: Date;
}

interface PuzzleProgress {
  currentPuzzle: string;
  completedPieces: string[];
  totalProgress: number;
  unlockedImages: string[];
  lastActivity: Date;
  communityScore: number;
}

const PUZZLE_IMAGES = [
  {
    id: 'hope_sunrise',
    title: 'Dawn of Hope',
    description: 'A beautiful sunrise representing new beginnings and hope',
    pieces: 12,
    imageUrl: '/puzzle-images/hope-sunrise.jpg'
  },
  {
    id: 'healing_garden',
    title: 'Healing Garden',
    description: 'A peaceful garden symbolizing growth and healing',
    pieces: 16,
    imageUrl: '/puzzle-images/healing-garden.jpg'
  },
  {
    id: 'community_tree',
    title: 'Community Tree',
    description: 'A strong tree with intertwined roots representing community support',
    pieces: 20,
    imageUrl: '/puzzle-images/community-tree.jpg'
  },
  {
    id: 'strength_mountain',
    title: 'Mountain of Strength',
    description: 'Majestic mountains representing inner strength and perseverance',
    pieces: 24,
    imageUrl: '/puzzle-images/strength-mountain.jpg'
  }
];

const PUZZLE_PIECES: PuzzlePiece[] = [
  {
    id: 'first_post',
    type: 'forum_post',
    title: 'Share Your Story',
    description: 'Create your first forum post to share your experience',
    icon: <MessageCircle className="w-4 h-4" />,
    color: 'bg-blue-500',
    points: 10,
    unlocked: false
  },
  {
    id: 'help_others',
    type: 'forum_reply',
    title: 'Help Others',
    description: 'Reply to someone else\'s post with helpful advice',
    icon: <HandHeart className="w-4 h-4" />,
    color: 'bg-green-500',
    points: 15,
    unlocked: false
  },
  {
    id: 'peer_match',
    type: 'peer_connection',
    title: 'Make a Connection',
    description: 'Connect with a peer through the matching system',
    icon: <Users className="w-4 h-4" />,
    color: 'bg-purple-500',
    points: 20,
    unlocked: false
  },
  {
    id: 'vote_helpful',
    type: 'helpful_vote',
    title: 'Recognize Helpfulness',
    description: 'Vote on helpful posts to support quality content',
    icon: <Star className="w-4 h-4" />,
    color: 'bg-yellow-500',
    points: 5,
    unlocked: false
  },
  {
    id: 'support_message',
    type: 'support_message',
    title: 'Send Support',
    description: 'Send a private message of support to someone',
    icon: <Heart className="w-4 h-4" />,
    color: 'bg-pink-500',
    points: 12,
    unlocked: false
  },
  {
    id: 'encouragement',
    type: 'encouragement',
    title: 'Spread Encouragement',
    description: 'Leave encouraging comments on multiple posts',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'bg-orange-500',
    points: 8,
    unlocked: false
  },
  {
    id: 'daily_check',
    type: 'forum_post',
    title: 'Daily Check-in',
    description: 'Share a daily update or check-in with the community',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'bg-indigo-500',
    points: 6,
    unlocked: false
  },
  {
    id: 'mentor_help',
    type: 'forum_reply',
    title: 'Mentor Someone',
    description: 'Provide detailed guidance to someone new to the community',
    icon: <Trophy className="w-4 h-4" />,
    color: 'bg-red-500',
    points: 25,
    unlocked: false
  }
];

export const CommunityConnectionPuzzle: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [puzzleProgress, setPuzzleProgress] = useState<PuzzleProgress | null>(null);
  const [currentPuzzleImage, setCurrentPuzzleImage] = useState(PUZZLE_IMAGES[0]);
  const [pieces, setPieces] = useState<PuzzlePiece[]>(PUZZLE_PIECES);
  const [loading, setLoading] = useState(true);
  const [completedPiecesToday, setCompletedPiecesToday] = useState(0);

  const loadPuzzleProgress = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const progress = userData.puzzleProgress || {
          currentPuzzle: 'hope_sunrise',
          completedPieces: [],
          totalProgress: 0,
          unlockedImages: [],
          lastActivity: new Date(),
          communityScore: 0
        };
        
        setPuzzleProgress(progress);
        
        // Find current puzzle image
        const currentImage = PUZZLE_IMAGES.find(img => img.id === progress.currentPuzzle) || PUZZLE_IMAGES[0];
        setCurrentPuzzleImage(currentImage);
        
        // Update pieces based on progress
        const updatedPieces = pieces.map(piece => ({
          ...piece,
          unlocked: progress.completedPieces.includes(piece.id)
        }));
        setPieces(updatedPieces);
        
        // Check how many pieces completed today
        const today = new Date().toDateString();
        const todayCount = progress.completedPieces.filter((pieceId: string) => {
          const piece = PUZZLE_PIECES.find(p => p.id === pieceId);
          return piece?.completedAt && new Date(piece.completedAt).toDateString() === today;
        }).length;
        setCompletedPiecesToday(todayCount);
      }
    } catch (error) {
      console.error('Error loading puzzle progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, pieces]);

  const checkCommunityActivity = useCallback(async () => {
    if (!user?.uid || !puzzleProgress) return;

    try {
      // Check forum posts
      const postsQuery = query(
        collection(db, 'forumPosts'),
        where('authorId', '==', user.uid)
      );
      const postsSnapshot = await getDocs(postsQuery);
      
      // Check forum replies  
      const repliesQuery = query(
        collection(db, 'forumReplies'),
        where('authorId', '==', user.uid)
      );
      const repliesSnapshot = await getDocs(repliesQuery);

      // Check peer connections
      const connectionsQuery = query(
        collection(db, 'peerConnections'),
        where('userId', '==', user.uid)
      );
      const connectionsSnapshot = await getDocs(connectionsQuery);

      const newlyUnlocked: string[] = [];
      const updatedPieces = pieces.map(piece => {
        let shouldUnlock = false;
        
        switch (piece.type) {
          case 'forum_post':
            if (piece.id === 'first_post' && postsSnapshot.size >= 1) shouldUnlock = true;
            if (piece.id === 'daily_check' && postsSnapshot.size >= 3) shouldUnlock = true;
            break;
          case 'forum_reply':
            if (piece.id === 'help_others' && repliesSnapshot.size >= 1) shouldUnlock = true;
            if (piece.id === 'mentor_help' && repliesSnapshot.size >= 5) shouldUnlock = true;
            break;
          case 'peer_connection':
            if (connectionsSnapshot.size >= 1) shouldUnlock = true;
            break;
          case 'helpful_vote':
            // This would need additional tracking in the forum system
            if (Math.random() > 0.7) shouldUnlock = true; // Placeholder logic
            break;
        }
        
        if (shouldUnlock && !piece.unlocked && !puzzleProgress.completedPieces.includes(piece.id)) {
          newlyUnlocked.push(piece.id);
          return { ...piece, unlocked: true, completedAt: new Date() };
        }
        
        return piece;
      });

      if (newlyUnlocked.length > 0) {
        setPieces(updatedPieces);
        
        const updatedProgress = {
          ...puzzleProgress,
          completedPieces: [...puzzleProgress.completedPieces, ...newlyUnlocked],
          totalProgress: puzzleProgress.totalProgress + newlyUnlocked.length,
          communityScore: puzzleProgress.communityScore + newlyUnlocked.reduce((sum, pieceId) => {
            const piece = PUZZLE_PIECES.find(p => p.id === pieceId);
            return sum + (piece?.points || 0);
          }, 0),
          lastActivity: new Date()
        };

        await updateDoc(doc(db, 'users', user.uid), {
          puzzleProgress: updatedProgress
        });

        setPuzzleProgress(updatedProgress);
        setCompletedPiecesToday(prev => prev + newlyUnlocked.length);

        toast({
          title: "Puzzle Pieces Unlocked!",
          description: `You unlocked ${newlyUnlocked.length} new puzzle piece${newlyUnlocked.length > 1 ? 's' : ''} through community engagement!`
        });
      }
    } catch (error) {
      console.error('Error checking community activity:', error);
    }
  }, [user?.uid, puzzleProgress, pieces, toast]);

  useEffect(() => {
    loadPuzzleProgress();
  }, [loadPuzzleProgress]);

  useEffect(() => {
    if (puzzleProgress) {
      checkCommunityActivity();
    }
  }, [checkCommunityActivity]);

  const getProgressPercentage = () => {
    if (!puzzleProgress) return 0;
    return (puzzleProgress.completedPieces.length / currentPuzzleImage.pieces) * 100;
  };

  const moveToNextPuzzle = async () => {
    if (!user?.uid || !puzzleProgress) return;

    const currentIndex = PUZZLE_IMAGES.findIndex(img => img.id === puzzleProgress.currentPuzzle);
    const nextIndex = Math.min(currentIndex + 1, PUZZLE_IMAGES.length - 1);
    const nextPuzzle = PUZZLE_IMAGES[nextIndex];

    const updatedProgress = {
      ...puzzleProgress,
      currentPuzzle: nextPuzzle.id,
      unlockedImages: [...puzzleProgress.unlockedImages, puzzleProgress.currentPuzzle],
      completedPieces: [], // Reset for new puzzle
      totalProgress: 0
    };

    await updateDoc(doc(db, 'users', user.uid), {
      puzzleProgress: updatedProgress
    });

    setPuzzleProgress(updatedProgress);
    setCurrentPuzzleImage(nextPuzzle);
    
    // Reset pieces for new puzzle
    setPieces(PUZZLE_PIECES.map(piece => ({ ...piece, unlocked: false })));

    toast({
      title: "Puzzle Completed!",
      description: `Congratulations! You've unlocked "${nextPuzzle.title}" - keep building community connections!`
    });
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  const isPuzzleComplete = puzzleProgress && puzzleProgress.completedPieces.length >= currentPuzzleImage.pieces;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Puzzle className="h-6 w-6 text-blue-600" />
          Community Connection Puzzle
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Build community connections to unlock puzzle pieces</p>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            {puzzleProgress?.communityScore || 0} points
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Puzzle Progress */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">{currentPuzzleImage.title}</h3>
            <span className="text-sm text-gray-600">
              {puzzleProgress?.completedPieces.length || 0}/{currentPuzzleImage.pieces} pieces
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{currentPuzzleImage.description}</p>
          <Progress value={getProgressPercentage()} className="h-2" />
          
          {isPuzzleComplete && (
            <div className="mt-4 text-center">
              <Button onClick={moveToNextPuzzle} className="bg-gradient-to-r from-green-500 to-blue-500">
                <Star className="w-4 h-4 mr-2" />
                Complete Puzzle & Unlock Next
              </Button>
            </div>
          )}
        </div>

        {/* Daily Progress */}
        <div className="flex items-center justify-between bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Today's Progress</span>
          </div>
          <Badge variant="outline" className="text-yellow-700 border-yellow-300">
            {completedPiecesToday} pieces unlocked today
          </Badge>
        </div>

        {/* Puzzle Pieces Grid */}
        <div className="grid grid-cols-2 gap-3">
          {pieces.map((piece) => (
            <div
              key={piece.id}
              className={`border rounded-lg p-3 transition-all duration-300 ${
                piece.unlocked
                  ? `${piece.color} text-white shadow-md transform scale-105`
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-1 rounded ${piece.unlocked ? 'bg-white bg-opacity-20' : 'bg-gray-200'}`}>
                  {piece.unlocked ? piece.icon : <Lock className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="text-right">
                  <div className={`text-xs ${piece.unlocked ? 'text-white' : 'text-gray-500'}`}>
                    +{piece.points} pts
                  </div>
                  {piece.unlocked && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              <h4 className={`font-medium text-sm ${piece.unlocked ? 'text-white' : 'text-gray-700'}`}>
                {piece.title}
              </h4>
              <p className={`text-xs mt-1 ${piece.unlocked ? 'text-white text-opacity-90' : 'text-gray-500'}`}>
                {piece.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Unlock More Pieces</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/community'}
              className="border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <MessageCircle className="w-3 h-3 mr-2" />
              Visit Forum
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/peer-matching'}
              className="border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Users className="w-3 h-3 mr-2" />
              Find Peers
            </Button>
          </div>
        </div>

        {/* Completed Puzzles Gallery */}
        {puzzleProgress && puzzleProgress.unlockedImages.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Your Completed Puzzles</h4>
            <div className="grid grid-cols-3 gap-2">
              {puzzleProgress.unlockedImages.map((imageId) => {
                const image = PUZZLE_IMAGES.find(img => img.id === imageId);
                return image ? (
                  <div key={imageId} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center mb-1">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-xs text-gray-600">{image.title}</p>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};