import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

// Email validation schema
const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido")
    .max(255, "Email demasiado longo"),
});

interface WaitlistFormProps {
  source?: string;
  className?: string;
}

export const WaitlistForm = ({ source = "landing_page", className = "" }: WaitlistFormProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setValidationError(null);

    // Validate email
    try {
      emailSchema.parse({ email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || "Email inválido";
        setValidationError(errorMessage);
        toast.error(errorMessage);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Insert email into waitlist table
      const { error } = await supabase
        .from("waitlist")
        .insert([
          {
            email: email.toLowerCase().trim(),
            source: source,
          },
        ]);

      if (error) {
        // Check for duplicate email error
        if (error.code === "23505") {
          // Unique constraint violation
          toast.error("Este email já está na waitlist!");
          setValidationError("Este email já está registado");
          return;
        }

        throw error;
      }

      // Success!
      setIsSuccess(true);
      setEmail("");
      toast.success("Email registado! Entraremos em contacto em breve.");

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error("Waitlist error:", error);
      toast.error(error.message || "Erro ao registar email. Tenta novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`glass-card rounded-2xl p-6 text-center ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Obrigado!</h3>
            <p className="text-sm text-muted-foreground">
              Email registado com sucesso. Falaremos em breve!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="email"
              placeholder="o-teu-email@exemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setValidationError(null);
              }}
              disabled={isSubmitting}
              className={`pl-10 ${validationError ? 'border-destructive' : ''}`}
              required
            />
          </div>
          <Button
            type="submit"
            variant="hero"
            disabled={isSubmitting || !email}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A registar...
              </>
            ) : (
              "Junta-te à Waitlist"
            )}
          </Button>
        </div>
        {validationError && (
          <p className="text-xs text-destructive">{validationError}</p>
        )}
      </form>
    </div>
  );
};
