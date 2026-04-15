import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "PostFlow — AI Carousel Generator for Instagram, Twitter & LinkedIn",
  description:
    "Create viral carousels in 30 seconds with AI. 3 variations per idea, automatic branding, and direct publishing. The best carousel maker for content creators.",
  metadataBase: new URL("https://postflow.app"),
  keywords: [
    "carousel generator",
    "instagram carousel ai",
    "thread generator",
    "social media content ai",
    "carousel maker",
    "linkedin carousel maker",
    "ai content generator",
    "gerador de carrossel",
    "criar carrossel instagram",
    "carousel design tool",
  ],
  alternates: {
    canonical: "https://postflow.app",
  },
  openGraph: {
    title: "PostFlow — AI Carousel Generator | 3 Variations in 30 Seconds",
    description:
      "Create viral carousels in 30 seconds with AI. 3 variations per idea, automatic branding, and direct publishing to Instagram, Twitter & LinkedIn.",
    type: "website",
    url: "https://postflow.app",
    siteName: "PostFlow",
    locale: "pt_BR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PostFlow — AI Carousel Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PostFlow — AI Carousel Generator",
    description:
      "Turn any idea into a viral carousel. 3 AI variations in 30 seconds. Auto-branding. Direct publishing.",
    site: "@postflow",
    creator: "@madureira",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PostFlow",
  description:
    "AI-powered carousel and thread generator for Instagram, Twitter, and LinkedIn. Create 3 variations in 30 seconds with automatic branding.",
  url: "https://postflow.app",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "3 carousels per month with PostFlow watermark",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "9.99",
      priceCurrency: "USD",
      billingIncrement: "P1M",
      description: "30 carousels per month, no watermark, all features",
    },
    {
      "@type": "Offer",
      name: "Max",
      price: "29.99",
      priceCurrency: "USD",
      billingIncrement: "P1M",
      description: "Unlimited carousels, API, 3 seats, analytics",
    },
  ],
  featureList: [
    "3 AI-generated variations per idea",
    "Automatic branding with profile photo and handle",
    "Direct publishing to Instagram, Twitter, LinkedIn",
    "URL, video, and text input support",
    "AI image generation",
    "PNG and PDF export",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Preciso saber design para usar o PostFlow?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nao. O PostFlow gera o design automaticamente com base no seu perfil. Voce so escolhe entre as variacoes e edita se quiser. Zero conhecimento tecnico necessario.",
      },
    },
    {
      "@type": "Question",
      name: "Posso usar para clientes da minha agencia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim. No plano Max voce tem 3 seats e custom branding. Cada perfil pode ter foto, nome e @handle diferentes. Ideal para agencias.",
      },
    },
    {
      "@type": "Question",
      name: "Quais plataformas sao suportadas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Instagram (carrossel), Twitter/X (thread visual) e LinkedIn (documento/carrossel). Voce exporta no formato otimizado pra cada uma.",
      },
    },
    {
      "@type": "Question",
      name: "A IA gera as imagens dos slides?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim. O PostFlow puxa imagens do artigo original, busca no Google Images ou gera com IA. Voce escolhe qual usar em cada slide.",
      },
    },
    {
      "@type": "Question",
      name: "Posso cancelar a assinatura a qualquer momento?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim, sem compromisso. Cancele quando quiser pelo dashboard. Voce mantem acesso ate o fim do periodo pago.",
      },
    },
    {
      "@type": "Question",
      name: "Tem limite de slides por carrossel?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ate 15 slides por carrossel. A IA sugere o numero ideal baseado no conteudo, mas voce pode ajustar.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${dmSerif.variable} antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="min-h-screen font-[family-name:var(--font-sans)]">
        {children}
      </body>
    </html>
  );
}
