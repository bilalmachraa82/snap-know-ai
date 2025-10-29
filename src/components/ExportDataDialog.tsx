import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format, subDays, subMonths } from "date-fns";

interface ExportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meals: any[];
}

export const ExportDataDialog = ({ open, onOpenChange, meals }: ExportDataDialogProps) => {
  const [period, setPeriod] = useState<"7days" | "30days" | "3months" | "all">("30days");
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");

  const getFilteredMeals = () => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "7days":
        startDate = subDays(now, 7);
        break;
      case "30days":
        startDate = subDays(now, 30);
        break;
      case "3months":
        startDate = subMonths(now, 3);
        break;
      default:
        return meals;
    }

    return meals.filter(meal => new Date(meal.created_at) >= startDate);
  };

  const exportToCSV = () => {
    const filteredMeals = getFilteredMeals();
    
    if (filteredMeals.length === 0) {
      toast.error("Sem dados para exportar");
      return;
    }

    const headers = ["Data", "Refeição", "Tipo", "Calorias", "Proteína (g)", "Carbs (g)", "Gordura (g)", "Porção"];
    const rows = filteredMeals.map(meal => [
      format(new Date(meal.created_at), "dd/MM/yyyy HH:mm"),
      meal.food_name,
      meal.meal_type || "-",
      meal.calories,
      meal.protein || 0,
      meal.carbs || 0,
      meal.fats || 0,
      meal.portion_size || "-"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `calai-export-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Dados exportados com sucesso!");
    onOpenChange(false);
  };

  const exportToPDF = () => {
    const filteredMeals = getFilteredMeals();
    
    if (filteredMeals.length === 0) {
      toast.error("Sem dados para exportar");
      return;
    }

    // Create a simple HTML report
    const totalCalories = filteredMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = filteredMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    const totalCarbs = filteredMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
    const totalFats = filteredMeals.reduce((sum, meal) => sum + (meal.fats || 0), 0);
    const avgCalories = Math.round(totalCalories / filteredMeals.length);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cal AI - Relatório Nutricional</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
          .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
          .stat { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; }
          .stat-label { color: #6b7280; font-size: 14px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>📊 Relatório Nutricional - Cal AI</h1>
        
        <div class="summary">
          <p><strong>Período:</strong> ${period === "7days" ? "Últimos 7 dias" : period === "30days" ? "Últimos 30 dias" : period === "3months" ? "Últimos 3 meses" : "Todo o histórico"}</p>
          <p><strong>Total de Refeições:</strong> ${filteredMeals.length}</p>
          <p><strong>Data de Geração:</strong> ${format(new Date(), "dd/MM/yyyy HH:mm")}</p>
        </div>

        <div class="stats">
          <div class="stat">
            <div class="stat-label">Total de Calorias</div>
            <div class="stat-value">${totalCalories.toLocaleString()} kcal</div>
          </div>
          <div class="stat">
            <div class="stat-label">Média Diária</div>
            <div class="stat-value">${avgCalories.toLocaleString()} kcal</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Proteína</div>
            <div class="stat-value">${totalProtein.toFixed(1)} g</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Carbs</div>
            <div class="stat-value">${totalCarbs.toFixed(1)} g</div>
          </div>
        </div>

        <h2>Detalhes das Refeições</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Refeição</th>
              <th>Calorias</th>
              <th>Proteína</th>
              <th>Carbs</th>
              <th>Gordura</th>
            </tr>
          </thead>
          <tbody>
            ${filteredMeals.map(meal => `
              <tr>
                <td>${format(new Date(meal.created_at), "dd/MM/yyyy")}</td>
                <td>${meal.food_name}</td>
                <td>${meal.calories} kcal</td>
                <td>${(meal.protein || 0).toFixed(1)}g</td>
                <td>${(meal.carbs || 0).toFixed(1)}g</td>
                <td>${(meal.fats || 0).toFixed(1)}g</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>Cal AI - Tracking Nutricional Inteligente</p>
          <p>Este relatório foi gerado automaticamente</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `calai-report-${format(new Date(), "yyyy-MM-dd")}.html`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Relatório gerado! Abre o ficheiro HTML e usa 'Imprimir > Guardar como PDF' no teu browser.");
    onOpenChange(false);
  };

  const handleExport = () => {
    if (exportFormat === "csv") {
      exportToCSV();
    } else {
      exportToPDF();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exportar Dados</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="all">Todo o histórico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Formato</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat("csv")}
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  exportFormat === "csv" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <FileSpreadsheet className="h-8 w-8" />
                <span className="text-sm font-medium">CSV</span>
              </button>
              
              <button
                onClick={() => setExportFormat("pdf")}
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  exportFormat === "pdf" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <FileText className="h-8 w-8" />
                <span className="text-sm font-medium">PDF/HTML</span>
              </button>
            </div>
          </div>

          <div className="glass-card p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {getFilteredMeals().length} refeições serão exportadas
            </p>
          </div>

          <Button 
            variant="hero" 
            className="w-full"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
