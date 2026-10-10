// src/treatment/applyTreatment.ts
// پل بین store و odontogram.ts — نسخه‌ی نهایی

import { setToothStateAndRender } from "../odontogram";
import {
  getRecordsForTooth,
  getRecordsForPatient,
  addRecord,
  removeRecord,
} from "./treatmentStore";
import type {
  StatusRecord,
  TreatmentRecord,
  DiagnosisRecord,
  OdontogramRecord,
} from "./treatmentStore";
import {
  derivePatchFromRecords,
  treatmentToPatchPreview,
} from "./deriveToothState";
import type { TreatmentItem } from "./treatments";
import type { StatePatch } from "./statusToState";
import { getSessionsForPlan } from "./treatmentPlanStore";
import { STATUS_EXTRAS } from "./status_extras";

// ═══════════════════════════════════════════════
// recompute
// ═══════════════════════════════════════════════

export function recomputeToothState(
  patientId: string,
  toothNo: number,
): void {
  const records = getRecordsForTooth(patientId, toothNo);
  if (records.length > 0) {
    const patch = derivePatchFromRecords(records);
    setToothStateAndRender(toothNo, patch);
  }
}

// ═══════════════════════════════════════════════
// Preview
// ═══════════════════════════════════════════════

export function previewTreatmentOnTooth(
  toothNo: number,
  patch: StatePatch,
): void {
  setToothStateAndRender(toothNo, patch);
}

export function previewTreatmentItem(
  toothNo: number,
  item: TreatmentItem,
  options: { surfaces?: string[]; material?: string },
): void {
  const patch = treatmentToPatchPreview(item, options);
  if (patch) {
    setToothStateAndRender(toothNo, patch);
  }
}

export function applyPatchToTooth(toothNo: number, patch: StatePatch): void {
  setToothStateAndRender(toothNo, patch);
}

export function clearPreviewLayers(
  _patientId: string,
  toothNo: number,
): void {
  setToothStateAndRender(toothNo, {});
}

/** بازگرداندن دندون به state ذخیره‌شده */
export function resetToothToStoredState(
  patientId: string,
  toothNo: number,
): void {
  const records = getRecordsForTooth(patientId, toothNo);
  if (records.length > 0) {
    const patch = derivePatchFromRecords(records);
    setToothStateAndRender(toothNo, patch);
  }
}

// ═══════════════════════════════════════════════
// محاسبه‌ی مالی
// ═══════════════════════════════════════════════

export interface FinancialBreakdown {
  price: number;
  discountAmount: number;
  afterDiscount: number;
  insuranceAmount: number;
  patientAmount: number;
}

export function calculateFinancials(rec: {
  price: number;
  discountType?: "percent" | "amount";
  discountValue?: number;
  insuranceType?: "percent" | "amount" | "none";
  insuranceValue?: number;
}): FinancialBreakdown {
  const price = rec.price || 0;

  let discountAmount = 0;
  if (rec.discountType === "percent" && rec.discountValue) {
    discountAmount = Math.round((price * rec.discountValue) / 100);
  } else if (rec.discountType === "amount" && rec.discountValue) {
    discountAmount = rec.discountValue;
  }
  const afterDiscount = Math.max(0, price - discountAmount);

  let insuranceAmount = 0;
  if (rec.insuranceType === "percent" && rec.insuranceValue) {
    insuranceAmount = Math.round((afterDiscount * rec.insuranceValue) / 100);
  } else if (rec.insuranceType === "amount" && rec.insuranceValue) {
    insuranceAmount = rec.insuranceValue;
  }
  const patientAmount = Math.max(0, afterDiscount - insuranceAmount);

  return {
    price,
    discountAmount,
    afterDiscount,
    insuranceAmount,
    patientAmount,
  };
}

// ═══════════════════════════════════════════════
// Status Extras Preset
// ═══════════════════════════════════════════════

