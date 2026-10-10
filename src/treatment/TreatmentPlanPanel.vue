<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  getPlanGroupsForPatient,
  type PlanGroup,
} from "./applyTreatment";
import { onStateChange, onSelectionChange } from "../odontogram";
import { getStaffById } from "./treatmentPlanStore";
import SessionModal from "./SessionModal.vue";

const props = defineProps<{
  patientId: string;
}>();

const expandedPlanId = ref<string | null>(null);
const expandedSessionKey = ref<string | null>(null);

// ⭐ Session Modal
const showSessionModal = ref(false);
const sessionModalPlanId = ref<string>("");
const sessionModalPlanTitle = ref<string>("");
const editingSessionId = ref<string | undefined>(undefined);

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

const plans = computed(() => getPlanGroupsForPatient(props.patientId));

function toggleExpand(planId: string) {
  expandedPlanId.value = expandedPlanId.value === planId ? null : planId;
}

function toggleSession(key: string) {
  expandedSessionKey.value = expandedSessionKey.value === key ? null : key;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR");
  } catch {
    return iso;
  }
}

function getDoctorName(id?: string): string {
  if (!id) return "—";
  return getStaffById(id)?.name ?? "—";
}

function getAssistantName(id?: string): string {
  if (!id) return "—";
  return getStaffById(id)?.name ?? "—";
}

function getSessionStatusLabel(status: string): string {
  switch (status) {
    case "done":
      return "✅ انجام‌شده";
    case "cancelled":
      return "❌ لغو";
    default:
      return "📅 در انتظار";
  }
}

function getSessionStatusClass(status: string): string {
  return status;
}

// ⭐ باز کردن modal جلسه‌ی جدید
function openNewSession(plan: PlanGroup) {
  sessionModalPlanId.value = plan.planId;
  sessionModalPlanTitle.value = plan.planTitle;
  editingSessionId.value = undefined;
  showSessionModal.value = true;
}

// ⭐ ویرایش جلسه
function openEditSession(sessionId: string, planId: string, planTitle: string) {
  sessionModalPlanId.value = planId;
  sessionModalPlanTitle.value = planTitle;
  editingSessionId.value = sessionId;
  showSessionModal.value = true;
}

function onSessionSaved() {
  refresh();
}
</script>

