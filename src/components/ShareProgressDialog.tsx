import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Copy, Check } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface ShareProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  goals: {
    daily_calories: number;
    target_protein: number;
    target_carbs: number;
    target_fats: number;
  };
}

export const ShareProgressDialog = ({ open, onOpenChange, totals, goals }: ShareProgressDialogProps) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const calorieProgress = Math.round((totals.calories / goals.daily_calories) * 100);
  const proteinProgress = Math.round((totals.protein / goals.target_protein) * 100);
  const carbsProgress = Math.round((totals.carbs / goals.target_carbs) * 100);
  const fatsProgress = Math.round((totals.fats / goals.target_fats) * 100);

  const generateShareImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 1000;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0ea5e9');
    gradient.addColorStop(1, '#2563eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Cal AI', canvas.width / 2, 100);

    ctx.font = '24px Arial';
    ctx.fillText(format(new Date(), "dd 'de' MMMM, yyyy", { locale: pt }), canvas.width / 2, 150);

    // Main stats card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(50, 200, canvas.width - 100, 600);

    // Calories
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.fillText(totals.calories.toString(), canvas.width / 2, 320);
    ctx.font = '24px Arial';
    ctx.fillText('calorias consumidas', canvas.width / 2, 360);
    ctx.fillText(`Meta: ${goals.daily_calories} kcal (${calorieProgress}%)`, canvas.width / 2, 395);

    // Macros
    const startY = 470;
    const spacing = 110;

    // Protein
    drawMacroBox(ctx, 'Proteína', totals.protein, goals.target_protein, proteinProgress, 80, startY);
    
    // Carbs
    drawMacroBox(ctx, 'Carbs', totals.carbs, goals.target_carbs, carbsProgress, 290, startY);
    
    // Fats
    drawMacroBox(ctx, 'Gordura', totals.fats, goals.target_fats, fatsProgress, 500, startY);

    // Footer
    ctx.font = '20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Tracking nutricional inteligente', canvas.width / 2, 900);

    return canvas.toDataURL('image/png');
  };

  const drawMacroBox = (
    ctx: CanvasRenderingContext2D, 
    label: string, 
    value: number, 
    goal: number, 
    progress: number,
    x: number, 
    y: number
  ) => {
    // Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x, y, 200, 150);

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + 100, y + 35);

    // Value
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`${value.toFixed(0)}g`, x + 100, y + 80);

    // Goal
    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`Meta: ${goal}g`, x + 100, y + 105);

    // Progress
    ctx.fillText(`${progress}%`, x + 100, y + 130);
  };

  const handleDownloadImage = () => {
    const imageData = generateShareImage();
    if (!imageData) return;

    const link = document.createElement('a');
    link.download = `calai-progress-${format(new Date(), 'yyyy-MM-dd')}.png`;
    link.href = imageData;
    link.click();

    toast.success("Imagem guardada com sucesso!");
  };

  const handleCopyText = () => {
    const text = `📊 Progresso Cal AI - ${format(new Date(), "dd/MM/yyyy")}

🔥 Calorias: ${totals.calories}/${goals.daily_calories} kcal (${calorieProgress}%)
💪 Proteína: ${totals.protein.toFixed(0)}/${goals.target_protein}g (${proteinProgress}%)
🌾 Carbs: ${totals.carbs.toFixed(0)}/${goals.target_carbs}g (${carbsProgress}%)
🥑 Gordura: ${totals.fats.toFixed(0)}/${goals.target_fats}g (${fatsProgress}%)

Tracking nutricional inteligente com Cal AI`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Texto copiado!");
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Partilhar Progresso</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview */}
          <div className="glass-card rounded-xl p-6 text-center">
            <h3 className="text-2xl font-bold mb-2">{format(new Date(), "dd 'de' MMMM", { locale: pt })}</h3>
            
            <div className="my-6">
              <p className="text-5xl font-bold text-primary">{totals.calories}</p>
              <p className="text-sm text-muted-foreground mt-1">calorias consumidas</p>
              <p className="text-sm text-muted-foreground">Meta: {goals.daily_calories} kcal ({calorieProgress}%)</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="glass-card p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Proteína</p>
                <p className="text-lg font-bold">{totals.protein.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">{proteinProgress}%</p>
              </div>
              <div className="glass-card p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Carbs</p>
                <p className="text-lg font-bold">{totals.carbs.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">{carbsProgress}%</p>
              </div>
              <div className="glass-card p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Gordura</p>
                <p className="text-lg font-bold">{totals.fats.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">{fatsProgress}%</p>
              </div>
            </div>
          </div>

          {/* Hidden canvas for image generation */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Share options */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleCopyText}
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar Texto
                </>
              )}
            </Button>
            
            <Button
              variant="hero"
              onClick={handleDownloadImage}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Guardar Imagem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
