<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef, watch } from "vue";
import {
  destroyOdontogram,
  initOdontogram,
  setNumberingSystem,
  registerPlugins,
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
  onSelectionChange,
  setSelectedTeeth as setOdonSelectedTeeth,
  clearSelection as clearOdonSelection,
  getSelectedTeeth,
} from "./odontogram";
import type {
  PulpDetailLevel,
  SecondaryCariesMode,
  RootCariesMode,
  RadiographicDepthMode,
  ToothDetailLevel,
  SurfaceNotation,
} from "./odontogram";
import { useI18n } from "./i18n/useI18n";
import SettingsModal from "./SettingsModal.vue";
import type { SettingsState } from "./settingsModal";
import type { Language } from "./i18n/translations";
import type { NumberingSystem } from "./utils/numbering";
import { applyThemeConfig, type OdontogramThemeConfig } from "./theme";
import type { OdontogramPlugin } from "./plugin";
import TreatmentTabs from "./treatment/TreatmentTabs.vue";
import { recomputeToothState } from "./treatment/applyTreatment";

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
    patientId?: string;
  }>(),
  {
    language: "fa",
    numberingSystem: "FDI",
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
    patientId: "p1",
  },
);

const emit = defineEmits<{
  languageChange: [lang: Language];
  numberingChange: [system: NumberingSystem];
  darkModeChange: [dark: boolean];
}>();

const languageProp = toRef(props, "language");
const { lang, setLang, t: tComputed } = useI18n({
  language: languageProp,
  onLanguageChange: (l) => emit("languageChange", l),
});
const t = (key: string, params?: Record<string, string | number>) =>
  tComputed.value(key, params);

const themeRootRef = ref<HTMLDivElement | null>(null);
const settingsOpen = ref(false);
const internalNumbering = ref<NumberingSystem>(props.numberingSystem ?? "FDI");
const currentNumbering = computed(
  () => props.numberingSystem ?? internalNumbering.value,
);
const internalDark = ref<boolean>(
  props.darkMode !== undefined
    ? props.darkMode
    : typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false,
);
const isDark = computed(() =>
  props.darkMode !== undefined ? props.darkMode : internalDark.value,
);

const notesOn = ref<boolean>(props.enableNotes ?? false);
const icdasOn = ref<boolean>(props.enableIcdas ?? false);
const pulpLevel = ref<PulpDetailLevel>(props.pulpDetailLevel ?? "aae");
const secondaryMode = ref<SecondaryCariesMode>(
  props.secondaryCariesMode ?? "standard",
);
const rootMode = ref<RootCariesMode>(props.rootCariesMode ?? "simple");
const radiographicMode = ref<RadiographicDepthMode>(
  props.radiographicDepthMode ?? "off",
);
const cariesDepthOn = ref<boolean>(props.cariesDepthEnabled ?? true);
const wearLevel = ref<ToothDetailLevel>(props.wearDetailLevel ?? "complex");
const discoLevel = ref<ToothDetailLevel>(
  props.discolorationDetailLevel ?? "complex",
);
const notation = ref<SurfaceNotation>(props.surfaceNotation ?? "full");
const toothInfoOn = ref<boolean>(true);

const patientId = ref<string>(props.patientId);

const PATIENTS = [
  { id: "p1", name: "علی رضایی" },
  { id: "p2", name: "مریم احمدی" },
  { id: "p3", name: "رضا کریمی" },
];

const selectedTeeth = ref<number[]>([]);

function selectAll() {
  setOdonSelectedTeeth([
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
  ]);
}

function selectUpper() {
  setOdonSelectedTeeth([
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  ]);
}

function selectLower() {
  setOdonSelectedTeeth([
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
  ]);
}

function clearSelection() {
  clearOdonSelection();
}

let stateUnsubscribe: (() => void) | undefined;
let selectionUnsubscribe: (() => void) | undefined;

onMounted(async () => {
  await initOdontogram();

  stateUnsubscribe = onStateChange(() => {
    const current = getSelectedTeeth();
    selectedTeeth.value = current;
  });

  selectionUnsubscribe = onSelectionChange((teeth) => {
    selectedTeeth.value = teeth;
    for (const toothNo of teeth) {
      recomputeToothState(patientId.value, toothNo);
    }
  });
});

onUnmounted(() => {
  stateUnsubscribe?.();
  selectionUnsubscribe?.();
  destroyOdontogram();
});

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
  setNumberingSystem(next);
}

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
  showStatusCard: props.showStatusCard,
  onShowStatusCard: () => {},
  showOrthoCard: props.showOrthoCard,
  onShowOrthoCard: () => {},
}));

watch(isDark, (next) => {
  if (props.darkMode === undefined) {
    document.documentElement.classList.toggle("dark", next);
  }
}, { immediate: true });

