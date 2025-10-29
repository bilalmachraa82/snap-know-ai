import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera, TrendingUp, Flame, Beef, Wheat, Droplets, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AddMealDialog } from "@/components/AddMealDialog";
import { Navigate } from "react-router-dom";

interface Meal {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal_type: string;
  created_at: string;
}

interface UserGoals {
  daily_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<UserGoals>({
    daily_calories: 2000,
    target_protein: 150,
    target_carbs: 250,
    target_fats: 67,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMeals();
      fetchGoals();
    }
  }, [user]);

  const fetchMeals = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const calculateTotals = () => {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fats: acc.fats + (meal.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  const getMealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: 'Pequeno-almoço',
      lunch: 'Almoço',
      dinner: 'Jantar',
      snack: 'Snack',
    };
    return labels[type] || type;
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Flame className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const totals = calculateTotals();
  const calorieProgress = (totals.calories / goals.daily_calories) * 100;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">Cal AI Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, {user.email?.split('@')[0]}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Daily Summary Card */}
        <Card className="glass-card p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Resumo de Hoje</h2>
              <p className="text-muted-foreground text-sm">
                {new Date().toLocaleDateString("pt-PT", { 
                  weekday: "long", 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </p>
            </div>
            <Button variant="hero" size="lg" onClick={() => setDialogOpen(true)}>
              <Camera className="mr-2 h-5 w-5" />
              Adicionar Refeição
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary mb-2">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-primary">{totals.calories}</p>
              <p className="text-sm text-muted-foreground">de {goals.daily_calories} kcal</p>
              <Progress value={calorieProgress} className="h-2" />
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-light/30 mb-2">
                <Beef className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold">{totals.protein.toFixed(0)}g</p>
              <p className="text-sm text-muted-foreground">de {goals.target_protein}g Proteína</p>
              <Progress value={(totals.protein / goals.target_protein) * 100} className="h-2" />
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-warning/20 mb-2">
                <Wheat className="h-6 w-6 text-warning" />
              </div>
              <p className="text-3xl font-bold">{totals.carbs.toFixed(0)}g</p>
              <p className="text-sm text-muted-foreground">de {goals.target_carbs}g Carbs</p>
              <Progress value={(totals.carbs / goals.target_carbs) * 100} className="h-2" />
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-info/20 mb-2">
                <Droplets className="h-6 w-6 text-info" />
              </div>
              <p className="text-3xl font-bold">{totals.fats.toFixed(0)}g</p>
              <p className="text-sm text-muted-foreground">de {goals.target_fats}g Gordura</p>
              <Progress value={(totals.fats / goals.target_fats) * 100} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Recent Meals */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Refeições de Hoje</h2>
            <Button variant="ghost" size="sm">
              Ver Todas <TrendingUp className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {meals.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma refeição registada hoje</h3>
              <p className="text-muted-foreground mb-6">
                Começa a fazer tracking das tuas refeições com IA
              </p>
              <Button variant="hero" onClick={() => setDialogOpen(true)}>
                <Camera className="mr-2 h-5 w-5" />
                Adicionar Primeira Refeição
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {meals.map((meal) => (
                <Card key={meal.id} className="glass-card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                          {formatTime(meal.created_at)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {getMealTypeLabel(meal.meal_type)}: {meal.food_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            P: {meal.protein?.toFixed(0) || 0}g • C: {meal.carbs?.toFixed(0) || 0}g • G: {meal.fats?.toFixed(0) || 0}g
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{meal.calories}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddMealDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onMealAdded={fetchMeals}
      />
    </div>
  );
};

export default Dashboard;
