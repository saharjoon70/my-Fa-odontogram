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
import {
  DISCOUNT_PRESETS,
  getInsuranceProviders,
  type DiscountPreset,
  type InsuranceProvider,
} from "./insuranceStore";

const props = defineProps<{
  open: boolean;
  patientId: string;
  planId: string;
  planTitle?: string;
  sessionId?: string;
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

// ⭐ مالی
const hasDiscount = ref(false);
const discountType = ref<"percent" | "amount">("percent");
const discountValue = ref(0);
const discountReason = ref("");
const selectedDiscountPreset = ref<string>("none");

const hasInsurance = ref(false);
const insuranceType = ref<"percent" | "amount">("percent");
const insuranceValue = ref(0);
const insuranceName = ref("");

// ═══ Preview تعداد درمان ═══
const existingTreatments = computed(() => {
  if (!props.sessionId) return 0;
  return getRecordsForPatient(props.patientId).filter(
    (r): r is TreatmentRecord =>
      r.kind === "treatment" && r.sessionId === props.sessionId,
  ).length;
});

// ⭐ جمع قیمت درمان‌ها (برای پیش‌نمایش محاسبات)
const sessionTotalPrice = computed(() => {
  if (!props.sessionId) return 0;
  return getRecordsForPatient(props.patientId)
    .filter(
      (r): r is TreatmentRecord =>
        r.kind === "treatment" && r.sessionId === props.sessionId,
    )
    .reduce((sum, r) => sum + (r.price || 0), 0);
});

// ⭐ محاسبات داینامیک
const discountAmount = computed(() => {
  if (!hasDiscount.value || !discountValue.value) return 0;
  if (discountType.value === "percent") {
    return Math.round((sessionTotalPrice.value * discountValue.value) / 100);
  }
  return Math.min(discountValue.value, sessionTotalPrice.value);
});

const afterDiscount = computed(() =>
  Math.max(0, sessionTotalPrice.value - discountAmount.value),
);

const insuranceAmount = computed(() => {
  if (!hasInsurance.value || !insuranceValue.value) return 0;
  if (insuranceType.value === "percent") {
    return Math.round((afterDiscount.value * insuranceValue.value) / 100);
  }
  return Math.min(insuranceValue.value, afterDiscount.value);
});

const patientAmount = computed(() =>
  Math.max(0, afterDiscount.value - insuranceAmount.value),
);

const insuranceProviders = computed(() => getInsuranceProviders());

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

      // ⭐ تخفیف
      if (sess.discountType && sess.discountValue) {
        hasDiscount.value = true;
        discountType.value = sess.discountType;
        discountValue.value = sess.discountValue;
        discountReason.value = sess.discountReason ?? "";
        const matchPreset = DISCOUNT_PRESETS.find(
          (p) => p.type === sess.discountType && p.value === sess.discountValue,
        );
        selectedDiscountPreset.value = matchPreset?.id ?? "custom";
      } else {
        hasDiscount.value = false;
        discountType.value = "percent";
        discountValue.value = 0;
        discountReason.value = "";
        selectedDiscountPreset.value = "none";
      }

      // ⭐ بیمه
      if (
        sess.insuranceType &&
        sess.insuranceType !== "none" &&
        sess.insuranceValue
      ) {
        hasInsurance.value = true;
        insuranceType.value =
          sess.insuranceType === "amount" ? "amount" : "percent";
        insuranceValue.value = sess.insuranceValue;
        insuranceName.value = sess.insuranceName ?? "";
      } else {
        hasInsurance.value = false;
        insuranceType.value = "percent";
        insuranceValue.value = 0;
        insuranceName.value = "";
      }
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
    hasDiscount.value = false;
    discountType.value = "percent";
    discountValue.value = 0;
    discountReason.value = "";
    selectedDiscountPreset.value = "none";
    hasInsurance.value = false;
    insuranceType.value = "percent";
    insuranceValue.value = 0;
    insuranceName.value = "";
  }
}

// ═══ عنوان پیشنهادی ═══
function suggestTitle() {
  if (!title.value || title.value.startsWith("جلسه ")) {
    title.value = `جلسه ${sessionNumber.value}`;
  }
}

// ═══ Discount presets ═══
function applyDiscountPreset(preset: DiscountPreset) {
  selectedDiscountPreset.value = preset.id;
  if (preset.id === "none") {
    hasDiscount.value = false;
    discountValue.value = 0;
    discountReason.value = "";
  } else if (preset.id === "custom") {
    hasDiscount.value = true;
    discountType.value = "amount";
    discountValue.value = 0;
  } else {
    hasDiscount.value = true;
    discountType.value = preset.type;
    discountValue.value = preset.value;
    discountReason.value = preset.label;
  }
}

