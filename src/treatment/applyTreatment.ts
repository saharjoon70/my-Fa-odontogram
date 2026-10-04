// src/treatment/applyTreatment.ts
// پل بین store و odontogram.ts

import { setToothStateAndRender } from "../odontogram";
import {
  getRecordsForTooth,
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
  deriveToothPatch,
  derivePatchFromRecords,
  treatmentToPatchPreview,
} from "./deriveToothState";
import type { TreatmentItem } from "./treatments";
import type { StatePatch } from "./statusToState";
import { STATUS_EXTRAS, type StatusExtra } from "./status_extras";

// ═══════════════════════════════════════════════
// هسته
// ═══════════════════════════════════════════════

export function recomputeToothState(
  patientId: string,
  toothNo: number,
): Record<string, unknown> {
  const neutralPatch = buildNeutralPatch(patientId, toothNo);
  setToothStateAndRender(toothNo, neutralPatch);

  const records = getRecordsForTooth(patientId, toothNo);
  if (records.length > 0) {
    const storedPatch = derivePatchFromRecords(records);
    setToothStateAndRender(toothNo, storedPatch);
  }

  return {};
}

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

// ═══════════════════════════════════════════════
// خواندن ساختار از store
// ═══════════════════════════════════════════════

function getStoredToothSelection(patientId: string, toothNo: number): string {
  const records = getRecordsForTooth(patientId, toothNo);

  const selectionRecords = records
    .filter(
      (r): r is StatusRecord =>
        r.kind === "status" && r.itemId === "toothSelection",
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  if (selectionRecords.length > 0) {
    return String(selectionRecords[0].value);
  }

  const implantRecord = records.find(
    (r) => r.kind === "treatment" && r.treatmentId === "implant",
  );
  if (implantRecord) return "implant";

  const extractionRecord = records.find(
    (r) =>
      r.kind === "treatment" && r.treatmentId.startsWith("extraction-"),
  );
  if (extractionRecord) return "none";

  const dentureRecord = records.find(
    (r) => r.kind === "treatment" && r.treatmentId.startsWith("denture-"),
  );
  if (dentureRecord) return "none";

  return "tooth-base";
}

function getStoredToothSubstrate(patientId: string, toothNo: number): string {
  const records = getRecordsForTooth(patientId, toothNo);

  const substrateRecords = records
    .filter(
      (r): r is StatusRecord =>
        r.kind === "status" && r.itemId === "toothSubstrate",
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  if (substrateRecords.length > 0) {
    return String(substrateRecords[0].value);
  }

  const restoRecord = records.find(
    (r) =>
      r.kind === "treatment" &&
      (r.treatmentId === "crown" || r.treatmentId === "temporary-crown"),
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
    toothSelection: storedSelection,
    toothSubstrate: storedSubstrate,
    restorationType: "none",
    restorationMaterial: "none",
    fillingMaterial: "none",
    fillingSurfaces: new Set<string>(),
    fillingSurfaceMaterials: new Map<string, string>(),
    fillingDefect: new Map<string, string>(),
    prosthesis: "none",
    endo: "none",
    endoResection: false,
    pulpDx: "normal",
    pulpLatin: "none",
    apicalDx: "normal",
    periapicalType: "none",
    resorptionType: "none",
    periImplant: "none",
    orthoAppliance: "none",
    orthoDrift: "none",
    orthoVertical: "none",
    orthoRotation: false,
    calculus: false,
    fissureSealing: false,
    mobility: "none",
    mods: new Set<string>(),
    caries: new Set<string>(),
    cariesSeverity: new Map<string, number>(),
    rootCaries: "none",
    radiographicDepth: new Map<string, string>(),
    crownLeakage: false,
    crownReplace: false,
    crownNeeded: false,
    bridgePillar: false,
    brokenMesial: false,
    brokenIncisal: false,
    brokenDistal: false,
    extractionPlan: false,
    extractionWound: false,
    missingClosed: false,
    wearEdge: "none",
    wearCervical: "none",
    discoloration: "none",
    parapulpalPin: false,
    contactMesial: false,
    contactDistal: false,
    customStates: {},
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
    const storedPatch = derivePatchFromRecords(records);
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
  // ⭐ رکوردهای خاص FillingPanel — به‌جای derive، مستقیم اعمال می‌شوند
if (groupId === "filling" && itemId === "all-surfaces") {
  const v = value as { surfaces?: string[]; material?: string } | undefined;
  const surfaces = v?.surfaces ?? [];
  const material = v?.material ?? "none";

  const materialsMap: Record<string, string> = {};
  for (const s of surfaces) {
    materialsMap[s] = material;
  }

  setToothStateAndRender(toothNo, {
    fillingMaterial: material,
    fillingSurfaces: surfaces,
    fillingSurfaceMaterials: materialsMap,
  });
}

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

  // ⭐ اگر رکورد از نوع FillingPanel نبود، recompute کن
  if (!(groupId === "filling" && itemId.startsWith("surface-"))) {
    recomputeToothState(patientId, toothNo);
  }

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

// ═══════════════════════════════════════════════
// پریست‌های وضعیت (Status Extras)
// ═══════════════════════════════════════════════

export function applyStatusExtraPreset(
  _patientId: string,
  extra: StatusExtra,
): void {
  if (extra.type === "span") {
    for (const toothNo of extra.teeth) {
      setToothStateAndRender(toothNo, {
        restorationType: "crown",
        restorationMaterial: extra.material,
        toothSubstrate: "crownprep",
        bridgePillar: true,
      });
    }
  } else if (extra.type === "arch-bridge") {
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
  } else if (extra.type === "partial-removable") {
    const archTeeth =
      extra.arch === "upper"
        ? STATUS_EXTRAS.arches.upper
        : STATUS_EXTRAS.arches.lower;
    for (const toothNo of archTeeth) {
      setToothStateAndRender(toothNo, {
        prosthesis: "removable-partial",
      });
    }
  } else if (extra.type === "full-removable") {
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
    for (const toothNo of extra.implants) {
      setToothStateAndRender(toothNo, {
        toothSelection: "implant",
        prosthesis: "bar-denture",
      });
    }
    for (const toothNo of extra.missing) {
      setToothStateAndRender(toothNo, {
        toothSelection: "none",
        prosthesis: "bar-denture",
      });
    }
  }
}

// ═══════════════════════════════════════════════
// Re-export
// ═══════════════════════════════════════════════
export { deriveToothPatch, derivePatchFromRecords, treatmentToPatchPreview };
export type { OdontogramRecord, StatusRecord, TreatmentRecord, DiagnosisRecord };