export function applyStatusExtraPreset(
  _patientId: string,
  extra: {
    id: string;
    type: string;
    teeth?: number[];
    material?: string;
    arch?: "upper" | "lower";
    implants?: number[];
    missing?: number[];
  },
): void {
  if (extra.type === "span" && extra.teeth) {
    for (const toothNo of extra.teeth) {
      setToothStateAndRender(toothNo, {
        restorationType: "crown",
        restorationMaterial: extra.material,
        toothSubstrate: "crownprep",
        bridgePillar: true,
      });
    }
  } else if (extra.type === "arch-bridge" && extra.arch) {
    const archTeeth =
      extra.arch === "upper"
        ? STATUS_EXTRAS.arches.upper
        : STATUS_EXTRAS.arches.lower;
    for (const toothNo of archTeeth) {
      setToothStateAndRender(toothNo, {
        restorationType: "crown",
        restorationMaterial: extra.material,
        toothSubstrate: "crownprep",
        bridgePillar: true,
      });
    }
  } else if (extra.type === "partial-removable" && extra.arch) {
    const archTeeth =
      extra.arch === "upper"
        ? STATUS_EXTRAS.arches.upper
        : STATUS_EXTRAS.arches.lower;
    for (const toothNo of archTeeth) {
      setToothStateAndRender(toothNo, {
        prosthesis: "removable-partial",
      });
    }
  } else if (extra.type === "full-removable" && extra.arch) {
    const archTeeth =
      extra.arch === "upper"
        ? STATUS_EXTRAS.arches.upper
        : STATUS_EXTRAS.arches.lower;
    for (const toothNo of archTeeth) {
      setToothStateAndRender(toothNo, {
        prosthesis: "removable-full",
      });
    }
  } else if (extra.type === "bar-denture") {
    if (extra.implants) {
      for (const toothNo of extra.implants) {
        setToothStateAndRender(toothNo, {
          toothSelection: "implant",
          prosthesis: "bar-denture",
        });
      }
    }
    if (extra.missing) {
      for (const toothNo of extra.missing) {
        setToothStateAndRender(toothNo, {
          toothSelection: "none",
          prosthesis: "bar-denture",
        });
      }
    }
  }
}

// ═══════════════════════════════════════════════
// Submit Treatment
// ═══════════════════════════════════════════════

export function submitTreatment(
  patientId: string,
  toothNo: number,
  treatment: {
    treatmentId: string;
    treatmentLabel: string;
    category: string;
    surface?: string;
    material?: string;
    price: number;
    status: "done" | "planned" | "cancelled";
    note?: string;
    planId?: string;
    planTitle?: string;
    sessionId?: string;
    sessionNumber?: number;
    sessionTitle?: string;
    sessionDate?: string;
    sessionTime?: string;
    doctorId?: string;
    assistantId?: string;
    time?: string;
    discountType?: "percent" | "amount";
    discountValue?: number;
    discountReason?: string;
    discountAmount?: number;
    insuranceType?: "percent" | "amount" | "none";
    insuranceValue?: number;
    insuranceName?: string;
    insuranceAmount?: number;
    patientAmount?: number;
  },
): TreatmentRecord {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = treatment.time || now.toTimeString().slice(0, 5);

  const newRecord: Omit<TreatmentRecord, "id" | "createdAt"> = {
    kind: "treatment",
    patientId,
    toothNo,
    date: dateStr,
    note: treatment.note ?? "",
    treatmentId: treatment.treatmentId,
    treatmentLabel: treatment.treatmentLabel,
    category: treatment.category,
    surface: treatment.surface,
    material: treatment.material,
    price: treatment.price,
    status: treatment.status,
    planId: treatment.planId,
    planTitle: treatment.planTitle,
    sessionId: treatment.sessionId,
    sessionDate: treatment.sessionDate || dateStr,
    sessionTime: treatment.sessionTime || timeStr,
    doctorId: treatment.doctorId,
    assistantId: treatment.assistantId,
    time: timeStr,
    discountType: treatment.discountType,
    discountValue: treatment.discountValue,
    discountReason: treatment.discountReason,
    discountAmount: treatment.discountAmount,
    insuranceType: treatment.insuranceType,
    insuranceValue: treatment.insuranceValue,
    insuranceName: treatment.insuranceName,
    insuranceAmount: treatment.insuranceAmount,
    patientAmount: treatment.patientAmount,
  };

  const rec = addRecord(newRecord) as TreatmentRecord;
  recomputeToothState(patientId, toothNo);
  return rec;
}

// ═══════════════════════════════════════════════
// Submit Diagnosis
// ═══════════════════════════════════════════════

