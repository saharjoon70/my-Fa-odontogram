export type Language = "hu" | "en" | "de" | "es" | "it" | "sk" | "pl" | "ru" | "pt-br" | "ar" | "fa";
/**
 * Master translation table keyed by {@link Language}.
 * Hungarian (`hu`) is the authoritative source — all other languages must
 * contain exactly the same set of keys.
 *
 * Template placeholders use `{{name}}` syntax and are resolved at runtime
 * by the `t()` function in `useI18n.ts`.
 */
export declare const translations: Record<Language, Record<string, string>>;
