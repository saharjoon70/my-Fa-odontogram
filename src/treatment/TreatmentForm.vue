<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  MATERIALS,
  SURFACES,
  getTreatmentsByCategory,
  getSurfaceLabel,
  getSurfaceShort,
  type TreatmentItem,
} from "./treatments";
import {
  TREATMENT_TAB_CATEGORIES,
  type Category,
} from "./categories";
import { getTreatmentIcon } from "./treatmentIcons";
import {
  previewTreatmentItem,
  resetToothToStoredState,
  calculateFinancials,
} from "./applyTreatment";
import {
  getPlansForPatient,
  getSessionsForPlan,
  getDoctors,
  getAssistants,
  addPlan,
} from "./treatmentPlanStore";
import {
  DISCOUNT_PRESETS,
  getInsuranceProviders,
  type DiscountPreset,
  type InsuranceProvider,
} from "./insuranceStore";
import StaffSelector from "./StaffSelector.vue";
import DatePicker from "./DatePicker.vue";

const props = defineProps<{
  patientId: string;
  toothNos: number[];
}>();

const emit = defineEmits<{
  submit: [payload: {
    treatmentId: string;
    treatmentLabel: string;
    category: string;
    surfaces?: string[];
    material?: string;
    price: number;
    status: "done" | "planned";
    note: string;
    planId?: string;
    planTitle?: string;
    sessionId?: string;
    doctorId?: string;
    assistantId?: string;
    date: string;
    time: string;
    discountType?: "percent" | "amount";
    discountValue?: number;
    discountReason?: string;
    discountAmount?: number;
    insuranceType?: "percent" | "amount" | "none";
    insuranceValue?: number;
    insuranceName?: string;
    insuranceAmount?: number;
    patientAmount?: number;
  }];
}>();

// ═══ Mode ═══
const mode = ref<"done" | "planned">("done");

// ═══ Service ═══
const activeCategory = ref<string>(
  TREATMENT_TAB_CATEGORIES[0]?.id ?? "restorative",
);
const selected = ref<TreatmentItem | null>(null);
const surfaces = ref<string[]>([]);
const material = ref("");
const price = ref(0);
const note = ref("");

// ═══ Schedule ═══
const date = ref(new Date().toISOString().slice(0, 10));
const time = ref(new Date().toTimeString().slice(0, 5));

// ═══ Plan / Session (فقط mode=done) ═══
const selectedPlanId = ref<string>("");
const selectedSessionId = ref<string>("");

// ═══ Plan Title (فقط mode=planned) ═══
const newPlanTitle = ref("");

// ═══ Team ═══
const doctorId = ref("");
const assistantId = ref("");

// ═══ مالی (فقط mode=done) ═══
const hasDiscount = ref(false);
const discountType = ref<"percent" | "amount">("percent");
const discountValue = ref(0);
const discountReason = ref("");
const selectedDiscountPreset = ref<string>("none");

const hasInsurance = ref(false);
const insuranceType = ref<"percent" | "amount">("percent");
const insuranceValue = ref(0);
const insuranceName = ref("");

// ═══ Computed ═══
const activeToothNo = computed(() =>
  props.toothNos.length > 0 ? props.toothNos[0] : null,
);

const surfaceOptions = computed(() =>
  SURFACES.map((s) => ({
    id: s.id,
    pos: s.pos,
    short: getSurfaceShort(s.id, activeToothNo.value),
    label: getSurfaceLabel(s.id, activeToothNo.value),
  })),
);

const filteredTreatments = computed(() =>
  getTreatmentsByCategory(activeCategory.value as Category),
);

const allPlans = computed(() => getPlansForPatient(props.patientId));

const availableSessions = computed(() =>
  selectedPlanId.value ? getSessionsForPlan(selectedPlanId.value) : [],
);

const insuranceProviders = computed(() => getInsuranceProviders());

const doctors = computed(() => getDoctors());
const assistants = computed(() => getAssistants());

