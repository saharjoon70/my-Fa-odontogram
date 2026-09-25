/** نوع رکورد — سه نوع در یک store */
export type RecordKind = "status" | "treatment" | "diagnosis";
/** شکل پایه رکورد */
export interface BaseRecord {
    id: string;
    kind: RecordKind;
    patientId: string;
    toothNo: number;
    /** تاریخ ISO (YYYY-MM-DD) */
    date: string;
    /** یادداشت آزاد */
    note: string;
    /** نام اپراتور (اختیاری) */
    operator?: string;
    /** timestamp ایجاد */
    createdAt: number;
}
/** رکورد وضعیت — از تب ۱ */
export interface StatusRecord extends BaseRecord {
    kind: "status";
    /** شناسه گروه (presence, crown, caries, ...) */
    groupId: string;
    /** شناسه آیتم (missing, brokenMesial, cariesMesial, ...) */
    itemId: string;
    /** مقدار — برای checkbox boolean، برای radio رشته */
    value: boolean | string;
}
/** رکورد درمان — از تب ۲ */
export interface TreatmentRecord extends BaseRecord {
    kind: "treatment";
    /** شناسه سرویس (filling-composite, crown, ...) */
    treatmentId: string;
    /** برچسب ذخیره‌شده (برای نمایش سریع) */
    treatmentLabel: string;
    /** دسته سرویس */
    category: string;
    /** سطح (mesial, distal, ...) */
    surface?: string;
    /** جنس (zircon, emax, ...) */
    material?: string;
    /** قیمت (تومان) */
    price: number;
    /** وضعیت درمان */
    status: "done" | "planned";
}
/** رکورد تشخیص — از تب ۳ (طرح درمان + تشخیص بالینی) */
export interface DiagnosisRecord extends BaseRecord {
    kind: "diagnosis";
    /** شناسه سرویس طرح درمان (crown-needed, extraction-plan, ...) */
    planId?: string;
    planLabel?: string;
    /** تشخیص بالینی (pulpDx, apicalDx, mobility, ...) */
    clinicalDx?: string;
    /** مقدار تشخیص */
    dxValue?: string;
    price: number;
    status: "done" | "planned";
}
/** اتحاد سه نوع */
export type OdontogramRecord = StatusRecord | TreatmentRecord | DiagnosisRecord;
export declare const store: {
    records: ({
        kind: "status";
        groupId: string;
        itemId: string;
        value: boolean | string;
        id: string;
        patientId: string;
        toothNo: number;
        date: string;
        note: string;
        operator?: string;
        createdAt: number;
    } | {
        kind: "treatment";
        treatmentId: string;
        treatmentLabel: string;
        category: string;
        surface?: string;
        material?: string;
        price: number;
        status: "done" | "planned";
        id: string;
        patientId: string;
        toothNo: number;
        date: string;
        note: string;
        operator?: string;
        createdAt: number;
    } | {
        kind: "diagnosis";
        planId?: string;
        planLabel?: string;
        clinicalDx?: string;
        dxValue?: string;
        price: number;
        status: "done" | "planned";
        id: string;
        patientId: string;
        toothNo: number;
        date: string;
        note: string;
        operator?: string;
        createdAt: number;
    })[];
};
/** افزودن رکورد */
export declare function addRecord(record: Omit<StatusRecord, "id" | "createdAt"> & {
    id?: string;
    createdAt?: number;
}): StatusRecord;
export declare function addRecord(record: Omit<TreatmentRecord, "id" | "createdAt"> & {
    id?: string;
    createdAt?: number;
}): TreatmentRecord;
export declare function addRecord(record: Omit<DiagnosisRecord, "id" | "createdAt"> & {
    id?: string;
    createdAt?: number;
}): DiagnosisRecord;
/** حذف رکورد با id */
export declare function removeRecord(id: string): boolean;
/** حذف همه رکوردهای یک دندان */
export declare function removeRecordsForTooth(toothNo: number): number;
/** حذف همه رکوردهای یک بیمار */
export declare function removeRecordsForPatient(patientId: string): number;
/** حذف همه رکوردها */
export declare function clearAll(): void;
/** همه رکوردهای یک دندان */
export declare function getRecordsForTooth(patientId: string, toothNo: number): OdontogramRecord[];
/** رکوردهای یک دندان به تفکیک نوع */
export declare function getRecordsByKind(patientId: string, toothNo: number, kind: RecordKind): OdontogramRecord[];
/** همه رکوردهای یک بیمار */
export declare function getRecordsForPatient(patientId: string): OdontogramRecord[];
/** جمع قیمت رکوردهای یک دندان (فقط done) */
export declare function getToothTotal(patientId: string, toothNo: number): number;
/** جمع قیمت کل یک بیمار */
export declare function getPatientTotal(patientId: string): number;
export declare const allRecords: import('vue').ComputedRef<({
    kind: "status";
    groupId: string;
    itemId: string;
    value: boolean | string;
    id: string;
    patientId: string;
    toothNo: number;
    date: string;
    note: string;
    operator?: string;
    createdAt: number;
} | {
    kind: "treatment";
    treatmentId: string;
    treatmentLabel: string;
    category: string;
    surface?: string;
    material?: string;
    price: number;
    status: "done" | "planned";
    id: string;
    patientId: string;
    toothNo: number;
    date: string;
    note: string;
    operator?: string;
    createdAt: number;
} | {
    kind: "diagnosis";
    planId?: string;
    planLabel?: string;
    clinicalDx?: string;
    dxValue?: string;
    price: number;
    status: "done" | "planned";
    id: string;
    patientId: string;
    toothNo: number;
    date: string;
    note: string;
    operator?: string;
    createdAt: number;
})[]>;
export declare const recordCount: import('vue').ComputedRef<number>;
