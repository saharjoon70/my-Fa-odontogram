<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  getPlansForPatient,
  getSessionsForPlan,
  type TreatmentPlan,
  type PlanStatus,
  type TreatmentSession,
} from "./treatmentPlanStore";
import { onStateChange, onSelectionChange, getSelectedTeeth } from "../odontogram";
import {
  getRecordsForPlan,
  getRecordsForSession,
} from "./applyTreatment";
import type { OdontogramRecord } from "./treatmentStore";

const props = defineProps<{
  patientId: string;
}>();

const expandedPlanId = ref<string | null>(null);
const selectedTeeth = ref<number[]>([]);

let unsubState: (() => void) | undefined;
let unsubSel: (() => void) | undefined;

function refresh() {
  selectedTeeth.value = getSelectedTeeth();
}

onMounted(() => {
  refresh();
  unsubState = onStateChange(() => refresh());
  unsubSel = onSelectionChange(() => refresh());
});

onUnmounted(() => {
  unsubState?.();
  unsubSel?.();
});

const plans = computed(() => getPlansForPatient(props.patientId));

function toggleExpand(planId: string) {
  expandedPlanId.value = expandedPlanId.value === planId ? null : planId;
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

function getPlanStats(planId: string) {
  const sessions = getSessionsForPlan(planId);
  const records = getRecordsForPlan(props.patientId, planId);
  const done = records.filter((r) => "status" in r && r.status === "done").length;
  const planned = records.filter((r) => "status" in r && r.status === "planned").length;
  const total = records.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const totalPrice = records.reduce((sum, r) => {
    if ("price" in r && typeof r.price === "number") return sum + r.price;
    return sum;
  }, 0);
  const donePrice = records
    .filter((r) => "status" in r && r.status === "done")
    .reduce((sum, r) => {
      if ("price" in r && typeof r.price === "number") return sum + r.price;
      return sum;
    }, 0);
  const remainingPrice = totalPrice - donePrice;

  return {
    sessions: sessions.length,
    done,
    planned,
    total,
    progress,
    totalPrice,
    donePrice,
    remainingPrice,
  };
}

function getRecordLabelLocal(rec: OdontogramRecord): string {
  if (rec.kind === "treatment") return rec.treatmentLabel;
  if (rec.kind === "diagnosis") return rec.planLabel ?? rec.clinicalDx ?? "تشخیص";
  return rec.itemId;
}

const STATUS_LABELS: Record<PlanStatus, string> = {
  planned: "برنامه‌ریزی‌شده",
  "in-progress": "در حال انجام",
  completed: "تکمیل‌شده",
  cancelled: "لغو شده",
};

const STATUS_COLORS: Record<PlanStatus, string> = {
  planned: "#f59e0b",
  "in-progress": "#2563eb",
  completed: "#16a34a",
  cancelled: "#dc2626",
};

// ═══ Print ═══
function printPlan(plan: TreatmentPlan) {
  const stats = getPlanStats(plan.id);
  const sessions = getSessionsForPlan(plan.id);
  const records = getRecordsForPlan(props.patientId, plan.id);

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>طرح درمان - ${plan.title}</title>
      <style>
        body { font-family: Tahoma, sans-serif; padding: 20px; color: #111; }
        h1 { font-size: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0; font-size: 13px; }
        .meta div { padding: 6px; background: #f5f5f5; border-radius: 4px; }
        .meta strong { color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
        th { background: #2563eb; color: #fff; }
        tr:nth-child(even) { background: #f9f9f9; }
        .progress-bar { height: 20px; background: #e5e7eb; border-radius: 10px; overflow: hidden; margin: 8px 0; }
        .progress-fill { height: 100%; background: #16a34a; transition: width 0.3s; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0; }
        .stat { padding: 10px; background: #eff6ff; border-radius: 6px; text-align: center; }
        .stat-value { font-size: 18px; font-weight: bold; color: #1e40af; }
        .stat-label { font-size: 11px; color: #666; margin-top: 4px; }
      </style>
    </head>
    <body>
      <h1>📋 ${plan.title}</h1>
      <div class="meta">
        <div><strong>تاریخ شروع:</strong> ${formatDate(plan.startDate)}</div>
        <div><strong>وضعیت:</strong> ${STATUS_LABELS[plan.status]}</div>
        <div><strong>دندان‌ها:</strong> ${plan.toothNos.join(", ") || "—"}</div>
        <div><strong>تعداد جلسات:</strong> ${stats.sessions}</div>
      </div>

      <h2>پیشرفت طرح</h2>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${stats.progress}%"></div>
      </div>
      <div style="text-align:center; font-size: 14px; margin-bottom: 12px;">${stats.progress}%</div>

      <div class="stats">
        <div class="stat">
          <div class="stat-value">${stats.done}/${stats.total}</div>
          <div class="stat-label">درمان انجام‌شده</div>
        </div>
        <div class="stat">
          <div class="stat-value">${formatPrice(stats.donePrice)}</div>
          <div class="stat-label">هزینه‌ی انجام‌شده</div>
        </div>
        <div class="stat">
          <div class="stat-value">${formatPrice(stats.remainingPrice)}</div>
          <div class="stat-label">باقی‌مانده</div>
        </div>
      </div>

      <h2>جلسات</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>عنوان</th>
            <th>تاریخ</th>
            <th>وضعیت</th>
          </tr>
        </thead>
        <tbody>
          ${sessions.map((s) => `
            <tr>
              <td>${s.sessionNumber}</td>
              <td>${s.title}</td>
              <td>${formatDate(s.sessionDate)}</td>
              <td>${s.status === "done" ? "انجام‌شده" : s.status === "cancelled" ? "لغو" : "در انتظار"}</td>
            </tr>
          `).join("") || "<tr><td colspan='4' style='text-align:center'>—</td></tr>"}
        </tbody>
      </table>

      <h2>درمان‌ها (${records.length})</h2>
      <table>
        <thead>
          <tr>
            <th>دندان</th>
            <th>درمان</th>
            <th>وضعیت</th>
            <th>قیمت</th>
          </tr>
        </thead>
        <tbody>
          ${records.map((r) => `
            <tr>
              <td>#${r.toothNo}</td>
              <td>${getRecordLabelLocal(r)}</td>
              <td>${"status" in r && r.status === "done" ? "انجام‌شده" : "طرح"}</td>
              <td>${"price" in r && r.price ? formatPrice(r.price) : "—"}</td>
            </tr>
          `).join("") || "<tr><td colspan='4' style='text-align:center'>—</td></tr>"}
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #999;">
        تاریخ چاپ: ${new Date().toLocaleDateString("fa-IR")}
      </div>
    </body>
    </html>
  `;

  const w = window.open("", "_blank");
  if (!w) {
    alert("برای چاپ، لطفاً پاپ‌آپ را فعال کنید");
    return;
  }
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 300);
}
</script>

<template>
  <div
    class="plan-panel"
    dir="rtl"
  >
    <div class="panel-header">
      <h3>📋 طرح‌های درمان</h3>
      <div class="header-hint">
        برای ساخت طرح جدید به تب «درمان/طرح» بروید
      </div>
    </div>

    <div
      v-if="plans.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">📋</div>
      <div>هنوز طرح درمانی ثبت نشده</div>
      <div class="empty-hint">از تب «درمان/طرح» یه درمان ثبت کن و حالت رو «طرح درمان» بذار</div>
    </div>

    <div
      v-else
      class="plans-list"
    >
      <div
        v-for="plan in plans"
        :key="plan.id"
        :class="['plan-card', { expanded: expandedPlanId === plan.id }]"
      >
        <!-- Plan header -->
        <div
          class="plan-header"
          @click="toggleExpand(plan.id)"
        >
          <span
            class="plan-color"
            :style="{ background: plan.color || '#2563eb' }"
          ></span>
          <div class="plan-title-wrap">
            <div class="plan-title">{{ plan.title }}</div>
            <div class="plan-meta">
              <span
                class="plan-status"
                :style="{
                  background: STATUS_COLORS[plan.status] + '20',
                  color: STATUS_COLORS[plan.status],
                }"
              >
                {{ STATUS_LABELS[plan.status] }}
              </span>
              <span class="plan-date">📅 {{ formatDate(plan.startDate) }}</span>
              <span class="plan-teeth">🦷 {{ plan.toothNos.length }}</span>
            </div>
          </div>
          <div class="progress-mini">
            <div class="progress-bar-mini">
              <div
                class="progress-fill-mini"
                :style="{ width: getPlanStats(plan.id).progress + '%' }"
              ></div>
            </div>
            <span class="progress-text-mini">{{ getPlanStats(plan.id).progress }}%</span>
          </div>
          <span class="expand-icon">{{ expandedPlanId === plan.id ? "▲" : "▼" }}</span>
        </div>

        <!-- Plan body -->
        <div
          v-if="expandedPlanId === plan.id"
          class="plan-body"
        >
          <!-- Stats grid -->
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">{{ getPlanStats(plan.id).total }}</div>
              <div class="stat-label">کل درمان‌ها</div>
            </div>
            <div class="stat-box green">
              <div class="stat-value">{{ getPlanStats(plan.id).done }}</div>
              <div class="stat-label">انجام‌شده</div>
            </div>
            <div class="stat-box orange">
              <div class="stat-value">{{ getPlanStats(plan.id).planned }}</div>
              <div class="stat-label">در انتظار</div>
            </div>
            <div class="stat-box blue">
              <div class="stat-value">{{ formatPrice(getPlanStats(plan.id).donePrice) }}</div>
              <div class="stat-label">هزینه‌ی انجام</div>
            </div>
            <div class="stat-box purple">
              <div class="stat-value">{{ formatPrice(getPlanStats(plan.id).totalPrice) }}</div>
              <div class="stat-label">هزینه‌ی کل</div>
            </div>
            <div class="stat-box red">
              <div class="stat-value">{{ formatPrice(getPlanStats(plan.id).remainingPrice) }}</div>
              <div class="stat-label">باقی‌مانده</div>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="progress-section">
            <div class="progress-label">
              پیشرفت طرح: {{ getPlanStats(plan.id).progress }}%
            </div>
            <div class="progress-bar-large">
              <div
                class="progress-fill-large"
                :style="{ width: getPlanStats(plan.id).progress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Sessions table -->
          <div
            v-if="getSessionsForPlan(plan.id).length > 0"
            class="sessions-section"
          >
            <h5 class="section-subtitle">📅 جلسات</h5>
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>عنوان</th>
                  <th>تاریخ</th>
                  <th>وضعیت</th>
                  <th>هزینه</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="sess in getSessionsForPlan(plan.id)"
                  :key="sess.id"
                >
                  <td><span class="num-badge">{{ sess.sessionNumber }}</span></td>
                  <td>{{ sess.title }}</td>
                  <td>{{ formatDate(sess.sessionDate) }}</td>
                  <td>
                    <span :class="['status-pill', sess.status]">
                      {{ sess.status === "done" ? "✅ انجام" : sess.status === "cancelled" ? "❌ لغو" : "📅 در انتظار" }}
                    </span>
                  </td>
                  <td class="price-cell">
                    {{ formatPrice(getRecordsForSession(props.patientId, sess.id).reduce((s, r) => s + ("price" in r && typeof r.price === "number" ? r.price : 0), 0)) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Records table -->
          <div
            v-if="getRecordsForPlan(props.patientId, plan.id).length > 0"
            class="records-section"
          >
            <h5 class="section-subtitle">🛠 درمان‌ها</h5>
            <table class="data-table">
              <thead>
                <tr>
                  <th>دندان</th>
                  <th>درمان</th>
                  <th>وضعیت</th>
                  <th>قیمت</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="rec in getRecordsForPlan(props.patientId, plan.id)"
                  :key="rec.id"
                  :class="{ 'row-done': 'status' in rec && rec.status === 'done' }"
                >
                  <td>#{{ rec.toothNo }}</td>
                  <td>{{ getRecordLabelLocal(rec) }}</td>
                  <td>
                    <span :class="['status-pill', 'status' in rec ? rec.status : 'planned']">
                      {{ "status" in rec && rec.status === "done" ? "✅ انجام" : "⏳ طرح" }}
                    </span>
                  </td>
                  <td class="price-cell">
                    {{ "price" in rec && rec.price ? formatPrice(rec.price) : "—" }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Actions -->
          <div class="plan-actions">
            <button
              class="btn-print"
              @click="printPlan(plan)"
            >
              🖨 چاپ طرح
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plan-panel {
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

.plans-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
}

.plan-card.expanded {
  border-color: #93c5fd;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
}

.plan-header:hover {
  background: #f9fafb;
}

.plan-color {
  width: 4px;
  height: 36px;
  border-radius: 2px;
  flex-shrink: 0;
}

.plan-title-wrap {
  flex: 1;
  min-width: 0;
}

.plan-title {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.plan-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 10px;
  align-items: center;
}

.plan-status {
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.plan-date,
.plan-teeth {
  color: #6b7280;
}

.progress-mini {
  display: flex;
  align-items: center;
  gap: 6px;
}

.progress-bar-mini {
  width: 60px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: #16a34a;
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text-mini {
  font-size: 10px;
  font-weight: 700;
  color: #16a34a;
}

.expand-icon {
  color: #9ca3af;
  font-size: 10px;
}

/* Plan body */
.plan-body {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.stat-box {
  padding: 8px 6px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: center;
}

.stat-box.green { background: #f0fdf4; border-color: #bbf7d0; }
.stat-box.orange { background: #fffbeb; border-color: #fde68a; }
.stat-box.blue { background: #eff6ff; border-color: #bfdbfe; }
.stat-box.purple { background: #faf5ff; border-color: #e9d5ff; }
.stat-box.red { background: #fef2f2; border-color: #fecaca; }

.stat-value {
  font-size: 12px;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 9.5px;
  color: #6b7280;
  margin-top: 2px;
}

.progress-section {
  padding: 10px;
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

.progress-bar-large {
  height: 10px;
  background: #e5e7eb;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill-large {
  height: 100%;
  background: linear-gradient(90deg, #16a34a, #22c55e);
  border-radius: 5px;
  transition: width 0.3s;
}

.section-subtitle {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

/* Data table */
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

.data-table tr:hover td {
  background: #fafbfc;
}

.data-table tr.row-done td {
  background: #f0fdf4;
}

.num-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #2563eb;
  color: #fff;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
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

.plan-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px dashed #e5e7eb;
}

.btn-print {
  padding: 8px 16px;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.15s;
}

.btn-print:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1e40af;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>