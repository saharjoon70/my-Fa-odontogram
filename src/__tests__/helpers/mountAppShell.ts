import { mount, type VueWrapper } from "@vue/test-utils";
import type { ComponentPublicInstance } from "vue";
import App from "../../App.vue";

let activeWrapper: VueWrapper<ComponentPublicInstance> | null = null;

export function mountAppShell(props: Record<string, unknown> = {}) {
  activeWrapper?.unmount();
  activeWrapper = mount(App, { props, attachTo: document.body });
  return activeWrapper;
}

export function unmountAppShell() {
  activeWrapper?.unmount();
  activeWrapper = null;
}
