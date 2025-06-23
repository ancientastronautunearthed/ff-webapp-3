import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Plus,
  Search,
  ThumbsUp,
  Send,
  Clock,
  Users
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  increment, 
  orderBy, 
  query, 
  where,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorId: string;
  timestamp: any;
  likes: number;
  replies: number;
  isAnonymous: boolean;
  tags: string[];
  lastActivity: any;
}

interface ForumReply {
  id: string;
  postId: string;
  content: string;
  author: string;
  authorId: string;
  timestamp: any;
  likes: number;
  isAnonymous: boolean;
}

export const CommunityForum = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateChallengeProgress } = useChallengeProgress();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<{ [postId: string]: ForumReply[] }>({});
  const [showReplies, setShowReplies] = useState<{ [postId: string]: boolean }>({});
  const [replyContent, setReplyContent] = useState<{ [postId: string]: string }>({});
  const [loading, setLoading] = useState(true);

  const categories = [
    'General Discussion',
    'Treatment Discussion',
    'Lifestyle & Diet',
    'Research',
    'Success Stories',
    'Support & Encouragement',
    'Questions & Help'
  ];

  const commonTags = [
    'symptoms',
    'treatment',
    'diet',
    'research',
    'support',
    'success',
    'questions',
    'lifestyle',
    'medications',
    'doctors'
  ];

  // Load posts from Firebase
  useEffect(() => {
    const loadPosts = async () => {
      try {
        // First, add some demo posts if none exist
        const postsSnapshot = await getDocs(collection(db, 'forumPosts'));
        
        if (postsSnapshot.empty && user) {
          // Create some demo posts
          const demoPosts = [
            {
              title: 'New Treatment Protocol - Success Story',
              content: 'I wanted to share my experience with the new protocol my doctor recommended. After 6 months of following a strict diet and supplement routine, I\'ve seen significant improvement in my symptoms. The key was consistent tracking and working closely with my healthcare team.',
              category: 'Treatment Discussion',
              author: 'Sarah M.',
              authorId: 'demo-user-1',
              timestamp: serverTimestamp(),
              lastActivity: serverTimestamp(),
              likes: 23,
              replies: 8,
              isAnonymous: false,
              tags: ['treatment', 'success', 'diet', 'supplements']
            },
            {
              title: 'Dietary Changes That Helped',
              content: 'After months of tracking my symptoms in Fiber Friends, I\'ve noticed certain foods definitely impact my symptoms. Eliminating processed foods and sugar made a huge difference. I wanted to share my experience and see if others have found similar patterns.',
              category: 'Lifestyle & Diet',
              author: 'Anonymous',
              authorId: 'demo-user-2',
              timestamp: serverTimestamp(),
              lastActivity: serverTimestamp(),
              likes: 15,
              replies: 12,
              isAnonymous: true,
              tags: ['diet', 'lifestyle', 'symptoms', 'tracking']
            },
            {
              title: 'Research Participation Experience',
              content: 'I recently participated in a study through the platform and wanted to share what it was like. The process was straightforward and I felt like I was contributing to something important. Has anyone else participated in research studies?',
              category: 'Research',
              author: 'Mike R.',
              authorId: 'demo-user-3',
              timestamp: serverTimestamp(),
              lastActivity: serverTimestamp(),
              likes: 31,
              replies: 6,
              isAnonymous: false,
              tags: ['research', 'participation', 'studies', 'community']
            }
          ];

          for (const post of demoPosts) {
            await addDoc(collection(db, 'forumPosts'), post);
          }
        }

        // Set up real-time listener
        const postsQuery = query(
          collection(db, 'forumPosts'),
          orderBy('lastActivity', 'desc')
        );
        
        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
          const postsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ForumPost[];
          setPosts(postsData);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error loading posts:', error);
        setLoading(false);
      }
    };

    if (user) {
      loadPosts();
    }
  }, [user]);

  // Load replies for a specific post
  const loadReplies = async (postId: string) => {
    try {
      const repliesQuery = query(
        collection(db, 'forumReplies'),
        where('postId', '==', postId),
        orderBy('timestamp', 'asc')
      );
      
      const repliesSnapshot = await getDocs(repliesQuery);
      const repliesData = repliesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ForumReply[];
      
      setReplies(prev => ({
        ...prev,
        [postId]: repliesData
      }));
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const handleNewPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostCategory) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const postData = {
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        category: newPostCategory,
        author: isAnonymous ? 'Anonymous' : (user?.displayName || user?.email?.split('@')[0] || 'User'),
        authorId: user?.uid,
        timestamp: serverTimestamp(),
        lastActivity: serverTimestamp(),
        likes: 0,
        replies: 0,
        isAnonymous,
        tags: newPostTags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await addDoc(collection(db, 'forumPosts'), postData);

      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCategory('');
      setNewPostTags('');
      setIsAnonymous(false);
      setShowNewPostDialog(false);

      toast({
        title: "Success",
        description: "Your post has been shared with the community!",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const postRef = doc(db, 'forumPosts', postId);
      await updateDoc(postRef, {
        likes: increment(1)
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleReply = async (postId: string) => {
    const content = replyContent[postId]?.trim();
    if (!content) return;

    try {
      const replyData = {
        postId,
        content,
        author: isAnonymous ? 'Anonymous' : (user?.displayName || user?.email?.split('@')[0] || 'User'),
        authorId: user?.uid,
        timestamp: serverTimestamp(),
        likes: 0,
        isAnonymous
      };

      await addDoc(collection(db, 'forumReplies'), replyData);

      // Update post reply count and last activity
      const postRef = doc(db, 'forumPosts', postId);
      await updateDoc(postRef, {
        replies: increment(1),
        lastActivity: serverTimestamp()
      });

      setReplyContent(prev => ({ ...prev, [postId]: '' }));
      loadReplies(postId);

      toast({
        title: "Reply Posted",
        description: "Your reply has been added to the discussion.",
      });
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleReplies = (postId: string) => {
    const currentlyShowing = showReplies[postId];
    setShowReplies(prev => ({ ...prev, [postId]: !currentlyShowing }));
    
    if (!currentlyShowing && !replies[postId]) {
      loadReplies(postId);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === 'all' || 
                           post.category.toLowerCase().replace(/\s+/g, '-') === activeTab ||
                           post.category.toLowerCase().includes(activeTab.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Join the Community</h3>
            <p className="text-gray-500 mb-4">Please log in to participate in community discussions</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6" data-tour="community-posts">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-600 mt-2">Connect, share, and support each other</p>
        </div>
        
        <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Post Title *</Label>
                <Input
                  id="title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Enter a descriptive title..."
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share your thoughts, experiences, or questions..."
                  rows={6}
                />
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  placeholder="e.g. symptoms, treatment, diet"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {commonTags.slice(0, 6).map(tag => (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        const currentTags = newPostTags.split(',').map(t => t.trim()).filter(t => t);
                        if (!currentTags.includes(tag)) {
                          setNewPostTags(currentTags.concat(tag).join(', '));
                        }
                      }}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="anonymous">Post anonymously</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewPostDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleNewPost} className="bg-blue-600 hover:bg-blue-700">
                  Create Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="treatment-discussion">Treatment</TabsTrigger>
          <TabsTrigger value="lifestyle-diet">Lifestyle</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="support-encouragement">Support</TabsTrigger>
          <TabsTrigger value="success-stories">Success</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500 mb-4">Be the first to start a conversation in the community!</p>
                <Button onClick={() => setShowNewPostDialog(true)}>
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {post.isAnonymous ? 'A' : (post.author?.charAt(0) || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{post.author}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(post.timestamp)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{post.category}</Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button 
                        onClick={() => toggleReplies(post.id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.replies} {post.replies === 1 ? 'reply' : 'replies'}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Reply Section */}
                  {showReplies[post.id] && (
                    <div className="mt-6 space-y-4 border-t pt-4">
                      {/* Existing Replies */}
                      {replies[post.id]?.map((reply) => (
                        <div key={reply.id} className="flex space-x-3 bg-gray-50 rounded-lg p-4">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {reply.isAnonymous ? 'A' : (reply.author?.charAt(0) || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{reply.author}</span>
                              <span className="text-xs text-gray-500">{formatTimestamp(reply.timestamp)}</span>
                            </div>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Reply Input */}
                      <div className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex space-x-2">
                          <Textarea
                            value={replyContent[post.id] || ''}
                            onChange={(e) => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Write a reply..."
                            rows={2}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => handleReply(post.id)}
                            disabled={!replyContent[post.id]?.trim()}
                            size="sm"
                            className="self-end"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Other category tabs show same posts but filtered */}
        {['treatment-discussion', 'lifestyle-diet', 'research', 'support-encouragement', 'success-stories'].map(category => (
          <TabsContent key={category} value={category} className="space-y-4 mt-6">
            {filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts in this category yet</h3>
                  <p className="text-gray-500 mb-4">Be the first to start a conversation!</p>
                  <Button onClick={() => setShowNewPostDialog(true)}>
                    Create Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {post.isAnonymous ? 'A' : (post.author?.charAt(0) || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{post.author}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(post.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => handleLikePost(post.id)}
                          className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button 
                          onClick={() => toggleReplies(post.id)}
                          className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.replies}</span>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};