// src/treatment/applyTreatment.ts
// پل بین store و odontogram.ts

import { setToothStateAndRender } from "../odontogram";
import { getRecordsForTooth, addRecord, removeRecord } from "./treatmentStore";
import type {
  StatusRecord,
  TreatmentRecord,
  DiagnosisRecord,
  OdontogramRecord,
} from "./treatmentStore";
import {
  deriveToothPatch,
  derivePatchFromRecords,
  treatmentToPatchPreview,
} from "./deriveToothState";
import type { TreatmentItem } from "./treatments";
import type { StatePatch } from "./statusToState";

// ═══════════════════════════════════════════════
// هسته
// ═══════════════════════════════════════════════

export function recomputeToothState(
  patientId: string,
  toothNo: number,
): Record<string, unknown> {
  const patch = deriveToothPatch(patientId, toothNo);
  setToothStateAndRender(toothNo, patch);
  return patch;
}

export function previewTreatmentOnTooth(
  toothNo: number,
  patch: StatePatch,
): void {
  setToothStateAndRender(toothNo, patch);
}

// src/treatment/applyTreatment.ts

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

// ═══════════════════════════════════════════════
// خواندن ساختار از store
// ═══════════════════════════════════════════════

function getStoredToothSelection(patientId: string, toothNo: number): string {
  const records = getRecordsForTooth(patientId, toothNo);

  // آخرین رکورد status که toothSelection را تغییر داده
  const selectionRecords = records
    .filter((r): r is StatusRecord =>
      r.kind === "status" && r.itemId === "toothSelection"
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  if (selectionRecords.length > 0) {
    return String(selectionRecords[0].value);
  }

  // implant
  const implantRecord = records.find((r) =>
    r.kind === "treatment" && r.treatmentId === "implant"
  );
  if (implantRecord) return "implant";

  // extraction
  const extractionRecord = records.find((r) =>
    r.kind === "treatment" && r.treatmentId.startsWith("extraction-")
  );
  if (extractionRecord) return "none";

  // denture
  const dentureRecord = records.find((r) =>
    r.kind === "treatment" && r.treatmentId.startsWith("denture-")
  );
  if (dentureRecord) return "none";

  return "tooth-base";
}

function getStoredToothSubstrate(patientId: string, toothNo: number): string {
  const records = getRecordsForTooth(patientId, toothNo);

  const substrateRecords = records
    .filter((r): r is StatusRecord =>
      r.kind === "status" && r.itemId === "toothSubstrate"
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  if (substrateRecords.length > 0) {
    return String(substrateRecords[0].value);
  }

  // crown → crownprep
  const restoRecord = records.find((r) =>
    r.kind === "treatment" &&
    (r.treatmentId === "crown" || r.treatmentId === "temporary-crown")
  );
  if (restoRecord) return "crownprep";

  return "natural";
}

// ═══════════════════════════════════════════════
// patch خنثی
// ═══════════════════════════════════════════════

function buildNeutralPatch(
  patientId: string,
  toothNo: number,
): Record<string, unknown> {
  const storedSelection = getStoredToothSelection(patientId, toothNo);
  const storedSubstrate = getStoredToothSubstrate(patientId, toothNo);

  return {
    // ساختاری — از store
    toothSelection: storedSelection,
    toothSubstrate: storedSubstrate,

    // restoration
    restorationType: "none",
    restorationMaterial: "none",
    // filling
    fillingMaterial: "none",
    fillingSurfaces: new Set<string>(),            // ⭐ Set
    fillingSurfaceMaterials: new Map<string, string>(), // ⭐ Map
    fillingDefect: new Map<string, string>(),      // ⭐ Map
    // prosthesis
    prosthesis: "none",
    // endo
    endo: "none",
    endoResection: false,
    pulpDx: "normal",
    pulpLatin: "none",
    // apical
    apicalDx: "normal",
    periapicalType: "none",
    resorptionType: "none",
    // peri-implant
    periImplant: "none",
    // ortho
    orthoAppliance: "none",
    orthoDrift: "none",
    orthoVertical: "none",
    orthoRotation: false,
    // perio
    calculus: false,
    fissureSealing: false,
    mobility: "none",
    mods: new Set<string>(),                        // ⭐ Set
    // caries
    caries: new Set<string>(),                      // ⭐ Set
    cariesSeverity: new Map<string, number>(),      // ⭐ Map
    rootCaries: "none",
    radiographicDepth: new Map<string, string>(),   // ⭐ Map
    // crown
    crownLeakage: false,
    crownReplace: false,
    crownNeeded: false,
    bridgePillar: false,
    brokenMesial: false,
    brokenIncisal: false,
    brokenDistal: false,
    // plan
    extractionPlan: false,
    extractionWound: false,
    missingClosed: false,
    // wear
    wearEdge: "none",
    wearCervical: "none",
    // color
    discoloration: "none",
    // other
    parapulpalPin: false,
    contactMesial: false,
    contactDistal: false,
  };
}

// ═══════════════════════════════════════════════
// reset
// ═══════════════════════════════════════════════

export function clearPreviewLayers(
  patientId: string,
  toothNo: number,
): void {
  const patch = buildNeutralPatch(patientId, toothNo);
  setToothStateAndRender(toothNo, patch);
}

export function resetToothToDefault(
  patientId: string,
  toothNo: number,
): void {
  clearPreviewLayers(patientId, toothNo);
}

export function resetToothToStoredState(
  patientId: string,
  toothNo: number,
): void {
  const neutralPatch = buildNeutralPatch(patientId, toothNo);
  setToothStateAndRender(toothNo, neutralPatch);

  const records = getRecordsForTooth(patientId, toothNo);
  if (records.length > 0) {
    const storedPatch = derivePatchFromRecords(records, toothNo);
    setToothStateAndRender(toothNo, storedPatch);
  }
}

// ═══════════════════════════════════════════════
// ثبت
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
    status: "done" | "planned";
    note?: string;
  },
): TreatmentRecord {
  const newRecord: Omit<TreatmentRecord, "id" | "createdAt"> = {
    kind: "treatment",
    patientId,
    toothNo,
    date: new Date().toISOString().slice(0, 10),
    note: treatment.note ?? "",
    treatmentId: treatment.treatmentId,
    treatmentLabel: treatment.treatmentLabel,
    category: treatment.category,
    surface: treatment.surface,
    material: treatment.material,
    price: treatment.price,
    status: treatment.status,
  };

  const rec = addRecord(newRecord) as TreatmentRecord;
  recomputeToothState(patientId, toothNo);
  return rec;
}

