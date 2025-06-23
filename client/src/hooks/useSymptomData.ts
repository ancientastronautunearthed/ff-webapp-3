import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserSymptomEntries, createSymptomEntry } from '@/lib/firestore';
import { getCurrentUser } from '@/lib/auth';
import type { SymptomEntry, InsertSymptomEntry } from '@shared/schema';

export const useSymptomEntries = () => {
  const user = getCurrentUser();
  
  return useQuery({
    queryKey: ['symptomEntries', user?.uid],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated');
      return getUserSymptomEntries(user.uid);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateSymptomEntry = () => {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  return useMutation({
    mutationFn: (data: Omit<InsertSymptomEntry, 'userId'>) => {
      if (!user) throw new Error('User not authenticated');
      return createSymptomEntry(user.uid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptomEntries', user?.uid] });
    },
  });
};