import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Home, LayoutDashboard } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Only log in development to avoid console pollution in production
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="glass-card p-8 md:p-12 max-w-2xl w-full">
        <div className="text-center space-y-6">
          {/* 404 Icon */}
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 mb-4">
            <MapPin className="h-10 w-10 text-primary" />
          </div>

          {/* Error Code */}
          <div className="space-y-2">
            <h1 className="text-6xl md:text-7xl font-bold text-primary">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Página não encontrada
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Oops! A página que procuras não existe ou foi movida.
              Verifica o endereço ou volta à página inicial.
            </p>
          </div>

          {/* Attempted URL (Dev Only) */}
          {import.meta.env.DEV && (
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground">
                <span className="font-semibold">URL tentado:</span>{" "}
                <code className="text-foreground">{location.pathname}</code>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              variant="hero"
              size="lg"
              asChild
              className="min-w-[200px]"
            >
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                Página Inicial
              </Link>
            </Button>

            {user && (
              <Button
                variant="outline"
                size="lg"
                asChild
                className="min-w-[200px]"
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Dashboard
                </Link>
              </Button>
            )}
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground pt-6">
            Se achas que isto é um erro, por favor contacta o suporte.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
