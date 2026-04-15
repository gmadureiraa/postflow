"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Link2,
  Paintbrush,
  ImageIcon,
  Download,
  Clock,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Zap,
  Globe,
  Play,
} from "lucide-react";

/* ─────────────────── DATA ─────────────────── */

const features = [
  {
    icon: Sparkles,
    title: "3 Variacoes com IA",
    description:
      "Cada ideia vira 3 opcoes: dados, storytelling e provocativa. Voce escolhe a melhor.",
  },
  {
    icon: Link2,
    title: "De link, video ou ideia",
    description:
      "Cole um artigo, video do YouTube ou descreva seu tema. A IA faz o resto.",
  },
  {
    icon: Paintbrush,
    title: "Design automatico",
    description:
      "Seu @handle, foto e nome aplicados em cada slide. Branco ou preto.",
  },
  {
    icon: ImageIcon,
    title: "Imagens inteligentes",
    description:
      "Puxa da noticia, busca no Google ou gera com IA. Sempre relevante.",
  },
  {
    icon: Download,
    title: "Exporte ou publique",
    description:
      "PNG, PDF ou direto no Instagram, Twitter e LinkedIn. Sem fricao.",
  },
  {
    icon: Clock,
    title: "Onboarding em 2 min",
    description:
      "Configure uma vez, crie infinito. Perfil salvo para todos os carrosseis.",
  },
];

const steps = [
  {
    number: "01",
    title: "Cole um link ou descreva sua ideia",
    description:
      "Artigo, video do YouTube, thread ou simplesmente descreva o tema que quer abordar.",
  },
  {
    number: "02",
    title: "IA gera 3 variacoes de carrossel",
    description:
      "Dados, storytelling e provocativa. Cada uma com abordagem diferente pro seu publico.",
  },
  {
    number: "03",
    title: "Escolha, edite e personalize",
    description:
      "Ajuste textos, troque imagens, mude cores. Tudo no editor visual.",
  },
  {
    number: "04",
    title: "Exporte ou publique direto",
    description:
      "Download em PNG/PDF ou publique direto no Instagram, Twitter e LinkedIn.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Para testar e experimentar",
    features: [
      "3 carrosseis por mes",
      "Marca d'agua PostFlow",
      "Estilos basicos (branco/preto)",
      "Export PNG",
      "1 perfil",
    ],
    cta: "Comecar gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/mes",
    description: "Para criadores consistentes",
    features: [
      "30 carrosseis por mes",
      "Sem marca d'agua",
      "Todos os estilos",
      "Export PNG + PDF",
      "Publicacao direta",
      "3 perfis",
      "Imagens com IA",
    ],
    cta: "Assinar Pro",
    highlighted: true,
  },
  {
    name: "Max",
    price: "$29.99",
    period: "/mes",
    description: "Para times e agencias",
    features: [
      "Carrosseis ilimitados",
      "API de integracao",
      "3 seats inclusos",
      "Analytics avancado",
      "Custom branding",
      "Suporte prioritario",
      "Todos os recursos Pro",
    ],
    cta: "Assinar Max",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "Preciso saber design para usar o PostFlow?",
    answer:
      "Nao. O PostFlow gera o design automaticamente com base no seu perfil. Voce so escolhe entre as variacoes e edita se quiser. Zero conhecimento tecnico necessario.",
  },
  {
    question: "Posso usar para clientes da minha agencia?",
    answer:
      "Sim. No plano Max voce tem 3 seats e custom branding. Cada perfil pode ter foto, nome e @handle diferentes. Ideal para agencias.",
  },
  {
    question: "Quais plataformas sao suportadas?",
    answer:
      "Instagram (carrossel), Twitter/X (thread visual) e LinkedIn (documento/carrossel). Voce exporta no formato otimizado pra cada uma.",
  },
  {
    question: "A IA gera as imagens dos slides?",
    answer:
      "Sim. O PostFlow puxa imagens do artigo original, busca no Google Images ou gera com IA. Voce escolhe qual usar em cada slide.",
  },
  {
    question: "Posso cancelar a assinatura a qualquer momento?",
    answer:
      "Sim, sem compromisso. Cancele quando quiser pelo dashboard. Voce mantem acesso ate o fim do periodo pago.",
  },
  {
    question: "Tem limite de slides por carrossel?",
    answer:
      "Ate 15 slides por carrossel. A IA sugere o numero ideal baseado no conteudo, mas voce pode ajustar.",
  },
];

const carouselSlides = [
  {
    heading: "5 automacoes que economizam 20h por semana",
    body: "A maioria dos criadores perde tempo em tarefas que uma IA resolve em segundos. Aqui estao as 5 que mudaram meu fluxo de trabalho.",
    slideNumber: 1,
  },
  {
    heading: "1. Agendamento inteligente de posts",
    body: "Pare de escolher horarios manualmente. Ferramentas como Buffer e Later analisam seu publico e postam no melhor momento.",
    slideNumber: 2,
  },
  {
    heading: "2. Transcricao automatica de videos",
    body: "Grave um video de 10 min e transforme em 5 posts de texto. Whisper + GPT fazem isso em 30 segundos.",
    slideNumber: 3,
  },
];

