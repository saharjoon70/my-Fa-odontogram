<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  getSelectedTeeth,
  onSelectionChange,
  onStateChange,
} from "../odontogram";
import {
  submitDiagnosis,
  deleteRecord,
} from "./applyTreatment";
import { getRecordsForTooth } from "./treatmentStore";
import type { OdontogramRecord } from "./treatmentStore";

const props = defineProps<{
  patientId: string;
}>();

const selectedTeeth = ref<number[]>([]);
const activeTooth = ref<number | null>(null);
const records = ref<OdontogramRecord[]>([]);

let unsubSel: (() => void) | undefined;
let unsubState: (() => void) | undefined;

function refresh() {
  const teeth = getSelectedTeeth();
  selectedTeeth.value = teeth;
  activeTooth.value = teeth.length > 0 ? teeth[0] : null;
  if (activeTooth.value !== null) {
    records.value = getRecordsForTooth(props.patientId, activeTooth.value);
  } else {
    records.value = [];
  }
}

onMounted(() => {
  refresh();
  unsubSel = onSelectionChange(() => refresh());
  unsubState = onStateChange(() => refresh());
});

onUnmounted(() => {
  unsubSel?.();
  unsubState?.();
});

// ═══ Diagnosis options ═══
const PULP_OPTIONS = [
  { value: "normal", label: "نرمال" },
  { value: "reversible-pulpitis", label: "پالپیت برگشت‌پذیر" },
  { value: "irreversible-pulpitis", label: "پالپیت برگشت‌ناپذیر" },
  { value: "necrosis", label: "نکروز" },
];

const APICAL_OPTIONS = [
  { value: "normal", label: "نرمال" },
  { value: "symptomatic-apical-periodontitis", label: "پریودنتیت حاد" },
  { value: "asymptomatic-apical-periodontitis", label: "پریودنتیت مزمن" },
  { value: "acute-apical-abscess", label: "آبسه حاد" },
  { value: "chronic-apical-abscess", label: "آبسه مزمن" },
];

const LESION_OPTIONS = [
  { value: "none", label: "—" },
  { value: "cyst", label: "کیست" },
  { value: "granuloma", label: "گرانولوم" },
];

const MOBILITY_OPTIONS = [
  { value: "none", label: "۰" },
  { value: "m1", label: "۱" },
  { value: "m2", label: "۲" },
  { value: "m3", label: "۳" },
];

const dx = ref({
  pulpDx: "normal",
  apicalDx: "normal",
  periapicalType: "none",
  mobility: "none",
});

const note = ref("");

function submit() {
  if (activeTooth.value === null) return;

  // پالپ
  if (dx.value.pulpDx !== "normal") {
    submitDiagnosis(props.patientId, activeTooth.value, {
      clinicalDx: "pulpDx",
      dxValue: dx.value.pulpDx,
      price: 0,
      status: "done",
      note: note.value,
    });
  }

  // آپیکال
  if (dx.value.apicalDx !== "normal") {
    submitDiagnosis(props.patientId, activeTooth.value, {
      clinicalDx: "apicalDx",
      dxValue: dx.value.apicalDx,
      price: 0,
      status: "done",
      note: note.value,
    });
  }

  // ضایعه
  if (dx.value.periapicalType !== "none") {
    submitDiagnosis(props.patientId, activeTooth.value, {
      clinicalDx: "periapicalType",
      dxValue: dx.value.periapicalType,
      price: 0,
      status: "done",
      note: note.value,
    });
  }

  // موبیلیتی
  if (dx.value.mobility !== "none") {
    submitDiagnosis(props.patientId, activeTooth.value, {
      clinicalDx: "mobility",
      dxValue: dx.value.mobility,
      price: 0,
      status: "done",
      note: note.value,
    });
  }

  note.value = "";
  refresh();
}

function onRemove(id: string) {
  if (!confirm("این تشخیص حذف شود؟")) return;
  if (activeTooth.value === null) return;
  deleteRecord(props.patientId, activeTooth.value, id);
  refresh();
}

const diagnosisRecords = computed(() =>
  records.value.filter((r) => r.kind === "diagnosis"),
);

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR");
  } catch {
    return iso;
  }
}

function getDxLabel(rec: OdontogramRecord): string {
  if (rec.kind !== "diagnosis") return "";
  const { clinicalDx, dxValue } = rec;
  if (clinicalDx === "pulpDx") {
    return PULP_OPTIONS.find((o) => o.value === dxValue)?.label ?? dxValue ?? "";
  }
  if (clinicalDx === "apicalDx") {
    return APICAL_OPTIONS.find((o) => o.value === dxValue)?.label ?? dxValue ?? "";
  }
  if (clinicalDx === "periapicalType") {
    return LESION_OPTIONS.find((o) => o.value === dxValue)?.label ?? dxValue ?? "";
  }
  if (clinicalDx === "mobility") {
    return "موبیلیتی: " + (MOBILITY_OPTIONS.find((o) => o.value === dxValue)?.label ?? dxValue ?? "");
  }
  return dxValue ?? "";
}
</script>

