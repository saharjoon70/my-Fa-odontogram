// src/treatment/treatmentStore.ts
// Store یکپارچه برای وضعیت‌ها، درمان‌ها و تشخیص‌ها

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
  value: unknown;  // ⭐ unknown
}

export interface TreatmentRecord extends BaseRecord {
  kind: "treatment";
  treatmentId: string;
  treatmentLabel: string;
  category: string;
  surface?: string;
  material?: string;
  price: number;
  status: "done" | "planned";
}

export interface DiagnosisRecord extends BaseRecord {
  kind: "diagnosis";
  planId?: string;
  planLabel?: string;
  clinicalDx?: string;
  dxValue?: string;
  price: number;
  status: "done" | "planned";
}

export type OdontogramRecord = StatusRecord | TreatmentRecord | DiagnosisRecord;

interface StoreState {
  records: OdontogramRecord[];
}

const STORAGE_KEY = "odontogram_records_v1";

function load(): OdontogramRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("[treatmentStore] load failed", e);
    return [];
  }
}

function save(records: OdontogramRecord[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error("[treatmentStore] save failed", e);
  }
}

export const store = reactive<StoreState>({
  records: load(),
});

function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// ═══════════════════════════════════════════════
// addRecord — یک امضای عمومی، بدون overload
// ═══════════════════════════════════════════════
/**
 * افزودن یک رکورد (status / treatment / diagnosis).
 * ورودی می‌تواند هر یک از انواع سه‌گانه باشد.
 */
// src/treatment/treatmentStore.ts

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

  // ⭐ cast از طریق unknown
  const typedRecord = newRecord as unknown as OdontogramRecord;

  store.records.push(typedRecord);
  save(store.records);
  return typedRecord;
}

export function removeRecord(id: string): boolean {
  const idx = store.records.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  store.records.splice(idx, 1);
  save(store.records);
  return true;
}

export function removeRecordsForTooth(toothNo: number): number {
  const before = store.records.length;
  store.records = store.records.filter((r) => r.toothNo !== toothNo);
  save(store.records);
  return before - store.records.length;
}

export function removeRecordsForPatient(patientId: string): number {
  const before = store.records.length;
  store.records = store.records.filter((r) => r.patientId !== patientId);
  save(store.records);
  return before - store.records.length;
}

export function clearAll(): void {
  store.records.splice(0, store.records.length);
  save(store.records);
}

export function getRecordsForTooth(
  patientId: string,
  toothNo: number,
): OdontogramRecord[] {
  return store.records.filter(
    (r) => r.patientId === patientId && r.toothNo === toothNo,
  );
}

export function getRecordsByKind(
  patientId: string,
  toothNo: number,
  kind: RecordKind,
): OdontogramRecord[] {
  return getRecordsForTooth(patientId, toothNo).filter((r) => r.kind === kind);
}

export function getRecordsForPatient(patientId: string): OdontogramRecord[] {
  return store.records.filter((r) => r.patientId === patientId);
}

export function getToothTotal(patientId: string, toothNo: number): number {
  return getRecordsForTooth(patientId, toothNo)
    .filter(
      (r): r is TreatmentRecord | DiagnosisRecord =>
        (r.kind === "treatment" || r.kind === "diagnosis") && r.status === "done",
    )
    .reduce((sum, r) => sum + (r.price || 0), 0);
}

export function getPatientTotal(patientId: string): number {
  return getRecordsForPatient(patientId)
    .filter(
      (r): r is TreatmentRecord | DiagnosisRecord =>
        (r.kind === "treatment" || r.kind === "diagnosis") && r.status === "done",
    )
    .reduce((sum, r) => sum + (r.price || 0), 0);
}

export const allRecords = computed(() => store.records);
export const recordCount = computed(() => store.records.length);