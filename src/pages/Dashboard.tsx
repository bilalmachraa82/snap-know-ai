import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera, TrendingUp, Flame, Beef, Wheat, Droplets, LogOut, Pencil, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Settings, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMeals, useDeleteMeal, type Meal } from "@/hooks/useMeals";
import { useGoals, type UserGoals } from "@/hooks/useGoals";
import { AddMealDialog } from "@/components/AddMealDialog";
import { EditMealDialog } from "@/components/EditMealDialog";
import { GoalsDialog } from "@/components/GoalsDialog";
import { ProgressCharts } from "@/components/ProgressCharts";
import { ProfileDialog } from "@/components/ProfileDialog";
import { MealTypeBreakdown } from "@/components/MealTypeBreakdown";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Navigate } from "react-router-dom";
import { format, subDays, startOfWeek, endOfWeek, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";
import { exportMealsToCSV, generateExportFilename } from "@/lib/exportData";

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalsDialogOpen, setGoalsDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customDateStart, setCustomDateStart] = useState<Date | undefined>();
  const [customDateEnd, setCustomDateEnd] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  // React Query hooks for data fetching
  const { data: meals = [], isLoading: mealsLoading } = useMeals({
    activeTab,
    selectedDate,
    dateRange,
    customDateStart,
    customDateEnd,
  });

  const { data: goals, isLoading: goalsLoading } = useGoals(user?.id);

  // React Query mutation for delete
  const deleteMealMutation = useDeleteMeal();

  // Use default goals if not loaded yet
  const currentGoals: UserGoals = goals || {
    daily_calories: 2000,
    target_protein: 150,
    target_carbs: 250,
    target_fats: 67,
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

  const groupMealsByDate = () => {
    const grouped: Record<string, Meal[]> = {};
    meals.forEach(meal => {
      const date = format(new Date(meal.created_at), 'yyyy-MM-dd');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(meal);
    });
    return grouped;
  };

  const calculateDailyTotals = (dailyMeals: Meal[]) => {
    return dailyMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fats: acc.fats + (meal.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (dateRange === 'today') {
      setSelectedDate(prev => direction === 'prev' ? subDays(prev, 1) : new Date(prev.getTime() + 86400000));
    } else if (dateRange === 'week') {
      setSelectedDate(prev => direction === 'prev' ? subDays(prev, 7) : new Date(prev.getTime() + 7 * 86400000));
    } else if (dateRange === 'month') {
      setSelectedDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + (direction === 'prev' ? -1 : 1));
        return newDate;
      });
    }
  };

  const handleEditMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (meal: Meal) => {
    setSelectedMeal(meal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedMeal) return;

    deleteMealMutation.mutate(selectedMeal.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedMeal(null);
      },
    });
  };

  const handleExportCSV = () => {
    try {
      if (meals.length === 0) {
        toast.error("Não há dados para exportar");
        return;
      }

      // Calculate date range for filename
      let startDate: Date;
      let endDate: Date;

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

      // Generate filename and export
      const filename = generateExportFilename(startDate, endDate);
      exportMealsToCSV(meals, filename);

      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao exportar dados");
    }
  };

  if (loading || mealsLoading || goalsLoading) {
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
  const calorieProgress = (totals.calories / currentGoals.daily_calories) * 100;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">Cal AI Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Olá, {user.email?.split('@')[0]}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setProfileDialogOpen(true)}>
              <Settings className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Perfil</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'today' | 'history')} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* TODAY TAB */}
          <TabsContent value="today" className="space-y-8">
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
                <div className="flex gap-2">
                  <Button variant="outline" size="lg" onClick={() => setGoalsDialogOpen(true)}>
                    <Settings className="mr-2 h-5 w-5" />
                    Objetivos
                  </Button>
                  <Button variant="hero" size="lg" onClick={() => setDialogOpen(true)}>
                    <Camera className="mr-2 h-5 w-5" />
                    Adicionar Refeição
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary mb-2">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-primary">{totals.calories}</p>
                  <p className="text-sm text-muted-foreground">de {currentGoals.daily_calories} kcal</p>
                  <Progress value={calorieProgress} className="h-2" />
                </div>

                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-light/30 mb-2">
                    <Beef className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">{totals.protein.toFixed(0)}g</p>
                  <p className="text-sm text-muted-foreground">de {currentGoals.target_protein}g Proteína</p>
                  <Progress value={(totals.protein / currentGoals.target_protein) * 100} className="h-2" />
                </div>

                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-warning/20 mb-2">
                    <Wheat className="h-6 w-6 text-warning" />
                  </div>
                  <p className="text-3xl font-bold">{totals.carbs.toFixed(0)}g</p>
                  <p className="text-sm text-muted-foreground">de {currentGoals.target_carbs}g Carbs</p>
                  <Progress value={(totals.carbs / currentGoals.target_carbs) * 100} className="h-2" />
                </div>

                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-info/20 mb-2">
                    <Droplets className="h-6 w-6 text-info" />
                  </div>
                  <p className="text-3xl font-bold">{totals.fats.toFixed(0)}g</p>
                  <p className="text-sm text-muted-foreground">de {currentGoals.target_fats}g Gordura</p>
                  <Progress value={(totals.fats / currentGoals.target_fats) * 100} className="h-2" />
                </div>
              </div>
            </Card>

            {/* Meal Type Breakdown */}
            {meals.length > 0 && <MealTypeBreakdown meals={meals} />}

            {/* Today's Meals */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Refeições de Hoje</h2>

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
                    <Card key={meal.id} className="glass-card p-6 hover:shadow-lg transition-shadow group">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                              {formatTime(meal.created_at)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">
                                {getMealTypeLabel(meal.meal_type)}: {meal.food_name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                P: {meal.protein?.toFixed(0) || 0}g • C: {meal.carbs?.toFixed(0) || 0}g • G: {meal.fats?.toFixed(0) || 0}g
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{meal.calories}</p>
                            <p className="text-xs text-muted-foreground">kcal</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditMeal(meal)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(meal)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Charts */}
            {meals.length > 0 && (
              <ProgressCharts meals={meals} goals={currentGoals} />
            )}
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent value="history" className="space-y-6">
            {/* Date Range Selector */}
            <Card className="glass-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateDate('prev')}
                    disabled={dateRange === 'custom'}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="min-w-[200px]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange === 'today' && format(selectedDate, "dd 'de' MMMM, yyyy", { locale: pt })}
                        {dateRange === 'week' && `Semana de ${format(startOfWeek(selectedDate, { locale: pt }), "dd MMM", { locale: pt })}`}
                        {dateRange === 'month' && format(selectedDate, "MMMM yyyy", { locale: pt })}
                        {dateRange === 'custom' && customDateStart && customDateEnd && 
                          `${format(customDateStart, "dd MMM", { locale: pt })} - ${format(customDateEnd, "dd MMM", { locale: pt })}`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateDate('next')}
                    disabled={dateRange === 'custom'}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={dateRange === 'today' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange('today')}
                  >
                    Dia
                  </Button>
                  <Button
                    variant={dateRange === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange('week')}
                  >
                    Semana
                  </Button>
                  <Button
                    variant={dateRange === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange('month')}
                  >
                    Mês
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    disabled={meals.length === 0}
                    className="ml-2"
                  >
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Exportar CSV</span>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Historical Meals Grouped by Date */}
            {meals.length === 0 ? (
              <Card className="glass-card p-12 text-center">
                <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Sem refeições neste período</h3>
                <p className="text-muted-foreground">
                  Não há refeições registadas para o período selecionado
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupMealsByDate()).map(([date, dailyMeals]) => {
                  const dailyTotals = calculateDailyTotals(dailyMeals);
                  return (
                    <div key={date}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">
                          {format(new Date(date), "EEEE, dd 'de' MMMM", { locale: pt })}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold text-primary">{dailyTotals.calories} kcal</span>
                          <span className="text-muted-foreground">
                            P: {dailyTotals.protein.toFixed(0)}g | C: {dailyTotals.carbs.toFixed(0)}g | G: {dailyTotals.fats.toFixed(0)}g
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {dailyMeals.map((meal) => (
                          <Card key={meal.id} className="glass-card p-4 hover:shadow-lg transition-shadow group">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-semibold text-xs">
                                  {formatTime(meal.created_at)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold">
                                    {getMealTypeLabel(meal.meal_type)}: {meal.food_name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    P: {meal.protein?.toFixed(0) || 0}g • C: {meal.carbs?.toFixed(0) || 0}g • G: {meal.fats?.toFixed(0) || 0}g
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-xl font-bold text-primary">{meal.calories}</p>
                                  <p className="text-xs text-muted-foreground">kcal</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditMeal(meal)}
                                    className="h-7 w-7"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(meal)}
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Progress Charts */}
            {meals.length > 0 && (
              <ProgressCharts meals={meals} goals={currentGoals} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddMealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <EditMealDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        meal={selectedMeal}
      />

      <GoalsDialog
        open={goalsDialogOpen}
        onOpenChange={setGoalsDialogOpen}
        currentGoals={currentGoals}
        userId={user?.id}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Refeição?</AlertDialogTitle>
            <AlertDialogDescription>
              Tens a certeza que queres eliminar "{selectedMeal?.food_name}"?
              Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </div>
  );
};

export default Dashboard;