<template>
  <div
    class="plan-panel"
    dir="rtl"
  >
    <!-- Header -->
    <div class="panel-header">
      <h3>📋 طرح‌های درمان</h3>
    </div>

    <!-- Empty -->
    <div
      v-if="plans.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">
        📋
      </div>
      <div>هنوز طرح درمانی ثبت نشده</div>
      <div class="empty-hint">
        از تب «درمان / طرح» یه درمان ثبت کن و حالت رو «طرح درمان» بذار
      </div>
    </div>

    <!-- Plans List -->
    <div
      v-else
      class="plans-list"
    >
      <div
        v-for="plan in plans"
        :key="plan.planId"
        :class="['plan-card', { expanded: expandedPlanId === plan.planId }]"
      >
        <!-- Plan Header -->
        <div
          class="plan-header"
          @click="toggleExpand(plan.planId)"
        >
          <span class="plan-color"></span>
          <div class="plan-title-wrap">
            <div class="plan-title">
              {{ plan.planTitle }}
            </div>
            <div class="plan-meta">
              <span
                v-if="plan.doctorId"
                class="plan-doctor"
              >
                👨‍⚕️ {{ getDoctorName(plan.doctorId) }}
              </span>
              <span class="plan-date">
                📅 {{ formatDate(plan.startDate) }}
              </span>
              <span class="plan-teeth">
                🦷 {{ plan.toothNos.length }}
              </span>
              <span class="plan-sessions">
                📁 {{ plan.totalSessions }} جلسه
              </span>
            </div>
          </div>
          <div class="progress-mini">
            <div class="progress-bar-mini">
              <div
                class="progress-fill-mini"
                :style="{ width: plan.progress + '%' }"
              ></div>
            </div>
            <span class="progress-text-mini">
              {{ plan.progress }}%
            </span>
          </div>
          <span class="expand-icon">
            {{ expandedPlanId === plan.planId ? "▲" : "▼" }}
          </span>
        </div>

        <!-- Plan Body -->
        <div
          v-if="expandedPlanId === plan.planId"
          class="plan-body"
        >
          <!-- Stats -->
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">
                {{ plan.totalCount }}
              </div>
              <div class="stat-label">کل درمان</div>
            </div>
            <div class="stat-box green">
              <div class="stat-value">
                {{ plan.doneCount }}
              </div>
              <div class="stat-label">انجام‌شده</div>
            </div>
            <div class="stat-box orange">
              <div class="stat-value">
                {{ plan.plannedCount }}
              </div>
              <div class="stat-label">در انتظار</div>
            </div>
            <div class="stat-box blue">
              <div class="stat-value">
                {{ plan.totalSessions }}
              </div>
              <div class="stat-label">کل جلسات</div>
            </div>
            <div class="stat-box purple">
              <div class="stat-value">
                {{ plan.doneSessions }}
              </div>
              <div class="stat-label">جلسات انجام‌شده</div>
            </div>
            <div class="stat-box red">
              <div class="stat-value">
                {{ plan.totalSessions - plan.doneSessions }}
              </div>
              <div class="stat-label">جلسات باقی‌مانده</div>
            </div>
          </div>

          <!-- Progress -->
          <div class="progress-section">
            <div class="progress-label">
              پیشرفت طرح: {{ plan.progress }}%
            </div>
            <div class="progress-bar-large">
              <div
                class="progress-fill-large"
                :style="{ width: plan.progress + '%' }"
              ></div>
            </div>
            <div class="progress-hint">
              ✅ {{ plan.doneSessions }} جلسه از
              {{ plan.totalSessions }} انجام شده
            </div>
          </div>

          <!-- Sessions -->
          <div class="sessions-section">
            <div class="section-header-row">
              <h5 class="section-subtitle">
                📁 جلسات ({{ plan.totalSessions }})
              </h5>
              <button
                class="btn-add-session"
                @click.stop="openNewSession(plan)"
              >
                + ثبت جلسه
              </button>
            </div>

            <div
              v-if="plan.sessions.length > 0"
              class="sessions-list"
            >
              <div
                v-for="sess in plan.sessions"
                :key="sess.sessionId"
                class="session-item"
              >
                <div
                  class="session-header-row"
                  @click="toggleSession(`${plan.planId}-${sess.sessionId}`)"
                >
                  <span
                    :class="[
                      'session-num',
                      getSessionStatusClass(sess.status),
                    ]"
                  >
                    {{ sess.sessionNumber }}
                  </span>
                  <span class="session-title">{{ sess.sessionTitle }}</span>
                  <span class="session-date">
                    📅 {{ formatDate(sess.sessionDate) }}
                  </span>
                  <span class="session-count">
                    {{ sess.totalCount }} درمان
                  </span>
                  <span
                    :class="[
                      'session-status-pill',
                      getSessionStatusClass(sess.status),
                    ]"
                  >
                    {{ getSessionStatusLabel(sess.status) }}
                  </span>
                  <button
                    class="btn-edit-session"
                    title="ویرایش"
                    @click.stop="
                      openEditSession(sess.sessionId, plan.planId, plan.planTitle)
                    "
                  >
                    ✏️
                  </button>
                  <span class="expand-mini">
                    {{
                      expandedSessionKey ===
                      `${plan.planId}-${sess.sessionId}`
                        ? "▲"
                        : "▼"
                    }}
                  </span>
                </div>

                <div
                  v-if="
                    expandedSessionKey ===
                    `${plan.planId}-${sess.sessionId}`
                  "
                  class="session-records"
                >
                  <div class="session-info-grid">
                    <div class="info-item">
                      <span class="info-label">👨‍⚕️ دکتر:</span>
                      <span class="info-value">
                        {{ getDoctorName(sess.doctorId) }}
                      </span>
                    </div>
                    <div
                      v-if="sess.assistantId"
                      class="info-item"
                    >
                      <span class="info-label">👤 دستیار:</span>
                      <span class="info-value">
                        {{ getAssistantName(sess.assistantId) }}
                      </span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">⏰ ساعت:</span>
                      <span class="info-value">
                        {{ sess.sessionTime || "—" }}
                      </span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">📊 پیشرفت:</span>
                      <span class="info-value">
                        {{ sess.progress }}%
                      </span>
                    </div>
                  </div>

                  <table
                    v-if="sess.records.length > 0"
                    class="data-table"
                  >
                    <thead>
                      <tr>
                        <th>دندان</th>
                        <th>درمان</th>
                        <th>وضعیت</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="rec in sess.records"
                        :key="rec.id"
                        :class="{ 'row-done': rec.status === 'done' }"
                      >
                        <td>#{{ rec.toothNo }}</td>
                        <td>{{ rec.treatmentLabel }}</td>
                        <td>
                          <span
                            :class="['status-pill', rec.status]"
                          >
                            {{
                              rec.status === "done"
                                ? "✅ انجام"
                                : "⏳ طرح"
                            }}
                          </span>
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
                </div>
              </div>
            </div>
            <div
              v-else
              class="empty-sessions"
            >
              هنوز جلسه‌ای برای این طرح ثبت نشده — با دکمه «+ ثبت جلسه» شروع کن
            </div>
          </div>

          <!-- Records -->
          <div class="records-section">
            <h5 class="section-subtitle">
              🛠 درمان‌ها ({{ plan.totalCount }})
            </h5>
            <table class="data-table">
              <thead>
                <tr>
                  <th>دندان</th>
                  <th>درمان</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="rec in plan.records"
                  :key="rec.id"
                  :class="{ 'row-done': rec.status === 'done' }"
                >
                  <td>#{{ rec.toothNo }}</td>
                  <td>{{ rec.treatmentLabel }}</td>
                  <td>
                    <span :class="['status-pill', rec.status]">
                      {{ rec.status === "done" ? "✅ انجام" : "⏳ طرح" }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
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
  background: #f59e0b;
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
  color: #6b7280;
}

