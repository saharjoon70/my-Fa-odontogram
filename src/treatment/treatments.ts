// src/treatment/treatments.ts
// ۱۳۴ سرویس دندانپزشکی در ۱۴ دسته + سطوح و مواد

import type { Category } from "./categories";

// ═══════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════
export interface TreatmentItem {
  id: string;
  label: string;
  category: Category;
  icon: string;
  layers?: string[];
  needsSurface?: boolean;
  needsMaterial?: boolean;
  defaultPrice?: number;
}

// ═══════════════════════════════════════════════
// ۱۳۴ سرویس
// ═══════════════════════════════════════════════
export const TREATMENTS: TreatmentItem[] = [
  // ═══════════════════════════════════════════════
  // ۱. معاینه و تشخیص — Exam & Diagnosis
  // ═══════════════════════════════════════════════
  { id: "exam-initial",       label: "معاینه اولیه",              category: "exam", icon: "stethoscope",     defaultPrice: 200000 },
  { id: "exam-specialist",    label: "معاینه تخصصی",              category: "exam", icon: "stethoscope",     defaultPrice: 400000 },
  { id: "consultation",       label: "مشاوره",                    category: "exam", icon: "message-circle",  defaultPrice: 150000 },
  { id: "xray-periapical",    label: "رادیوگرافی پری‌اپیکال",     category: "exam", icon: "scan",            defaultPrice: 250000 },
  { id: "xray-panoramic",     label: "رادیوگرافی پانورامیک (OPG)",category: "exam", icon: "scan",            defaultPrice: 600000 },
  { id: "xray-cephalometric", label: "رادیوگرافی سفالومتری",      category: "exam", icon: "scan",            defaultPrice: 700000 },
  { id: "cbct",               label: "CBCT",                      category: "exam", icon: "scan-face",       defaultPrice: 1500000 },
  { id: "bitewing",           label: "بایت‌وینگ",                  category: "exam", icon: "scan",            defaultPrice: 300000 },
  { id: "pulp-test",          label: "تست پالپ (Vitality Test)",   category: "exam", icon: "thermometer",     defaultPrice: 150000 },
  { id: "diagnostic-cast",    label: "قالب‌گیری تشخیصی",           category: "exam", icon: "box",             defaultPrice: 400000 },

  // ═══════════════════════════════════════════════
  // ۲. پیشگیری — Prevention
  // ═══════════════════════════════════════════════
  { id: "scaling-polishing",      label: "جرم‌گیری و بروساژ",       category: "prevention", icon: "sparkles",     defaultPrice: 500000 },
  { id: "fluoride-therapy",       label: "فلورایدتراپی",            category: "prevention", icon: "shield",       defaultPrice: 300000 },
  { id: "sealant-prevention",     label: "فیشور سیلانت",            category: "prevention", icon: "shield-check", defaultPrice: 250000 },
  { id: "oral-hygiene-education", label: "آموزش بهداشت دهان",       category: "prevention", icon: "book-open",    defaultPrice: 100000 },
  { id: "simple-brushing",        label: "بروساژ ساده",             category: "prevention", icon: "brush",        defaultPrice: 200000 },

  // ═══════════════════════════════════════════════
  // ۳. ترمیمی — Restorative
  // ═══════════════════════════════════════════════
  { id: "filling-composite",    label: "پرکردن کامپوزیت",       category: "restorative", icon: "composite-filling",   needsSurface: true, defaultPrice: 800000 },
  { id: "filling-amalgam",      label: "پرکردن آمالگام",        category: "restorative", icon: "amalgam-filling",     needsSurface: true, defaultPrice: 600000 },
  { id: "filling-gic",          label: "پرکردن گلاس آینومر",    category: "restorative", icon: "composite-filling",   needsSurface: true, defaultPrice: 500000 },
  { id: "filling-class-1to5",   label: "ترمیم کلاس I-V",        category: "restorative", icon: "composite-filling",   needsSurface: true, defaultPrice: 900000 },
  { id: "inlay",                label: "اینله (Inlay)",          category: "restorative", icon: "composite-inlay",     needsMaterial: true, defaultPrice: 1800000 },
  { id: "onlay",                label: "آنله (Onlay)",           category: "restorative", icon: "composite-overlay",   needsMaterial: true, defaultPrice: 2000000 },
  { id: "overlay",              label: "اورلی (Overlay)",        category: "restorative", icon: "composite-overlay",   needsMaterial: true, defaultPrice: 2200000 },
  { id: "broken-crown-reconstruction", label: "بازسازی دندان شکسته", category: "restorative", icon: "large-composite-reconstruction", needsSurface: true, defaultPrice: 1200000 },
  { id: "cervical-restoration", label: "ترمیم لبه‌ای (Cervical)", category: "restorative", icon: "composite-filling",   needsSurface: true, defaultPrice: 700000 },
  { id: "post-core",            label: "پست و کور (Post & Core)",category: "restorative", icon: "fiber-post",          defaultPrice: 1500000 },

  // ═══════════════════════════════════════════════
  // ۴. ریشه و اندو — Endodontics
  // ═══════════════════════════════════════════════
  { id: "endo-single-root",     label: "درمان ریشه تک‌کاناله",     category: "endo", icon: "single-root-endodontics", defaultPrice: 1200000 },
  { id: "endo-two-root",        label: "درمان ریشه دوکاناله",      category: "endo", icon: "two-root-endodontics",    defaultPrice: 1600000 },
  { id: "endo-three-root",      label: "درمان ریشه سه‌کاناله",      category: "endo", icon: "molar-endodontics",       defaultPrice: 2000000 },
  { id: "endo-four-root",       label: "درمان ریشه چهارکاناله",    category: "endo", icon: "molar-endodontics",       defaultPrice: 2400000 },
  { id: "endo-retreatment",     label: "درمان ریشه مجدد",          category: "endo", icon: "endodontic-retreatment",  defaultPrice: 2500000 },
  { id: "pulpotomy",            label: "پالپوتومی",                category: "endo", icon: "emergency-pulp-chamber-opening", defaultPrice: 700000 },
  { id: "pulpectomy",           label: "پالپکتومی",                category: "endo", icon: "single-root-endodontics", defaultPrice: 1000000 },
  { id: "endo-apexification",   label: "اپکس‌فیکاسیون",             category: "endo", icon: "apexification",           defaultPrice: 1800000 },
  { id: "apicoectomy",          label: "اپیکوکتومی (جراحی ریشه)",  category: "endo", icon: "apicoectomy",             defaultPrice: 2800000 },
  { id: "abscess-drainage-endo",label: "تخلیه آبسه",               category: "endo", icon: "pulpitis",                defaultPrice: 800000 },

  // ═══════════════════════════════════════════════
  // ۵. جراحی — Oral Surgery
  // ═══════════════════════════════════════════════
  { id: "extraction-simple",     label: "کشیدن دندان ساده",        category: "surgery", icon: "simple-extraction",           defaultPrice: 800000 },
  { id: "extraction-wisdom",     label: "کشیدن دندان عقل نهفته",   category: "surgery", icon: "wisdom-tooth-extraction",     defaultPrice: 2800000 },
  { id: "extraction-milk",       label: "کشیدن دندان شیری",        category: "surgery", icon: "simple-extraction",           defaultPrice: 400000 },
  { id: "maxillofacial-surgery", label: "جراحی فک و صورت",         category: "surgery", icon: "scissors",                    defaultPrice: 15000000 },
  { id: "frenectomy-surgery",    label: "فرنکتومی",                category: "surgery", icon: "scissors",                    defaultPrice: 2500000 },
  { id: "biopsy",                label: "بیوپسی",                   category: "surgery", icon: "microscope",                  defaultPrice: 2000000 },
  { id: "abscess-drainage-surgery", label: "تخلیه آبسه",            category: "surgery", icon: "droplet",                     defaultPrice: 1000000 },
  { id: "sinus-lift",            label: "سینوس لیفت",              category: "surgery", icon: "bone",                        defaultPrice: 8000000 },
  { id: "bone-graft",            label: "پیوند استخوان",           category: "surgery", icon: "bone",                        defaultPrice: 6000000 },
  { id: "implant",               label: "ایمپلنت دندانی",          category: "surgery", icon: "titanium-implant",            defaultPrice: 15000000 },
  { id: "implant-sinus-drainage",label: "آبسه‌درناژ ایمپلنت",        category: "surgery", icon: "droplet",                     defaultPrice: 1200000 },

  // ═══════════════════════════════════════════════
  // ۶. پروتز — Prosthodontics
  // ═══════════════════════════════════════════════
  { id: "crown",                    label: "روکش (Crown)",              category: "prosthetic", icon: "zirconia-crown",               needsMaterial: true, defaultPrice: 3500000 },
  { id: "bridge",                   label: "بریج (Bridge)",              category: "prosthetic", icon: "zirconia-bridge",              needsMaterial: true, defaultPrice: 6500000 },
  { id: "laminate-veneer",          label: "لمینت (Laminate Veneer)",    category: "prosthetic", icon: "porcelain-veneer",             needsMaterial: true, defaultPrice: 4000000 },
  { id: "composite-veneer-prosthetic", label: "کامپوزیت ونیر",           category: "prosthetic", icon: "composite-veneer",             defaultPrice: 2500000 },
  { id: "temporary-crown",          label: "روکش موقت",                  category: "prosthetic", icon: "provisional-crown",            defaultPrice: 800000 },
  { id: "denture-full",             label: "دنچر کامل (پروتز کامل)",     category: "prosthetic", icon: "default",                      defaultPrice: 12000000 },
  { id: "denture-partial",          label: "دنچر پارسیل (پروتز پارسیل)", category: "prosthetic", icon: "default",                      defaultPrice: 8000000 },
  { id: "denture-upper",            label: "دنچر فک بالا",               category: "prosthetic", icon: "default",                      defaultPrice: 6000000 },
  { id: "denture-lower",            label: "دنچر فک پایین",              category: "prosthetic", icon: "default",                      defaultPrice: 6000000 },
  { id: "denture-immediate",        label: "پروتز فوری",                 category: "prosthetic", icon: "default",                      defaultPrice: 9000000 },
  { id: "implant-supported-prosthesis", label: "پروتز ایمپلنت‌ساپورت",   category: "prosthetic", icon: "zirconia-crown-on-implant",    needsMaterial: true, defaultPrice: 18000000 },
  { id: "overdenture",              label: "اور دنچر (Overdenture)",     category: "prosthetic", icon: "default",                      defaultPrice: 14000000 },
  { id: "prosthesis-repair",        label: "تعمیر پروتز",                category: "prosthetic", icon: "wrench",                       defaultPrice: 800000 },
  { id: "rebase-reline",            label: "ریبِیس و رِلاین",             category: "prosthetic", icon: "wrench",                       defaultPrice: 1500000 },

  // ═══════════════════════════════════════════════
  // ۷. ارتودنسی — Orthodontics
  // ═══════════════════════════════════════════════
  { id: "ortho-consultation",       label: "مشاوره ارتودنسی",          category: "ortho", icon: "message-circle",     defaultPrice: 300000 },
  { id: "ortho-fixed-metal",        label: "ارتودنسی ثابت فلزی",        category: "ortho", icon: "bracket-bonding",    defaultPrice: 40000000 },
  { id: "ortho-fixed-ceramic",      label: "ارتودنسی ثابت سرامیکی",     category: "ortho", icon: "bracket-bonding",    defaultPrice: 55000000 },
  { id: "ortho-fixed-clear",        label: "ارتودنسی ثابت شفاف",        category: "ortho", icon: "bracket-bonding",    defaultPrice: 65000000 },
  { id: "ortho-lingual",            label: "ارتودنسی لینگوال",          category: "ortho", icon: "bracket-bonding",    defaultPrice: 90000000 },
  { id: "ortho-removable",          label: "ارتودنسی متحرک",            category: "ortho", icon: "fixed-retainer",     defaultPrice: 15000000 },
  { id: "invisalign",               label: "اینویزیلاین",               category: "ortho", icon: "invisalign-attachments", defaultPrice: 120000000 },
  { id: "ortho-fixed-retainer",     label: "ریتینر ثابت",               category: "ortho", icon: "fixed-retainer",     defaultPrice: 3000000 },
  { id: "ortho-removable-retainer", label: "ریتینر متحرک",              category: "ortho", icon: "fixed-retainer",     defaultPrice: 4000000 },
  { id: "ortho-interceptive",       label: "ارتودنسی کودکان",           category: "ortho", icon: "bracket-bonding",    defaultPrice: 20000000 },
  { id: "expander",                 label: "اکپندر",                     category: "ortho", icon: "ortho-extrusion",    defaultPrice: 8000000 },
  { id: "headgear",                 label: "هدگیر",                      category: "ortho", icon: "ortho-extrusion",    defaultPrice: 6000000 },
  { id: "facemask",                 label: "فیس‌ماسک",                   category: "ortho", icon: "ortho-extrusion",    defaultPrice: 9000000 },
  { id: "ortho-elastics",           label: "الاستیک و کش ارتودنسی",     category: "ortho", icon: "ortho-rotation",     defaultPrice: 500000 },
  { id: "ortho-bracket-bonding",    label: "باندینگ براکت",             category: "ortho", icon: "bracket-bonding",    defaultPrice: 700000 },
  { id: "ortho-rebonding",          label: "ریباند براکت",              category: "ortho", icon: "bracket-replacement",defaultPrice: 500000 },

  // ═══════════════════════════════════════════════
  // ۸. پریو — Periodontics
  // ═══════════════════════════════════════════════
  { id: "deep-scaling",              label: "جرم‌گیری عمیق",              category: "perio", icon: "sparkles",   defaultPrice: 1200000 },
  { id: "curettage",                 label: "کورتاژ لثه",                category: "perio", icon: "scissors",   defaultPrice: 1500000 },
  { id: "root-planing",              label: "Root Planing",              category: "perio", icon: "sparkles",   defaultPrice: 1800000 },
  { id: "flap-surgery",              label: "جراحی فلپ لثه",              category: "perio", icon: "scissors",   defaultPrice: 4000000 },
  { id: "gingival-graft",            label: "پیوند لثه",                  category: "perio", icon: "bone",       defaultPrice: 5000000 },
  { id: "keratinized-gum-graft",     label: "کراتین گام گرافت",           category: "perio", icon: "bone",       defaultPrice: 4500000 },
  { id: "frenectomy-perio",          label: "فرنکتومی",                   category: "perio", icon: "scissors",   defaultPrice: 2500000 },
  { id: "gingivectomy",              label: "ژینجیوکتومی",                category: "perio", icon: "scissors",   defaultPrice: 3000000 },
  { id: "periodontitis-treatment",   label: "درمان پریودنتیت",            category: "perio", icon: "heart-pulse",defaultPrice: 2000000 },
  { id: "laser-gum-therapy",         label: "لیزر درمانی لثه",            category: "perio", icon: "zap",        defaultPrice: 3500000 },
  { id: "gum-contouring",            label: "لثه‌برداری زیبایی",           category: "perio", icon: "sparkles",   defaultPrice: 4000000 },

  // ═══════════════════════════════════════════════
  // ۹. زیبایی — Cosmetic
  // ═══════════════════════════════════════════════
  { id: "bleaching-office",          label: "بلیچینگ مطب",                category: "cosmetic", icon: "sparkles",        defaultPrice: 4000000 },
  { id: "bleaching-home",            label: "بلیچینگ خانگی",              category: "cosmetic", icon: "sparkles",        defaultPrice: 2500000 },
  { id: "bleaching-internal",        label: "بلیچینگ داخلی",              category: "cosmetic", icon: "sparkles",        defaultPrice: 3000000 },
  { id: "ceramic-laminate",          label: "لمینت سرامیکی",              category: "cosmetic", icon: "porcelain-veneer", needsMaterial: true, defaultPrice: 4500000 },
  { id: "composite-veneer-cosmetic", label: "کامپوزیت ونیر",              category: "cosmetic", icon: "composite-veneer", defaultPrice: 2500000 },
  { id: "smile-design",              label: "طراحی لبخند",                category: "cosmetic", icon: "smile",           defaultPrice: 5000000 },
  { id: "dsd",                       label: "DSD (Digital Smile Design)", category: "cosmetic", icon: "target",          defaultPrice: 6000000 },
  { id: "cosmetic-bonding",          label: "باندینگ زیبایی",             category: "cosmetic", icon: "composite-filling", needsSurface: true, defaultPrice: 1800000 },
  { id: "cosmetic-polishing",        label: "پالیش زیبایی",               category: "cosmetic", icon: "sparkles",        defaultPrice: 800000 },
  { id: "microabrasion",             label: "میکروابریژن",                category: "cosmetic", icon: "sparkles",        defaultPrice: 1500000 },
  { id: "gum-aesthetics",            label: "زیبایی لثه",                 category: "cosmetic", icon: "heart",           defaultPrice: 3500000 },

  // ═══════════════════════════════════════════════
  // ۱۰. کودکان — Pedodontics
  // ═══════════════════════════════════════════════
  { id: "pedo-exam",                 label: "معاینه کودک",               category: "pedo", icon: "baby",         defaultPrice: 200000 },
  { id: "pedo-fluoride",             label: "فلورایدتراپی کودک",          category: "pedo", icon: "shield",       defaultPrice: 250000 },
  { id: "sealant-pedo",              label: "فیشور سیلانت",               category: "pedo", icon: "shield-check", defaultPrice: 250000 },
  { id: "pedo-filling",              label: "پرکردن دندان شیری",           category: "pedo", icon: "composite-filling", needsSurface: true, defaultPrice: 500000 },
  { id: "pedo-pulpotomy",            label: "پالپوتومی دندان شیری",        category: "pedo", icon: "emergency-pulp-chamber-opening", defaultPrice: 700000 },
  { id: "pedo-extraction",           label: "کشیدن دندان شیری",            category: "pedo", icon: "simple-extraction", defaultPrice: 400000 },
  { id: "pedo-ssc",                  label: "روکش استیل دندان شیری",      category: "pedo", icon: "metal-crown",  defaultPrice: 1200000 },
  { id: "pedo-zirconia-crown",       label: "روکش زیرکونیا دندان شیری",   category: "pedo", icon: "zirconia-crown", defaultPrice: 1800000 },
  { id: "space-maintainer",          label: "فضا نگهدار",                 category: "pedo", icon: "ortho-extrusion", defaultPrice: 2000000 },
  { id: "pedo-sedation",             label: "بیهوشی/سدیشن کودکان",        category: "pedo", icon: "moon",         defaultPrice: 5000000 },

  // ═══════════════════════════════════════════════
  // ۱۱. فک و مفصل — TMJ
  // ═══════════════════════════════════════════════
  { id: "tmj-treatment",             label: "درمان TMJ",                  category: "tmj", icon: "activity",   defaultPrice: 3000000 },
  { id: "night-guard",               label: "نایت‌گارد",                   category: "tmj", icon: "moon",       defaultPrice: 2500000 },
  { id: "jaw-splint",                label: "اسپلینت فک",                 category: "tmj", icon: "shield",     defaultPrice: 2800000 },
  { id: "occlusion-correction",      label: "اصلاح اکلوژن",               category: "tmj", icon: "target",     defaultPrice: 3500000 },
  { id: "bite-plate",                label: "بایت پلیت",                  category: "tmj", icon: "layers",     defaultPrice: 2200000 },
  { id: "jaw-physiotherapy",         label: "فیزیوتراپی فک",               category: "tmj", icon: "activity",   defaultPrice: 1500000 },

  // ═══════════════════════════════════════════════
  // ۱۲. خدمات جانبی — Auxiliary
  // ═══════════════════════════════════════════════
  { id: "local-anesthesia",          label: "بی‌حسی موضعی",               category: "auxiliary", icon: "syringe",       defaultPrice: 200000 },
  { id: "general-anesthesia",        label: "بی‌حسی عمومی / سدیشن",       category: "auxiliary", icon: "moon",          defaultPrice: 8000000 },
  { id: "impression",                label: "قالب‌گیری",                   category: "auxiliary", icon: "box",           defaultPrice: 400000 },
  { id: "temporary-whitening",       label: "سفیدکردن موقت",               category: "auxiliary", icon: "sparkles",      defaultPrice: 600000 },
  { id: "dental-nutrition-consult",  label: "مشاوره تغذیه دندانی",        category: "auxiliary", icon: "apple",         defaultPrice: 300000 },
  { id: "intraoral-photo",           label: "عکس‌برداری داخل دهانی",        category: "auxiliary", icon: "camera",        defaultPrice: 350000 },
  { id: "intraoral-scan",            label: "اسکن دیجیتال",                category: "auxiliary", icon: "scan-face",     defaultPrice: 800000 },
  { id: "3d-printing",               label: "چاپ سه‌بعدی مدل",             category: "auxiliary", icon: "box",           defaultPrice: 1200000 },
  { id: "fluoride-varnish",          label: "فلوراید وارنیش",              category: "auxiliary", icon: "shield",        defaultPrice: 250000 },
  { id: "plaque-control",            label: "کنترل پلاک",                  category: "auxiliary", icon: "brush",         defaultPrice: 300000 },

  // ═══════════════════════════════════════════════
  // ۱۳. اورژانس — Emergency
  // ═══════════════════════════════════════════════
  { id: "emergency-toothache",       label: "درد دندان",                  category: "emergency", icon: "alert-circle",   defaultPrice: 500000 },
  { id: "emergency-fracture",        label: "شکستگی دندان",               category: "emergency", icon: "alert-triangle", defaultPrice: 800000 },
  { id: "emergency-avulsion",        label: "افتادن دندان (Avulsion)",    category: "emergency", icon: "alert-triangle", defaultPrice: 1500000 },
  { id: "emergency-bleeding",        label: "خونریزی لثه",                category: "emergency", icon: "droplet",        defaultPrice: 400000 },
  { id: "emergency-abscess",         label: "آبسه اورژانسی",              category: "emergency", icon: "alert-circle",   defaultPrice: 900000 },
  { id: "emergency-trauma",          label: "تروما",                       category: "emergency", icon: "bandage",        defaultPrice: 1200000 },

  // ═══════════════════════════════════════════════
  // ۱۴. طرح درمان — Treatment Plan (در تب تشخیص)
  // ═══════════════════════════════════════════════
  { id: "crown-needed",              label: "نیاز به روکش",               category: "plan", icon: "crown-needed",    defaultPrice: 0 },
  { id: "crown-replace",             label: "تعویض روکش",                 category: "plan", icon: "crown-replace",   defaultPrice: 0 },
  { id: "extraction-plan",           label: "طرح کشیدن",                  category: "plan", icon: "extraction-plan", defaultPrice: 0 },
  { id: "missing-closed",            label: "بسته‌شدن فاصله",              category: "plan", icon: "missing-closed",  defaultPrice: 0 },
];

