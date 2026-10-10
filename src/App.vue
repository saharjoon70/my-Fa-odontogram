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
import { getRecordsForPatient } from "./treatment/treatmentStore";
import type { TreatmentRecord } from "./treatment/treatmentStore";

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

// ⭐ لیست درمان‌های دندان‌های انتخاب‌شده
const selectedTreatments = computed(() => {
  const all: TreatmentRecord[] = [];
  for (const toothNo of selectedTeeth.value) {
    const records = getRecordsForPatient(patientId.value).filter(
      (r): r is TreatmentRecord =>
        r.kind === "treatment" && r.toothNo === toothNo,
    );
    all.push(...records);
  }
  return all.sort((a, b) => b.date.localeCompare(a.date));
});

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR");
  } catch {
    return iso;
  }
}

function formatPrice(n: number): string {
  return n.toLocaleString("fa-IR") + " ت";
}

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

function resetAll() {
  const btn = document.getElementById("btnResetAll");
  if (btn) (btn as HTMLButtonElement).click();
  clearSelection();
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

          <div class="filter-buttons">
            <button @click="selectAll" :class="{ active: selectedTeeth.length === 32 }">
              همه
            </button>
            <button @click="selectUpper">فک بالا</button>
            <button @click="selectLower">فک پایین</button>
            <button @click="resetAll" class="btn-reset">بازنشانی</button>
            <button id="btnPrimaryDentition" type="button" title="دندان‌های شیری">
              شیری
            </button>
            <button id="btnMixedDentition" type="button" title="دندان مختلط">
              مختلط
            </button>
            <button id="btnEdentulous" type="button" title="بی‌دندانی" aria-pressed="false">
              بی‌دندانی
            </button>
          </div>

          <div class="chart-actions">
            <button
              id="btnOcclView"
              class="btn btn-toggle btn-icon"
              aria-pressed="true"
              title="نمای اکلوزال"
              aria-label="نمای اکلوزال"
              data-icon-src="data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'?%3e%3csvg%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%20viewBox='0%200%20256%20256'%3e%3c!--%20Created%20by%20Zoltan%20Dul%20in%202026%20-%20free%20to%20use%20with%20MIT%20license.%20SVG%20Version:%202.1.1%20--%3e%3cpath%20id='tooth-occlusal'%20d='M107.9,27.1c11.6,0,24.9,1.7,37,2.8,8.3,0,17.1,1.1,24.9,3.9,5,1.7,9.4,3.3,14.4,5.5,7.7,3.3,15.5,7.7,21.6,14.4,6.1,6.1,11.1,13.3,13.3,21.6,1.1,3.3,1.7,7.2,2.8,11.1,1.7,9.4,2.8,17.7,2.8,26.5s0,13.3-1.1,19.9c0,8.8-1.1,17.1-2.8,25.4-2.8,11.1-5.5,23.2-11.1,33.2-7.7,13.3-22.7,21-37,24.3-5.5,1.1-11.6,2.2-17.1,3.3-8.3,1.7-16.6,4.4-24.9,6.6-7.2,1.7-14.4,1.1-21,0-6.1,0-12.2-1.7-18.2-1.7-10.5-1.1-21.6-1.7-30.4-7.7-7.2-5-12.7-12.2-17.1-19.9-5.5-8.3-9.4-17.7-11.1-27.6-1.7-7.2-1.1-14.9-1.1-22.1s2.8-19.4,3.9-29.3c2.2-11.6,2.8-23.8,5.5-35.4,2.8-11.6,8.3-22.1,15.5-31,7.7-8.8,18.2-16.6,29.3-19.9,7.2-1.7,14.9-2.8,22.1-2.8h0v-1.1h-.2Z'%20style='fill:%20%23fff;%20stroke:%20%23000;%20stroke-miterlimit:%2010;%20stroke-width:%208px;'/%3e%3cg%20id='x-line'%20style='display:%20none;'%3e%3cline%20id='line-2'%20x1='16.7'%20y1='15.6'%20x2='225.3'%20y2='224.2'%20style='fill:%20none;%20stroke:%20%23ef4444;%20stroke-linecap:%20round;%20stroke-width:%2014px;'/%3e%3cline%20id='line-1'%20x1='16.7'%20y1='15.6'%20x2='225.3'%20y2='224.2'%20style='fill:%20none;%20isolation:%20isolate;%20opacity:%20.2;%20stroke:%20%23111827;%20stroke-linecap:%20round;%20stroke-width:%203px;'/%3e%3c/g%3e%3c/svg%3e"
              data-xline="1"
            ></button>

            <button
              id="btnWisdomVisible"
              class="btn btn-toggle btn-icon"
              aria-pressed="true"
              title="دندان عقل"
              aria-label="دندان عقل"
              data-icon-src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij4KICA8IS0tIENyZWF0ZWQgYnkgWm9sdGFuIER1bCBpbiAyMDI2IC0gZnJlZSB0byB1c2Ugd2l0aCBNSVQgbGljZW5zZS4gU1ZHIFZlcnNpb246IDIuMS4xIC0tPgogIDxwYXRoIGlkPSJ0b290aC1iYXNlIiBkPSJNMTI1LjgsMTQ5Yy03LjMtMi0xMS44LDE0LjYtMTQuMiwyMC40LTEuNiw0LjQtMy4xLDguMy00LjMsMTIuNy00LjQsMTYuMS0xLjYsMzQuMy02LjgsNTAuMy0zLjUsMTIuNy0xNS4zLDE0LjQtMjEuMiwyLjItMi45LTYuMS0zLjktMTIuOS00LjgtMTkuNi0xLTcuNy0uOC0xNS42LjctMjMuMSwxLjgtMTEuNCw3LjUtMjIsNy41LTMzLjgsMC0xNy4yLTMtMzIuNy02LjctNDkuMi04LjQtMjkuMy0yNy40LTc5LjYsMTMuMi05My45LDEyLjMtNC45LDI1LDMuMywzNy41LDMsMS43LDAsMy40LS4yLDUuMS0uNCwxMi45LTIuMSwyNy43LTkuNiw0MS01LjMsMjIuNSw3LjQsMjAuNiwzOS4xLDE2LjYsNTguNS0xLDQuOC0yLjMsOS40LTMuNiwxMy4yLTIuMiw2LjItNS4zLDEyLjItNi43LDE5LjEtMS45LDguNC0yLjksMTYuOC0zLjcsMjUtMS41LDE1LjUuMywzMC40LjUsNDUuMSwwLDguNy0uNCwxNy44LTEuMiwyNi4zLS44LDguMy0yLjUsMTYuNy00LjUsMjQuOS0xLjcsNy44LTUuNiwxOC45LTE0LjEsMjAuNS0xNC44LjctMTEuOS0zOC44LTE0LjMtNDguOS0xLjgtMTAuMS02LjgtNDIuMy0xNS45LTQ3LjRoMHYuNFoiIHN0eWxlPSJmaWxsOiAjZmZmOyBzdHJva2U6ICMwMDA7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiA4cHg7Ii8+CiAgPGcgc3R5bGU9Imlzb2xhdGlvbjogaXNvbGF0ZTsiPgogICAgPHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOTAuNSAxMzIuNykiIHN0eWxlPSJmaWxsOiAjMTExODI3OyBmb250LWZhbWlseTogUm9ib3RvU2xhYi1Cb2xkLCAmYXBvcztSb2JvdG8gU2xhYiZhcG9zOzsgZm9udC1zaXplOiAxMzcuOXB4OyBmb250LXdlaWdodDogNzAwOyBpc29sYXRpb246IGlzb2xhdGU7Ij48dHNwYW4geD0iMCIgeT0iMCI+ODwvdHNwYW4+PC90ZXh0PgogIDwvZz4KICA8ZyBpZD0ieC1saW5lIiBzdHlsZT0iZGlzcGxheTogbm9uZTsiPgogICAgPGxpbmUgaWQ9ImxpbmUtMiIgeDE9IjIxLjIiIHkxPSIxOC4zIiB4Mj0iMjI5LjgiIHkyPSIyMjYuOSIgc3R5bGU9ImZpbGw6IG5vbmU7IHN0cm9rZTogI2VmNDQ0NDsgc3Ryb2tlLWxpbmVjYXA6IHJvdW5kOyBzdHJva2Utd2lkdGg6IDE0cHg7Ii8+CiAgICA8bGluZSBpZD0ibGluZS0xIiB4MT0iMjEuMiIgeTE9IjE4LjMiIHgyPSIyMjkuOCIgeTI9IjIyNi45IiBzdHlsZT0iZmlsbDogbm9uZTsgaXNvbGF0aW9uOiBpc29sYXRlOyBvcGFjaXR5OiAuMjsgc3Ryb2tlOiAjMTExODI3OyBzdHJva2UtbGluZWNhcDogcm91bmQ7IHN0cm9rZS13aWR0aDogM3B4OyIvPgogIDwvZz4KPC9zdmc+"
              data-xline="1"
            ></button>

            <button
              id="btnBoneVisible"
              class="btn btn-toggle btn-icon"
              aria-pressed="true"
              title="استخوان"
              aria-label="استخوان"
              data-icon-src="data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'?%3e%3csvg%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20version='1.1'%20viewBox='0%200%20256%20256'%3e%3c!--%20Created%20by%20Zoltan%20Dul%20in%202026%20-%20free%20to%20use%20with%20MIT%20license.%20SVG%20Version:%202.1.1%20--%3e%3cdefs%3e%3cpattern%20id='gumPattern'%20x='0'%20y='0'%20width='12'%20height='12'%20patternTransform='translate(6%2016638)'%20patternUnits='userSpaceOnUse'%20viewBox='0%200%2012%2012'%3e%3cg%3e%3crect%20width='12'%20height='12'%20style='fill:%20none;'/%3e%3cg%3e%3crect%20width='12'%20height='12'%20style='fill:%20none;'/%3e%3crect%20width='12'%20height='12'%20style='fill:%20%23f6b7c1;'/%3e%3ccircle%20cx='3'%20cy='3'%20r='1.2'%20style='fill:%20%23f1a8b5;'/%3e%3ccircle%20cx='9'%20cy='7'%20r='1.2'%20style='fill:%20%23f1a8b5;'/%3e%3c/g%3e%3c/g%3e%3c/pattern%3e%3c/defs%3e%3cpath%20id='gum-line'%20d='M28.8,98.9c3.7-3.1,9-2.7,13.7-1.6,21.6,5.2,39.5,22.7,59.9,39.8,8.7,7.5,19.7,15,31.4,10.8,4.6-1.5,9.3-4.5,13.4-7.5,22.7-17.2,47.3-36.9,71.6-42.5,5.9-1.3,13.3-2.9,18.1,1.2,2.1,1.9,3.5,4.9,4.4,8.9,1.3,6.6,1.2,14.2,1.1,21.1,0,15-.6,28.4-1.6,43.2-4.3,79.9-15.9,82.9-91.7,81.4-18.2-.6-34.8-.7-52.5-.4-18.6-.3-40.1.7-55.7-10.3-26.7-19.4-26.6-81.3-21.4-112.9,1.7-9.7,2-24.6,9.2-31.3h.1Z'%20style='fill:%20url(%23gumPattern);%20stroke:%20%23e596a3;%20stroke-linejoin:%20round;%20stroke-width:%204px;'/%3e%3cpath%20id='tooth-base'%20d='M122.9,152.7c-7.3-2-11.8,14.6-14.2,20.4-1.6,4.4-3.1,8.3-4.3,12.7-4.4,16.1-1.6,34.3-6.8,50.3-3.5,12.7-15.3,14.4-21.2,2.2-2.9-6.1-3.9-12.9-4.8-19.6-1-7.7-.8-15.6.7-23.1,1.8-11.4,7.5-22,7.5-33.8,0-17.2-3-32.7-6.7-49.2-8.4-29.3-27.4-79.6,13.2-93.9,12.3-4.9,25,3.3,37.5,3,1.7,0,3.4-.2,5.1-.4,12.9-2.1,27.7-9.6,41-5.3,22.5,7.4,20.6,39.1,16.6,58.5-1,4.8-2.3,9.4-3.6,13.2-2.2,6.2-5.3,12.2-6.7,19.1-1.9,8.4-2.9,16.8-3.7,25-1.5,15.5.3,30.4.5,45.1,0,8.7-.4,17.8-1.2,26.3-.8,8.3-2.5,16.7-4.5,24.9-1.7,7.8-5.6,18.9-14.1,20.5-14.8.7-11.9-38.8-14.3-48.9-1.8-10.1-6.8-42.3-15.9-47.4h0v.4Z'%20style='fill:%20%23fff;%20stroke:%20%23000;%20stroke-miterlimit:%2010;%20stroke-width:%208px;'/%3e%3cg%20id='x-line'%20style='display:%20none;'%3e%3cline%20id='line-2'%20x1='18.3'%20y1='22.1'%20x2='226.9'%20y2='230.7'%20style='fill:%20none;%20stroke:%20%23ef4444;%20stroke-linecap:%20round;%20stroke-width:%2014px;'/%3e%3cline%20id='line-1'%20x1='18.3'%20y1='22.1'%20x2='226.9'%20y2='230.7'%20style='fill:%20none;%20isolation:%20isolate;%20opacity:%20.2;%20stroke:%20%23111827;%20stroke-linecap:%20round;%20stroke-width:%203px;'/%3e%3c/g%3e%3c/svg%3e"
              data-xline="1"
            ></button>

            <button
              id="btnPulpVisible"
              class="btn btn-toggle btn-icon"
              aria-pressed="true"
              title="پالپ"
              aria-label="پالپ"
              data-icon-src="data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'?%3e%3csvg%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%20viewBox='0%200%20256%20256'%3e%3c!--%20Created%20by%20Zoltan%20Dul%20in%202026%20-%20free%20to%20use%20with%20MIT%20license.%20SVG%20Version:%202.1.1%20--%3e%3cpath%20id='tooth-base'%20d='M122.9,152.7c-7.3-2-11.8,14.6-14.2,20.4-1.6,4.4-3.1,8.3-4.3,12.7-4.4,16.1-1.6,34.3-6.8,50.3-3.5,12.7-15.3,14.4-21.2,2.2-2.9-6.1-3.9-12.9-4.8-19.6-1-7.7-.8-15.6.7-23.1,1.8-11.4,7.5-22,7.5-33.8,0-17.2-3-32.7-6.7-49.2-8.4-29.3-27.4-79.6,13.2-93.9,12.3-4.9,25,3.3,37.5,3,1.7,0,3.4-.2,5.1-.4,12.9-2.1,27.7-9.6,41-5.3,22.5,7.4,20.6,39.1,16.6,58.5-1,4.8-2.3,9.4-3.6,13.2-2.2,6.2-5.3,12.2-6.7,19.1-1.9,8.4-2.9,16.8-3.7,25-1.5,15.5.3,30.4.5,45.1,0,8.7-.4,17.8-1.2,26.3-.8,8.3-2.5,16.7-4.5,24.9-1.7,7.8-5.6,18.9-14.1,20.5-14.8.7-11.9-38.8-14.3-48.9-1.8-10.1-6.8-42.3-15.9-47.4h0v.4Z'%20style='fill:%20%23fff;%20stroke:%20%23000;%20stroke-miterlimit:%2010;%20stroke-width:%208px;'/%3e%3cpath%20id='tooth-healthy-pulp-2'%20d='M155.3,232.3c-4.8-3.6.2-21-1.5-34.3.2-18.4-2.8-39.4-11.5-55.3-4.4-6.7-8.3-11.3-15.4-11.9-5.3-1.1-11.5,0-15.5,2.9-12,9.1-20.8,47.4-22.7,68.3-.9,6.1-2.1,38.8-7.7,16.8-4.7-20.5,4.3-34.2,7.1-56.2,5-17.3,12.3-36.7,9.8-61.3-1.6-14.8-7.3-32.8-10.3-46.6-2.5-13.8,4.5-13.3,16.5-7,8.8,3.7,15.4,12.4,26.1,10.4,16-3.4,27.7-19.7,33-16.6,2.2,1,3,9.7,2.1,11.8-2.8,13.8-7.8,28.1-9.2,41.8-1,14.8.6,30.2,2.3,45.5,1.6,14.8,10.3,88.5-3.4,93h0v-1.5s.5,0,.5,0Z'%20style='fill:%20%23fcc5bc;'/%3e%3cg%20id='x-line'%20style='display:%20none;'%3e%3cline%20id='line-2'%20x1='18.3'%20y1='22.1'%20x2='226.9'%20y2='230.7'%20style='fill:%20none;%20stroke:%20%23ef4444;%20stroke-linecap:%20round;%20stroke-width:%2014px;'/%3e%3cline%20id='line-1'%20x1='18.3'%20y1='22.1'%20x2='226.9'%20y2='230.7'%20style='fill:%20none;%20isolation:%20isolate;%20opacity:%20.2;%20stroke:%20%23111827;%20stroke-linecap:%20round;%20stroke-width:%203px;'/%3e%3c/g%3e%3c/svg%3e"
              data-xline="1"
            ></button>
          </div>
        </div>

        <div id="toothGrid" class="tooth-grid"></div>

        <!-- ⭐ توضیحات و جزئیات درمان‌های دندان‌های انتخاب‌شده -->
        <div v-if="selectedTeeth.length > 0" class="tooth-treatments-info">
          <div class="summary-header">
            <span>📋 درمان‌های دندان انتخاب‌شده:</span>
            <span class="count">{{ selectedTreatments.length }} مورد</span>
          </div>
          <ul v-if="selectedTreatments.length > 0" class="treatments-list">
            <li
              v-for="rec in selectedTreatments"
              :key="rec.id"
              class="treatment-item"
            >
              <span class="tooth-badge">#{{ rec.toothNo }}</span>
              <span class="treatment-label">{{ rec.treatmentLabel }}</span>
              <span v-if="rec.surface" class="treatment-tag">
                {{ rec.surface }}
              </span>
              <span v-if="rec.material" class="treatment-tag">
                {{ rec.material }}
              </span>
              <span :class="['status-badge', rec.status]">
                {{ rec.status === "done" ? "✅ انجام" : "⏳ طرح" }}
              </span>
              <span v-if="rec.price" class="treatment-price">
                {{ formatPrice(rec.price) }}
              </span>
              <span class="treatment-date">{{ formatDate(rec.date) }}</span>
            </li>
          </ul>
          <div v-else class="empty-treatments">
            هنوز درمانی برای این دندان‌ها ثبت نشده
          </div>
        </div>
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
  gap: 10px;
  margin-bottom: 12px;
}

