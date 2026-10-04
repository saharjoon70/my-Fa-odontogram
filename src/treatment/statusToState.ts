// src/treatment/statusToState.ts
// لایه مپینگ: از وضعیت‌های UI به state engine
// این فایل قلب کار است — هر فیلد UI را به فیلد engine ترجمه می‌کند

import type { StatusItem, StatusRadio, StatusGroup } from "./statusGroups";
import { STATUS_GROUPS } from "./statusGroups";

/** فیلدهای state در odontogram.ts که UI به آن‌ها دسترسی دارد */
// src/treatment/statusToState.ts

export type ToothStateField =
  // فیلدهای موجود در engine
  | "toothSelection"
  | "toothSubstrate"
  | "restorationType"
  | "restorationMaterial"
  | "prosthesis"
  | "endo"
  | "endoResection"
  | "pulpDx"
  | "pulpLatin"
  | "apicalDx"
  | "periapicalType"
  | "resorptionType"
  | "periImplant"
  | "mobility"
  | "caries"
  | "cariesSeverity"
  | "cariesActiveDepth"
  | "rootCaries"
  | "radiographicDepth"
  | "fillingMaterial"
  | "fillingSurfaces"
  | "fillingSurfaceMaterials"
  | "fillingDefect"
  | "fissureSealing"
  | "calculus"
  | "contactMesial"
  | "contactDistal"
  | "wearEdge"
  | "wearCervical"
  | "discoloration"
  | "orthoAppliance"
  | "orthoDrift"
  | "orthoVertical"
  | "orthoRotation"
  | "brokenMesial"
  | "brokenIncisal"
  | "brokenDistal"
  | "crownLeakage"
  | "crownReplace"
  | "crownNeeded"
  | "extractionPlan"
  | "extractionWound"
  | "missingClosed"
  | "bridgePillar"
  | "parapulpalPin"
  | "mods"
  | "customStates"
  | "cariesSeverityUI"
  // ⬇️ این خط مشکل را حل می‌کند — اجازه می‌دهد هر رشته‌ای بپذیرد ولی auto-complete حفظ می‌شود
  | (string & {});

/** شکل patch که به setToothStateAndRender فرستاده می‌شود */
export type StatePatch = Record<string, unknown>;

/**
 * یک آیتم checkbox را به patch تبدیل می‌کند.
 *
 * @param item آیتم وضعیت
 * @param checked وضعیت جدید checkbox
 * @returns patch یا null اگر فیلد خاصی نداشت
 */
export function statusItemToPatch(
  item: StatusItem,
  checked: boolean,
): StatePatch | null {
  if (!item.field) return null;

  const field = item.field;
  const value = item.value;

  // ═══ فیلدهای ویژه ═══

  // caries (Set)
  if (field === "caries") {
    return { caries: { toggle: value as string, on: checked } };
  }

  // mods (Set)
  if (field === "mods") {
    return { mods: { toggle: value as string, on: checked } };
  }

  // customStates.*
  if (field.startsWith("customStates.")) {
    const key = field.replace("customStates.", "");
    return { customStates: { [key]: checked ? (value ?? true) : false } };
  }

  // fillingSurfaceMaterials (Map)
  if (field === "fillingSurfaceMaterials") {
    const obj = value as { material?: string } | undefined;
    const mat = obj?.material ?? "composite";
    if (checked) {
      return { fillingMaterial: mat };
    }
    return { fillingMaterial: "none" };
  }

  // fillingDefect (Map)
  if (field === "fillingDefect") {
    const obj = value as { defect?: string } | undefined;
    const defect = obj?.defect ?? "marginal";
    return { fillingDefectAll: defect, fillingDefectOn: checked };
  }

  // ═══ همه‌ی فیلدهای boolean ═══
  // (اگر value ندارند، یا value غیر از رشته/آبجکت است)
  if (!value || typeof value === "boolean") {
    return { [field]: checked };
  }

  // ═══ فیلدهای enum (با value) ═══
  if (typeof value === "string") {
    if (checked) {
      return { [field]: value };
    }
    // uncheck → none
    return { [field]: "none" };
  }

  // ═══ fallback: فقط boolean ═══
  return { [field]: checked };
}

