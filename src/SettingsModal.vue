<script setup lang="ts">
import { ref, watch, onUnmounted, useId, nextTick } from "vue";
import {
  SETTINGS_TABS,
  NUMBERING_OPTIONS,
  LANGUAGE_OPTIONS,
  SECONDARY_OPTIONS,
  ROOT_OPTIONS,
  RADIOGRAPHIC_OPTIONS,
  PULP_OPTIONS,
  TOOTH_DETAIL_OPTIONS,
  SURFACE_NOTATION_OPTIONS,
  type SettingsState,
  type TFn,
} from "./settingsModal";

const props = defineProps<{
  open: boolean;
  t: TFn;
  settings: SettingsState;
}>();

const emit = defineEmits<{
  close: [];
}>();

const activeTab = ref<string>(SETTINGS_TABS[0].id);
const dialogRef = ref<HTMLDivElement | null>(null);
const tablistRef = ref<HTMLDivElement | null>(null);
const openerRef = ref<HTMLElement | null>(null);
const titleId = useId();

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    openerRef.value = (document.activeElement as HTMLElement | null) ?? null;
    await nextTick();
    const dialog = dialogRef.value;
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialog)?.focus();
  },
);

onUnmounted(() => {
  openerRef.value?.focus?.();
});

function onClose() {
  emit("close");
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    e.stopPropagation();
    onClose();
    return;
  }
  if (e.key !== "Tab") return;
  const dialog = dialogRef.value;
  if (!dialog) return;
  const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
  if (items.length === 0) return;
  const firstEl = items[0];
  const lastEl = items[items.length - 1];
  const active = document.activeElement as HTMLElement | null;
  if (e.shiftKey && active === firstEl) {
    e.preventDefault();
    lastEl.focus();
  } else if (!e.shiftKey && active === lastEl) {
    e.preventDefault();
    firstEl.focus();
  }
}

function onTabListKeyDown(e: KeyboardEvent) {
  const nav = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"];
  if (!nav.includes(e.key)) return;
  e.preventDefault();
  const count = SETTINGS_TABS.length;
  if (count === 0) return;
  const cur = SETTINGS_TABS.findIndex((tab) => tab.id === activeTab.value);
  const idx = cur < 0 ? 0 : cur;
  let next = idx;
  if (e.key === "Home") next = 0;
  else if (e.key === "End") next = count - 1;
  else if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % count;
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + count) % count;
  const nextTab = SETTINGS_TABS[next];
  if (!nextTab) return;
  if (nextTab.id !== activeTab.value) activeTab.value = nextTab.id;
  tablistRef.value
    ?.querySelector<HTMLElement>(`#odon-settings-tab-${nextTab.id}`)
    ?.focus();
}

function onBackdropMouseDown(e: MouseEvent) {
  if (e.target === e.currentTarget) onClose();
}

const s = () => props.settings;
const t = (key: string, params?: Record<string, string | number>) => props.t(key, params);

function onSelectChange(handler: (value: string) => void, event: Event) {
  handler((event.target as HTMLSelectElement).value);
}

function onCheckboxChange(handler: (value: boolean) => void, event: Event) {
  handler((event.target as HTMLInputElement).checked);
}
</script>

