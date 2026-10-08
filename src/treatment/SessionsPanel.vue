<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { getRecordsForPatient } from "./treatmentStore";
import type { TreatmentRecord, DiagnosisRecord } from "./treatmentStore";
import { onStateChange, onSelectionChange } from "../odontogram";
import { getStaffById } from "./treatmentPlanStore";

const props = defineProps<{
  patientId: string;
}>();

const expandedSessionKey = ref<string | null>(null);
const filterMode = ref<"all" | "upcoming" | "today" | "past">("all");

let unsubState: (() => void) | undefined;
let unsubSel: (() => void) | undefined;

function refresh() { /* force re-render */ }

onMounted(() => {
  unsubState = onStateChange(() => refresh());
  unsubSel = onSelectionChange(() => refresh());
});

onUnmounted(() => {
  unsubState?.();
  unsubSel?.();
});

interface AutoSession {
  key: string;
  date: string;
  records: (TreatmentRecord | DiagnosisRecord)[];
  totalPrice: number;
  doneCount: number;
  plannedCount: number;
  doctorNames: string[];
}

const allSessions = computed<AutoSession[]>(() => {
  const records = getRecordsForPatient(props.patientId).filter(
    (r): r is TreatmentRecord | DiagnosisRecord =>
      r.kind === "treatment" || r.kind === "diagnosis",
  );

  const grouped = new Map<string, (TreatmentRecord | DiagnosisRecord)[]>();
  for (const r of records) {
    // ⭐ از sessionDate استفاده کن (اگه داره)، وگرنه date
    const key = (r as TreatmentRecord).sessionDate || r.date;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  }

  return Array.from(grouped.entries())
    .map(([date, recs]) => {
      const totalPrice = recs.reduce((s, r) => s + (r.price || 0), 0);
      const doneCount = recs.filter((r) => r.status === "done").length;
      const plannedCount = recs.filter((r) => r.status === "planned").length;
      const doctorNames = [
        ...new Set(
          recs
            .map((r) => ("doctorId" in r ? r.doctorId : undefined))
            .filter((id): id is string => !!id)
            .map((id) => getStaffById(id)?.name ?? "")
            .filter(Boolean),
        ),
      ];
      return {
        key: date,
        date,
        records: recs,
        totalPrice,
        doneCount,
        plannedCount,
        doctorNames,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
});

const sessions = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  switch (filterMode.value) {
    case "today":
      return allSessions.value.filter((s) => s.date === today);
    case "upcoming":
      return allSessions.value.filter((s) => s.date > today);
    case "past":
      return allSessions.value.filter((s) => s.date < today);
    default:
      return allSessions.value;
  }
});

const counts = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    all: allSessions.value.length,
    today: allSessions.value.filter((s) => s.date === today).length,
    upcoming: allSessions.value.filter((s) => s.date > today).length,
    past: allSessions.value.filter((s) => s.date < today).length,
  };
});

