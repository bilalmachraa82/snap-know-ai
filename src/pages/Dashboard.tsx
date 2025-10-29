import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera, TrendingUp, Flame, Beef, Wheat, Droplets } from "lucide-react";

const Dashboard = () => {
  // Mock data for demonstration
  const dailyGoal = 2000;
  const currentCalories = 1245;
  const progress = (currentCalories / dailyGoal) * 100;

  const macros = {
    protein: { current: 85, goal: 150, unit: "g" },
    carbs: { current: 120, goal: 250, unit: "g" },
    fats: { current: 42, goal: 67, unit: "g" },
  };

  const recentMeals = [
    {
      id: 1,
      name: "Pequeno-almoço: Ovos com torrada",
      calories: 420,
      protein: 28,
      carbs: 35,
      fats: 18,
      time: "08:30",
    },
    {
      id: 2,
      name: "Almoço: Frango grelhado com arroz",
      calories: 650,
      protein: 45,
      carbs: 65,
      fats: 15,
      time: "13:00",
    },
    {
      id: 3,
      name: "Snack: Iogurte grego com fruta",
      calories: 175,
      protein: 12,
      carbs: 20,
      fats: 9,
      time: "16:15",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">Cal AI Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Histórico</Button>
            <Button variant="ghost" size="sm">Perfil</Button>
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
            <Button variant="hero" size="lg">
              <Camera className="mr-2 h-5 w-5" />
              Adicionar Refeição
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary mb-2">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-primary">{currentCalories}</p>
              <p className="text-sm text-muted-foreground">de {dailyGoal} kcal</p>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-light/30 mb-2">
                <Beef className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold">{macros.protein.current}{macros.protein.unit}</p>
              <p className="text-sm text-muted-foreground">de {macros.protein.goal}g Proteína</p>
              <Progress value={(macros.protein.current / macros.protein.goal) * 100} className="h-2" />
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-warning/20 mb-2">
                <Wheat className="h-6 w-6 text-warning" />
              </div>
              <p className="text-3xl font-bold">{macros.carbs.current}{macros.carbs.unit}</p>
              <p className="text-sm text-muted-foreground">de {macros.carbs.goal}g Carbs</p>
              <Progress value={(macros.carbs.current / macros.carbs.goal) * 100} className="h-2" />
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-info/20 mb-2">
                <Droplets className="h-6 w-6 text-info" />
              </div>
              <p className="text-3xl font-bold">{macros.fats.current}{macros.fats.unit}</p>
              <p className="text-sm text-muted-foreground">de {macros.fats.goal}g Gordura</p>
              <Progress value={(macros.fats.current / macros.fats.goal) * 100} className="h-2" />
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

          <div className="grid gap-4">
            {recentMeals.map((meal) => (
              <Card key={meal.id} className="glass-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                        {meal.time}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{meal.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          P: {meal.protein}g • C: {meal.carbs}g • G: {meal.fats}g
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
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Refeições Hoje</p>
                <p className="text-3xl font-bold">3</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-success/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Streak Atual</p>
                <p className="text-3xl font-bold">7 dias</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-warning/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-warning" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Meta Semanal</p>
                <p className="text-3xl font-bold">85%</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
