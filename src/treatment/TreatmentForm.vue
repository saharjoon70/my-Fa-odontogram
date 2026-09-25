<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  MATERIALS,
  SURFACES,
  getTreatmentsByCategory,
  getSurfaceLabel,
  getSurfaceShort,
  type TreatmentItem,
} from "./treatments";
import {
  TREATMENT_TAB_CATEGORIES,
  getCategoryLabel,
} from "./categories";
import { getTreatmentIcon } from "./treatmentIcons";
import {
  previewTreatmentItem,
  resetToothToStoredState,
} from "./applyTreatment";

const props = defineProps<{
  patientId: string;
  toothNos: number[];
}>();

const emit = defineEmits<{
  submit: [payload: {
    treatmentId: string;
    treatmentLabel: string;
    category: string;
    surfaces?: string[];   // ⭐ آرایه
    material?: string;
    price: number;
    status: "done" | "planned";
    note: string;
  }];
  cancel: [];
}>();

const activeCategory = ref<string>(TREATMENT_TAB_CATEGORIES[0]?.id ?? "exam");
const selected = ref<TreatmentItem | null>(null);
const surfaces = ref<string[]>([]);   // ⭐ آرایه به‌جای رشته
const material = ref("");
const price = ref(0);
const status = ref<"done" | "planned">("done");
const note = ref("");

const activeToothNo = computed(() =>
  props.toothNos.length > 0 ? props.toothNos[0] : null,
);

// سطوح با label پویا بر اساس دندان
const surfaceOptions = computed(() =>
  SURFACES.map((s) => ({
    id: s.id,
    pos: s.pos,
    short: getSurfaceShort(s.id, activeToothNo.value),
    label: getSurfaceLabel(s.id, activeToothNo.value),
  })),
);

const filteredTreatments = computed(() =>
  getTreatmentsByCategory(activeCategory.value as any),
);

const canSubmit = computed(() => {
  if (!selected.value) return false;
  if (selected.value.needsSurface && surfaces.value.length === 0) return false;
  if (selected.value.needsMaterial && !material.value) return false;
  return true;
});

function refreshPreview() {
  if (props.toothNos.length === 0) return;

  for (const toothNo of props.toothNos) {
    resetToothToStoredState(props.patientId, toothNo);
  }

  if (!selected.value) return;
  for (const toothNo of props.toothNos) {
    previewTreatmentItem(toothNo, selected.value, {
      surfaces: surfaces.value,
      material: material.value || undefined,
    });
  }
}

function selectTreatment(item: TreatmentItem) {
  if (selected.value?.id === item.id) {
    selected.value = null;
    price.value = 0;
    surfaces.value = [];
    material.value = "";
    refreshPreview();
    return;
  }

  selected.value = item;
  price.value = item.defaultPrice ?? 0;
  surfaces.value = [];
  material.value = "";

  refreshPreview();
}

// ⭐ toggle سطح (چند انتخابی)
function toggleSurface(surfaceId: string) {
  const idx = surfaces.value.indexOf(surfaceId);
  if (idx >= 0) {
    surfaces.value = surfaces.value.filter((s) => s !== surfaceId);
  } else {
    surfaces.value = [...surfaces.value, surfaceId];
  }
  refreshPreview();
}

watch(material, () => {
  if (selected.value) refreshPreview();
});

watch(
  () => [...props.toothNos],
  () => refreshPreview(),
  { immediate: true },
);

function onSubmit() {
  if (!canSubmit.value || !selected.value) return;
  emit("submit", {
    treatmentId: selected.value.id,
    treatmentLabel: selected.value.label,
    category: selected.value.category,
    surfaces: surfaces.value.length > 0 ? [...surfaces.value] : undefined,
    material: material.value || undefined,
    price: price.value,
    status: status.value,
    note: note.value,
  });

  selected.value = null;
  surfaces.value = [];
  material.value = "";
  price.value = 0;
  status.value = "done";
  note.value = "";
}

function onCancel() {
  selected.value = null;
  surfaces.value = [];
  material.value = "";
  price.value = 0;
  note.value = "";
  for (const toothNo of props.toothNos) {
    resetToothToStoredState(props.patientId, toothNo);
  }
}
</script>

