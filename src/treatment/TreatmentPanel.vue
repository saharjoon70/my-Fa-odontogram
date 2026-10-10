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
  discountType?: "percent" | "amount";
  discountValue?: number;
  discountReason?: string;
  discountAmount?: number;
  insuranceType?: "percent" | "amount" | "none";
  insuranceValue?: number;
  insuranceName?: string;
  insuranceAmount?: number;
  patientAmount?: number;
}) {
  // ═══════════════════════════════════════════════════════════════
  // ⭐ mode = planned (طرح درمان)
  //    - فقط طرح در تب «طرح درمان» ثبت می‌شود
  //    - جلسه‌ای ساخته نمی‌شود
  //    - sessionId به TreatmentRecord داده نمی‌شود
  //    - جلسه در ابتدا ۰ است (منشی بعداً می‌تواند از تب طرح بسازد)
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
        // ❌ بدون sessionId / sessionNumber / sessionTitle
        // ❌ بدون sessionDate / sessionTime / time
        doctorId: payload.doctorId,
        // ❌ بدون assistantId
        // ❌ بدون تخفیف / بیمه
      });
    }
    refresh();
    return;
  }

  // ═══════════════════════════════════════════════════════════════
  // ⭐ mode = done (ثبت درمان)
  //    - جلسه ساخته/انتخاب می‌شود
  //    - درمان به آن جلسه متصل می‌شود
  // ═══════════════════════════════════════════════════════════════

  // ─── مرحله ۱: تعیین جلسه ───
  let finalSessionId = payload.sessionId;
  let finalSessionNumber: number | undefined;
  let finalSessionTitle = payload.sessionTitle;

  const needsNewSession =
    payload.sessionMode !== "existing" || !finalSessionId;

  if (needsNewSession) {
    // شماره‌ی جلسه:
    //   - اگر طرح انتخاب شده → شماره‌ی بعدی در آن طرح
    //   - اگر طرح نیست → شماره‌ی بعدی کلی بیمار
    const nextNum = payload.planId
      ? getNextSessionNumber(payload.planId)
      : getNextSessionNumberForPatient(props.patientId);

    // عنوان جلسه:
    //   - اگر کاربر داده → همان
    //   - وگرنه → «جلسه {شماره}» (خودکار)
    const sessionTitle = payload.sessionTitle?.trim() || `جلسه ${nextNum}`;

    const newSess = addSession({
      patientId: props.patientId,
      // planId اختیاری است — اگر undefined باشد، جلسه بدون طرح ساخته می‌شود
      planId: payload.planId,
      sessionNumber: nextNum,
      title: sessionTitle,
      sessionDate: payload.date,
      sessionTime: payload.time,
      status: "done",
      doctorId: payload.doctorId,
      assistantId: payload.assistantId,
    });

    finalSessionId = newSess.id;
    finalSessionNumber = newSess.sessionNumber;
    finalSessionTitle = newSess.title;
  }
  // ⭐ حالت existing: sessionId از payload می‌آید،
  //    sessionNumber/sessionTitle در SessionsPanel از planStore خوانده می‌شوند.

  // ─── مرحله ۲: ثبت درمان برای هر دندان ───
  for (const toothNo of selectedTeeth.value) {
    submitTreatment(props.patientId, toothNo, {
      treatmentId: payload.treatmentId,
      treatmentLabel: payload.treatmentLabel,
      category: payload.category,
      surface: payload.surfaces?.[0],
      material: payload.material,
      price: payload.price,
      status: payload.status,
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
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      discountReason: payload.discountReason,
      discountAmount: payload.discountAmount,
      insuranceType: payload.insuranceType,
      insuranceValue: payload.insuranceValue,
      insuranceName: payload.insuranceName,
      insuranceAmount: payload.insuranceAmount,
      patientAmount: payload.patientAmount,
    });
  }

  refresh();
}
</script>

<template>
  <div class="treatment-panel" dir="rtl">
    <!-- ═══ Form ═══ -->
    <TreatmentForm
      :patient-id="patientId"
      :tooth-nos="selectedTeeth"
      @submit="onSubmit"
    />

    <!-- ⭐ اگه دندونی انتخاب نشده -->
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