// src/treatment/statusGroups.ts

import type { ToothStateField } from "./statusToState";

// ═══════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════
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

export interface StatusItem {
  id: string;
  label: string;
  field?: ToothStateField;
  value?: unknown;
  clearOnUncheck?: boolean;
  appliesWhen?: (state: Record<string, unknown>) => boolean;
}


export interface StatusRadio {
  field: ToothStateField;
  label: string;
  options: StatusRadioOption[];
  /** ⭐ چه زمانی این رادیو معنی دارد؟ */
  appliesWhen?: (state: Record<string, unknown>) => boolean;
}
export interface StatusSelect {
  field: ToothStateField;
  label: string;
  options: StatusRadioOption[];
  appliesWhen?: (state: Record<string, unknown>) => boolean;
}

export interface StatusGroupMeta {
  id: StatusGroup;
  label: string;
  icon: string;
  items: StatusItem[];
  radios?: StatusRadio[];
  selects?: StatusSelect[];
  appliesWhen?: (state: Record<string, unknown>) => boolean;
  surfaceCross?: boolean;
}
// ═══════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════
function isToothBase(s: Record<string, unknown>): boolean {
  return s.toothSelection === "tooth-base";
}
// function isMilktooth(s: Record<string, unknown>): boolean {
//   return s.toothSelection === "milktooth";
// }
function isImplant(s: Record<string, unknown>): boolean {
  return s.toothSelection === "implant";
}
function isNone(s: Record<string, unknown>): boolean {
  return s.toothSelection === "none";
}
function isUnderGum(s: Record<string, unknown>): boolean {
  return s.toothSelection === "tooth-under-gum";
}
function isPresent(s: Record<string, unknown>): boolean {
  return !isNone(s) && !isImplant(s) && !isUnderGum(s);
}
function isNatural(s: Record<string, unknown>): boolean {
  return s.toothSubstrate === "natural" || s.toothSubstrate === undefined;
}
function isRadix(s: Record<string, unknown>): boolean {
  return s.toothSubstrate === "radix";
}
function isBroken(s: Record<string, unknown>): boolean {
  return s.toothSubstrate === "broken";
}
function isCrownprep(s: Record<string, unknown>): boolean {
  return s.toothSubstrate === "crownprep";
}
function hasRestoration(s: Record<string, unknown>): boolean {
  return s.restorationType !== "none" && s.restorationType !== undefined;
}
function hasNoRestoration(s: Record<string, unknown>): boolean {
  return !hasRestoration(s);
}

