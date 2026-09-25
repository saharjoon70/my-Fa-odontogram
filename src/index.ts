// src/index.ts
// Library entry — export همه چیز برای استفاده در بیرون

import "./index.css";

// ═══════════════════════════════════════════════
// کامپوننت اصلی
// ═══════════════════════════════════════════════
import OdontogramShell from "./App.vue";
export default OdontogramShell;
export { OdontogramShell };

// ═══════════════════════════════════════════════
// لایه‌ی درمان (پوشه جدید src/treatment/)
// ═══════════════════════════════════════════════
export * from "./treatment";

// ═══════════════════════════════════════════════
// Engine API (از odontogram.ts)
// ═══════════════════════════════════════════════
export {
  getSelectedTeeth,
  setSelectedTeeth,
  onSelectionChange,
  setToothStateAndRender,
  getToothState,
} from "./odontogram";

export {
  clearSelection,
  setOcclusalVisible,
  setWisdomVisible,
  setShowBase,
  setHealthyPulpVisible,
  registerPlugins,
  setPluginState,
  getPluginState,
  getToothStateSummary,
  getOdontogramSummary,
  onStateChange,
  setReadOnly,
  getReadOnly,
  setNotesEnabled,
  getNotesEnabled,
  setIcdasEnabled,
  getIcdasEnabled,
  setPulpDetailLevel,
  getPulpDetailLevel,
  setSecondaryCariesMode,
  getSecondaryCariesMode,
  setRootCariesMode,
  getRootCariesMode,
  setRadiographicDepthMode,
  getRadiographicDepthMode,
  setCariesDepthEnabled,
  getCariesDepthEnabled,
  setWearDetailLevel,
  getWearDetailLevel,
  setDiscolorationDetailLevel,
  getDiscolorationDetailLevel,
  setSurfaceNotation,
  getSurfaceNotation,
  exportFhir,
  exportImage,
  exportSvg,
  setImportFormat,
  exportStatus,
  importStatus,
} from "./odontogram";

// ═══════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════
export type {
  PulpDetailLevel,
  SecondaryCariesMode,
  RootCariesMode,
  RadiographicDepthMode,
  ToothDetailLevel,
  SurfaceNotation,
  OdontogramSummary,
  OdontogramSummarySection,
} from "./odontogram";

export type { FhirExportOptions } from "./fhir/types";
export type { OdontogramThemeConfig } from "./theme";
export type { OdontogramPlugin, PluginLayer } from "./plugin";
export type { SettingsState } from "./settingsModal";

// ═══════════════════════════════════════════════
// ابزارهای جانبی
// ═══════════════════════════════════════════════
export { startIntroTour } from "./tour";
export { SETTINGS_TABS } from "./settingsModal";
export {
  t,
  getI18nLanguage,
  setI18nLanguage,
  onI18nChange,
  useI18n,
} from "./i18n/useI18n";