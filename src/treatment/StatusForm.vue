<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  STATUS_GROUPS,
  type StatusGroup,
  type StatusItem,
  type StatusRadio,
  type StatusSelect,
} from "./statusGroups";
import { isItemChecked, getRadioValue } from "./statusToState";
import {
  submitStatus,
  unsubmitStatus,
  applyStatusExtraPreset,
} from "./applyTreatment";
import { STATUS_EXTRAS } from "./status_extras";
import FillingPanel from "./FillingPanel.vue";

const props = defineProps<{
  patientId: string;
  toothNos: number[];
  toothState: Record<string, unknown> | null;
}>();

const emit = defineEmits<{
  change: [];
}>();

const activeGroup = ref<StatusGroup>("presence");
const selectedExtraId = ref<string>("");

// ⭐ اضافه کردن طرح درمان
function applyExtra() {
  if (!selectedExtraId.value) return;
  const extra = STATUS_EXTRAS.options.find(
    (o) => o.id === selectedExtraId.value,
  );
  if (!extra) return;
  applyStatusExtraPreset(props.patientId, extra);
  selectedExtraId.value = "";
  emit("change");
}

// ⭐ گروه‌های مرتبط
const applicableGroups = computed(() => {
  if (!props.toothState) return STATUS_GROUPS;
  const filtered = STATUS_GROUPS.filter((g) => {
    if (!g.appliesWhen) return true;
    return g.appliesWhen(props.toothState!);
  });
  if (filtered.length === 0) return STATUS_GROUPS;
  return filtered;
});

const currentGroup = computed(() =>
  applicableGroups.value.find((g) => g.id === activeGroup.value),
);

const applicableItems = computed(() => {
  const group = currentGroup.value;
  if (!group?.items) return [];
  if (!props.toothState) return group.items;
  return group.items.filter((item) => {
    if (!item.appliesWhen) return true;
    return item.appliesWhen(props.toothState!);
  });
});

const applicableRadios = computed(() => {
  const group = currentGroup.value;
  if (!group?.radios) return [];
  if (!props.toothState) return group.radios;
  return group.radios.filter((radio) => {
    if (!radio.appliesWhen) return true;
    return radio.appliesWhen(props.toothState!);
  });
});

const applicableSelects = computed(() => {
  const group = currentGroup.value;
  if (!group?.selects) return [];
  if (!props.toothState) return group.selects;
  return group.selects.filter((sel) => {
    if (!sel.appliesWhen) return true;
    return sel.appliesWhen(props.toothState!);
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

watch(
  applicableGroups,
  (groups) => {
    if (!groups.find((g) => g.id === activeGroup.value)) {
      activeGroup.value = groups[0]?.id ?? "presence";
    }
  },
  { immediate: true },
);

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

function onSelectChange(group: string, select: StatusSelect, value: string) {
  for (const toothNo of props.toothNos) {
    submitStatus(props.patientId, toothNo, group, select.field, value);
  }
  emit("change");
}

function getRadio(group: string, radio: StatusRadio): string {
  if (!props.toothState) return "";
  return getRadioValue(radio, props.toothState);
}

function getSelectValue(field: string): string {
  if (!props.toothState) return "";
  return (props.toothState[field] as string) ?? "";
}

function isChecked(group: string, item: StatusItem): boolean {
  return localChecked.value[`${group}:${item.id}`] ?? false;
}
</script>

<template>
  <div class="status-form" dir="rtl">
    <!-- زیرتب‌ها -->
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

    <!-- محتوای گروه -->
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

      <!-- Surface Cross / FillingPanel -->
      <FillingPanel
        v-if="currentGroup.surfaceCross && props.toothState"
        :patient-id="patientId"
        :tooth-nos="toothNos"
        :tooth-state="props.toothState"
        @change="emit('change')"
      />

      <!-- Select ها -->
      <div
        v-if="!currentGroup.surfaceCross && applicableSelects.length"
        class="select-section"
      >
        <label
          v-for="sel in applicableSelects"
          :key="sel.field"
          class="select-row"
        >
          <span>{{ sel.label }}</span>
          <select
            :value="getSelectValue(sel.field)"
            @change="onSelectChange(currentGroup.id, sel, ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="opt in sel.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </label>
      </div>

      <!-- Checkbox ها -->
      <div
        v-if="!currentGroup.surfaceCross && applicableItems.length"
        class="check-list"
      >
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

      <!-- افزودن سریع -->
      <div
        v-if="activeGroup === 'presence'"
        class="status-extras"
      >
        <div class="extras-row">
          <span class="extras-label">افزودن سریع:</span>
          <select v-model="selectedExtraId" class="extras-select">
            <option value="">— انتخاب کنید —</option>
            <option
              v-for="opt in STATUS_EXTRAS.options"
              :key="opt.id"
              :value="opt.id"
            >
              {{ opt.label }}
            </option>
          </select>
          <button
            class="extras-apply"
            :disabled="!selectedExtraId"
            @click="applyExtra"
          >
            تأیید
          </button>
        </div>
      </div>

      <!-- پیام خالی -->
      <div
        v-if="!currentGroup.surfaceCross && !applicableItems.length && !applicableRadios.length && !applicableSelects.length && activeGroup !== 'presence'"
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

.select-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
}

.select-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
}

.select-row > span {
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.select-row select {
  flex: 1;
  max-width: 240px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  background: #fff;
  cursor: pointer;
}

.select-row select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
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

.status-extras {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e5e5e5;
}

.extras-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.extras-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.extras-select {
  flex: 1;
  min-width: 200px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  background: #fff;
  cursor: pointer;
}

.extras-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.extras-apply {
  padding: 6px 14px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.extras-apply:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}
</style>