// ═══════════════════════════════════════════════
// سطوح — Surfaces (۵ سطح، بدون subcrown)
// ═══════════════════════════════════════════════
export interface SurfaceItem {
  id: string;
  label: string;
  short: string;
  /** موقعیت در surface-cross (buccal / mesial / occlusal / distal / lingual) */
  pos: string;
}

export const SURFACES: SurfaceItem[] = [
  { id: "mesial",   label: "مزیال",   short: "M", pos: "mesial" },
  { id: "distal",   label: "دیستال",  short: "D", pos: "distal" },
  { id: "buccal",   label: "باکال",   short: "B", pos: "buccal" },
  { id: "lingual",  label: "لینگوال", short: "L", pos: "lingual" },
  { id: "occlusal", label: "اکلوزال", short: "O", pos: "occlusal" },
];

// ═══════════════════════════════════════════════
// مواد — Materials
// ═══════════════════════════════════════════════
export const MATERIALS = [
  { id: "zircon",        label: "زیرکونیا" },
  { id: "emax",          label: "e.max" },
  { id: "gold",          label: "طلا" },
  { id: "gradia",        label: "گرادیا" },
  { id: "metal",         label: "فلز" },
  { id: "metal-ceramic", label: "PFM (فلز-سرامیک)" },
  { id: "telescope",     label: "تلسکوپی" },
  { id: "temporary",     label: "موقت" },
];

