import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/lib/firestore';
import { getCurrentUser } from '@/lib/auth';
import type { JournalEntry, InsertJournalEntry } from '@shared/schema';

export const useJournalEntries = () => {
  const user = getCurrentUser();
  
  return useQuery({
    queryKey: ['journalEntries', user?.uid],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated');
      return getUserJournalEntries(user.uid);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  return useMutation({
    mutationFn: (data: Omit<InsertJournalEntry, 'userId'>) => {
      if (!user) throw new Error('User not authenticated');
      return createJournalEntry(user.uid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries', user?.uid] });
    },
  });
};

export const useUpdateJournalEntry = () => {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  return useMutation({
    mutationFn: ({ entryId, updates }: { entryId: string; updates: Partial<JournalEntry> }) => {
      return updateJournalEntry(entryId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries', user?.uid] });
    },
  });
};

export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  return useMutation({
    mutationFn: (entryId: string) => {
      return deleteJournalEntry(entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries', user?.uid] });
    },
  });
};