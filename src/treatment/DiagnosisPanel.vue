<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import DiagnosisForm from "./DiagnosisForm.vue";
import TreatmentHistory from "./TreatmentHistory.vue";
import {
  getSelectedTeeth,
  onSelectionChange,
  onStateChange,
} from "../odontogram";
import { getRecordsForTooth } from "./treatmentStore";
import {
  submitDiagnosis,
  deleteRecord,
} from "./applyTreatment";
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

function onSubmitPlan(payload: {
  planId: string;
  planLabel: string;
  price: number;
  status: "done" | "planned";
  note: string;
}) {
  if (activeTooth.value === null) return;
  submitDiagnosis(props.patientId, activeTooth.value, payload);
  refresh();
}

function onSubmitClinicalDx(payload: {
  clinicalDx: string;
  dxValue: string;
  note: string;
}) {
  if (activeTooth.value === null) return;
  submitDiagnosis(props.patientId, activeTooth.value, {
    clinicalDx: payload.clinicalDx,
    dxValue: payload.dxValue,
    price: 0,
    status: "done",
    note: payload.note,
  });
  refresh();
}

function onRemove(id: string) {
  if (activeTooth.value === null) return;
  deleteRecord(props.patientId, activeTooth.value, id);
  refresh();
}

const total = computed(() =>
  records.value
    .filter((r): r is any => "price" in r && (r.kind === "treatment" || r.kind === "diagnosis"))
    .filter((r) => r.status === "done")
    .reduce((s, r) => s + (r.price || 0), 0),
);

const totalPlanned = computed(() =>
  records.value
    .filter((r): r is any => "price" in r && (r.kind === "treatment" || r.kind === "diagnosis"))
    .filter((r) => r.status === "planned")
    .reduce((s, r) => s + (r.price || 0), 0),
);

function formatPrice(n: number): string {
  return n.toLocaleString("fa-IR") + " ت";
}
</script>

<template>
  <div class="diagnosis-panel" dir="rtl">
    <!-- هدر -->
    <div class="panel-header">
      <h3>تشخیص و طرح درمان</h3>
      <div v-if="activeTooth !== null" class="active-tooth">
        دندان <strong>{{ activeTooth }}</strong>
      </div>
    </div>

    <!-- بدون انتخاب -->
    <div v-if="activeTooth === null" class="empty-state">
      👆 یک دندان از چارت انتخاب کنید
    </div>

    <!-- محتوا -->
    <template v-else>
      <!-- فرم تشخیص + طرح درمان -->
      <DiagnosisForm
        :patient-id="patientId"
        :tooth-no="activeTooth"
        @submit-plan="onSubmitPlan"
        @submit-clinical-dx="onSubmitClinicalDx"
      />

      <!-- جمع قیمت -->
      <div v-if="total > 0 || totalPlanned > 0" class="totals-box">
        <div v-if="total > 0" class="total-line done">
          <span>جمع انجام‌شده:</span>
          <strong>{{ formatPrice(total) }}</strong>
        </div>
        <div v-if="totalPlanned > 0" class="total-line planned">
          <span>جمع طرح درمان:</span>
          <strong>{{ formatPrice(totalPlanned) }}</strong>
        </div>
      </div>

      <!-- تاریخچه کامل -->
      <div class="history-wrapper">
        <TreatmentHistory
          :records="records"
          @remove="onRemove"
        />
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
  background: #fff;
  border-radius: 10px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
}

.active-tooth {
  font-size: 12px;
  color: #666;
  padding: 4px 10px;
  background: #eff6ff;
  border-radius: 6px;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 14px;
}

.totals-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
}

.total-line {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #065f46;
}

.total-line.planned {
  color: #92400e;
}

.history-wrapper {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}
</style>