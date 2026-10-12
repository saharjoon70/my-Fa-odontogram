<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import {
  buildOdontogramSvgString,
  onStateChange,
  getSelectedTeeth,
  setSelectedTeeth,
  getToothState,
  setToothStateAndRender,
} from "../odontogram";
import { getRecordsForPatient } from "./treatmentStore";
import type { TreatmentRecord, DiagnosisRecord } from "./treatmentStore";
import {
  getSessionsForPatient,
  getPlanById,
  getStaffById,
} from "./treatmentPlanStore";
import { derivePatchFromRecords } from "./deriveToothState";

const props = defineProps<{
  open: boolean;
  patientId: string;
  patientName?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

// ═══ State ═══
const filterSessionId = ref<string>("all");
const svgXml = ref<string>("");
const svgWidth = ref(0);
const svgHeight = ref(0);

let unsubState: (() => void) | undefined;

// ═══ Sessions ═══
const sessions = computed(() =>
  getSessionsForPatient(props.patientId).sort(
    (a, b) => a.sessionNumber - b.sessionNumber,
  ),
);

// ═══ History items ═══
interface HistoryItem {
  id: string;
  label: string;
  toothNo: number;
  sessionId?: string;
  sessionNumber?: number;
  sessionTitle?: string;
  sessionDate: string;
  sessionTime?: string;
  doctorName: string;
  assistantName: string;
  note: string;
  kind: "treatment" | "diagnosis";
  surface?: string;
  material?: string;
}

const filteredItems = computed<HistoryItem[]>(() => {
  const all = getRecordsForPatient(props.patientId).filter(
    (r) => r.kind === "treatment" || r.kind === "diagnosis",
  ) as (TreatmentRecord | DiagnosisRecord)[];

  const filtered =
    filterSessionId.value === "all"
      ? all
      : all.filter(
          (r) => (r as TreatmentRecord).sessionId === filterSessionId.value,
        );

  const items: HistoryItem[] = filtered.map((r) => {
    const rec = r as TreatmentRecord;
    const sess = rec.sessionId
      ? sessions.value.find((s) => s.id === rec.sessionId)
      : undefined;
    return {
      id: r.id,
      label:
        r.kind === "treatment"
          ? r.treatmentLabel
          : r.planLabel ?? r.clinicalDx ?? "تشخیص",
      toothNo: r.toothNo,
      sessionId: rec.sessionId,
      sessionNumber: sess?.sessionNumber,
      sessionTitle: sess?.title,
      sessionDate: rec.sessionDate || r.date,
      sessionTime: rec.sessionTime || rec.time,
      doctorName: rec.doctorId
        ? getStaffById(rec.doctorId)?.name ?? "—"
        : "—",
      assistantName: rec.assistantId
        ? getStaffById(rec.assistantId)?.name ?? "—"
        : "—",
      note: r.note || "",
      kind: r.kind as "treatment" | "diagnosis",
      surface: rec.surface,
      material: rec.material,
    };
  });

  return items.sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
});

// ═══ Grouped by session ═══
interface SessionGroup {
  key: string;
  sessionId?: string;
  sessionTitle: string;
  sessionDate: string;
  sessionTime?: string;
  planTitle?: string;
  items: HistoryItem[];
}

const groupedItems = computed<SessionGroup[]>(() => {
  const groups = new Map<string, SessionGroup>();

  for (const item of filteredItems.value) {
    const key = item.sessionId ?? "no-session";
    if (!groups.has(key)) {
      const sess = item.sessionId
        ? sessions.value.find((s) => s.id === item.sessionId)
        : undefined;
      const planTitle = sess?.planId
        ? getPlanById(sess.planId)?.title
        : undefined;

      groups.set(key, {
        key,
        sessionId: item.sessionId,
        sessionTitle:
          item.sessionTitle ||
          (item.sessionNumber ? `جلسه ${item.sessionNumber}` : "بدون جلسه"),
        sessionDate: item.sessionDate,
        sessionTime: item.sessionTime,
        planTitle,
        items: [],
      });
    }
    groups.get(key)!.items.push(item);
  }

  return Array.from(groups.values()).sort((a, b) =>
    b.sessionDate.localeCompare(a.sessionDate),
  );
});

// ═══ Summary ═══
const totalTreatments = computed(
  () => filteredItems.value.filter((i) => i.kind === "treatment").length,
);
const uniqueTeeth = computed(
  () => new Set(filteredItems.value.map((i) => i.toothNo)).size,
);

// ═══ SVG Builder ═══
const ALL_TEETH_NUMBERS = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];