<template>
  <div
    v-if="open"
    class="odon-settings-backdrop"
    @mousedown="onBackdropMouseDown"
  >
    <div
      ref="dialogRef"
      class="odon-settings-modal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
      @keydown="onKeyDown"
    >
      <div class="odon-settings-header">
        <h2 :id="titleId" class="odon-settings-title">
          {{ t('settings.title') }}
        </h2>
        <button
          type="button"
          class="odon-settings-close"
          :aria-label="t('settings.close')"
          :title="t('settings.close')"
          @click="onClose"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="odon-settings-body">
        <div
          ref="tablistRef"
          class="odon-settings-tabs"
          role="tablist"
          :aria-label="t('settings.title')"
          @keydown="onTabListKeyDown"
        >
          <button
            v-for="tab in SETTINGS_TABS"
            :id="`odon-settings-tab-${tab.id}`"
            :key="tab.id"
            type="button"
            role="tab"
            :aria-selected="tab.id === activeTab"
            :aria-controls="`odon-settings-panel-${tab.id}`"
            :tabindex="tab.id === activeTab ? 0 : -1"
            :class="['odon-settings-tab', tab.id === activeTab ? 'is-active' : '']"
            @click="activeTab = tab.id"
          >
            {{ t(tab.titleKey) }}
          </button>
        </div>
        <div
          class="odon-settings-panel"
          role="tabpanel"
          :id="`odon-settings-panel-${activeTab}`"
          :aria-labelledby="`odon-settings-tab-${activeTab}`"
        >
          <template v-if="activeTab === 'general'">
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('numbering.label') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.numbering.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <select
                  class="odon-settings-select"
                  :aria-label="t('numbering.label')"
                  :value="s().numbering"
                  @change="onSelectChange(s().onNumbering, $event)"
                >
                  <option v-for="opt in NUMBERING_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ t(opt.labelKey) }}
                  </option>
                </select>
              </div>
            </div>
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('language.label') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.language.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <select
                  class="odon-settings-select"
                  :aria-label="t('language.label')"
                  :value="s().language"
                  @change="onSelectChange(s().onLanguage, $event)"
                >
                  <option v-for="opt in LANGUAGE_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ t(opt.labelKey) }}
                  </option>
                </select>
              </div>
            </div>
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('settings.theme.label') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.theme.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <label class="odon-settings-switch">
                  <input
                    type="checkbox"
                    :aria-label="t('settings.theme.label')"
                    :checked="s().isDark"
                    @change="s().onToggleDark()"
                  />
                  <span class="odon-settings-switch-track" aria-hidden="true" />
                </label>
              </div>
            </div>
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('settings.toothInfo') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.toothInfo.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <label class="odon-settings-switch">
                  <input
                    type="checkbox"
                    :aria-label="t('settings.toothInfo')"
                    :checked="s().toothInfo"
                    @change="onCheckboxChange(s().onToothInfo, $event)"
                  />
                  <span class="odon-settings-switch-track" aria-hidden="true" />
                </label>
              </div>
            </div>
            <div class="odon-settings-row odon-settings-row-disabled" aria-disabled="true">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">
                  {{ t('settings.exportImport.title') }}
                  <span class="odon-settings-badge">{{ t('settings.comingSoon') }}</span>
                </div>
                <div class="odon-settings-row-desc">{{ t('settings.exportImport.desc') }}</div>
              </div>
            </div>
          </template>

          <template v-else-if="activeTab === 'panels'">
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('settings.panels.statuses') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.panels.statuses.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <label class="odon-settings-switch">
                  <input
                    type="checkbox"
                    :aria-label="t('settings.panels.statuses')"
                    :checked="s().showStatusCard"
                    @change="onCheckboxChange(s().onShowStatusCard, $event)"
                  />
                  <span class="odon-settings-switch-track" aria-hidden="true" />
                </label>
              </div>
            </div>
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('settings.panels.orthodontics') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.panels.orthodontics.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <label class="odon-settings-switch">
                  <input
                    type="checkbox"
                    :aria-label="t('settings.panels.orthodontics')"
                    :checked="s().showOrthoCard"
                    @change="onCheckboxChange(s().onShowOrthoCard, $event)"
                  />
                  <span class="odon-settings-switch-track" aria-hidden="true" />
                </label>
              </div>
            </div>
          </template>

          <template v-else-if="activeTab === 'toothDetails'">
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('settings.wearDetail.label') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.wearDetail.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <select
                  class="odon-settings-select"
                  :aria-label="t('settings.wearDetail.label')"
                  :value="s().wearDetailLevel"
                  @change="onSelectChange(s().onWearDetailLevel, $event)"
                >
                  <option v-for="opt in TOOTH_DETAIL_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ t(opt.labelKey) }}
                  </option>
                </select>
              </div>
            </div>
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('settings.discolorationDetail.label') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.discolorationDetail.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <select
                  class="odon-settings-select"
                  :aria-label="t('settings.discolorationDetail.label')"
                  :value="s().discolorationDetailLevel"
                  @change="onSelectChange(s().onDiscolorationDetailLevel, $event)"
                >
                  <option v-for="opt in TOOTH_DETAIL_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ t(opt.labelKey) }}
                  </option>
                </select>
              </div>
            </div>
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('settings.surfaceNotation.label') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.surfaceNotation.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <select
                  class="odon-settings-select"
                  :aria-label="t('settings.surfaceNotation.label')"
                  :value="s().surfaceNotation"
                  @change="onSelectChange(s().onSurfaceNotation, $event)"
                >
                  <option v-for="opt in SURFACE_NOTATION_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ t(opt.labelKey) }}
                  </option>
                </select>
              </div>
            </div>
          </template>

          <template v-else-if="activeTab === 'caries'">
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('icdas.enable') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.icdas.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <label class="odon-settings-switch">
                  <input
                    type="checkbox"
                    :aria-label="t('icdas.enable')"
                    :checked="s().icdas"
                    @change="onCheckboxChange(s().onIcdas, $event)"
                  />
                  <span class="odon-settings-switch-track" aria-hidden="true" />
                </label>
              </div>
            </div>
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('settings.cariesDepth.label') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.cariesDepth.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <label class="odon-settings-switch">
                  <input
                    type="checkbox"
                    :aria-label="t('settings.cariesDepth.label')"
                    :checked="s().cariesDepth"
                    @change="onCheckboxChange(s().onCariesDepth, $event)"
                  />
                  <span class="odon-settings-switch-track" aria-hidden="true" />
                </label>
              </div>
            </div>
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('caries.rootLabel') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.rootCaries.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <select
                  class="odon-settings-select"
                  :aria-label="t('caries.rootLabel')"
                  :value="s().rootCariesMode"
                  @change="onSelectChange(s().onRootCariesMode, $event)"
                >
                  <option v-for="opt in ROOT_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ t(opt.labelKey) }}
                  </option>
                </select>
              </div>
            </div>
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('caries.secondaryLabel') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.secondaryCaries.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <select
                  class="odon-settings-select"
                  :aria-label="t('caries.secondaryLabel')"
                  :value="s().secondaryCariesMode"
                  @change="onSelectChange(s().onSecondaryCariesMode, $event)"
                >
                  <option v-for="opt in SECONDARY_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ t(opt.labelKey) }}
                  </option>
                </select>
              </div>
            </div>
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('caries.radiographicLabel') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.radiographic.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <select
                  class="odon-settings-select"
                  :aria-label="t('caries.radiographicLabel')"
                  :value="s().radiographicDepthMode"
                  @change="onSelectChange(s().onRadiographicDepthMode, $event)"
                >
                  <option v-for="opt in RADIOGRAPHIC_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ t(opt.labelKey) }}
                  </option>
                </select>
              </div>
            </div>
          </template>

          <template v-else-if="activeTab === 'pulpa'">
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('pulp.level.label') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.pulpLevel.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <select
                  class="odon-settings-select"
                  :aria-label="t('pulp.level.label')"
                  :value="s().pulpLevel"
                  @change="onSelectChange(s().onPulpLevel, $event)"
                >
                  <option v-for="opt in PULP_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ t(opt.labelKey) }}
                  </option>
                </select>
              </div>
            </div>
          </template>

          <template v-else-if="activeTab === 'notes'">
            <div class="odon-settings-row">
              <div class="odon-settings-row-text">
                <div class="odon-settings-row-label">{{ t('settings.notes') }}</div>
                <div class="odon-settings-row-desc">{{ t('settings.notes.desc') }}</div>
              </div>
              <div class="odon-settings-row-control">
                <label class="odon-settings-switch">
                  <input
                    type="checkbox"
                    :aria-label="t('settings.notes')"
                    :checked="s().notes"
                    @change="onCheckboxChange(s().onNotes, $event)"
                  />
                  <span class="odon-settings-switch-track" aria-hidden="true" />
                </label>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
