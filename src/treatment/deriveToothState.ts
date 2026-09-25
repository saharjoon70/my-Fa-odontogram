// src/treatment/deriveToothState.ts
// مشتق‌سازی state دندان از لیست رکوردها

import type {
  StatusRecord,
  TreatmentRecord,
  DiagnosisRecord,
  OdontogramRecord,
} from "./treatmentStore";
import { getRecordsForTooth } from "./treatmentStore";
import { statusItemToPatch, statusRadioToPatch } from "./statusToState";
import type { StatePatch } from "./statusToState";
import { STATUS_GROUPS } from "./statusGroups";
import type { TreatmentItem } from "./treatments";

// ═══════════════════════════════════════════════
// State پیش‌فرض
// ═══════════════════════════════════════════════
export function defaultToothState(): Record<string, unknown> {
  return {
    toothSelection: "tooth-base",
    toothSubstrate: "natural",
    restorationType: "none",
    restorationMaterial: "none",
    prosthesis: "none",
    endo: "none",
    endoResection: false,
    pulpDx: "normal",
    pulpLatin: "none",
    apicalDx: "normal",
    periapicalType: "none",
    resorptionType: "none",
    periImplant: "none",
    mobility: "none",
    caries: [],
    cariesSeverity: {},
    cariesActiveDepth: 2,
    rootCaries: "none",
    radiographicDepth: {},
    fillingMaterial: "none",
    fillingSurfaces: [],
    fillingSurfaceMaterials: {},
    fillingDefect: {},
    fissureSealing: false,
    calculus: false,
    contactMesial: false,
    contactDistal: false,
    wearEdge: "none",
    wearCervical: "none",
    discoloration: "none",
    orthoAppliance: "none",
    orthoDrift: "none",
    orthoVertical: "none",
    orthoRotation: false,
    brokenMesial: false,
    brokenIncisal: false,
    brokenDistal: false,
    crownLeakage: false,
    crownReplace: false,
    crownNeeded: false,
    extractionPlan: false,
    extractionWound: false,
    missingClosed: false,
    bridgePillar: false,
    parapulpalPin: false,
    mods: [],
    customStates: {},
    note: "",
  };
}

// ═══════════════════════════════════════════════
// applyPatch
// ═══════════════════════════════════════════════
function applyPatch(
  state: Record<string, unknown>,
  patch: StatePatch,
): Record<string, unknown> {
  const next = { ...state };

  for (const [key, value] of Object.entries(patch)) {
    // caries: { toggle, on }
    if (key === "caries" && typeof value === "object" && value !== null && "toggle" in value) {
      const { toggle, on } = value as { toggle: string; on: boolean };
      const current = new Set<string>(
        Array.isArray(next.caries) ? next.caries as string[] : [],
      );
      if (on) current.add(toggle);
      else current.delete(toggle);
      next.caries = Array.from(current);
      continue;
    }

    // cariesSeverityAll
    if (key === "cariesSeverityAll") {
      const sev = value as number;
      const cariesArr = Array.isArray(next.caries) ? next.caries as string[] : [];
      const map: Record<string, number> = { ...(next.cariesSeverity as Record<string, number> ?? {}) };
      for (const c of cariesArr) {
        const surface = c.replace("caries-", "");
        map[surface] = sev;
      }
      next.cariesSeverity = map;
      continue;
    }

    // fillingDefectAll
    if (key === "fillingDefectAll") {
      const defect = value as string;
      const on = (patch.fillingDefectOn as boolean) ?? true;
      const fsm = (next.fillingSurfaceMaterials as Record<string, string>) ?? {};
      const map: Record<string, string> = { ...(next.fillingDefect as Record<string, string> ?? {}) };
      if (on) {
        for (const surface of Object.keys(fsm)) map[surface] = defect;
      } else {
        for (const k of Object.keys(map)) delete map[k];
      }
      next.fillingDefect = map;
      continue;
    }
    if (key === "fillingDefectOn") continue;

    // mods: { toggle, on }
    if (key === "mods" && typeof value === "object" && value !== null && "toggle" in value) {
      const { toggle, on } = value as { toggle: string; on: boolean };
      const current = new Set<string>(
        Array.isArray(next.mods) ? next.mods as string[] : [],
      );
      if (on) current.add(toggle);
      else current.delete(toggle);
      next.mods = Array.from(current);
      continue;
    }

    // customStates: { key: value }
 // customStates: { key: value } — activeTreatments را merge کن
if (key === "customStates" && typeof value === "object" && value !== null) {
  const cs = { ...(next.customStates as Record<string, unknown> ?? {}) };
  const incoming = value as Record<string, unknown>;
  if (Array.isArray(incoming.activeTreatments)) {
    const existing = Array.isArray(cs.activeTreatments) ? cs.activeTreatments as string[] : [];
    cs.activeTreatments = Array.from(new Set([...existing, ...(incoming.activeTreatments as string[])]));
  }
  for (const [k, v] of Object.entries(incoming)) {
    if (k === "activeTreatments") continue;
    cs[k] = v;
  }
  next.customStates = cs;
  continue;
}
    // بقیه
    next[key] = value;
  }

  return next;
}

