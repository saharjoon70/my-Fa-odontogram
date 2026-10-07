// src/treatment/treatmentStore.ts
// Store یکپارچه — در حافظه (بدون localStorage)

import { reactive, computed } from "vue";

export type RecordKind = "status" | "treatment" | "diagnosis";

export interface BaseRecord {
  id: string;
  kind: RecordKind;
  patientId: string;
  toothNo: number;
  date: string;
  note: string;
  operator?: string;
  createdAt: number;
}

export interface StatusRecord extends BaseRecord {
  kind: "status";
  groupId: string;
  itemId: string;
  value: unknown;
}

export interface TreatmentRecord extends BaseRecord {
  kind: "treatment";
  treatmentId: string;
  treatmentLabel: string;
  category: string;
  surface?: string;
  material?: string;
  price: number;
  status: "done" | "planned" | "cancelled";
  // ⭐ فیلدهای جدید — همه optional
  planId?: string;
  sessionId?: string;
  doctorId?: string;
  assistantId?: string;
  time?: string;
}

export interface DiagnosisRecord extends BaseRecord {
  kind: "diagnosis";
  planId?: string;
  planLabel?: string;
  clinicalDx?: string;
  dxValue?: string;
  price: number;
  status: "done" | "planned" | "cancelled";
  // ⭐ فیلدهای جدید — همه optional
  sessionId?: string;
  doctorId?: string;
  assistantId?: string;
  time?: string;
}


export type OdontogramRecord = StatusRecord | TreatmentRecord | DiagnosisRecord;

interface StoreState {
  records: OdontogramRecord[];
}

// ⭐ فقط در حافظه — بدون localStorage
export const store = reactive<StoreState>({
  records: [],
});

// ═══════════════════════════════════════════════
// uid
// ═══════════════════════════════════════════════
function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// ═══════════════════════════════════════════════
// addRecord
// ═══════════════════════════════════════════════
export function addRecord<
  T extends Omit<OdontogramRecord, "id" | "createdAt"> & {
    id?: string;
    createdAt?: number;
  },
>(record: T): OdontogramRecord {
  const newRecord = {
    ...record,
    id: record.id ?? uid(),
    createdAt: record.createdAt ?? Date.now(),
  };

  const typedRecord = newRecord as unknown as OdontogramRecord;

  store.records.push(typedRecord);
  return typedRecord;
}

// ═══════════════════════════════════════════════
// removeRecord
// ═══════════════════════════════════════════════
export function removeRecord(id: string): boolean {
  const idx = store.records.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  store.records.splice(idx, 1);
  return true;
}

// ═══════════════════════════════════════════════
// removeRecordsForTooth
// ═══════════════════════════════════════════════
export function removeRecordsForTooth(toothNo: number): number {
  const before = store.records.length;
  store.records = store.records.filter((r) => r.toothNo !== toothNo);
  return before - store.records.length;
}

// ═══════════════════════════════════════════════
// removeRecordsForPatient
// ═══════════════════════════════════════════════
export function removeRecordsForPatient(patientId: string): number {
  const before = store.records.length;
  store.records = store.records.filter((r) => r.patientId !== patientId);
  return before - store.records.length;
}

// ═══════════════════════════════════════════════
// clearAll
// ═══════════════════════════════════════════════
export function clearAll(): void {
  store.records.splice(0, store.records.length);
}

// ═══════════════════════════════════════════════
// getRecordsForTooth
// ═══════════════════════════════════════════════
export function getRecordsForTooth(
  patientId: string,
  toothNo: number,
): OdontogramRecord[] {
  return store.records.filter(
    (r) => r.patientId === patientId && r.toothNo === toothNo,
  );
}

// ═══════════════════════════════════════════════
// getRecordsByKind
// ═══════════════════════════════════════════════
export function getRecordsByKind(
  patientId: string,
  toothNo: number,
  kind: RecordKind,
): OdontogramRecord[] {
  return getRecordsForTooth(patientId, toothNo).filter((r) => r.kind === kind);
}

// ═══════════════════════════════════════════════
// getRecordsForPatient
// ═══════════════════════════════════════════════
export function getRecordsForPatient(patientId: string): OdontogramRecord[] {
  return store.records.filter((r) => r.patientId === patientId);
}

// ═══════════════════════════════════════════════
// getToothTotal
// ═══════════════════════════════════════════════
export function getToothTotal(patientId: string, toothNo: number): number {
  return getRecordsForTooth(patientId, toothNo)
    .filter(
      (r): r is TreatmentRecord | DiagnosisRecord =>
        (r.kind === "treatment" || r.kind === "diagnosis") && r.status === "done",
    )
    .reduce((sum, r) => sum + (r.price || 0), 0);
}

// ═══════════════════════════════════════════════
// getPatientTotal
// ═══════════════════════════════════════════════
export function getPatientTotal(patientId: string): number {
  return getRecordsForPatient(patientId)
    .filter(
      (r): r is TreatmentRecord | DiagnosisRecord =>
        (r.kind === "treatment" || r.kind === "diagnosis") && r.status === "done",
    )
    .reduce((sum, r) => sum + (r.price || 0), 0);
}

// ═══════════════════════════════════════════════
// computed
// ═══════════════════════════════════════════════
export const allRecords = computed(() => store.records);
export const recordCount = computed(() => store.records.length);