<script setup lang="ts">
import { computed, ref } from "vue";
import {
  getRadiographsForPatient,
  RADIOGRAPH_TYPE_LABELS,
  type Radiograph,
} from "./radiographStore";

const props = defineProps<{
  patientId: string;
  planId?: string;
  sessionId?: string;
  compact?: boolean;
}>();

const emit = defineEmits<{
  add: [];
}>();

const selectedRad = ref<Radiograph | null>(null);

const radiographs = computed(() =>
  getRadiographsForPatient(props.patientId),
);

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR");
  } catch {
    return iso;
  }
}
</script>

<template>
  <div class="radiograph-section">
    <div class="section-header">
      <span class="section-title">
        🖼 رادیوگرافی‌ها ({{ radiographs.length }})
      </span>
      <button
        class="btn-add-rad"
        @click="emit('add')"
      >
        + افزودن
      </button>
    </div>

    <div
      v-if="radiographs.length === 0"
      class="empty-rads"
    >
      <div class="empty-icon">
        🖼
      </div>
      <div>هنوز رادیوگرافی ثبت نشده</div>
      <div class="empty-hint">
        برای افزودن، روی دکمه بالا بزنید
      </div>
    </div>

    <div
      v-else
      class="radiographs-grid"
    >
      <div
        v-for="rad in radiographs"
        :key="rad.id"
        class="radiograph-card"
        @click="selectedRad = rad"
      >
        <div class="rad-thumb">
          <img
            v-if="rad.thumbnail || rad.imageUrl"
            :src="rad.thumbnail || rad.imageUrl"
            :alt="RADIOGRAPH_TYPE_LABELS[rad.type]"
          >
          <div
            v-else
            class="rad-placeholder"
          >
            <span class="icon">🖼</span>
          </div>
        </div>
        <div class="rad-info">
          <div class="rad-type">
            {{ RADIOGRAPH_TYPE_LABELS[rad.type] }}
          </div>
          <div class="rad-date">
            {{ formatDate(rad.date) }}
          </div>
          <div
            v-if="rad.toothNos.length"
            class="rad-teeth"
          >
            {{ rad.toothNos.map((t) => `#${t}`).join(", ") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.radiograph-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
}

.btn-add-rad {
  padding: 4px 10px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
}

.btn-add-rad:hover {
  background: #1d4ed8;
}

.empty-rads {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 12px;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 10px;
  color: #cbd5e1;
  margin-top: 4px;
}

.radiographs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.radiograph-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s;
}

.radiograph-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
  transform: translateY(-1px);
}

.rad-thumb {
  aspect-ratio: 1;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rad-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rad-placeholder {
  font-size: 32px;
  color: #9ca3af;
}

.rad-info {
  padding: 6px 8px;
}

.rad-type {
  font-size: 11px;
  font-weight: 600;
  color: #111827;
}

.rad-date {
  font-size: 10px;
  color: #6b7280;
  margin-top: 2px;
}

.rad-teeth {
  font-size: 9px;
  color: #2563eb;
  margin-top: 2px;
}
</style>

