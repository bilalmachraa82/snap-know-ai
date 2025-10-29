import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserGoals {
  id?: string;
  user_id?: string;
  daily_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
  created_at?: string;
  updated_at?: string;
}

const fetchGoals = async (userId: string | undefined): Promise<UserGoals> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  // Return default goals if no goals are set
  if (!data) {
    return {
      daily_calories: 2000,
      target_protein: 150,
      target_carbs: 250,
      target_fats: 67,
    };
  }

  return data;
};

export const useGoals = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['goals', userId],
    queryFn: () => fetchGoals(userId),
    staleTime: 1000 * 60 * 10, // 10 minutes - goals change less frequently
    refetchOnWindowFocus: false, // Don't refetch on window focus for goals
    enabled: !!userId, // Only run query if userId exists
  });
};

export const useUpdateGoals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, goals }: { userId: string; goals: Omit<UserGoals, 'id' | 'user_id' | 'created_at' | 'updated_at'> }) => {
      // First check if goals exist
      const { data: existing } = await supabase
        .from('user_goals')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing goals
        result = await supabase
          .from('user_goals')
          .update(goals)
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        // Insert new goals
        result = await supabase
          .from('user_goals')
          .insert([{ ...goals, user_id: userId }])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return result.data;
    },
    onMutate: async ({ userId, goals }) => {
      await queryClient.cancelQueries({ queryKey: ['goals', userId] });

      const previousGoals = queryClient.getQueryData(['goals', userId]);

      // Optimistically update goals
      queryClient.setQueryData(['goals', userId], (old: UserGoals | undefined) => ({
        ...old,
        ...goals,
      }));

      return { previousGoals, userId };
    },
    onError: (err, variables, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(['goals', context.userId], context.previousGoals);
      }
      toast.error("Erro ao atualizar objetivos");
    },
    onSuccess: (data, variables) => {
      toast.success("Objetivos atualizados com sucesso!");
      // Also invalidate meals since goals affect the UI display
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals', variables.userId] });
    },
  });
};