watch(currentNumbering, (v) => setNumberingSystem(v), { immediate: true });
watch(() => props.themeConfig, (v) => applyThemeConfig(themeRootRef.value, v), { immediate: true, deep: true });
watch(() => props.plugins, (v) => registerPlugins(v ?? []), { immediate: true, deep: true });
watch(() => props.readOnly, (v) => setReadOnly(v ?? false), { immediate: true });
</script>

<template>
  <div ref="themeRootRef" class="dental-app" dir="rtl">
    <header class="topbar">
      <div class="brand">
        <span class="logo">🦷</span>
        <div>
          <div class="title">ثبت درمان</div>
          <div class="subtitle">دندان‌پزشکی</div>
        </div>
      </div>

      <div class="topbar-actions">
        <select v-model="patientId" class="patient-select" title="بیمار">
          <option v-for="p in PATIENTS" :key="p.id" :value="p.id">
            {{ p.name }}
          </option>
        </select>

        <button class="btn-theme" @click="settingsOpen = true" title="تنظیمات">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <button class="btn-theme" @click="toggleDark" title="تغییر تم">
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </button>
      </div>
    </header>

    <main class="main-grid">
      <section class="panel filter-panel">
        <div class="panel-head">
          <h3>انتخاب دندان</h3>
          <div class="selected-info">
            <span v-if="selectedTeeth.length === 0">—</span>
            <span v-else-if="selectedTeeth.length === 1">
              دندون {{ selectedTeeth[0] }}
            </span>
            <span v-else>{{ selectedTeeth.length }} دندون</span>
          </div>
        </div>

        <div class="filter-buttons">
          <button @click="selectAll" :class="{ active: selectedTeeth.length === 32 }">
            همه
          </button>
          <button @click="selectUpper">فک بالا</button>
          <button @click="selectLower">فک پایین</button>
          <button @click="clearSelection">پاک کردن</button>
        </div>

        <div id="toothGrid" class="tooth-grid"></div>
      </section>

      <section class="panel treatment-panel-wrapper">
        <TreatmentTabs :patient-id="patientId" />
      </section>
    </main>

    <div style="display: none" aria-hidden="true">
      <select id="toothSelect"></select>
      <select id="substrateSelect"></select>
      <select id="restorationSelect"></select>
      <select id="pulpEndoSelect"></select>
      <select id="apicalDxSelect"></select>
      <select id="resorptionSelect"></select>
      <select id="periImplantSelect"></select>
      <div id="mobilityRow"><select id="mobilitySelect"></select></div>
      <select id="periapicalTypeSelect"></select>
      <select id="cariesDepthSelect"></select>
      <select id="rootCariesSelect"></select>
      <select id="fillingSelect"></select>
      <select id="wearEdgeSelect"></select>
      <select id="wearCervicalSelect"></select>
      <select id="discolorationSelect"></select>
      <select id="orthoApplianceSelect"></select>
      <select id="orthoDriftSelect"></select>
      <select id="orthoVerticalSelect"></select>
      <select id="statusExtraSelect"></select>

      <label id="wearEdgeSelectLabel"></label>
      <label id="wearEdgeToggleLabel"></label>
      <label id="wearCervicalSelectLabel"></label>
      <label id="wearCervicalToggleLabel"></label>
      <label id="discolorationSelectLabel"></label>
      <label id="discolorationToggleLabel"></label>

      <div id="cariesChecks"></div>
      <div id="cariesSubcrownRow"></div>
      <div id="fillingSurfaceChecks"></div>
      <div id="modsChecks"></div>
      <div id="periapicalTypeRow"></div>
      <div id="cariesDepthRow"></div>
      <div id="rootCariesRow"></div>
      <div id="fissureSealingRow"></div>
      <div id="calculusRow"></div>
      <div id="periImplantRow"></div>
      <div id="rpRootBlock"></div>
      <div id="rpPerioBlock"></div>
      <div id="rootPeriodontiumSection"></div>
      <div id="cariesSection"></div>
      <div id="fillingSection"></div>
      <div id="toothCard"></div>
      <div id="statusCard"></div>
      <div id="orthoCard"></div>
      <div id="substrateRow"></div>
      <div id="restorationRow"></div>
      <div id="crownLeakageRow"></div>
      <div id="brokenCrownRow"></div>
      <div id="contactPointRow"></div>
      <div id="bruxismRow"></div>
      <div id="discolorationRow"></div>
      <div id="crownActionsRow"></div>
      <div id="extractionRow"></div>
      <div id="missingClosedRow"></div>
      <div id="crownReplaceRow"></div>
      <div id="crownNeededRow"></div>
      <div id="extractionPlanRow"></div>
      <div id="bridgePillarRow"></div>
      <div id="fillingSubcariesSummary"></div>
      <div id="fillingDefectSummary"></div>
      <div id="warnings"></div>
      <div id="controlsActions"></div>

      <span id="activeToothLabel"></span>

      <input id="endoResection" type="checkbox" />
      <input id="parapulpalPin" type="checkbox" />
      <input id="extractionWound" type="checkbox" />
      <input id="extractionPlan" type="checkbox" />
      <input id="crownReplace" type="checkbox" />
      <input id="crownNeeded" type="checkbox" />
      <input id="crownLeakage" type="checkbox" />
      <input id="missingClosed" type="checkbox" />
      <input id="fissureSealing" type="checkbox" />
      <input id="calculusToggle" type="checkbox" />
      <input id="contactMesial" type="checkbox" />
      <input id="contactDistal" type="checkbox" />
      <input id="wearEdgeToggle" type="checkbox" />
      <input id="wearCervicalToggle" type="checkbox" />
      <input id="discolorationToggle" type="checkbox" />
      <input id="orthoRotationToggle" type="checkbox" />
      <input id="bridgePillar" type="checkbox" />
      <input id="brokenMesial" type="checkbox" />
      <input id="brokenIncisal" type="checkbox" />
      <input id="brokenDistal" type="checkbox" />
      <input id="statusImportInput" type="file" />

      <button id="btnResetTooth"></button>
      <button id="btnResetAll"></button>
      <button id="btnPrimaryDentition"></button>
      <button id="btnMixedDentition"></button>
      <button id="btnEdentulous"></button>
      <button id="btnSelectAll"></button>
      <button id="btnSelectAllPresent"></button>
      <button id="btnSelectPermanent"></button>
      <button id="btnSelectMilk"></button>
      <button id="btnSelectImplants"></button>
      <button id="btnSelectAllMissing"></button>
      <button id="btnSelectUpper"></button>
      <button id="btnSelectUpperFront"></button>
      <button id="btnSelectUpperMolar"></button>
      <button id="btnSelectLower"></button>
      <button id="btnSelectLowerFront"></button>
      <button id="btnSelectLowerMolar"></button>
      <button id="btnSelectNone"></button>
      <button id="btnSelectNoneChart"></button>
      <button id="btnOcclView"></button>
      <button id="btnWisdomVisible"></button>
      <button id="btnBoneVisible"></button>
      <button id="btnPulpVisible"></button>
      <button id="btnStatusExport"></button>
      <button id="btnStatusFhirExport"></button>
      <button id="btnStatusPngExport"></button>
      <button id="btnStatusJpgExport"></button>
      <button id="btnStatusSvgExport"></button>
      <button id="btnStatusImport"></button>
      <button id="statusExtraApply"></button>

      <button id="btnToggleControlsCard"></button>
      <button id="btnToggleStatusCard"></button>
      <button id="btnToggleToothCard"></button>
      <button id="btnToggleOrthoCard"></button>
      <button id="btnToggleCariesCard"></button>
      <button id="btnToggleFillingCard"></button>
      <button id="btnToggleRootPeriodontiumCard"></button>
    </div>

    <SettingsModal
      :open="settingsOpen"
      :t="t"
      :settings="settingsState"
      @close="settingsOpen = false"
    />
  </div>
