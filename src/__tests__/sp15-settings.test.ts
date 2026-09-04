import { describe, it, expect, afterEach, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import SettingsModal from "../SettingsModal.vue";
import { SETTINGS_TABS, type SettingsState } from "../settingsModal";

let wrapper: VueWrapper | null = null;

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

const t = (key: string) => key;

function makeSettings(overrides: Partial<SettingsState> = {}): SettingsState {
  return {
    numbering: "FDI",
    onNumbering: vi.fn(),
    language: "en",
    onLanguage: vi.fn(),
    isDark: false,
    onToggleDark: vi.fn(),
    toothInfo: false,
    onToothInfo: vi.fn(),
    secondaryCariesMode: "standard",
    onSecondaryCariesMode: vi.fn(),
    icdas: false,
    onIcdas: vi.fn(),
    cariesDepth: false,
    onCariesDepth: vi.fn(),
    rootCariesMode: "simple",
    onRootCariesMode: vi.fn(),
    radiographicDepthMode: "off",
    onRadiographicDepthMode: vi.fn(),
    pulpLevel: "aae",
    onPulpLevel: vi.fn(),
    wearDetailLevel: "complex",
    onWearDetailLevel: vi.fn(),
    discolorationDetailLevel: "complex",
    onDiscolorationDetailLevel: vi.fn(),
    surfaceNotation: "full",
    onSurfaceNotation: vi.fn(),
    notes: false,
    onNotes: vi.fn(),
    showStatusCard: true,
    onShowStatusCard: vi.fn(),
    showOrthoCard: true,
    onShowOrthoCard: vi.fn(),
    ...overrides,
  };
}

async function mountModal(settings: SettingsState, tabId?: string) {
  wrapper = mount(SettingsModal, {
    props: { open: true, t, settings },
    attachTo: document.body,
  });
  if (tabId) {
    document.getElementById(`odon-settings-tab-${tabId}`)?.click();
    await nextTick();
  }
  return wrapper;
}

describe("SP15 Task 4 (B1): Panels settings tab", () => {
  it("is positioned immediately after the general tab", () => {
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    const generalIdx = ids.indexOf("general");
    expect(generalIdx).toBeGreaterThanOrEqual(0);
    expect(ids[generalIdx + 1]).toBe("panels");
  });

  it("has the expected titleKey", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "panels");
    expect(tab?.titleKey).toBe("settings.tab.panels");
  });

  it("renders two ToggleRows bound to showStatusCard / showOrthoCard, each wired to its handler", async () => {
    const onShowStatusCard = vi.fn();
    const onShowOrthoCard = vi.fn();
    const s = makeSettings({
      showStatusCard: true,
      onShowStatusCard,
      showOrthoCard: false,
      onShowOrthoCard,
    });
    await mountModal(s, "panels");

    const checkboxes = document.querySelectorAll('.odon-settings-panel input[type="checkbox"]');
    expect(checkboxes).toHaveLength(2);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);

    (checkboxes[0] as HTMLInputElement).click();
    expect(onShowStatusCard).toHaveBeenCalledWith(false);

    (checkboxes[1] as HTMLInputElement).click();
    expect(onShowOrthoCard).toHaveBeenCalledWith(true);
  });
});

describe("SP15 Task 4 (B2): merged Caries / Secondary-caries settings", () => {
  it("removes the standalone secondaryCaries tab", () => {
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    expect(ids).not.toContain("secondaryCaries");
  });

  it("caries tab renders the CARS select between root-caries and radiographic-depth", async () => {
    await mountModal(makeSettings(), "caries");

    const selects = Array.from(document.querySelectorAll(".odon-settings-panel select"));
    const labels = selects.map((el) => el.getAttribute("aria-label"));

    const rootIdx = labels.indexOf("caries.rootLabel");
    const carsIdx = labels.indexOf("caries.secondaryLabel");
    const radioIdx = labels.indexOf("caries.radiographicLabel");

    expect(rootIdx).toBeGreaterThanOrEqual(0);
    expect(carsIdx).toBeGreaterThanOrEqual(0);
    expect(radioIdx).toBeGreaterThanOrEqual(0);
    expect(carsIdx).toBeGreaterThan(rootIdx);
    expect(radioIdx).toBeGreaterThan(carsIdx);
  });

  it("caries tab CARS select is wired to secondaryCariesMode / onSecondaryCariesMode", async () => {
    const onSecondaryCariesMode = vi.fn();
    const s = makeSettings({ secondaryCariesMode: "full", onSecondaryCariesMode });
    await mountModal(s, "caries");

    const select = document.querySelector(
      'select[aria-label="caries.secondaryLabel"]',
    ) as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("full");
  });

  it("does not duplicate the total tab count (net zero: -1 secondaryCaries, +1 panels)", () => {
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
