import { z } from "zod";

/**
 * Authentication Validation Schemas
 */

export const emailSchema = z
  .string()
  .min(1, "Email é obrigatório")
  .email("Email inválido. Por favor, insere um email válido");

export const passwordSchema = z
  .string()
  .min(8, "Password deve ter no mínimo 8 caracteres")
  .max(100, "Password é muito longa")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])|^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])|^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
    "Password deve conter pelo menos duas das seguintes: letras maiúsculas, minúsculas, números ou caracteres especiais"
  );

export const fullNameSchema = z
  .string()
  .min(2, "Nome deve ter no mínimo 2 caracteres")
  .max(100, "Nome é muito longo")
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome contém caracteres inválidos");

export const signUpSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password é obrigatória"),
});

/**
 * Meal Validation Schemas
 */

export const mealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snack"], {
  errorMap: () => ({ message: "Tipo de refeição inválido" }),
});

export const foodNameSchema = z
  .string()
  .min(2, "Nome do prato deve ter no mínimo 2 caracteres")
  .max(100, "Nome do prato é muito longo")
  .trim();

export const caloriesSchema = z
  .number({
    required_error: "Calorias são obrigatórias",
    invalid_type_error: "Calorias devem ser um número",
  })
  .min(0, "Calorias não podem ser negativas")
  .max(10000, "Calorias devem ser no máximo 10,000 kcal")
  .int("Calorias devem ser um número inteiro");

export const proteinSchema = z
  .number({
    required_error: "Proteína é obrigatória",
    invalid_type_error: "Proteína deve ser um número",
  })
  .min(0, "Proteína não pode ser negativa")
  .max(500, "Proteína deve ser no máximo 500g")
  .multipleOf(0.1, "Proteína deve ter no máximo uma casa decimal");

export const carbsSchema = z
  .number({
    required_error: "Carboidratos são obrigatórios",
    invalid_type_error: "Carboidratos devem ser um número",
  })
  .min(0, "Carboidratos não podem ser negativos")
  .max(1000, "Carboidratos devem ser no máximo 1,000g")
  .multipleOf(0.1, "Carboidratos devem ter no máximo uma casa decimal");

export const fatsSchema = z
  .number({
    required_error: "Gordura é obrigatória",
    invalid_type_error: "Gordura deve ser um número",
  })
  .min(0, "Gordura não pode ser negativa")
  .max(500, "Gordura deve ser no máximo 500g")
  .multipleOf(0.1, "Gordura deve ter no máximo uma casa decimal");

export const portionSizeSchema = z
  .string()
  .min(1, "Tamanho da porção é obrigatório")
  .max(100, "Tamanho da porção é muito longo")
  .optional();

export const mealSchema = z.object({
  food_name: foodNameSchema,
  meal_type: mealTypeSchema,
  calories: caloriesSchema,
  protein: proteinSchema,
  carbs: carbsSchema,
  fats: fatsSchema,
  portion_size: portionSizeSchema,
});

// Schema for meal analysis result from AI
export const mealAnalysisSchema = z.object({
  food_name: foodNameSchema,
  meal_type: mealTypeSchema,
  calories: caloriesSchema,
  protein: proteinSchema,
  carbs: carbsSchema,
  fats: fatsSchema,
  portion_size: portionSizeSchema,
  confidence: z.enum(["high", "medium", "low"]).optional(),
});

/**
 * Goals Validation Schemas
 */

export const dailyCaloriesSchema = z
  .number({
    required_error: "Calorias diárias são obrigatórias",
    invalid_type_error: "Calorias diárias devem ser um número",
  })
  .min(1000, "Calorias diárias devem ser no mínimo 1,000 kcal (recomendado para saúde)")
  .max(5000, "Calorias diárias devem ser no máximo 5,000 kcal")
  .int("Calorias diárias devem ser um número inteiro");

export const targetProteinSchema = z
  .number({
    required_error: "Meta de proteína é obrigatória",
    invalid_type_error: "Meta de proteína deve ser um número",
  })
  .min(50, "Meta de proteína deve ser no mínimo 50g (recomendado para saúde)")
  .max(400, "Meta de proteína deve ser no máximo 400g")
  .int("Meta de proteína deve ser um número inteiro");

export const targetCarbsSchema = z
  .number({
    required_error: "Meta de carboidratos é obrigatória",
    invalid_type_error: "Meta de carboidratos deve ser um número",
  })
  .min(50, "Meta de carboidratos deve ser no mínimo 50g (recomendado para saúde)")
  .max(800, "Meta de carboidratos deve ser no máximo 800g")
  .int("Meta de carboidratos deve ser um número inteiro");

export const targetFatsSchema = z
  .number({
    required_error: "Meta de gordura é obrigatória",
    invalid_type_error: "Meta de gordura deve ser um número",
  })
  .min(20, "Meta de gordura deve ser no mínimo 20g (recomendado para saúde)")
  .max(300, "Meta de gordura deve ser no máximo 300g")
  .int("Meta de gordura deve ser um número inteiro");

export const goalsSchema = z.object({
  daily_calories: dailyCaloriesSchema,
  target_protein: targetProteinSchema,
  target_carbs: targetCarbsSchema,
  target_fats: targetFatsSchema,
});

/**
 * TypeScript types inferred from schemas
 */

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type MealInput = z.infer<typeof mealSchema>;
export type MealAnalysisInput = z.infer<typeof mealAnalysisSchema>;
export type GoalsInput = z.infer<typeof goalsSchema>;
export type MealType = z.infer<typeof mealTypeSchema>;