const canSubmit = computed(() => {
  if (!selected.value) return false;
  if (selected.value.needsSurface && surfaces.value.length === 0) return false;
  if (selected.value.needsMaterial && !material.value) return false;
  // ⭐ اگه طرح جدید، باید عنوان داشته باشه
  if (mode.value === "planned" && !newPlanTitle.value.trim()) {
    return false;
  }
  return true;
});

// ═══ محاسبه‌ی مالی (فقط mode=done) ═══
const financials = computed(() =>
  calculateFinancials({
    price: price.value,
    discountType:
      mode.value === "done" && hasDiscount.value
        ? discountType.value
        : undefined,
    discountValue:
      mode.value === "done" && hasDiscount.value
        ? discountValue.value
        : undefined,
    insuranceType:
      mode.value === "done" && hasInsurance.value
        ? insuranceType.value
        : "none",
    insuranceValue:
      mode.value === "done" && hasInsurance.value
        ? insuranceValue.value
        : undefined,
  }),
);

const discountAmount = computed(() => financials.value.discountAmount);
const afterDiscount = computed(() => financials.value.afterDiscount);
const insuranceAmount = computed(() => financials.value.insuranceAmount);
const patientAmount = computed(() => financials.value.patientAmount);

// ═══ Preview ═══
function refreshPreview() {
  if (props.toothNos.length === 0) return;
  for (const toothNo of props.toothNos) {
    resetToothToStoredState(props.patientId, toothNo);
  }
  if (!selected.value) return;
  for (const toothNo of props.toothNos) {
    previewTreatmentItem(toothNo, selected.value, {
      surfaces: surfaces.value,
      material: material.value || undefined,
    });
  }
}

watch([selected, surfaces, material], refreshPreview, { deep: true });
watch(() => [...props.toothNos], () => refreshPreview(), { immediate: true });

// ═══ Watch: mode change ═══
watch(mode, (newMode) => {
  if (newMode === "planned") {
    // پاک کردن مالی
    hasDiscount.value = false;
    hasInsurance.value = false;
    assistantId.value = "";
    selectedPlanId.value = "";
    selectedSessionId.value = "";
  } else {
    // پاک کردن عنوان طرح جدید
    newPlanTitle.value = "";
  }
});

// ═══ Watch: plan change → reset session ═══
watch(selectedPlanId, () => {
  selectedSessionId.value = "";
});

// ═══ Init team defaults ═══
function initTeamDefaults() {
  if (!doctorId.value && doctors.value.length > 0) {
    doctorId.value = doctors.value[0].id;
  }
  if (!assistantId.value && assistants.value.length > 0) {
    assistantId.value = assistants.value[0].id;
  }
}

initTeamDefaults();

// ═══ Actions ═══
function selectTreatment(item: TreatmentItem) {
  if (selected.value?.id === item.id) {
    selected.value = null;
    price.value = 0;
    surfaces.value = [];
    material.value = "";
    refreshPreview();
    return;
  }
  selected.value = item;
  price.value = item.defaultPrice ?? 0;
  surfaces.value = [];
  material.value = "";
  refreshPreview();
}

function toggleSurface(surfaceId: string) {
  const idx = surfaces.value.indexOf(surfaceId);
  if (idx >= 0) {
    surfaces.value = surfaces.value.filter((s) => s !== surfaceId);
  } else {
    surfaces.value = [...surfaces.value, surfaceId];
  }
  refreshPreview();
}

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