.panel-head h3 {
  margin: 0;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

.filter-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  flex-shrink: 0;
  flex: 1;
  justify-content: center;
}

.filter-buttons button {
  padding: 2px 5px;
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

/* ⭐ دکمه‌ی بازنشانی — قرمز کم‌رنگ */
.filter-buttons .btn-reset {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}

.filter-buttons .btn-reset:hover {
  background: #fecaca;
  border-color: #ef4444;
}

.chart-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}

.btn-icon {
  padding: 6px;
  min-width: 32px;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-icon:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}

.btn-icon .icon-svg,
.btn-icon .icon-img {
  width: 20px;
  height: 20px;
  display: block;
}

.btn-icon[aria-pressed="false"] {
  opacity: 0.5;
}

.btn-icon[aria-pressed="false"] .icon-svg,
.btn-icon[aria-pressed="false"] .icon-img {
  opacity: 0.5;
}

.btn-toggle[aria-pressed="true"] {
  background: #eff6ff;
  border-color: #93c5fd;
}

.btn-ghost {
  background: transparent;
  border-color: #e5e5e5;
}

.btn-ghost:hover {
  background: rgba(0, 0, 0, 0.04);
}

.treatment-panel-wrapper {
  grid-column: 2;
  padding: 12px;
  overflow: hidden;
}

