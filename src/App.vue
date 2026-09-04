<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef, watch } from "vue";
import {
  destroyOdontogram,
  initOdontogram,
  setNumberingSystem,
  registerPlugins,
  getOdontogramSummary,
  onStateChange,
  setReadOnly,
  setNotesEnabled,
  setIcdasEnabled,
  setPulpDetailLevel,
  setSecondaryCariesMode,
  setRootCariesMode,
  setRadiographicDepthMode,
  setCariesDepthEnabled,
  setWearDetailLevel,
  setDiscolorationDetailLevel,
  setSurfaceNotation,
  setImportFormat,
} from "./odontogram";
import type {
  OdontogramSummary,
  PulpDetailLevel,
  SecondaryCariesMode,
  RootCariesMode,
  RadiographicDepthMode,
  ToothDetailLevel,
  SurfaceNotation,
} from "./odontogram";
import { startIntroTour } from "./tour";
import { useI18n } from "./i18n/useI18n";
import SettingsModal from "./SettingsModal.vue";
import type { SettingsState } from "./settingsModal";
import type { Language } from "./i18n/translations";
import type { NumberingSystem } from "./utils/numbering";
import { applyThemeConfig, type OdontogramThemeConfig } from "./theme";
import type { OdontogramPlugin } from "./plugin";
import icon8Url from "./assets/icon-svgs/icon_8.svg";
import iconGumUrl from "./assets/icon-svgs/icon_gum.svg";
import iconNoSelectionUrl from "./assets/icon-svgs/icon_no_selection.svg";
import iconOcclUrl from "./assets/icon-svgs/icon_occl.svg";
import iconPulpUrl from "./assets/icon-svgs/icon_pulp.svg";

const props = withDefaults(
  defineProps<{
    language?: Language;
    numberingSystem?: NumberingSystem;
    darkMode?: boolean;
    themeConfig?: OdontogramThemeConfig;
    plugins?: OdontogramPlugin[];
    readOnly?: boolean;
    enableNotes?: boolean;
    enableIcdas?: boolean;
    pulpDetailLevel?: PulpDetailLevel;
    secondaryCariesMode?: SecondaryCariesMode;
    rootCariesMode?: RootCariesMode;
    radiographicDepthMode?: RadiographicDepthMode;
    cariesDepthEnabled?: boolean;
    wearDetailLevel?: ToothDetailLevel;
    discolorationDetailLevel?: ToothDetailLevel;
    surfaceNotation?: SurfaceNotation;
    showStatusCard?: boolean;
    showOrthoCard?: boolean;
  }>(),
  {
    readOnly: false,
    enableNotes: false,
    enableIcdas: false,
    pulpDetailLevel: "aae",
    secondaryCariesMode: "standard",
    rootCariesMode: "simple",
    radiographicDepthMode: "off",
    cariesDepthEnabled: true,
    wearDetailLevel: "complex",
    discolorationDetailLevel: "complex",
    surfaceNotation: "full",
    showStatusCard: true,
    showOrthoCard: true,
  },
);

const emit = defineEmits<{
  languageChange: [lang: Language];
  numberingChange: [system: NumberingSystem];
  darkModeChange: [dark: boolean];
}>();

const LANGUAGE_OPTIONS: { value: Language; labelKey: string }[] = [
  { value: "hu", labelKey: "language.hu" },
  { value: "en", labelKey: "language.en" },
  { value: "de", labelKey: "language.de" },
  { value: "es", labelKey: "language.es" },
  { value: "it", labelKey: "language.it" },
  { value: "sk", labelKey: "language.sk" },
  { value: "pl", labelKey: "language.pl" },
  { value: "ru", labelKey: "language.ru" },
  { value: "pt-br", labelKey: "language.pt-br" },
  { value: "ar", labelKey: "language.ar" },
  { value: "fa", labelKey: "language.fa" },
];

const languageProp = toRef(props, "language");
const { lang, setLang, t: tComputed } = useI18n({
  language: languageProp,
  onLanguageChange: (l) => emit("languageChange", l),
});
const t = (key: string, params?: Record<string, string | number>) => tComputed.value(key, params);

