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
import { TREATMENT_TAB_CATEGORIES, type Category } from "./categories";
import { getTreatmentIcon } from "./treatmentIcons";
import {
  previewTreatmentItem,
  resetToothToStoredState,
} from "./applyTreatment";
import { getToothState } from "../odontogram";
import { setToothStateAndRender } from "../odontogram";
import {
  getPlansForPatient,
  getSessionsForPatient,
  getSessionsForPlan,
  getDoctors,
  getAssistants,
  addPlan,
  getNextSessionNumber,
  getNextSessionNumberForPatient,
  getPlanById,
  getLastSelection,      // ⭐ اضافه شد
  saveLastSelection,     // ⭐ اضافه شد
  type TreatmentSession,
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
  submit: [
    payload: {
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
      // ⭐ Session
      sessionMode: "auto" | "existing" | "new";
      sessionId?: string;
      sessionTitle?: string;
      doctorId?: string;
      assistantId?: string;
      date: string;
      time: string;
      // ⭐ مالی جلسه
      discountType?: "percent" | "amount";
      discountValue?: number;
      discountReason?: string;
      insuranceType?: "percent" | "amount" | "none";
      insuranceValue?: number;
      insuranceName?: string;
    },
  ];
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

// ═══ Plan ═══
const selectedPlanId = ref<string>("");
const newPlanTitle = ref("");

// ═══ Session ═══
const sessionMode = ref<"auto" | "existing" | "new">("auto");
const selectedSessionId = ref<string>("");
const newSessionTitle = ref("");

// ═══ Team ═══
const doctorId = ref("");
const assistantId = ref("");

// ═══ مالی جلسه ═══
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

// ⭐ جلسات بیمار (برای انتخاب)
const allPatientSessions = computed(() =>
  getSessionsForPatient(props.patientId),
);

// ⭐ جلسه‌ی انتخاب‌شده
const selectedSession = computed<TreatmentSession | undefined>(() =>
  selectedSessionId.value
    ? allPatientSessions.value.find((s) => s.id === selectedSessionId.value)
    : undefined,
);

// ⭐ طرح جلسه‌ی انتخاب‌شده (نام)
const selectedSessionPlanTitle = computed(() => {
  const sess = selectedSession.value;
  if (!sess?.planId) return "";
  return getPlanById(sess.planId)?.title ?? "";
});

// ⭐ تعداد جلسات طرح انتخاب‌شده (برای «جلسه X از Y»)
const selectedPlanSessionCount = computed(() => {
  if (!selectedPlanId.value) return 0;
  return getSessionsForPlan(selectedPlanId.value).length;
});

// ⭐ شماره‌ی جلسه‌ی بعدی (برای placeholder عنوان خودکار)
const nextSessionNum = computed(() => {
  if (selectedPlanId.value) {
    return getNextSessionNumber(selectedPlanId.value);
  }
  return getNextSessionNumberForPatient(props.patientId);
});

const insuranceProviders = computed(() => getInsuranceProviders());
const doctors = computed(() => getDoctors());
const assistants = computed(() => getAssistants());

// ⭐ بازیابی آخرین انتخاب از حافظه (per patient)
//    این باعث می‌شه وقتی تب عوض می‌شه و TreatmentForm دوباره mount می‌شه،
//    انتخاب قبلی (sessionMode + selectedSessionId + selectedPlanId) بازیابی بشه.
const lastSelection = getLastSelection(props.patientId);
sessionMode.value = lastSelection.sessionMode;
selectedSessionId.value = lastSelection.selectedSessionId;
selectedPlanId.value = lastSelection.selectedPlanId;

// ⭐ وقتی جلسه‌ی جدیدی برای این بیمار اضافه شد (در همین نشست)،
//    به‌طور خودکار به آن سوئیچ کن
watch(
  () => allPatientSessions.value.length,
  (newLen, oldLen) => {
    // فقط اگر جلسه اضافه شد (نه حذف)
    if (newLen > (oldLen ?? 0) && allPatientSessions.value.length > 0) {
      // جدیدترین جلسه بر اساس createdAt
      const newest = [...allPatientSessions.value].sort(
        (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
      )[0];
      if (newest) {
        sessionMode.value = "existing";
        selectedSessionId.value = newest.id;
        // طرح جلسه اگر داشت
        if (newest.planId) {
          selectedPlanId.value = newest.planId;
        }
        // تخفیف جلسه
        if (newest.discountType && newest.discountValue) {
          hasDiscount.value = true;
          discountType.value = newest.discountType;
          discountValue.value = newest.discountValue;
          discountReason.value = newest.discountReason ?? "";
        } else {
          hasDiscount.value = false;
          discountValue.value = 0;
          discountReason.value = "";
        }
        // بیمه جلسه
        if (
          newest.insuranceType &&
          newest.insuranceType !== "none" &&
          newest.insuranceValue
        ) {
          hasInsurance.value = true;
          insuranceType.value =
            newest.insuranceType === "amount" ? "amount" : "percent";
          insuranceValue.value = newest.insuranceValue;
          insuranceName.value = newest.insuranceName ?? "";
        } else {
          hasInsurance.value = false;
          insuranceValue.value = 0;
          insuranceName.value = "";
        }
      }
    }
  },
);

const canSubmit = computed(() => {
  if (!selected.value) return false;
  if (selected.value.needsSurface && surfaces.value.length === 0) return false;
  if (selected.value.needsMaterial && !material.value) return false;
  if (mode.value === "planned" && !newPlanTitle.value.trim()) return false;
  if (
    mode.value === "done" &&
    sessionMode.value === "existing" &&
    !selectedSessionId.value
  ) {
    return false;
  }
  return true;
});


// ⭐ state خالی برای ریست
function getEmptyToothState(): Record<string, unknown> {
  return {
    toothSelection: "tooth-base",
    toothSubstrate: "natural",
    restorationType: "none",
    restorationMaterial: "none",
    prosthesis: "none",
    endo: "none",
    pulpDx: "normal",
    pulpLatin: "none",
    apicalDx: "normal",
    periapicalType: "none",
    resorptionType: "none",
    periImplant: "none",
    mobility: "none",
    caries: [],
    cariesSeverity: {},
    cariesActiveDepth: 2,
    rootCaries: "none",
    radiographicDepth: {},
    fillingMaterial: "none",
    fillingSurfaces: [],
    fillingSurfaceMaterials: {},
    fillingDefect: {},
    fissureSealing: false,
    calculus: false,
    contactMesial: false,
    contactDistal: false,
    wearEdge: "none",
    wearCervical: "none",
    discoloration: "none",
    orthoAppliance: "none",
    orthoDrift: "none",
    orthoVertical: "none",
    orthoRotation: false,
    brokenMesial: false,
    brokenIncisal: false,
    brokenDistal: false,
    crownLeakage: false,
    crownReplace: false,
    crownNeeded: false,
    extractionPlan: false,
    extractionWound: false,
    missingClosed: false,
    bridgePillar: false,
    parapulpalPin: false,
    endoResection: false,
    mods: [],
    customStates: {},
    note: "",
  };
}
// ═══ Preview ═══
function refreshPreview() {
  if (props.toothNos.length === 0) return;

  // ⭐ 1. state خالی — بدون رکوردهای قبلی
  for (const toothNo of props.toothNos) {
    setToothStateAndRender(toothNo, getEmptyToothState(), {
      replaceCustomStates: true,
    });
  }

  // ⭐ 2. preview درمان جدید (اگه انتخاب شده)
  if (!selected.value) return;
  
  for (const toothNo of props.toothNos) {
    previewTreatmentItem(toothNo, selected.value, {
      surfaces: surfaces.value,
      material: material.value || undefined,
    });
  }
}


watch([selected, surfaces, material], refreshPreview, { deep: true });
watch(
  () => [...props.toothNos],
  (newVal, oldVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      refreshPreview();
    }
  },
  { immediate: true },  // ⭐ اضافه شد
);

// ⭐ وقتی جلسه انتخاب شد، طرحش و تخفیف/بیمه‌اش را load کن
watch(selectedSession, (sess) => {
  if (!sess) return;
  // طرح
  if (sess.planId && sess.planId !== selectedPlanId.value) {
    selectedPlanId.value = sess.planId;
  }
  // تخفیف/بیمه از جلسه
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
});

watch(mode, (newMode) => {
  if (newMode === "planned") {
    hasDiscount.value = false;
    hasInsurance.value = false;
    assistantId.value = "";
    newSessionTitle.value = "";
  } else {
    newPlanTitle.value = "";
    // ⭐ از lastSelection نمی‌خوانیم
  }
});

// ⭐ اگر طرح عوض شد، جلسه‌ی انتخابی را پاک کن
watch(selectedPlanId, () => {
  const sess = selectedSession.value;
  if (sess && sess.planId && sess.planId !== selectedPlanId.value) {
    selectedSessionId.value = "";
  }
});

// ⭐ وقتی حالت جلسه عوض شد، انتخاب قبلی را پاک کن
watch(sessionMode, (m) => {
  if (m !== "existing") selectedSessionId.value = "";
  if (m !== "new") newSessionTitle.value = "";
});

watch(selectedSessionId, (newId) => {
  if (!newId) return;
  const session = allPatientSessions.value.find((s) => s.id === newId);
  if (session) {
    date.value = session.sessionDate;
    time.value = session.sessionTime || "10:00";
  }
});

// ⭐ ذخیره‌ی آخرین انتخاب‌ها هر وقت عوض شدن
//    این باعث می‌شه وقتی تب عوض می‌شه و TreatmentForm دوباره mount می‌شه،
//    انتخاب قبلی (sessionMode + selectedSessionId + selectedPlanId) بازیابی بشه.
watch([sessionMode, selectedSessionId, selectedPlanId], () => {
  saveLastSelection(props.patientId, {
    sessionMode: sessionMode.value,
    selectedSessionId: selectedSessionId.value,
    selectedPlanId: selectedPlanId.value,
  });
});

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

  // ─── mode = planned → همیشه طرح جدید ───
  if (mode.value === "planned") {
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
  } else {
    // ─── mode = done → طرح اختیاری ───
    if (selectedPlanId.value) {
      const existingPlan = allPlans.value.find(
        (p) => p.id === selectedPlanId.value,
      );
      finalPlanId = selectedPlanId.value;
      finalPlanTitle = existingPlan?.title;
    }
  }

  // ⭐ اطلاعات جلسه
  const sessPayload: {
    sessionMode: "auto" | "existing" | "new";
    sessionId?: string;
    sessionTitle?: string;
  } = {
    sessionMode: sessionMode.value,
  };

  if (sessionMode.value === "existing" && selectedSessionId.value) {
    sessPayload.sessionId = selectedSessionId.value;
  } else if (sessionMode.value === "new" && newSessionTitle.value.trim()) {
    sessPayload.sessionTitle = newSessionTitle.value.trim();
  }

  // ⭐ مالی جلسه (فقط در mode=done)
  const financialPayload: {
    discountType?: "percent" | "amount";
    discountValue?: number;
    discountReason?: string;
    insuranceType?: "percent" | "amount" | "none";
    insuranceValue?: number;
    insuranceName?: string;
  } =
    mode.value === "done"
      ? {
          discountType: hasDiscount.value ? discountType.value : undefined,
          discountValue: hasDiscount.value ? discountValue.value : undefined,
          discountReason: hasDiscount.value ? discountReason.value : undefined,
          insuranceType: hasInsurance.value ? insuranceType.value : "none",
          insuranceValue: hasInsurance.value ? insuranceValue.value : undefined,
          insuranceName: hasInsurance.value ? insuranceName.value : undefined,
        }
      : {};

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
    // ⭐ Session
    sessionMode: sessPayload.sessionMode,
    sessionId: sessPayload.sessionId,
    sessionTitle: sessPayload.sessionTitle,
    doctorId: doctorId.value || undefined,
    assistantId:
      mode.value === "done" ? assistantId.value || undefined : undefined,
    date: date.value,
    time: time.value,
    // ⭐ مالی جلسه
    ...financialPayload,
  });

  // Reset — فقط درمان
  selected.value = null;
  surfaces.value = [];
  material.value = "";
  price.value = 0;
  note.value = "";
  newPlanTitle.value = "";
  newSessionTitle.value = "";
  // ⭐ sessionMode / selectedSessionId / selectedPlanId / تخفیف / بیمه را نگه دار
}