export function submitDiagnosis(
  patientId: string,
  toothNo: number,
  diagnosis: {
    planId?: string;
    planLabel?: string;
    clinicalDx?: string;
    dxValue?: string;
    price: number;
    status: "done" | "planned";
    note?: string;
  },
): DiagnosisRecord {
  const newRecord: Omit<DiagnosisRecord, "id" | "createdAt"> = {
    kind: "diagnosis",
    patientId,
    toothNo,
    date: new Date().toISOString().slice(0, 10),
    note: diagnosis.note ?? "",
    planId: diagnosis.planId,
    planLabel: diagnosis.planLabel,
    clinicalDx: diagnosis.clinicalDx,
    dxValue: diagnosis.dxValue,
    price: diagnosis.price,
    status: diagnosis.status,
  };

  const rec = addRecord(newRecord) as DiagnosisRecord;
  recomputeToothState(patientId, toothNo);
  return rec;
}

export function deleteRecord(
  patientId: string,
  toothNo: number,
  recordId: string,
): boolean {
  const ok = removeRecord(recordId);
  if (ok) recomputeToothState(patientId, toothNo);
  return ok;
}

export { deriveToothPatch, derivePatchFromRecords, treatmentToPatchPreview };
export type { OdontogramRecord, StatusRecord, TreatmentRecord, DiagnosisRecord };