// ═══════════════════════════════════════════════
// توابع کمکی — Helpers
// ═══════════════════════════════════════════════

/**
 * آیا دندان قدامی است؟ (incisor یا canine)
 * 11-13, 21-23, 31-33, 41-43
 */
export function isAnteriorTooth(toothNo: number): boolean {
  return [11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43].includes(toothNo);
}

/**
 * آیا دندان فک بالا است؟
 */
export function isUpperTooth(toothNo: number): boolean {
  const q = Math.floor(toothNo / 10);
  return q === 1 || q === 2 || q === 5 || q === 6;
}

/**
 * برچسب نمایشی سطح را بر اساس موقعیت دندان برمی‌گرداند.
 * برای دندان قدامی: occlusal → "اینیسیزال"، buccal → "لبیال"، lingual (بالا) → "پالاتال"
 */
export function getSurfaceLabel(
  surfaceId: string,
  toothNo: number | null,
): string {
  const fallback = SURFACES.find((s) => s.id === surfaceId)?.label ?? surfaceId;
  if (toothNo === null) return fallback;

  const isAnterior = isAnteriorTooth(toothNo);
  const isUpper = isUpperTooth(toothNo);

  if (surfaceId === "occlusal") return isAnterior ? "اینیسیزال" : "اکلوزال";
  if (surfaceId === "buccal") return isAnterior ? "لبیال" : "باکال";
  if (surfaceId === "lingual") return isUpper ? "پالاتال" : "لینگوال";

  return fallback;
}

