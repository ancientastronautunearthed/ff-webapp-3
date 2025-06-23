import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MessageCircle, Shield, Search, Clock, ChevronRight, Heart, UserCheck, AlertTriangle, Plus } from 'lucide-react';
import { useForumPosts, useCreateForumPost } from '@/hooks/useForumData';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

// Mock data for forum categories
const forumCategories = [
  {
    id: 'itching-sensations',
    title: 'Coping with Itching & Sensations',
    description: 'Share strategies, remedies, and support for managing skin symptoms',
    postCount: 248,
    lastPost: {
      author: 'SarahM',
      time: '2 hours ago'
    },
    icon: '🤚',
    color: 'bg-primary-50 border-primary-200 text-primary-800'
  },
  {
    id: 'doctor-communication',
    title: 'Tips for Talking to Doctors',
    description: 'Navigate healthcare conversations and advocate for yourself effectively',
    postCount: 156,
    lastPost: {
      author: 'DrAdvocate',
      time: '5 hours ago'
    },
    icon: '🩺',
    color: 'bg-secondary-50 border-secondary-200 text-secondary-800'
  },
  {
    id: 'brain-fog',
    title: 'Managing Brain Fog & Fatigue',
    description: 'Cognitive symptoms, memory issues, and energy management strategies',
    postCount: 192,
    lastPost: {
      author: 'ClearMind',
      time: '1 day ago'
    },
    icon: '🧠',
    color: 'bg-purple-50 border-purple-200 text-purple-800'
  },
  {
    id: 'support-venting',
    title: 'General Support & Venting Space',
    description: 'A safe space to share feelings, frustrations, and find emotional support',
    postCount: 421,
    lastPost: {
      author: 'HopeSeeker',
      time: '30 minutes ago'
    },
    icon: '❤️',
    color: 'bg-red-50 border-red-200 text-red-800'
  },
];

// Mock data for active members
const activeMembers = [
  { name: 'SarahM', initial: 'S', lastActive: '2h ago', color: 'bg-primary-500' },
  { name: 'DrAdvocate', initial: 'D', lastActive: '5h ago', color: 'bg-secondary-500' },
  { name: 'HopeSeeker', initial: 'H', lastActive: '30m ago', color: 'bg-purple-500' },
  { name: 'ClearMind', initial: 'C', lastActive: '1d ago', color: 'bg-blue-500' },
];

export const Community = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // TODO: Navigate to category posts or implement category view
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Community Support Hub</h1>
        <p className="text-xl text-gray-600 mt-4">Connect with others who understand your journey</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Forum Area */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Discussion Forums</h2>
            <Button className="bg-primary-500 hover:bg-primary-600">
              <MessageCircle className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>

          <div className="space-y-4">
            {forumCategories.map((category) => (
              <Card 
                key={category.id} 
                className="hover:shadow-md transition-all duration-200 cursor-pointer border-l-4"
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${category.color} px-3 py-1 text-sm font-medium mb-2`}>
                        {category.postCount} posts
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Last post: {category.lastPost.time} by {category.lastPost.author}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                      View Forum
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Community Stats */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">1,247</div>
                <div className="text-sm text-gray-600">Active Members</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-8 w-8 text-secondary-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">3,421</div>
                <div className="text-sm text-gray-600">Total Posts</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">8,756</div>
                <div className="text-sm text-gray-600">Support Given</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="mr-2 h-5 w-5 text-green-500" />
                Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Be respectful and supportive
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  No medical advice or "cures"
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  No sales or promotional content
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Protect personal information
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Report inappropriate content
                </li>
              </ul>
              <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 mt-3 w-full">
                Read Full Guidelines
              </Button>
            </CardContent>
          </Card>

          {/* Peer Matching */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="mr-2 h-5 w-5 text-blue-500" />
                Find Your Peers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Connect with others who share similar symptoms or experiences
              </p>
              <Button className="w-full bg-primary-500 hover:bg-primary-600">
                <Search className="mr-2 h-4 w-4" />
                Find Peer Matches
              </Button>
            </CardContent>
          </Card>

          {/* Active Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeMembers.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`${member.color} text-white text-sm font-bold`}>
                        {member.initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">Active {member.lastActive}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <Button variant="ghost" size="sm" className="w-full text-primary-600 hover:text-primary-700">
                View All Members
              </Button>
            </CardContent>
          </Card>

          {/* Moderation Notice */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 text-sm">Moderated Community</h4>
                  <p className="text-yellow-700 text-xs mt-1">
                    All posts are reviewed to ensure a safe, supportive environment. 
                    Report any content that violates our guidelines.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="mr-2 h-4 w-4" />
                Start New Discussion
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <UserCheck className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Report Content
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