</template>

<style scoped>
.dental-app {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo { font-size: 28px; }
.title { font-weight: 600; font-size: 16px; }
.subtitle { font-size: 12px; color: #888; }

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.patient-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
  background: #fff;
  cursor: pointer;
}

.btn-theme {
  padding: 8px;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-theme:hover {
  background: #f3f4f6;
  border-color: #93c5fd;
}

.main-grid {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(400px, 0.9fr);
  gap: 12px;
  padding: 12px;
  overflow: hidden;
  min-height: 0;
}

.panel {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.filter-panel {
  grid-column: 1;
  overflow: hidden;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-head h3 {
  margin: 0;
  font-size: 14px;
}

.selected-info {
  font-size: 12px;
  color: #2563eb;
  padding: 4px 10px;
  background: #eff6ff;
  border-radius: 6px;
  font-weight: 500;
}

.filter-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.filter-buttons button {
  padding: 8px 14px;
  border: 1px solid #e5e5e5;
  background: #f9f9f9;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  transition: all 0.15s;
}

.filter-buttons button:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}

.filter-buttons button.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.treatment-panel-wrapper {
  grid-column: 2;
  padding: 12px;
  overflow: hidden;
}

/* ⭐ فقط این یک خط */
#toothGrid {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin-top: 8px;
}

@media (max-width: 900px) {
  .main-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    overflow: auto;
  }
  .filter-panel,
  .treatment-panel-wrapper {
    grid-column: 1;
    grid-row: auto;
    min-height: 400px;
  }
}
</style>