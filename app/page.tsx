import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  MessageCircle,
  Zap,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-600 to-transparent rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-pink-600 to-transparent rounded-full blur-3xl opacity-20"></div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Novo: Agentes IA em WhatsApp</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance text-foreground leading-tight">
              Automatize suas{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Conversas no WhatsApp
              </span>{" "}
              com IA
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Gerencie agentes de inteligência artificial para atender clientes,
              gerar leads e aumentar vendas de forma automática e inteligente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
            >
              <Link href="/signup" className="flex items-center gap-2">
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-purple-500/20 px-8 py-6 text-lg"
            >
              <Link href="/login">Ver Demo</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-12 max-w-lg mx-auto">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-400">500+</p>
              <p className="text-xs text-muted-foreground">Empresas Ativas</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-pink-400">10M+</p>
              <p className="text-xs text-muted-foreground">Mensagens/Mês</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-orange-400">99.9%</p>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: MessageCircle,
              title: "Atendimento 24/7",
              description: "Responda clientes automaticamente em qualquer horário",
            },
            {
              icon: Zap,
              title: "Automação Inteligente",
              description: "Fluxos de conversação alimentados por IA",
            },
            {
              icon: BarChart3,
              title: "Análises Detalhadas",
              description: "Métricas em tempo real sobre suas conversas",
            },
          ].map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={i}
                className="bg-card border border-purple-500/20 rounded-2xl p-8 backdrop-blur hover:border-purple-500/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Por que escolher Fluxy?
            </h2>
            <p className="text-xl text-muted-foreground">
              Tudo que você precisa para escalar sua comunicação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              "Integração simples com WhatsApp Business API",
              "Suporte em português com resposta rápida",
              "Segurança de dados em conformidade com LGPD",
              "Múltiplos agentes por organização",
              "Análise de sentimento em conversas",
              "Integração com CRM e sistemas externos",
              "Exportação de dados e relatórios",
              "Plataforma em português",
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <p className="text-foreground text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 rounded-3xl p-12 sm:p-16 backdrop-blur text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Pronto para Transformar Suas Conversas?
            </h2>
            <p className="text-xl text-muted-foreground">
              Comece gratuitamente e veja a diferença que Fluxy pode fazer
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
          >
            <Link href="/signup" className="flex items-center gap-2 mx-auto w-fit">
              Criar Conta Grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/20 bg-background/50 backdrop-blur mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-purple-500" />
                <span className="font-bold text-foreground">Fluxy</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Automação de agentes IA para WhatsApp
              </p>
            </div>

            {[
              {
                title: "Produto",
                links: ["Features", "Preços", "Segurança", "Roadmap"],
              },
              {
                title: "Empresa",
                links: ["Sobre", "Blog", "Contato", "Suporte"],
              },
              {
                title: "Legal",
                links: ["Privacidade", "Termos", "LGPD", "Cookies"],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-foreground mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-purple-500/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Fluxy Technologies. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