function onCancel() {
  selected.value = null;
  surfaces.value = [];
  material.value = "";
  price.value = 0;
  note.value = "";
  newPlanTitle.value = "";
  newSessionTitle.value = "";
  // ⭐ در cancel، session/plan/تخفیف/بیمه را هم پاک کن
  sessionMode.value = "auto";
  selectedSessionId.value = "";
  selectedPlanId.value = "";
  hasDiscount.value = false;
  discountValue.value = 0;
  discountReason.value = "";
  selectedDiscountPreset.value = "none";
  hasInsurance.value = false;
  insuranceValue.value = 0;
  insuranceName.value = "";

}
</script>

<template>
  <div class="treatment-form" dir="rtl">
    <!-- Mode -->
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
        <span v-else>{{ toothNos.length }} دندان</span>
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

      <!-- ═══ mode = planned ═══ -->
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

      <!-- ═══ mode = done ═══ -->
      <template v-else>
        <!-- ⭐ بخش جلسه — قبل از طرح -->
        <div class="section-title">📅 جلسه</div>

        <div class="detail-row">
          <span>نوع جلسه:</span>
          <div class="radio-inline">
            <label :class="['radio-chip', { active: sessionMode === 'auto' }]">
              <input type="radio" value="auto" v-model="sessionMode" />
              <span>✨ جلسه جدید خودکار</span>
            </label>
            <label :class="['radio-chip', { active: sessionMode === 'existing' }]">
              <input type="radio" value="existing" v-model="sessionMode" />
              <span>📁 انتخاب از موجود ({{ allPatientSessions.length }})</span>
            </label>
            <label :class="['radio-chip', { active: sessionMode === 'new' }]">
              <input type="radio" value="new" v-model="sessionMode" />
              <span>+ جلسه جدید با عنوان</span>
            </label>
          </div>
        </div>

        <!-- انتخاب از موجود -->
        <div v-if="sessionMode === 'existing'" class="detail-row">
          <span>انتخاب جلسه:</span>
          <select v-model="selectedSessionId">
            <option value="">— انتخاب کنید —</option>
            <option
              v-for="sess in allPatientSessions"
              :key="sess.id"
              :value="sess.id"
            >
              جلسه {{ sess.sessionNumber }} — {{ sess.title }} ({{ sess.sessionDate }})
            </option>
          </select>
        </div>

        <!-- جلسه‌ی انتخاب‌شده: نمایش طرحش -->
        <div
          v-if="sessionMode === 'existing' && selectedSession"
          class="session-plan-info"
        >
          <div class="info-line">
            📋 طرح این جلسه:
            <strong v-if="selectedSession.planId">
              {{ selectedSessionPlanTitle }}
              <span class="muted">
                (جلسه {{ selectedSession.sessionNumber }})
              </span>
            </strong>
            <strong v-else class="no-plan">— بدون طرح —</strong>
          </div>
        </div>

        <!-- جلسه‌ی جدید با عنوان -->
        <div v-if="sessionMode === 'new'" class="detail-row">
          <span>عنوان جلسه</span>
          <input
            v-model="newSessionTitle"
            type="text"
            :placeholder="`جلسه ${nextSessionNum}`"
          />
        </div>

        <!-- ⭐ طرح درمان (اختیاری) -->
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

        <!-- نمایش «جلسه X از Y» اگر طرح انتخاب شده -->
        <div
          v-if="selectedPlanId && selectedPlanSessionCount > 0"
          class="plan-session-count"
        >
          📊 این طرح {{ selectedPlanSessionCount }} جلسه دارد —
          جلسه‌ی جدید، جلسه {{ selectedPlanSessionCount + 1 }} خواهد بود
        </div>
      </template>

      <!-- Schedule -->
      <div class="section-title">📅 تاریخ و ساعت</div>
      <DatePicker v-model:date="date" v-model:time="time" />

      <!-- Team -->
      <template v-if="mode === 'done'">
        <div class="section-title">👥 تیم درمان</div>
        <StaffSelector
          v-model:doctor-id="doctorId"
          v-model:assistant-id="assistantId"
        />
      </template>

      <!-- Note -->
      <div class="detail-row detail-row-full">
        <span>یادداشت</span>
        <textarea v-model="note" rows="2" placeholder="اختیاری..."></textarea>
      </div>
    </div>

    <!-- ⭐ مالی جلسه — بیرون از v-if="selected" -->
    <template v-if="mode === 'done'">
      <div class="financial-section">
        <div class="financial-header">
          💰 مالی — برای کل جلسه
          <span class="financial-hint">
            (تخفیف و بیمه روی مجموع کل جلسه اعمال می‌شود)
          </span>
        </div>

        <!-- قیمت این درمان -->
        <div v-if="selected" class="detail-row">
          <span>قیمت این درمان (تومان)</span>
          <input v-model.number="price" type="number" min="0" step="50000" />
        </div>
        <div v-else class="financial-empty">
          (قیمت این درمان: هنوز سرویسی انتخاب نشده)
        </div>

        <!-- ⭐ تخفیف کل جلسه -->
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
              :class="['preset-chip', { active: selectedDiscountPreset === preset.id }]"
              :style="selectedDiscountPreset === preset.id ? { background: preset.color, color: '#fff', borderColor: preset.color } : {}"
              @click="applyDiscountPreset(preset)"
            >
              {{ preset.label }}
            </button>
          </div>
          <div class="detail-row">
            <span>نوع</span>
            <select v-model="discountType">
              <option value="percent">درصدی</option>
              <option value="amount">مبلغی</option>
            </select>
          </div>
          <div class="detail-row">
            <span>مقدار</span>
            <input v-model.number="discountValue" type="number" min="0" />
          </div>
        </div>

        <!-- ⭐ بیمه کل جلسه -->
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
      </div>
    </template>

    <!-- Actions -->
    <div v-if="selected || mode === 'planned'" class="form-actions">
      <button class="btn-primary" :disabled="!canSubmit" @click="onSubmit">
        {{ mode === "done" ? "✅ ثبت درمان" : "📋 ثبت طرح درمان" }}
      </button>
      <button class="btn-secondary" @click="onCancel">انصراف</button>
    </div>

    <div v-if="selected && !canSubmit" class="hint">
      <span v-if="selected.needsSurface && surfaces.length === 0">
        ⚠️ حداقل یک سطح انتخاب کنید
      </span>
      <span v-else-if="selected.needsMaterial && !material">
        ⚠️ جنس را انتخاب کنید
      </span>
      <span v-else-if="mode === 'planned' && !newPlanTitle.trim()">
        ⚠️ عنوان طرح را وارد کنید
      </span>
      <span v-else-if="mode === 'done' && sessionMode === 'existing' && !selectedSessionId">
        ⚠️ یک جلسه انتخاب کنید یا حالت «جلسه جدید خودکار» را بزنید
      </span>
    </div>

    <div v-if="!selected && mode === 'done'" class="empty-hint">
      👆 یک سرویس از بالا انتخاب کنید (تخفیف/بیمه‌ی جلسه را می‌توانید همین الان تنظیم کنید)
    </div>
    <div v-if="!selected && mode === 'planned'" class="empty-hint">
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
.surface-cross { display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-areas: ". buccal ." "mesial occlusal distal" ". lingual ."; gap: 6px; max-width: 300px; }
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
.radio-inline { display: flex; gap: 5px; flex-wrap: wrap; }
.radio-chip { display: inline-flex; align-items: center; padding: 5px 10px; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; cursor: pointer; font-size: 11px; transition: all 0.15s; }
.radio-chip input { display: none; }
.radio-chip:hover { background: #f0f9ff; border-color: #93c5fd; }
.radio-chip.active { background: #2563eb; color: #fff; border-color: #2563eb; font-weight: 600; }
.required { color: #dc2626; }
.form-actions { display: flex; gap: 8px; margin-top: 4px; }
.btn-primary { flex: 1; padding: 10px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; }
.btn-primary:hover:not(:disabled) { background: #1d4ed8; }
.btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; }
.btn-secondary { padding: 10px 16px; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: 13px; }
.btn-secondary:hover { background: #e5e7eb; }
.hint { text-align: center; font-size: 11px; color: #f59e0b; padding: 4px; }
.empty-hint { text-align: center; color: #999; padding: 20px; font-size: 13px; }
.session-plan-info { padding: 8px 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; font-size: 11.5px; }
.info-line { color: #1e40af; }
.info-line strong { font-weight: 700; }
.info-line .muted { font-weight: 400; color: #6b7280; }
.info-line .no-plan { color: #6b7280; font-weight: 500; }
.plan-session-count { padding: 6px 10px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; font-size: 11px; color: #92400e; }

/* ⭐ بخش مالی جلسه (بیرون از v-if="selected") */
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
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #86efac;
}
.financial-hint {
  font-size: 10px;
  font-weight: 400;
  color: #16a34a;
}
.subsection-label {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}
.financial-empty {
  font-size: 11px;
  color: #9ca3af;
  padding: 6px;
  background: #fff;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  text-align: center;
}
</style>