.plan-doctor {
  color: #2563eb;
  font-weight: 600;
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
  background: #f59e0b;
  transition: width 0.3s;
}

.progress-text-mini {
  font-size: 10px;
  font-weight: 700;
  color: #f59e0b;
}

.expand-icon {
  color: #9ca3af;
  font-size: 10px;
}

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

.stat-box.green {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.stat-box.orange {
  background: #fffbeb;
  border-color: #fde68a;
}
.stat-box.blue {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.stat-box.purple {
  background: #faf5ff;
  border-color: #e9d5ff;
}
.stat-box.red {
  background: #fef2f2;
  border-color: #fecaca;
}

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
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  border-radius: 5px;
  transition: width 0.3s;
}

.progress-hint {
  font-size: 10px;
  color: #6b7280;
  margin-top: 4px;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-subtitle {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.btn-add-session {
  padding: 4px 10px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  transition: background 0.15s;
}

.btn-add-session:hover {
  background: #1d4ed8;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.session-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.session-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 11px;
}

.session-header-row:hover {
  background: #f9fafb;
}

.session-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: #f59e0b;
  color: #fff;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.session-num.done {
  background: #16a34a;
}
.session-num.cancelled {
  background: #dc2626;
}

.session-title {
  flex: 1;
  font-weight: 600;
  color: #1f2937;
}

.session-date {
  color: #6b7280;
  font-size: 10px;
}

.session-count {
  color: #2563eb;
  font-size: 10px;
}

.session-status-pill {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 9.5px;
  font-weight: 600;
  white-space: nowrap;
}

.session-status-pill.scheduled {
  background: #fef3c7;
  color: #92400e;
}
.session-status-pill.done {
  background: #dcfce7;
  color: #166534;
}
.session-status-pill.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.btn-edit-session {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 12px;
}

.btn-edit-session:hover {
  background: #f3f4f6;
}

.expand-mini {
  color: #9ca3af;
  font-size: 9px;
}

.session-records {
  padding: 10px;
  background: #fafbfc;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 6px;
  padding: 8px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
}

.info-label {
  color: #6b7280;
  font-size: 10px;
}

.info-value {
  font-weight: 600;
  color: #111827;
}

.empty-sessions,
.empty-records {
  padding: 12px;
  text-align: center;
  font-size: 11px;
  color: #9ca3af;
  background: #fff;
  border: 1px dashed #e5e7eb;
  border-radius: 6px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
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
}

.status-pill.done {
  background: #dcfce7;
  color: #166534;
}

.status-pill.planned {
  background: #fef3c7;
  color: #92400e;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>