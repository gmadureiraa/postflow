import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — Sequência Viral",
  description:
    "Como o Sequência Viral coleta, usa e protege dados pessoais — inclui dados do Instagram e serviços de terceiros.",
  alternates: { canonical: "https://viral.kaleidos.com.br/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] px-5 py-16 text-[#0A0A0A]">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
          Legal
        </p>
        <h1 className="editorial-serif mt-2 text-4xl">Política de Privacidade</h1>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Última atualização: 22 de abril de 2026
        </p>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="editorial-serif text-xl text-[#0A0A0A]">1. Quem somos</h2>
          <p>
            Sequência Viral é um produto operado por Kaleidos Digital (CNPJ sob demanda),
            com sede no Brasil. Controlador de dados: Gabriel Madureira. Contato:{" "}
            <a
              href="mailto:gf.madureiraa@gmail.com"
              className="font-semibold text-[var(--accent)] underline"
            >
              gf.madureiraa@gmail.com
            </a>
            .
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="editorial-serif text-xl text-[#0A0A0A]">2. Dados que coletamos</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Conta:</strong> e-mail, nome, senha criptografada (Supabase Auth).
            </li>
            <li>
              <strong>Perfil de criador:</strong> handle do Instagram/Twitter/LinkedIn que você
              informar durante o onboarding, foto de perfil que você fizer upload, cor e estilo
              de marca que selecionar.
            </li>
            <li>
              <strong>Dados públicos do Instagram:</strong> quando você fornece um handle do
              Instagram, usamos serviços de terceiros (Apify) ou a Instagram Graph API (com seu
              consentimento explícito via OAuth) para coletar nome, biografia, avatar público,
              contagem de seguidores e últimos posts públicos. Usamos exclusivamente para montar
              o DNA da sua marca e gerar conteúdo.
            </li>
            <li>
              <strong>Conteúdo que você gera:</strong> briefings, carrosséis, legendas e imagens
              produzidas dentro do app, armazenados em sua conta.
            </li>
            <li>
              <strong>Uso e telemetria:</strong> logs técnicos, IP, user-agent, eventos de
              produto (PostHog), métricas de billing (Stripe).
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="editorial-serif text-xl text-[#0A0A0A]">3. Como usamos</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Entregar o serviço: gerar carrosséis, legendas, imagens e salvar seu histórico.</li>
            <li>
              Personalizar sugestões com base no seu perfil público e no conteúdo que você cria.
            </li>
            <li>Processar pagamentos e prevenir abuso.</li>
            <li>Melhorar o produto por meio de métricas agregadas e anônimas.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="editorial-serif text-xl text-[#0A0A0A]">
            4. Integração com Instagram / Meta
          </h2>
          <p>
            Quando você conecta sua conta do Instagram por meio do Facebook Login, usamos apenas
            as permissões estritamente necessárias (por exemplo <code>instagram_basic</code>,
            <code> pages_show_list</code> e, se autorizado, <code>instagram_content_publish</code>)
            para ler seu perfil público e publicar conteúdos que você aprovar dentro do Sequência
            Viral.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Nunca publicamos sem sua ação explícita.</li>
            <li>
              Não compartilhamos dados do Instagram com terceiros fora dos fornecedores
              listados abaixo.
            </li>
            <li>
              Você pode revogar a qualquer momento em{" "}
              <a
                href="https://www.facebook.com/settings?tab=business_tools"
                className="font-semibold text-[var(--accent)] underline"
                rel="noreferrer noopener"
                target="_blank"
              >
                facebook.com/settings → Business Tools
              </a>
              . Ao revogar, encerramos o acesso e, mediante solicitação em{" "}
              <a
                href="mailto:gf.madureiraa@gmail.com"
                className="font-semibold text-[var(--accent)] underline"
              >
                gf.madureiraa@gmail.com
              </a>
              , apagamos os dados coletados.
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="editorial-serif text-xl text-[#0A0A0A]">5. Fornecedores (subprocessadores)</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Supabase</strong> — banco de dados, auth e storage (EU/US).
            </li>
            <li>
              <strong>Vercel</strong> — hospedagem e funções serverless (US/EU).
            </li>
            <li>
              <strong>Google (Gemini / Imagen)</strong> — geração de texto e imagens por IA.
            </li>
            <li>
              <strong>Anthropic (Claude)</strong> — análise de marca assistida por IA.
            </li>
            <li>
              <strong>Apify</strong> — coleta de dados públicos de redes sociais.
            </li>
            <li>
              <strong>Stripe</strong> — processamento de pagamentos.
            </li>
            <li>
              <strong>PostHog</strong> — analytics de produto.
            </li>
            <li>
              <strong>Resend</strong> — envio de e-mails transacionais.
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="editorial-serif text-xl text-[#0A0A0A]">6. Retenção e exclusão</h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Você pode solicitar exclusão
            completa a qualquer momento escrevendo para{" "}
            <a
              href="mailto:gf.madureiraa@gmail.com"
              className="font-semibold text-[var(--accent)] underline"
            >
              gf.madureiraa@gmail.com
            </a>
            . Cumprimos a solicitação em até 30 dias corridos.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="editorial-serif text-xl text-[#0A0A0A]">7. Seus direitos (LGPD / GDPR)</h2>
          <p>
            Você tem direito a acesso, correção, portabilidade, exclusão e oposição ao tratamento
            de seus dados pessoais. Para exercer, envie e-mail ao contato acima. Também pode
            reclamar à ANPD (Brasil) ou à autoridade de proteção de dados aplicável.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="editorial-serif text-xl text-[#0A0A0A]">8. Segurança</h2>
          <p>
            Usamos TLS em todas as conexões, senhas com hashing, tokens escopados para APIs
            externas e controle de acesso por role. Apesar disso, nenhum sistema é 100% seguro —
            notificaremos você e a ANPD em caso de incidente que exponha seus dados.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="editorial-serif text-xl text-[#0A0A0A]">9. Alterações</h2>
          <p>
            Podemos atualizar esta política. Mudanças relevantes serão comunicadas por e-mail ou
            dentro do app antes de entrarem em vigor.
          </p>
        </section>

        <Link
          href="/"
          className="mt-12 inline-block text-sm font-bold text-[var(--accent)] underline underline-offset-4"
        >
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}
