import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { useUpdateMeal, type Meal } from "@/hooks/useMeals";
import { mealSchema } from "@/lib/validations";
import { z } from "zod";

interface EditMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: Meal | null;
}

export const EditMealDialog = ({ open, onOpenChange, meal }: EditMealDialogProps) => {
  const updateMealMutation = useUpdateMeal();
  const [editedMeal, setEditedMeal] = useState<Meal | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (meal) {
      setEditedMeal({ ...meal });
      setValidationErrors({});
    }
  }, [meal]);

  // Helper to update meal field with validation
  const updateMealField = (field: string, value: any) => {
    if (!editedMeal) return;

    const updated = { ...editedMeal, [field]: value };
    setEditedMeal(updated);

    // Clear error for this field if it exists
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }

    // Validate the specific field
    try {
      const fieldSchema = mealSchema.shape[field as keyof typeof mealSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(value);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationErrors({ ...validationErrors, [field]: err.errors[0].message });
      }
    }
  };

  const handleSave = () => {
    if (!editedMeal) return;

    // Validate before saving
    try {
      mealSchema.parse(editedMeal);
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

    updateMealMutation.mutate({
      id: editedMeal.id,
      food_name: editedMeal.food_name,
      calories: editedMeal.calories,
      protein: editedMeal.protein,
      carbs: editedMeal.carbs,
      fats: editedMeal.fats,
      meal_type: editedMeal.meal_type,
    }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  if (!editedMeal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Refeição</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nome do Prato</Label>
              <Input
                value={editedMeal.food_name}
                onChange={(e) => updateMealField('food_name', e.target.value)}
                className={validationErrors.food_name ? 'border-destructive' : ''}
              />
              {validationErrors.food_name && (
                <p className="text-xs text-destructive mt-1">{validationErrors.food_name}</p>
              )}
            </div>
            <div>
              <Label>Tipo de Refeição</Label>
              <Select
                value={editedMeal.meal_type}
                onValueChange={(value) => updateMealField('meal_type', value)}
              >
                <SelectTrigger className={validationErrors.meal_type ? 'border-destructive' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Pequeno-almoço</SelectItem>
                  <SelectItem value="lunch">Almoço</SelectItem>
                  <SelectItem value="dinner">Jantar</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.meal_type && (
                <p className="text-xs text-destructive mt-1">{validationErrors.meal_type}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label>Calorias</Label>
              <Input
                type="number"
                min="0"
                max="10000"
                value={editedMeal.calories}
                onChange={(e) => updateMealField('calories', parseInt(e.target.value) || 0)}
                className={validationErrors.calories ? 'border-destructive' : ''}
              />
              {validationErrors.calories && (
                <p className="text-xs text-destructive mt-1">{validationErrors.calories}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">0-10,000</p>
            </div>
            <div>
              <Label>Proteína (g)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="500"
                value={editedMeal.protein}
                onChange={(e) => updateMealField('protein', parseFloat(e.target.value) || 0)}
                className={validationErrors.protein ? 'border-destructive' : ''}
              />
              {validationErrors.protein && (
                <p className="text-xs text-destructive mt-1">{validationErrors.protein}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">0-500g</p>
            </div>
            <div>
              <Label>Carbs (g)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="1000"
                value={editedMeal.carbs}
                onChange={(e) => updateMealField('carbs', parseFloat(e.target.value) || 0)}
                className={validationErrors.carbs ? 'border-destructive' : ''}
              />
              {validationErrors.carbs && (
                <p className="text-xs text-destructive mt-1">{validationErrors.carbs}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">0-1,000g</p>
            </div>
            <div>
              <Label>Gordura (g)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="500"
                value={editedMeal.fats}
                onChange={(e) => updateMealField('fats', parseFloat(e.target.value) || 0)}
                className={validationErrors.fats ? 'border-destructive' : ''}
              />
              {validationErrors.fats && (
                <p className="text-xs text-destructive mt-1">{validationErrors.fats}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">0-500g</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={updateMealMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="hero"
              className="flex-1"
              onClick={handleSave}
              disabled={updateMealMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {updateMealMutation.isPending ? "A guardar..." : "Guardar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};