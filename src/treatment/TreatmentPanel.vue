<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import TreatmentForm from "./TreatmentForm.vue";
import {
  getSelectedTeeth,
  onSelectionChange,
  onStateChange,
} from "../odontogram";
import { getRecordsForTooth } from "./treatmentStore";
import { submitTreatment, deleteRecord } from "./applyTreatment";
import type { TreatmentRecord } from "./treatmentStore";

const props = defineProps<{
  patientId: string;
}>();

const selectedTeeth = ref<number[]>([]);
const records = ref<TreatmentRecord[]>([]);

let unsubSel: (() => void) | undefined;
let unsubState: (() => void) | undefined;

function refresh() {
  selectedTeeth.value = getSelectedTeeth();

  // ⭐ تاریخچه‌ی همه‌ی دندان‌های انتخاب‌شده را جمع کن
  const all: TreatmentRecord[] = [];
  for (const toothNo of selectedTeeth.value) {
    const r = getRecordsForTooth(props.patientId, toothNo)
      .filter((x): x is TreatmentRecord => x.kind === "treatment");
    all.push(...r);
  }
  records.value = all;
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

// ⭐ onSubmit با surfaces: string[]
function onSubmit(payload: {
  treatmentId: string;
  treatmentLabel: string;
  category: string;
  surfaces?: string[];
  material?: string;
  price: number;
  status: "done" | "planned";
  note: string;
}) {
  // روی همه‌ی دندان‌های انتخاب‌شده ذخیره کن
  for (const toothNo of selectedTeeth.value) {
    submitTreatment(props.patientId, toothNo, payload);
  }
  refresh();
}

// ⭐ حذف — با toothNo درست
function onRemove(id: string) {
  if (!confirm("این درمان حذف شود؟")) return;

  // پیدا کردن رکورد و toothNo آن
  const record = records.value.find((r) => r.id === id);
  if (!record) return;

  // حذف از store
  deleteRecord(props.patientId, record.toothNo, id);
  refresh();
}

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

const totalDone = computed(() =>
  records.value
    .filter((r) => r.status === "done")
    .reduce((s, r) => s + r.price, 0),
);

const totalPlanned = computed(() =>
  records.value
    .filter((r) => r.status === "planned")
    .reduce((s, r) => s + r.price, 0),
);
</script>

<template>
  <div class="treatment-panel" dir="rtl">
    <div class="panel-header">
      <h3>ثبت درمان</h3>
      <div v-if="selectedTeeth.length > 0" class="active-tooth">
        <span v-if="selectedTeeth.length === 1">
          دندان <strong>{{ selectedTeeth[0] }}</strong>
        </span>
        <span v-else>
          {{ selectedTeeth.length }} دندان
        </span>
      </div>
    </div>

    <div v-if="selectedTeeth.length === 0" class="empty-state">
      👆 یک یا چند دندان از چارت انتخاب کنید
    </div>

    <template v-else>
      <TreatmentForm
        :patient-id="patientId"
        :tooth-nos="selectedTeeth"
        @submit="onSubmit"
      />

      <div v-if="records.length > 0" class="treatment-history">
        <div class="history-header">
          <h4>درمان‌های ثبت‌شده ({{ records.length }})</h4>
        </div>

        <ul>
          <li
            v-for="rec in records"
            :key="rec.id"
            :class="['history-item', rec.status]"
          >
            <div class="item-main">
              <span class="item-tooth">#{{ rec.toothNo }}</span>
              <span class="item-label">{{ rec.treatmentLabel }}</span>
              <span v-if="rec.surface" class="item-tag">{{ rec.surface }}</span>
              <span v-if="rec.material" class="item-tag">{{ rec.material }}</span>
            </div>
            <div class="item-meta">
              <span class="item-date">{{ formatDate(rec.date) }}</span>
              <span :class="['item-status', rec.status]">
                {{ rec.status === "done" ? "✓ انجام شد" : "⏳ طرح" }}
              </span>
              <span class="item-price">{{ formatPrice(rec.price) }}</span>
              <button class="item-remove" @click="onRemove(rec.id)" title="حذف">✕</button>
            </div>
          </li>
        </ul>

        <div class="totals">
          <div v-if="totalDone > 0" class="total-row">
            <span>انجام‌شده:</span>
            <strong>{{ formatPrice(totalDone) }}</strong>
          </div>
          <div v-if="totalPlanned > 0" class="total-row planned">
            <span>طرح درمان:</span>
            <strong>{{ formatPrice(totalPlanned) }}</strong>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>


<style scoped>
.item-tooth {
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
}
.treatment-panel {
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

.treatment-history {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.history-header h4 {
  margin: 0 0 8px;
  font-size: 13px;
  color: #555;
}

.treatment-history ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-item {
  padding: 8px 10px;
  background: #f9fafb;
  border-radius: 8px;
  border-right: 3px solid #16a34a;
  font-size: 12px;
}

.history-item.planned {
  border-right-color: #f59e0b;
  background: #fffbeb;
}

.item-main {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.item-label {
  font-weight: 600;
  color: #1f2937;
}

.item-tag {
  padding: 1px 6px;
  background: #e5e7eb;
  border-radius: 4px;
  font-size: 10px;
  color: #4b5563;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #6b7280;
}

.item-date {
  color: #9ca3af;
}

.item-status.done {
  color: #16a34a;
  font-weight: 500;
}

.item-status.planned {
  color: #f59e0b;
  font-weight: 500;
}

.item-price {
  margin-right: auto;
  color: #059669;
  font-weight: 600;
}

.item-remove {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 12px;
  padding: 0 4px;
  border-radius: 3px;
}

.item-remove:hover {
  background: #fee2e2;
}

.totals {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #d1d5db;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #065f46;
  padding: 4px 0;
}

.total-row.planned {
  color: #92400e;
}
</style>