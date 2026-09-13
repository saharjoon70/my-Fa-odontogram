import { UiOptCtx } from './types';
/** Feature-flag state consumed by the registry (extensible key→boolean map). */
export type RegistryFlags = Record<string, boolean>;
/**
 * First consumer of `ClinicalAxis.flag` (SP4 Task 5). An axis with no `flag`
 * is always active; an axis carrying a `flag` is active only when that flag is
 * set in `flags`. Currently gates `pulpLatin` (`flag: "latinPulpDetail"`),
 * which is satisfied iff the pulp-detail setting is "latin". This governs UI
 * authoring only — a stored value still serializes / round-trips regardless.
 */
export declare function isAxisFlagSatisfied(axisId: string, flags?: RegistryFlags): boolean;
/** Ordered {value, labelKey} option list for an axis (curated UI metadata).
 *  Returns `[]` for a flag-gated axis whose flag is unsatisfied. */
export declare function optionsFor(axisId: string, ctx?: UiOptCtx, flags?: RegistryFlags): {
    value: string;
    labelKey: string;
}[];
