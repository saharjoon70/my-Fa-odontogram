<script setup lang="ts">
import { computed } from "vue";
import { calculateFinancials } from "./applyTreatment";

const props = defineProps<{
  records: Array<{
    price: number;
    discountType?: "percent" | "amount";
    discountValue?: number;
    insuranceType?: "percent" | "amount" | "none";
    insuranceValue?: number;
    status: "done" | "planned" | "cancelled";
  }>;
  compact?: boolean;
}>();

const totals = computed(() => {
  let totalPrice = 0;
  let totalDiscount = 0;
  let totalInsurance = 0;
  let totalPatient = 0;
  let donePrice = 0;
  let doneDiscount = 0;
  let doneInsurance = 0;
  let donePatient = 0;

  for (const rec of props.records) {
    const fin = calculateFinancials(rec);
    totalPrice += fin.price;
    totalDiscount += fin.discountAmount;
    totalInsurance += fin.insuranceAmount;
    totalPatient += fin.patientAmount;

    if (rec.status === "done") {
      donePrice += fin.price;
      doneDiscount += fin.discountAmount;
      doneInsurance += fin.insuranceAmount;
      donePatient += fin.patientAmount;
    }
  }

  return {
    totalPrice,
    totalDiscount,
    totalInsurance,
    totalPatient,
    donePrice,
    doneDiscount,
    doneInsurance,
    donePatient,
    remainingPrice: totalPrice - donePrice,
  };
});

function format(n: number): string {
  return n.toLocaleString("fa-IR") + " ت";
}
</script>

<template>
  <div class="financial-summary" :class="{ compact }">
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-label">مبلغ کل</div>
        <div class="summary-value">{{ format(totals.totalPrice) }}</div>
      </div>
      <div v-if="totals.totalDiscount > 0" class="summary-item discount">
        <div class="summary-label">تخفیف</div>
        <div class="summary-value">- {{ format(totals.totalDiscount) }}</div>
      </div>
      <div v-if="totals.totalInsurance > 0" class="summary-item insurance">
        <div class="summary-label">سهم بیمه</div>
        <div class="summary-value">{{ format(totals.totalInsurance) }}</div>
      </div>
      <div class="summary-item patient">
        <div class="summary-label">سهم بیمار (کل)</div>
        <div class="summary-value">{{ format(totals.totalPatient) }}</div>
      </div>
    </div>

    <div v-if="totals.donePrice > 0" class="progress-grid">
      <div class="summary-item done">
        <div class="summary-label">✅ پرداخت‌شده</div>
        <div class="summary-value">{{ format(totals.donePatient) }}</div>
      </div>
      <div class="summary-item remaining">
        <div class="summary-label">⏳ باقی‌مانده</div>
        <div class="summary-value">{{ format(totals.totalPatient - totals.donePatient) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.financial-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
}

.summary-grid,
.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 6px;
}

.summary-item {
  padding: 8px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.summary-item.discount {
  background: #fef3c7;
  border-color: #fde68a;
}

.summary-item.insurance {
  background: #dbeafe;
  border-color: #bfdbfe;
}

.summary-item.patient {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.summary-item.done {
  background: #dcfce7;
  border-color: #86efac;
}

.summary-item.remaining {
  background: #fef3c7;
  border-color: #fcd34d;
}

.summary-label {
  font-size: 10px;
  color: #6b7280;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 12px;
  font-weight: 700;
  color: #111827;
}

.compact .summary-item {
  padding: 6px;
}

.compact .summary-value {
  font-size: 11px;
}
</style>