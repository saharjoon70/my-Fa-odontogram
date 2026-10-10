<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  addSession,
  updateSession,
  removeSession,
  getSessionById,
  getNextSessionNumber,
  getSessionsForPlan,
  getDoctors,
  getAssistants,
  type SessionStatus,
} from "./treatmentPlanStore";
import { getRecordsForPatient } from "./treatmentStore";
import type { TreatmentRecord } from "./treatmentStore";

// ═══ Props & Emits ═══
const props = defineProps<{
  open: boolean;
  patientId: string;
  planId: string;
  planTitle?: string;
  sessionId?: string; // ⭐ اگه داشته باشه → حالت ویرایش
}>();

const emit = defineEmits<{
  close: [];
  saved: [sessionId: string];
}>();

// ═══ Computed ═══
const isEditMode = computed(() => !!props.sessionId);

const doctors = computed(() => getDoctors());
const assistants = computed(() => getAssistants());

const nextSessionNumber = computed(() =>
  props.planId ? getNextSessionNumber(props.planId) : 1,
);

// ═══ Form state ═══
const sessionNumber = ref(1);
const title = ref("");
const sessionDate = ref(new Date().toISOString().slice(0, 10));
const sessionTime = ref("10:00");
const status = ref<SessionStatus>("scheduled");
const doctorId = ref("");
const assistantId = ref("");
const note = ref("");

// ═══ Preview تعداد درمان ═══
const existingTreatments = computed(() => {
  if (!props.sessionId) return 0;
  return getRecordsForPatient(props.patientId).filter(
    (r): r is TreatmentRecord =>
      r.kind === "treatment" && r.sessionId === props.sessionId,
  ).length;
});

// ═══ Watch: open → load form ═══
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) loadForm();
  },
  { immediate: true },
);

function loadForm() {
  if (props.sessionId) {
    // ⭐ ویرایش
    const sess = getSessionById(props.sessionId);
    if (sess) {
      sessionNumber.value = sess.sessionNumber;
      title.value = sess.title;
      sessionDate.value = sess.sessionDate;
      sessionTime.value = sess.sessionTime ?? "10:00";
      status.value = sess.status;
      doctorId.value = sess.doctorId ?? "";
      assistantId.value = sess.assistantId ?? "";
      note.value = sess.note ?? "";
    }
  } else {
    // ⭐ جدید
    sessionNumber.value = nextSessionNumber.value;
    title.value = `جلسه ${nextSessionNumber.value}`;
    sessionDate.value = new Date().toISOString().slice(0, 10);
    sessionTime.value = "10:00";
    status.value = "scheduled";
    doctorId.value = doctors.value[0]?.id ?? "";
    assistantId.value = "";
    note.value = "";
  }
}

// ═══ عنوان پیشنهادی ═══
function suggestTitle() {
  if (!title.value || title.value.startsWith("جلسه ")) {
    title.value = `جلسه ${sessionNumber.value}`;
  }
}

// ═══ Save ═══
function save() {
  if (!title.value.trim()) {
    alert("عنوان جلسه را وارد کنید");
    return;
  }
  if (!sessionDate.value) {
    alert("تاریخ جلسه را وارد کنید");
    return;
  }

  if (isEditMode.value && props.sessionId) {
    // ⭐ ویرایش
    updateSession(props.sessionId, {
      sessionNumber: sessionNumber.value,
      title: title.value.trim(),
      sessionDate: sessionDate.value,
      sessionTime: sessionTime.value,
      status: status.value,
      doctorId: doctorId.value || undefined,
      assistantId: assistantId.value || undefined,
      note: note.value.trim() || undefined,
    });
    emit("saved", props.sessionId);
  } else {
    // ⭐ جدید
    const newSess = addSession({
      patientId: props.patientId,
      planId: props.planId,
      sessionNumber: sessionNumber.value,
      title: title.value.trim(),
      sessionDate: sessionDate.value,
      sessionTime: sessionTime.value,
      status: status.value,
      doctorId: doctorId.value || undefined,
      assistantId: assistantId.value || undefined,
      note: note.value.trim() || undefined,
    });
    emit("saved", newSess.id);
  }
  emit("close");
}

// ═══ Delete ═══
function del() {
  if (!props.sessionId) return;
  const count = existingTreatments.value;
  const msg =
    count > 0
      ? `این جلسه حذف شود؟ ${count} درمان مربوطه باقی می‌مونن (فقط لینک قطع می‌شه).`
      : "این جلسه حذف شود؟";
  if (!confirm(msg)) return;
  removeSession(props.sessionId);
  emit("close");
}

// ═══ STATUS_OPTIONS ═══
const STATUS_OPTIONS: { value: SessionStatus; label: string; icon: string }[] =
  [
    { value: "scheduled", label: "در انتظار", icon: "📅" },
    { value: "done", label: "انجام‌شده", icon: "✅" },
    { value: "cancelled", label: "لغو‌شده", icon: "❌" },
  ];