function applyInsurance(ins: InsuranceProvider) {
  hasInsurance.value = true;
  insuranceType.value = "percent";
  insuranceValue.value = ins.defaultPercent;
  insuranceName.value = ins.name;
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

  // ⭐ type صریح برای رفع خطای TypeScript
  const financial: {
    discountType?: "percent" | "amount";
    discountValue?: number;
    discountReason?: string;
    insuranceType?: "percent" | "amount" | "none";
    insuranceValue?: number;
    insuranceName?: string;
  } = {
    discountType: hasDiscount.value ? discountType.value : undefined,
    discountValue: hasDiscount.value ? discountValue.value : undefined,
    discountReason: hasDiscount.value ? discountReason.value : undefined,
    insuranceType: hasInsurance.value ? insuranceType.value : "none",
    insuranceValue: hasInsurance.value ? insuranceValue.value : undefined,
    insuranceName: hasInsurance.value ? insuranceName.value : undefined,
  };

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
      ...financial,
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
      ...financial,
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

function formatPrice(n: number): string {
  return n.toLocaleString("fa-IR") + " ت";
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="session-modal-backdrop"
      @mousedown.self="emit('close')"
    >
      <div class="session-modal" dir="rtl">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <h2>{{ isEditMode ? "✏️ ویرایش جلسه" : "📁 جلسه جدید" }}</h2>
            <div v-if="planTitle" class="subtitle">📋 {{ planTitle }}</div>
          </div>
          <button class="close-btn" @click="emit('close')" title="بستن">
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
              />
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
              />
            </div>
          </div>

          <!-- تاریخ + ساعت -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">
                تاریخ <span class="required">*</span>
              </label>
              <input v-model="sessionDate" type="date" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">ساعت</label>
              <input v-model="sessionTime" type="time" class="form-input" />
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
                <input v-model="status" type="radio" :value="opt.value" />
                <span class="status-icon">{{ opt.icon }}</span>
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </div>

          <!-- تیم درمان -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">👨‍⚕️ دکتر</label>
              <select v-model="doctorId" class="form-select">
                <option value="">— انتخاب کنید —</option>
                <option v-for="d in doctors" :key="d.id" :value="d.id">
                  {{ d.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">👤 دستیار</label>
              <select v-model="assistantId" class="form-select">
                <option value="">— بدون دستیار —</option>
                <option v-for="a in assistants" :key="a.id" :value="a.id">
                  {{ a.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- ⭐ مالی جلسه -->
          <div class="financial-section">
            <div class="financial-header">
              💰 مالی — برای کل جلسه
            </div>

            <!-- جمع درمان‌ها -->
            <div v-if="isEditMode && sessionTotalPrice > 0" class="preview-row">
              <span>جمع درمان‌های این جلسه:</span>
              <span>{{ formatPrice(sessionTotalPrice) }}</span>
            </div>

            <!-- تخفیف -->
            <div class="subsection-label">🏷️ تخفیف کل جلسه</div>
            <div class="checkbox-row">
              <label class="checkbox-label">
                <input v-model="hasDiscount" type="checkbox" />
                <span>این جلسه تخفیف دارد</span>
              </label>
            </div>
            <div v-if="hasDiscount" class="sub-panel">
              <div class="preset-chips">
                <button
                  v-for="preset in DISCOUNT_PRESETS"
                  :key="preset.id"
                  :class="[
                    'preset-chip',
                    { active: selectedDiscountPreset === preset.id },
                  ]"
                  :style="
                    selectedDiscountPreset === preset.id
                      ? {
                          background: preset.color,
                          color: '#fff',
                          borderColor: preset.color,
                        }
                      : {}
                  "
                  @click="applyDiscountPreset(preset)"
                >
                  {{ preset.label }}
                </button>
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">نوع</label>
                  <select v-model="discountType" class="form-select">
                    <option value="percent">درصدی</option>
                    <option value="amount">مبلغی</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">مقدار</label>
                  <input
                    v-model.number="discountValue"
                    type="number"
                    min="0"
                    class="form-input"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">دلیل</label>
                <input
                  v-model="discountReason"
                  type="text"
                  class="form-input"
                  placeholder="اختیاری"
                />
              </div>
            </div>

            <!-- بیمه -->
            <div class="subsection-label">🏥 بیمه کل جلسه</div>
            <div class="checkbox-row">
              <label class="checkbox-label">
                <input v-model="hasInsurance" type="checkbox" />
                <span>این جلسه بیمه دارد</span>
              </label>
            </div>
            <div v-if="hasInsurance" class="sub-panel">
              <div class="preset-chips">
                <button
                  v-for="ins in insuranceProviders"
                  :key="ins.id"
                  :class="[
                    'preset-chip',
                    { active: insuranceName === ins.name },
                  ]"
                  :style="
                    insuranceName === ins.name
                      ? {
                          background: ins.color,
                          color: '#fff',
                          borderColor: ins.color,
                        }
                      : {}
                  "
                  @click="applyInsurance(ins)"
                >
                  {{ ins.name }} ({{ ins.defaultPercent }}٪)
                </button>
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">نوع</label>
                  <select v-model="insuranceType" class="form-select">
                    <option value="percent">درصدی</option>
                    <option value="amount">مبلغی</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">مقدار</label>
                  <input
                    v-model.number="insuranceValue"
                    type="number"
                    min="0"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- پیش‌نمایش محاسبات (فقط در ویرایش) -->
            <div v-if="isEditMode && sessionTotalPrice > 0" class="preview-summary">
              <div class="preview-row">
                <span>جمع درمان‌ها:</span>
                <span>{{ formatPrice(sessionTotalPrice) }}</span>
              </div>
              <div v-if="discountAmount > 0" class="preview-row discount">
                <span>تخفیف:</span>
                <span>- {{ formatPrice(discountAmount) }}</span>
              </div>
              <div class="preview-row after-discount">
                <span>بعد از تخفیف:</span>
                <span>{{ formatPrice(afterDiscount) }}</span>
              </div>
              <div v-if="insuranceAmount > 0" class="preview-row insurance">
                <span>سهم بیمه:</span>
                <span>{{ formatPrice(insuranceAmount) }}</span>
              </div>
              <div class="preview-row bold">
                <span>سهم بیمار:</span>
                <span>{{ formatPrice(patientAmount) }}</span>
              </div>
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

          <!-- آمار -->
          <div v-if="isEditMode && existingTreatments > 0" class="stats-info">
            <div class="stat-info-item">
              <span class="stat-info-label">🛠 درمان‌های این جلسه:</span>
              <span class="stat-info-value">{{ existingTreatments }}</span>
            </div>
          </div>

          <!-- جلسات دیگر -->
          <div v-if="planSessions.length > 0" class="other-sessions">
            <div class="other-sessions-title">📁 جلسات دیگر این طرح:</div>
            <div class="other-sessions-list">
              <span
                v-for="s in planSessions.filter((x) => x.id !== sessionId)"
                :key="s.id"
                :class="['other-session-chip', s.status]"
              >
                {{ s.sessionNumber }}. {{ s.title }} ({{ formatDate(s.sessionDate) }})
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button v-if="isEditMode" class="btn-danger" @click="del">
            🗑 حذف
          </button>
          <div class="spacer"></div>
          <button class="btn-secondary" @click="emit('close')">انصراف</button>
          <button class="btn-primary" @click="save">
            {{ isEditMode ? "💾 ذخیره" : "✅ ایجاد جلسه" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
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
  from { opacity: 0; }
  to { opacity: 1; }
}

.session-modal {
  width: min(620px, 96vw);
  max-height: 90vh;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

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
}

.close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

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

/* ⭐ مالی */
.financial-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
}

.financial-header {
  font-size: 12px;
  font-weight: 700;
  color: #065f46;
  padding-bottom: 6px;
  border-bottom: 1px dashed #86efac;
}

.subsection-label {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.checkbox-row {
  padding: 2px 0;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
}

.checkbox-label input {
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: #2563eb;
}

.sub-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.preset-chip {
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 20px;
  cursor: pointer;
  font-family: inherit;
  font-size: 10.5px;
  color: #374151;
  transition: all 0.15s;
}

.preset-chip:hover {
  background: #f0f9ff;
  border-color: #93c5fd;
}

.preset-chip.active {
  font-weight: 600;
  color: #fff;
}

.preview-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: #fff;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  margin-top: 6px;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #374151;
}

.preview-row span:last-child {
  font-weight: 600;
}

.preview-row.discount {
  color: #dc2626;
}

.preview-row.insurance {
  color: #2563eb;
}

.preview-row.after-discount {
  border-top: 1px dashed #d1d5db;
  padding-top: 4px;
  margin-top: 4px;
}

.preview-row.bold {
  border-top: 2px solid #16a34a;
  padding-top: 6px;
  margin-top: 4px;
  font-size: 13px;
  color: #065f46;
}

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

@media (max-width: 600px) {
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}
</style>