// ═══ Submit ═══
function onSubmit() {
  if (!canSubmit.value || !selected.value) return;

  let finalPlanId: string | undefined;
  let finalPlanTitle: string | undefined;
  let finalSessionId: string | undefined;

  // ⭐ حالت طرح درمان
  if (mode.value === "planned") {
    // ساخت طرح جدید
    const newPlan = addPlan({
      patientId: props.patientId,
      title: newPlanTitle.value.trim(),
      startDate: date.value,
      status: "planned",
      toothNos: [...props.toothNos],
      doctorId: doctorId.value || undefined,
      color: "#f59e0b",
    });
    finalPlanId = newPlan.id;
    finalPlanTitle = newPlan.title;
    // جلسه نداره (بعداً از تب طرح درمان ساخته میشه)
  } else {
    // ⭐ حالت «انجام شد»
    if (selectedPlanId.value) {
      const existingPlan = allPlans.value.find(
        (p) => p.id === selectedPlanId.value,
      );
      finalPlanId = selectedPlanId.value;
      finalPlanTitle = existingPlan?.title;
      finalSessionId = selectedSessionId.value || undefined;
    }
  }

  emit("submit", {
    treatmentId: selected.value.id,
    treatmentLabel: selected.value.label,
    category: selected.value.category,
    surfaces: surfaces.value.length > 0 ? [...surfaces.value] : undefined,
    material: material.value || undefined,
    price: price.value,
    status: mode.value,
    note: note.value,
    planId: finalPlanId,
    planTitle: finalPlanTitle,
    sessionId: finalSessionId,
    doctorId: doctorId.value || undefined,
    assistantId: mode.value === "done" ? assistantId.value || undefined : undefined,
    date: date.value,
    time: time.value,
    // ⭐ مالی فقط در حالت «انجام شد»
    discountType:
      mode.value === "done" && hasDiscount.value
        ? discountType.value
        : undefined,
    discountValue:
      mode.value === "done" && hasDiscount.value
        ? discountValue.value
        : undefined,
    discountReason:
      mode.value === "done" && hasDiscount.value
        ? discountReason.value
        : undefined,
    discountAmount:
      mode.value === "done" ? discountAmount.value : undefined,
    insuranceType:
      mode.value === "done" && hasInsurance.value
        ? insuranceType.value
        : "none",
    insuranceValue:
      mode.value === "done" && hasInsurance.value
        ? insuranceValue.value
        : undefined,
    insuranceName:
      mode.value === "done" && hasInsurance.value
        ? insuranceName.value
        : undefined,
    insuranceAmount:
      mode.value === "done" ? insuranceAmount.value : undefined,
    patientAmount:
      mode.value === "done" ? patientAmount.value : undefined,
  });

  // Reset
  selected.value = null;
  surfaces.value = [];
  material.value = "";
  price.value = 0;
  note.value = "";
  newPlanTitle.value = "";
  hasDiscount.value = false;
  discountValue.value = 0;
  discountReason.value = "";
  selectedDiscountPreset.value = "none";
  hasInsurance.value = false;
  insuranceValue.value = 0;
  insuranceName.value = "";
}

function onCancel() {
  selected.value = null;
  surfaces.value = [];
  material.value = "";
  price.value = 0;
  note.value = "";
  newPlanTitle.value = "";
  for (const toothNo of props.toothNos) {
    resetToothToStoredState(props.patientId, toothNo);
  }
}
</script>