// ═══ آمار جلسات موجود در طرح ═══
const planSessions = computed(() =>
  props.planId ? getSessionsForPlan(props.planId) : [],
);

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="session-modal-backdrop"
      @mousedown.self="emit('close')"
    >
      <div
        class="session-modal"
        dir="rtl"
      >
        <!-- Header -->
        <div class="modal-header">
          <div>
            <h2>{{ isEditMode ? "✏️ ویرایش جلسه" : "📁 جلسه جدید" }}</h2>
            <div
              v-if="planTitle"
              class="subtitle"
            >
              📋 {{ planTitle }}
            </div>
          </div>
          <button
            class="close-btn"
            @click="emit('close')"
            title="بستن"
          >
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- شماره + عنوان -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">
                شماره جلسه <span class="required">*</span>
              </label>
              <input
                v-model.number="sessionNumber"
                type="number"
                min="1"
                class="form-input"
                @change="suggestTitle"
              >
            </div>
            <div class="form-group">
              <label class="form-label">
                عنوان جلسه <span class="required">*</span>
              </label>
              <input
                v-model="title"
                type="text"
                placeholder="مثلاً: تکمیل روکش‌ها"
                class="form-input"
              >
            </div>
          </div>

          <!-- تاریخ + ساعت -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">
                تاریخ <span class="required">*</span>
              </label>
              <input
                v-model="sessionDate"
                type="date"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label class="form-label">ساعت</label>
              <input
                v-model="sessionTime"
                type="time"
                class="form-input"
              >
            </div>
          </div>

          <!-- وضعیت -->
          <div class="form-group">
            <label class="form-label">وضعیت</label>
            <div class="status-options">
              <label
                v-for="opt in STATUS_OPTIONS"
                :key="opt.value"
                :class="['status-option', { active: status === opt.value }]"
              >
                <input
                  v-model="status"
                  type="radio"
                  :value="opt.value"
                >
                <span class="status-icon">{{ opt.icon }}</span>
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </div>

          <!-- تیم درمان -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">👨‍⚕️ دکتر</label>
              <select
                v-model="doctorId"
                class="form-select"
              >
                <option value="">— انتخاب کنید —</option>
                <option
                  v-for="d in doctors"
                  :key="d.id"
                  :value="d.id"
                >
                  {{ d.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">👤 دستیار</label>
              <select
                v-model="assistantId"
                class="form-select"
              >
                <option value="">— بدون دستیار —</option>
                <option
                  v-for="a in assistants"
                  :key="a.id"
                  :value="a.id"
                >
                  {{ a.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- یادداشت -->
          <div class="form-group">
            <label class="form-label">📝 یادداشت</label>
            <textarea
              v-model="note"
              rows="3"
              class="form-textarea"
              placeholder="اختیاری..."
            ></textarea>
          </div>

          <!-- ⭐ در حالت ویرایش: آمار -->
          <div
            v-if="isEditMode && existingTreatments > 0"
            class="stats-info"
          >
            <div class="stat-info-item">
              <span class="stat-info-label">🛠 درمان‌های این جلسه:</span>
              <span class="stat-info-value">{{ existingTreatments }}</span>
            </div>
          </div>

          <!-- ⭐ لیست جلسات دیگه‌ی این طرح -->
          <div
            v-if="planSessions.length > 0"
            class="other-sessions"
          >
            <div class="other-sessions-title">
              📁 جلسات دیگر این طرح:
            </div>
            <div class="other-sessions-list">
              <span
                v-for="s in planSessions.filter((x) => x.id !== sessionId)"
                :key="s.id"
                :class="['other-session-chip', s.status]"
              >
                {{ s.sessionNumber }}. {{ s.title }} ({{
                  formatDate(s.sessionDate)
                }})
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button
            v-if="isEditMode"
            class="btn-danger"
            @click="del"
          >
            🗑 حذف
          </button>
          <div class="spacer"></div>
          <button
            class="btn-secondary"
            @click="emit('close')"
          >
            انصراف
          </button>
          <button
            class="btn-primary"
            @click="save"
          >
            {{ isEditMode ? "💾 ذخیره" : "✅ ایجاد جلسه" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ═══ Backdrop ═══ */
.session-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 210;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fade-in 0.15s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ═══ Modal ═══ */
.session-modal {
  width: min(580px, 96vw);
  max-height: 90vh;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ═══ Header ═══ */
.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

.close-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.15s;
}

.close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

/* ═══ Body ═══ */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #dc2626;
}

.form-input,
.form-select,
.form-textarea {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  background: #fff;
  width: 100%;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

/* ═══ Status Options ═══ */
.status-options {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.status-option {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 11px;
  color: #374151;
  transition: all 0.15s;
}

.status-option input {
  display: none;
}

.status-option:hover {
  background: #f9fafb;
  border-color: #93c5fd;
}

.status-option.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1e40af;
  font-weight: 600;
}

.status-icon {
  font-size: 13px;
}

/* ═══ Stats Info ═══ */
.stats-info {
  padding: 10px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  display: flex;
  gap: 8px;
}

.stat-info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.stat-info-label {
  color: #1e40af;
}

.stat-info-value {
  font-weight: 700;
  color: #1e40af;
}

/* ═══ Other Sessions ═══ */
.other-sessions {
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.other-sessions-title {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 6px;
}

.other-sessions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.other-session-chip {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.other-session-chip.done {
  background: #dcfce7;
  border-color: #bbf7d0;
  color: #166534;
}

.other-session-chip.scheduled {
  background: #fef3c7;
  border-color: #fde68a;
  color: #92400e;
}

.other-session-chip.cancelled {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}

/* ═══ Footer ═══ */
.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
  align-items: center;
  background: #f9fafb;
}

.spacer {
  flex: 1;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 8px 16px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
  border: 1px solid #2563eb;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

.btn-danger {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.btn-danger:hover {
  background: #fecaca;
}

/* ═══ Mobile ═══ */
@media (max-width: 600px) {
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}
</style>