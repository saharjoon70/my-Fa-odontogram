// src/treatment/insuranceStore.ts
// تنظیمات بیمه — هم دستی هم اتوماتیک

import { reactive } from "vue";

export interface InsuranceProvider {
  id: string;
  name: string;              // «تامین اجتماعی»
  defaultPercent: number;    // 70
  color?: string;
}

interface InsuranceState {
  providers: InsuranceProvider[];
  defaultProviderId: string;
  defaultPercent: number;
}

export const insuranceStore = reactive<InsuranceState>({
  providers: [
    { id: "tamin", name: "تامین اجتماعی", defaultPercent: 70, color: "#2563eb" },
    { id: "salamat", name: "بیمه سلامت", defaultPercent: 60, color: "#16a34a" },
    { id: "artesh", name: "بیمه نیروهای مسلح", defaultPercent: 80, color: "#f59e0b" },
    { id: "azad", name: "بیمه آزاد", defaultPercent: 0, color: "#6b7280" },
  ],
  defaultProviderId: "azad",
  defaultPercent: 0,
});

export function getInsuranceProviders(): InsuranceProvider[] {
  return insuranceStore.providers;
}

export function getInsuranceById(id: string): InsuranceProvider | undefined {
  return insuranceStore.providers.find((p) => p.id === id);
}

export function addInsuranceProvider(
  provider: Omit<InsuranceProvider, "id">,
): InsuranceProvider {
  const newProvider: InsuranceProvider = {
    ...provider,
    id: `ins_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  };
  insuranceStore.providers.push(newProvider);
  return newProvider;
}

// ═══════════════════════════════════════════════
// Discount Presets (تخفیف‌های مناسبتی)
// ═══════════════════════════════════════════════

export interface DiscountPreset {
  id: string;
  label: string;             // «تخفیف عید»
  type: "percent" | "amount";
  value: number;             // 20 (یعنی 20٪) یا 500000 (یعنی 500,000 تومان)
  color?: string;
}

export const DISCOUNT_PRESETS: DiscountPreset[] = [
  { id: "none",       label: "بدون تخفیف",       type: "percent", value: 0,      color: "#6b7280" },
  { id: "nowruz",     label: "تخفیف نوروزی",     type: "percent", value: 15,     color: "#16a34a" },
  { id: "yalda",      label: "تخفیف یلدا",       type: "percent", value: 20,     color: "#dc2626" },
  { id: "birthday",   label: "تخفیف تولد",       type: "percent", value: 10,     color: "#ec4899" },
  { id: "family",     label: "تخفیف خانواده",     type: "percent", value: 25,     color: "#8b5cf6" },
  { id: "student",    label: "تخفیف دانشجویی",   type: "percent", value: 15,     color: "#0891b2" },
  { id: "custom",     label: "تخفیف سفارشی",     type: "amount",  value: 0,      color: "#f59e0b" },
];