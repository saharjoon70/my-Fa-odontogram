<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  getSelectedTeeth,
  onSelectionChange,
  onStateChange,
} from "../odontogram";
import { getRecordsForTooth } from "./treatmentStore";
import { submitTreatment, deleteRecord } from "./applyTreatment";
import type { TreatmentRecord } from "./treatmentStore";
import TreatmentForm from "./TreatmentForm.vue";

const props = defineProps<{
  patientId: string;
}>();

const selectedTeeth = ref<number[]>([]);
const records = ref<TreatmentRecord[]>([]);

let unsubSel: (() => void) | undefined;
let unsubState: (() => void) | undefined;

function refresh() {
  selectedTeeth.value = getSelectedTeeth();
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

function onSubmit(payload: {
  treatmentId: string;
  treatmentLabel: string;
  category: string;
  surfaces?: string[];
  material?: string;
  price: number;
  status: "done" | "planned";
  note: string;
  planId?: string;
  sessionId?: string;
  doctorId?: string;
  assistantId?: string;
  date: string;
  time: string;
}) {
  for (const toothNo of selectedTeeth.value) {
    submitTreatment(props.patientId, toothNo, {
      ...payload,
      surface: payload.surfaces?.[0],
    });
  }
  refresh();
}

function onRemove(id: string) {
  if (!confirm("این درمان حذف شود؟")) return;
  const record = records.value.find((r) => r.id === id);
  if (!record) return;
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
  records.value.filter((r) => r.status === "done").reduce((s, r) => s + r.price, 0),
);

const totalPlanned = computed(() =>
  records.value.filter((r) => r.status === "planned").reduce((s, r) => s + r.price, 0),
);

// ═══ Print list ═══
function printList() {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>گزارش درمان‌ها</title>
      <style>
        body { font-family: Tahoma, sans-serif; padding: 20px; }
        h1 { font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
        th { background: #2563eb; color: #fff; }
        tr:nth-child(even) { background: #f9f9f9; }
      </style>
    </head>
    <body>
      <h1>🛠 گزارش درمان‌ها</h1>
      <table>
        <thead>
          <tr>
            <th>دندان</th>
            <th>درمان</th>
            <th>تاریخ</th>
            <th>وضعیت</th>
            <th>قیمت</th>
          </tr>
        </thead>
        <tbody>
          ${records.value.map((r) => `
            <tr>
              <td>#${r.toothNo}</td>
              <td>${r.treatmentLabel}</td>
              <td>${formatDate(r.date)}</td>
              <td>${r.status === "done" ? "انجام‌شده" : "طرح"}</td>
              <td>${formatPrice(r.price)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div style="margin-top: 16px; padding: 10px; background: #eff6ff; border-radius: 6px;">
        <div>انجام‌شده: ${formatPrice(totalDone.value)}</div>
        <div>طرح: ${formatPrice(totalPlanned.value)}</div>
        <div style="font-weight: bold;">مجموع: ${formatPrice(totalDone.value + totalPlanned.value)}</div>
      </div>
    </body>
    </html>
  `;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 300);
}
</script>

<template>
  <div
    class="treatment-panel"
    dir="rtl"
  >
    <!-- ═══ Form ═══ -->
    <TreatmentForm
      :patient-id="patientId"
      :tooth-nos="selectedTeeth"
      @submit="onSubmit"
    />

    <!-- ═══ Records list ═══ -->
    <div
      v-if="selectedTeeth.length > 0 && records.length > 0"
      class="records-section"
    >
      <div class="section-header">
        <h4>📋 درمان‌های این دندان‌ها ({{ records.length }})</h4>
        <button
          class="btn-print-sm"
          @click="printList"
        >
          🖨 چاپ
        </button>
      </div>

      <ul class="records-list">
        <li
          v-for="rec in records"
          :key="rec.id"
          :class="['record-item', rec.status]"
        >
          <div class="record-main">
            <span class="tooth-badge">#{{ rec.toothNo }}</span>
            <span class="record-label">{{ rec.treatmentLabel }}</span>
            <span
              v-if="rec.surface"
              class="record-tag"
            >{{ rec.surface }}</span>
            <span
              v-if="rec.material"
              class="record-tag"
            >{{ rec.material }}</span>
          </div>
          <div class="record-meta">
            <span class="record-date">📅 {{ formatDate(rec.date) }}</span>
            <span :class="['record-status', rec.status]">
              {{ rec.status === "done" ? "✅ انجام" : "⏳ طرح" }}
            </span>
            <span class="record-price">{{ formatPrice(rec.price) }}</span>
            <button
              class="record-remove"
              @click="onRemove(rec.id)"
            >
              ✕
            </button>
          </div>
        </li>
      </ul>

      <div class="totals">
        <div
          v-if="totalDone > 0"
          class="total-row done"
        >
          <span>انجام‌شده:</span>
          <strong>{{ formatPrice(totalDone) }}</strong>
        </div>
        <div
          v-if="totalPlanned > 0"
          class="total-row planned"
        >
          <span>طرح:</span>
          <strong>{{ formatPrice(totalPlanned) }}</strong>
        </div>
      </div>
    </div>

    <div
      v-else-if="selectedTeeth.length === 0"
      class="empty-hint"
    >
      👆 یک یا چند دندان از چارت انتخاب کنید
    </div>
  </div>
</template>

<style scoped>
.treatment-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
}

.records-section {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
}

.btn-print-sm {
  padding: 4px 10px;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
}

.btn-print-sm:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}

.records-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.record-item {
  padding: 8px 10px;
  background: #f9fafb;
  border-radius: 8px;
  border-right: 3px solid #16a34a;
  font-size: 12px;
}

.record-item.planned {
  border-right-color: #f59e0b;
  background: #fffbeb;
}

.record-main {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.tooth-badge {
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.record-label {
  font-weight: 600;
  color: #1f2937;
}

.record-tag {
  padding: 1px 6px;
  background: #e5e7eb;
  border-radius: 4px;
  font-size: 10px;
  color: #4b5563;
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #6b7280;
  flex-wrap: wrap;
}

.record-date {
  color: #9ca3af;
}

.record-status.done {
  color: #16a34a;
  font-weight: 600;
}

.record-status.planned {
  color: #f59e0b;
  font-weight: 600;
}

.record-price {
  margin-right: auto;
  color: #059669;
  font-weight: 600;
}

.record-remove {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 12px;
  padding: 0 4px;
  border-radius: 3px;
}

.record-remove:hover {
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
  padding: 4px 0;
}

.total-row.done {
  color: #065f46;
}

.total-row.planned {
  color: #92400e;
}

.empty-hint {
  text-align: center;
  color: #9ca3af;
  padding: 30px 20px;
  font-size: 13px;
}
</style>