const internalNumbering = ref<NumberingSystem>(props.numberingSystem ?? "FDI");
const themeRootRef = ref<HTMLDivElement | null>(null);
const currentNumbering = computed(() => props.numberingSystem ?? internalNumbering.value);
const languageOpen = ref(false);
const languageRef = ref<HTMLDivElement | null>(null);
const settingsOpen = ref(false);
const notesOn = ref<boolean>(props.enableNotes ?? false);
const icdasOn = ref<boolean>(props.enableIcdas ?? false);
const pulpLevel = ref<PulpDetailLevel>(props.pulpDetailLevel ?? "aae");
const secondaryMode = ref<SecondaryCariesMode>(props.secondaryCariesMode ?? "standard");
const rootMode = ref<RootCariesMode>(props.rootCariesMode ?? "simple");
const radiographicMode = ref<RadiographicDepthMode>(props.radiographicDepthMode ?? "off");
const cariesDepthOn = ref<boolean>(props.cariesDepthEnabled ?? true);
const wearLevel = ref<ToothDetailLevel>(props.wearDetailLevel ?? "complex");
const discoLevel = ref<ToothDetailLevel>(props.discolorationDetailLevel ?? "complex");
const notation = ref<SurfaceNotation>(props.surfaceNotation ?? "full");
const toothInfoOn = ref<boolean>(true);
const showStatusCard = ref<boolean>(props.showStatusCard ?? true);
const showOrthoCard = ref<boolean>(props.showOrthoCard ?? true);
const summary = ref<OdontogramSummary | null>(null);
const exportOpen = ref(false);
const exportRef = ref<HTMLDivElement | null>(null);
const importOpen = ref(false);
const importRef = ref<HTMLDivElement | null>(null);

const internalDark = ref<boolean>(
  props.darkMode !== undefined
    ? props.darkMode
    : typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false,
);
const isDark = computed(() => (props.darkMode !== undefined ? props.darkMode : internalDark.value));

watch(isDark, (next) => {
  if (props.darkMode === undefined) {
    document.documentElement.classList.toggle("dark", next);
  }
}, { immediate: true });

function toggleDark() {
  if (props.darkMode !== undefined) {
    emit("darkModeChange", !props.darkMode);
    return;
  }
  const next = !internalDark.value;
  internalDark.value = next;
  document.documentElement.classList.toggle("dark", next);
  emit("darkModeChange", next);
}

function setNumbering(next: NumberingSystem) {
  if (props.numberingSystem) {
    emit("numberingChange", next);
    return;
  }
  internalNumbering.value = next;
  emit("numberingChange", next);
}

let stateUnsubscribe: (() => void) | undefined;

onMounted(() => {
  initOdontogram();
  document.addEventListener("click", clickOutsideHandler);
});

onUnmounted(() => {
  stateUnsubscribe?.();
  destroyOdontogram();
  document.removeEventListener("click", clickOutsideHandler);
});

function clickOutsideHandler(event: MouseEvent) {
  const target = event.target as Node;
  if (!languageRef.value?.contains(target)) languageOpen.value = false;
  if (!exportRef.value?.contains(target)) exportOpen.value = false;
  if (!importRef.value?.contains(target)) importOpen.value = false;
}

watch(currentNumbering, (v) => setNumberingSystem(v), { immediate: true });
watch(() => props.themeConfig, (v) => applyThemeConfig(themeRootRef.value, v), { immediate: true, deep: true });
watch(() => props.plugins, (v) => registerPlugins(v ?? []), { immediate: true, deep: true });
watch(() => props.readOnly, (v) => setReadOnly(v ?? false), { immediate: true });
watch(() => props.enableNotes, (v) => { setNotesEnabled(v ?? false); notesOn.value = v ?? false; }, { immediate: true });
watch(() => props.enableIcdas, (v) => { setIcdasEnabled(v ?? false); icdasOn.value = v ?? false; }, { immediate: true });
watch(() => props.pulpDetailLevel, (v) => { const x = v ?? "aae"; setPulpDetailLevel(x); pulpLevel.value = x; }, { immediate: true });
watch(() => props.secondaryCariesMode, (v) => { const x = v ?? "standard"; setSecondaryCariesMode(x); secondaryMode.value = x; }, { immediate: true });
watch(() => props.rootCariesMode, (v) => { const x = v ?? "simple"; setRootCariesMode(x); rootMode.value = x; }, { immediate: true });
watch(() => props.radiographicDepthMode, (v) => { const x = v ?? "off"; setRadiographicDepthMode(x); radiographicMode.value = x; }, { immediate: true });
watch(() => props.cariesDepthEnabled, (v) => { const x = v ?? true; setCariesDepthEnabled(x); cariesDepthOn.value = x; }, { immediate: true });
watch(() => props.wearDetailLevel, (v) => { const x = v ?? "complex"; setWearDetailLevel(x); wearLevel.value = x; }, { immediate: true });
watch(() => props.discolorationDetailLevel, (v) => { const x = v ?? "complex"; setDiscolorationDetailLevel(x); discoLevel.value = x; }, { immediate: true });
watch(() => props.surfaceNotation, (v) => { const x = v ?? "full"; setSurfaceNotation(x); notation.value = x; }, { immediate: true });
watch(() => props.showStatusCard, (v) => { showStatusCard.value = v ?? true; }, { immediate: true });
watch(() => props.showOrthoCard, (v) => { showOrthoCard.value = v ?? true; }, { immediate: true });

