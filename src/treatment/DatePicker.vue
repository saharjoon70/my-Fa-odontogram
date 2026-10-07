<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  date: string;
  time?: string;
}>();

const emit = defineEmits<{
  "update:date": [value: string];
  "update:time": [value: string];
}>();

const isExpanded = ref(false);

const displayDate = computed(() => {
  if (!props.date) return "—";
  try {
    return new Date(props.date).toLocaleDateString("fa-IR", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return props.date;
  }
});

function setToday() {
  emit("update:date", new Date().toISOString().slice(0, 10));
}

function setNow() {
  const now = new Date();
  emit("update:date", now.toISOString().slice(0, 10));
  emit("update:time", now.toTimeString().slice(0, 5));
}

function setTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  emit("update:date", d.toISOString().slice(0, 10));
}

function setNextWeek() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  emit("update:date", d.toISOString().slice(0, 10));
}
</script>

<template>
  <div class="date-picker">
    <div
      class="date-summary"
      @click="isExpanded = !isExpanded"
    >
      <span class="icon">📅</span>
      <span class="date-text">{{ displayDate }}</span>
      <span
        v-if="time"
        class="time-text"
      >
        <span class="icon">🕐</span>
        {{ time }}
      </span>
      <button class="edit-btn">
        {{ isExpanded ? "بستن" : "تغییر" }}
      </button>
    </div>

    <div
      v-if="isExpanded"
      class="date-edit"
    >
      <div class="quick-buttons">
        <button
          class="quick-btn"
          @click="setNow"
        >
          ⏰ الان
        </button>
        <button
          class="quick-btn"
          @click="setToday"
        >
          📅 امروز
        </button>
        <button
          class="quick-btn"
          @click="setTomorrow"
        >
          📅 فردا
        </button>
        <button
          class="quick-btn"
          @click="setNextWeek"
        >
          📅 هفته بعد
        </button>
      </div>

      <div class="date-inputs">
        <input
          type="date"
          :value="date"
          class="form-input"
          @input="emit('update:date', ($event.target as HTMLInputElement).value)"
        />
        <input
          type="time"
          :value="time"
          class="form-input"
          @input="emit('update:time', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-picker {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.date-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  cursor: pointer;
  transition: background 0.15s;
  flex-wrap: wrap;
}

.date-summary:hover {
  background: #f9fafb;
}

.icon {
  font-size: 13px;
}

.date-text,
.time-text {
  font-size: 12px;
  color: #1f2937;
  font-weight: 600;
}

.time-text {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  background: #eff6ff;
  border-radius: 12px;
  color: #1e40af;
}

.edit-btn {
  margin-right: auto;
  padding: 4px 10px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
}

.edit-btn:hover {
  background: #e5e7eb;
}

.date-edit {
  padding: 10px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.quick-btn {
  padding: 5px 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  color: #374151;
  font-weight: 500;
  transition: all 0.15s;
}

.quick-btn:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1e40af;
}

.date-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.form-input {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  background: #fff;
  width: 100%;
}
</style>