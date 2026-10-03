<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  STATUS_GROUPS,
  type StatusGroup,
  type StatusItem,
  type StatusRadio,
} from "./statusGroups";
import { isItemChecked, getRadioValue } from "./statusToState";
import { submitStatus, unsubmitStatus } from "./applyTreatment";

const props = defineProps<{
  patientId: string;
  toothNos: number[];
  toothState: Record<string, unknown> | null;
}>();

const emit = defineEmits<{
  change: [];
}>();

const activeGroup = ref<StatusGroup>("presence");

// ⭐ گروه‌های مرتبط (برای زیرتب‌ها)
const applicableGroups = computed(() => {
  if (!props.toothState) return STATUS_GROUPS;

  const filtered = STATUS_GROUPS.filter((g) => {
    if (!g.appliesWhen) return true;
    return g.appliesWhen(props.toothState!);
  });

  // Safety net
  if (filtered.length === 0) return STATUS_GROUPS;

  return filtered;
});

// ⭐ گروه فعال
const currentGroup = computed(() =>
  applicableGroups.value.find((g) => g.id === activeGroup.value),
);

// ⭐ آیتم‌های فیلترشده
const applicableItems = computed(() => {
  const group = currentGroup.value;
  if (!group?.items) return [];
  if (!props.toothState) return group.items;

  return group.items.filter((item) => {
    if (!item.appliesWhen) return true;
    return item.appliesWhen(props.toothState!);
  });
});

// ⭐ رادیوهای فیلترشده
const applicableRadios = computed(() => {
  const group = currentGroup.value;
  if (!group?.radios) return [];
  if (!props.toothState) return group.radios;

  return group.radios.filter((radio) => {
    if (!radio.appliesWhen) return true;
    return radio.appliesWhen(props.toothState!);
  });
});

const localChecked = ref<Record<string, boolean>>({});

function refreshLocal() {
  const state = props.toothState;
  if (!state) {
    localChecked.value = {};
    return;
  }
  const next: Record<string, boolean> = {};
  for (const group of STATUS_GROUPS) {
    for (const item of group.items) {
      next[`${group.id}:${item.id}`] = isItemChecked(item, state);
    }
  }
  localChecked.value = next;
}

watch(
  () => [...props.toothNos],
  () => refreshLocal(),
  { immediate: true },
);

watch(
  () => props.toothState,
  () => refreshLocal(),
  { deep: true },
);

// ⭐ اطمینان از اینکه activeGroup همیشه معتبر باشد
watch(applicableGroups, (groups) => {
  if (!groups.find((g) => g.id === activeGroup.value)) {
    activeGroup.value = groups[0]?.id ?? "presence";
  }
}, { immediate: true });

function onToggleCheckbox(group: string, item: StatusItem, ev: Event) {
  const checked = (ev.target as HTMLInputElement).checked;
  const key = `${group}:${item.id}`;
  localChecked.value[key] = checked;

  for (const toothNo of props.toothNos) {
    if (checked) {
      submitStatus(props.patientId, toothNo, group, item.id, item.value ?? true);
    } else {
      unsubmitStatus(props.patientId, toothNo, group, item.id);
    }
  }
  emit("change");
}

function onRadioChange(group: string, radio: StatusRadio, value: string) {
  for (const toothNo of props.toothNos) {
    submitStatus(props.patientId, toothNo, group, radio.field, value);
  }
  emit("change");
}

function getRadio(group: string, radio: StatusRadio): string {
  if (!props.toothState) return "";
  return getRadioValue(radio, props.toothState);
}

function isChecked(group: string, item: StatusItem): boolean {
  return localChecked.value[`${group}:${item.id}`] ?? false;
}
</script>

<template>
  <div class="status-form" dir="rtl">
    <!-- زیرتب‌های گروهی — فقط گروه‌های مرتبط -->
    <div class="group-tabs">
      <button
        v-for="g in applicableGroups"
        :key="g.id"
        :class="['group-tab', { active: activeGroup === g.id }]"
        @click="activeGroup = g.id"
      >
        <span class="group-icon">{{ g.icon }}</span>
        <span class="group-label">{{ g.label }}</span>
      </button>
    </div>

    <!-- محتوای گروه فعال -->
    <div v-if="currentGroup" class="group-body">
      <!-- Radio ها -->
      <div v-if="applicableRadios.length" class="radio-section">
        <div
          v-for="radio in applicableRadios"
          :key="radio.field"
          class="radio-row"
        >
          <div class="radio-label">{{ radio.label }}</div>
          <div class="radio-options">
            <label
              v-for="opt in radio.options"
              :key="opt.value"
              class="radio-option"
              :class="{ active: getRadio(currentGroup.id, radio) === opt.value }"
            >
              <input
                type="radio"
                :name="`${currentGroup.id}-${radio.field}`"
                :value="opt.value"
                :checked="getRadio(currentGroup.id, radio) === opt.value"
                @change="onRadioChange(currentGroup.id, radio, opt.value)"
              >
              <span>{{ opt.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Checkbox ها -->
      <div v-if="applicableItems.length" class="check-list">
        <label
          v-for="item in applicableItems"
          :key="item.id"
          class="check-item"
          :class="{ checked: isChecked(currentGroup.id, item) }"
        >
          <input
            type="checkbox"
            :checked="isChecked(currentGroup.id, item)"
            @change="onToggleCheckbox(currentGroup.id, item, $event)"
          >
          <span>{{ item.label }}</span>
        </label>
      </div>

      <!-- پیام خالی -->
      <div
        v-if="!applicableItems.length && !applicableRadios.length"
        class="empty-hint"
      >
        گزینه‌ای برای این دندان وجود ندارد
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.group-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid #e5e5e5;
  background: #f9f9f9;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  transition: all 0.15s;
  white-space: nowrap;
}

.group-tab:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}

.group-tab.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.group-icon {
  font-size: 14px;
}

.group-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
}

.radio-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.radio-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.radio-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.radio-option {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}

.radio-option:hover {
  background: #f0f9ff;
  border-color: #93c5fd;
}

.radio-option.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.radio-option input {
  display: none;
}

.check-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 6px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border: 1px solid #e5e5e5;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}

.check-item:hover {
  background: #f0f9ff;
  border-color: #93c5fd;
}

.check-item.checked {
  background: #eff6ff;
  border-color: #2563eb;
  color: #1d4ed8;
  font-weight: 500;
}

.check-item input {
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: #2563eb;
}

.empty-hint {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 13px;
}
</style>