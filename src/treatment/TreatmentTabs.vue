<script setup lang="ts">
import { ref } from "vue";
import StatusPanel from "./StatusPanel.vue";
import TreatmentPanel from "./TreatmentPanel.vue";
import DiagnosisPanel from "./DiagnosisPanel.vue";

const props = defineProps<{
  patientId: string;
}>();

type TabId = "status" | "treatment" | "diagnosis";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "status",    label: "ثبت وضعیت",  icon: "🦷" },
  { id: "treatment", label: "ثبت درمان",  icon: "🛠" },
  { id: "diagnosis", label: "تشخیص",      icon: "🔬" },
];

const activeTab = ref<TabId>("status");
</script>

<template>
  <div class="treatment-tabs" dir="rtl">
    <!-- تب‌های اصلی -->
    <div class="main-tabs" role="tablist">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :class="['main-tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- محتوای تب -->
    <div class="tab-content" role="tabpanel">
      <StatusPanel
        v-if="activeTab === 'status'"
        :patient-id="patientId"
      />
      <TreatmentPanel
        v-else-if="activeTab === 'treatment'"
        :patient-id="patientId"
      />
      <DiagnosisPanel
        v-else-if="activeTab === 'diagnosis'"
        :patient-id="patientId"
      />
    </div>
  </div>
</template>

<style scoped>
.treatment-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 8px;
}

/* ─── تب‌های اصلی ─── */
.main-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f3f4f6;
  border-radius: 10px;
  flex-shrink: 0;
}

.main-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.15s;
  white-space: nowrap;
}

.main-tab:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.main-tab.active {
  background: #fff;
  color: #2563eb;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab-icon {
  font-size: 16px;
}

/* ─── محتوا ─── */
.tab-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* موبایل: تب‌ها به‌صورت ستونی کوچک‌تر */
@media (max-width: 480px) {
  .tab-label {
    display: none;
  }
  .main-tab {
    padding: 10px 6px;
  }
  .tab-icon {
    font-size: 20px;
  }
}
</style>