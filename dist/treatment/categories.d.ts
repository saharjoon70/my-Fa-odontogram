export type Category = "exam" | "prevention" | "restorative" | "endo" | "surgery" | "prosthetic" | "ortho" | "perio" | "cosmetic" | "pedo" | "tmj" | "auxiliary" | "emergency" | "plan";
export interface CategoryMeta {
    id: Category;
    label: string;
    color: string;
    /** آیا در تب «ثبت درمان» نمایش داده شود؟ (طرح درمان به تب تشخیص میرود) */
    showInTreatmentTab: boolean;
    /** آیا در تب «تشخیص» نمایش داده شود؟ */
    showInDiagnosisTab: boolean;
}
export declare const CATEGORIES: CategoryMeta[];
export declare function getCategoryLabel(id: Category): string;
export declare function getCategoryColor(id: Category): string;
export declare const TREATMENT_TAB_CATEGORIES: CategoryMeta[];
export declare const DIAGNOSIS_TAB_CATEGORIES: CategoryMeta[];
