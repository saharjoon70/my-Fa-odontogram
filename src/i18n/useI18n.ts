import { computed, ref, watch, type Ref } from "vue";
import { translations, type Language } from "./translations";

const FALLBACK_LANGUAGE: Language = "en";
let currentLanguage: Language = "en";
const listeners = new Set<(lang: Language) => void>();

/** Parameter map for template placeholders (`{{key}}`). */
type Params = Record<string, string | number>;

/**
 * Resolve a translation key to a localised string.
 */
export function t(key: string, langOverride?: Language | Params, params?: Params): string {
  const resolvedParams = typeof langOverride === "object" ? langOverride : params;
  const lang = typeof langOverride === "string" ? langOverride : currentLanguage;
  const table = translations[lang] ?? translations[FALLBACK_LANGUAGE];
  const fallback = translations[FALLBACK_LANGUAGE];
  const raw = table[key] ?? fallback[key] ?? key;
  if (!resolvedParams) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, token) => String(resolvedParams[token] ?? ""));
}

/** Get the current global language. */
export function getI18nLanguage(): Language {
  return currentLanguage;
}

/** Set the global language and notify all listeners. No-op if the language is unchanged. */
export function setI18nLanguage(lang: Language): void {
  if (lang === currentLanguage) return;
  currentLanguage = lang;
  document.documentElement.lang = lang === "pt-br" ? "pt-BR" : lang;
  document.documentElement.dir = lang === "ar" || lang === "fa"? "rtl" : "ltr";
  for (const listener of listeners) {
    listener(lang);
  }
}

/**
 * Subscribe to language changes.
 * @returns An unsubscribe function.
 */
export function onI18nChange(listener: (lang: Language) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

type UseI18nOptions = {
  language?: Ref<Language | undefined> | Language;
  onLanguageChange?: (lang: Language) => void;
};

/**
 * Vue composable for i18n. Supports both **controlled** mode (parent provides
 * `language` prop) and **standalone** mode (internal state).
 */
export function useI18n(options: UseI18nOptions = {}) {
  const { onLanguageChange } = options;
  const languageProp = options.language;
  const internalLang = ref<Language>(
    typeof languageProp === "string" ? languageProp : languageProp?.value ?? getI18nLanguage(),
  );

  const lang = computed(() => {
    if (typeof languageProp === "string") return languageProp;
    if (languageProp?.value !== undefined) return languageProp.value;
    return internalLang.value;
  });

  watch(
    lang,
    (next) => {
      setI18nLanguage(next);
    },
    { immediate: true },
  );

  if (languageProp && typeof languageProp !== "string") {
    watch(languageProp, (next) => {
      if (next !== undefined) internalLang.value = next;
    });
  }

  const setLang = (next: Language) => {
    if (typeof languageProp === "string" || languageProp?.value !== undefined) {
      onLanguageChange?.(next);
      return;
    }
    internalLang.value = next;
    onLanguageChange?.(next);
  };

  const translate = computed(() => {
    return (key: string, params?: Params) => t(key, lang.value, params);
  });

  return { lang, setLang, t: translate };
}
