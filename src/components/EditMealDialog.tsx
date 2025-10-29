import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Meal {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal_type: string;
}

interface EditMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMealUpdated: () => void;
  meal: Meal | null;
}

export const EditMealDialog = ({ open, onOpenChange, onMealUpdated, meal }: EditMealDialogProps) => {
  const [editedMeal, setEditedMeal] = useState<Meal | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (meal) {
      setEditedMeal({ ...meal });
    }
  }, [meal]);

  const handleSave = async () => {
    if (!editedMeal) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('meals')
        .update({
          food_name: editedMeal.food_name,
          calories: editedMeal.calories,
          protein: editedMeal.protein,
          carbs: editedMeal.carbs,
          fats: editedMeal.fats,
          meal_type: editedMeal.meal_type,
        })
        .eq('id', editedMeal.id);

      if (error) throw error;

      toast.success("Refeição atualizada com sucesso!");
      onMealUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Update meal error:", error);
      toast.error(error.message || "Erro ao atualizar refeição");
    } finally {
      setSaving(false);
    }
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
                onChange={(e) => setEditedMeal({...editedMeal, food_name: e.target.value})}
              />
            </div>
            <div>
              <Label>Tipo de Refeição</Label>
              <Select 
                value={editedMeal.meal_type}
                onValueChange={(value) => setEditedMeal({...editedMeal, meal_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Pequeno-almoço</SelectItem>
                  <SelectItem value="lunch">Almoço</SelectItem>
                  <SelectItem value="dinner">Jantar</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label>Calorias</Label>
              <Input 
                type="number"
                value={editedMeal.calories}
                onChange={(e) => setEditedMeal({...editedMeal, calories: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label>Proteína (g)</Label>
              <Input 
                type="number"
                step="0.1"
                value={editedMeal.protein}
                onChange={(e) => setEditedMeal({...editedMeal, protein: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label>Carbs (g)</Label>
              <Input 
                type="number"
                step="0.1"
                value={editedMeal.carbs}
                onChange={(e) => setEditedMeal({...editedMeal, carbs: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label>Gordura (g)</Label>
              <Input 
                type="number"
                step="0.1"
                value={editedMeal.fats}
                onChange={(e) => setEditedMeal({...editedMeal, fats: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              variant="hero"
              className="flex-1"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "A guardar..." : "Guardar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};