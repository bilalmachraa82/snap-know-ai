import { format } from "date-fns";
import { pt } from "date-fns/locale";

export interface Meal {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal_type: string;
  created_at: string;
}

/**
 * Converts an array of meals to CSV format and triggers a browser download
 * @param meals - Array of meal objects to export
 * @param filename - Name of the CSV file (without extension)
 */
export const exportMealsToCSV = (meals: Meal[], filename: string): void => {
  if (meals.length === 0) {
    throw new Error("Não há dados para exportar");
  }

  // CSV Headers (Portuguese)
  const headers = [
    "Data",
    "Hora",
    "Tipo de Refeição",
    "Alimento",
    "Calorias",
    "Proteína (g)",
    "Carboidratos (g)",
    "Gordura (g)",
  ];

  // Meal type translations
  const mealTypeLabels: Record<string, string> = {
    breakfast: "Pequeno-almoço",
    lunch: "Almoço",
    dinner: "Jantar",
    snack: "Snack",
  };

  // Convert meals to CSV rows
  const csvRows = meals.map((meal) => {
    const date = new Date(meal.created_at);
    const dateStr = format(date, "dd/MM/yyyy", { locale: pt });
    const timeStr = format(date, "HH:mm", { locale: pt });
    const mealType = mealTypeLabels[meal.meal_type] || meal.meal_type;

    return [
      dateStr,
      timeStr,
      mealType,
      escapeCsvValue(meal.food_name),
      meal.calories.toString(),
      (meal.protein || 0).toFixed(1),
      (meal.carbs || 0).toFixed(1),
      (meal.fats || 0).toFixed(1),
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...csvRows.map((row) => row.join(",")),
  ].join("\n");

  // Add UTF-8 BOM for Excel compatibility
  const BOM = "\uFEFF";
  const csvWithBOM = BOM + csvContent;

  // Create blob and trigger download
  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Escapes special characters in CSV values
 * @param value - String value to escape
 * @returns Escaped CSV value
 */
const escapeCsvValue = (value: string): string => {
  // If the value contains comma, quote, or newline, wrap it in quotes
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    // Escape quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Generates a filename with date range for CSV export
 * @param startDate - Start date of the export range
 * @param endDate - End date of the export range
 * @returns Formatted filename
 */
export const generateExportFilename = (
  startDate?: Date,
  endDate?: Date
): string => {
  const today = new Date();

  if (!startDate || !endDate) {
    return `cal-ai-export-${format(today, "yyyy-MM-dd")}`;
  }

  // If same date, use single date
  if (format(startDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd")) {
    return `cal-ai-export-${format(startDate, "yyyy-MM-dd")}`;
  }

  // If different dates, use range
  return `cal-ai-export-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}`;
};
