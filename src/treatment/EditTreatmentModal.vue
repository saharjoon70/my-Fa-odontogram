<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  MATERIALS,
  SURFACES,
  getSurfaceLabel,
  getSurfaceShort,
  getTreatmentById,
} from "./treatments";
import { getRecordsForTooth, removeRecord } from "./treatmentStore";
import type { TreatmentRecord } from "./treatmentStore";
import { submitTreatment } from "./applyTreatment";
import {
  DISCOUNT_PRESETS,
  getInsuranceProviders,
  type DiscountPreset,
  type InsuranceProvider,
} from "./insuranceStore";

const props = defineProps<{
  open: boolean;
  patientId: string;
  recordId: string; // ⭐ شناسه‌ی رکوردی که باید ویرایش بشه
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

// ═══ Record state ═══
const record = ref<TreatmentRecord | null>(null);
const toothNo = ref<number>(0);

// ═══ Form state ═══
const surface = ref<string>("");
const material = ref("");
const price = ref(0);
const note = ref("");

// ⭐ مالی
const hasDiscount = ref(false);
const discountType = ref<"percent" | "amount">("percent");
const discountValue = ref(0);
const discountReason = ref("");

const hasInsurance = ref(false);
const insuranceType = ref<"percent" | "amount">("percent");
const insuranceValue = ref(0);
const insuranceName = ref("");

// ═══ Load record ═══
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) loadRecord();
  },
  { immediate: true },
);

function loadRecord() {
  // پیدا کردن record توی همه‌ی دندون‌ها
  for (let t = 11; t <= 48; t++) {
    const records = getRecordsForTooth(props.patientId, t);
    const found = records.find((r) => r.id === props.recordId);
    if (found && found.kind === "treatment") {
      record.value = found as TreatmentRecord;
      toothNo.value = t;
      break;
    }
  }

  if (!record.value) return;

  const r = record.value;

  // سطح
  surface.value = r.surface ?? "";

  // جنس
  material.value = r.material ?? "";

  // قیمت
  price.value = r.price ?? 0;

  // یادداشت
  note.value = r.note ?? "";

  // ⭐ تخفیف
  if (r.discountType && r.discountValue) {
    hasDiscount.value = true;
    discountType.value = r.discountType;
    discountValue.value = r.discountValue;
    discountReason.value = r.discountReason ?? "";
  } else {
    hasDiscount.value = false;
    discountType.value = "percent";
    discountValue.value = 0;
    discountReason.value = "";
  }

  // ⭐ بیمه
  if (r.insuranceType && r.insuranceType !== "none") {
    hasInsurance.value = true;
    insuranceType.value =
      r.insuranceType === "amount" ? "amount" : "percent";
    insuranceValue.value = r.insuranceValue ?? 0;
    insuranceName.value = r.insuranceName ?? "";
  } else {
    hasInsurance.value = false;
    insuranceType.value = "percent";
    insuranceValue.value = 0;
    insuranceName.value = "";
  }
}

// ═══ Computed ═══
const serviceItem = computed(() =>
  record.value ? getTreatmentById(record.value.treatmentId) : null,
);

const needsSurface = computed(() => serviceItem.value?.needsSurface ?? false);
const needsMaterial = computed(() => serviceItem.value?.needsMaterial ?? false);

const activeToothNo = computed(() => toothNo.value);

const surfaceOptions = computed(() =>
  SURFACES.map((s) => ({
    id: s.id,
    pos: s.pos,
    short: getSurfaceShort(s.id, activeToothNo.value),
    label: getSurfaceLabel(s.id, activeToothNo.value),
  })),
);

const insuranceProviders = computed(() => getInsuranceProviders());

// ═══ محاسبه‌ی مالی ═══
const discountAmount = computed(() => {
  if (!hasDiscount.value || !price.value) return 0;
  if (discountType.value === "percent") {
    return Math.round((price.value * discountValue.value) / 100);
  }
  return Math.min(discountValue.value, price.value);
});

const afterDiscount = computed(() => Math.max(0, price.value - discountAmount.value));

const insuranceAmount = computed(() => {
  if (!hasInsurance.value || !afterDiscount.value) return 0;
  if (insuranceType.value === "percent") {
    return Math.round((afterDiscount.value * insuranceValue.value) / 100);
  }
  return Math.min(insuranceValue.value, afterDiscount.value);
});

