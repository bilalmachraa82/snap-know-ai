import React, { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details to console
    console.error("React Error Boundary caught an error:", error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // In production, you could send this to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    // Clear error state and reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
          <Card className="glass-card p-8 max-w-2xl w-full">
            <div className="text-center space-y-6">
              {/* Error Icon */}
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20 mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Algo correu mal
                </h1>
                <p className="text-muted-foreground">
                  Pedimos desculpa, mas ocorreu um erro inesperado.
                  Por favor, tenta recarregar a página.
                </p>
              </div>

              {/* Action Button */}
              <Button
                variant="hero"
                size="lg"
                onClick={this.handleReload}
                className="mx-auto"
              >
                Recarregar página
              </Button>

              {/* Error Details (Development Only) */}
              {isDevelopment && this.state.error && (
                <details className="mt-8 text-left">
                  <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    Detalhes do erro (apenas em desenvolvimento)
                  </summary>
                  <div className="mt-4 p-4 bg-destructive/10 rounded-lg space-y-4 text-xs font-mono">
                    <div>
                      <p className="font-semibold text-destructive mb-2">
                        Error:
                      </p>
                      <p className="text-foreground break-all">
                        {this.state.error.toString()}
                      </p>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <p className="font-semibold text-destructive mb-2">
                          Component Stack:
                        </p>
                        <pre className="text-foreground whitespace-pre-wrap break-all overflow-auto max-h-60">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    {this.state.error.stack && (
                      <div>
                        <p className="font-semibold text-destructive mb-2">
                          Stack Trace:
                        </p>
                        <pre className="text-foreground whitespace-pre-wrap break-all overflow-auto max-h-60">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Production Help Text */}
              {!isDevelopment && (
                <p className="text-xs text-muted-foreground mt-6">
                  Se o problema persistir, por favor contacta o suporte.
                </p>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
