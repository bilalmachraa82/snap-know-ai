import React, { Component, ReactNode } from "react";
import * as Sentry from "@sentry/react";
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

    // Send error to Sentry with component stack context
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  handleReload = () => {
    // Clear error state and reload the page
    window.location.reload();
  };

  handleReportFeedback = () => {
    // Show Sentry's user feedback dialog
    const eventId = Sentry.lastEventId();
    if (eventId) {
      Sentry.showReportDialog({
        eventId,
        lang: "pt",
        title: "Parece que estamos com problemas.",
        subtitle: "A nossa equipa foi notificada.",
        subtitle2: "Se quiseres ajudar, conta-nos o que aconteceu.",
        labelName: "Nome",
        labelEmail: "Email",
        labelComments: "O que aconteceu?",
        labelClose: "Fechar",
        labelSubmit: "Enviar",
        errorGeneric: "Ocorreu um erro ao enviar o teu feedback. Por favor tenta novamente.",
        errorFormEntry: "Alguns campos são inválidos. Por favor corrige os erros e tenta novamente.",
        successMessage: "O teu feedback foi enviado. Obrigado!",
      });
    }
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={this.handleReload}
                >
                  Recarregar página
                </Button>
                {!isDevelopment && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={this.handleReportFeedback}
                  >
                    Reportar problema
                  </Button>
                )}
              </div>

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
