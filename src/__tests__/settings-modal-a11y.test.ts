import { describe, it, expect, afterEach, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import SettingsModal from "../SettingsModal.vue";
import type { SettingsState } from "../settingsModal";

let wrapper: VueWrapper | null = null;

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

const t = (key: string) => key;

const settings: SettingsState = {
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

const renderModal = () => {
  wrapper = mount(SettingsModal, {
    props: { open: true, onClose: vi.fn(), t, settings },
    attachTo: document.body,
  });
};

const tabs = () => Array.from(document.querySelectorAll('[role="tab"]'));
const tablist = () => document.querySelector(".odon-settings-tabs") as HTMLElement;
const selectedTab = () => tabs().find((el) => el.getAttribute("aria-selected") === "true");

describe("FIX 2: SettingsModal tablist keyboard navigation", () => {
  it("ArrowRight moves and activates the next tab (wrapping at the end)", async () => {
    renderModal();
    await nextTick();
    const all = tabs();
    expect(selectedTab()).toBe(all[0]);

    tablist().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await nextTick();
    expect(selectedTab()).toBe(all[1]);
    expect(document.activeElement).toBe(all[1]);

    tablist().dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    await nextTick();
    expect(selectedTab()).toBe(all[all.length - 1]);
    tablist().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await nextTick();
    expect(selectedTab()).toBe(all[0]);
  });

  it("ArrowLeft wraps from the first tab to the last", async () => {
    renderModal();
    await nextTick();
    const all = tabs();
    tablist().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    await nextTick();
    expect(selectedTab()).toBe(all[all.length - 1]);
    expect(document.activeElement).toBe(all[all.length - 1]);
  });

  it("Home selects the first tab and End the last", async () => {
    renderModal();
    await nextTick();
    const all = tabs();
    tablist().dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    await nextTick();
    expect(selectedTab()).toBe(all[all.length - 1]);
    tablist().dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    await nextTick();
    expect(selectedTab()).toBe(all[0]);
    expect(document.activeElement).toBe(all[0]);
  });

  it("keeps the roving tabindex: exactly one tab has tabIndex 0 after navigation", async () => {
    renderModal();
    await nextTick();
    tablist().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await nextTick();
    const zero = tabs().filter((el) => el.getAttribute("tabindex") === "0");
    expect(zero).toHaveLength(1);
    expect(zero[0]).toBe(selectedTab());
  });
});
