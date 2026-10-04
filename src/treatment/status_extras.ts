// src/treatment/status_extras.ts

export interface StatusExtraBase {
  id: string;
  label: string;
  type: string;
}

export interface StatusExtraSpan extends StatusExtraBase {
  type: "span";
  teeth: number[];
  material: string;
}

export interface StatusExtraArchBridge extends StatusExtraBase {
  type: "arch-bridge";
  arch: "upper" | "lower";
  material: string;
  missingMaterial?: string;
}

export interface StatusExtraPartialRemovable extends StatusExtraBase {
  type: "partial-removable";
  arch: "upper" | "lower";
}

export interface StatusExtraFullRemovable extends StatusExtraBase {
  type: "full-removable";
  arch: "upper" | "lower";
}

export interface StatusExtraBarDenture extends StatusExtraBase {
  type: "bar-denture";
  arch: "upper" | "lower";
  implants: number[];
  missing: number[];
}

export type StatusExtra =
  | StatusExtraSpan
  | StatusExtraArchBridge
  | StatusExtraPartialRemovable
  | StatusExtraFullRemovable
  | StatusExtraBarDenture;

export const STATUS_EXTRAS = {
  arches: {
    upper: [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28] as number[],
    lower: [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38] as number[],
    wisdom: {
      upper: [18,28] as number[],
      lower: [48,38] as number[],
    },
  },
  options: [
    // بالای زیرکونیا
    { id: "upper-12-22-zircon",  label: "بالا ۱۲-۲۲ زیرکونیا",     type: "span", teeth: [12,11,21,22], material: "zircon" },
    { id: "upper-13-23-zircon",  label: "بالا ۱۳-۲۳ زیرکونیا",     type: "span", teeth: [13,12,11,21,22,23], material: "zircon" },
    { id: "upper-16-26-zircon",  label: "بالا ۱۶-۲۶ زیرکونیا",     type: "span", teeth: [16,15,14,13,12,11,21,22,23,24,25,26], material: "zircon" },
    { id: "upper-full-zircon",   label: "بریج کامل بالای زیرکونیا", type: "arch-bridge", arch: "upper", material: "zircon", missingMaterial: "zircon" },

    // بالای فلز-سرامیک
    { id: "upper-12-22-metal",   label: "بالا ۱۲-۲۲ فلز-سرامیک",    type: "span", teeth: [12,11,21,22], material: "metal" },
    { id: "upper-13-23-metal",   label: "بالا ۱۳-۲۳ فلز-سرامیک",    type: "span", teeth: [13,12,11,21,22,23], material: "metal" },
    { id: "upper-16-26-metal",   label: "بالا ۱۶-۲۶ فلز-سرامیک",    type: "span", teeth: [16,15,14,13,12,11,21,22,23,24,25,26], material: "metal" },
    { id: "upper-full-metal",    label: "بریج کامل بالای فلز-سرامیک", type: "arch-bridge", arch: "upper", material: "metal", missingMaterial: "metal" },

    // بالای متحرک
    { id: "upper-partial-removable", label: "بالای پارسیل متحرک",  type: "partial-removable", arch: "upper" },
    { id: "upper-full-removable",    label: "بالای کامل متحرک",    type: "full-removable", arch: "upper" },
    { id: "upper-bar-denture",       label: "پروتز بار بالا",      type: "bar-denture", arch: "upper", implants: [14,12,22,24], missing: [16,15,13,11,21,23,25,26] },

    // پایین زیرکونیا
    { id: "lower-42-32-zircon",  label: "پایین ۴۲-۳۲ زیرکونیا",    type: "span", teeth: [42,41,31,32], material: "zircon" },
    { id: "lower-43-33-zircon",  label: "پایین ۴۳-۳۳ زیرکونیا",    type: "span", teeth: [43,42,41,31,32,33], material: "zircon" },
    { id: "lower-46-36-zircon",  label: "پایین ۴۶-۳۶ زیرکونیا",    type: "span", teeth: [46,45,44,43,42,41,31,32,33,34,35,36], material: "zircon" },
    { id: "lower-full-zircon",   label: "بریج کامل پایین زیرکونیا", type: "arch-bridge", arch: "lower", material: "zircon", missingMaterial: "zircon" },

    // پایین فلز-سرامیک
    { id: "lower-42-32-metal",   label: "پایین ۴۲-۳۲ فلز-سرامیک",   type: "span", teeth: [42,41,31,32], material: "metal" },
    { id: "lower-43-33-metal",   label: "پایین ۴۳-۳۳ فلز-سرامیک",   type: "span", teeth: [43,42,41,31,32,33], material: "metal" },
    { id: "lower-46-36-metal",   label: "پایین ۴۶-۳۶ فلز-سرامیک",   type: "span", teeth: [46,45,44,43,42,41,31,32,33,34,35,36], material: "metal" },
    { id: "lower-full-metal",    label: "بریج کامل پایین فلز-سرامیک", type: "arch-bridge", arch: "lower", material: "metal", missingMaterial: "metal" },

    // پایین متحرک
    { id: "lower-partial-removable", label: "پایین پارسیل متحرک",  type: "partial-removable", arch: "lower" },
    { id: "lower-full-removable",    label: "پایین کامل متحرک",    type: "full-removable", arch: "lower" },
    { id: "lower-bar-denture",       label: "پروتز بار پایین",      type: "bar-denture", arch: "lower", implants: [44,42,32,34], missing: [46,45,43,41,31,33,35,36] },
  ] as StatusExtra[],
};