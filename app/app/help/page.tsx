import Link from "next/link";
import type { Metadata } from "next";
import {
  PlusCircle,
  Mic,
  Layers,
  ImageIcon,
  Download,
  Sparkles,
  ArrowRight,
  FileText,
  Brain,
  MessageSquare,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Guia · Sequência Viral",
  description:
    "Tutorial prático do produto — como criar, treinar voz, usar modo avançado, escolher template e exportar.",
};

interface GuideCard {
  step: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  accent?: "green" | "pink" | "ink" | "paper";
}

const CARDS: GuideCard[] = [
  {
    step: "01",
    icon: <PlusCircle size={18} strokeWidth={2} />,
    title: "Criar seu primeiro carrossel",
    body:
      "No menu, clique em Criar. Cola um link (YouTube, artigo, post), um texto solto ou escreve a ideia direto. Escolhe o template visual (Futurista ou Thread) e clica gerar. A IA devolve um carrossel pronto em ~15s.",
    actionLabel: "Criar agora",
    actionHref: "/app/create/new",
    accent: "green",
  },
  {
    step: "02",
    icon: <Brain size={18} strokeWidth={2} />,
    title: "Writer vs Layout-only",
    body:
      "Dois modos. Writer: IA usa seu briefing como inspiração e escreve do zero (hooks, escada, CTA). Layout-only: você já escreveu, ela só quebra em slides sem reescrever. Escolhe no topo antes de gerar.",
    accent: "paper",
  },
  {
    step: "03",
    icon: <Mic size={18} strokeWidth={2} />,
    title: "Treinar a IA com sua voz",
    body:
      "Em Ajustes → Voz da IA, cola amostras dos seus posts. A IA aprende ritmo, vocabulário, tiques de linguagem. Também dá pra listar tabus (palavras proibidas) e regras fixas (ex: 'nunca começo com pergunta').",
    actionLabel: "Configurar voz",
    actionHref: "/app/settings?tab=voice",
    accent: "pink",
  },
  {
    step: "04",
    icon: <Layers size={18} strokeWidth={2} />,
    title: "Modo avançado",
    body:
      "Antes de gerar, ativa o toggle Modo avançado e destrava: direcionamento do gancho, CTA customizado, número exato de slides, travar estilo (data/story/provocative), contexto extra, upload de fotos suas. Opcional, mas dá controle fino.",
    accent: "paper",
  },
  {
    step: "05",
    icon: <MessageSquare size={18} strokeWidth={2} />,
    title: "Perguntar antes de gerar",
    body:
      "Dentro do Modo avançado, o toggle 🧠 Perguntar antes de gerar faz a IA ler seu briefing e devolver 1-2 perguntas cirúrgicas — tipo 'qual foi o resultado exato?' ou 'é pra qual público especificamente?'. Você responde e o output fica MUITO mais específico.",
    accent: "paper",
  },
  {
    step: "06",
    icon: <Sparkles size={18} strokeWidth={2} />,
    title: "Escolher template visual",
    body:
      "Dois templates disponíveis. Futurista: editorial cinematográfico, caixa alta dramática, imagens IA tema-específicas — ideal pra conteúdo editorial denso. Thread (X): screenshot de tweet, visual minimalista, ideal pra linha conversacional.",
    accent: "paper",
  },
  {
    step: "07",
    icon: <ImageIcon size={18} strokeWidth={2} />,
    title: "Ajustar imagens dos slides",
    body:
      "No editor, clica num slide. Três opções: Buscar (stock no Google Images), Gerar IA (imagem cinematográfica única) ou Upload (sua foto). Cada slide pode ter sua própria imagem — não precisa que todas sejam do mesmo tipo.",
    accent: "paper",
  },
  {
    step: "08",
    icon: <Download size={18} strokeWidth={2} />,
    title: "Exportar e publicar",
    body:
      "Quando o carrossel tá pronto, clica Exportar. Baixa PNG 1080×1350 por slide, pronto pra Instagram e LinkedIn. A legenda vem junto — edita se quiser e cola no app da rede.",
    accent: "ink",
  },
  {
    step: "09",
    icon: <FileText size={18} strokeWidth={2} />,
    title: "Feedback que treina a IA",
    body:
      "Na biblioteca, cada carrossel tem 👍 / 👎 + campo de comentário. A IA lê o seu feedback e, na próxima geração, reforça o que você gostou e evita o que você rejeitou. Use sem medo — quanto mais feedback, melhor a IA fica com você.",
    actionLabel: "Ver biblioteca",
    actionHref: "/app/carousels",
    accent: "paper",
  },
];

