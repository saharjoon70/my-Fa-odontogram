<script setup lang="ts">
import { ref } from "vue";
import StatusPanel from "./StatusPanel.vue";
import TreatmentPanel from "./TreatmentPanel.vue";
import DiagnosisPanel from "./DiagnosisPanel.vue";
import TreatmentPlanPanel from "./TreatmentPlanPanel.vue";
import SessionsPanel from "./SessionsPanel.vue";

defineProps<{
  patientId: string;
}>();

type TabId = "treatment" | "plan" | "sessions" | "diagnosis" | "status";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "treatment", label: "درمان / طرح", icon: "🛠" },
  { id: "plan",      label: "طرح درمان",   icon: "📋" },
  { id: "sessions",  label: "جلسات",       icon: "📅" },
  { id: "diagnosis", label: "تشخیص",       icon: "🔬" },
  { id: "status",    label: "وضعیت",       icon: "🦷" },
];

const activeTab = ref<TabId>("treatment");
</script>

<template>
  <div
    class="treatment-tabs"
    dir="rtl"
  >
    <div
      class="main-tabs"
      role="tablist"
    >
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

    <div
      class="tab-content"
      role="tabpanel"
    >
      <TreatmentPanel
        v-if="activeTab === 'treatment'"
        :patient-id="patientId"
      />
      <TreatmentPlanPanel
        v-else-if="activeTab === 'plan'"
        :patient-id="patientId"
      />
      <SessionsPanel
        v-else-if="activeTab === 'sessions'"
        :patient-id="patientId"
      />
      <DiagnosisPanel
        v-else-if="activeTab === 'diagnosis'"
        :patient-id="patientId"
      />
      <StatusPanel
        v-else-if="activeTab === 'status'"
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

.main-tabs {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: #f3f4f6;
  border-radius: 10px;
  flex-shrink: 0;
  overflow-x: auto;
}

.main-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 6px;
  border: none;
  background: transparent;
  border-radius: 7px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.15s;
  white-space: nowrap;
}

.main-tab:hover { background: #e5e7eb; color: #1f2937; }
.main-tab.active { background: #fff; color: #2563eb; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.tab-icon { font-size: 14px; }

.tab-content { flex: 1; min-height: 0; overflow-y: auto; }

@media (max-width: 480px) {
  .tab-label { display: none; }
  .tab-icon { font-size: 18px; }
}
</style>