const patientAmount = computed(() =>
  Math.max(0, afterDiscount.value - insuranceAmount.value),
);

// ═══ Actions ═══
function toggleSurface(surfaceId: string) {
  surface.value = surface.value === surfaceId ? "" : surfaceId;
}

function applyDiscountPreset(preset: DiscountPreset) {
  if (preset.id === "none") {
    hasDiscount.value = false;
    discountValue.value = 0;
    discountReason.value = "";
  } else if (preset.id === "custom") {
    hasDiscount.value = true;
    discountType.value = "amount";
    discountValue.value = 0;
    discountReason.value = "";
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
  if (!record.value) return;

  // ⭐ حذف رکورد قدیمی
  removeRecord(record.value.id);

  // ⭐ ثبت رکورد جدید
  submitTreatment(props.patientId, toothNo.value, {
    treatmentId: record.value.treatmentId,
    treatmentLabel: record.value.treatmentLabel,
    category: record.value.category,
    surface: surface.value || undefined,
    material: material.value || undefined,
    price: price.value,
    status: record.value.status,
    note: note.value,
    // طرح/جلسه/تیم (بدون تغییر)
    planId: record.value.planId,
    planTitle: record.value.planTitle,
    sessionId: record.value.sessionId,
    sessionDate: record.value.sessionDate,
    sessionTime: record.value.sessionTime,
    doctorId: record.value.doctorId,
    assistantId: record.value.assistantId,
    time: record.value.time,
    // مالی جدید
    discountType: hasDiscount.value ? discountType.value : undefined,
    discountValue: hasDiscount.value ? discountValue.value : undefined,
    discountReason: hasDiscount.value ? discountReason.value : undefined,
    discountAmount: discountAmount.value,
    insuranceType: hasInsurance.value ? insuranceType.value : "none",
    insuranceValue: hasInsurance.value ? insuranceValue.value : undefined,
    insuranceName: hasInsurance.value ? insuranceName.value : undefined,
    insuranceAmount: insuranceAmount.value,
    patientAmount: patientAmount.value,
  });

  emit("saved");
  emit("close");
}

// ═══ Delete ═══
function del() {
  if (!record.value) return;
  if (!confirm("این درمان حذف شود؟")) return;
  removeRecord(record.value.id);
  emit("saved");
  emit("close");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR");
  } catch {
    return iso;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && record"
      class="edit-modal-backdrop"
      @mousedown.self="emit('close')"
    >
      <div
        class="edit-modal"
        dir="rtl"
      >
        <!-- Header -->
        <div class="modal-header">
          <div>
            <h2>✏️ ویرایش درمان</h2>
            <div class="subtitle">
              #{{ toothNo }} — {{ record.treatmentLabel }}
              <span class="date-info">
                ({{ formatDate(record.date) }})
              </span>
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
          <!-- سرویس (فقط نمایش) -->
          <div class="info-box">
            <div class="info-label">سرویس:</div>
            <div class="info-value">{{ record.treatmentLabel }}</div>
          </div>

          <!-- سطح -->
          <div v-if="needsSurface" class="surface-picker">
            <div class="section-title">سطح</div>
            <div class="surface-cross">
              <button
                v-for="s in surfaceOptions"
                :key="s.id"
                type="button"
                :class="['surface-cell', `pos-${s.pos}`, { active: surface === s.id }]"
                @click="toggleSurface(s.id)"
              >
                <span class="surf-letter">{{ s.short }}</span>
                <span class="surf-name">{{ s.label }}</span>
              </button>
            </div>
          </div>

          <!-- جنس -->
          <div v-if="needsMaterial" class="form-group">
            <label class="form-label">جنس</label>
            <select v-model="material" class="form-select">
              <option value="">— انتخاب —</option>
              <option v-for="m in MATERIALS" :key="m.id" :value="m.id">
                {{ m.label }}
              </option>
            </select>
          </div>

          <!-- قیمت -->
          <div class="form-group">
            <label class="form-label">قیمت (تومان)</label>
            <input
              v-model.number="price"
              type="number"
              min="0"
              step="50000"
              class="form-input"
            />
          </div>

          <!-- ═══ تخفیف ═══ -->
          <div class="checkbox-row">
            <label class="checkbox-label">
              <input v-model="hasDiscount" type="checkbox" />
              <span>تخفیف دارد</span>
            </label>
          </div>

          <div v-if="hasDiscount" class="sub-panel">
            <div class="preset-chips">
              <button
                v-for="preset in DISCOUNT_PRESETS"
                :key="preset.id"
                :class="['preset-chip', { active: discountReason === preset.label }]"
                :style="discountReason === preset.label ? { background: preset.color, color: '#fff' } : {}"
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

          <!-- ═══ بیمه ═══ -->
          <div class="checkbox-row">
            <label class="checkbox-label">
              <input v-model="hasInsurance" type="checkbox" />
              <span>بیمه دارد</span>
            </label>
          </div>

          <div v-if="hasInsurance" class="sub-panel">
            <div class="preset-chips">
              <button
                v-for="ins in insuranceProviders"
                :key="ins.id"
                :class="['preset-chip', { active: insuranceName === ins.name }]"
                :style="insuranceName === ins.name ? { background: ins.color, color: '#fff' } : {}"
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

          <!-- خلاصه -->
          <div class="financial-summary">
            <div class="summary-row">
              <span>مبلغ اصلی:</span>
              <span>{{ price.toLocaleString("fa-IR") }} ت</span>
            </div>
            <div v-if="discountAmount > 0" class="summary-row discount">
              <span>تخفیف:</span>
              <span>- {{ discountAmount.toLocaleString("fa-IR") }} ت</span>
            </div>
            <div class="summary-row after-discount">
              <span>بعد از تخفیف:</span>
              <span>{{ afterDiscount.toLocaleString("fa-IR") }} ت</span>
            </div>
            <div v-if="insuranceAmount > 0" class="summary-row insurance">
              <span>سهم بیمه:</span>
              <span>{{ insuranceAmount.toLocaleString("fa-IR") }} ت</span>
            </div>
            <div class="summary-row patient total">
              <span>سهم بیمار:</span>
              <span>{{ patientAmount.toLocaleString("fa-IR") }} ت</span>
            </div>
          </div>

          <!-- یادداشت -->
          <div class="form-group">
            <label class="form-label">یادداشت</label>
            <textarea
              v-model="note"
              rows="2"
              class="form-textarea"
              placeholder="اختیاری..."
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-danger" @click="del">
            🗑 حذف
          </button>
          <div class="spacer"></div>
          <button class="btn-secondary" @click="emit('close')">
            انصراف
          </button>
          <button class="btn-primary" @click="save">
            💾 ذخیره
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.edit-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 220;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.edit-modal {
  width: min(560px, 96vw);
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
}

.subtitle {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

.date-info {
  color: #9ca3af;
  font-size: 10px;
}

.close-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  font-size: 14px;
}

.close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-box {
  padding: 10px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 12px;
  color: #1e40af;
  font-weight: 600;
}

.info-value {
  font-size: 12px;
  color: #1e40af;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.surface-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.surface-cross {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas: ". buccal ." "mesial occlusal distal" ". lingual .";
  gap: 6px;
  max-width: 300px;
}

.surface-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 4px;
  border: 1.5px solid #e5e5e5;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  min-height: 50px;
}

.surface-cell:hover {
  border-color: #93c5fd;
  background: #f0f9ff;
}

.surface-cell.active {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

.surface-cell.pos-buccal { grid-area: buccal; }
.surface-cell.pos-mesial { grid-area: mesial; }
.surface-cell.pos-occlusal { grid-area: occlusal; }
.surface-cell.pos-distal { grid-area: distal; }
.surface-cell.pos-lingual { grid-area: lingual; }

.surf-letter {
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}

.surf-name {
  font-size: 10px;
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

.form-textarea {
  resize: vertical;
  min-height: 50px;
}

.checkbox-row {
  padding: 4px 0;
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
  background: #f9fafb;
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

.summary-row.discount { color: #dc2626; }
.summary-row.insurance { color: #2563eb; }
.summary-row.after-discount { border-top: 1px dashed #d1d5db; padding-top: 4px; }
.summary-row.patient.total {
  border-top: 2px solid #16a34a;
  padding-top: 6px;
  margin-top: 4px;
  font-size: 13px;
  color: #065f46;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
  align-items: center;
  background: #f9fafb;
}

.spacer { flex: 1; }

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