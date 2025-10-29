import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Shield, Lock, Eye, Database, Globe, Mail, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
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
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de Privacidade</h1>
            <p className="text-muted-foreground">Última atualização: 29 de outubro de 2025</p>
          </div>

          <div className="glass-card bg-blue-500/10 border-blue-500/30 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Compromisso com a sua Privacidade
                </p>
                <p className="text-blue-800 dark:text-blue-200">
                  Esta política está em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD)
                  da União Europeia. Levamos a sua privacidade a sério e estamos comprometidos em proteger os
                  seus dados pessoais.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-sm md:prose-base max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                1. Introdução
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A Cal AI ("nós", "nosso", "Serviço") respeita a sua privacidade e está comprometida em proteger
                os seus dados pessoais. Esta Política de Privacidade explica como recolhemos, utilizamos,
                armazenamos e protegemos as suas informações quando utiliza a nossa aplicação de tracking
                nutricional.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Esta política aplica-se a todos os utilizadores do Cal AI, incluindo utilizadores da versão web e
                mobile da aplicação.
              </p>
            </section>

            {/* Data Controller */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Responsável pelo Tratamento de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para os efeitos do RGPD, o Cal AI é o responsável pelo tratamento dos seus dados pessoais. Se
                tiver questões sobre esta política ou sobre como tratamos os seus dados, pode contactar-nos através
                dos contactos fornecidos no final deste documento.
              </p>
            </section>

            {/* Data Collection */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                3. Dados que Recolhemos
              </h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Informações de Conta</h3>
              <p className="text-muted-foreground leading-relaxed">
                Quando cria uma conta, recolhemos:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li><strong>Nome completo:</strong> Para personalizar a sua experiência</li>
                <li><strong>Endereço de email:</strong> Para autenticação e comunicações</li>
                <li><strong>Password encriptada:</strong> Para segurança da conta (nunca armazenamos passwords em texto simples)</li>
                <li><strong>Data de criação da conta:</strong> Para fins administrativos</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Dados de Autenticação via Google</h3>
              <p className="text-muted-foreground leading-relaxed">
                Se optar por fazer login através do Google OAuth, recolhemos:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Nome associado à sua conta Google</li>
                <li>Endereço de email da conta Google</li>
                <li>Foto de perfil do Google (se disponível)</li>
                <li>ID único do utilizador fornecido pelo Google</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">3.3 Dados Nutricionais e de Refeições</h3>
              <p className="text-muted-foreground leading-relaxed">
                Durante a utilização do Serviço, recolhemos:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li><strong>Imagens de refeições:</strong> Fotos que submete para análise nutricional</li>
                <li><strong>Análises nutricionais:</strong> Calorias, macronutrientes (proteínas, carboidratos, gorduras) calculados pela nossa IA</li>
                <li><strong>Histórico de refeições:</strong> Registo cronológico das suas refeições e análises</li>
                <li><strong>Notas e descrições:</strong> Qualquer informação adicional que adicione às refeições</li>
                <li><strong>Data e hora:</strong> Timestamps de quando as refeições foram registadas</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">3.4 Dados Técnicos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Recolhemos automaticamente certos dados técnicos:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Endereço IP (para segurança e prevenção de fraude)</li>
                <li>Tipo de navegador e dispositivo</li>
                <li>Sistema operativo</li>
                <li>Timestamps de sessão</li>
                <li>Logs de erros e diagnóstico (para melhorar o Serviço)</li>
              </ul>
            </section>

            {/* How We Use Data */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Como Utilizamos os Seus Dados</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Utilizamos os seus dados pessoais para as seguintes finalidades, com base legal no RGPD:
              </p>

              <div className="space-y-4">
                <div className="glass-card bg-secondary/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Execução do Contrato (Art. 6(1)(b) RGPD)</h4>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                    <li>Fornecer os serviços de tracking nutricional</li>
                    <li>Processar e armazenar as suas refeições e análises</li>
                    <li>Manter e gerir a sua conta</li>
                    <li>Autenticar o seu acesso ao Serviço</li>
                  </ul>
                </div>

                <div className="glass-card bg-secondary/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Interesses Legítimos (Art. 6(1)(f) RGPD)</h4>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                    <li>Melhorar e otimizar o Serviço e a experiência do utilizador</li>
                    <li>Análise de uso agregado e anónimo para desenvolvimento de funcionalidades</li>
                    <li>Garantir a segurança e prevenir fraudes</li>
                    <li>Resolver problemas técnicos e bugs</li>
                  </ul>
                </div>

                <div className="glass-card bg-secondary/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Consentimento (Art. 6(1)(a) RGPD)</h4>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                    <li>Enviar comunicações de marketing (se optar por receber)</li>
                    <li>Utilizar cookies não essenciais (mediante consentimento)</li>
                  </ul>
                </div>

                <div className="glass-card bg-secondary/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Obrigações Legais (Art. 6(1)(c) RGPD)</h4>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                    <li>Cumprir com requisitos legais e regulamentares</li>
                    <li>Responder a solicitações de autoridades competentes</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Storage */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-primary" />
                5. Armazenamento e Segurança de Dados
              </h2>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Infraestrutura</h3>
              <p className="text-muted-foreground leading-relaxed">
                Os seus dados são armazenados de forma segura utilizando <strong>Supabase</strong>, uma plataforma de
                base de dados moderna e segura que cumpre com os mais elevados padrões de segurança e está em
                conformidade com o RGPD.
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Dados encriptados em trânsito (TLS/SSL)</li>
                <li>Encriptação de dados em repouso</li>
                <li>Backups automáticos e seguros</li>
                <li>Servidores localizados na União Europeia (quando possível)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Medidas de Segurança</h3>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas técnicas e organizacionais apropriadas para proteger os seus dados:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Autenticação segura com passwords encriptadas</li>
                <li>Proteção contra acesso não autorizado</li>
                <li>Monitorização regular de segurança</li>
                <li>Controlo de acesso baseado em funções</li>
                <li>Auditoria de logs de acesso</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">5.3 Processamento de Imagens</h3>
              <p className="text-muted-foreground leading-relaxed">
                As imagens de refeições que submete são processadas através de serviços de inteligência artificial
                para análise nutricional. As imagens podem ser:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Armazenadas temporariamente durante o processamento</li>
                <li>Mantidas na sua conta para histórico (pode eliminá-las a qualquer momento)</li>
                <li>Processadas por serviços de IA terceiros (com medidas de segurança adequadas)</li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                6. Serviços de Terceiros
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Para fornecer o nosso Serviço, utilizamos os seguintes fornecedores terceiros:
              </p>

              <div className="space-y-4">
                <div className="glass-card bg-secondary/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Supabase (Base de Dados e Autenticação)</h4>
                  <p className="text-muted-foreground text-sm mb-2">
                    <strong>Finalidade:</strong> Armazenamento de dados, autenticação de utilizadores e gestão de sessões
                  </p>
                  <p className="text-muted-foreground text-sm mb-2">
                    <strong>Localização:</strong> União Europeia / Estados Unidos (conforme configuração)
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Conformidade:</strong> RGPD compliant, certificado SOC 2 Type II
                  </p>
                </div>

                <div className="glass-card bg-secondary/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Google OAuth</h4>
                  <p className="text-muted-foreground text-sm mb-2">
                    <strong>Finalidade:</strong> Autenticação de utilizadores através de conta Google
                  </p>
                  <p className="text-muted-foreground text-sm mb-2">
                    <strong>Dados partilhados:</strong> Nome, email, foto de perfil (com o seu consentimento)
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Conformidade:</strong> RGPD compliant
                  </p>
                </div>

                <div className="glass-card bg-secondary/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Lovable AI / Serviços de IA</h4>
                  <p className="text-muted-foreground text-sm mb-2">
                    <strong>Finalidade:</strong> Análise de imagens de refeições e cálculo nutricional
                  </p>
                  <p className="text-muted-foreground text-sm mb-2">
                    <strong>Dados processados:</strong> Imagens de refeições (temporariamente para análise)
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Retenção:</strong> Imagens não são retidas permanentemente pelos serviços de IA após processamento
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mt-4">
                Todos os nossos fornecedores terceiros são selecionados com base na sua conformidade com o RGPD
                e compromisso com a segurança de dados. Estabelecemos acordos de processamento de dados com
                todos os fornecedores que processam dados pessoais em nosso nome.
              </p>
            </section>

            {/* User Rights */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-primary" />
                7. Os Seus Direitos (RGPD)
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                De acordo com o RGPD, você tem os seguintes direitos relativamente aos seus dados pessoais:
              </p>

              <div className="space-y-3">
                <div className="glass-card bg-primary/5 border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Direito de Acesso (Art. 15)</h4>
                  <p className="text-muted-foreground text-sm">
                    Pode solicitar uma cópia de todos os dados pessoais que temos sobre si. Forneceremos os dados
                    em formato estruturado e de uso comum.
                  </p>
                </div>

                <div className="glass-card bg-primary/5 border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Direito de Retificação (Art. 16)</h4>
                  <p className="text-muted-foreground text-sm">
                    Pode corrigir ou atualizar os seus dados pessoais a qualquer momento através das definições da
                    sua conta ou contactando-nos.
                  </p>
                </div>

                <div className="glass-card bg-primary/5 border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Direito ao Apagamento / "Direito a Ser Esquecido" (Art. 17)</h4>
                  <p className="text-muted-foreground text-sm">
                    Pode solicitar a eliminação dos seus dados pessoais. Processaremos o pedido dentro de 30 dias,
                    salvo se tivermos obrigação legal de manter certos dados.
                  </p>
                </div>

                <div className="glass-card bg-primary/5 border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Direito à Portabilidade dos Dados (Art. 20)</h4>
                  <p className="text-muted-foreground text-sm">
                    Pode solicitar uma exportação dos seus dados em formato JSON ou CSV para transferir para outro
                    serviço.
                  </p>
                </div>

                <div className="glass-card bg-primary/5 border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Direito de Oposição (Art. 21)</h4>
                  <p className="text-muted-foreground text-sm">
                    Pode opor-se ao processamento dos seus dados para fins de marketing direto ou com base em
                    interesses legítimos.
                  </p>
                </div>

                <div className="glass-card bg-primary/5 border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Direito à Limitação do Tratamento (Art. 18)</h4>
                  <p className="text-muted-foreground text-sm">
                    Pode solicitar a limitação do processamento dos seus dados em certas circunstâncias.
                  </p>
                </div>

                <div className="glass-card bg-primary/5 border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Direito de Retirar Consentimento</h4>
                  <p className="text-muted-foreground text-sm">
                    Sempre que o processamento se basear no seu consentimento, pode retirá-lo a qualquer momento.
                  </p>
                </div>

                <div className="glass-card bg-primary/5 border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Direito de Apresentar Reclamação</h4>
                  <p className="text-muted-foreground text-sm">
                    Tem o direito de apresentar reclamação à autoridade de proteção de dados competente (em Portugal:
                    CNPD - Comissão Nacional de Proteção de Dados).
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mt-4">
                Para exercer qualquer um destes direitos, contacte-nos através dos contactos fornecidos no final
                deste documento. Responderemos ao seu pedido dentro de 30 dias.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Cookies e Tecnologias Similares</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies e tecnologias similares para:
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">8.1 Cookies Essenciais</h3>
              <p className="text-muted-foreground leading-relaxed">
                Estes cookies são necessários para o funcionamento básico do Serviço e não podem ser desativados:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Cookies de autenticação e sessão</li>
                <li>Cookies de segurança</li>
                <li>Cookies de preferências básicas</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">8.2 Cookies de Análise (Opcional)</h3>
              <p className="text-muted-foreground leading-relaxed">
                Com o seu consentimento, podemos utilizar cookies de análise para entender como o Serviço é
                utilizado e melhorar a experiência do utilizador.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">8.3 Gestão de Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pode gerir as suas preferências de cookies através das definições do seu navegador. Note que
                desativar cookies essenciais pode afetar a funcionalidade do Serviço.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Retenção de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Retemos os seus dados pessoais apenas pelo tempo necessário para as finalidades descritas nesta
                política:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-muted-foreground">
                <li><strong>Dados de conta:</strong> Enquanto a sua conta estiver ativa</li>
                <li><strong>Dados de refeições:</strong> Enquanto mantiver a sua conta (pode eliminar individualmente)</li>
                <li><strong>Dados de autenticação:</strong> Enquanto a conta estiver ativa</li>
                <li><strong>Logs técnicos:</strong> Máximo de 90 dias</li>
                <li><strong>Dados de backup:</strong> Até 30 dias após eliminação da conta</li>
              </ul>

              <p className="text-muted-foreground leading-relaxed mt-3">
                Após o encerramento da sua conta, eliminaremos ou anonimizaremos os seus dados pessoais dentro de
                30 dias, exceto quando somos obrigados por lei a reter certos dados por mais tempo.
              </p>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Transferências Internacionais de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Os seus dados são primariamente armazenados e processados dentro da União Europeia. No entanto,
                alguns dos nossos fornecedores de serviços podem estar localizados fora do EEE (Espaço Económico
                Europeu).
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Quando transferimos dados para fora do EEE, garantimos que existem salvaguardas adequadas,
                incluindo:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Cláusulas contratuais padrão aprovadas pela Comissão Europeia</li>
                <li>Certificações de adequação (ex: Privacy Shield para EUA, quando aplicável)</li>
                <li>Acordos de processamento de dados em conformidade com o RGPD</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Privacidade de Menores</h2>
              <p className="text-muted-foreground leading-relaxed">
                O nosso Serviço destina-se a utilizadores com 16 anos ou mais. Não recolhemos intencionalmente
                dados pessoais de menores de 16 anos. Se tomarmos conhecimento de que recolhemos dados de um
                menor sem consentimento parental apropriado, tomaremos medidas para eliminar essas informações.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Alterações a Esta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças nas nossas
                práticas ou por outras razões operacionais, legais ou regulamentares.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Notificaremos sobre alterações substanciais através de:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Email para o endereço registado na sua conta</li>
                <li>Notificação proeminente na aplicação</li>
                <li>Atualização da data "Última atualização" no topo desta política</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Encorajamos a rever esta política periodicamente para se manter informado sobre como protegemos os
                seus dados.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                13. Contacto e Encarregado de Proteção de Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Se tiver questões sobre esta Política de Privacidade, pretender exercer os seus direitos ao abrigo
                do RGPD, ou tiver preocupações sobre como tratamos os seus dados, contacte-nos:
              </p>

              <div className="glass-card bg-secondary/30 rounded-lg p-4">
                <p className="text-muted-foreground mb-2">
                  <strong>Email de Privacidade:</strong>{" "}
                  <a href="mailto:privacy@calai.app" className="text-primary hover:underline">
                    privacy@calai.app
                  </a>
                </p>
                <p className="text-muted-foreground mb-2">
                  <strong>Email Geral:</strong>{" "}
                  <a href="mailto:support@calai.app" className="text-primary hover:underline">
                    support@calai.app
                  </a>
                </p>
                <p className="text-muted-foreground mb-2">
                  <strong>Website:</strong>{" "}
                  <a href="https://calai.app" className="text-primary hover:underline">
                    https://calai.app
                  </a>
                </p>
                <p className="text-muted-foreground mt-4 pt-4 border-t text-sm">
                  <strong>Autoridade de Controlo em Portugal:</strong><br />
                  CNPD - Comissão Nacional de Proteção de Dados<br />
                  Website:{" "}
                  <a href="https://www.cnpd.pt" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    www.cnpd.pt
                  </a>
                </p>
              </div>
            </section>

            {/* Consent */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Consentimento</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao utilizar o Cal AI, você reconhece que leu e compreendeu esta Política de Privacidade e
                consente com a recolha, utilização e partilha das suas informações conforme descrito nesta política.
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
            <Link to="/terms">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ler Termos de Serviço
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
