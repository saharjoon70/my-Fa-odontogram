<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  getSelectedTeeth,
  onSelectionChange,
  onStateChange,
} from "../odontogram";
import { submitTreatment } from "./applyTreatment";
import {
  addSession,
  updateSession,
  getNextSessionNumber,
  getNextSessionNumberForPatient,
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
    refresh();
    return;
  }

  // ═══════════════════════════════════════════════════════════════
  // mode = done → جلسه + درمان
  // ═══════════════════════════════════════════════════════════════

  // ─── مالی جلسه (فقط این بخش روی session ذخیره می‌شود) ───
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
    // ⭐ جلسه‌ی موجود → فقط تخفیف/بیمه را روی آن آپدیت کن
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
      // ⭐ مالی جلسه
      ...sessionFinancial,
    });

    finalSessionId = newSess.id;
    finalSessionNumber = newSess.sessionNumber;
    finalSessionTitle = newSess.title;
  }

  // ─── مرحله ۲: ثبت درمان برای هر دندان (بدون تخفیف/بیمه) ───
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
      // ❌ تخفیف/بیمه اینجا نمی‌رود (روی session است)
    });
  }

  refresh();
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