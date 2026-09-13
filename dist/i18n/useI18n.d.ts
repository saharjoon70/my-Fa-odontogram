import { Ref } from 'vue';
import { Language } from './translations';
/** Parameter map for template placeholders (`{{key}}`). */
type Params = Record<string, string | number>;
/**
 * Resolve a translation key to a localised string.
 */
export declare function t(key: string, langOverride?: Language | Params, params?: Params): string;
/** Get the current global language. */
export declare function getI18nLanguage(): Language;
/** Set the global language and notify all listeners. No-op if the language is unchanged. */
export declare function setI18nLanguage(lang: Language): void;
/**
 * Subscribe to language changes.
 * @returns An unsubscribe function.
 */
export declare function onI18nChange(listener: (lang: Language) => void): () => void;
type UseI18nOptions = {
    language?: Ref<Language | undefined> | Language;
    onLanguageChange?: (lang: Language) => void;
};
/**
 * Vue composable for i18n. Supports both **controlled** mode (parent provides
 * `language` prop) and **standalone** mode (internal state).
 */
export declare function useI18n(options?: UseI18nOptions): {
    lang: import('vue').ComputedRef<Language>;
    setLang: (next: Language) => void;
    t: import('vue').ComputedRef<(key: string, params?: Params) => string>;
};
export {};