// ═══════════════════════════════════════════════
// deriveToothPatch
// ═══════════════════════════════════════════════
export function deriveToothPatch(
  patientId: string,
  toothNo: number,
): Record<string, unknown> {
  const records = getRecordsForTooth(patientId, toothNo);
  return derivePatchFromRecords(records, toothNo);
}

export function derivePatchFromRecords(
  records: OdontogramRecord[],
  toothNo: number,
): Record<string, unknown> {
  let state: Record<string, unknown> = {};
  let hasAnyRecord = false;

  // ─── ۱) وضعیت‌ها ───
  const statusRecords = records.filter((r): r is StatusRecord => r.kind === "status");

  const latestStatus = new Map<string, StatusRecord>();
  for (const rec of statusRecords) {
    const key = `${rec.groupId}:${rec.itemId}`;
    const existing = latestStatus.get(key);
    if (!existing || rec.createdAt > existing.createdAt) {
      latestStatus.set(key, rec);
    }
  }

  for (const rec of latestStatus.values()) {
    const group = STATUS_GROUPS.find((g) => g.id === rec.groupId);
    if (!group) continue;

    const item = group.items.find((i) => i.id === rec.itemId);
    if (item) {
      const checked =
        typeof rec.value === "boolean"
          ? rec.value
          : String(rec.value) === "true";
      const patch = statusItemToPatch(item, checked);
      if (patch) {
        state = applyPatch(state, patch);
        hasAnyRecord = true;
      }
      continue;
    }

    const radio = group.radios?.find((r) => r.field === rec.itemId);
    if (radio && typeof rec.value === "string") {
      const patch = statusRadioToPatch(radio, rec.value);
      if (patch) {
        state = applyPatch(state, patch);
        hasAnyRecord = true;
      }
    }
  }

  // ─── ۲) درمان‌ها ───
  const treatmentRecords = records.filter((r): r is TreatmentRecord => r.kind === "treatment");
  for (const rec of treatmentRecords) {
    const patch = treatmentRecordToPatch(rec);
    if (patch) {
      state = applyPatch(state, patch);
      hasAnyRecord = true;
    }
  }

  // ─── ۳) تشخیص‌ها ───
  const diagnosisRecords = records.filter((r): r is DiagnosisRecord => r.kind === "diagnosis");
  for (const rec of diagnosisRecords) {
    const patch = diagnosisToPatch(rec);
    if (patch) {
      state = applyPatch(state, patch);
      hasAnyRecord = true;
    }
  }

  if (!hasAnyRecord) return {};
  return state;
}

