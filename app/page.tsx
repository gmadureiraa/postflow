import { TopNav } from "@/components/landing/top-nav";
import { Hero } from "@/components/landing/hero";
import { Ticker } from "@/components/landing/shared";
import { PainSection } from "@/components/landing/pain-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { CompareSection } from "@/components/landing/compare-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { WelcomePopup } from "@/components/landing/welcome-popup";
// TestimonialsSection oculto ate termos depoimentos reais. Manifesto (banner
// Kaleidos) e GallerySection (exemplos reais) escondidos — reativar importando
// + inserindo no JSX abaixo quando tivermos conteudo validado.

/* ─────────────────────────────────────────────────────────────────
   Sequência Viral — Landing brutalist editorial (Kaleidos Digital)
   Orquestração dos componentes de landing. Design tokens em
   globals.css (.sv-*). Cada seção vive em components/landing/*.
   ───────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <main
      style={{
        background: "var(--sv-paper)",
        color: "var(--sv-ink)",
        fontFamily: "var(--sv-sans)",
        minHeight: "100vh",
        // overflow:hidden cortava conteudos que excediam viewport em mobile.
        // Substituido por overflow-x:hidden global no body — vertical livre.
        overflowX: "hidden",
        // Compensar o TopNav fixed. Mobile usa altura ~56px (nav menor),
        // desktop ~64px. clamp pra ajustar suavemente.
        paddingTop: "clamp(56px, 8vw, 68px)",
      }}
    >
      <TopNav />
      <Hero />
      <Ticker />
      <PainSection />
      <HowItWorks />
      <FeaturesSection />
      <CompareSection />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
      <WelcomePopup />
    </main>
  );
}
