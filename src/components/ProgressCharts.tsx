import React from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

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

interface ProgressChartsProps {
  meals: Meal[];
  goals: {
    daily_calories: number;
    target_protein: number;
    target_carbs: number;
    target_fats: number;
  };
}

export function ProgressCharts({ meals, goals }: ProgressChartsProps) {
  // Group meals by date and calculate daily totals
  const dailyData = React.useMemo(() => {
    const grouped: Record<string, { calories: number; protein: number; carbs: number; fats: number }> = {};
    
    meals.forEach(meal => {
      const date = format(new Date(meal.created_at), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
      }
      grouped[date].calories += meal.calories;
      grouped[date].protein += meal.protein || 0;
      grouped[date].carbs += meal.carbs || 0;
      grouped[date].fats += meal.fats || 0;
    });

    return Object.entries(grouped)
      .map(([date, totals]) => ({
        date: format(new Date(date), "dd MMM", { locale: pt }),
        fullDate: date,
        ...totals,
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fats: Math.round(totals.fats),
      }))
      .sort((a, b) => a.fullDate.localeCompare(b.fullDate))
      .slice(-7); // Last 7 days
  }, [meals]);

  if (dailyData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Calories Chart */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4">Evolução de Calorias (7 dias)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="calories" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              name="Calorias"
              dot={{ fill: 'hsl(var(--primary))', r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey={goals.daily_calories} 
              stroke="hsl(var(--muted-foreground))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Objetivo"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Macros Chart */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4">Macronutrientes (7 dias)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="protein" 
              fill="hsl(var(--primary))" 
              name="Proteína (g)"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="carbs" 
              fill="hsl(var(--warning))" 
              name="Carbs (g)"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="fats" 
              fill="hsl(var(--info))" 
              name="Gordura (g)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
