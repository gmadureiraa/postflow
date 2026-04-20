import { TopNav } from "@/components/landing/top-nav";
import { Hero } from "@/components/landing/hero";
import { Ticker } from "@/components/landing/shared";
import { PainSection } from "@/components/landing/pain-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DemoSection } from "@/components/landing/demo-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CompareSection } from "@/components/landing/compare-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { WelcomePopup } from "@/components/landing/welcome-popup";
// Manifesto (banner Kaleidos) e GallerySection (exemplos reais) escondidos
// por enquanto — reativar importando + inserindo no JSX abaixo.

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
        overflow: "hidden",
      }}
    >
      <TopNav />
      <Hero />
      <Ticker />
      <PainSection />
      <HowItWorks />
      <DemoSection />
      <FeaturesSection />
      <CompareSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
      <WelcomePopup />
    </main>
  );
}
