import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Flame, Beef, Wheat, Droplets, Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";

interface GoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalsUpdated: () => void;
  currentGoals: {
    daily_calories: number;
    target_protein: number;
    target_carbs: number;
    target_fats: number;
  };
}

export function GoalsDialog({ open, onOpenChange, onGoalsUpdated, currentGoals }: GoalsDialogProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState(currentGoals);
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Calculator states
  const [weight, setWeight] = useState<number>(70);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');

  useEffect(() => {
    setGoals(currentGoals);
  }, [currentGoals]);

  const calculateMacros = () => {
    // Activity multipliers
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    // Goal adjustments
    const goalAdjustments = {
      lose: -500,
      maintain: 0,
      gain: 500
    };

    // Base metabolic rate (simplified formula)
    const bmr = weight * 24;
    const tdee = bmr * multipliers[activityLevel];
    const targetCalories = Math.round(tdee + goalAdjustments[goal]);

    // Macros (40% protein, 35% carbs, 25% fats)
    const protein = Math.round((targetCalories * 0.30) / 4); // 4 cal per gram
    const carbs = Math.round((targetCalories * 0.40) / 4);
    const fats = Math.round((targetCalories * 0.30) / 9); // 9 cal per gram

    setGoals({
      daily_calories: targetCalories,
      target_protein: protein,
      target_carbs: carbs,
      target_fats: fats
    });

    toast.success("Objetivos calculados com base nos teus dados!");
    setShowCalculator(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({
          daily_calories: goals.daily_calories,
          target_protein: goals.target_protein,
          target_carbs: goals.target_carbs,
          target_fats: goals.target_fats,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Objetivos atualizados com sucesso!");
      onGoalsUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating goals:", error);
      toast.error(error.message || "Erro ao atualizar objetivos");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Definir Objetivos Diários</DialogTitle>
          <DialogDescription>
            Personaliza as tuas metas de calorias e macronutrientes
          </DialogDescription>
        </DialogHeader>

        {showCalculator ? (
          <div className="space-y-6 py-4">
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  min="30"
                  max="300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Nível de Atividade</Label>
                <select
                  id="activity"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="sedentary">Sedentário (pouco exercício)</option>
                  <option value="light">Ligeiro (1-3 dias/semana)</option>
                  <option value="moderate">Moderado (3-5 dias/semana)</option>
                  <option value="active">Ativo (6-7 dias/semana)</option>
                  <option value="very_active">Muito Ativo (2x/dia)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Objetivo</Label>
                <select
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="lose">Perder Peso (-500 kcal/dia)</option>
                  <option value="maintain">Manter Peso</option>
                  <option value="gain">Ganhar Peso (+500 kcal/dia)</option>
                </select>
              </div>
            </Card>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCalculator(false)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={calculateMacros}
                className="flex-1"
              >
                Calcular
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCalculator(true)}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Usar Calculadora
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calories" className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  Calorias Diárias (kcal)
                </Label>
                <Input
                  id="calories"
                  type="number"
                  value={goals.daily_calories}
                  onChange={(e) => setGoals({ ...goals, daily_calories: Number(e.target.value) })}
                  min="1000"
                  max="10000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="protein" className="flex items-center gap-2">
                  <Beef className="h-4 w-4 text-primary" />
                  Proteína (g)
                </Label>
                <Input
                  id="protein"
                  type="number"
                  value={goals.target_protein}
                  onChange={(e) => setGoals({ ...goals, target_protein: Number(e.target.value) })}
                  min="0"
                  max="1000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carbs" className="flex items-center gap-2">
                  <Wheat className="h-4 w-4 text-warning" />
                  Carboidratos (g)
                </Label>
                <Input
                  id="carbs"
                  type="number"
                  value={goals.target_carbs}
                  onChange={(e) => setGoals({ ...goals, target_carbs: Number(e.target.value) })}
                  min="0"
                  max="1000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fats" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-info" />
                  Gordura (g)
                </Label>
                <Input
                  id="fats"
                  type="number"
                  value={goals.target_fats}
                  onChange={(e) => setGoals({ ...goals, target_fats: Number(e.target.value) })}
                  min="0"
                  max="500"
                />
              </div>
            </div>
          </div>
        )}

        {!showCalculator && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "A guardar..." : "Guardar Objetivos"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
