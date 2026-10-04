<script setup lang="ts">
import { computed } from "vue";
import { submitStatus } from "./applyTreatment";

const props = defineProps<{
  patientId: string;
  toothNos: number[];
  toothState: Record<string, unknown>;
}>();

const emit = defineEmits<{
  change: [];
}>();

// ⭐ پنج سطح
const SURFACES = [
  { id: "buccal",   pos: "buccal",   short: "L", shortAnterior: "La" },
  { id: "mesial",   pos: "mesial",   short: "M", shortAnterior: "M" },
  { id: "occlusal", pos: "occlusal", short: "O", shortAnterior: "I" },
  { id: "distal",   pos: "distal",   short: "D", shortAnterior: "D" },
  { id: "lingual",  pos: "lingual",  short: "P", shortAnterior: "L" },
];

const isAnterior = computed(() => {
  const toothNo = props.toothNos[0];
  if (!toothNo) return false;
  return [11,12,13,21,22,23,31,32,33,41,42,43].includes(toothNo);
});

const isUpper = computed(() => {
  const toothNo = props.toothNos[0];
  if (!toothNo) return false;
  const q = Math.floor(toothNo / 10);
  return q === 1 || q === 2 || q === 5 || q === 6;
});

function surfaceShort(surfaceId: string): string {
  const s = SURFACES.find((x) => x.id === surfaceId);
  if (!s) return "";
  return isAnterior.value ? s.shortAnterior : s.short;
}

function surfaceLabel(surfaceId: string): string {
  const anterior = isAnterior.value;
  const upper = isUpper.value;
  if (surfaceId === "occlusal") return anterior ? "اینیسیزال" : "اکلوزال";
  if (surfaceId === "buccal") return anterior ? "لبیال" : "باکال";
  if (surfaceId === "lingual") return upper ? "پالاتال" : "لینگوال";
  if (surfaceId === "mesial") return "مزیال";
  if (surfaceId === "distal") return "دیستال";
  return surfaceId;
}

// ⭐ سطح‌های پرکرده‌شده از state
const filledSurfaces = computed<Set<string>>(() => {
  const fsm = props.toothState.fillingSurfaceMaterials;
  if (fsm instanceof Map) return new Set(fsm.keys());
  if (fsm && typeof fsm === "object") return new Set(Object.keys(fsm));
  return new Set();
});

// ⭐ جنس فعلی
const fillingMaterial = computed<string>(() => {
  const m = props.toothState.fillingMaterial;
  return typeof m === "string" ? m : "none";
});

// ⭐ toggle سطح
function toggleSurface(surfaceId: string) {
  const material = fillingMaterial.value;

  if (material === "none") {
    alert("ابتدا نوع پرکردگی را انتخاب کنید");
    return;
  }

  // ⭐ همه‌ی سطوح جدید را جمع کن
  const currentSurfaces = new Set(filledSurfaces.value);
  if (currentSurfaces.has(surfaceId)) {
    currentSurfaces.delete(surfaceId);
  } else {
    currentSurfaces.add(surfaceId);
  }

  // ⭐ همه‌ی سطوح را با هم بفرست
  const surfacesArray = Array.from(currentSurfaces);
  const materialsMap: Record<string, string> = {};
  for (const s of surfacesArray) {
    materialsMap[s] = material;
  }

  for (const toothNo of props.toothNos) {
    submitStatus(props.patientId, toothNo, "filling", "all-surfaces", {
      surfaces: surfacesArray,
      material,
    });
  }
  emit("change");
}

// ⭐ تغییر جنس
function setMaterial(value: string) {
  for (const toothNo of props.toothNos) {
    submitStatus(props.patientId, toothNo, "filling", "fillingMaterial", value);
  }
  emit("change");
}

// ⭐ شیاربندی
const fissureSealing = computed<boolean>(() => {
  return !!props.toothState.fissureSealing;
});

function toggleFissureSealing() {
  for (const toothNo of props.toothNos) {
    submitStatus(props.patientId, toothNo, "filling", "fissureSealing", !fissureSealing.value);
  }
  emit("change");
}
</script>

<template>
  <div class="filling-panel" dir="rtl">
    <!-- نوع پرکردگی -->
    <div class="filling-material-row">
      <span class="label">نوع پرکردگی:</span>
      <select
        class="material-select"
        :value="fillingMaterial"
        @change="setMaterial(($event.target as HTMLSelectElement).value)"
      >
        <option value="none">بدون پرکردگی</option>
        <option value="composite">پرکردگی کامپوزیت</option>
        <option value="amalgam">پرکردگی آمالگام</option>
        <option value="gic">پرکردگی گلاس آینومر</option>
        <option value="temporary">پرکردگی موقت</option>
      </select>
    </div>

    <!-- Surface Cross -->
    <div v-if="fillingMaterial !== 'none'" class="surface-cross-wrapper">
      <div class="surface-cross">
        <button
          v-for="surface in SURFACES"
          :key="surface.id"
          type="button"
          :class="[
            'surface-cell',
            `pos-${surface.pos}`,
            { active: filledSurfaces.has(surface.id) },
          ]"
          @click="toggleSurface(surface.id)"
        >
          <span class="surf-letter">{{ surfaceShort(surface.id) }}</span>
          <span class="surf-name">{{ surfaceLabel(surface.id) }}</span>
        </button>
      </div>
    </div>

    <!-- شیاربندی -->
    <label class="fissure-row">
      <input
        type="checkbox"
        :checked="fissureSealing"
        @change="toggleFissureSealing"
      >
      <span>شیاربندی</span>
    </label>
  </div>
</template>

<style scoped>
.filling-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

/* نوع پرکردگی */
.filling-material-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.filling-material-row .label {
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.material-select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  background: #fff;
  cursor: pointer;
  max-width: 260px;
}

.material-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

/* Surface Cross */
.surface-cross-wrapper {
  display: flex;
  justify-content: center;
  padding: 12px 0;
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
  max-width: 260px;
  width: 100%;
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

/* شیاربندی */
.fissure-row {
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

.fissure-row:hover {
  background: #f0f9ff;
  border-color: #93c5fd;
}

.fissure-row input {
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: #2563eb;
}
</style>