watch([toothInfoOn, lang, currentNumbering], () => {
  stateUnsubscribe?.();
  if (!toothInfoOn.value) return;
  const refresh = () => { summary.value = getOdontogramSummary(); };
  refresh();
  stateUnsubscribe = onStateChange(refresh);
}, { immediate: true });

const settingsState = computed<SettingsState>(() => ({
  numbering: currentNumbering.value,
  onNumbering: setNumbering,
  language: lang.value,
  onLanguage: setLang,
  isDark: isDark.value,
  onToggleDark: toggleDark,
  toothInfo: toothInfoOn.value,
  onToothInfo: (v) => { toothInfoOn.value = v; },
  secondaryCariesMode: secondaryMode.value,
  onSecondaryCariesMode: (v) => { secondaryMode.value = v; setSecondaryCariesMode(v); },
  icdas: icdasOn.value,
  onIcdas: (v) => { icdasOn.value = v; setIcdasEnabled(v); },
  cariesDepth: cariesDepthOn.value,
  onCariesDepth: (v) => { cariesDepthOn.value = v; setCariesDepthEnabled(v); },
  rootCariesMode: rootMode.value,
  onRootCariesMode: (v) => { rootMode.value = v; setRootCariesMode(v); },
  radiographicDepthMode: radiographicMode.value,
  onRadiographicDepthMode: (v) => { radiographicMode.value = v; setRadiographicDepthMode(v); },
  pulpLevel: pulpLevel.value,
  onPulpLevel: (v) => { pulpLevel.value = v; setPulpDetailLevel(v); },
  wearDetailLevel: wearLevel.value,
  onWearDetailLevel: (v) => { wearLevel.value = v; setWearDetailLevel(v); },
  discolorationDetailLevel: discoLevel.value,
  onDiscolorationDetailLevel: (v) => { discoLevel.value = v; setDiscolorationDetailLevel(v); },
  surfaceNotation: notation.value,
  onSurfaceNotation: (v) => { notation.value = v; setSurfaceNotation(v); },
  notes: notesOn.value,
  onNotes: (v) => { notesOn.value = v; setNotesEnabled(v); },
  showStatusCard: showStatusCard.value,
  onShowStatusCard: (v) => { showStatusCard.value = v; },
  showOrthoCard: showOrthoCard.value,
  onShowOrthoCard: (v) => { showOrthoCard.value = v; },
}));

function clickHidden(id: string) {
  (document.getElementById(id) as HTMLButtonElement | null)?.click();
}

function openSettingsModal() {
  settingsOpen.value = true;
}
</script>