export function submitDiagnosis(
  patientId: string,
  toothNo: number,
  diagnosis: {
    planId?: string;
    sessionId?: string;
    planLabel?: string;
    clinicalDx?: string;
    dxValue?: string;
    price: number;
    status: "done" | "planned" | "cancelled";
    note?: string;
    doctorId?: string;
    assistantId?: string;
    time?: string;
    discountType?: "percent" | "amount";
    discountValue?: number;
    discountReason?: string;
    discountAmount?: number;
    insuranceType?: "percent" | "amount" | "none";
    insuranceValue?: number;
    insuranceName?: string;
    insuranceAmount?: number;
    patientAmount?: number;
  },
): DiagnosisRecord {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  const newRecord: Omit<DiagnosisRecord, "id" | "createdAt"> = {
    kind: "diagnosis",
    patientId,
    toothNo,
    date: dateStr,
    note: diagnosis.note ?? "",
    planId: diagnosis.planId,
    sessionId: diagnosis.sessionId,
    planLabel: diagnosis.planLabel,
    clinicalDx: diagnosis.clinicalDx,
    dxValue: diagnosis.dxValue,
    price: diagnosis.price,
    status: diagnosis.status,
    doctorId: diagnosis.doctorId,
    assistantId: diagnosis.assistantId,
    time: diagnosis.time,
    discountType: diagnosis.discountType,
    discountValue: diagnosis.discountValue,
    discountReason: diagnosis.discountReason,
    discountAmount: diagnosis.discountAmount,
    insuranceType: diagnosis.insuranceType,
    insuranceValue: diagnosis.insuranceValue,
    insuranceName: diagnosis.insuranceName,
    insuranceAmount: diagnosis.insuranceAmount,
    patientAmount: diagnosis.patientAmount,
  };

  const rec = addRecord(newRecord) as DiagnosisRecord;
  recomputeToothState(patientId, toothNo);
  return rec;
}

// ═══════════════════════════════════════════════
// Submit Status
// ═══════════════════════════════════════════════

export function submitStatus(
  patientId: string,
  toothNo: number,
  groupId: string,
  itemId: string,
  value: unknown,
): StatusRecord {
  const existing = getRecordsForTooth(patientId, toothNo).filter(
    (r): r is StatusRecord =>
      r.kind === "status" && r.groupId === groupId && r.itemId === itemId,
  );
  for (const rec of existing) removeRecord(rec.id);

  const newRecord: Omit<StatusRecord, "id" | "createdAt"> = {
    kind: "status",
    patientId,
    toothNo,
    groupId,
    itemId,
    value,
    date: new Date().toISOString().slice(0, 10),
    note: "",
  };

  const rec = addRecord(newRecord) as StatusRecord;
  recomputeToothState(patientId, toothNo);
  return rec;
}

export function unsubmitStatus(
  patientId: string,
  toothNo: number,
  groupId: string,
  itemId: string,
): number {
  const existing = getRecordsForTooth(patientId, toothNo).filter(
    (r): r is StatusRecord =>
      r.kind === "status" && r.groupId === groupId && r.itemId === itemId,
  );
  let removed = 0;
  for (const rec of existing) {
    if (removeRecord(rec.id)) removed++;
  }
  if (removed > 0) recomputeToothState(patientId, toothNo);
  return removed;
}

// ═══════════════════════════════════════════════
// Delete
// ═══════════════════════════════════════════════

export function deleteRecord(
  patientId: string,
  toothNo: number,
  recordId: string,
): boolean {
  const ok = removeRecord(recordId);
  if (ok) recomputeToothState(patientId, toothNo);
  return ok;
}

// ═══════════════════════════════════════════════
// Plan Groups
// ═══════════════════════════════════════════════

export interface PlanGroup {
  planId: string;
  planTitle: string;
  doctorId?: string;
  toothNos: number[];
  records: TreatmentRecord[];
  doneCount: number;
  plannedCount: number;
  totalCount: number;
  progress: number;
  startDate: string;
  sessions: SessionGroup[];
  totalSessions: number;
  doneSessions: number;
}

export interface SessionGroup {
  sessionId: string;
  sessionNumber: number;
  sessionTitle: string;
  sessionDate: string;
  sessionTime?: string;
  status: "scheduled" | "done" | "cancelled";
  doctorId?: string;
  assistantId?: string;
  records: TreatmentRecord[];
  doneCount: number;
  plannedCount: number;
  totalCount: number;
  progress: number;
}

