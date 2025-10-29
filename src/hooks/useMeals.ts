import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { pt } from "date-fns/locale";

export interface Meal {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal_type: string;
  created_at: string;
}

interface MealsQueryParams {
  activeTab: 'today' | 'history';
  selectedDate: Date;
  dateRange: 'today' | 'week' | 'month' | 'custom';
  customDateStart?: Date;
  customDateEnd?: Date;
}

const fetchMeals = async (params: MealsQueryParams): Promise<Meal[]> => {
  const { activeTab, selectedDate, dateRange, customDateStart, customDateEnd } = params;

  let startDate: Date;
  let endDate: Date;

  if (activeTab === 'today') {
    startDate = startOfDay(new Date());
    endDate = endOfDay(new Date());
  } else {
    // History tab
    if (dateRange === 'today') {
      startDate = startOfDay(selectedDate);
      endDate = endOfDay(selectedDate);
    } else if (dateRange === 'week') {
      startDate = startOfWeek(selectedDate, { locale: pt });
      endDate = endOfWeek(selectedDate, { locale: pt });
    } else if (dateRange === 'month') {
      startDate = startOfMonth(selectedDate);
      endDate = endOfMonth(selectedDate);
    } else if (dateRange === 'custom' && customDateStart && customDateEnd) {
      startDate = startOfDay(customDateStart);
      endDate = endOfDay(customDateEnd);
    } else {
      startDate = startOfDay(selectedDate);
      endDate = endOfDay(selectedDate);
    }
  }

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const useMeals = (params: MealsQueryParams) => {
  return useQuery({
    queryKey: ['meals', params],
    queryFn: () => fetchMeals(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useAddMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMeal: Omit<Meal, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('meals')
        .insert([newMeal])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newMeal) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['meals'] });

      // Snapshot previous value
      const previousMeals = queryClient.getQueriesData({ queryKey: ['meals'] });

      // Optimistically update to show the new meal immediately
      queryClient.setQueriesData<Meal[]>({ queryKey: ['meals'] }, (old = []) => [
        {
          ...newMeal,
          id: 'temp-' + Date.now(),
          created_at: new Date().toISOString(),
        },
        ...old,
      ]);

      return { previousMeals };
    },
    onError: (err, newMeal, context) => {
      // Rollback on error
      if (context?.previousMeals) {
        context.previousMeals.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Erro ao adicionar refeição");
    },
    onSuccess: () => {
      toast.success("Refeição adicionada com sucesso!");
    },
    onSettled: () => {
      // Refetch to ensure data is in sync with server
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });
};

export const useUpdateMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Meal> & { id: string }) => {
      const { data, error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (updatedMeal) => {
      await queryClient.cancelQueries({ queryKey: ['meals'] });

      const previousMeals = queryClient.getQueriesData({ queryKey: ['meals'] });

      // Optimistically update the meal
      queryClient.setQueriesData<Meal[]>({ queryKey: ['meals'] }, (old = []) =>
        old.map(meal =>
          meal.id === updatedMeal.id
            ? { ...meal, ...updatedMeal }
            : meal
        )
      );

      return { previousMeals };
    },
    onError: (err, updatedMeal, context) => {
      if (context?.previousMeals) {
        context.previousMeals.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Erro ao atualizar refeição");
    },
    onSuccess: () => {
      toast.success("Refeição atualizada com sucesso!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });
};

export const useDeleteMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealId: string) => {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);

      if (error) throw error;
      return mealId;
    },
    onMutate: async (mealId) => {
      await queryClient.cancelQueries({ queryKey: ['meals'] });

      const previousMeals = queryClient.getQueriesData({ queryKey: ['meals'] });

      // Optimistically remove the meal
      queryClient.setQueriesData<Meal[]>({ queryKey: ['meals'] }, (old = []) =>
        old.filter(meal => meal.id !== mealId)
      );

      return { previousMeals };
    },
    onError: (err, mealId, context) => {
      if (context?.previousMeals) {
        context.previousMeals.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Erro ao eliminar refeição");
    },
    onSuccess: () => {
      toast.success("Refeição eliminada com sucesso!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });
};
