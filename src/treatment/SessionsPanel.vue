<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { getRecordsForPatient } from "./treatmentStore";
import type { TreatmentRecord, DiagnosisRecord } from "./treatmentStore";
import { onStateChange, onSelectionChange } from "../odontogram";
import {
  getStaffById,
  getSessionsForPatient,
  getPlanById,
} from "./treatmentPlanStore";
import { calculateFinancials } from "./applyTreatment";
import RadiographDisplay from "./RadiographDisplay.vue";
import SessionModal from "./SessionModal.vue";

const props = defineProps<{
  patientId: string;
}>();

const expandedSessionKey = ref<string | null>(null);
const filterMode = ref<"all" | "upcoming" | "today" | "past">("all");
const showRadiographs = ref(false);

// ⭐ Session Modal
const showSessionModal = ref(false);
const editingSessionId = ref<string | undefined>(undefined);
const sessionModalPlanId = ref<string>("");
const sessionModalPlanTitle = ref<string>("");

let unsubState: (() => void) | undefined;
let unsubSel: (() => void) | undefined;

function refresh() {
  /* force re-render */
}

onMounted(() => {
  unsubState = onStateChange(() => refresh());
  unsubSel = onSelectionChange(() => refresh());
});

onUnmounted(() => {
  unsubState?.();
  unsubSel?.();
});

// ═══════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════

interface SessionTreatment {
  record: TreatmentRecord | DiagnosisRecord;
  label: string;
  doctorName: string;
  assistantName: string;
  financials: ReturnType<typeof calculateFinancials>;
}

interface SessionView {
  sessionId: string;
  sessionNumber: number;
  sessionTitle: string;
  sessionDate: string;
  sessionTime?: string;
  status: "scheduled" | "done" | "cancelled";
  planId?: string;
  planTitle?: string;
  doctorId?: string;
  assistantId?: string;
  doctorName: string;
  assistantName: string;
  records: SessionTreatment[];
  totalPrice: number;
  totalDiscount: number;
  totalInsurance: number;
  totalPatient: number;
  totalAfterDiscount: number;
  doneCount: number;
  plannedCount: number;
  progress: number;
  // طرح
  planTotalSessions?: number;
  planDoneSessions?: number;
  planProgress?: number;
}

// ═══════════════════════════════════════════════
// ساخت جلسات از planStore + records
// ═══════════════════════════════════════════════

const allSessions = computed<SessionView[]>(() => {
  const sessions = getSessionsForPatient(props.patientId);

  return sessions.map((sess) => {
    // ⭐ رکوردهای این جلسه
    const records = getRecordsForPatient(props.patientId).filter((r) => {
      if (r.kind !== "treatment" && r.kind !== "diagnosis") return false;
      return (r as TreatmentRecord).sessionId === sess.id;
    }) as (TreatmentRecord | DiagnosisRecord)[];

    // ⭐ مالی
    let totalPrice = 0;
    let totalDiscount = 0;
    let totalInsurance = 0;
    let totalPatient = 0;
    let totalAfterDiscount = 0;

    const sessionTreatments: SessionTreatment[] = records.map((r) => {
      const rec = r as TreatmentRecord;
      const fin = calculateFinancials({
        price: rec.price || 0,
        discountType: rec.discountType,
        discountValue: rec.discountValue,
        insuranceType: rec.insuranceType,
        insuranceValue: rec.insuranceValue,
      });

      totalPrice += fin.price;
      totalDiscount += fin.discountAmount;
      totalInsurance += fin.insuranceAmount;
      totalPatient += fin.patientAmount;
      totalAfterDiscount += fin.afterDiscount;

      return {
        record: r,
        label:
          r.kind === "treatment"
            ? r.treatmentLabel
            : r.planLabel ?? r.clinicalDx ?? "تشخیص",
        doctorName: rec.doctorId
          ? getStaffById(rec.doctorId)?.name ?? "—"
          : "—",
        assistantName: rec.assistantId
          ? getStaffById(rec.assistantId)?.name ?? "—"
          : "—",
        financials: fin,
      };
    });

    const doneCount = records.filter((r) => r.status === "done").length;
    const plannedCount = records.filter((r) => r.status === "planned").length;
    const total = records.length;
    const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    // ⭐ اطلاعات طرح
    const plan = sess.planId ? getPlanById(sess.planId) : undefined;

    return {
      sessionId: sess.id,
      sessionNumber: sess.sessionNumber,
      sessionTitle: sess.title,
      sessionDate: sess.sessionDate,
      sessionTime: sess.sessionTime,
      status: sess.status,
      planId: sess.planId,
      planTitle: plan?.title,
      doctorId: sess.doctorId,
      assistantId: sess.assistantId,
      doctorName: sess.doctorId
        ? getStaffById(sess.doctorId)?.name ?? "—"
        : "—",
      assistantName: sess.assistantId
        ? getStaffById(sess.assistantId)?.name ?? "—"
        : "—",
      records: sessionTreatments,
      totalPrice,
      totalDiscount,
      totalInsurance,
      totalPatient,
      totalAfterDiscount,
      doneCount,
      plannedCount,
      progress,
    };
  }).sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
});

