<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  getSelectedTeeth,
  onSelectionChange,
  onStateChange,
  setSelectedTeeth,              // ⭐ جدید
  setToothStateAndRender, 
} from "../odontogram";
import { submitTreatment } from "./applyTreatment";
import {
  addSession,
 updateSession,                  // ⭐ قبلاً بود
  getNextSessionNumber,
  getNextSessionNumberForPatient, // ⭐ قبلاً بود
} from "./treatmentPlanStore";
import TreatmentForm from "./TreatmentForm.vue";

const props = defineProps<{
  patientId: string;
}>();

const selectedTeeth = ref<number[]>([]);

let unsubSel: (() => void) | undefined;
let unsubState: (() => void) | undefined;

function refresh() {
  selectedTeeth.value = getSelectedTeeth();
}

onMounted(() => {
  refresh();
  unsubSel = onSelectionChange(() => refresh());
  unsubState = onStateChange(() => refresh());
});

onUnmounted(() => {
  unsubSel?.();
  unsubState?.();
});

function onSubmit(payload: {
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
}) {
  // ═══════════════════════════════════════════════════════════════
  // mode = planned → فقط طرح (بدون جلسه، بدون درمان)
  // ═══════════════════════════════════════════════════════════════
  if (payload.status === "planned") {
    for (const toothNo of selectedTeeth.value) {
      submitTreatment(props.patientId, toothNo, {
        treatmentId: payload.treatmentId,
        treatmentLabel: payload.treatmentLabel,
        category: payload.category,
        surface: payload.surfaces?.[0],
        material: payload.material,
        price: payload.price,
        status: "planned",
        note: payload.note,
        planId: payload.planId,
        planTitle: payload.planTitle,
        doctorId: payload.doctorId,
      });
    }

    // ⭐ بعد از ثبت طرح، state دندان‌ها را کامل ریست کن
    for (const toothNo of selectedTeeth.value) {
      setToothStateAndRender(
        toothNo,
        getEmptyToothState(),
        { replaceCustomStates: true },
      );
    }

    refresh();
    return;
  }

  // ═══════════════════════════════════════════════════════════════
  // mode = done → جلسه + درمان
  // ═══════════════════════════════════════════════════════════════

  // ─── مالی جلسه ───
  const sessionFinancial = {
    discountType: payload.discountType,
    discountValue: payload.discountValue,
    discountReason: payload.discountReason,
    insuranceType: payload.insuranceType ?? "none",
    insuranceValue: payload.insuranceValue,
    insuranceName: payload.insuranceName,
  };

  // ─── مرحله ۱: تعیین جلسه ───
  let finalSessionId = payload.sessionId;
  let finalSessionNumber: number | undefined;
  let finalSessionTitle = payload.sessionTitle;

  const isExistingSession =
    payload.sessionMode === "existing" && !!finalSessionId;

  if (isExistingSession && finalSessionId) {
    // ⭐ جلسه‌ی موجود → فقط تخفیف/بیمه را آپدیت کن
    updateSession(finalSessionId, sessionFinancial);
  } else {
    // ⭐ جلسه‌ی جدید بساز
    const nextNum = payload.planId
      ? getNextSessionNumber(payload.planId)
      : getNextSessionNumberForPatient(props.patientId);

    const sessionTitle = payload.sessionTitle?.trim() || `جلسه ${nextNum}`;

    const newSess = addSession({
      patientId: props.patientId,
      planId: payload.planId,
      sessionNumber: nextNum,
      title: sessionTitle,
      sessionDate: payload.date,
      sessionTime: payload.time,
      status: "done",
      doctorId: payload.doctorId,
      assistantId: payload.assistantId,
      ...sessionFinancial,
    });

    finalSessionId = newSess.id;
    finalSessionNumber = newSess.sessionNumber;
    finalSessionTitle = newSess.title;
  }

  // ─── مرحله ۲: ثبت درمان برای هر دندان ───
  for (const toothNo of selectedTeeth.value) {
    submitTreatment(props.patientId, toothNo, {
      treatmentId: payload.treatmentId,
      treatmentLabel: payload.treatmentLabel,
      category: payload.category,
      surface: payload.surfaces?.[0],
      material: payload.material,
      price: payload.price,
      status: "done",
      note: payload.note,
      planId: payload.planId,
      planTitle: payload.planTitle,
      sessionId: finalSessionId,
      sessionNumber: finalSessionNumber,
      sessionTitle: finalSessionTitle,
      doctorId: payload.doctorId,
      assistantId: payload.assistantId,
      sessionDate: payload.date,
      sessionTime: payload.time,
      time: payload.time,
    });
  }

  // ⭐ مرحله ۳: بعد از ثبت، state دندان‌ها را کامل ریست کن
  //    (تا odontogram صفحه اصلی پاک شود و برای درمان بعدی آماده باشد)
  for (const toothNo of selectedTeeth.value) {
    setToothStateAndRender(
      toothNo,
      getEmptyToothState(),
      { replaceCustomStates: true },
    );
  }

  // ⭐ پاک کردن انتخاب دندان‌ها
  setSelectedTeeth([]);

  refresh();
}

// ⭐ تابع کمکی برای state خالی
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
</script>

<template>
  <div class="treatment-panel" dir="rtl">
    <TreatmentForm
      :patient-id="patientId"
      :tooth-nos="selectedTeeth"
      @submit="onSubmit"
    />

    <div v-if="selectedTeeth.length === 0" class="empty-hint">
      👆 یک یا چند دندان از چارت انتخاب کنید
    </div>
  </div>
</template>

<style scoped>
.treatment-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
}

.empty-hint {
  text-align: center;
  color: #9ca3af;
  padding: 30px 20px;
  font-size: 13px;
}
</style>