<template>
  <div class="treatment-form" dir="rtl">
    <!-- ═══ Mode ═══ -->
    <div class="mode-selector">
      <button
        :class="['mode-btn', { active: mode === 'done' }]"
        @click="mode = 'done'"
      >
        <span class="mode-icon">✅</span>
        <span class="mode-text">
          <strong>ثبت درمان</strong>
          <small>انجام‌شده</small>
        </span>
      </button>
      <button
        :class="['mode-btn', { active: mode === 'planned' }]"
        @click="mode = 'planned'"
      >
        <span class="mode-icon">📋</span>
        <span class="mode-text">
          <strong>طرح درمان</strong>
          <small>برنامه‌ریزی</small>
        </span>
      </button>
    </div>

    <!-- Header -->
    <div class="form-header">
      <div class="header-title">
        <span v-if="toothNos.length === 0">ابتدا یک دندان انتخاب کنید</span>
        <span v-else-if="toothNos.length === 1">دندان {{ toothNos[0] }}</span>
        <span v-else>{{ toothNos.length }} دندان ({{ toothNos.join(", ") }})</span>
      </div>
    </div>

    <!-- Categories -->
    <div class="category-tabs">
      <button
        v-for="cat in TREATMENT_TAB_CATEGORIES"
        :key="cat.id"
        :class="['cat-tab', { active: activeCategory === cat.id }]"
        :style="activeCategory === cat.id ? { background: cat.color, color: '#fff', borderColor: cat.color } : {}"
        @click="activeCategory = cat.id"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Services -->
    <div class="treatments-grid">
      <button
        v-for="item in filteredTreatments"
        :key="item.id"
        :class="['treatment-btn', { active: selected?.id === item.id }]"
        :title="item.label"
        @click="selectTreatment(item)"
      >
        <div class="treatment-icon" v-html="getTreatmentIcon(item.icon)"></div>
        <span class="treatment-label">{{ item.label }}</span>
      </button>
    </div>

    <!-- Details -->
    <div v-if="selected" class="treatment-details">
      <h4>جزئیات: {{ selected.label }}</h4>

      <!-- Surface -->
      <div v-if="selected.needsSurface" class="surface-picker">
        <div class="surface-label">سطح</div>
        <div class="surface-cross">
          <button
            v-for="s in surfaceOptions"
            :key="s.id"
            type="button"
            :class="['surface-cell', `pos-${s.pos}`, { active: surfaces.includes(s.id) }]"
            @click="toggleSurface(s.id)"
          >
            <span class="surf-letter">{{ s.short }}</span>
            <span class="surf-name">{{ s.label }}</span>
          </button>
        </div>
      </div>

      <!-- Material -->
      <div v-if="selected.needsMaterial" class="detail-row">
        <span>جنس</span>
        <select v-model="material">
          <option value="">— انتخاب —</option>
          <option v-for="m in MATERIALS" :key="m.id" :value="m.id">
            {{ m.label }}
          </option>
        </select>
      </div>

      <!-- ⭐ اگه طرح درمان → عنوان طرح -->
      <template v-if="mode === 'planned'">
        <div class="section-title">📋 اطلاعات طرح</div>

        <div class="detail-row">
          <span>عنوان طرح <span class="required">*</span></span>
          <input
            v-model="newPlanTitle"
            type="text"
            placeholder="مثلاً: بازسازی فک بالا"
          />
        </div>

        <div class="detail-row">
          <span>👨‍⚕️ پزشک</span>
          <select v-model="doctorId">
            <option value="">— انتخاب کنید —</option>
            <option v-for="d in doctors" :key="d.id" :value="d.id">
              {{ d.name }}
            </option>
          </select>
        </div>
      </template>

      <!-- ⭐ اگه انجام شد → طرح (اختیاری) + جلسه (اختیاری) -->
      <template v-else>
        <div class="section-title">📋 طرح درمان (اختیاری)</div>

        <div class="detail-row">
          <span>طرح:</span>
          <select v-model="selectedPlanId">
            <option value="">— بدون طرح —</option>
            <option v-for="p in allPlans" :key="p.id" :value="p.id">
              {{ p.title }}
            </option>
          </select>
        </div>

        <div v-if="selectedPlanId" class="detail-row">
          <span>جلسه:</span>
          <select v-model="selectedSessionId">
            <option value="">— بدون جلسه —</option>
            <option v-for="sess in availableSessions" :key="sess.id" :value="sess.id">
              جلسه {{ sess.sessionNumber }} — {{ sess.title }}
            </option>
          </select>
        </div>
      </template>

      <!-- Schedule -->
      <div class="section-title">📅 زمان‌بندی</div>
      <DatePicker v-model:date="date" v-model:time="time" />

      <!-- Team (فقط در حالت done) -->
      <template v-if="mode === 'done'">
        <div class="section-title">👥 تیم درمان</div>
        <StaffSelector
          v-model:doctor-id="doctorId"
          v-model:assistant-id="assistantId"
        />
      </template>

      <!-- ═══ مالی — فقط در حالت done ═══ -->
      <template v-if="mode === 'done'">
        <div class="section-title">💰 مالی</div>

        <div class="detail-row">
          <span>قیمت (تومان)</span>
          <input v-model.number="price" type="number" min="0" step="50000" />
        </div>

        <!-- تخفیف -->
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
              :class="['preset-chip', { active: selectedDiscountPreset === preset.id }]"
              :style="selectedDiscountPreset === preset.id ? { background: preset.color, color: '#fff', borderColor: preset.color } : {}"
              @click="applyDiscountPreset(preset)"
            >
              {{ preset.label }}
            </button>
          </div>
          <div class="detail-row">
            <span>نوع تخفیف</span>
            <select v-model="discountType">
              <option value="percent">درصدی</option>
              <option value="amount">مبلغی</option>
            </select>
          </div>
          <div class="detail-row">
            <span>مقدار تخفیف</span>
            <input v-model.number="discountValue" type="number" min="0" />
          </div>
          <div class="detail-row">
            <span>دلیل</span>
            <input v-model="discountReason" type="text" placeholder="اختیاری" />
          </div>
        </div>

        <!-- بیمه -->
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
              :style="insuranceName === ins.name ? { background: ins.color, color: '#fff', borderColor: ins.color } : {}"
              @click="applyInsurance(ins)"
            >
              {{ ins.name }} ({{ ins.defaultPercent }}٪)
            </button>
          </div>
          <div class="detail-row">
            <span>نوع</span>
            <select v-model="insuranceType">
              <option value="percent">درصدی</option>
              <option value="amount">مبلغی</option>
            </select>
          </div>
          <div class="detail-row">
            <span>مقدار</span>
            <input v-model.number="insuranceValue" type="number" min="0" />
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
      </template>

      <!-- Note -->
      <div class="detail-row detail-row-full">
        <span>یادداشت</span>
        <textarea v-model="note" rows="2" placeholder="اختیاری..."></textarea>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button
          class="btn-primary"
          :disabled="!canSubmit"
          @click="onSubmit"
        >
          {{ mode === "done" ? "✅ ثبت درمان" : "📋 ثبت طرح درمان" }}
        </button>
        <button class="btn-secondary" @click="onCancel">انصراف</button>
      </div>

      <div v-if="!canSubmit" class="hint">
        <span v-if="selected.needsSurface && surfaces.length === 0">
          ⚠️ حداقل یک سطح انتخاب کنید
        </span>
        <span v-else-if="selected.needsMaterial && !material">
          ⚠️ جنس را انتخاب کنید
        </span>
        <span v-else-if="mode === 'planned' && !newPlanTitle.trim()">
          ⚠️ عنوان طرح را وارد کنید
        </span>
      </div>
    </div>

    <div v-else class="empty-hint">
      👆 یک سرویس از بالا انتخاب کنید
    </div>
  </div>
