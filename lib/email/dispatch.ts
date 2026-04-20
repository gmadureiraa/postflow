/**
 * Despachos de email — funções de alto nível usadas por APIs, webhooks e crons.
 * Todo dispatch é tageado com `project:sequencia-viral` para isolar do resto
 * da conta Kaleidos Digital (blog leads, outras ferramentas, etc.) — permite
 * filtrar no dashboard Resend, rotear supression lists, e separar métricas.
 */

import { sendEmail } from "./send";
import { WelcomeEmail } from "./templates/welcome";
import { ActivationNudgeEmail } from "./templates/activation-nudge";
import { FirstCarouselEmail } from "./templates/first-carousel";
import { PaymentSuccessEmail } from "./templates/payment-success";
import { PlanLimitEmail } from "./templates/plan-limit";
import { ReEngagementEmail } from "./templates/re-engagement";
import { OnboardingHowItWorksEmail } from "./templates/onboarding-how-it-works";
import { OnboardingFirstCaseEmail } from "./templates/onboarding-first-case";
import { OnboardingWhyUpgradeEmail } from "./templates/onboarding-why-upgrade";
import { PaymentFailedEmail } from "./templates/payment-failed";

import { APP_URL } from "@/lib/app-url";

const PROJECT_TAG = { name: "project", value: "sequencia-viral" };
const ENV_TAG = {
  name: "env",
  value: process.env.NODE_ENV === "production" ? "prod" : "dev",
};

function lifecycleTag(value: string) {
  return { name: "lifecycle", value };
}

type Recipient = {
  email: string;
  name?: string;
};

export async function sendWelcome(user: Recipient) {
  return sendEmail({
    to: user.email,
    subject: "Bem-vindo ao Sequência Viral — estúdio pronto",
    react: WelcomeEmail({ name: user.name, appUrl: APP_URL }),
    tags: [PROJECT_TAG, ENV_TAG, lifecycleTag("welcome")],
  });
}

export async function sendActivationNudge(user: Recipient) {
  return sendEmail({
    to: user.email,
    subject: "Cola um link e sai com carrossel em 15s",
    react: ActivationNudgeEmail({ name: user.name, appUrl: APP_URL }),
    tags: [PROJECT_TAG, ENV_TAG, lifecycleTag("activation-nudge")],
  });
}

export async function sendFirstCarousel(
  user: Recipient,
  args: { carouselTitle: string }
) {
  return sendEmail({
    to: user.email,
    subject: "Primeiro carrossel salvo 👌",
    react: FirstCarouselEmail({
      name: user.name,
      carouselTitle: args.carouselTitle,
      appUrl: APP_URL,
    }),
    tags: [PROJECT_TAG, ENV_TAG, lifecycleTag("first-carousel")],
  });
}

export async function sendPaymentSuccess(
  user: Recipient,
  args: { planName: string; carouselsPerMonth: number }
) {
  return sendEmail({
    to: user.email,
    subject: `Plano ${args.planName} ativo — bora criar`,
    react: PaymentSuccessEmail({
      name: user.name,
      planName: args.planName,
      carouselsPerMonth: args.carouselsPerMonth,
      appUrl: APP_URL,
    }),
    tags: [PROJECT_TAG, ENV_TAG, lifecycleTag("payment-success")],
  });
}

export async function sendPlanLimit(
  user: Recipient,
  args: { used: number; limit: number }
) {
  return sendEmail({
    to: user.email,
    subject:
      args.used >= args.limit
        ? "Você atingiu o limite do ciclo"
        : `Faltam ${Math.max(args.limit - args.used, 0)} carrosséis no seu plano`,
    react: PlanLimitEmail({
      name: user.name,
      used: args.used,
      limit: args.limit,
      appUrl: APP_URL,
    }),
    tags: [PROJECT_TAG, ENV_TAG, lifecycleTag("plan-limit")],
  });
}

export async function sendReEngagement(
  user: Recipient,
  args: { daysSinceLastUse: number }
) {
  return sendEmail({
    to: user.email,
    subject: "Cola 1 link, sai com 1 carrossel",
    react: ReEngagementEmail({
      name: user.name,
      appUrl: APP_URL,
      daysSinceLastUse: args.daysSinceLastUse,
    }),
    tags: [PROJECT_TAG, ENV_TAG, lifecycleTag("re-engagement")],
  });
}

/** D+1 — onboarding drip explicando os 3 modos. */
export async function sendOnboardingHowItWorks(user: Recipient) {
  return sendEmail({
    to: user.email,
    subject: "3 formas de gerar carrossel (escolhe a sua)",
    react: OnboardingHowItWorksEmail({ name: user.name, appUrl: APP_URL }),
    tags: [PROJECT_TAG, ENV_TAG, lifecycleTag("onboarding-how-it-works")],
  });
}

/** D+3 — onboarding drip: primeiro case + voz da marca. */
export async function sendOnboardingFirstCase(user: Recipient) {
  return sendEmail({
    to: user.email,
    subject: "47 carrosséis em 1 semana (case real)",
    react: OnboardingFirstCaseEmail({ name: user.name, appUrl: APP_URL }),
    tags: [PROJECT_TAG, ENV_TAG, lifecycleTag("onboarding-first-case")],
  });
}

/** D+7 — onboarding drip: pitch do upgrade. */
export async function sendOnboardingWhyUpgrade(user: Recipient) {
  return sendEmail({
    to: user.email,
    subject: "Vale upgrade pro Pro? Matemática honesta",
    react: OnboardingWhyUpgradeEmail({ name: user.name, appUrl: APP_URL }),
    tags: [PROJECT_TAG, ENV_TAG, lifecycleTag("onboarding-why-upgrade")],
  });
}

/** Stripe `invoice.payment_failed` — cartão recusado, atualizar payment method. */
export async function sendPaymentFailed(
  user: Recipient,
  args: { planName: string; amountUsd?: number | null; portalUrl?: string }
) {
  return sendEmail({
    to: user.email,
    subject: "Falha na cobrança — atualize seu cartão",
    react: PaymentFailedEmail({
      name: user.name,
      planName: args.planName,
      amountUsd: args.amountUsd,
      portalUrl: args.portalUrl,
      appUrl: APP_URL,
    }),
    tags: [PROJECT_TAG, ENV_TAG, lifecycleTag("payment-failed")],
  });
}