// ═══════════════════════════════════════════════
// Filters
// ═══════════════════════════════════════════════

const sessions = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  switch (filterMode.value) {
    case "today":
      return allSessions.value.filter((s) => s.sessionDate === today);
    case "upcoming":
      return allSessions.value.filter((s) => s.sessionDate > today);
    case "past":
      return allSessions.value.filter((s) => s.sessionDate < today);
    default:
      return allSessions.value;
  }
});

const counts = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    all: allSessions.value.length,
    today: allSessions.value.filter((s) => s.sessionDate === today).length,
    upcoming: allSessions.value.filter((s) => s.sessionDate > today).length,
    past: allSessions.value.filter((s) => s.sessionDate < today).length,
  };
});

// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════

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

function isToday(date: string): boolean {
  return date === new Date().toISOString().slice(0, 10);
}

function isFuture(date: string): boolean {
  return date > new Date().toISOString().slice(0, 10);
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "done":
      return "✅ انجام‌شده";
    case "cancelled":
      return "❌ لغو‌شده";
    default:
      return "📅 در انتظار";
  }
}

function getStatusClass(status: string): string {
  return status;
}

function openEditSession(sess: SessionView) {
  editingSessionId.value = sess.sessionId;
  sessionModalPlanId.value = sess.planId || "";
  sessionModalPlanTitle.value = sess.planTitle || "";
  showSessionModal.value = true;
}

function onSessionSaved() {
  refresh();
}

// ═══════════════════════════════════════════════
// Print
// ═══════════════════════════════════════════════