/**
 * یک radio را به patch تبدیل می‌کند.
 */
export function statusRadioToPatch(
  radio: StatusRadio,
  value: string,
): StatePatch | null {
  const field = radio.field;

  // ═══ فیلدهای ویژه ═══

  // pulpDx + endo
  if (field === "pulpDx") {
    if (value.startsWith("endo-")) {
      return { endo: value, pulpDx: "normal", pulpLatin: "none" };
    }
    return { pulpDx: value, endo: "none" };
  }

  // cariesSeverityUI (سه‌سطحی → ICDAS)
  if (field === "cariesSeverityUI") {
    const icdasMap: Record<string, number> = {
      mild: 2,
      moderate: 4,
      severe: 6,
    };
    return { cariesSeverityUI: value, cariesSeverityAll: icdasMap[value] ?? 2 };
  }

  // ═══ همه‌ی فیلدهای enum دیگر ═══
  // این‌ها همه یک شکل هستند: { field: value }
  return { [field]: value };
}

/**
 * از روی مقادیر فعلی state، وضعیت checkbox یک آیتم را مشخص می‌کند.
 */
export function isItemChecked(
  item: StatusItem,
  state: Record<string, unknown>,
): boolean {
  if (!item.field) return false;

  const field = item.field;
  const value = item.value;

  // boolean
  if (isBooleanField(field)) {
    return !!state[field];
  }

  // toothSelection
  if (field === "toothSelection") {
    return state.toothSelection === value;
  }

  // enum
  if (isEnumField(field)) {
    return state[field] === value;
  }

  // caries (Set)
  if (field === "caries") {
    const set = state.caries as Set<string> | string[] | undefined;
    if (!set) return false;
    const arr = set instanceof Set ? Array.from(set) : set;
    return arr.includes(value as string);
  }

  // rootCaries
  if (field === "rootCaries") {
    return state.rootCaries === value;
  }

  // restorationType
  if (field === "restorationType") {
    return state.restorationType === value;
  }

  // fillingMaterial
  if (field === "fillingMaterial") {
    return state.fillingMaterial === value;
  }

  // customStates.*
  if (field.startsWith("customStates.")) {
    const key = field.replace("customStates.", "");
    const cs = state.customStates as Record<string, unknown> | undefined;
    return !!cs?.[key];
  }

  // mods
  if (field === "mods") {
    const set = state.mods as Set<string> | string[] | undefined;
    if (!set) return false;
    const arr = set instanceof Set ? Array.from(set) : set;
    return arr.includes(value as string);
  }

  return false;
}

/**
 * مقدار فعلی یک radio را برمی‌گرداند.
 */
export function getRadioValue(
  radio: StatusRadio,
  state: Record<string, unknown>,
): string {
  const field = radio.field;

  if (field === "pulpDx") {
    // اگر endo فعال است، آن را برگردان
    if (state.endo && state.endo !== "none") return state.endo as string;
    return (state.pulpDx as string) ?? "normal";
  }

  if (field === "cariesSeverityUI") {
    return (state.cariesSeverityUI as string) ?? "mild";
  }

  return (state[field] as string) ?? "";
}

// ─────────────────────────────────────────────
// helper: تشخیص نوع فیلد
// ─────────────────────────────────────────────

const BOOLEAN_FIELDS = new Set([
  "endoResection", "fissureSealing", "calculus",
  "contactMesial", "contactDistal",
  "brokenMesial", "brokenIncisal", "brokenDistal",
  "crownLeakage", "crownReplace", "crownNeeded",
  "extractionPlan", "extractionWound", "missingClosed",
  "bridgePillar", "parapulpalPin", "orthoRotation",
]);

const ENUM_FIELDS = new Set([
  "toothSubstrate", "prosthesis", "endo", "pulpDx", "pulpLatin",
  "apicalDx", "periapicalType", "resorptionType", "periImplant",
  "mobility", "rootCaries", "fillingMaterial",
  "wearEdge", "wearCervical", "discoloration",
  "orthoAppliance", "orthoDrift", "orthoVertical",
]);

function isBooleanField(field: string): boolean {
  return BOOLEAN_FIELDS.has(field);
}

function isEnumField(field: string): boolean {
  return ENUM_FIELDS.has(field);
}