/* ─────────────────── COMPONENTS ─────────────────── */

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-[var(--border)] shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">
        <a
          href="#"
          className="font-[family-name:var(--font-serif)] text-xl tracking-tight"
        >
          PostFlow
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-[var(--muted)]">
          <a
            href="#features"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            FAQ
          </a>
        </div>

        <div className="hidden md:block">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-dark)] transition-colors"
          >
            Get Started Free
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-[var(--border)] overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <a
                href="#features"
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                onClick={() => setMobileOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                onClick={() => setMobileOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                onClick={() => setMobileOpen(false)}
              >
                FAQ
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent)] text-white text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Get Started Free
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function CarouselMockup() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 3500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const slide = carouselSlides[currentSlide];

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-xl shadow-black/5 overflow-hidden">
        {/* Handle header */}
        <div className="px-5 pt-5 pb-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center text-white text-sm font-semibold">
            GM
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">
              Gabriel Madureira
            </p>
            <p className="text-xs text-[var(--muted)]">@madureira</p>
          </div>
        </div>

        {/* Slide content */}
        <div className="px-5 pb-5 min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <h3 className="font-[family-name:var(--font-serif)] text-xl leading-snug mb-3">
                {slide.heading}
              </h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {slide.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide indicator */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {carouselSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? "bg-[var(--accent)] w-6"
                    : "bg-[var(--border)]"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <span className="text-xs text-[var(--muted)] tabular-nums">
            {slide.slideNumber}/8
          </span>
        </div>
      </div>
    </div>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--border)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="font-medium pr-4">{question}</span>
        {open ? (
          <ChevronUp size={18} className="text-[var(--muted)] shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-[var(--muted)] shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[var(--muted)] text-sm leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────── SECTIONS ─────────────────── */

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 via-white to-white pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-[var(--accent)] text-xs font-medium mb-6">
                <Zap size={14} />
                IA que cria carrosseis em 30 segundos
              </div>

              <h1 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl md:text-[3.5rem] leading-[1.1] tracking-tight mb-6">
                Transforme qualquer ideia
                <br />
                <span className="text-[var(--accent)]">
                  em um carrossel viral.
                </span>
              </h1>

              <p className="text-lg text-[var(--muted)] leading-relaxed mb-8 max-w-lg">
                IA cria 3 variacoes. Voce escolhe. Design automatico com seu
                @handle. Pronto pra postar.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-dark)] transition-colors text-sm"
                >
                  Criar meu primeiro carrossel — gratis
                  <ArrowRight size={16} />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[var(--border)] text-[var(--foreground)] font-medium hover:bg-[var(--card)] transition-colors text-sm"
                >
                  <Play size={14} />
                  Ver como funciona
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right — Carousel mockup */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <CarouselMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl tracking-tight mb-4">
            Tudo que voce precisa.
            <br />
            Nada que voce nao precisa.
          </h2>
          <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
            Do input a publicacao em minutos. Sem curva de aprendizado.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group p-6 rounded-2xl border border-[var(--border)] bg-white hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--accent)] mb-4 group-hover:bg-[var(--accent)] group-hover:text-white transition-colors duration-300">
                <feature.icon size={20} />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-[var(--card)]">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl tracking-tight mb-4">
            Como funciona
          </h2>
          <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
            4 passos. Menos de 2 minutos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(100%_-_16px)] w-[calc(100%_-_32px)] h-px bg-[var(--border)]" />
              )}

              <div className="font-[family-name:var(--font-serif)] text-4xl text-[var(--accent)]/20 mb-3">
                {step.number}
              </div>
              <h3 className="font-semibold mb-2 text-[15px]">{step.title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl tracking-tight mb-4">
            Simples e transparente
          </h2>
          <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
            Comece gratis. Escale quando quiser.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative p-6 rounded-2xl border ${
                plan.highlighted
                  ? "border-[var(--accent)] bg-white shadow-xl shadow-purple-500/10"
                  : "border-[var(--border)] bg-white"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-medium">
                  Mais popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                <p className="text-sm text-[var(--muted)] mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-serif)] text-4xl">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-[var(--muted)]">
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        plan.highlighted
                          ? "text-[var(--accent)]"
                          : "text-[var(--success)]"
                      }`}
                    />
                    <span className="text-[var(--muted)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-full text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]"
                    : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--card)]"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CarouselPreview() {
  return (
    <section className="py-24 md:py-32 bg-[var(--card)]">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl tracking-tight mb-4">
            Veja o resultado
          </h2>
          <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
            Cada carrossel sai com seu branding, pronto pra postar.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <CarouselMockup />
        </motion.div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl tracking-tight mb-4">
            Perguntas frequentes
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          {faqs.map((faq) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 md:py-32 bg-[var(--foreground)]">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6">
            Seu primeiro carrossel
            <br />
            em 30 segundos.
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            Sem cadastro complicado. Cole um link, escolha o estilo e exporte.
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-light)] transition-colors"
          >
            Comecar agora — gratis
            <ArrowRight size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-1">
            <span className="font-[family-name:var(--font-serif)] text-lg">
              PostFlow
            </span>
            <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">
              Transforme ideias em carrosseis virais com IA.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-medium text-sm mb-3">Produto</h4>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>
                <a
                  href="#features"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-medium text-sm mb-3">Empresa</h4>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Contato
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Sobre
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Termos de Uso
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Privacidade
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted)]">
            &copy; {new Date().getFullYear()} PostFlow. Todos os direitos
            reservados.
          </p>
          <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
            <a
              href="https://twitter.com/madureira"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              <Globe size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────── PAGE ─────────────────── */

export default function Home() {
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CarouselPreview />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
