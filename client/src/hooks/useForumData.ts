import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getForumPosts, createForumPost, getPostReplies, createForumReply } from '@/lib/firestore';
import { getCurrentUser } from '@/lib/auth';
import type { ForumPost, InsertForumPost, ForumReply, InsertForumReply } from '@shared/schema';

export const useForumPosts = (category?: string) => {
  return useQuery({
    queryKey: ['forumPosts', category],
    queryFn: () => getForumPosts(category),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePostReplies = (postId: string) => {
  return useQuery({
    queryKey: ['forumReplies', postId],
    queryFn: () => getPostReplies(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCreateForumPost = () => {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  return useMutation({
    mutationFn: (data: Omit<InsertForumPost, 'userId'>) => {
      if (!user) throw new Error('User not authenticated');
      return createForumPost(user.uid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    },
  });
};

export const useCreateForumReply = () => {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  return useMutation({
    mutationFn: (data: Omit<InsertForumReply, 'userId'>) => {
      if (!user) throw new Error('User not authenticated');
      return createForumReply(user.uid, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forumReplies', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    },
  });
};