function toggleExpand(key: string) {
  expandedSessionKey.value = expandedSessionKey.value === key ? null : key;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatPrice(n: number): string {
  return n.toLocaleString("fa-IR") + " ت";
}

function getRecordLabel(rec: TreatmentRecord | DiagnosisRecord): string {
  if (rec.kind === "treatment") return rec.treatmentLabel;
  return rec.planLabel ?? rec.clinicalDx ?? "تشخیص";
}

function isToday(date: string): boolean {
  return date === new Date().toISOString().slice(0, 10);
}

function isFuture(date: string): boolean {
  return date > new Date().toISOString().slice(0, 10);
}

function printSession(session: AutoSession) {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>جلسه ${session.date}</title>
      <style>
        body { font-family: Tahoma, sans-serif; padding: 20px; }
        h1 { font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
        th { background: #2563eb; color: #fff; }
        .total { margin-top: 16px; padding: 10px; background: #eff6ff; border-radius: 6px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>📅 ${formatDate(session.date)}</h1>
      <table>
        <thead><tr><th>دندان</th><th>درمان</th><th>وضعیت</th><th>قیمت</th></tr></thead>
        <tbody>
          ${session.records.map((r) => `
            <tr>
              <td>#${r.toothNo}</td>
              <td>${getRecordLabel(r)}</td>
              <td>${r.status === "done" ? "انجام‌شده" : "طرح"}</td>
              <td>${r.price ? formatPrice(r.price) : "—"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="total">مجموع: ${formatPrice(session.totalPrice)}</div>
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
  <div class="sessions-panel" dir="rtl">
    <div class="panel-header">
      <h3>📅 جلسات</h3>
      <div class="header-hint">جلسات خودکار از تاریخ‌ها ساخته می‌شن</div>
    </div>

    <div class="filters">
      <button :class="['filter-btn', { active: filterMode === 'all' }]" @click="filterMode = 'all'">
        همه ({{ counts.all }})
      </button>
      <button :class="['filter-btn', { active: filterMode === 'upcoming' }]" @click="filterMode = 'upcoming'">
        📅 آینده ({{ counts.upcoming }})
      </button>
      <button :class="['filter-btn', { active: filterMode === 'today' }]" @click="filterMode = 'today'">
        🟡 امروز ({{ counts.today }})
      </button>
      <button :class="['filter-btn', { active: filterMode === 'past' }]" @click="filterMode = 'past'">
        ⏳ گذشته ({{ counts.past }})
      </button>
    </div>

    <div v-if="sessions.length === 0" class="empty-state">
      <div class="empty-icon">📅</div>
      <div>هیچ جلسه‌ای در این فیلتر نیست</div>
    </div>

    <div v-else class="sessions-list">
      <div
        v-for="session in sessions"
        :key="session.key"
        :class="['session-card', {
          expanded: expandedSessionKey === session.key,
          today: isToday(session.date),
          future: isFuture(session.date),
        }]"
      >
        <div class="session-header" @click="toggleExpand(session.key)">
          <div class="session-date-icon">
            <span class="icon">{{ isToday(session.date) ? "🟡" : isFuture(session.date) ? "📅" : "✅" }}</span>
          </div>
          <div class="session-info">
            <div class="session-title">
              {{ formatDate(session.date) }}
              <span v-if="isToday(session.date)" class="today-badge">امروز</span>
              <span v-if="isFuture(session.date)" class="future-badge">آینده</span>
            </div>
            <div class="session-meta">
              <span class="meta-item">🛠 {{ session.records.length }} مورد</span>
              <span v-if="session.doneCount > 0" class="meta-item done">✅ {{ session.doneCount }}</span>
              <span v-if="session.plannedCount > 0" class="meta-item planned">⏳ {{ session.plannedCount }}</span>
            </div>
          </div>
          <div class="session-total">{{ formatPrice(session.totalPrice) }}</div>
          <span class="expand-icon">{{ expandedSessionKey === session.key ? "▲" : "▼" }}</span>
        </div>

        <div v-if="expandedSessionKey === session.key" class="session-body">
          <table class="data-table">
            <thead>
              <tr>
                <th>دندان</th>
                <th>درمان</th>
                <th>دکتر</th>
                <th>وضعیت</th>
                <th>قیمت</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rec in session.records" :key="rec.id" :class="{ 'row-done': rec.status === 'done' }">
                <td>#{{ rec.toothNo }}</td>
                <td>{{ getRecordLabel(rec) }}</td>
                <td>{{ "doctorId" in rec && rec.doctorId ? getStaffById(rec.doctorId)?.name ?? "—" : "—" }}</td>
                <td>
                  <span :class="['status-pill', rec.status]">
                    {{ rec.status === "done" ? "✅ انجام" : "⏳ طرح" }}
                  </span>
                </td>
                <td class="price-cell">{{ rec.price ? formatPrice(rec.price) : "—" }}</td>
              </tr>
            </tbody>
          </table>

          <div class="session-actions">
            <button class="btn-print" @click="printSession(session)">🖨 چاپ جلسه</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>
.sessions-panel {
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
  flex-wrap: wrap;
  gap: 6px;
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.header-hint {
  font-size: 10px;
  color: #9ca3af;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
  font-size: 13px;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 11px;
  color: #cbd5e1;
  margin-top: 6px;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
  border-right: 3px solid #16a34a;
}

.session-card.today {
  border-right-color: #2563eb;
  background: #fefeff;
}

.session-card.future {
  border-right-color: #f59e0b;
  background: #fffef9;
}

.session-card.expanded {
  border-color: #93c5fd;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
}

.session-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
}

.session-header:hover {
  background: #f9fafb;
}

.session-date-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.today-badge {
  font-size: 9px;
  padding: 1px 6px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 10px;
  font-weight: 700;
}

.session-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 10px;
}

.meta-item {
  padding: 1px 6px;
  background: #f3f4f6;
  border-radius: 4px;
  color: #6b7280;
}

.meta-item.done {
  background: #dcfce7;
  color: #166534;
}

.meta-item.planned {
  background: #fef3c7;
  color: #92400e;
}

.session-total {
  font-size: 12px;
  font-weight: 700;
  color: #059669;
  white-space: nowrap;
}

.expand-icon {
  color: #9ca3af;
  font-size: 10px;
}

.session-body {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  background: #fafbfc;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  font-size: 11px;
}

.data-table th {
  background: #f3f4f6;
  color: #6b7280;
  font-weight: 600;
  padding: 6px 8px;
  text-align: right;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr.row-done td {
  background: #f0fdf4;
}

.status-pill {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.status-pill.done { background: #dcfce7; color: #166534; }
.status-pill.planned { background: #fef3c7; color: #92400e; }
.status-pill.cancelled { background: #fee2e2; color: #991b1b; }

.price-cell {
  color: #059669;
  font-weight: 600;
  white-space: nowrap;
}

.session-actions {
  display: flex;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px dashed #e5e7eb;
  margin-top: 10px;
}

.btn-print {
  padding: 6px 12px;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.15s;
}

.btn-print:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1e40af;
}
</style>