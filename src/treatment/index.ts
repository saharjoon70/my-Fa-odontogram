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
  store,
  addRecord,
  removeRecord,
  removeRecordsForTooth,
  removeRecordsForPatient,
  clearAll,
  getRecordsForTooth,
  getRecordsByKind,
  getRecordsForPatient,
  getToothTotal,
  getPatientTotal,
  allRecords,
  recordCount,
  type OdontogramRecord,
  type StatusRecord,
  type TreatmentRecord,
  type DiagnosisRecord,
  type RecordKind,
  type BaseRecord,
} from "./treatmentStore";

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
  recomputeToothState,
  applyPatchToTooth,
  resetToothToDefault,
  submitStatus,
  unsubmitStatus,
  submitTreatment,
  submitDiagnosis,
  deleteRecord,

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