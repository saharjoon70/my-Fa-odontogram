// src/treatment/statusGroups.ts
// ۱۲ گروه وضعیت دندان + مپینگ به engine

import type { ToothStateField } from "./statusToState";

export type StatusGroup =
  | "presence"
  | "crown"
  | "caries"
  | "filling"
  | "pulp"
  | "apical"
  | "perio"
  | "wear"
  | "color"
  | "alignment"
  | "appliance"
  | "other";

export type StatusKind = "checkbox" | "radio";

export interface StatusRadioOption {
  value: string;
  label: string;
}

// src/treatment/statusGroups.ts

// src/treatment/statusGroups.ts

export interface StatusItem {
  id: string;
  label: string;
  field?: ToothStateField;
  /** مقدار — برای checkbox معمولاً true، برای enum رشته، برای compound object */
  value?: unknown;  // ← boolean | string → unknown
  clearOnUncheck?: boolean;
}
export interface StatusRadio {
  /** فیلد engine */
  field: ToothStateField;
  label: string;
  options: StatusRadioOption[];
}

export interface StatusGroupMeta {
  id: StatusGroup;
  label: string;
  icon: string;
  items: StatusItem[];
  radios?: StatusRadio[];
}

export const STATUS_GROUPS: StatusGroupMeta[] = [
  // ─────────────────────────────────────────────
  // ۱. حضور
  // ─────────────────────────────────────────────
  {
    id: "presence",
    label: "حضور",
    icon: "🦷",
    items: [
      { id: "missing",    label: "غایب",           field: "toothSelection", value: "none" },
      { id: "congenital", label: "مادرزادی غایب",  field: "customStates.congenitalMissing", value: true },
      { id: "impacted",   label: "نهفته",          field: "toothSelection", value: "tooth-under-gum" },
      { id: "partial",    label: "نیمه‌رویش",       field: "customStates.partiallyErupted", value: true },
      { id: "primary",    label: "دندان شیری",     field: "toothSelection", value: "milktooth" },
      { id: "implant",    label: "ایمپلنت دارد",    field: "toothSelection", value: "implant" },
    ],
  },

  // ─────────────────────────────────────────────
  // ۲. تاج
  // ─────────────────────────────────────────────
  {
    id: "crown",
    label: "تاج",
    icon: "👑",
    items: [
      { id: "brokenMesial",  label: "شکستگی مزیال",   field: "brokenMesial" },
      { id: "brokenIncisal", label: "شکستگی اینسیزال", field: "brokenIncisal" },
      { id: "brokenDistal",  label: "شکستگی دیستال",   field: "brokenDistal" },
      { id: "cracked",       label: "ترک تاج",         field: "customStates.cracked", value: true },
      { id: "leakage",       label: "نشت تاج",         field: "crownLeakage" },
      { id: "worn",          label: "تاج فرسوده",      field: "wearEdge", value: "attrition" },
      { id: "needsReplace",  label: "نیاز به تعویض",   field: "crownReplace" },
    ],
  },

  // ─────────────────────────────────────────────
  // ۳. پوسیدگی
  // ─────────────────────────────────────────────
  {
    id: "caries",
    label: "پوسیدگی",
    icon: "🦠",
    items: [
      { id: "cariesOcclusal", label: "اکلوزال",   field: "caries", value: "caries-occlusal" },
      { id: "cariesMesial",   label: "مزیال",     field: "caries", value: "caries-mesial" },
      { id: "cariesDistal",   label: "دیستال",    field: "caries", value: "caries-distal" },
      { id: "cariesBuccal",   label: "بوکال",     field: "caries", value: "caries-buccal" },
      { id: "cariesLingual",  label: "لینگوال",   field: "caries", value: "caries-lingual" },
      { id: "rootCaries",     label: "ریشه",      field: "rootCaries", value: "active" },
      { id: "secondary",      label: "ثانویه",    field: "customStates.secondaryCaries", value: true },
    ],
    radios: [
      {
        field: "cariesSeverityUI",
        label: "شدت",
        options: [
          { value: "mild",     label: "سطحی" },
          { value: "moderate", label: "متوسط" },
          { value: "severe",   label: "عمیق" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // ۴. پرکردگی
  // ─────────────────────────────────────────────
  {
    id: "filling",
    label: "پرکردگی",
    icon: "🔧",
    items: [
      { id: "fillComposite", label: "کامپوزیت",  field: "fillingSurfaceMaterials", value: { material: "composite" } },
      { id: "fillAmalgam",   label: "آمالگام",    field: "fillingSurfaceMaterials", value: { material: "amalgam" } },
      { id: "fillGic",       label: "GIC",        field: "fillingSurfaceMaterials", value: { material: "gic" } },
      { id: "inlay",         label: "اینلی",      field: "restorationType", value: "inlay" },
      { id: "onlay",         label: "آنلی",       field: "restorationType", value: "onlay" },
      { id: "fillBroken",    label: "شکسته",      field: "fillingDefect", value: { defect: "fracture" } },
      { id: "fillDefect",    label: "لب‌پریده",    field: "fillingDefect", value: { defect: "marginal" } },
    ],
  },

  // ─────────────────────────────────────────────
  // ۵. پالپ (فقط radio)
  // ─────────────────────────────────────────────
  {
    id: "pulp",
    label: "پالپ",
    icon: "🩺",
    items: [],
    radios: [
      {
        field: "pulpDx",
        label: "وضعیت پالپ",
        options: [
          { value: "normal",               label: "نرمال" },
          { value: "reversible-pulpitis",  label: "پالپیت برگشت‌پذیر" },
          { value: "irreversible-pulpitis",label: "پالپیت برگشت‌ناپذیر" },
          { value: "necrosis",             label: "نکروز" },
          { value: "endo-filling",         label: "درمان‌شده (اندو)" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // ۶. آپیکال (فقط radio)
  // ─────────────────────────────────────────────
  {
    id: "apical",
    label: "آپیکال",
    icon: "🔬",
    items: [],
    radios: [
      {
        field: "apicalDx",
        label: "وضعیت آپیکال",
        options: [
          { value: "normal",                                label: "نرمال" },
          { value: "symptomatic-apical-periodontitis",      label: "پریودنتیت حاد" },
          { value: "asymptomatic-apical-periodontitis",     label: "پریودنتیت مزمن" },
          { value: "acute-apical-abscess",                  label: "آبسه حاد" },
          { value: "chronic-apical-abscess",                label: "آبسه مزمن" },
          { value: "condensing-osteitis",                   label: "استئیت کندانس" },
        ],
      },
      {
        field: "periapicalType",
        label: "نوع ضایعه",
        options: [
          { value: "none",     label: "—" },
          { value: "cyst",     label: "کیست" },
          { value: "granuloma",label: "گرانولوم" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // ۷. لثه
  // ─────────────────────────────────────────────
  {
    id: "perio",
    label: "لثه",
    icon: "🩸",
    items: [
      { id: "calculus",    label: "جرم‌گرفتگی",     field: "calculus" },
      { id: "plaque",      label: "پلاک",          field: "customStates.plaque", value: true },
      { id: "bop",         label: "خونریزی",        field: "customStates.bleedingOnProbing", value: true },
      { id: "gingivitis",  label: "التهاب لثه",     field: "mods", value: "parodontal" },
      { id: "recession",   label: "تحلیل لثه",      field: "customStates.gingivalRecession", value: true },
      { id: "pocket",      label: "جیب پریو",       field: "customStates.periodontalPocket", value: true },
      { id: "suppuration", label: "چرک",           field: "customStates.suppuration", value: true },
      { id: "paleGum",     label: "لثه رنگ‌پریده",  field: "customStates.paleGum", value: true },
    ],
    radios: [
      {
        field: "mobility",
        label: "تحرک",
        options: [
          { value: "none", label: "۰" },
          { value: "m1",   label: "۱" },
          { value: "m2",   label: "۲" },
          { value: "m3",   label: "۳" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // ۸. سایش
  // ─────────────────────────────────────────────
  {
    id: "wear",
    label: "سایش",
    icon: "⚙️",
    items: [
      { id: "wearEdge",     label: "سایش لبه",     field: "wearEdge", value: "attrition" },
      { id: "wearCervical", label: "سایش گردنی",   field: "wearCervical", value: "abrasion" },
      { id: "wearOcclusal", label: "سایش اکلوزال", field: "wearEdge", value: "erosion" },
      { id: "bruxism",      label: "براکسیزم",     field: "customStates.bruxism", value: true },
    ],
  },

  // ─────────────────────────────────────────────
  // ۹. رنگ
  // ─────────────────────────────────────────────
  {
    id: "color",
    label: "رنگ",
    icon: "🎨",
    items: [
      { id: "extrinsic",     label: "خارجی",        field: "discoloration", value: "extrinsic" },
      { id: "intrinsic",     label: "داخلی",        field: "discoloration", value: "other" },
      { id: "fluorosis",     label: "فلوروزیس",     field: "discoloration", value: "fluorosis" },
      { id: "trauma",        label: "ناشی از ضربه", field: "discoloration", value: "nonvital" },
      { id: "necroticColor", label: "نکروز پالپ",   field: "discoloration", value: "nonvital" },
    ],
  },

  // ─────────────────────────────────────────────
  // ۱۰. نظم
  // ─────────────────────────────────────────────
  {
    id: "alignment",
    label: "نظم",
    icon: "📐",
    items: [
      { id: "rotation",    label: "چرخش",          field: "orthoRotation", value: true },
      { id: "driftMesial", label: "جابجایی مزیال", field: "orthoDrift", value: "mesial" },
      { id: "driftDistal", label: "جابجایی دیستال",field: "orthoDrift", value: "distal" },
      { id: "extrusion",   label: "اکستروژن",      field: "orthoVertical", value: "extrusion" },
      { id: "intrusion",   label: "اینتروژن",      field: "orthoVertical", value: "intrusion" },
      { id: "crowding",    label: "فشردگی",        field: "customStates.crowding", value: true },
      { id: "diastema",    label: "فاصله",         field: "customStates.diastema", value: true },
      { id: "crossbite",   label: "کراس‌بایت",      field: "customStates.crossbite", value: true },
    ],
  },

  // ─────────────────────────────────────────────
  // ۱۱. اپلاینس
  // ─────────────────────────────────────────────
  {
    id: "appliance",
    label: "اپلاینس",
    icon: "🦿",
    items: [
      { id: "bracket",           label: "براکت دارد",         field: "orthoAppliance", value: "bracket" },
      { id: "fixedRetainer",     label: "ریتینر ثابت",       field: "orthoAppliance", value: "band" },
      { id: "removableRetainer", label: "ریتینر متحرک",      field: "customStates.removableRetainer", value: true },
      { id: "spaceMaintainer",   label: "نگهدارنده فضا",     field: "customStates.spaceMaintainer", value: true },
      { id: "crown",             label: "روکش دارد",          field: "restorationType", value: "crown" },
      { id: "bridge",            label: "بریج دارد",         field: "restorationType", value: "bridge" },
      { id: "veneer",            label: "ونیر دارد",          field: "restorationType", value: "veneer" },
      { id: "partialDenture",    label: "پروتز پارسیل",      field: "prosthesis", value: "removable-partial" },
      { id: "fullDenture",       label: "پروتز کامل",        field: "prosthesis", value: "removable-full" },
    ],
  },

  // ─────────────────────────────────────────────
  // ۱۲. سایر
  // ─────────────────────────────────────────────
  {
    id: "other",
    label: "سایر",
    icon: "📋",
    items: [
      { id: "sensitive",     label: "حساسیت",          field: "customStates.sensitivity", value: true },
      { id: "pain",          label: "درد",             field: "customStates.pain", value: true },
      { id: "swelling",      label: "تورم",           field: "customStates.swelling", value: true },
      { id: "fistula",       label: "فیستول",          field: "customStates.fistula", value: true },
      { id: "traumaTooth",   label: "ضربه‌دیده",        field: "customStates.trauma", value: true },
      { id: "bleedingBrush", label: "خونریزی مسواک",   field: "customStates.bleedingOnBrushing", value: true },
    ],
  },
];

export function getStatusGroup(id: StatusGroup): StatusGroupMeta | undefined {
  return STATUS_GROUPS.find((g) => g.id === id);
}