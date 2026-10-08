// src/treatment/treatmentPlanStore.ts
// Store برای طرح درمان، جلسات، تیم درمان

import { reactive, computed } from "vue";

// ═══════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════

export type PlanStatus = "planned" | "in-progress" | "completed" | "cancelled";
export type SessionStatus = "scheduled" | "done" | "cancelled";
export type StaffRole = "doctor" | "assistant";

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  color?: string;
  specialty?: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: PlanStatus;
  toothNos: number[];
  doctorId?: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TreatmentSession {
  id: string;
  patientId: string;
  planId: string;           // ⭐ اجباری — هر جلسه به یه طرح وصل میشه
  sessionNumber: number;
  title: string;
  sessionDate: string;
  sessionTime?: string;
  status: SessionStatus;
  doctorId?: string;
  assistantId?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

// ═══════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════

interface PlanStoreState {
  plans: TreatmentPlan[];
  sessions: TreatmentSession[];
  staff: StaffMember[];
}

export const planStore = reactive<PlanStoreState>({
  plans: [],
  sessions: [],
  staff: [
    { id: "doc-1", name: "دکتر اصلی", role: "doctor", color: "#2563eb" },
    { id: "asst-1", name: "دستیار ۱", role: "assistant", color: "#16a34a" },
  ],
});

// ═══════════════════════════════════════════════
// uid
// ═══════════════════════════════════════════════

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// ═══════════════════════════════════════════════
// Plans — CRUD
// ═══════════════════════════════════════════════

export function addPlan(
  plan: Omit<TreatmentPlan, "id" | "createdAt" | "updatedAt">,
): TreatmentPlan {
  const now = Date.now();
  const newPlan: TreatmentPlan = {
    ...plan,
    id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  planStore.plans.push(newPlan);
  return newPlan;
}

export function getPlansForPatient(patientId: string): TreatmentPlan[] {
  return planStore.plans.filter((p) => p.patientId === patientId);
}
export function updatePlan(
  planId: string,
  patch: Partial<TreatmentPlan>,
): boolean {
  const idx = planStore.plans.findIndex((p) => p.id === planId);
  if (idx < 0) return false;
  planStore.plans[idx] = {
    ...planStore.plans[idx],
    ...patch,
    updatedAt: Date.now(),
  };
  return true;
}

export function removePlan(planId: string): boolean {
  const idx = planStore.plans.findIndex((p) => p.id === planId);
  if (idx < 0) return false;
  planStore.plans.splice(idx, 1);
  planStore.sessions = planStore.sessions.filter((s) => s.planId !== planId);
  return true;
}

export function getPlanById(planId: string): TreatmentPlan | undefined {
  return planStore.plans.find((p) => p.id === planId);
}



// ═══════════════════════════════════════════════
// Sessions — CRUD
// ═══════════════════════════════════════════════

export function getNextSessionNumber(planId: string): number {
  const sessions = planStore.sessions.filter((s) => s.planId === planId);
  if (sessions.length === 0) return 1;
  return Math.max(...sessions.map((s) => s.sessionNumber)) + 1;
}

export function addSession(
  session: Omit<TreatmentSession, "id" | "createdAt" | "updatedAt">,
): TreatmentSession {
  const now = Date.now();
  const newSession: TreatmentSession = {
    ...session,
    id: uid("sess"),
    createdAt: now,
    updatedAt: now,
  };
  planStore.sessions.push(newSession);
  return newSession;
}

export function updateSession(
  sessionId: string,
  patch: Partial<TreatmentSession>,
): boolean {
  const idx = planStore.sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) return false;
  planStore.sessions[idx] = {
    ...planStore.sessions[idx],
    ...patch,
    updatedAt: Date.now(),
  };
  return true;
}

export function removeSession(sessionId: string): boolean {
  const idx = planStore.sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) return false;
  planStore.sessions.splice(idx, 1);
  return true;
}

export function getSessionById(sessionId: string): TreatmentSession | undefined {
  return planStore.sessions.find((s) => s.id === sessionId);
}

export function getSessionsForPatient(patientId: string): TreatmentSession[] {
  return planStore.sessions
    .filter((s) => s.patientId === patientId)
    .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
}

export function getSessionsForPlan(planId: string): TreatmentSession[] {
  return planStore.sessions
    .filter((s) => s.planId === planId)
    .sort((a, b) => a.sessionNumber - b.sessionNumber);
}

export function getUpcomingSessions(patientId: string): TreatmentSession[] {
  const today = new Date().toISOString().slice(0, 10);
  return getSessionsForPatient(patientId)
    .filter((s) => s.sessionDate > today && s.status === "scheduled")
    .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
}

export function getTodaySessions(patientId: string): TreatmentSession[] {
  const today = new Date().toISOString().slice(0, 10);
  return getSessionsForPatient(patientId).filter(
    (s) => s.sessionDate === today,
  );
}

export function getPastSessions(patientId: string): TreatmentSession[] {
  const today = new Date().toISOString().slice(0, 10);
  return getSessionsForPatient(patientId).filter((s) => s.sessionDate < today);
}

// ═══════════════════════════════════════════════
// Staff — CRUD
// ═══════════════════════════════════════════════

export function addStaff(member: Omit<StaffMember, "id">): StaffMember {
  const newMember: StaffMember = { ...member, id: uid("staff") };
  planStore.staff.push(newMember);
  return newMember;
}

export function updateStaff(id: string, patch: Partial<StaffMember>): boolean {
  const idx = planStore.staff.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  planStore.staff[idx] = { ...planStore.staff[idx], ...patch };
  return true;
}

export function removeStaff(id: string): boolean {
  const idx = planStore.staff.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  planStore.staff.splice(idx, 1);
  return true;
}

export function getDoctors(): StaffMember[] {
  return planStore.staff.filter((s) => s.role === "doctor");
}

export function getAssistants(): StaffMember[] {
  return planStore.staff.filter((s) => s.role === "assistant");
}

export function getStaffById(id: string): StaffMember | undefined {
  return planStore.staff.find((s) => s.id === id);
}

// ═══════════════════════════════════════════════
// Computed
// ═══════════════════════════════════════════════

export const allPlans = computed(() => planStore.plans);
export const allSessions = computed(() => planStore.sessions);
export const allStaff = computed(() => planStore.staff);