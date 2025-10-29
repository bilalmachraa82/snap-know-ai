import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAddMeal } from "@/hooks/useMeals";
import imageCompression from "browser-image-compression";
import { mealAnalysisSchema } from "@/lib/validations";
import { z } from "zod";

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Security constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_ANALYSIS_PER_MINUTE = 5;
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

interface AnalysisRequest {
  timestamp: number;
}

export const AddMealDialog = ({ open, onOpenChange }: AddMealDialogProps) => {
  const { user } = useAuth();
  const addMealMutation = useAddMeal();
  const [analyzing, setAnalyzing] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [compressedFileSize, setCompressedFileSize] = useState<number>(0);
  const [analysisRequests, setAnalysisRequests] = useState<AnalysisRequest[]>([]);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Utility function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Validate file type (both extension and MIME type)
  const validateFileType = (file: File): boolean => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      toast.error(`Tipo de arquivo não permitido. Use apenas: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return false;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error(`Tipo MIME não permitido. Use apenas imagens JPEG, PNG ou WebP.`);
      return false;
    }

    return true;
  };

  // Validate file size
  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Arquivo muito grande! Tamanho máximo: ${formatFileSize(MAX_FILE_SIZE)}. Seu arquivo: ${formatFileSize(file.size)}`);
      return false;
    }
    return true;
  };

  // Compress image
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type,
      initialQuality: 0.8,
    };

    try {
      setCompressing(true);
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Erro ao comprimir imagem. Usando arquivo original.');
      return file;
    } finally {
      setCompressing(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!validateFileType(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file size
    if (!validateFileSize(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Store original file size
    setOriginalFileSize(file.size);

    // Compress the image
    const compressedFile = await compressImage(file);
    setCompressedFileSize(compressedFile.size);

    // Show compression results
    if (compressedFile.size < file.size) {
      const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
      toast.success(`Imagem comprimida: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)} (${savings}% reduzido)`);
    }

    // Set the compressed file
    setImageFile(compressedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(compressedFile);
  };

  // Check rate limit for analysis
  const checkRateLimit = (): boolean => {
    const now = Date.now();

    // Remove old requests outside the window
    const recentRequests = analysisRequests.filter(
      req => now - req.timestamp < RATE_LIMIT_WINDOW
    );

    setAnalysisRequests(recentRequests);

    if (recentRequests.length >= MAX_ANALYSIS_PER_MINUTE) {
      const oldestRequest = recentRequests[0];
      const timeUntilReset = Math.ceil((oldestRequest.timestamp + RATE_LIMIT_WINDOW - now) / 1000);

      setCooldownSeconds(timeUntilReset);

      // Start countdown
      const countdownInterval = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast.error(`Muitas análises! Aguarda ${timeUntilReset} segundos.`);
      return false;
    }

    return true;
  };

  const analyzeImage = async () => {
    if (!imageFile || !imagePreview) {
      toast.error("Por favor, seleciona uma imagem primeiro");
      return;
    }

    // Check rate limit
    if (!checkRateLimit()) {
      return;
    }

    // Add current request to tracking
    setAnalysisRequests(prev => [...prev, { timestamp: Date.now() }]);

    setAnalyzing(true);

    try {
      // Call the analyze-food edge function
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageBase64: imagePreview }
      });

      if (error) throw error;

      if (data.success) {
        // Validate the analysis result
        try {
          const validatedData = mealAnalysisSchema.parse(data.analysis);
          setAnalysisResult(validatedData);
          setValidationErrors({});
          toast.success("Análise concluída! Revê os valores antes de guardar.");
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            const errors: Record<string, string> = {};
            validationError.errors.forEach((err) => {
              if (err.path[0]) {
                errors[err.path[0].toString()] = err.message;
              }
            });
            setValidationErrors(errors);
            // Still set the result but show warnings
            setAnalysisResult(data.analysis);
            toast.warning("Análise concluída mas alguns valores podem estar fora dos limites. Por favor, revê e ajusta.");
          }
        }
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

    // Validate before saving
    try {
      mealAnalysisSchema.parse(analysisResult);
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

      // Use React Query mutation to add meal
      addMealMutation.mutate({
        user_id: user.id,
        image_url: imageUrl,
        food_name: analysisResult.food_name,
        calories: analysisResult.calories,
        protein: analysisResult.protein,
        carbs: analysisResult.carbs,
        fats: analysisResult.fats,
        meal_type: analysisResult.meal_type,
        portion_size: analysisResult.portion_size,
      } as any, {
        onSuccess: () => {
          resetForm();
          onOpenChange(false);
        },
        onError: (error: any) => {
          console.error("Save meal error:", error);
          toast.error(error.message || "Erro ao guardar refeição");
        },
      });
    } catch (error: any) {
      console.error("Save meal error:", error);
      toast.error(error.message || "Erro ao guardar refeição");
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview("");
    setAnalysisResult(null);
    setValidationErrors({});
    setOriginalFileSize(0);
    setCompressedFileSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper to update analysis result with validation
  const updateAnalysisField = (field: string, value: any) => {
    const updated = { ...analysisResult, [field]: value };
    setAnalysisResult(updated);

    // Clear error for this field if it exists
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }

    // Validate the specific field
    try {
      const fieldSchema = mealAnalysisSchema.shape[field as keyof typeof mealAnalysisSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(value);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationErrors({ ...validationErrors, [field]: err.errors[0].message });
      }
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
                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>Formatos aceites: JPEG, PNG, WebP</p>
                  <p>Tamanho máximo: 5MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="meal-image"
                  disabled={compressing}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={compressing}
                >
                  {compressing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A comprimir...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar Imagem
                    </>
                  )}
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

              {/* File size information */}
              {compressedFileSize > 0 && (
                <div className="glass-card p-3 rounded-lg">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tamanho do ficheiro:</span>
                    <span className="font-medium">
                      {originalFileSize !== compressedFileSize ? (
                        <>
                          <span className="line-through opacity-60">{formatFileSize(originalFileSize)}</span>
                          {' → '}
                          <span className="text-success">{formatFileSize(compressedFileSize)}</span>
                        </>
                      ) : (
                        formatFileSize(compressedFileSize)
                      )}
                    </span>
                  </div>
                </div>
              )}

              {!analysisResult ? (
                <div className="space-y-2">
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={analyzeImage}
                    disabled={analyzing || cooldownSeconds > 0}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        A analisar com IA...
                      </>
                    ) : cooldownSeconds > 0 ? (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Aguarda {cooldownSeconds}s
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analisar com IA
                      </>
                    )}
                  </Button>
                  {analysisRequests.length > 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      {analysisRequests.length}/{MAX_ANALYSIS_PER_MINUTE} análises usadas neste minuto
                    </p>
                  )}
                </div>
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
                          onChange={(e) => updateAnalysisField('food_name', e.target.value)}
                          className={validationErrors.food_name ? 'border-destructive' : ''}
                        />
                        {validationErrors.food_name && (
                          <p className="text-xs text-destructive mt-1">{validationErrors.food_name}</p>
                        )}
                      </div>
                      <div>
                        <Label>Tipo de Refeição</Label>
                        <Select
                          value={analysisResult.meal_type}
                          onValueChange={(value) => updateAnalysisField('meal_type', value)}
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
                          value={analysisResult.calories}
                          onChange={(e) => updateAnalysisField('calories', parseInt(e.target.value) || 0)}
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
                          value={analysisResult.protein}
                          onChange={(e) => updateAnalysisField('protein', parseFloat(e.target.value) || 0)}
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
                          value={analysisResult.carbs}
                          onChange={(e) => updateAnalysisField('carbs', parseFloat(e.target.value) || 0)}
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
                          value={analysisResult.fats}
                          onChange={(e) => updateAnalysisField('fats', parseFloat(e.target.value) || 0)}
                          className={validationErrors.fats ? 'border-destructive' : ''}
                        />
                        {validationErrors.fats && (
                          <p className="text-xs text-destructive mt-1">{validationErrors.fats}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">0-500g</p>
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
