import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mountAppShell, unmountAppShell } from './helpers/mountAppShell';
import { setI18nLanguage } from '../i18n/useI18n';
import {
  setSecondaryCariesMode,
  setIcdasEnabled,
  setPulpDetailLevel,
  setNotesEnabled,
} from '../odontogram';

vi.mock('../odontogram', async () => {
  const { odontogramShellMock } = await import('./helpers/odontogramShellMock');
  return odontogramShellMock;
});

describe('App.vue', () => {
  beforeEach(() => {
    unmountAppShell();
    vi.clearAllMocks();
    setI18nLanguage('en');
    document.documentElement.classList.remove('dark');
  });

  describe('standalone mode (no props)', () => {
    it('renders without crashing', () => {
      mountAppShell();
      const elements = document.body.querySelectorAll('*');
      const hasTitle = Array.from(elements).some((el) => /odontogram/i.test(el.textContent ?? ''));
      expect(hasTitle).toBe(true);
    });

    it('renders the topbar with export/import buttons', () => {
      mountAppShell();
      expect(document.getElementById('btnStatusExport')).toBeTruthy();
      expect(document.getElementById('statusImportInput')).toBeTruthy();
    });

    it('renders the tooth grid container', () => {
      mountAppShell();
      expect(document.getElementById('toothGrid')).toBeTruthy();
    });

    it('renders the panel with control sections', () => {
      mountAppShell();
      expect(document.getElementById('statusCard')).toBeTruthy();
    });

    it('renders the crown-leakage toggle row, hidden by default', () => {
      mountAppShell();
      const row = document.getElementById('crownLeakageRow');
      const checkbox = document.getElementById('crownLeakage');
      expect(row).toBeTruthy();
      expect(checkbox).toBeTruthy();
      expect(checkbox?.getAttribute('type')).toBe('checkbox');
      expect(row?.classList.contains('hidden')).toBe(true);
    });

    it('renders the root-caries picker row inside the caries card', () => {
      mountAppShell();
      expect(document.getElementById('rootCariesRow')).toBeTruthy();
      expect(document.getElementById('rootCariesSelect')?.tagName).toBe('SELECT');
    });

    it('renders chart action buttons', () => {
      mountAppShell();
      expect(document.getElementById('btnOcclView')).toBeTruthy();
      expect(document.getElementById('btnWisdomVisible')).toBeTruthy();
      expect(document.getElementById('btnBoneVisible')).toBeTruthy();
      expect(document.getElementById('btnPulpVisible')).toBeTruthy();
      expect(document.getElementById('btnSelectNoneChart')).toBeTruthy();
    });
  });

  describe('controlled language mode', () => {
    it('uses the provided language', () => {
      mountAppShell({ language: 'en' });
      expect(document.body.textContent).toMatch(/in english/i);
    });

    it('calls onLanguageChange when language is selected', async () => {
      const onLanguageChange = vi.fn();
      mountAppShell({ language: 'en', onLanguageChange });
      const langButton = document.querySelector('button[aria-label="Language"]') as HTMLButtonElement;
      expect(langButton).toBeTruthy();
      langButton.click();
      await nextTick();
      const huOption = Array.from(document.querySelectorAll('[role="menuitemradio"]')).find(
        (el) => /Hungarian/i.test(el.textContent ?? ''),
      );
      expect(huOption).toBeTruthy();
      (huOption as HTMLElement).click();
      expect(onLanguageChange).toHaveBeenCalledWith('hu');
    });
  });

  describe('controlled numbering mode', () => {
    it('uses the provided numbering system', async () => {
      mountAppShell({ language: 'en', numberingSystem: 'UNIVERSAL' });
      (document.querySelector('button[aria-label="Settings"]') as HTMLButtonElement).click();
      await nextTick();
      const select = document.querySelector('.odon-settings-select[aria-label="Numbering"]') as HTMLSelectElement;
      expect(select.value).toBe('UNIVERSAL');
    });

    it('calls onNumberingChange when numbering is selected', async () => {
      const onNumberingChange = vi.fn();
      mountAppShell({ language: 'en', numberingSystem: 'FDI', onNumberingChange });
      (document.querySelector('button[aria-label="Settings"]') as HTMLButtonElement).click();
      await nextTick();
      const select = document.querySelector('.odon-settings-select[aria-label="Numbering"]') as HTMLSelectElement;
      select.value = 'PALMER';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(onNumberingChange).toHaveBeenCalledWith('PALMER');
    });
  });

  describe('settings modal', () => {
    const openModal = async () => {
      (document.querySelector('button[aria-label="Settings"]') as HTMLButtonElement).click();
      await nextTick();
      return document.querySelector('[role="dialog"]') as HTMLElement;
    };

    it('is closed by default and opens from the gear button', async () => {
      mountAppShell({ language: 'en' });
      expect(document.querySelector('[role="dialog"]')).toBeNull();
      const dialog = await openModal();
      expect(dialog).toBeTruthy();
      expect(dialog.getAttribute('aria-modal')).toBe('true');
    });

    it('moves focus into the dialog when opened (focus trap)', async () => {
      mountAppShell({ language: 'en' });
      const dialog = await openModal();
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('closes on Escape', async () => {
      mountAppShell({ language: 'en' });
      const dialog = await openModal();
      dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await nextTick();
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });

    it('closes on backdrop click', async () => {
      mountAppShell({ language: 'en' });
      await openModal();
      const backdrop = document.querySelector('.odon-settings-backdrop') as HTMLElement;
      backdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      await nextTick();
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });

    it('renders every tab and switches between them', async () => {
      mountAppShell({ language: 'en' });
      await openModal();
      const tabNames = ['General', 'Panels', 'Caries', 'Pulp', 'Notes'];
      for (const name of tabNames) {
        const tab = Array.from(document.querySelectorAll('[role="tab"]')).find(
          (el) => new RegExp(name, 'i').test(el.textContent ?? ''),
        ) as HTMLElement;
        tab.click();
        await nextTick();
        expect(tab.getAttribute('aria-selected')).toBe('true');
        expect(document.querySelector('[role="tabpanel"]')).toBeTruthy();
      }
    });

    it('General tab exposes numbering, language and theme controls', async () => {
      mountAppShell({ language: 'en' });
      await openModal();
      expect(document.querySelector('.odon-settings-select[aria-label="Numbering"]')).toBeTruthy();
      expect(document.querySelector('.odon-settings-select[aria-label="Language"]')).toBeTruthy();
      expect(document.querySelector('input[aria-label="Appearance"]')).toBeTruthy();
    });

    it('changing the secondary-caries mode calls setSecondaryCariesMode', async () => {
      mountAppShell({ language: 'en' });
      await openModal();
      const cariesTab = Array.from(document.querySelectorAll('[role="tab"]')).find(
        (el) => /Caries/i.test(el.textContent ?? ''),
      ) as HTMLElement;
      cariesTab.click();
      await nextTick();
      const select = document.querySelector(
        'select[aria-label="Secondary caries (CARS)"]',
      ) as HTMLSelectElement;
      select.value = 'full';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(setSecondaryCariesMode).toHaveBeenCalledWith('full');
    });

    it('toggling ICDAS on the Caries tab calls setIcdasEnabled', async () => {
      mountAppShell({ language: 'en' });
      await openModal();
      const cariesTab = Array.from(document.querySelectorAll('[role="tab"]')).find(
        (el) => /Caries/i.test(el.textContent ?? ''),
      ) as HTMLElement;
      cariesTab.click();
      await nextTick();
      const toggle = document.querySelector('input[aria-label="ICDAS"]') as HTMLInputElement;
      toggle.click();
      expect(setIcdasEnabled).toHaveBeenCalledWith(true);
    });

    it('changing pulp detail level calls setPulpDetailLevel', async () => {
      mountAppShell({ language: 'en' });
      await openModal();
      const pulpTab = Array.from(document.querySelectorAll('[role="tab"]')).find(
        (el) => /Pulp/i.test(el.textContent ?? ''),
      ) as HTMLElement;
      pulpTab.click();
      await nextTick();
      const select = document.querySelector('select[aria-label="Pulp detail level"]') as HTMLSelectElement;
      select.value = 'latin';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      expect(setPulpDetailLevel).toHaveBeenCalledWith('latin');
    });

    it('toggling notes on the Notes tab calls setNotesEnabled', async () => {
      mountAppShell({ language: 'en' });
      await openModal();
      const notesTab = Array.from(document.querySelectorAll('[role="tab"]')).find(
        (el) => /^Notes$/i.test(el.textContent?.trim() ?? ''),
      ) as HTMLElement;
      notesTab.click();
      await nextTick();
      const toggle = document.querySelector('.odon-settings-panel input[aria-label="Notes"]') as HTMLInputElement;
      toggle.click();
      expect(setNotesEnabled).toHaveBeenCalledWith(true);
    });
  });

  describe('dark mode', () => {
    it('calls onDarkModeChange when theme button is clicked (standalone)', async () => {
      const onDarkModeChange = vi.fn();
      mountAppShell({ onDarkModeChange });
      (document.querySelector('button[aria-label="Dark mode"]') as HTMLButtonElement).click();
      await nextTick();
      expect(onDarkModeChange).toHaveBeenCalledWith(true);
    });

    it('calls onDarkModeChange in controlled mode', async () => {
      const onDarkModeChange = vi.fn();
      mountAppShell({ darkMode: false, onDarkModeChange });
      const themeBtn = document.querySelector('button[aria-label="Dark mode"]') as HTMLButtonElement;
      themeBtn.click();
      expect(onDarkModeChange).toHaveBeenCalledWith(true);
    });

    it('respects darkMode prop', () => {
      mountAppShell({ darkMode: true });
      expect(document.querySelector('.btn-theme svg circle')).toBeTruthy();
    });
  });

  describe('selection actions', () => {
    it('renders all selection action buttons', () => {
      mountAppShell();
      expect(document.getElementById('btnSelectAll')).toBeTruthy();
      expect(document.getElementById('btnSelectNone')).toBeTruthy();
      expect(document.getElementById('btnSelectUpper')).toBeTruthy();
      expect(document.getElementById('btnSelectLower')).toBeTruthy();
    });

    it('renders status action buttons', () => {
      mountAppShell();
      expect(document.getElementById('btnResetAll')).toBeTruthy();
      expect(document.getElementById('btnPrimaryDentition')).toBeTruthy();
      expect(document.getElementById('btnMixedDentition')).toBeTruthy();
      expect(document.getElementById('btnEdentulous')).toBeTruthy();
    });
  });

  describe('tooth control sections', () => {
    it('renders tooth select dropdown', () => {
      mountAppShell();
      expect(document.getElementById('toothSelect')).toBeTruthy();
    });

    it('renders restoration + substrate select dropdowns', () => {
      mountAppShell();
      expect(document.getElementById('restorationSelect')).toBeTruthy();
      expect(document.getElementById('substrateSelect')).toBeTruthy();
    });

    it('renders the merged pulp/endo select dropdown, not the old separate ones', () => {
      mountAppShell();
      expect(document.getElementById('pulpEndoSelect')).toBeTruthy();
      expect(document.getElementById('endoSelect')).toBeNull();
      expect(document.getElementById('pulpSelect')).toBeNull();
    });

    it('renders filling select dropdown', () => {
      mountAppShell();
      expect(document.getElementById('fillingSelect')).toBeTruthy();
    });

    it('renders mobility select dropdown', () => {
      mountAppShell();
      expect(document.getElementById('mobilitySelect')).toBeTruthy();
    });
  });
});