function printSession(sess: SessionView) {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>جلسه ${sess.sessionDate}</title>
      <style>
        body { font-family: Tahoma, sans-serif; padding: 20px; }
        h1 { font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
        h2 { font-size: 14px; color: #555; margin-top: 16px; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; font-size: 12px; }
        .meta div { padding: 6px; background: #f5f5f5; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
        th { background: #2563eb; color: #fff; }
        .total { margin-top: 16px; padding: 12px; background: #eff6ff; border-radius: 6px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .total-row.bold { font-weight: bold; border-top: 1px solid #2563eb; padding-top: 6px; margin-top: 6px; }
      </style>
    </head>
    <body>
      <h1>📅 ${formatDate(sess.sessionDate)} ${sess.sessionTime ? `- ${sess.sessionTime}` : ""}</h1>
      <div class="meta">
        ${sess.planTitle ? `<div><strong>طرح:</strong> ${sess.planTitle}</div>` : ""}
        ${sess.sessionNumber ? `<div><strong>جلسه:</strong> ${sess.sessionNumber}</div>` : ""}
        <div><strong>دکتر:</strong> ${sess.doctorName}</div>
        <div><strong>دستیار:</strong> ${sess.assistantName}</div>
      </div>

      <h2>درمان‌ها (${sess.records.length})</h2>
      <table>
        <thead>
          <tr>
            <th>دندان</th>
            <th>درمان</th>
            <th>وضعیت</th>
            <th>قیمت</th>
            <th>تخفیف</th>
            <th>بیمه</th>
            <th>سهم بیمار</th>
          </tr>
        </thead>
        <tbody>
          ${sess.records.map((r) => `
            <tr>
              <td>#${r.record.toothNo}</td>
              <td>${r.label}</td>
              <td>${r.record.status === "done" ? "انجام‌شده" : "طرح"}</td>
              <td>${formatPrice(r.financials.price)}</td>
              <td>${r.financials.discountAmount > 0 ? "- " + formatPrice(r.financials.discountAmount) : "—"}</td>
              <td>${r.financials.insuranceAmount > 0 ? formatPrice(r.financials.insuranceAmount) : "—"}</td>
              <td>${formatPrice(r.financials.patientAmount)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="total">
        <div class="total-row"><span>جمع کل:</span><span>${formatPrice(sess.totalPrice)}</span></div>
        ${sess.totalDiscount > 0 ? `<div class="total-row"><span>تخفیف:</span><span>- ${formatPrice(sess.totalDiscount)}</span></div>` : ""}
        ${sess.totalInsurance > 0 ? `<div class="total-row"><span>سهم بیمه:</span><span>${formatPrice(sess.totalInsurance)}</span></div>` : ""}
        <div class="total-row bold"><span>سهم بیمار:</span><span>${formatPrice(sess.totalPatient)}</span></div>
      </div>

      <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #999;">
        تاریخ چاپ: ${new Date().toLocaleDateString("fa-IR")}
      </div>
    </body>
    </html>
  `;
  const w = window.open("", "_blank");
  if (!w) {
    alert("پاپ‌آپ را فعال کنید");
    return;
  }
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 300);
}
</script>

<template>
  <div
    class="sessions-panel"
    dir="rtl"
  >
    <!-- Header -->
    <div class="panel-header">
      <h3>📅 جلسات</h3>
      <button
        class="btn-rad-toggle"
        @click="showRadiographs = !showRadiographs"
      >
        {{ showRadiographs ? "✕ بستن" : "🖼 رادیوگرافی‌ها" }}
      </button>
    </div>

    <!-- Radiographs -->
    <div
      v-if="showRadiographs"
      class="rad-wrapper"
    >
      <RadiographDisplay :patient-id="patientId" />
    </div>

    <!-- Filters -->
    <div class="filters">
      <button
        :class="['filter-btn', { active: filterMode === 'all' }]"
        @click="filterMode = 'all'"
      >
        همه ({{ counts.all }})
      </button>
      <button
        :class="['filter-btn', { active: filterMode === 'upcoming' }]"
        @click="filterMode = 'upcoming'"
      >
        📅 آینده ({{ counts.upcoming }})
      </button>
      <button
        :class="['filter-btn', { active: filterMode === 'today' }]"
        @click="filterMode = 'today'"
      >
        🟡 امروز ({{ counts.today }})
      </button>
      <button
        :class="['filter-btn', { active: filterMode === 'past' }]"
        @click="filterMode = 'past'"
      >
        ⏳ گذشته ({{ counts.past }})
      </button>
    </div>

    <!-- Empty -->
    <div
      v-if="sessions.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">
        📅
      </div>
      <div>هیچ جلسه‌ای در این فیلتر نیست</div>
      <div class="empty-hint">
        از تب «طرح درمان» جلسه بساز
      </div>
    </div>

    <!-- Sessions List -->
    <div
      v-else
      class="sessions-list"
    >
      <div
        v-for="sess in sessions"
        :key="sess.sessionId"
        :class="[
          'session-card',
          getStatusClass(sess.status),
          {
            expanded: expandedSessionKey === sess.sessionId,
            today: isToday(sess.sessionDate),
            future: isFuture(sess.sessionDate),
          },
        ]"
      >
        <!-- Session Header -->
        <div
          class="session-header"
          @click="toggleExpand(sess.sessionId)"
        >
          <div class="session-date-icon">
            <span class="icon">
              {{
                isToday(sess.sessionDate)
                  ? "🟡"
                  : isFuture(sess.sessionDate)
                    ? "📅"
                    : "✅"
              }}
            </span>
          </div>
          <div class="session-info">
            <div class="session-title">
              {{ formatDate(sess.sessionDate) }}
              <span
                v-if="sess.sessionTime"
                class="time-badge"
              >
                🕐 {{ sess.sessionTime }}
              </span>
              <span
                v-if="sess.planTitle"
                class="plan-badge"
              >
                📋 {{ sess.planTitle }}
                <span v-if="sess.sessionNumber">
                  (جلسه {{ sess.sessionNumber }})
                </span>
              </span>
              <span
                :class="['status-badge-mini', sess.status]"
              >
                {{ getStatusLabel(sess.status) }}
              </span>
            </div>
            <div class="session-meta">
              <span class="meta-item">
                🛠 {{ sess.records.length }} مورد
              </span>
              <span
                v-if="sess.doctorName !== '—'"
                class="meta-item"
              >
                👨‍⚕️ {{ sess.doctorName }}
              </span>
              <span
                v-if="sess.assistantName !== '—'"
                class="meta-item"
              >
                👤 {{ sess.assistantName }}
              </span>
            </div>
          </div>
          <div class="session-total">
            {{ formatPrice(sess.totalPatient) }}
          </div>
          <span class="expand-icon">
            {{ expandedSessionKey === sess.sessionId ? "▲" : "▼" }}
          </span>
        </div>

        <!-- Session Body -->
        <div
          v-if="expandedSessionKey === sess.sessionId"
          class="session-body"
        >
          <!-- Progress -->
          <div class="progress-section">
            <div class="progress-label">
              پیشرفت جلسه: {{ sess.progress }}%
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: sess.progress + '%' }"
              ></div>
            </div>
            <div class="progress-hint">
              ✅ {{ sess.doneCount }} انجام‌شده • ⏳
              {{ sess.plannedCount }} در انتظار
            </div>
          </div>

          <!-- Treatments Table -->
          <table
            v-if="sess.records.length > 0"
            class="data-table"
          >
            <thead>
              <tr>
                <th>دندان</th>
                <th>درمان</th>
                <th>دکتر</th>
                <th>دستیار</th>
                <th>وضعیت</th>
                <th>قیمت</th>
                <th>تخفیف</th>
                <th>بیمه</th>
                <th>سهم بیمار</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in sess.records"
                :key="item.record.id"
                :class="{ 'row-done': item.record.status === 'done' }"
              >
                <td>#{{ item.record.toothNo }}</td>
                <td>{{ item.label }}</td>
                <td>{{ item.doctorName }}</td>
                <td>{{ item.assistantName }}</td>
                <td>
                  <span
                    :class="['status-pill', item.record.status]"
                  >
                    {{
                      item.record.status === "done"
                        ? "✅ انجام"
                        : "⏳ طرح"
                    }}
                  </span>
                </td>
                <td class="price-cell">
                  {{ formatPrice(item.financials.price) }}
                </td>
                <td class="discount-cell">
                  {{
                    item.financials.discountAmount > 0
                      ? "- " + formatPrice(item.financials.discountAmount)
                      : "—"
                  }}
                </td>
                <td class="insurance-cell">
                  {{
                    item.financials.insuranceAmount > 0
                      ? formatPrice(item.financials.insuranceAmount)
                      : "—"
                  }}
                </td>
                <td class="patient-cell">
                  {{ formatPrice(item.financials.patientAmount) }}
                </td>
              </tr>
            </tbody>
          </table>
          <div
            v-else
            class="empty-records"
          >
            هنوز درمانی به این جلسه اضافه نشده
          </div>

          <!-- Financial Summary -->
          <div class="financial-summary">
            <div class="summary-row">
              <span>جمع کل:</span>
              <span>{{ formatPrice(sess.totalPrice) }}</span>
            </div>
            <div
              v-if="sess.totalDiscount > 0"
              class="summary-row discount"
            >
              <span>تخفیف:</span>
              <span>- {{ formatPrice(sess.totalDiscount) }}</span>
            </div>
            <div class="summary-row after-discount">
              <span>بعد از تخفیف:</span>
              <span>{{ formatPrice(sess.totalAfterDiscount) }}</span>
            </div>
            <div
              v-if="sess.totalInsurance > 0"
              class="summary-row insurance"
            >
              <span>سهم بیمه:</span>
              <span>{{ formatPrice(sess.totalInsurance) }}</span>
            </div>
            <div class="summary-row patient total">
              <span>سهم بیمار:</span>
              <span>{{ formatPrice(sess.totalPatient) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="session-actions">
            <button
              class="btn-print"
              @click="printSession(sess)"
            >
              🖨 چاپ جلسه
            </button>
            <button
              class="btn-edit"
              @click="openEditSession(sess)"
            >
              ✏️ ویرایش جلسه
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ⭐ Session Modal -->
    <SessionModal
      :open="showSessionModal"
      :patient-id="patientId"
      :plan-id="sessionModalPlanId"
      :plan-title="sessionModalPlanTitle"
      :session-id="editingSessionId"
      @close="showSessionModal = false"
      @saved="onSessionSaved"
    />
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
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.btn-rad-toggle {
  padding: 6px 12px;
  background: #fff;
  color: #2563eb;
  border: 1px solid #93c5fd;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
}

.btn-rad-toggle:hover {
  background: #eff6ff;
}

.rad-wrapper {
  padding: 8px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.filters {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 5px 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  color: #6b7280;
  transition: all 0.15s;
  white-space: nowrap;
}

.filter-btn:hover {
  background: #f9fafb;
  border-color: #93c5fd;
}

.filter-btn.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
  font-weight: 600;
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
  transition: all 0.15s;
}

.session-card.today {
  border-right-color: #2563eb;
  background: #fefeff;
}

.session-card.future {
  border-right-color: #f59e0b;
  background: #fffef9;
}

.session-card.cancelled {
  border-right-color: #dc2626;
  opacity: 0.6;
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
  margin-bottom: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.time-badge {
  font-size: 10px;
  padding: 1px 6px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 10px;
  font-weight: 600;
}

.plan-badge {
  font-size: 10px;
  padding: 1px 6px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 10px;
  font-weight: 600;
}

.status-badge-mini {
  font-size: 9px;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 700;
}

.status-badge-mini.done {
  background: #dcfce7;
  color: #166534;
}

.status-badge-mini.scheduled {
  background: #fef3c7;
  color: #92400e;
}

.status-badge-mini.cancelled {
  background: #fee2e2;
  color: #991b1b;
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
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-section {
  padding: 8px 10px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.progress-label {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-hint {
  font-size: 10px;
  color: #6b7280;
  margin-top: 4px;
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
  white-space: nowrap;
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

.status-pill.done {
  background: #dcfce7;
  color: #166534;
}

.status-pill.planned {
  background: #fef3c7;
  color: #92400e;
}

.price-cell {
  white-space: nowrap;
}

.discount-cell {
  color: #dc2626;
  white-space: nowrap;
}

.insurance-cell {
  color: #2563eb;
  white-space: nowrap;
}

.patient-cell {
  color: #059669;
  font-weight: 600;
  white-space: nowrap;
}

.financial-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #374151;
}

.summary-row span:last-child {
  font-weight: 600;
}

.summary-row.discount {
  color: #dc2626;
}

.summary-row.insurance {
  color: #2563eb;
}

.summary-row.after-discount {
  border-top: 1px dashed #d1d5db;
  padding-top: 4px;
  margin-top: 4px;
}

.summary-row.patient.total {
  border-top: 2px solid #16a34a;
  padding-top: 6px;
  margin-top: 4px;
  font-size: 13px;
  color: #065f46;
}

.empty-records {
  padding: 12px;
  text-align: center;
  font-size: 11px;
  color: #9ca3af;
  background: #fff;
  border: 1px dashed #e5e7eb;
  border-radius: 6px;
}

.session-actions {
  display: flex;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px dashed #e5e7eb;
}

.btn-print,
.btn-edit {
  padding: 6px 12px;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
}

.btn-print:hover,
.btn-edit:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1e40af;
}

@media (max-width: 900px) {
  .data-table {
    font-size: 10px;
  }
  .data-table th,
  .data-table td {
    padding: 4px 5px;
  }
}
</style>