export function deriveToothState(
  patientId: string,
  toothNo: number,
): Record<string, unknown> {
  const patch = deriveToothPatch(patientId, toothNo);
  return { ...defaultToothState(), ...patch };
}

export function deriveFromRecords(
  records: OdontogramRecord[],
  toothNo: number,
): Record<string, unknown> {
  const patch = derivePatchFromRecords(records, toothNo);
  return { ...defaultToothState(), ...patch };
}

// ═══════════════════════════════════════════════
// treatmentToPatchPreview — برای پیش‌نمایش
// ⭐ با پشتیبانی از چند سطح (surfaces: string[])
// ═══════════════════════════════════════════════
export function treatmentToPatchPreview(
  item: TreatmentItem,
  options: { surfaces?: string[]; material?: string },
): StatePatch | null {
  const patch: StatePatch = {};
  const id = item.id;
  const surfaces = options.surfaces ?? [];
  const material = options.material;

  // ⭐ برای دندان‌های قدامی، "incisal" → "occlusal" (چون SVG فقط occlusal دارد)
  const svgSurfaces = surfaces.map((s) => (s === "incisal" ? "occlusal" : s));

  // ═══ ترمیمی ═══
  if (id === "filling-composite" || id === "filling-amalgam" ||
      id === "filling-gic" || id === "filling-class-1to5") {
    const mat = id === "filling-amalgam" ? "amalgam"
      : id === "filling-gic" ? "gic"
      : "composite";
    patch.fillingMaterial = mat;
    if (svgSurfaces.length > 0) {
      // ⭐ چند سطح
      const materialsMap: Record<string, string> = {};
      for (const s of svgSurfaces) {
        materialsMap[s] = mat;
      }
      patch.fillingSurfaceMaterials = materialsMap;
      patch.fillingSurfaces = svgSurfaces;
    }
  } else if (id === "broken-crown-reconstruction") {
    patch.fillingMaterial = "composite";
    if (svgSurfaces.length > 0) {
      const materialsMap: Record<string, string> = {};
      for (const s of svgSurfaces) {
        materialsMap[s] = "composite";
      }
      patch.fillingSurfaceMaterials = materialsMap;
      patch.fillingSurfaces = svgSurfaces;
    }
  } else if (id === "cervical-restoration") {
    patch.fillingMaterial = "composite";
    if (svgSurfaces.length > 0) {
      const materialsMap: Record<string, string> = {};
      for (const s of svgSurfaces) {
        materialsMap[s] = "composite";
      }
      patch.fillingSurfaceMaterials = materialsMap;
      patch.fillingSurfaces = svgSurfaces;
    }
  } else if (id === "cosmetic-bonding") {
    patch.fillingMaterial = "composite";
    if (svgSurfaces.length > 0) {
      const materialsMap: Record<string, string> = {};
      for (const s of svgSurfaces) {
        materialsMap[s] = "composite";
      }
      patch.fillingSurfaceMaterials = materialsMap;
      patch.fillingSurfaces = svgSurfaces;
    }
  } else if (id === "pedo-filling") {
    patch.fillingMaterial = "composite";
    if (svgSurfaces.length > 0) {
      const materialsMap: Record<string, string> = {};
      for (const s of svgSurfaces) {
        materialsMap[s] = "composite";
      }
      patch.fillingSurfaceMaterials = materialsMap;
      patch.fillingSurfaces = svgSurfaces;
    }
  } else if (id === "inlay") {
    patch.restorationType = "inlay";
    patch.restorationMaterial = material || "emax";
  } else if (id === "onlay" || id === "overlay") {
    patch.restorationType = "onlay";
    patch.restorationMaterial = material || "emax";
  } else if (id === "post-core") {
    patch.endo = "endo-glass-pin";
  }

  // ═══ روکش ═══
  else if (id === "crown") {
    patch.restorationType = "crown";
    patch.restorationMaterial = material || "zircon";
    patch.toothSubstrate = "crownprep";
  } else if (id === "temporary-crown") {
    patch.restorationType = "crown";
    patch.restorationMaterial = "temporary";
    patch.toothSubstrate = "crownprep";
  } else if (id === "implant-supported-prosthesis") {
    patch.toothSelection = "implant";
    patch.restorationType = "crown";
    patch.restorationMaterial = material || "zircon";
  }

  // ═══ ونیر ═══
  else if (id === "laminate-veneer" || id === "ceramic-laminate") {
    patch.restorationType = "veneer";
    patch.restorationMaterial = material || "emax";
  } else if (id === "composite-veneer-prosthetic" || id === "composite-veneer-cosmetic") {
    patch.restorationType = "veneer";
    patch.restorationMaterial = "gradia";
  }

  // ═══ اندو ═══
  else if (id.startsWith("endo-") || id === "pulpectomy") {
    if (id === "endo-retreatment") patch.endo = "endo-filling";
    else if (id === "pulpotomy") patch.endo = "endo-medical-filling";
    else patch.endo = "endo-filling";
    patch.pulpDx = "normal";
  } else if (id === "apicoectomy") {
    patch.endoResection = true;
    patch.endo = "endo-filling";
  } else if (id === "abscess-drainage-endo") {
    patch.apicalDx = "acute-apical-abscess";
  } else if (id === "endo-apexification") {
    patch.endo = "endo-filling";
  }

  // ═══ جراحی ═══
  else if (id.startsWith("extraction-")) {
    patch.toothSelection = "none";
    patch.extractionWound = true;
  } else if (id === "implant") {
    patch.toothSelection = "implant";
  }

  // ═══ پروتز ═══
  else if (id === "bridge") {
    patch.restorationType = "bridge";
    patch.restorationMaterial = material || "zircon";
  } else if (id === "denture-full" || id === "denture-upper" ||
             id === "denture-lower" || id === "denture-immediate") {
    patch.prosthesis = "removable-full";
    patch.toothSelection = "none";
  } else if (id === "denture-partial") {
    patch.prosthesis = "removable-partial";
    patch.toothSelection = "none";
  } else if (id === "overdenture") {
    patch.prosthesis = "bar-denture";
    patch.toothSelection = "implant";
  }

  // ═══ ارتودنسی ═══
  else if (id === "ortho-fixed-metal" || id === "ortho-fixed-ceramic" ||
           id === "ortho-fixed-clear" || id === "ortho-lingual" ||
           id === "ortho-bracket-bonding" || id === "ortho-rebonding" ||
           id === "invisalign") {
    patch.orthoAppliance = "bracket";
  } else if (id === "ortho-fixed-retainer" || id === "ortho-removable" ||
             id === "ortho-removable-retainer") {
    patch.orthoAppliance = "band";
  } else if (id === "expander" || id === "headgear" || id === "facemask") {
    patch.orthoVertical = "extrusion";
  } else if (id === "ortho-elastics") {
    patch.orthoRotation = true;
  }

  // ═══ پریو ═══
  else if (id === "deep-scaling" || id === "root-planing" ||
           id === "curettage" || id === "flap-surgery" ||
           id === "periodontitis-treatment" || id === "laser-gum-therapy") {
    patch.calculus = true;
    patch.mods = { toggle: "parodontal", on: true };
  } else if (id === "gingival-graft" || id === "keratinized-gum-graft" ||
             id === "gingivectomy" || id === "gum-contouring" ||
             id === "gum-aesthetics") {
    patch.mods = { toggle: "parodontal", on: true };
  }

  // ═══ زیبایی ═══
  else if (id === "bleaching-office" || id === "bleaching-home" ||
           id === "bleaching-internal" || id === "temporary-whitening") {
    patch.discoloration = "other";
  }

  // ═══ کودکان ═══
  else if (id === "pedo-pulpotomy") {
    patch.endo = "endo-medical-filling";
  } else if (id === "pedo-extraction") {
    patch.toothSelection = "none";
    patch.extractionWound = true;
  } else if (id === "pedo-ssc") {
    patch.restorationType = "crown";
    patch.restorationMaterial = "metal";
  } else if (id === "pedo-zirconia-crown") {
    patch.restorationType = "crown";
    patch.restorationMaterial = "zircon";
  } else if (id === "space-maintainer") {
    patch.orthoAppliance = "band";
  } else if (id === "sealant-pedo" || id === "sealant-prevention") {
    patch.fissureSealing = true;
  }

  // ═══ اورژانس ═══
  else if (id === "emergency-abscess" || id === "abscess-drainage-surgery") {
    patch.apicalDx = "acute-apical-abscess";
  } else if (id === "emergency-fracture") {
    patch.brokenIncisal = true;
  } else if (id === "emergency-bleeding") {
    patch.mods = { toggle: "parodontal", on: true };
  }

  // ═══ خدمات جانبی / پیشگیری ═══
  else if (id === "plaque-control" || id === "scaling-polishing" ||
           id === "simple-brushing") {
    patch.calculus = true;
  } else if (id === "fissure-sealing") {
    patch.fissureSealing = true;
  }
// ⭐ سرویس‌های با SVG سفارشی
const CUSTOM_SVG_TREATMENTS = [
  "sinus-lift",
  "bone-graft",
  // هر سرویس دیگری که SVG سفارشی دارد
];

if (CUSTOM_SVG_TREATMENTS.includes(id)) {
  patch.customStates = {
    ...(patch.customStates as Record<string, unknown> ?? {}),
    activeTreatments: [id],
  };
}
  return Object.keys(patch).length > 0 ? patch : null;
}