/**
 * حرف کوتاه سطح را بر اساس موقعیت دندان برمی‌گرداند.
 */
export function getSurfaceShort(
  surfaceId: string,
  toothNo: number | null,
): string {
  const fallback = SURFACES.find((s) => s.id === surfaceId)?.short ?? surfaceId;
  if (toothNo === null) return fallback;

  const isAnterior = isAnteriorTooth(toothNo);
  const isUpper = isUpperTooth(toothNo);

  if (surfaceId === "occlusal") return isAnterior ? "I" : "O";
  if (surfaceId === "buccal") return isAnterior ? "La" : "B";
  if (surfaceId === "lingual") return isUpper ? "P" : "L";

  return fallback;
}

// ═══════════════════════════════════════════════
// سایر توابع
// ═══════════════════════════════════════════════

export function getTreatmentsByCategory(category: Category): TreatmentItem[] {
  return TREATMENTS.filter((t) => t.category === category);
}

export function getTreatmentById(id: string): TreatmentItem | undefined {
  return TREATMENTS.find((t) => t.id === id);
}

export function getMaterialLabel(id: string): string {
  return MATERIALS.find((m) => m.id === id)?.label ?? id;
}

/** برچسب سطح (سازگاری با نسخه قدیمی) — label ثابت */
export function getSurfaceLabelStatic(id: string): string {
  return SURFACES.find((s) => s.id === id)?.label ?? id;
}