<template>
  <div ref="themeRootRef" class="odontogram-root">
    <header class="topbar">
      <div class="brand">
        <div class="dot" />
        <div>
          <div class="title">{{ t('app.title') }}</div>
          <div class="subtitle">
            {{ `${t('app.subtitleLang')} ${t('app.subtitleNumbering.' + currentNumbering)} ${t(isDark ? 'app.subtitleMode.dark' : 'app.subtitleMode.light')}` }}
          </div>
        </div>
      </div>
      <div class="topbar-actions">
        <button class="btn-theme" :title="t('intro.start')" :aria-label="t('intro.start')" @click="startIntroTour()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
        </button>
        <div ref="languageRef" class="topbar-group dropdown">
          <button class="btn-theme" aria-haspopup="menu" :aria-expanded="languageOpen" :title="t('language.label')" :aria-label="t('language.label')" @click="languageOpen = !languageOpen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></svg>
          </button>
          <div v-if="languageOpen" class="dropdown-menu" role="menu" :aria-label="t('language.label')">
            <button
              v-for="opt in LANGUAGE_OPTIONS"
              :key="opt.value"
              class="dropdown-item"
              role="menuitemradio"
              :aria-checked="lang === opt.value"
              @click="setLang(opt.value); languageOpen = false"
            >
              {{ t(opt.labelKey) }}
            </button>
          </div>
        </div>
        <button class="btn-theme" :title="isDark ? t('theme.light') : t('theme.dark')" :aria-label="isDark ? t('theme.light') : t('theme.dark')" @click="toggleDark">
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </button>
        <div class="topbar-group">
          <button class="btn-theme" aria-haspopup="dialog" :aria-expanded="settingsOpen" :title="t('settings.title')" :aria-label="t('settings.title')" @click="openSettingsModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          </button>
        </div>
        <button id="btnStatusExport" hidden aria-hidden="true" tabindex="-1">{{ t('topbar.exportStatus') }}</button>
        <button id="btnStatusFhirExport" hidden aria-hidden="true" tabindex="-1">{{ t('topbar.exportFhir') }}</button>
        <button id="btnStatusPngExport" hidden aria-hidden="true" tabindex="-1">{{ t('topbar.exportPng') }}</button>
        <button id="btnStatusJpgExport" hidden aria-hidden="true" tabindex="-1">{{ t('topbar.exportJpg') }}</button>
        <button id="btnStatusSvgExport" hidden aria-hidden="true" tabindex="-1">{{ t('export.menu.svg') }}</button>
        <div ref="exportRef" class="topbar-group dropdown">
          <button id="btnExportMenu" class="btn-theme" aria-haspopup="menu" :aria-expanded="exportOpen" :title="t('topbar.export')" :aria-label="t('topbar.export')" @click="exportOpen = !exportOpen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
          </button>
          <div v-if="exportOpen" class="dropdown-menu" role="menu" :aria-label="t('topbar.export')">
            <button class="dropdown-item" role="menuitem" @click="clickHidden('btnStatusExport'); exportOpen = false">{{ t('export.menu.statusJson') }}</button>
            <button class="dropdown-item" role="menuitem" @click="clickHidden('btnStatusFhirExport'); exportOpen = false">{{ t('export.menu.fhir') }}</button>
            <button class="dropdown-item" role="menuitem" @click="clickHidden('btnStatusPngExport'); exportOpen = false">{{ t('export.menu.png') }}</button>
            <button class="dropdown-item" role="menuitem" @click="clickHidden('btnStatusJpgExport'); exportOpen = false">{{ t('export.menu.jpg') }}</button>
            <button class="dropdown-item" role="menuitem" @click="clickHidden('btnStatusSvgExport'); exportOpen = false">{{ t('export.menu.svg') }}</button>
          </div>
        </div>
        <button id="btnStatusImport" hidden aria-hidden="true" tabindex="-1">{{ t('topbar.importStatus') }}</button>
        <div ref="importRef" class="topbar-group dropdown">
          <button id="btnImportMenu" class="btn-theme" aria-haspopup="menu" :aria-expanded="importOpen" :title="t('topbar.import')" :aria-label="t('topbar.import')" @click="importOpen = !importOpen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 8l5-5 5 5M12 3v12" /></svg>
          </button>
          <div v-if="importOpen" class="dropdown-menu" role="menu" :aria-label="t('topbar.import')">
            <button class="dropdown-item" role="menuitem" @click="setImportFormat('status'); clickHidden('btnStatusImport'); importOpen = false">{{ t('import.menu.statusJson') }}</button>
            <button class="dropdown-item" role="menuitem" @click="setImportFormat('fhir'); clickHidden('btnStatusImport'); importOpen = false">{{ t('import.menu.fhir') }}</button>
          </div>
        </div>
        <input id="statusImportInput" type="file" accept="application/json" hidden />
      </div>
    </header>

    <main class="layout">
      <div class="chart-column">
        <section class="chart">
          <div class="chart-header">
            <div>
              <div class="chart-title">{{ t('chart.title') }}</div>
              <div class="chart-hint">{{ t('chart.hint') }}</div>
            </div>
            <div class="chart-actions">
              <button id="btnOcclView" class="btn btn-toggle btn-icon" aria-pressed="true" :title="t('chart.actions.occlusal')" :aria-label="t('chart.actions.occlusal')" :data-icon-src="iconOcclUrl" data-xline="1" />
              <button id="btnWisdomVisible" class="btn btn-toggle btn-icon" aria-pressed="true" :title="t('chart.actions.wisdom')" :aria-label="t('chart.actions.wisdom')" :data-icon-src="icon8Url" data-xline="1" />
              <button id="btnBoneVisible" class="btn btn-toggle btn-icon" aria-pressed="true" :title="t('chart.actions.bone')" :aria-label="t('chart.actions.bone')" :data-icon-src="iconGumUrl" data-xline="1" />
              <button id="btnPulpVisible" class="btn btn-toggle btn-icon" aria-pressed="true" :title="t('chart.actions.pulp')" :aria-label="t('chart.actions.pulp')" :data-icon-src="iconPulpUrl" data-xline="1" />
              <button id="btnSelectNoneChart" class="btn btn-ghost btn-icon" :title="t('chart.actions.clearSelection')" :aria-label="t('chart.actions.clearSelection')">
                <img class="icon-img" :src="iconNoSelectionUrl" alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div id="toothGrid" class="tooth-grid" :aria-label="t('chart.aria.toothGrid')" />
        </section>
        <section v-if="toothInfoOn && summary" class="tooth-info card" :aria-label="t('toothInfo.title')">
          <div class="card-title">{{ t('toothInfo.title') }}</div>
          <p class="tooth-info-overview">{{ summary.overview }}</p>
          <p v-if="summary.permanentList" class="tooth-info-list">{{ summary.permanentList }}</p>
          <p v-if="summary.missingList" class="tooth-info-list">{{ summary.missingList }}</p>
          <p v-for="sec in summary.sections" :key="sec.key" class="tooth-info-line">
            <span class="tooth-info-heading">{{ sec.heading }}:</span>
            <template v-if="sec.items.length">{{ sec.items.join(', ') }}</template>
            <span v-else class="tooth-info-empty">{{ sec.emptyText }}</span>
          </p>
          <p v-if="summary.implants" class="tooth-info-line">
            <span class="tooth-info-heading">{{ summary.implants.heading }}:</span>
            {{ summary.implants.text }}
          </p>
          <p class="tooth-info-line">
            <span class="tooth-info-heading">{{ summary.periodontalTitle }}:</span>
            {{ summary.periodontalText }}
          </p>
        </section>
      </div>
      <aside class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title-row">
              <span class="panel-title">{{ t('panel.controls') }}</span>
              <div class="panel-title-actions">
                <button id="btnSelectNone" class="btn btn-ghost btn-icon btn-danger" :title="t('panel.clearSelection')" :aria-label="t('panel.clearSelection')">{{ t('panel.clearSelection') }}</button>
                <button id="btnToggleControlsCard" class="icon-btn" :title="t('actions.collapse', { label: t('panel.controls') })" :aria-label="t('actions.collapse', { label: t('panel.controls') })">
                  <span class="toggle-icon" aria-hidden="true">-</span>
                </button>
              </div>
            </div>
            <div class="panel-subtitle">{{ t('panel.activeTooth') }}: <span id="activeToothLabel" class="pill">{{ t('selection.none') }}</span></div>
            <div id="controlsActions" class="panel-subtitle select-actions">
              <div class="select-actions-row">
                <button id="btnSelectAll" class="btn btn-ghost btn-icon" :title="t('panel.selectActions.all')">{{ t('panel.selectActions.all') }}</button>
                <button id="btnSelectAllPresent" class="btn btn-ghost btn-icon fade-toggle" :title="t('panel.selectActions.present')">{{ t('panel.selectActions.present') }}</button>
                <button id="btnSelectPermanent" class="btn btn-ghost btn-icon fade-toggle" :title="t('panel.selectActions.permanent')">{{ t('panel.selectActions.permanent') }}</button>
                <button id="btnSelectMilk" class="btn btn-ghost btn-icon fade-toggle" :title="t('panel.selectActions.milk')">{{ t('panel.selectActions.milk') }}</button>
                <button id="btnSelectImplants" class="btn btn-ghost btn-icon fade-toggle" :title="t('panel.selectActions.implants')">{{ t('panel.selectActions.implants') }}</button>
                <button id="btnSelectAllMissing" class="btn btn-ghost btn-icon fade-toggle" :title="t('panel.selectActions.missing')">{{ t('panel.selectActions.missing') }}</button>
              </div>
              <div class="select-actions-row">
                <button id="btnSelectUpper" class="btn btn-ghost btn-icon" :title="t('panel.selectActions.upper')">{{ t('panel.selectActions.upper') }}</button>
                <button id="btnSelectUpperFront" class="btn btn-ghost btn-icon" :title="t('panel.selectActions.upperFront')">{{ t('panel.selectActions.upperFront') }}</button>
                <button id="btnSelectUpperMolar" class="btn btn-ghost btn-icon" :title="t('panel.selectActions.upperMolar')">{{ t('panel.selectActions.upperMolar') }}</button>
                <button id="btnSelectLower" class="btn btn-ghost btn-icon" :title="t('panel.selectActions.lower')">{{ t('panel.selectActions.lower') }}</button>
                <button id="btnSelectLowerFront" class="btn btn-ghost btn-icon" :title="t('panel.selectActions.lowerFront')">{{ t('panel.selectActions.lowerFront') }}</button>
                <button id="btnSelectLowerMolar" class="btn btn-ghost btn-icon" :title="t('panel.selectActions.lowerMolar')">{{ t('panel.selectActions.lowerMolar') }}</button>
              </div>
            </div>
          </div>
          <div id="warnings" class="warnings" />
        </div>

       
          <div :class="showStatusCard ? '' : 'hidden'">
            <section id="statusCard" class="card collapsed">
              <div class="card-title card-title-row">
                <span>{{ t('status.title') }}</span>
                <button id="btnToggleStatusCard" class="icon-btn" :title="t('actions.collapse', { label: t('status.title') })" :aria-label="t('actions.collapse', { label: t('status.title') })">
                  <span class="toggle-icon" aria-hidden="true">+</span>
                </button>
              </div>
              <div id="statusCardBody" class="row status-actions">
                <button id="btnResetAll" class="btn btn-ghost btn-sm">{{ t('status.resetAll') }}</button>
                <button id="btnPrimaryDentition" class="btn btn-ghost btn-sm">{{ t('status.primaryDentition') }}</button>
                <button id="btnMixedDentition" class="btn btn-ghost btn-sm">{{ t('status.mixedDentition') }}</button>
                <button id="btnEdentulous" class="btn btn-toggle btn-sm" aria-pressed="false">{{ t('status.edentulous') }}</button>
              </div>
              <div class="row status-extra-row">
                <span>{{ t('status.extraLabel') }}</span>
                <select id="statusExtraSelect" />
                <button id="statusExtraApply" class="btn btn-ghost btn-sm">{{ t('status.extraApply') }}</button>
              </div>
            </section>
          </div>

          <section class="card collapsed">

            <div class="card-title card-title-row">
    <span>{{ t('tooth.title') }}</span>
    <div style="display:flex; align-items:center; gap:8px;">
      <button id="btnResetTooth" class="btn btn-ghost btn-sm" :title="t('tooth.resetTitle')" :aria-label="t('tooth.resetTitle')">{{ t('tooth.reset') }}</button>
      <button id="btnToggleToothCard" class="icon-btn" :title="t('actions.collapse', { label: t('tooth.title') })" :aria-label="t('actions.collapse', { label: t('tooth.title') })">
        <span class="toggle-icon" aria-hidden="true">+</span>
      </button>
    </div>
  </div>
            <div class="row">
              <span>{{ t('tooth.baseLabel') }}</span>
              <select id="toothSelect" />
            </div>
            <div id="substrateRow" class="row">
              <span>{{ t('substrate.label') }}</span>
              <select id="substrateSelect" />
            </div>
            <label id="extractionRow" class="row">
              <input id="extractionWound" type="checkbox" />
              <span>{{ t('tooth.extractionWound') }}</span>
            </label>
            <label id="missingClosedRow" class="row">
              <input id="missingClosed" type="checkbox" />
              <span>{{ t('tooth.missingClosed') }}</span>
            </label>
            <div id="restorationRow" class="row">
              <span>{{ t('restoration.label') }}</span>
              <select id="restorationSelect" />
            </div>
            <label id="crownLeakageRow" class="row hidden">
              <input id="crownLeakage" type="checkbox" />
              <span>{{ t('crownLeakage.label') }}</span>
            </label>
            <div id="brokenCrownRow" class="row inline-checks contact-row">
              <label><input id="brokenMesial" type="checkbox" /><span>{{ t('tooth.broken.mesial') }}</span></label>
              <label><input id="brokenIncisal" type="checkbox" /><span>{{ t('tooth.broken.incisal') }}</span></label>
              <label><input id="brokenDistal" type="checkbox" /><span>{{ t('tooth.broken.distal') }}</span></label>
            </div>
            <div id="contactPointRow" class="row inline-checks contact-row">
              <label><input id="contactMesial" type="checkbox" /><span>{{ t('tooth.contact.mesialMissing') }}</span></label>
              <label><input id="contactDistal" type="checkbox" /><span>{{ t('tooth.contact.distalMissing') }}</span></label>
            </div>
            <div id="bruxismRow" class="inline-checks bruxism-row wear-stack">
              <div id="wearEdgeRow" class="row">
                <label id="wearEdgeSelectLabel"><span>{{ t('tooth.bruxism.edgeWear') }}</span><select id="wearEdgeSelect" /></label>
                <label id="wearEdgeToggleLabel" class="inline-check hidden"><input id="wearEdgeToggle" type="checkbox" /><span>{{ t('tooth.bruxism.edgeWear') }}</span></label>
              </div>
              <div id="wearCervicalRow" class="row">
                <label id="wearCervicalSelectLabel"><span>{{ t('tooth.bruxism.neckWear') }}</span><select id="wearCervicalSelect" /></label>
                <label id="wearCervicalToggleLabel" class="inline-check hidden"><input id="wearCervicalToggle" type="checkbox" /><span>{{ t('tooth.bruxism.neckWear') }}</span></label>
              </div>
            </div>
            <div id="discolorationRow" class="row inline-checks">
              <label id="discolorationSelectLabel"><span>{{ t('discoloration.label') }}</span><select id="discolorationSelect" /></label>
              <label id="discolorationToggleLabel" class="inline-check hidden"><input id="discolorationToggle" type="checkbox" /><span>{{ t('discoloration.label') }}</span></label>
            </div>
            <div id="crownActionsRow" class="row inline-checks bridge-actions-row">
              <label id="bridgePillarRow" class="inline-check"><input id="bridgePillar" type="checkbox" /><span>{{ t('tooth.bridgePillar') }}</span></label>
              <label id="extractionPlanRow" class="inline-check"><input id="extractionPlan" type="checkbox" /><span>{{ t('tooth.extractionPlan') }}</span></label>
            </div>
            <label id="crownReplaceRow" class="row"><input id="crownReplace" type="checkbox" /><span>{{ t('tooth.crownReplace') }}</span></label>
            <label id="crownNeededRow" class="row"><input id="crownNeeded" type="checkbox" /><span>{{ t('tooth.crownNeeded') }}</span></label>
          </section>

          <div :class="showOrthoCard ? '' : 'hidden'">
            <section id="orthoCard" class="card collapsed">
              <div class="card-title card-title-row"><span>{{ t('toothInfo.orthodontics') }}</span>
                <button id="btnToggleOrthoCard" class="icon-btn" :title="t('actions.collapse', { label: t('toothInfo.orthodontics') })" :aria-label="t('actions.collapse', { label: t('toothInfo.orthodontics') })">
      <span class="toggle-icon" aria-hidden="true">+</span>
    </button></div>
              <div id="orthoApplianceRow" class="row"><span>{{ t('ortho.appliance.label') }}</span><select id="orthoApplianceSelect" /></div>
              <div id="orthoDriftRow" class="row"><span>{{ t('ortho.drift.label') }}</span><select id="orthoDriftSelect" /></div>
              <div id="orthoVerticalRow" class="row"><span>{{ t('ortho.vertical.label') }}</span><select id="orthoVerticalSelect" /></div>
              <label id="orthoRotationRow" class="row inline-check"><input id="orthoRotationToggle" type="checkbox" /><span>{{ t('ortho.rotation.label') }}</span></label>

            </section>
          </div>

          <section id="cariesSection" class="card collapsed">
            <div class="card-title card-title-row">
              <span>{{ t('caries.title') }}</span>
              <button id="btnToggleCariesCard" class="icon-btn" :title="t('actions.collapse', { label: t('caries.title') })" :aria-label="t('actions.collapse', { label: t('caries.title') })">
                <span class="toggle-icon" aria-hidden="true">+</span>
              </button>
            </div>
            <div class="hint">{{ t('caries.hint') }}</div>
            <div id="cariesDepthRow" class="row"><span>{{ t('caries.depthLabel') }}</span><select id="cariesDepthSelect" /></div>
            <div id="cariesChecks" />
            <div id="cariesSubcrownRow" class="check-grid subcrown-row" />
            <div id="rootCariesRow" class="row"><span>{{ t('caries.rootLabel') }}</span><select id="rootCariesSelect" /></div>
          </section>

          <section id="fillingSection" class="card collapsed">
            <div class="card-title card-title-row">
              <span>{{ t('filling.title') }}</span>
              <button id="btnToggleFillingCard" class="icon-btn" :title="t('actions.collapse', { label: t('filling.title') })" :aria-label="t('actions.collapse', { label: t('filling.title') })">
                <span class="toggle-icon" aria-hidden="true">+</span>
              </button>
            </div>
            <div class="row"><span>{{ t('filling.typeLabel') }}</span><select id="fillingSelect" /></div>
            <div id="fillingSurfaceChecks" class="hidden" />
            <label id="fissureSealingRow" class="row fissure-row"><input id="fissureSealing" type="checkbox" /><span>{{ t('filling.fissureSealing') }}</span></label>
            <div id="fillingSubcariesSummary" class="hint hidden" />
            <div id="fillingDefectSummary" class="hint hidden" />
          </section>

          <section id="rootPeriodontiumSection" class="card collapsed">
            <div class="card-title card-title-row">
              <span>{{ t('card.rootPeriodontium') }}</span>
              <button id="btnToggleRootPeriodontiumCard" class="icon-btn" :title="t('actions.collapse', { label: t('card.rootPeriodontium') })" :aria-label="t('actions.collapse', { label: t('card.rootPeriodontium') })">
                <span class="toggle-icon" aria-hidden="true">+</span>
              </button>
            </div>
            <div id="rpRootBlock">
              <div class="hint">{{ t('endo.hint') }}</div>
              <div id="pulpEndoRow" class="row"><span>{{ t('pulpEndo.label') }}</span><select id="pulpEndoSelect" /></div>
              <div id="apicalDxRow" class="row"><span>{{ t('apical.dxLabel') }}</span><select id="apicalDxSelect" /></div>
              <div id="periapicalTypeRow" class="row hidden"><span>{{ t('periapical.typeLabel') }}</span><select id="periapicalTypeSelect" /></div>
              <div id="resorptionRow" class="row"><span>{{ t('root.resorption') }}</span><select id="resorptionSelect" /></div>
              <div class="row inline-checks">
                <label><input id="endoResection" type="checkbox" /><span>{{ t('endo.resection') }}</span></label>
                <label><input id="parapulpalPin" type="checkbox" /><span>{{ t('endo.parapulpalPin') }}</span></label>
              </div>
            </div>
            <div id="rpPerioBlock">
              <div id="mobilityRow" class="row"><span>{{ t('inflammation.mobilityLabel') }}</span><select id="mobilitySelect" /></div>
              <div id="modsChecks" class="check-grid" />
              <div id="calculusRow" class="row inline-checks hidden"><label><input id="calculusToggle" type="checkbox" /><span>{{ t('calculus.label') }}</span></label></div>
              <div id="periImplantRow" class="row hidden"><span>{{ t('periImplant.label') }}</span><select id="periImplantSelect" /></div>
            </div>
          </section>
        
      </aside>
    </main>

    <SettingsModal
      :open="settingsOpen"
      :t="t"
      :settings="settingsState"
      @close="settingsOpen = false"
    />
  </div>
</template>
