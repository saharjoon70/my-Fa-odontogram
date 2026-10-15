// src/treatment/radiographStore.ts
// Store رادیوگرافی‌ها — فعلاً فقط نمایش، بعداً آپلود

import { reactive, computed } from "vue";

export type RadiographType =
  | "periapical"
  | "panoramic"
  | "cbct"
  | "bitewing"
  | "cephalometric"
  | "other";

export interface Radiograph {
  id: string;
  patientId: string;
  sessionId?: string;       // ⭐ مفرد
  planId?: string;          // ⭐ این هم مفرد
  type: RadiographType;
  toothNos: number[];
  date: string;
  imageUrl: string;         // base64 یا URL
  thumbnail?: string;
  note?: string;
  createdAt: number;
}
interface RadiographState {
  radiographs: Radiograph[];
}

export const radiographStore = reactive<RadiographState>({
  radiographs: [],
});

// ═══════════════════════════════════════════════
// uid
// ═══════════════════════════════════════════════

function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `rad_${crypto.randomUUID()}`;
  }
  return `rad_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// ═══════════════════════════════════════════════
// CRUD
// ═══════════════════════════════════════════════

export function addRadiograph(
  rad: Omit<Radiograph, "id" | "createdAt">,
): Radiograph {
  const newRad: Radiograph = {
    ...rad,
    id: uid(),
    createdAt: Date.now(),
  };
  radiographStore.radiographs.push(newRad);
  return newRad;
}

export function updateRadiograph(
  id: string,
  patch: Partial<Radiograph>,
): boolean {
  const idx = radiographStore.radiographs.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  radiographStore.radiographs[idx] = {
    ...radiographStore.radiographs[idx],
    ...patch,
  };
  return true;
}

export function removeRadiograph(id: string): boolean {
  const idx = radiographStore.radiographs.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  radiographStore.radiographs.splice(idx, 1);
  return true;
}

// ═══════════════════════════════════════════════
// Query
// ═══════════════════════════════════════════════

export function getRadiographsForPatient(patientId: string): Radiograph[] {
  return radiographStore.radiographs
    .filter((r) => r.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getRadiographById(id: string): Radiograph | undefined {
  return radiographStore.radiographs.find((r) => r.id === id);
}

export function getRadiographsForSession(sessionId: string): Radiograph[] {
  return radiographStore.radiographs.filter(
    (r) => r.sessionId === sessionId,   // ⭐ مفرد
  );
}

export function getRadiographsForPlan(planId: string): Radiograph[] {
  return radiographStore.radiographs.filter(
    (r) => r.planId === planId,   // ⭐ مفرد
  );
}

// ═══════════════════════════════════════════════
// Computed
// ═══════════════════════════════════════════════

export const allRadiographs = computed(() => radiographStore.radiographs);

// ═══════════════════════════════════════════════
// Labels
// ═══════════════════════════════════════════════

export const RADIOGRAPH_TYPE_LABELS: Record<RadiographType, string> = {
  periapical: "پری‌اپیکال",
  panoramic: "پانورامیک (OPG)",
  cbct: "CBCT",
  bitewing: "بایت‌وینگ",
  cephalometric: "سفالومتری",
  other: "سایر",
};