// ═══════════════════════════════════════════════
// treatmentRecordToPatch — برای derive
// ═══════════════════════════════════════════════
function treatmentRecordToPatch(rec: TreatmentRecord): StatePatch | null {
  const fakeItem: TreatmentItem = {
    id: rec.treatmentId,
    label: rec.treatmentLabel,
    category: rec.category as any,
    icon: "",
  };
  return treatmentToPatchPreview(fakeItem, {
    surfaces: rec.surfaces,
    material: rec.material,
  });
}

// ═══════════════════════════════════════════════
// diagnosisToPatch
// ═══════════════════════════════════════════════
function diagnosisToPatch(rec: DiagnosisRecord): StatePatch | null {
  const patch: StatePatch = {};

  if (rec.planId) {
    if (rec.planId === "crown-needed") patch.crownNeeded = true;
    else if (rec.planId === "crown-replace") patch.crownReplace = true;
    else if (rec.planId === "extraction-plan") patch.extractionPlan = true;
    else if (rec.planId === "missing-closed") patch.missingClosed = true;
  }

  if (rec.clinicalDx && rec.dxValue) {
    if (rec.clinicalDx === "pulpDx") patch.pulpDx = rec.dxValue;
    else if (rec.clinicalDx === "apicalDx") patch.apicalDx = rec.dxValue;
    else if (rec.clinicalDx === "mobility") patch.mobility = rec.dxValue;
    else if (rec.clinicalDx === "periapicalType") patch.periapicalType = rec.dxValue;
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

// ═══════════════════════════════════════════════
// getRecordLabel
// ═══════════════════════════════════════════════
export function getRecordLabel(rec: OdontogramRecord): string {
  if (rec.kind === "treatment") {
    return rec.treatmentLabel;
  }
  if (rec.kind === "diagnosis") {
    return rec.planLabel ?? rec.clinicalDx ?? "تشخیص";
  }
  if (rec.kind === "status") {
    const group = STATUS_GROUPS.find((g) => g.id === rec.groupId);
    const item = group?.items.find((i) => i.id === rec.itemId);
    const radio = group?.radios?.find((r) => r.field === rec.itemId);
    return item?.label ?? radio?.label ?? rec.itemId;
  }
  return "—";
}