<template>
  <div class="treatment-form" dir="rtl">
    <div class="form-header">
      <div class="header-title">
        <span v-if="toothNos.length === 0">
          ابتدا یک دندان انتخاب کنید
        </span>
        <span v-else-if="toothNos.length === 1">
          ثبت درمان — دندان {{ toothNos[0] }}
        </span>
        <span v-else>
          ثبت درمان — {{ toothNos.length }} دندان ({{ toothNos.join(", ") }})
        </span>
      </div>
    </div>

    <div class="category-tabs">
      <button
        v-for="cat in TREATMENT_TAB_CATEGORIES"
        :key="cat.id"
        :class="['cat-tab', { active: activeCategory === cat.id }]"
        :style="activeCategory === cat.id ? { background: cat.color, color: '#fff', borderColor: cat.color } : {}"
        @click="activeCategory = cat.id"
      >
        {{ cat.label }}
      </button>
    </div>

    <div class="treatments-grid">
      <button
        v-for="item in filteredTreatments"
        :key="item.id"
        :class="['treatment-btn', { active: selected?.id === item.id }]"
        :title="item.label"
        @click="selectTreatment(item)"
      >
        <div class="treatment-icon" v-html="getTreatmentIcon(item.icon)"></div>
        <span class="treatment-label">{{ item.label }}</span>
      </button>
    </div>

    <div v-if="selected" class="treatment-details">
      <h4>جزئیات: {{ selected.label }}</h4>

      <div class="detail-preview">
        <div class="detail-icon" v-html="getTreatmentIcon(selected.icon)"></div>
        <div class="detail-info">
          <div class="detail-category">{{ getCategoryLabel(selected.category) }}</div>
          <div class="detail-name">{{ selected.label }}</div>
        </div>
      </div>

      <!-- ⭐ سطح — چند انتخابی با surface-cross -->
      <div v-if="selected.needsSurface" class="surface-picker">
        <div class="surface-label">سطح</div>
        <div class="surface-cross">
          <button
            v-for="s in surfaceOptions"
            :key="s.id"
            type="button"
            :class="['surface-cell', `pos-${s.pos}`, { active: surfaces.includes(s.id) }]"
            @click="toggleSurface(s.id)"
          >
            <span class="surf-letter">{{ s.short }}</span>
            <span class="surf-name">{{ s.label }}</span>
          </button>
        </div>
      </div>

      <label v-if="selected.needsMaterial" class="detail-row">
        <span>جنس</span>
        <select v-model="material">
          <option value="">— انتخاب —</option>
          <option v-for="m in MATERIALS" :key="m.id" :value="m.id">
            {{ m.label }}
          </option>
        </select>
      </label>

      <label class="detail-row">
        <span>قیمت (تومان)</span>
        <input v-model.number="price" type="number" min="0" step="50000" />
      </label>

      <label class="detail-row">
        <span>وضعیت</span>
        <select v-model="status">
          <option value="done">انجام شد</option>
          <option value="planned">طرح درمان</option>
        </select>
      </label>

      <label class="detail-row detail-row-full">
        <span>یادداشت</span>
        <textarea v-model="note" rows="2" placeholder="اختیاری..."></textarea>
      </label>

      <div class="form-actions">
        <button class="btn-primary" :disabled="!canSubmit" @click="onSubmit">
          ثبت درمان
        </button>
        <button class="btn-secondary" @click="onCancel">انصراف</button>
      </div>

      <div v-if="!canSubmit" class="hint">
        <span v-if="selected.needsSurface && surfaces.length === 0">
          ⚠️ حداقل یک سطح انتخاب کنید
        </span>
        <span v-else-if="selected.needsMaterial && !material">
          ⚠️ جنس را انتخاب کنید
        </span>
      </div>
    </div>

    <div v-else class="empty-hint">
      👆 یک سرویس از بالا انتخاب کنید
    </div>
  </div>
</template>

<style scoped>
.treatment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-header {
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.cat-tab {
  padding: 6px 12px;
  border: 1px solid #e5e5e5;
  background: #f9f9f9;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  white-space: nowrap;
  transition: all 0.15s;
}

.cat-tab:hover {
  background: #eff6ff;
}

.cat-tab.active {
  font-weight: 600;
}

.treatments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;
  padding: 4px;
  background: #fafafa;
  border-radius: 8px;
}

.treatment-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border: 2px solid #e5e5e5;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.treatment-btn:hover {
  border-color: #93c5fd;
  background: #f0f9ff;
  transform: translateY(-1px);
}

.treatment-btn.active {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.treatment-icon {
  color: #2563eb;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.treatment-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.treatment-label {
  font-size: 10.5px;
  text-align: center;
  line-height: 1.25;
  color: #333;
}

.treatment-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.treatment-details h4 {
  margin: 0;
  font-size: 13px;
  color: #1f2937;
}

.detail-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.detail-icon {
  color: #2563eb;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-icon :deep(svg) {
  width: 36px;
  height: 36px;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-name {
  font-size: 13px;
  font-weight: 600;
  color: #111;
}

.detail-category {
  font-size: 11px;
  color: #6b7280;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.detail-row > span {
  font-weight: 500;
  color: #374151;
}

.detail-row select,
.detail-row input,
.detail-row textarea {
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  background: #fff;
}

.detail-row-full {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.btn-primary {
  flex: 1;
  padding: 10px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.15s;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 16px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.hint {
  text-align: center;
  font-size: 11px;
  color: #f59e0b;
  padding: 4px;
}

.empty-hint {
  text-align: center;
  color: #999;
  padding: 30px 20px;
  font-size: 13px;
}

.surface-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.surface-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.surface-cross {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    ". buccal ."
    "mesial occlusal distal"
    ". lingual .";
  gap: 6px;
  max-width: 320px;
}

.surface-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 4px;
  border: 1.5px solid #e5e5e5;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  min-height: 50px;
}

.surface-cell:hover {
  border-color: #93c5fd;
  background: #f0f9ff;
}

.surface-cell.active {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.surface-cell.pos-buccal   { grid-area: buccal; }
.surface-cell.pos-mesial   { grid-area: mesial; }
.surface-cell.pos-occlusal { grid-area: occlusal; }
.surface-cell.pos-distal   { grid-area: distal; }
.surface-cell.pos-lingual  { grid-area: lingual; }

.surf-letter {
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}

.surf-name {
  font-size: 10px;
  line-height: 1;
}
</style>