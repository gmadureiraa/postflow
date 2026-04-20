import { describe, expect, it } from "vitest";
import {
  FREE_PLAN_USAGE_LIMIT,
  PLANS,
  stripePaymentAmountUsd,
  usageLimitForPaidPlan,
} from "@/lib/pricing";

describe("stripe plans", () => {
  it("mantém ids e preços esperados", () => {
    expect(Object.keys(PLANS)).toEqual(["pro", "business"]);
    expect(PLANS.pro.priceMonthly).toBe(990);
    expect(PLANS.business.priceMonthly).toBe(2990);
  });

  it("centraliza limites e valores de cobrança", () => {
    expect(FREE_PLAN_USAGE_LIMIT).toBe(5);
    expect(usageLimitForPaidPlan("pro")).toBe(30);
    expect(usageLimitForPaidPlan("business")).toBe(150);
    expect(stripePaymentAmountUsd("pro")).toBe(9.90);
    expect(stripePaymentAmountUsd("business")).toBe(29.90);
  });
});
