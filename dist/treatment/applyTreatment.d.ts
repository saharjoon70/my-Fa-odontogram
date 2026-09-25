import { OdontogramRecord, StatusRecord, TreatmentRecord, DiagnosisRecord } from './treatmentStore';
import { StatePatch } from './statusToState';
/**
 * state دندان را از store مشتق و روی SVG اعمال می‌کند.
 * این تابع قلب جریان است — بعد از هر تغییر در store صدا زده می‌شود.
 */
export declare function recomputeToothState(patientId: string, toothNo: number): Record<string, unknown>;
/**
 * اعمال دستی یک patch (برای پیش‌نمایش).
 */
export declare function applyPatchToTooth(toothNo: number, patch: StatePatch): void;
/**
 * بازگشت به حالت پیش‌فرض (وقتی همه رکوردهای دندان حذف شد).
 */
export declare function resetToothToDefault(toothNo: number): void;
/**
 * ثبت یک وضعیت جدید + recompute.
 * اگر همان (groupId, itemId) قبلاً ثبت شده بود، اول حذفش می‌کنیم.
 */
export declare function submitStatus(patientId: string, toothNo: number, groupId: string, itemId: string, value: boolean | string): StatusRecord;
/**
 * حذف یک وضعیت (uncheck).
 */
export declare function unsubmitStatus(patientId: string, toothNo: number, groupId: string, itemId: string): number;
/**
 * ثبت یک درمان جدید + recompute.
 */
export declare function submitTreatment(patientId: string, toothNo: number, treatment: {
    treatmentId: string;
    treatmentLabel: string;
    category: string;
    surface?: string;
    material?: string;
    price: number;
    status: "done" | "planned";
    note?: string;
}): TreatmentRecord;
/**
 * ثبت یک تشخیص/طرح درمان جدید + recompute.
 */
export declare function submitDiagnosis(patientId: string, toothNo: number, diagnosis: {
    planId?: string;
    planLabel?: string;
    clinicalDx?: string;
    dxValue?: string;
    price: number;
    status: "done" | "planned";
    note?: string;
}): DiagnosisRecord;
/**
 * حذف یک رکورد + recompute.
 */
export declare function deleteRecord(patientId: string, toothNo: number, recordId: string): boolean;
/**
 * پیش‌نمایش یک درمان (بدون ذخیره در store).
 * بعد از پیش‌نمایش، با فراخوانی resetToothToDefault یا recomputeToothState برگردانید.
 */
export declare function previewTreatment(toothNo: number, patch: StatePatch): void;
/**
 * پاک کردن پیش‌نمایش و بازگشت به state ذخیره‌شده.
 */
export declare function clearPreview(patientId: string, toothNo: number): void;
export type { OdontogramRecord, StatusRecord, TreatmentRecord, DiagnosisRecord, };
