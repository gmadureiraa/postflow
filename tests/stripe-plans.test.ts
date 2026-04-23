import { describe, expect, it } from "vitest";
import {
  FREE_PLAN_USAGE_LIMIT,
  PLANS,
  stripePaymentAmount,
  stripePaymentAmountUsd,
  usageLimitForPaidPlan,
} from "@/lib/pricing";

describe("stripe plans", () => {
  it("mantém ids e preços esperados (BRL em centavos)", () => {
    expect(Object.keys(PLANS)).toEqual(["pro", "business"]);
    // DB key 'pro' = display name "Creator" — R$ 99,90/mes
    expect(PLANS.pro.priceMonthly).toBe(9990);
    // DB key 'business' = display name "Pro" — R$ 199,90/mes
    expect(PLANS.business.priceMonthly).toBe(19990);
  });

  it("centraliza limites e valores de cobrança", () => {
    expect(FREE_PLAN_USAGE_LIMIT).toBe(5);
    expect(usageLimitForPaidPlan("pro")).toBe(10);
    expect(usageLimitForPaidPlan("business")).toBe(30);
    expect(stripePaymentAmount("pro")).toBe(99.9);
    expect(stripePaymentAmount("business")).toBe(199.9);
    // Alias historico ainda aponta pro mesmo valor BRL.
    expect(stripePaymentAmountUsd("pro")).toBe(99.9);
    expect(stripePaymentAmountUsd("business")).toBe(199.9);
  });
});
