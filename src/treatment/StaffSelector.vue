<script setup lang="ts">
import { computed, ref } from "vue";
import {
  getDoctors,
  getAssistants,
  getStaffById,
  type StaffMember,
} from "./treatmentPlanStore";

const props = defineProps<{
  doctorId?: string;
  assistantId?: string;
  compact?: boolean;
}>();

const emit = defineEmits<{
  "update:doctorId": [value: string];
  "update:assistantId": [value: string];
}>();

const isExpanded = ref(false);

const doctors = computed(() => getDoctors());
const assistants = computed(() => getAssistants());
const currentDoctor = computed(() => getStaffById(props.doctorId ?? ""));
const currentAssistant = computed(() => getStaffById(props.assistantId ?? ""));

function selectDoctor(doc: StaffMember) {
  emit("update:doctorId", doc.id);
}

function selectAssistant(asst: StaffMember) {
  emit("update:assistantId", asst.id);
}
</script>

<template>
  <div
    class="staff-selector"
    :class="{ compact, expanded: isExpanded }"
  >
    <!-- نمایش خلاصه -->
    <div
      class="staff-summary"
      @click="isExpanded = !isExpanded"
    >
      <div class="staff-chips">
        <span
          v-if="currentDoctor"
          class="staff-chip doctor"
          :style="{ borderColor: currentDoctor.color || '#2563eb' }"
        >
          <span class="avatar">👨‍⚕️</span>
          <span class="name">{{ currentDoctor.name }}</span>
        </span>
        <span
          v-else
          class="staff-chip empty"
        >
          <span class="avatar">👨‍⚕️</span>
          <span class="name">دکتر انتخاب نشده</span>
        </span>

        <span
          v-if="currentAssistant"
          class="staff-chip assistant"
          :style="{ borderColor: currentAssistant.color || '#16a34a' }"
        >
          <span class="avatar">👤</span>
          <span class="name">{{ currentAssistant.name }}</span>
        </span>
        <span
          v-else
          class="staff-chip empty"
        >
          <span class="avatar">👤</span>
          <span class="name">بدون دستیار</span>
        </span>
      </div>
      <button class="edit-btn">
        {{ isExpanded ? "بستن" : "تغییر" }}
      </button>
    </div>

    <!-- ویرایش -->
    <div
      v-if="isExpanded"
      class="staff-edit"
    >
      <div class="staff-group">
        <div class="group-title">دکتر</div>
        <div class="staff-options">
          <button
            v-for="doc in doctors"
            :key="doc.id"
            :class="['staff-option', { active: doctorId === doc.id }]"
            @click="selectDoctor(doc)"
          >
            <span
              class="color-dot"
              :style="{ background: doc.color || '#2563eb' }"
            ></span>
            {{ doc.name }}
          </button>
        </div>
      </div>

      <div class="staff-group">
        <div class="group-title">دستیار</div>
        <div class="staff-options">
          <button
            :class="['staff-option', { active: !assistantId }]"
            @click="selectAssistant({ id: '', name: 'بدون', role: 'assistant' })"
          >
            <span class="color-dot gray"></span>
            بدون دستیار
          </button>
          <button
            v-for="asst in assistants"
            :key="asst.id"
            :class="['staff-option', { active: assistantId === asst.id }]"
            @click="selectAssistant(asst)"
          >
            <span
              class="color-dot"
              :style="{ background: asst.color || '#16a34a' }"
            ></span>
            {{ asst.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.staff-selector {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.staff-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.staff-summary:hover {
  background: #f9fafb;
}

.staff-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
}

.staff-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  font-size: 11px;
  background: #fff;
  transition: all 0.15s;
}

.staff-chip.doctor {
  background: #eff6ff;
}

.staff-chip.assistant {
  background: #f0fdf4;
}

.staff-chip.empty {
  background: #f9fafb;
  color: #9ca3af;
  border-style: dashed;
}

.avatar {
  font-size: 12px;
}

.name {
  font-weight: 600;
}

.edit-btn {
  padding: 4px 10px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.15s;
}

.edit-btn:hover {
  background: #e5e7eb;
}

/* Edit mode */
.staff-edit {
  padding: 10px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.staff-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.group-title {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.staff-options {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.staff-option {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  border-radius: 20px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  color: #374151;
  transition: all 0.15s;
}

.staff-option:hover {
  border-color: #93c5fd;
  background: #f0f9ff;
}

.staff-option.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1e40af;
  font-weight: 600;
}

.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.color-dot.gray {
  background: #cbd5e1;
}
</style>