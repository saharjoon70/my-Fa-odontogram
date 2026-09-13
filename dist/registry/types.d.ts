/** Registry type definitions for the clinical-axis engine (SP2). Types only. */
export type AxisKind = "enum" | "boolean" | "set" | "surfaceSet" | "restoration" | "derived" | "global";
/** Context for filtering curated UI option lists (`uiOptions` / `optionsFor`). */
export interface UiOptCtx {
    isMilktooth?: boolean;
}
/** A coded concept: local code always present; SNOMED/ICD optional and additive. */
export interface ConceptRef {
    local: string;
    display: string;
    snomed?: string;
    icd?: {
        system: string;
        code: string;
    }[];
}
/** One allowed value of an axis. svgLayer/ui are added in later stages. */
export interface AxisValue {
    id: string;
    coding: ConceptRef;
    labelKey?: string;
    svgLayer?: string | string[];
}
/** Precomputed render context for flag activation (mirrors the render's derived booleans). */
export interface FlagCtx {
    isImplant: boolean;
    isMilktooth: boolean;
    underGum: boolean;
    extraction: boolean;
    isNone: boolean;
    toothPresent: boolean;
    fissureAllowed: boolean;
    contactAllowed: boolean;
    bruxismAllowed: boolean;
    extractionPlanAllowed: boolean;
}
/** One chartable tooth axis. Resolver fields are optional here (filled per stage). */
export interface ClinicalAxis {
    id: string;
    field: string;
    kind: AxisKind;
    finding: ConceptRef;
    valueGroup?: string;
    values?: AxisValue[];
    skipValue?: string;
    surfacesField?: string;
    flag?: string;
    svgLayer?: string;
    appliesWhen?: (ctx: FlagCtx, state: any) => boolean;
    uiOptions?: {
        value: string;
        labelKey: string;
        when?: (ctx: UiOptCtx) => boolean;
    }[];
}
/** Per-tooth rendering context (static tables; populated in later stages). */
export interface ToothContext {
    fdi: number;
    template: 11 | 13 | 14 | 16;
    view: "front" | "occlusal";
    isAnterior: boolean;
    isMolar: boolean;
    mirror: boolean;
    rot: 0 | 180;
    fissureAllowed: boolean;
    milktoothAllowed: boolean;
}
/** Placeholder for the eventual axis-keyed state; SP2 keeps the current container.
 *  Kept as a nominal type so later stages can tighten it. */
export type ToothState = Record<string, unknown>;