function accentStyles(accent: GuideCard["accent"]) {
  switch (accent) {
    case "green":
      return {
        background: "var(--sv-green)",
        color: "var(--sv-ink)",
        shadow: "4px 4px 0 0 var(--sv-ink)",
      };
    case "pink":
      return {
        background: "var(--sv-pink)",
        color: "var(--sv-ink)",
        shadow: "4px 4px 0 0 var(--sv-ink)",
      };
    case "ink":
      return {
        background: "var(--sv-ink)",
        color: "var(--sv-paper)",
        shadow: "4px 4px 0 0 var(--sv-green)",
      };
    default:
      return {
        background: "var(--sv-white)",
        color: "var(--sv-ink)",
        shadow: "3px 3px 0 0 var(--sv-ink)",
      };
  }
}

export default function HelpPage() {
  return (
    <div
      className="mx-auto w-full px-4 sm:px-6"
      style={{ maxWidth: 1100, paddingBottom: 80 }}
    >
      <span className="sv-eyebrow">
        <span className="sv-dot" /> Guia prático
      </span>

      <h1
        className="sv-display mt-4"
        style={{
          fontSize: "clamp(40px, 6vw, 60px)",
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
          fontWeight: 400,
        }}
      >
        Tudo que você precisa
        <br />
        pra <em style={{ color: "var(--sv-ink)" }}>postar direito</em>.
      </h1>

      <p
        className="mt-5"
        style={{
          fontSize: 15,
          lineHeight: 1.55,
          color: "var(--sv-muted)",
          maxWidth: 620,
        }}
      >
        9 passos curtos. Sem jargão, sem rodeio. Cada card explica uma parte do produto — leia em ordem ou vai direto pro que você precisa agora.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/app/create/new"
          className="sv-btn sv-btn-primary"
          style={{ padding: "11px 18px", fontSize: 11 }}
        >
          <PlusCircle size={13} strokeWidth={2.5} />
          Criar carrossel
        </Link>
        <Link
          href="/app/settings"
          className="sv-btn sv-btn-outline"
          style={{ padding: "11px 18px", fontSize: 11 }}
        >
          Ajustes do perfil
        </Link>
      </div>

      <div
        className="mt-12 grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}
      >
        {CARDS.map((card) => {
          const ac = accentStyles(card.accent);
          return (
            <article
              key={card.step}
              className="flex flex-col"
              style={{
                background: ac.background,
                color: ac.color,
                border: "1.5px solid var(--sv-ink)",
                boxShadow: ac.shadow,
                padding: "22px 22px 20px",
                minHeight: 260,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontFamily: "var(--sv-mono)",
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    opacity: 0.7,
                  }}
                >
                  Nº {card.step}
                </span>
                <span
                  className="inline-flex items-center justify-center"
                  style={{
                    width: 30,
                    height: 30,
                    border: "1.5px solid currentColor",
                    background: "transparent",
                  }}
                  aria-hidden
                >
                  {card.icon}
                </span>
              </div>

              <h3
                className="sv-display"
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  lineHeight: 1.1,
                  letterSpacing: "-0.015em",
                  marginTop: 16,
                }}
              >
                {card.title}
              </h3>

              <p
                className="mt-2 flex-1"
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  opacity: 0.8,
                }}
              >
                {card.body}
              </p>

              {card.actionLabel && card.actionHref && (
                <Link
                  href={card.actionHref}
                  className="mt-4 inline-flex items-center gap-1.5 self-start"
                  style={{
                    fontFamily: "var(--sv-mono)",
                    fontSize: 10.5,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: ac.color,
                    borderBottom: "1.5px solid currentColor",
                    paddingBottom: 2,
                  }}
                >
                  {card.actionLabel}
                  <ArrowRight size={11} strokeWidth={2.5} />
                </Link>
              )}
            </article>
          );
        })}
      </div>

      {/* Créditos Kaleidos — pequeno, no fim */}
      <div
        className="mt-16 flex flex-wrap items-center justify-between gap-4 pt-8"
        style={{ borderTop: "1.5px solid var(--sv-ink)" }}
      >
        <div
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--sv-muted)",
            lineHeight: 1.6,
            maxWidth: 560,
          }}
        >
          O padrão editorial do Sequência Viral foi desenhado em anos de criação
          de conteúdo da Kaleidos — agência que move marcas por trás de posts,
          threads, newsletters e campanhas.
        </div>
        <a
          href="https://kaleidos.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5"
          style={{
            fontFamily: "var(--sv-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: "var(--sv-ink)",
          }}
        >
          kaleidos.com.br ↗
        </a>
      </div>
    </div>
  );
}
