import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const passwordStrength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber].filter(Boolean).length;
  const isPasswordValid = hasMinLength && passwordsMatch;

  useEffect(() => {
    // Check if user came from reset password link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");

    if (type !== "recovery") {
      toast.error("Link de recuperação inválido");
      navigate("/auth");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error("Por favor, verifica os requisitos da password");
      return;
    }

    if (!passwordsMatch) {
      toast.error("As passwords não coincidem");
      return;
    }

    setLoading(true);

    try {
      await updatePassword(newPassword);
    } catch (error) {
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Fraca";
    if (passwordStrength === 2) return "Média";
    if (passwordStrength === 3) return "Boa";
    return "Forte";
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary mb-4">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Criar Nova Password</h1>
            <p className="text-muted-foreground">
              Introduz a tua nova password abaixo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {newPassword && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Força da password:</span>
                    <span className={`font-medium ${
                      passwordStrength <= 1 ? "text-red-500" :
                      passwordStrength === 2 ? "text-orange-500" :
                      passwordStrength === 3 ? "text-yellow-500" :
                      "text-green-500"
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${getStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    />
                  </div>

                  <div className="space-y-1 mt-3">
                    <div className={`flex items-center gap-2 text-xs ${hasMinLength ? "text-green-600" : "text-muted-foreground"}`}>
                      {hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${hasUpperCase ? "text-green-600" : "text-muted-foreground"}`}>
                      {hasUpperCase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Letra maiúscula</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${hasLowerCase ? "text-green-600" : "text-muted-foreground"}`}>
                      {hasLowerCase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Letra minúscula</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${hasNumber ? "text-green-600" : "text-muted-foreground"}`}>
                      {hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Número</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {confirmPassword && (
                <div className={`flex items-center gap-2 text-xs mt-2 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                  {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>{passwordsMatch ? "As passwords coincidem" : "As passwords não coincidem"}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              size="lg"
              disabled={loading || !isPasswordValid}
            >
              {loading ? "A processar..." : "Alterar Password"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="text-primary font-medium hover:underline"
            >
              Voltar ao login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