#toothGrid {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin-top: 8px;
}

/* ⭐ توضیحات و جزئیات درمان‌ها */
.tooth-treatments-info {
  margin-top: 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  max-height: 180px;
  overflow-y: auto;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e5e7eb;
}

.summary-header .count {
  padding: 1px 8px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 10px;
  font-size: 10px;
}

.treatments-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.treatment-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #fff;
  border-radius: 6px;
  font-size: 11px;
  color: #1f2937;
  border-right: 3px solid #2563eb;
  flex-wrap: wrap;
}

.tooth-badge {
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.treatment-label {
  font-weight: 600;
  color: #111827;
}

.treatment-tag {
  padding: 1px 6px;
  background: #e5e7eb;
  border-radius: 4px;
  font-size: 9px;
  color: #4b5563;
}

.status-badge {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
}

.status-badge.done {
  background: #dcfce7;
  color: #166534;
}

.status-badge.planned {
  background: #fef3c7;
  color: #92400e;
}

.treatment-price {
  margin-right: auto;
  color: #059669;
  font-weight: 700;
  font-size: 10px;
}

.treatment-date {
  color: #9ca3af;
  font-size: 10px;
}

.empty-treatments {
  text-align: center;
  padding: 12px;
  font-size: 11px;
  color: #9ca3af;
  background: #fff;
  border: 1px dashed #e5e7eb;
  border-radius: 6px;
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

/* موبایل: chart-actions کوچیک‌تر */
@media (max-width: 700px) {
  .chart-actions {
    gap: 2px;
  }
  .btn-icon {
    min-width: 28px;
    min-height: 28px;
    padding: 4px;
  }
  .btn-icon .icon-svg,
  .btn-icon .icon-img {
    width: 16px;
    height: 16px;
  }
  .panel-head h3 {
    font-size: 12px;
  }
}
</style>