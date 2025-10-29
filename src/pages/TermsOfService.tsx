import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Scale, FileText, Shield, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container max-w-4xl py-8 md:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>

        <div className="glass-card rounded-2xl p-8 md:p-12 shadow-xl">
          <div className="text-center mb-12">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary mb-4">
              <Scale className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Termos de Serviço</h1>
            <p className="text-muted-foreground">Última atualização: 29 de outubro de 2025</p>
          </div>

          <div className="glass-card bg-yellow-500/10 border-yellow-500/30 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Aviso Legal
                </p>
                <p className="text-yellow-800 dark:text-yellow-200">
                  Este é um documento modelo. Recomendamos fortemente que reveja estes termos com um advogado
                  especializado antes de utilizar em produção. Cal AI não se responsabiliza pela adequação legal
                  deste documento às suas necessidades específicas.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-sm md:prose-base max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                1. Introdução
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Bem-vindo ao Cal AI ("nós", "nosso", "Serviço"). Estes Termos de Serviço ("Termos") regem o seu
                acesso e uso da aplicação Cal AI, incluindo qualquer conteúdo, funcionalidade e serviços oferecidos
                através da nossa plataforma web e mobile.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Ao criar uma conta ou utilizar o nosso Serviço, você concorda em ficar vinculado a estes Termos.
                Se não concordar com qualquer parte destes Termos, não poderá aceder ou utilizar o Serviço.
              </p>
            </section>

            {/* Use of Service */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Utilização do Serviço</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Elegibilidade</h3>
              <p className="text-muted-foreground leading-relaxed">
                Deve ter pelo menos 16 anos de idade para utilizar este Serviço. Ao concordar com estes Termos,
                você declara que tem pelo menos 16 anos de idade e possui capacidade legal para celebrar um
                contrato vinculativo.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Registo de Conta</h3>
              <p className="text-muted-foreground leading-relaxed">
                Para aceder a determinadas funcionalidades do Serviço, deve criar uma conta. Você concorda em:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Fornecer informações precisas, atuais e completas durante o registo</li>
                <li>Manter a segurança da sua password e aceitar toda a responsabilidade pelas atividades na sua conta</li>
                <li>Notificar-nos imediatamente de qualquer uso não autorizado da sua conta</li>
                <li>Não partilhar as suas credenciais de acesso com terceiros</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Uso Aceitável</h3>
              <p className="text-muted-foreground leading-relaxed">Você concorda em não:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Utilizar o Serviço para qualquer propósito ilegal ou não autorizado</li>
                <li>Tentar obter acesso não autorizado ao Serviço ou sistemas relacionados</li>
                <li>Interferir ou interromper o funcionamento do Serviço</li>
                <li>Fazer engenharia reversa, descompilar ou desmontar qualquer parte do Serviço</li>
                <li>Transmitir vírus, malware ou qualquer código malicioso</li>
                <li>Utilizar o Serviço para spam, phishing ou outras atividades abusivas</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Contas de Utilizador</h2>
              <p className="text-muted-foreground leading-relaxed">
                É responsável por manter a confidencialidade da sua conta e password. Você é totalmente
                responsável por todas as atividades que ocorram sob a sua conta. Reservamo-nos o direito de
                suspender ou encerrar a sua conta se detetarmos atividades suspeitas ou violações destes Termos.
              </p>
            </section>

            {/* Data Collection */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Recolha e Utilização de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                O nosso Serviço recolhe e processa dados pessoais conforme descrito na nossa{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
                . Ao utilizar o Serviço, você consente com a recolha e utilização de informações de acordo com
                essa política.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                As funcionalidades principais incluem:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Análise de imagens de refeições através de inteligência artificial</li>
                <li>Armazenamento de dados nutricionais e histórico de refeições</li>
                <li>Autenticação via Google OAuth</li>
                <li>Sincronização de dados na cloud via Supabase</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Propriedade Intelectual</h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Nosso Conteúdo</h3>
              <p className="text-muted-foreground leading-relaxed">
                O Serviço e todo o seu conteúdo, funcionalidades e recursos (incluindo mas não se limitando a
                software, texto, gráficos, logos, imagens e design) são propriedade do Cal AI ou dos seus
                licenciadores e estão protegidos por direitos de autor, marca registada e outras leis de propriedade
                intelectual.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Seu Conteúdo</h3>
              <p className="text-muted-foreground leading-relaxed">
                Você mantém todos os direitos sobre as imagens e dados que submete ao Serviço ("Conteúdo do
                Utilizador"). Ao submeter Conteúdo do Utilizador, você concede-nos uma licença mundial, não
                exclusiva, livre de royalties para usar, armazenar, processar e exibir esse conteúdo exclusivamente
                para fornecer e melhorar o Serviço.
              </p>
            </section>

            {/* AI Accuracy Disclaimer */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Precisão da Análise Nutricional</h2>
              <div className="glass-card bg-blue-500/10 border-blue-500/30 rounded-lg p-4">
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Aviso Importante:</strong> As análises nutricionais fornecidas pelo Cal AI são geradas por
                  inteligência artificial e devem ser consideradas estimativas. Embora nos esforcemos por fornecer
                  informações precisas, não garantimos 100% de exatidão. Os resultados podem variar com base na
                  qualidade da imagem, porções, ingredientes e preparação.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  O Serviço destina-se apenas a fins informativos e não substitui aconselhamento médico,
                  nutricional ou dietético profissional. Consulte sempre um profissional de saúde qualificado para
                  orientação personalizada sobre nutrição e dieta.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                Na medida máxima permitida pela lei aplicável, o Cal AI não será responsável por quaisquer danos
                indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo mas não se limitando a
                perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes de:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Seu acesso ou uso (ou incapacidade de aceder ou usar) o Serviço</li>
                <li>Qualquer conduta ou conteúdo de terceiros no Serviço</li>
                <li>Qualquer conteúdo obtido do Serviço</li>
                <li>Acesso não autorizado, uso ou alteração das suas transmissões ou conteúdo</li>
                <li>Imprecisões nas análises nutricionais fornecidas</li>
              </ul>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Disponibilidade do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                Esforçamo-nos por manter o Serviço disponível 24/7, mas não garantimos que o Serviço estará
                sempre disponível, ininterrupto ou livre de erros. Podemos suspender, descontinuar ou modificar
                qualquer parte do Serviço a qualquer momento sem aviso prévio.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Rescisão</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos encerrar ou suspender o seu acesso ao Serviço imediatamente, sem aviso prévio ou
                responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar estes Termos.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Você pode encerrar a sua conta a qualquer momento através das definições da aplicação ou
                contactando-nos. Após o encerramento, o seu direito de utilizar o Serviço cessará imediatamente.
                Os dados poderão ser mantidos de acordo com a nossa Política de Privacidade e requisitos legais.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Alterações aos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Se uma
                revisão for substancial, tentaremos fornecer pelo menos 30 dias de aviso prévio antes de quaisquer
                novos termos entrarem em vigor.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                O que constitui uma alteração substancial será determinado a nosso critério. Ao continuar a aceder
                ou utilizar o nosso Serviço após essas revisões entrarem em vigor, você concorda em ficar vinculado
                aos termos revistos.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Lei Aplicável</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos serão regidos e interpretados de acordo com as leis de Portugal e da União Europeia,
                incluindo o Regulamento Geral sobre a Proteção de Dados (RGPD), sem considerar as suas
                disposições sobre conflitos de leis.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                12. Contacto
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Se tiver alguma questão sobre estes Termos de Serviço, por favor contacte-nos:
              </p>
              <div className="glass-card bg-secondary/30 rounded-lg p-4 mt-4">
                <p className="text-muted-foreground">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:legal@calai.app" className="text-primary hover:underline">
                    legal@calai.app
                  </a>
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>Website:</strong>{" "}
                  <a href="https://calai.app" className="text-primary hover:underline">
                    https://calai.app
                  </a>
                </p>
              </div>
            </section>

            {/* Severability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Divisibilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                Se qualquer disposição destes Termos for considerada inválida ou inexequível, essa disposição será
                limitada ou eliminada na medida mínima necessária, e as disposições restantes permanecerão em
                pleno vigor e efeito.
              </p>
            </section>

            {/* Entire Agreement */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Acordo Integral</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos, juntamente com a nossa Política de Privacidade, constituem o acordo integral entre
                você e o Cal AI relativamente ao uso do Serviço e substituem todos os acordos anteriores e
                contemporâneos, sejam escritos ou orais.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                <Sparkles className="mr-2 h-5 w-5" />
                Começar a usar Cal AI
              </Button>
            </Link>
            <Link to="/privacy">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ler Política de Privacidade
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
