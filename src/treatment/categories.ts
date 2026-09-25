// src/treatment/categories.ts
// ۱۴ دسته اصلی خدمات دندانپزشکی

export type Category =
  | "exam"         // ۱. معاینه و تشخیص
  | "prevention"   // ۲. پیشگیری
  | "restorative"  // ۳. ترمیمی
  | "endo"         // ۴. ریشه و اندو
  | "surgery"      // ۵. جراحی
  | "prosthetic"   // ۶. پروتز
  | "ortho"        // ۷. ارتودنسی
  | "perio"        // ۸. پریو
  | "cosmetic"     // ۹. زیبایی
  | "pedo"         // ۱۰. کودکان
  | "tmj"          // ۱۱. فک و مفصل
  | "auxiliary"    // ۱۲. خدمات جانبی
  | "emergency"    // ۱۳. اورژانس
  | "plan";        // ۱۴. طرح درمان (منتقل به تب تشخیص)

export interface CategoryMeta {
  id: Category;
  label: string;
  color: string;
  /** آیا در تب «ثبت درمان» نمایش داده شود؟ (طرح درمان به تب تشخیص میرود) */
  showInTreatmentTab: boolean;
  /** آیا در تب «تشخیص» نمایش داده شود؟ */
  showInDiagnosisTab: boolean;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "exam",        label: "معاینه و تشخیص", color: "#0ea5e9", showInTreatmentTab: true,  showInDiagnosisTab: false },
  { id: "prevention",  label: "پیشگیری",        color: "#22c55e", showInTreatmentTab: true,  showInDiagnosisTab: false },
  { id: "restorative", label: "ترمیمی",         color: "#3b82f6", showInTreatmentTab: true,  showInDiagnosisTab: false },
  { id: "endo",        label: "ریشه و اندو",     color: "#8b5cf6", showInTreatmentTab: true,  showInDiagnosisTab: false },
  { id: "surgery",     label: "جراحی",          color: "#dc2626", showInTreatmentTab: true,  showInDiagnosisTab: false },
  { id: "prosthetic",  label: "پروتز",          color: "#f59e0b", showInTreatmentTab: true,  showInDiagnosisTab: false },
  { id: "ortho",       label: "ارتودنسی",       color: "#6366f1", showInTreatmentTab: true,  showInDiagnosisTab: false },
  { id: "perio",       label: "پریو",           color: "#14b8a6", showInTreatmentTab: true,  showInDiagnosisTab: false },
  { id: "cosmetic",    label: "زیبایی",         color: "#ec4899", showInTreatmentTab: true,  showInDiagnosisTab: false },
  { id: "pedo",        label: "کودکان",         color: "#f97316", showInTreatmentTab: true,  showInDiagnosisTab: false },
  { id: "tmj",         label: "فک و مفصل",      color: "#a855f7", showInTreatmentTab: true,  showInDiagnosisTab: false },
  { id: "auxiliary",   label: "خدمات جانبی",    color: "#64748b", showInTreatmentTab: true,  showInDiagnosisTab: false },
  { id: "emergency",   label: "اورژانس",        color: "#ef4444", showInTreatmentTab: true,  showInDiagnosisTab: false },
  { id: "plan",        label: "طرح درمان",      color: "#eab308", showInTreatmentTab: false, showInDiagnosisTab: true  },
];

export function getCategoryLabel(id: Category): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function getCategoryColor(id: Category): string {
  return CATEGORIES.find((c) => c.id === id)?.color ?? "#6b7280";
}

export const TREATMENT_TAB_CATEGORIES = CATEGORIES.filter((c) => c.showInTreatmentTab);
export const DIAGNOSIS_TAB_CATEGORIES = CATEGORIES.filter((c) => c.showInDiagnosisTab);