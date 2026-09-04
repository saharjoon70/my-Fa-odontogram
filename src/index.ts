import "./index.css";

import OdontogramShell from "./App.vue";

export default OdontogramShell;
export { OdontogramShell };

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
} from "./odontogram";

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
export { startIntroTour } from "./tour";
export type { OdontogramThemeConfig } from "./theme";
export type { OdontogramPlugin, PluginLayer } from "./plugin";
export type { SettingsState } from "./settingsModal";
export { SETTINGS_TABS } from "./settingsModal";

export { t, getI18nLanguage, setI18nLanguage, onI18nChange, useI18n } from "./i18n/useI18n";
