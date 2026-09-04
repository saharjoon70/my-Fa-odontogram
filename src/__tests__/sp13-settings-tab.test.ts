import { describe, it, expect, vi, afterEach } from "vitest";
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

function stubSettings(): SettingsState {
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
  };
}

async function mountToothDetailsTab(s: SettingsState) {
  wrapper = mount(SettingsModal, {
    props: { open: true, t, settings: s },
    attachTo: document.body,
  });
  document.getElementById("odon-settings-tab-toothDetails")?.click();
  await nextTick();
}

describe("SP13 Task 3: toothDetails settings tab", () => {
  it("exists in SETTINGS_TABS after the general and panels tabs", () => {
    const generalIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "general");
    const panelsIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "panels");
    const toothDetailsIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "toothDetails");

    expect(generalIdx).toBe(0);
    expect(panelsIdx).toBe(generalIdx + 1);
    expect(toothDetailsIdx).toBeGreaterThan(-1);
    expect(toothDetailsIdx).toBe(panelsIdx + 1);
    expect(SETTINGS_TABS[toothDetailsIdx].titleKey).toBe("settings.tab.toothDetails");
  });

  it("renders three controls bound to wearDetailLevel, discolorationDetailLevel, and surfaceNotation", async () => {
    const s = stubSettings();
    await mountToothDetailsTab(s);

    const selects = Array.from(document.querySelectorAll(".odon-settings-panel select"));
    expect(selects).toHaveLength(3);

    expect(selects[0].getAttribute("aria-label")).toBe("settings.wearDetail.label");
    expect((selects[0] as HTMLSelectElement).value).toBe(s.wearDetailLevel);

    expect(selects[1].getAttribute("aria-label")).toBe("settings.discolorationDetail.label");
    expect((selects[1] as HTMLSelectElement).value).toBe(s.discolorationDetailLevel);

    expect(selects[2].getAttribute("aria-label")).toBe("settings.surfaceNotation.label");
    expect((selects[2] as HTMLSelectElement).value).toBe(s.surfaceNotation);
  });

  it("invoking each control's onChange calls the matching settings handler with the new value", async () => {
    const s = stubSettings();
    await mountToothDetailsTab(s);

    const selects = Array.from(document.querySelectorAll(".odon-settings-panel select")) as HTMLSelectElement[];

    selects[0].value = "simple";
    selects[0].dispatchEvent(new Event("change", { bubbles: true }));
    expect(s.onWearDetailLevel).toHaveBeenCalledTimes(1);
    expect(s.onWearDetailLevel).toHaveBeenCalledWith("simple");
    expect(s.onDiscolorationDetailLevel).not.toHaveBeenCalled();

    selects[1].value = "simple";
    selects[1].dispatchEvent(new Event("change", { bubbles: true }));
    expect(s.onDiscolorationDetailLevel).toHaveBeenCalledTimes(1);
    expect(s.onDiscolorationDetailLevel).toHaveBeenCalledWith("simple");

    selects[2].value = "simple";
    selects[2].dispatchEvent(new Event("change", { bubbles: true }));
    expect(s.onSurfaceNotation).toHaveBeenCalledTimes(1);
    expect(s.onSurfaceNotation).toHaveBeenCalledWith("simple");
  });
});
