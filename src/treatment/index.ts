// src/treatment/index.ts
// Barrel export — همه چیز از یک نقطه

// ═══════════════════════════════════════════════
// Data
// ═══════════════════════════════════════════════
export {
  CATEGORIES,
  TREATMENT_TAB_CATEGORIES,
  DIAGNOSIS_TAB_CATEGORIES,
  getCategoryLabel,
  getCategoryColor,
  type Category,
  type CategoryMeta,
} from "./categories";

export {
  TREATMENTS,
  MATERIALS,
  SURFACES,
  getTreatmentsByCategory,
  getTreatmentById,
  getMaterialLabel,
  getSurfaceLabel,
  type TreatmentItem,
} from "./treatments";

export {
  STATUS_GROUPS,
  getStatusGroup,
  type StatusGroup,
  type StatusGroupMeta,
  type StatusItem,
  type StatusRadio,
  type StatusRadioOption,
  type StatusKind,
} from "./statusGroups";

export {
  getTreatmentIcon,
  TREATMENT_ICONS,
} from "./treatmentIcons";

// ═══════════════════════════════════════════════
// Mapping
// ═══════════════════════════════════════════════
export {
  statusItemToPatch,
  statusRadioToPatch,
  isItemChecked,
  getRadioValue,
  type StatePatch,
  type ToothStateField,
} from "./statusToState";

// ═══════════════════════════════════════════════
// Store
// ═══════════════════════════════════════════════
export {
  planStore,
  addPlan,
  updatePlan,
  removePlan,
  getPlanById,
  getPlansForPatient,
  addSession,
  updateSession,
  removeSession,
  getSessionById,
  getSessionsForPatient,
  getSessionsForPlan,
  getUpcomingSessions,
  getTodaySessions,
  getPastSessions,
  getNextSessionNumber,
  addStaff,
  updateStaff,
  removeStaff,
  getDoctors,
  getAssistants,
  getStaffById,
  allPlans,
  allSessions,
  allStaff,
  type PlanStatus,
  type SessionStatus,
  type StaffRole,
  type StaffMember,
  type TreatmentPlan,
  type TreatmentSession,
} from "./treatmentPlanStore";

// ═══════════════════════════════════════════════
// Derive
// ═══════════════════════════════════════════════
export {
  deriveToothState,
  deriveFromRecords,
  defaultToothState,
  getRecordLabel,
} from "./deriveToothState";

// ═══════════════════════════════════════════════
// Apply (public API)
// ═══════════════════════════════════════════════
export {
  getPlannedRecordsForPatient,
  getRecordsForSession,
  getRecordsForPlan,
  markAsDone,
  markAsPlanned,
} from "./applyTreatment";

// ═══════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════
export { default as TreatmentTabs } from "./TreatmentTabs.vue";
export { default as StatusPanel } from "./StatusPanel.vue";
export { default as StatusForm } from "./StatusForm.vue";
export { default as TreatmentPanel } from "./TreatmentPanel.vue";
export { default as TreatmentForm } from "./TreatmentForm.vue";
export { default as DiagnosisPanel } from "./DiagnosisPanel.vue";
export { default as DiagnosisForm } from "./DiagnosisForm.vue";
export { default as TreatmentHistory } from "./TreatmentHistory.vue";
// Components
export { default as TreatmentPlanPanel } from "./TreatmentPlanPanel.vue";
export { default as SessionsPanel } from "./SessionsPanel.vue";
export { default as TreatmentPlanModal } from "./TreatmentPlanModal.vue";
export { default as SessionModal } from "./SessionModal.vue";
export { default as TreatmentRecordForm } from "./TreatmentRecordForm.vue";