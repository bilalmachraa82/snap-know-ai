import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateGoals, type UserGoals } from "@/hooks/useGoals";
import { toast } from "sonner";
import { Flame, Beef, Wheat, Droplets, Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";
import { goalsSchema } from "@/lib/validations";
import { z } from "zod";

interface GoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoals: UserGoals;
  userId: string | undefined;
}

export function GoalsDialog({ open, onOpenChange, currentGoals, userId }: GoalsDialogProps) {
  const updateGoalsMutation = useUpdateGoals();
  const [goals, setGoals] = useState(currentGoals);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showCalculator, setShowCalculator] = useState(false);

  // Calculator states
  const [weight, setWeight] = useState<number>(70);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');

  useEffect(() => {
    setGoals(currentGoals);
    setValidationErrors({});
  }, [currentGoals]);

  // Helper to update goals field with validation
  const updateGoalsField = (field: string, value: number) => {
    const updated = { ...goals, [field]: value };
    setGoals(updated);

    // Clear error for this field if it exists
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }

    // Validate the specific field
    try {
      const fieldSchema = goalsSchema.shape[field as keyof typeof goalsSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(value);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationErrors({ ...validationErrors, [field]: err.errors[0].message });
      }
    }
  };

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

    const calculatedGoals = {
      daily_calories: targetCalories,
      target_protein: protein,
      target_carbs: carbs,
      target_fats: fats
    };

    // Validate calculated goals
    try {
      goalsSchema.parse(calculatedGoals);
      setGoals(calculatedGoals);
      setValidationErrors({});
      toast.success("Objetivos calculados com base nos teus dados!");
      setShowCalculator(false);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        validationError.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
        toast.error("Valores calculados estão fora dos limites recomendados. Por favor, ajusta os parâmetros.");
      }
    }
  };

  const handleSave = () => {
    if (!userId) {
      toast.error("Utilizador não identificado");
      return;
    }

    // Validate before saving
    try {
      goalsSchema.parse(goals);
      setValidationErrors({});
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        validationError.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
        toast.error("Por favor, corrige os erros antes de guardar");
        return;
      }
    }

    updateGoalsMutation.mutate({
      userId,
      goals: {
        daily_calories: goals.daily_calories,
        target_protein: goals.target_protein,
        target_carbs: goals.target_carbs,
        target_fats: goals.target_fats,
      },
    }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
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
                  onChange={(e) => updateGoalsField('daily_calories', Number(e.target.value))}
                  min="1000"
                  max="5000"
                  className={validationErrors.daily_calories ? 'border-destructive' : ''}
                />
                {validationErrors.daily_calories && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.daily_calories}</p>
                )}
                <p className="text-xs text-muted-foreground">Intervalo recomendado: 1,000 - 5,000 kcal</p>
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
                  onChange={(e) => updateGoalsField('target_protein', Number(e.target.value))}
                  min="50"
                  max="400"
                  className={validationErrors.target_protein ? 'border-destructive' : ''}
                />
                {validationErrors.target_protein && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.target_protein}</p>
                )}
                <p className="text-xs text-muted-foreground">Intervalo recomendado: 50 - 400g</p>
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
                  onChange={(e) => updateGoalsField('target_carbs', Number(e.target.value))}
                  min="50"
                  max="800"
                  className={validationErrors.target_carbs ? 'border-destructive' : ''}
                />
                {validationErrors.target_carbs && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.target_carbs}</p>
                )}
                <p className="text-xs text-muted-foreground">Intervalo recomendado: 50 - 800g</p>
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
                  onChange={(e) => updateGoalsField('target_fats', Number(e.target.value))}
                  min="20"
                  max="300"
                  className={validationErrors.target_fats ? 'border-destructive' : ''}
                />
                {validationErrors.target_fats && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.target_fats}</p>
                )}
                <p className="text-xs text-muted-foreground">Intervalo recomendado: 20 - 300g</p>
              </div>
            </div>
          </div>
        )}

        {!showCalculator && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateGoalsMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateGoalsMutation.isPending}>
              {updateGoalsMutation.isPending ? "A guardar..." : "Guardar Objetivos"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