</template>

<style scoped>
.treatment-form { display: flex; flex-direction: column; gap: 12px; }
.mode-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 4px; background: #f3f4f6; border-radius: 10px; }
.mode-btn { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 2px solid transparent; background: transparent; border-radius: 8px; cursor: pointer; font-family: inherit; transition: all 0.2s; text-align: right; }
.mode-btn:hover { background: rgba(255, 255, 255, 0.6); }
.mode-btn.active { background: #fff; border-color: #2563eb; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12); }
.mode-btn:last-child.active { border-color: #f59e0b; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.12); }
.mode-icon { font-size: 22px; }
.mode-text { display: flex; flex-direction: column; gap: 2px; }
.mode-text strong { font-size: 12px; color: #111827; }
.mode-text small { font-size: 10px; color: #6b7280; }
.form-header { padding-bottom: 8px; border-bottom: 1px solid #eee; }
.header-title { font-size: 13px; font-weight: 600; color: #333; }
.category-tabs { display: flex; flex-wrap: wrap; gap: 4px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
.cat-tab { padding: 5px 10px; border: 1px solid #e5e5e5; background: #f9f9f9; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: 11px; white-space: nowrap; transition: all 0.15s; }
.cat-tab:hover { background: #eff6ff; }
.cat-tab.active { font-weight: 600; }
.treatments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)); gap: 6px; max-height: 280px; overflow-y: auto; padding: 4px; background: #fafafa; border-radius: 8px; }
.treatment-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border: 2px solid #e5e5e5; background: #fff; border-radius: 8px; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.treatment-btn:hover { border-color: #93c5fd; background: #f0f9ff; }
.treatment-btn.active { border-color: #2563eb; background: #eff6ff; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15); }
.treatment-icon { color: #2563eb; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
.treatment-icon :deep(svg) { width: 24px; height: 24px; }
.treatment-label { font-size: 10.5px; text-align: center; line-height: 1.25; color: #333; }
.treatment-details { display: flex; flex-direction: column; gap: 10px; padding: 12px; background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb; }
.treatment-details h4 { margin: 0; font-size: 13px; color: #1f2937; }
.section-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
.surface-picker { display: flex; flex-direction: column; gap: 8px; }
.surface-label { font-size: 12px; font-weight: 500; color: #374151; }
.surface-cross { display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: auto auto auto; grid-template-areas: ". buccal ." "mesial occlusal distal" ". lingual ."; gap: 6px; max-width: 300px; }
.surface-cell { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 8px 4px; border: 1.5px solid #e5e5e5; background: #fff; border-radius: 8px; cursor: pointer; font-family: inherit; transition: all 0.15s; min-height: 50px; }
.surface-cell:hover { border-color: #93c5fd; background: #f0f9ff; }
.surface-cell.active { border-color: #2563eb; background: #2563eb; color: #fff; }
.surface-cell.pos-buccal { grid-area: buccal; }
.surface-cell.pos-mesial { grid-area: mesial; }
.surface-cell.pos-occlusal { grid-area: occlusal; }
.surface-cell.pos-distal { grid-area: distal; }
.surface-cell.pos-lingual { grid-area: lingual; }
.surf-letter { font-size: 16px; font-weight: 700; line-height: 1; }
.surf-name { font-size: 10px; line-height: 1; }
.detail-row { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
.detail-row > span { font-weight: 500; color: #374151; }
.detail-row select, .detail-row input, .detail-row textarea { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-family: inherit; font-size: 12px; background: #fff; }
.detail-row-full { width: 100%; }
.checkbox-row { padding: 4px 0; }
.checkbox-label { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #374151; cursor: pointer; }
.checkbox-label input { width: 15px; height: 15px; cursor: pointer; accent-color: #2563eb; }
.sub-panel { display: flex; flex-direction: column; gap: 8px; padding: 10px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
.preset-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.preset-chip { padding: 4px 10px; border: 1px solid #e5e7eb; background: #fff; border-radius: 20px; cursor: pointer; font-family: inherit; font-size: 10.5px; color: #374151; transition: all 0.15s; }
.preset-chip:hover { background: #f0f9ff; border-color: #93c5fd; }
.preset-chip.active { font-weight: 600; color: #fff; }
.required { color: #dc2626; }
.financial-summary { display: flex; flex-direction: column; gap: 4px; padding: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-top: 4px; }
.summary-row { display: flex; justify-content: space-between; font-size: 12px; color: #374151; }
.summary-row span:last-child { font-weight: 600; }
.summary-row.discount { color: #dc2626; }
.summary-row.insurance { color: #2563eb; }
.summary-row.after-discount { border-top: 1px dashed #d1d5db; padding-top: 4px; margin-top: 4px; }
.summary-row.patient.total { border-top: 2px solid #16a34a; padding-top: 6px; margin-top: 4px; font-size: 13px; color: #065f46; }
.form-actions { display: flex; gap: 8px; margin-top: 4px; }
.btn-primary { flex: 1; padding: 10px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; }
.btn-primary:hover:not(:disabled) { background: #1d4ed8; }
.btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; }
.btn-secondary { padding: 10px 16px; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: 13px; }
.btn-secondary:hover { background: #e5e7eb; }
.hint { text-align: center; font-size: 11px; color: #f59e0b; padding: 4px; }
.empty-hint { text-align: center; color: #999; padding: 30px 20px; font-size: 13px; }
</style>