<template>
  <div
    class="diagnosis-panel"
    dir="rtl"
  >
    <div class="panel-header">
      <h3>🔬 تشخیص بالینی</h3>
      <div
        v-if="activeTooth !== null"
        class="active-tooth"
      >
        دندان <strong>{{ activeTooth }}</strong>
      </div>
    </div>

    <div
      v-if="activeTooth === null"
      class="empty-state"
    >
      👆 یک دندان از چارت انتخاب کنید
    </div>

    <template v-else>
      <!-- Form -->
      <div class="diagnosis-form">
        <div class="dx-row">
          <label class="dx-label">پالپ:</label>
          <div class="dx-options">
            <label
              v-for="opt in PULP_OPTIONS"
              :key="opt.value"
              :class="['dx-option', { active: dx.pulpDx === opt.value }]"
            >
              <input
                type="radio"
                :value="opt.value"
                v-model="dx.pulpDx"
              />
              <span>{{ opt.label }}</span>
            </label>
          </div>
        </div>

        <div class="dx-row">
          <label class="dx-label">آپیکال:</label>
          <div class="dx-options">
            <label
              v-for="opt in APICAL_OPTIONS"
              :key="opt.value"
              :class="['dx-option', { active: dx.apicalDx === opt.value }]"
            >
              <input
                type="radio"
                :value="opt.value"
                v-model="dx.apicalDx"
              />
              <span>{{ opt.label }}</span>
            </label>
          </div>
        </div>

        <div class="dx-row">
          <label class="dx-label">ضایعه پری‌اپیکال:</label>
          <div class="dx-options">
            <label
              v-for="opt in LESION_OPTIONS"
              :key="opt.value"
              :class="['dx-option', { active: dx.periapicalType === opt.value }]"
            >
              <input
                type="radio"
                :value="opt.value"
                v-model="dx.periapicalType"
              />
              <span>{{ opt.label }}</span>
            </label>
          </div>
        </div>

        <div class="dx-row">
          <label class="dx-label">موبیلیتی:</label>
          <div class="dx-options">
            <label
              v-for="opt in MOBILITY_OPTIONS"
              :key="opt.value"
              :class="['dx-option', { active: dx.mobility === opt.value }]"
            >
              <input
                type="radio"
                :value="opt.value"
                v-model="dx.mobility"
              />
              <span>{{ opt.label }}</span>
            </label>
          </div>
        </div>

        <div class="dx-row dx-row-full">
          <label class="dx-label">یادداشت:</label>
          <textarea
            v-model="note"
            rows="2"
            placeholder="اختیاری..."
          ></textarea>
        </div>

        <button
          class="btn-primary"
          @click="submit"
        >
          ✅ ثبت تشخیص
        </button>
      </div>

      <!-- History -->
      <div
        v-if="diagnosisRecords.length > 0"
        class="history-section"
      >
        <h4>تشخیص‌های ثبت‌شده ({{ diagnosisRecords.length }})</h4>
        <ul>
          <li
            v-for="rec in diagnosisRecords"
            :key="rec.id"
            class="history-item"
          >
            <span class="dx-type">🔬</span>
            <span class="dx-label">{{ getDxLabel(rec) }}</span>
            <span class="dx-date">{{ formatDate(rec.date) }}</span>
            <button
              class="dx-remove"
              @click="onRemove(rec.id)"
            >
              ✕
            </button>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
.diagnosis-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.active-tooth {
  font-size: 11px;
  color: #2563eb;
  padding: 3px 8px;
  background: #eff6ff;
  border-radius: 6px;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 40px 20px;
  font-size: 13px;
}

.diagnosis-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dx-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dx-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.dx-options {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.dx-option {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s;
}

.dx-option input {
  display: none;
}

.dx-option:hover {
  background: #f0f9ff;
  border-color: #93c5fd;
}

.dx-option.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
  font-weight: 600;
}

.dx-row-full textarea {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  resize: vertical;
}

.btn-primary {
  padding: 10px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.history-section {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.history-section h4 {
  margin: 0 0 8px;
  font-size: 12px;
  color: #6b7280;
}

.history-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 11px;
}

.dx-type {
  font-size: 13px;
}

.dx-label {
  font-weight: 600;
  color: #1f2937;
  flex: 1;
}

.dx-date {
  color: #9ca3af;
  font-size: 10px;
}

.dx-remove {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 3px;
}

.dx-remove:hover {
  background: #fee2e2;
}
</style>