// ═══════════════════════════════════════════════
// STATUS_GROUPS
// ═══════════════════════════════════════════════
export const STATUS_GROUPS: StatusGroupMeta[] = [
  // ═══════════════════════════════════════════════
  // ۱. حضور (وضعیت دندان) — همیشه نمایش
  // ═══════════════════════════════════════════════
  {
    id: "presence",
    label: "وضعیت دندان",
    icon: "🦷",
    items: [],
    radios: [
      {
        field: "toothSelection",
        label: "نوع دندان",
        options: [
          { value: "tooth-base",      label: "دندان دائمی" },
          { value: "milktooth",       label: "دندان شیری" },
          { value: "implant",         label: "ایمپلنت" },
          { value: "tooth-under-gum", label: "نهفته (زیر لثه)" },
          { value: "none",            label: "از دست رفته" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // ۲. تاج
  // ═══════════════════════════════════════════════
{
  id: "crown",
  label: "تاج",
  icon: "👑",
  appliesWhen: isPresent,
  items: [
    { id: "brokenMesial",  label: "شکستگی مزیال",   field: "brokenMesial",  appliesWhen: (s) => isNatural(s) || isBroken(s) },
    { id: "brokenIncisal", label: "شکستگی اینسیزال", field: "brokenIncisal", appliesWhen: (s) => isNatural(s) || isBroken(s) },
    { id: "brokenDistal",  label: "شکستگی دیستال",   field: "brokenDistal",  appliesWhen: (s) => isNatural(s) || isBroken(s) },
    { id: "cracked",       label: "ترک تاج",         field: "customStates.cracked", value: true, appliesWhen: isNatural },
    { id: "leakage",       label: "نشت تاج",         field: "crownLeakage", appliesWhen: hasRestoration },
    { id: "contactMesial", label: "فقدان تماس مزیال",  field: "contactMesial", appliesWhen: (s) => isNatural(s) || isCrownprep(s) },
    { id: "contactDistal", label: "فقدان تماس دیستال", field: "contactDistal", appliesWhen: (s) => isNatural(s) || isCrownprep(s) },
    { id: "fractureVertical",   label: "شکستگی عمودی", field: "customStates.fractureVertical",   value: true, appliesWhen: isPresent },
    { id: "fractureHorizontal", label: "شکستگی افقی",  field: "customStates.fractureHorizontal", value: true, appliesWhen: isPresent },
    { id: "crownNeeded",    label: "نیاز به روکش",         field: "crownNeeded", appliesWhen: (s) => isNatural(s) || isBroken(s) },
    { id: "needsReplace",   label: "نیاز به تعویض روکش",    field: "crownReplace", appliesWhen: hasRestoration },
    { id: "extractionPlan", label: "کشیدن برنامه‌ریزی شده", field: "extractionPlan", appliesWhen: isPresent },
    { id: "missingClosed",  label: "بسته‌شدن فاصله",        field: "missingClosed", appliesWhen: isPresent },
  ],
  radios: [
    {
      field: "toothSubstrate",
      label: "ساختار دندان",
      appliesWhen: isToothBase,
      options: [
        { value: "natural",   label: "سالم" },
        { value: "radix",     label: "ریشه باقی‌مانده" },
        { value: "broken",    label: "شکسته" },
        { value: "crownprep", label: "آماده روکش" },
      ],
    },
  ],
  selects: [
    // ⭐ ترمیم — اینجا
    {
      field: "restorationType",
      label: "ترمیم",
      appliesWhen: (s) => (isToothBase(s) || isCrownprep(s)) && (isNatural(s) || isBroken(s) || isRadix(s)),
      options: [
        { value: "none",    label: "—" },
        { value: "crown",   label: "روکش" },
        { value: "inlay",   label: "اینله" },
        { value: "onlay",   label: "آنله" },
        { value: "veneer",  label: "ونیر" },
        { value: "bridge",  label: "بریج" },
      ],
    },
    // ⭐ جنس ترمیم — فقط وقتی ترمیم انتخاب شده
    {
      field: "restorationMaterial",
      label: "جنس ترمیم",
      appliesWhen: (s) => s.restorationType !== "none" && s.restorationType !== undefined,
      options: [
        { value: "none",          label: "—" },
        { value: "zircon",        label: "زیرکونیا" },
        { value: "emax",          label: "e.max" },
        { value: "gold",          label: "طلا" },
        { value: "gradia",        label: "گرادیا" },
        { value: "metal",         label: "فلز" },
        { value: "metal-ceramic", label: "PFM (فلز-سرامیک)" },
        { value: "telescope",     label: "تلسکوپی" },
        { value: "temporary",     label: "موقت" },
      ],
    },
  ],
},

  // ═══════════════════════════════════════════════
  // ۳. پوسیدگی
  // ═══════════════════════════════════════════════
  {
    id: "caries",
    label: "پوسیدگی",
    icon: "🦠",
    appliesWhen: (s) => isPresent(s) && !isImplant(s) && hasNoRestoration(s),
    items: [
      { id: "cariesOcclusal", label: "اکلوزال",  field: "caries", value: "caries-occlusal" },
      { id: "cariesMesial",   label: "مزیال",    field: "caries", value: "caries-mesial" },
      { id: "cariesDistal",   label: "دیستال",   field: "caries", value: "caries-distal" },
      { id: "cariesBuccal",   label: "بوکال",    field: "caries", value: "caries-buccal" },
      { id: "cariesLingual",  label: "لینگوال",  field: "caries", value: "caries-lingual" },
      { id: "rootCaries",     label: "ریشه",     field: "rootCaries", value: "active" },
      { id: "secondary",      label: "ثانویه",   field: "customStates.secondaryCaries", value: true },
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

  // ═══════════════════════════════════════════════
  // ۴. پرکردگی
  // ═══════════════════════════════════════════════
{
  id: "filling",
  label: "پرکردگی",
  icon: "🔧",
  
  appliesWhen: (s) => isPresent(s) && !isImplant(s),
    surfaceCross: true,    // ⭐ جدید
  items: [
    { id: "fillBroken", label: "شکسته",    field: "fillingDefect", value: { defect: "fracture" } },
    { id: "fillDefect", label: "لب‌پریده",  field: "fillingDefect", value: { defect: "marginal" } },
    { id: "fissureSealing", label: "فیشور سیلانت", field: "fissureSealing" },
  ],
  radios: [
    {
      field: "fillingMaterial",
      label: "جنس پرکردگی",
      options: [
        { value: "none",      label: "—" },
        { value: "composite", label: "کامپوزیت" },
        { value: "amalgam",   label: "آمالگام" },
        { value: "gic",       label: "GIC" },
        { value: "temporary", label: "موقت" },
      ],
    },
  ],
},

  // ═══════════════════════════════════════════════
  // ۵. پالپ
  // ═══════════════════════════════════════════════
{
  id: "pulp",
  label: "پالپ",
  icon: "🩺",
  appliesWhen: (s) => isPresent(s) && !isImplant(s),
  items: [
    { id: "parapulpalPin", label: "پین پاراپالپال", field: "parapulpalPin" },
  ],
  radios: [
    {
      field: "pulpDx",
      label: "وضعیت پالپ",
      options: [
        { value: "normal",                label: "نرمال" },
        { value: "reversible-pulpitis",   label: "پالپیت برگشت‌پذیر" },
        { value: "irreversible-pulpitis", label: "پالپیت برگشت‌ناپذیر" },
        { value: "necrosis",              label: "نکروز" },
      ],
    },
    {
      field: "endo",
      label: "اندو",
      appliesWhen: (s) => isPresent(s) && !isImplant(s),
      options: [
        { value: "none",                  label: "—" },
        { value: "endo-medical-filling",  label: "پرکردگی دارویی" },
        { value: "endo-filling",          label: "پرکردگی کامل" },
        { value: "endo-filling-incomplete", label: "پرکردگی ناقص" },
        { value: "endo-glass-pin",        label: "پین شیشه‌ای" },
        { value: "endo-metal-pin",        label: "پین فلزی" },
      ],
    },
  ],
},

  // ═══════════════════════════════════════════════
  // ۶. آپیکال
  // ═══════════════════════════════════════════════
{
  id: "apical",
  label: "آپیکال",
  icon: "🔬",
  appliesWhen: (s) => isPresent(s) && !isImplant(s),
  items: [
    { id: "endoResection", label: "رزکسیون", field: "endoResection" },
  ],
  radios: [
    {
      field: "apicalDx",
      label: "وضعیت آپیکال",
      options: [
        { value: "normal",                            label: "نرمال" },
        { value: "symptomatic-apical-periodontitis",  label: "پریودنتیت حاد" },
        { value: "asymptomatic-apical-periodontitis", label: "پریودنتیت مزمن" },
        { value: "acute-apical-abscess",              label: "آبسه حاد" },
        { value: "chronic-apical-abscess",            label: "آبسه مزمن" },
        { value: "condensing-osteitis",               label: "استئیت کندانس" },
      ],
    },
    {
      field: "periapicalType",
      label: "نوع ضایعه",
      options: [
        { value: "none",      label: "—" },
        { value: "cyst",      label: "کیست" },
        { value: "granuloma", label: "گرانولوم" },
      ],
    },
    {
      field: "resorptionType",
      label: "جذب ریشه",
      options: [
        { value: "none",              label: "—" },
        { value: "internal",          label: "داخلی" },
        { value: "external-cervical", label: "خارجی گردنی" },
      ],
    },
  ],
},

  // ═══════════════════════════════════════════════
  // ۷. لثه
  // ═══════════════════════════════════════════════
{
  id: "perio",
  label: "لثه",
  icon: "🩸",
  appliesWhen: isPresent,
  items: [
    { id: "calculus",    label: "جرم‌گرفتگی",     field: "calculus" },
    { id: "plaque",      label: "پلاک",           field: "customStates.plaque", value: true },
    { id: "bop",         label: "خونریزی",         field: "customStates.bleedingOnProbing", value: true },
    { id: "gingivitis",  label: "التهاب لثه",      field: "mods", value: "parodontal" },
    { id: "recession",   label: "تحلیل لثه",       field: "customStates.gingivalRecession", value: true },
    { id: "pocket",      label: "جیب پریو",        field: "customStates.periodontalPocket", value: true },
    { id: "suppuration", label: "چرک",            field: "customStates.suppuration", value: true },
    { id: "paleGum",     label: "لثه رنگ‌پریده",   field: "customStates.paleGum", value: true },
  ],
  radios: [
    {
      field: "mobility",
      label: "تحرک",
      appliesWhen: (s) => isPresent(s) && !isImplant(s),
      options: [
        { value: "none", label: "۰" },
        { value: "m1",   label: "۱" },
        { value: "m2",   label: "۲" },
        { value: "m3",   label: "۳" },
      ],
    },
    {
      field: "periImplant",
      label: "وضعیت ایمپلنت",
      appliesWhen: isImplant,
      options: [
        { value: "none",                       label: "—" },
        { value: "mucositis",                  label: "موکوزیت" },
        { value: "peri-implantitis-mild",      label: "پری‌ایمپلنتیت خفیف" },
        { value: "peri-implantitis-moderate",  label: "پری‌ایمپلنتیت متوسط" },
        { value: "peri-implantitis-severe",    label: "پری‌ایمپلنتیت شدید" },
      ],
    },
  ],
},

  // ═══════════════════════════════════════════════
  // ۸. سایش
  // ═══════════════════════════════════════════════
{
  id: "wear",
  label: "سایش",
  icon: "⚙️",
  appliesWhen: (s) => isToothBase(s) && isNatural(s) && hasNoRestoration(s),
  items: [
    { id: "bruxism", label: "براکسیزم", field: "customStates.bruxism", value: true },
  ],
  selects: [
    {
      field: "wearEdge",
      label: "سایش لبه‌ای",
      options: [
        { value: "none",      label: "هیچ" },
        { value: "attrition", label: "سایش دندانی (اتریشن)" },
        { value: "erosion",   label: "فرسایش شیمیایی (اروژن)" },
      ],
    },
    {
      field: "wearCervical",
      label: "سایش گردنی",
      options: [
        { value: "none",       label: "هیچ" },
        { value: "abrasion",   label: "سایش مکانیکی (ابریژن)" },
        { value: "abfraction", label: "آبفراکشن" },
        { value: "erosion",    label: "فرسایش شیمیایی (اروژن)" },
      ],
    },
  ],
},

  // ═══════════════════════════════════════════════
  // ۹. رنگ
  // ═══════════════════════════════════════════════
{
  id: "color",
  label: "رنگ",
  icon: "🎨",
  appliesWhen: (s) => isToothBase(s) && isNatural(s) && hasNoRestoration(s),
  items: [],
  selects: [
    {
      field: "discoloration",
      label: "تغییر رنگ",
      options: [
        { value: "none",         label: "هیچ" },
        { value: "tetracycline", label: "لکه تتراسایکلین" },
        { value: "fluorosis",    label: "فلوروزیس" },
        { value: "nonvital",     label: "تیرگی دندان غیرزنده" },
        { value: "extrinsic",    label: "لکه بیرونی" },
        { value: "other",        label: "سایر / ناشناخته" },
      ],
    },
  ],
},
  // ═══════════════════════════════════════════════
  // ۱۰. نظم
  // ═══════════════════════════════════════════════
{
  id: "alignment",
  label: "نظم",
  icon: "📐",
  appliesWhen: isPresent,
  items: [
    { id: "rotation", label: "چرخش", field: "orthoRotation", value: true },
    { id: "crowding", label: "فشردگی", field: "customStates.crowding", value: true },
    { id: "diastema", label: "فاصله", field: "customStates.diastema", value: true },
    { id: "crossbite", label: "کراس‌بایت", field: "customStates.crossbite", value: true },
  ],
  selects: [
    {
      field: "orthoDrift",
      label: "جابجایی",
      options: [
        { value: "none",   label: "—" },
        { value: "mesial", label: "مزیال" },
        { value: "distal", label: "دیستال" },
      ],
    },
    {
      field: "orthoVertical",
      label: "حرکت عمودی",
      options: [
        { value: "none",      label: "—" },
        { value: "extrusion", label: "اکستروژن" },
        { value: "intrusion", label: "اینتروژن" },
      ],
    },
  ],
},
  // ═══════════════════════════════════════════════
  // ۱۱. اپلاینس
  // ═══════════════════════════════════════════════
{
  id: "appliance",
  label: "اپلاینس",
  icon: "🦿",
  appliesWhen: isPresent,
  items: [
    { id: "removableRetainer", label: "ریتینر متحرک", field: "customStates.removableRetainer", value: true },
    { id: "spaceMaintainer",   label: "نگهدارنده فضا", field: "customStates.spaceMaintainer", value: true },
    { id: "partialDenture",    label: "پروتز پارسیل", field: "prosthesis", value: "removable-partial" },
    { id: "fullDenture",       label: "پروتز کامل",   field: "prosthesis", value: "removable-full" },
  ],
  selects: [
    {
      field: "orthoAppliance",
      label: "اپلاینس",
      options: [
        { value: "none",    label: "—" },
        { value: "bracket", label: "براکت" },
        { value: "band",    label: "بند" },
      ],
    },
  ],
},

  // ═══════════════════════════════════════════════
  // ۱۲. سایر — همیشه نمایش
  // ═══════════════════════════════════════════════
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