<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import StatusForm from "./StatusForm.vue";
import {
  getSelectedTeeth,
  onSelectionChange,
  getToothState,
  onStateChange,
} from "../odontogram";
import { getRecordsForTooth } from "./treatmentStore";
import { getRecordLabel } from "./deriveToothState";
import type { OdontogramRecord } from "./treatmentStore";

const props = defineProps<{
  patientId: string;
}>();

const selectedTeeth = ref<number[]>([]);
const activeTooth = ref<number | null>(null);
const toothState = ref<Record<string, unknown> | null>(null);
const toothRecords = ref<OdontogramRecord[]>([]);

let unsubSelection: (() => void) | undefined;
let unsubState: (() => void) | undefined;

function refresh() {
  const teeth = getSelectedTeeth();
  selectedTeeth.value = teeth;
  activeTooth.value = teeth.length > 0 ? teeth[0] : null;

  if (activeTooth.value !== null) {
    toothState.value = getToothState(activeTooth.value);
    toothRecords.value = getRecordsForTooth(props.patientId, activeTooth.value);
  } else {
    toothState.value = null;
    toothRecords.value = [];
  }
}

onMounted(() => {
  refresh();
  unsubSelection = onSelectionChange(() => refresh());
  unsubState = onStateChange(() => refresh());
});

onUnmounted(() => {
  unsubSelection?.();
  unsubState?.();
});

watch(() => props.patientId, () => refresh());

const statusRecords = computed(() =>
  toothRecords.value.filter((r) => r.kind === "status"),
);

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fa-IR");
  } catch {
    return iso;
  }
}

function removeStatusRecord(id: string) {
  // از طریق applyTreatment حذف می‌کنیم
  import("./applyTreatment").then(({ deleteRecord }) => {
    if (activeTooth.value !== null) {
      deleteRecord(props.patientId, activeTooth.value, id);
      refresh();
    }
  });
}
</script>

<template>
  <div class="status-panel" dir="rtl">
    <!-- هدر: دندان فعال -->
    <div class="panel-header">
      <h3>ثبت وضعیت دندان</h3>
      <div v-if="activeTooth !== null" class="active-tooth">
        دندان فعال: <strong>{{ activeTooth }}</strong>
      </div>
    </div>

    <!-- بدون انتخاب -->
    <div v-if="activeTooth === null" class="empty-state">
      👆 یک دندان از چارت انتخاب کنید
    </div>

    <!-- فرم وضعیت -->
    <template v-else>
      <StatusForm
        :patient-id="patientId"
        :tooth-no="activeTooth"
        :tooth-state="toothState"
        @change="refresh"
      />

      <!-- تاریخچه وضعیت‌های ثبت‌شده -->
      <div v-if="statusRecords.length > 0" class="status-history">
        <h4>وضعیت‌های ثبت‌شده ({{ statusRecords.length }})</h4>
        <ul>
          <li v-for="rec in statusRecords" :key="rec.id">
            <span class="rec-label">{{ getRecordLabel(rec) }}</span>
            <span class="rec-date">{{ formatDate(rec.date) }}</span>
            <button class="rec-remove" @click="removeStatusRecord(rec.id)">حذف</button>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
.status-panel {
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

.status-history {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.status-history h4 {
  margin: 0 0 8px;
  font-size: 13px;
  color: #555;
}

.status-history ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-history li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #f9f9f9;
  border-radius: 6px;
  font-size: 12px;
}

.rec-label {
  font-weight: 500;
  color: #333;
}

.rec-date {
  color: #999;
  margin-right: auto;
}

.rec-remove {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 11px;
  padding: 2px 6px;
}

.rec-remove:hover {
  text-decoration: underline;
}
</style>