<script setup lang="ts">
import { computed, ref } from "vue";
import { getRecordLabel } from "./deriveToothState";
import type { OdontogramRecord, RecordKind } from "./treatmentStore";

const props = defineProps<{
  records: OdontogramRecord[];
  /** فیلتر بر اساس نوع (اختیاری) */
  filterKind?: RecordKind;
}>();

const emit = defineEmits<{
  remove: [id: string];
}>();

const kindFilter = ref<RecordKind | "all">(props.filterKind ?? "all");

const filtered = computed(() => {
  if (kindFilter.value === "all") return props.records;
  return props.records.filter((r) => r.kind === kindFilter.value);
});

const kindLabels: Record<RecordKind | "all", string> = {
  all: "همه",
  status: "وضعیت",
  treatment: "درمان",
  diagnosis: "تشخیص",
};

const kindColors: Record<RecordKind, string> = {
  status: "#0ea5e9",
  treatment: "#16a34a",
  diagnosis: "#f59e0b",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR");
  } catch {
    return iso;
  }
}

function getPrice(rec: OdontogramRecord): number {
  if ("price" in rec && typeof rec.price === "number") return rec.price;
  return 0;
}

function getStatus(rec: OdontogramRecord): string | null {
  if ("status" in rec && typeof rec.status === "string") return rec.status;
  return null;
}

function onRemove(id: string) {
  if (confirm("این رکورد حذف شود؟")) {
    emit("remove", id);
  }
}
</script>

<template>
  <div class="treatment-history" dir="rtl">
    <!-- هدر + فیلتر -->
    <div class="history-header">
      <h4>📜 تاریخچه کامل</h4>
      <div class="kind-filter">
        <button
          v-for="(label, key) in kindLabels"
          :key="key"
          :class="['filter-btn', { active: kindFilter === key }]"
          @click="kindFilter = key as any"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <!-- خالی -->
    <div v-if="filtered.length === 0" class="empty-hint">
      هنوز رکوردی ثبت نشده
    </div>

    <!-- لیست -->
    <ul v-else class="history-list">
      <li
        v-for="rec in filtered"
        :key="rec.id"
        class="history-item"
        :style="{ borderRightColor: kindColors[rec.kind] }"
      >
        <div class="item-row">
          <span
            class="kind-badge"
            :style="{ background: kindColors[rec.kind] }"
          >
            {{ kindLabels[rec.kind] }}
          </span>
          <span class="item-label">{{ getRecordLabel(rec) }}</span>
          <span v-if="'surface' in rec && rec.surface" class="item-tag">
            {{ rec.surface }}
          </span>
          <span v-if="'material' in rec && rec.material" class="item-tag">
            {{ rec.material }}
          </span>
        </div>

        <div class="item-meta">
          <span class="item-date">{{ formatDate(rec.date) }}</span>
          <span
            v-if="getStatus(rec)"
            :class="['item-status', getStatus(rec)]"
          >
            {{ getStatus(rec) === "done" ? "✓ انجام شد" : "⏳ طرح" }}
          </span>
          <span v-if="getPrice(rec) > 0" class="item-price">
            {{ getPrice(rec).toLocaleString("fa-IR") }} ت
          </span>
          <button class="item-remove" @click="onRemove(rec.id)" title="حذف">
            ✕
          </button>
        </div>

        <div v-if="rec.note" class="item-note">
          📝 {{ rec.note }}
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.treatment-history {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.history-header h4 {
  margin: 0;
  font-size: 13px;
  color: #555;
}

.kind-filter {
  display: flex;
  gap: 4px;
}

.filter-btn {
  padding: 4px 10px;
  border: 1px solid #e5e5e5;
  background: #f9f9f9;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  transition: all 0.15s;
}

.filter-btn:hover {
  background: #eff6ff;
}

.filter-btn.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.empty-hint {
  text-align: center;
  color: #999;
  padding: 30px 20px;
  font-size: 13px;
}

.history-list {
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
  border-right: 3px solid #999;
  font-size: 12px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.kind-badge {
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
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

.item-note {
  margin-top: 4px;
  font-size: 11px;
  color: #6b7280;
  font-style: italic;
}
</style>