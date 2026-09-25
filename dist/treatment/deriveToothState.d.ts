import { OdontogramRecord } from './treatmentStore';
/** state پیش‌فرض دندان — معادل defaultState() در odontogram.ts */
export declare function defaultToothState(): Record<string, unknown>;
/** وضعیت پیش‌فرض (بدون رکورد) — برای دندان خالی */
export declare function deriveToothState(patientId: string, toothNo: number): Record<string, unknown>;
/**
 * مشتق‌سازی state از یک لیست رکورد (خالص — بدون دسترسی به store).
 * برای تست و preview مفید است.
 */
export declare function deriveFromRecords(records: OdontogramRecord[], toothNo: number): Record<string, unknown>;
/** نام‌گذاری معکوس — برای نمایش در UI */
export declare function getRecordLabel(rec: OdontogramRecord): string;
