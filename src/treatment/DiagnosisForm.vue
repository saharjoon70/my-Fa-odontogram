<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  TREATMENTS,
  type TreatmentItem,
} from "./treatments";
import { DIAGNOSIS_TAB_CATEGORIES, getCategoryLabel } from "./categories";
import { getTreatmentIcon } from "./treatmentIcons";

const props = defineProps<{
  patientId: string;
  toothNo: number;
}>();

const emit = defineEmits<{
  submitPlan: [
    payload: {
      planId: string;
      planLabel: string;
      price: number;
      status: "done" | "planned";
      note: string;
    },
  ];
  submitClinicalDx: [
    payload: {
      clinicalDx: string;
      dxValue: string;
      note: string;
    },
  ];
  cancel: [];
}>();

// ─── طرح درمان ───
const planOptions = computed(() =>
  TREATMENTS.filter((t) => t.category === "plan"),
);

const selectedPlan = ref<TreatmentItem | null>(null);
const planPrice = ref(0);
const planStatus = ref<"done" | "planned">("planned");
const planNote = ref("");

function selectPlan(item: TreatmentItem) {
  selectedPlan.value = item;
  planPrice.value = item.defaultPrice ?? 0;
}

function submitPlan() {
  if (!selectedPlan.value) return;
  emit("submitPlan", {
    planId: selectedPlan.value.id,
    planLabel: selectedPlan.value.label,
    price: planPrice.value,
    status: planStatus.value,
    note: planNote.value,
  });
  selectedPlan.value = null;
  planPrice.value = 0;
  planNote.value = "";
}

// ─── تشخیص بالینی ───
const CLINICAL_DX_OPTIONS = [
  {
    field: "pulpDx",
    label: "پالپ",
    options: [
      { value: "normal", label: "نرمال" },
      { value: "reversible-pulpitis", label: "پالپیت برگشت‌پذیر" },
      { value: "irreversible-pulpitis", label: "پالپیت برگشت‌ناپذیر" },
      { value: "necrosis", label: "نکروز" },
    ],
  },
  {
    field: "apicalDx",
    label: "آپیکال",
    options: [
      { value: "normal", label: "نرمال" },
      { value: "symptomatic-apical-periodontitis", label: "پریودنتیت حاد" },
      { value: "asymptomatic-apical-periodontitis", label: "پریودنتیت مزمن" },
      { value: "acute-apical-abscess", label: "آبسه حاد" },
      { value: "chronic-apical-abscess", label: "آبسه مزمن" },
    ],
  },
  {
    field: "periapicalType",
    label: "ضایعه پری‌اپیکال",
    options: [
      { value: "none", label: "—" },
      { value: "cyst", label: "کیست" },
      { value: "granuloma", label: "گرانولوم" },
    ],
  },
  {
    field: "mobility",
    label: "موبیلیتی",
    options: [
      { value: "none", label: "۰" },
      { value: "m1", label: "۱" },
      { value: "m2", label: "۲" },
      { value: "m3", label: "۳" },
    ],
  },
];

const clinicalDx = ref<Record<string, string>>({});
const dxNote = ref("");

function setDx(field: string, value: string) {
  clinicalDx.value = { ...clinicalDx.value, [field]: value };
}

function submitAllDx() {
  for (const opt of CLINICAL_DX_OPTIONS) {
    const val = clinicalDx.value[opt.field];
    if (val) {
      emit("submitClinicalDx", {
        clinicalDx: opt.field,
        dxValue: val,
        note: dxNote.value,
      });
    }
  }
  clinicalDx.value = {};
  dxNote.value = "";
}

watch(() => props.toothNo, () => {
  selectedPlan.value = null;
  clinicalDx.value = {};
  dxNote.value = "";
});
</script>

<template>
  <div class="diagnosis-form" dir="rtl">
    <!-- ═══ طرح درمان ═══ -->
    <section class="dx-section">
      <h4>📋 طرح درمان</h4>
      <div class="plan-grid">
        <button
          v-for="item in planOptions"
          :key="item.id"
          :class="['plan-btn', { active: selectedPlan?.id === item.id }]"
          @click="selectPlan(item)"
        >
          <div class="plan-icon" v-html="getTreatmentIcon(item.icon)"></div>
          <span>{{ item.label }}</span>
        </button>
      </div>

      <div v-if="selectedPlan" class="plan-details">
        <div class="detail-row">
          <span>طرح: <strong>{{ selectedPlan.label }}</strong></span>
        </div>
        <label class="detail-row">
          <span>وضعیت</span>
          <select v-model="planStatus">
            <option value="planned">طرح درمان</option>
            <option value="done">انجام شد</option>
          </select>
        </label>
        <label class="detail-row">
          <span>قیمت (تومان)</span>
          <input v-model.number="planPrice" type="number" min="0" step="50000" />
        </label>
        <label class="detail-row detail-row-full">
          <span>یادداشت</span>
          <textarea v-model="planNote" rows="2" placeholder="اختیاری..."></textarea>
        </label>
        <button class="btn-primary" @click="submitPlan">ثبت طرح</button>
      </div>
    </section>

    <!-- ═══ تشخیص بالینی ═══ -->
    <section class="dx-section">
      <h4>🔬 تشخیص بالینی</h4>

      <div
        v-for="opt in CLINICAL_DX_OPTIONS"
        :key="opt.field"
        class="clinical-row"
      >
        <div class="clinical-label">{{ opt.label }}</div>
        <div class="clinical-options">
          <label
            v-for="o in opt.options"
            :key="o.value"
            :class="['clinical-option', { active: clinicalDx[opt.field] === o.value }]"
          >
            <input
              type="radio"
              :name="`dx-${opt.field}`"
              :value="o.value"
              :checked="clinicalDx[opt.field] === o.value"
              @change="setDx(opt.field, o.value)"
            />
            <span>{{ o.label }}</span>
          </label>
        </div>
      </div>

      <label class="detail-row detail-row-full">
        <span>یادداشت تشخیص</span>
        <textarea v-model="dxNote" rows="2" placeholder="اختیاری..."></textarea>
      </label>

      <button
        class="btn-primary"
        :disabled="Object.keys(clinicalDx).length === 0"
        @click="submitAllDx"
      >
        ثبت تشخیص
      </button>
    </section>
  </div>
</template>

<style scoped>
.diagnosis-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dx-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.dx-section h4 {
  margin: 0;
  font-size: 13px;
  color: #1f2937;
}

/* ─── طرح درمان ─── */
.plan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 6px;
}

.plan-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 6px;
  border: 2px solid #e5e5e5;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  transition: all 0.15s;
}

.plan-btn:hover {
  border-color: #93c5fd;
  background: #f0f9ff;
}

.plan-btn.active {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.plan-icon {
  color: #2563eb;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plan-icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.plan-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

/* ─── تشخیص بالینی ─── */
.clinical-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.clinical-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.clinical-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.clinical-option {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11.5px;
  transition: all 0.15s;
}

.clinical-option:hover {
  background: #f0f9ff;
  border-color: #93c5fd;
}

.clinical-option.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.clinical-option input {
  display: none;
}

/* ─── فرم ─── */
.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.detail-row > span {
  font-weight: 500;
  color: #374151;
}

.detail-row select,
.detail-row input,
.detail-row textarea {
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  background: #fff;
}

.detail-row-full {
  width: 100%;
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
  transition: background 0.15s;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}
</style>