export function getPlanGroupsForPatient(patientId: string): PlanGroup[] {
  const allRecords = getRecordsForPatient(patientId).filter(
    (r): r is TreatmentRecord => r.kind === "treatment" && !!r.planId,
  );

  const grouped = new Map<string, TreatmentRecord[]>();
  for (const r of allRecords) {
    if (!r.planId) continue;
    if (!grouped.has(r.planId)) grouped.set(r.planId, []);
    grouped.get(r.planId)!.push(r);
  }

  const result: PlanGroup[] = [];

  for (const [planId, recs] of grouped.entries()) {
    const planTitle =
      recs.find((r) => r.planTitle)?.planTitle || "طرح بدون عنوان";
    const doctorId = recs.find((r) => r.doctorId)?.doctorId;

    const planSessions = getSessionsForPlan(planId);

    const sessionMap = new Map<string, TreatmentRecord[]>();
    for (const r of recs) {
      if (!r.sessionId) continue;
      if (!sessionMap.has(r.sessionId)) sessionMap.set(r.sessionId, []);
      sessionMap.get(r.sessionId)!.push(r);
    }

    const sessions: SessionGroup[] = [];
    for (const [sessionId, sessRecs] of sessionMap.entries()) {
      const sessionMeta = planSessions.find((s) => s.id === sessionId);
      const sessDoneCount = sessRecs.filter((r) => r.status === "done").length;
      const sessPlannedCount = sessRecs.filter(
        (r) => r.status === "planned",
      ).length;
      const sessTotal = sessRecs.length;
      const sessProgress =
        sessTotal > 0 ? Math.round((sessDoneCount / sessTotal) * 100) : 0;

      sessions.push({
        sessionId,
        sessionNumber: sessionMeta?.sessionNumber ?? 0,
        sessionTitle: sessionMeta?.title ?? "جلسه",
        sessionDate: sessionMeta?.sessionDate ?? sessRecs[0].date,
        sessionTime: sessionMeta?.sessionTime,
        status: sessionMeta?.status ?? "scheduled",
        doctorId: sessionMeta?.doctorId,
        assistantId: sessionMeta?.assistantId,
        records: sessRecs,
        doneCount: sessDoneCount,
        plannedCount: sessPlannedCount,
        totalCount: sessTotal,
        progress: sessProgress,
      });
    }
    sessions.sort((a, b) => a.sessionNumber - b.sessionNumber);

    const doneRecs = recs.filter((r) => r.status === "done");
    const plannedRecs = recs.filter((r) => r.status === "planned");
    const progress =
      recs.length > 0 ? Math.round((doneRecs.length / recs.length) * 100) : 0;

    const toothNos = [...new Set(recs.map((r) => r.toothNo))].sort(
      (a, b) => a - b,
    );

    const startDate = recs.reduce(
      (min, r) => (r.date < min ? r.date : min),
      recs[0].date,
    );

    result.push({
      planId,
      planTitle,
      doctorId,
      toothNos,
      records: recs,
      doneCount: doneRecs.length,
      plannedCount: plannedRecs.length,
      totalCount: recs.length,
      progress,
      startDate,
      sessions,
      totalSessions: sessions.length,
      doneSessions: sessions.filter((s) => s.status === "done").length,
    });
  }

  return result.sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function getPlanOptions(
  patientId: string,
): { id: string; title: string }[] {
  const records = getRecordsForPatient(patientId).filter(
    (r): r is TreatmentRecord =>
      r.kind === "treatment" && !!r.planId && !!r.planTitle,
  );

  const map = new Map<string, string>();
  for (const r of records) {
    if (r.planId && r.planTitle && !map.has(r.planId)) {
      map.set(r.planId, r.planTitle);
    }
  }

  return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
}

export function getNextSessionNumberForPlan(
  patientId: string,
  planId: string,
): number {
  const records = getRecordsForPatient(patientId).filter(
    (r): r is TreatmentRecord =>
      r.kind === "treatment" && r.planId === planId && !!r.sessionId,
  );
  const sessions = getSessionsForPlan(planId);
  const maxFromSessions =
    sessions.length > 0
      ? Math.max(...sessions.map((s) => s.sessionNumber))
      : 0;
  const maxFromRecords = records.length;
  return Math.max(maxFromRecords, maxFromSessions) + 1;
}

// ═══════════════════════════════════════════════
// Re-export
// ═══════════════════════════════════════════════

export { derivePatchFromRecords, treatmentToPatchPreview };
export type { OdontogramRecord, StatusRecord, TreatmentRecord, DiagnosisRecord };