import { Button } from "@/components/ui/button";
import { Camera, Sparkles, LineChart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-food.jpg";
import iconCamera from "@/assets/icon-camera.png";
import iconAI from "@/assets/icon-ai.png";
import iconNutrition from "@/assets/icon-nutrition.png";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Header/Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Cal AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <Link to="/auth">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero">Começar Grátis</Button>
            </Link>
          </nav>
          <Link to="/auth" className="md:hidden">
            <Button size="sm" variant="hero">Começar</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-light/30 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Powered by AI
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Snap, Scan,
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Know</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-xl">
                Tracking nutricional inteligente. Tira foto da tua refeição e recebe análise completa de calorias e macronutrientes em segundos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" variant="hero" className="w-full sm:w-auto">
                    Começar Grátis <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ver Demo
                </Button>
              </div>
              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  Setup em 30 segundos
                </div>
              </div>
            </div>
            <div className="relative lg:h-[600px]">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-border/50">
                <img 
                  src={heroImage} 
                  alt="Análise de refeição com smartphone" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 glass-card rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Frango Grelhado com Quinoa</p>
                      <p className="text-xs text-muted-foreground mt-1">Porção: 350g</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">485</p>
                      <p className="text-xs text-muted-foreground">calorias</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-sm font-semibold text-foreground">42g</p>
                      <p className="text-xs text-muted-foreground">Proteína</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">38g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">12g</p>
                      <p className="text-xs text-muted-foreground">Gordura</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-secondary/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Tracking nunca foi tão <span className="text-primary">fácil</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Eliminamos a fricção entre refeição e registo. Tecnologia de IA para análise instantânea.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="glass-card rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary">
                <img src={iconCamera} alt="Câmara" className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Snap & Analyze</h3>
              <p className="text-muted-foreground">
                Tira foto da tua refeição. A nossa IA identifica os alimentos e calcula calorias automaticamente.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary">
                <img src={iconAI} alt="IA" className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-3">IA Inteligente</h3>
              <p className="text-muted-foreground">
                Reconhecimento avançado de alimentos com precisão de +80%. Aprende com cada utilização.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary">
                <img src={iconNutrition} alt="Nutrição" className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tracking Completo</h3>
              <p className="text-muted-foreground">
                Calorias, proteínas, carboidratos e gorduras. Dashboard visual com progresso diário.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-32">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Como funciona?
            </h2>
            <p className="text-lg text-muted-foreground">
              3 passos simples para começar o teu tracking nutricional
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-semibold">Cria conta</h3>
              </div>
              <p className="text-muted-foreground ml-16">
                Registo rápido com email ou Google. Sem cartão de crédito necessário.
              </p>
            </div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-semibold">Tira foto</h3>
              </div>
              <p className="text-muted-foreground ml-16">
                Captura a tua refeição. A IA analisa em menos de 5 segundos.
              </p>
            </div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-semibold">Acompanha progresso</h3>
              </div>
              <p className="text-muted-foreground ml-16">
                Dashboard visual com totais diários e histórico completo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-hero">
        <div className="container">
          <div className="glass-card rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              Pronto para começar?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junta-te a milhares de utilizadores que já transformaram o seu tracking nutricional com Cal AI.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="hero">
                Começar Grátis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Sem compromisso. Cancela quando quiseres.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-secondary/30">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">Cal AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tracking nutricional inteligente powered by AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Termos</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 Cal AI. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
