import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sunrise, Sun, Moon, Cookie } from "lucide-react";

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

interface MealTypeBreakdownProps {
  meals: Meal[];
}

interface MealTypeData {
  type: string;
  label: string;
  icon: React.ElementType;
  calories: number;
  color: string;
  bgColor: string;
}

export function MealTypeBreakdown({ meals }: MealTypeBreakdownProps) {
  // Calculate totals by meal type
  const mealTypeData = React.useMemo(() => {
    const breakdown: Record<string, number> = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0,
    };

    meals.forEach(meal => {
      const type = meal.meal_type || 'snack';
      if (breakdown[type] !== undefined) {
        breakdown[type] += meal.calories;
      }
    });

    // Calculate total calories for percentage calculation
    const totalCalories = Object.values(breakdown).reduce((sum, cal) => sum + cal, 0);

    const mealTypes: MealTypeData[] = [
      {
        type: 'breakfast',
        label: 'Pequeno-almoço',
        icon: Sunrise,
        calories: breakdown.breakfast,
        color: 'text-warning',
        bgColor: 'bg-warning/20',
      },
      {
        type: 'lunch',
        label: 'Almoço',
        icon: Sun,
        calories: breakdown.lunch,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/20',
      },
      {
        type: 'dinner',
        label: 'Jantar',
        icon: Moon,
        calories: breakdown.dinner,
        color: 'text-info',
        bgColor: 'bg-info/20',
      },
      {
        type: 'snack',
        label: 'Snack',
        icon: Cookie,
        calories: breakdown.snack,
        color: 'text-success',
        bgColor: 'bg-success/20',
      },
    ];

    return { mealTypes, totalCalories };
  }, [meals]);

  const { mealTypes, totalCalories } = mealTypeData;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Breakdown por Refeição</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mealTypes.map((mealType) => {
          const Icon = mealType.icon;
          const percentage = totalCalories > 0
            ? (mealType.calories / totalCalories) * 100
            : 0;

          return (
            <Card
              key={mealType.type}
              className="glass-card p-5 hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="space-y-3">
                {/* Icon and Label */}
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full ${mealType.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${mealType.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{mealType.label}</h3>
                  </div>
                </div>

                {/* Calories */}
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {mealType.calories}
                  </p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>

                {/* Progress Bar */}
                {totalCalories > 0 ? (
                  <div className="space-y-1">
                    <Progress
                      value={percentage}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {percentage.toFixed(0)}% do total
                    </p>
                  </div>
                ) : (
                  <div className="h-6" /> // Placeholder to maintain height
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty state message */}
      {totalCalories === 0 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Nenhuma refeição registada para mostrar o breakdown
        </p>
      )}
    </div>
  );
}