function waitFrames(n = 3): Promise<void> {
  return new Promise((resolve) => {
    let count = 0;
    function step() {
      count++;
      if (count >= n) resolve();
      else requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

async function buildPreview() {
  try {
    // ─── حالت ۱: همه جلسات ───
    if (filterSessionId.value === "all") {
      await waitFrames(2);
      const built = buildOdontogramSvgString();
      if (!built) {
        svgXml.value = "";
        return;
      }
      svgXml.value = built.xml;
      svgWidth.value = built.width;
      svgHeight.value = built.height;
      return;
    }

    // ─── حالت ۲: یک جلسه‌ی خاص ───
    // 1. ذخیره‌ی state فعلی
    const savedSelectedTeeth = getSelectedTeeth();
    const savedState = new Map<number, any>();
    for (const t of ALL_TEETH_NUMBERS) {
      savedState.set(t, getToothState(t));
    }

    try {
      // 2. رکوردهای همان جلسه
      const sessionRecords = getRecordsForPatient(props.patientId).filter(
        (r) =>
          (r.kind === "treatment" || r.kind === "diagnosis") &&
          (r as TreatmentRecord).sessionId === filterSessionId.value,
      );

      // 3. ریست همه‌ی دندان‌ها + اعمال فقط رکوردهای این جلسه
      for (const t of ALL_TEETH_NUMBERS) {
        const toothRecords = sessionRecords.filter((r) => r.toothNo === t);
        if (toothRecords.length > 0) {
          const patch = derivePatchFromRecords(toothRecords);
          setToothStateAndRender(t, patch);
        } else {
          setToothStateAndRender(t, {
            toothSelection: "tooth-base",
            toothSubstrate: "natural",
            restorationType: "none",
            restorationMaterial: "none",
          });
        }
      }

      // 4. صبر برای re-render کامل
      await waitFrames(4);

      // 5. SVG بساز
      const built = buildOdontogramSvgString();
      if (built) {
        svgXml.value = built.xml;
        svgWidth.value = built.width;
        svgHeight.value = built.height;
      } else {
        svgXml.value = "";
      }
    } finally {
      // 6. برگرداندن state قبلی (حتماً اجرا شود)
      for (const t of ALL_TEETH_NUMBERS) {
        const s = savedState.get(t);
        if (s) {
          setToothStateAndRender(t, s);
        }
      }
      setSelectedTeeth(savedSelectedTeeth);

      // 7. صبر برای re-render برگشت
      await waitFrames(2);
    }
  } catch (e) {
    console.error("Failed to build SVG preview", e);
    svgXml.value = "";
  }
}

// ═══ Watches ═══
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      filterSessionId.value = "all";
      buildPreview();
      unsubState = onStateChange(() => {
        if (props.open && filterSessionId.value === "all") {
          buildPreview();
        }
      });
    } else {
      unsubState?.();
      unsubState = undefined;
    }
  },
  { immediate: true },
);

// ⭐ وقتی فیلتر جلسه عوض شد، preview را دوباره بساز
watch(filterSessionId, () => {
  if (props.open) {
    buildPreview();
  }
});

onUnmounted(() => {
  unsubState?.();
});

// ═══ Print ═══
function printHistory() {
  const w = window.open("", "_blank");
  if (!w) {
    alert("پاپ‌آپ را فعال کنید");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>پیشینه درمانی — ${props.patientName || "بیمار"}</title>
      <style>
        body { font-family: Tahoma, sans-serif; padding: 20px; color: #111; }
        h1 { font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
        h2 { font-size: 13px; color: #333; margin-top: 18px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        .meta { font-size: 11px; color: #666; margin-bottom: 10px; }
        .preview { width: 100%; max-width: 900px; margin: 10px auto; border: 1px solid #ddd; border-radius: 6px; padding: 8px; background: #fafafa; overflow: hidden; }
        .preview svg { width: 100%; height: auto; display: block; }
        .session-block { margin-top: 14px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; page-break-inside: avoid; }
        .session-header { font-weight: bold; font-size: 12px; color: #1e40af; margin-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 6px; }
        th, td { border: 1px solid #ddd; padding: 5px; text-align: right; }
        th { background: #f3f4f6; color: #374151; }
        .note { font-size: 9.5px; color: #6b7280; font-style: italic; }
        .footer { margin-top: 20px; text-align: center; font-size: 9.5px; color: #999; }
      </style>
    </head>
    <body>
      <h1>📜 پیشینه درمانی — ${props.patientName || "بیمار"}</h1>
      <div class="meta">
        تاریخ چاپ: ${new Date().toLocaleDateString("fa-IR")} —
        تعداد جلسات: ${groupedItems.value.length} —
        تعداد درمان‌ها: ${totalTreatments.value}
      </div>

      ${
        svgXml.value
          ? `<div class="preview">${svgXml.value}</div>`
          : ""
      }

      ${groupedItems.value
        .map(
          (g) => `
        <div class="session-block">
          <div class="session-header">
            📅 ${g.sessionTitle}
            ${g.planTitle ? ` — 📋 ${g.planTitle}` : ""}
            — ${formatDate(g.sessionDate)}
            ${g.sessionTime ? ` — ⏰ ${g.sessionTime}` : ""}
          </div>
          <table>
            <thead>
              <tr>
                <th>دندان</th>
                <th>درمان</th>
                <th>سطح</th>
                <th>جنس</th>
                <th>دکتر</th>
                <th>دستیار</th>
                <th>یادداشت</th>
              </tr>
            </thead>
            <tbody>
              ${g.items
                .map(
                  (i) => `
                <tr>
                  <td>#${i.toothNo}</td>
                  <td>${i.label}</td>
                  <td>${i.surface || "—"}</td>
                  <td>${i.material || "—"}</td>
                  <td>${i.doctorName}</td>
                  <td>${i.assistantName}</td>
                  <td class="note">${i.note || "—"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `,
        )
        .join("")}

      <div class="footer">تولید شده توسط سیستم دندانپزشکی</div>
    </body>
    </html>
  `;

  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 300);
}

// ═══ Download PNG ═══
async function downloadPng() {
  if (!svgXml.value) {
    alert("نمایی برای دانلود موجود نیست");
    return;
  }
  try {
    const scale = 2;
    const svgUrl =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgXml.value);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("SVG load failed"));
      img.src = svgUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = svgWidth.value * scale;
    canvas.height = svgHeight.value * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `patient-history-${props.patientId}-${new Date()
      .toISOString()
      .slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (e) {
    console.error("PNG download failed", e);
    alert("خطا در دانلود تصویر");
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR");
  } catch {
    return iso;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="history-backdrop"
      @mousedown.self="emit('close')"
    >
      <div
        class="history-modal"
        dir="rtl"
      >
        <!-- Header -->
        <div class="modal-header">
          <div>
            <h2>📜 پیشینه درمانی</h2>
            <div class="subtitle">
              {{ patientName || "بیمار" }}
              <span class="meta">
                — {{ groupedItems.length }} جلسه — {{ totalTreatments }} درمان
              </span>
            </div>
          </div>
          <div class="header-actions">
            <button
              class="btn-print"
              @click="printHistory"
            >
              🖨 چاپ
            </button>
            <button
              class="btn-download"
              @click="downloadPng"
            >
              📥 دانلود تصویر
            </button>
            <button
              class="close-btn"
              title="بستن"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-bar">
          <span class="filter-label">🔍 فیلتر جلسه:</span>
          <select
            v-model="filterSessionId"
            class="filter-select"
          >
            <option value="all">
              همه جلسات ({{ sessions.length }})
            </option>
            <option
              v-for="s in sessions"
              :key="s.id"
              :value="s.id"
            >
              {{ s.title || `جلسه ${s.sessionNumber}` }} — {{ formatDate(s.sessionDate) }}
            </option>
          </select>
          <span class="filter-stats">
            {{ filteredItems.length }} مورد — {{ uniqueTeeth }} دندان
          </span>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Preview -->
          <div class="preview-section">
            <div class="section-title">🦷 نمای بصری</div>
            <div
              v-if="svgXml"
              class="preview-container"
              v-html="svgXml"
            ></div>
            <div
              v-else
              class="preview-empty"
            >
              (در حال آماده‌سازی...)
            </div>
          </div>

          <!-- Details -->
          <div class="details-section">
            <div class="section-title">
              📋 جزئیات درمان‌ها ({{ filteredItems.length }})
            </div>

            <div
              v-if="groupedItems.length === 0"
              class="empty-state"
            >
              هنوز درمانی ثبت نشده
            </div>

            <div
              v-for="group in groupedItems"
              :key="group.key"
              class="session-block"
            >
              <div class="session-header">
                <span class="session-title-text">
                  📅 {{ group.sessionTitle }}
                  <span
                    v-if="group.planTitle"
                    class="plan-badge"
                  >
                    📋 {{ group.planTitle }}
                  </span>
                </span>
                <span class="session-meta">
                  {{ formatDate(group.sessionDate) }}
                  <span v-if="group.sessionTime"> — ⏰ {{ group.sessionTime }}</span>
                </span>
              </div>

              <table class="history-table">
                <thead>
                  <tr>
                    <th>دندان</th>
                    <th>درمان</th>
                    <th>سطح</th>
                    <th>جنس</th>
                    <th>دکتر</th>
                    <th>دستیار</th>
                    <th>یادداشت</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in group.items"
                    :key="item.id"
                  >
                    <td class="tooth-cell">#{{ item.toothNo }}</td>
                    <td>{{ item.label }}</td>
                    <td>{{ item.surface || "—" }}</td>
                    <td>{{ item.material || "—" }}</td>
                    <td>{{ item.doctorName }}</td>
                    <td>{{ item.assistantName }}</td>
                    <td class="note-cell">{{ item.note || "—" }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.history-backdrop {
  position: fixed;
  inset: 0;
  z-index: 250;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fade-in 0.15s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.history-modal {
  width: min(1200px, 98vw);
  height: min(95vh, 900px);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  background: #f9fafb;
  flex-wrap: wrap;
}

.modal-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.meta {
  color: #2563eb;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.btn-print,
.btn-download {
  padding: 7px 14px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-print {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.btn-print:hover {
  background: #dbeafe;
}

.btn-download {
  background: #f0fdf4;
  color: #065f46;
  border: 1px solid #bbf7d0;
}

.btn-download:hover {
  background: #dcfce7;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.filters-bar {
  padding: 10px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  background: #fff;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.filter-select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  background: #fff;
  min-width: 240px;
  cursor: pointer;
}

.filter-stats {
  margin-right: auto;
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #fafbfc;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
}

.preview-container {
  width: 100%;
  overflow: auto;
  border-radius: 8px;
  background: #f9fafb;
  padding: 8px;
}

.preview-container :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
}

.preview-empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px;
  font-size: 12px;
}

.details-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  background: #fff;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
}

.session-block {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.session-header {
  padding: 10px 14px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.session-title-text {
  font-size: 13px;
  font-weight: 700;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.plan-badge {
  font-size: 10px;
  padding: 2px 8px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 10px;
  font-weight: 600;
}

.session-meta {
  font-size: 11px;
  color: #6b7280;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
}

.history-table th {
  background: #f9fafb;
  color: #6b7280;
  font-weight: 600;
  padding: 8px 10px;
  text-align: right;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.history-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.history-table tr:last-child td {
  border-bottom: none;
}

.history-table tr:hover td {
  background: #f9fafb;
}

.tooth-cell {
  font-weight: 700;
  color: #2563eb;
  white-space: nowrap;
}

.note-cell {
  font-size: 11px;
  color: #6b7280;
  font-style: italic;
  max-width: 200px;
}

@media (max-width: 768px) {
  .history-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  .header-actions {
    flex-wrap: wrap;
  }
  .history-table {
    font-size: 10.5px;
  }
  .history-table th,
  .history-table td {
    padding: 6px;
  }
}
</style>