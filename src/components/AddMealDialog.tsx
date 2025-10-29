import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMealAdded: () => void;
}

export const AddMealDialog = ({ open, onOpenChange, onMealAdded }: AddMealDialogProps) => {
  const { user } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile || !imagePreview) {
      toast.error("Por favor, seleciona uma imagem primeiro");
      return;
    }

    setAnalyzing(true);

    try {
      // Call the analyze-food edge function
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageBase64: imagePreview }
      });

      if (error) throw error;

      if (data.success) {
        setAnalysisResult(data.analysis);
        toast.success("Análise concluída! Revê os valores antes de guardar.");
      } else {
        throw new Error(data.error || "Erro ao analisar imagem");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Erro ao analisar imagem com IA");
    } finally {
      setAnalyzing(false);
    }
  };

  const saveMeal = async () => {
    if (!user || !analysisResult) {
      toast.error("Dados incompletos");
      return;
    }

    try {
      let imageUrl = null;

      // Upload image to storage if available
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('meal-photos')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('meal-photos')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Insert meal into database
      const { error: insertError } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          food_name: analysisResult.food_name,
          calories: analysisResult.calories,
          protein: analysisResult.protein,
          carbs: analysisResult.carbs,
          fats: analysisResult.fats,
          meal_type: analysisResult.meal_type,
          portion_size: analysisResult.portion_size,
        });

      if (insertError) throw insertError;

      toast.success("Refeição guardada com sucesso!");
      onMealAdded();
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Save meal error:", error);
      toast.error(error.message || "Erro ao guardar refeição");
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview("");
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Refeição</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!imagePreview ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-border rounded-lg">
                <Camera className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  Tira ou carrega uma foto da tua refeição
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="meal-image"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Selecionar Imagem
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-64 object-cover"
                />
              </div>

              {!analysisResult ? (
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={analyzeImage}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A analisar com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analisar com IA
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="glass-card p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Análise IA</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        analysisResult.confidence === 'high' ? 'bg-success/20 text-success' :
                        analysisResult.confidence === 'medium' ? 'bg-warning/20 text-warning' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        Confiança: {analysisResult.confidence}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Nome do Prato</Label>
                        <Input 
                          value={analysisResult.food_name}
                          onChange={(e) => setAnalysisResult({...analysisResult, food_name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Tipo de Refeição</Label>
                        <Select 
                          value={analysisResult.meal_type}
                          onValueChange={(value) => setAnalysisResult({...analysisResult, meal_type: value})}
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
                          value={analysisResult.calories}
                          onChange={(e) => setAnalysisResult({...analysisResult, calories: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Proteína (g)</Label>
                        <Input 
                          type="number"
                          step="0.1"
                          value={analysisResult.protein}
                          onChange={(e) => setAnalysisResult({...analysisResult, protein: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Carbs (g)</Label>
                        <Input 
                          type="number"
                          step="0.1"
                          value={analysisResult.carbs}
                          onChange={(e) => setAnalysisResult({...analysisResult, carbs: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Gordura (g)</Label>
                        <Input 
                          type="number"
                          step="0.1"
                          value={analysisResult.fats}
                          onChange={(e) => setAnalysisResult({...analysisResult, fats: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={resetForm}
                    >
                      Nova Foto
                    </Button>
                    <Button
                      variant="hero"
                      className="flex-1"
                      onClick={saveMeal}
                    >
                      Guardar Refeição
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
