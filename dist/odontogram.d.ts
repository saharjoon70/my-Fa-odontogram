import { NumberingSystem } from './utils/numbering';
import { OdontogramPlugin } from './plugin';
import { FhirExportOptions } from './fhir/types';
export declare function isAnteriorTooth(toothNo: number): boolean;
export declare function isUpperTooth(toothNo: number): boolean;
type Any = any;
export declare function setIcdasEnabled(value: boolean): void;
export declare function getIcdasEnabled(): boolean;
export declare function setPulpDetailLevel(value: PulpDetailLevel): void;
export declare function getPulpDetailLevel(): PulpDetailLevel;
export type ToothDetailLevel = "simple" | "complex";
export declare function setWearDetailLevel(value: ToothDetailLevel): void;
export declare function getWearDetailLevel(): ToothDetailLevel;
export declare function setDiscolorationDetailLevel(value: ToothDetailLevel): void;
export declare function getDiscolorationDetailLevel(): ToothDetailLevel;
export type SurfaceNotation = "simple" | "full";
export declare function setSurfaceNotation(value: SurfaceNotation): void;
export declare function getSurfaceNotation(): SurfaceNotation;
export type SecondaryCariesMode = "simple" | "standard" | "full";
export type RootCariesMode = "simple" | "severity";
export type RadiographicDepthMode = "off" | "threeLevel" | "detailed";
export declare function setSecondaryCariesMode(value: SecondaryCariesMode): void;
export declare function getSecondaryCariesMode(): SecondaryCariesMode;
export declare function setRootCariesMode(value: RootCariesMode): void;
export declare function getRootCariesMode(): RootCariesMode;
export declare function setRadiographicDepthMode(value: RadiographicDepthMode): void;
export declare function getRadiographicDepthMode(): RadiographicDepthMode;
export declare function setCariesDepthEnabled(value: boolean): void;
export declare function getCariesDepthEnabled(): boolean;
/**
 * Subscribe to odontogram state changes. The callback runs after any tooth
 * state edit, the edentulous toggle, or an import.
 *
 * @param cb - Callback invoked on each change.
 * @returns An unsubscribe function.
 */
export declare function onStateChange(cb: () => void): () => void;
/**
 * Render surface toggles in an anatomical cross/plus layout:
 * buccal (top), mesial (left), occlusal (center), distal (right), lingual (bottom).
 * Each item: { value, labelKey?, label?, letter, pos }. `pos` is one of
 * buccal|mesial|occlusal|distal|lingual and drives grid placement via a CSS class.
 * Keeps a hidden checkbox input (value=item.value) so existing state-sync works.
 */
export declare function buildSurfaceCross(container: Any, items: Any, onToggle: Any): void;
/** TEST-ONLY: apply {@link syncInflammationModVisibility} to a hand-built
 *  `#modsChecks` DOM fragment, without requiring a live initOdontogram(). Not
 *  part of the public API. */
export declare function __syncInflammationModVisibilityForTest(container: Element, toothSelection: string): void;
/** TEST-ONLY: apply {@link syncPeriImplantVisibility} to hand-built DOM
 *  fragments, without requiring a live initOdontogram(). Not part of the
 *  public API. */
export declare function __syncPeriImplantVisibilityForTest(periImplantRow: Element | null, modsContainer: Element | null, toothSelection: string): void;
export declare function __restorationRowHiddenForTest(s: Record<string, unknown>): boolean;
/** TEST-ONLY: apply a combined restoration-dropdown value to a state object,
 *  exactly as the #restorationSelect change handler does. Not part of the public API. */
export declare function __applyRestorationSelectionForTest(s: Record<string, unknown>, value: string): void;
export declare function __mobilityRowHiddenForTest(s: Record<string, unknown>): boolean;
export declare function __mobilityDisabledForTest(s: Record<string, unknown>): boolean;
export declare function icdasTier(code: number): 1 | 2 | 3;
export declare function threeLevelToIcdas(level: string): number;
export declare function icdasToThreeLevel(code: number): string;
/** CARS-score options for the per-surface secondary-caries picker at a given
 *  granularity mode (defaults to the module setting). simple -> [0,3];
 *  standard -> [0,1,3,6]; full -> [0..6]. Score 0 clears the surface. Pure. */
export declare function secondaryCariesOptions(mode?: SecondaryCariesMode): {
    value: number;
    label: string;
}[];
/** Root-caries options at a given mode (defaults to the module setting).
 *  simple -> none / present (present writes the canonical "active-cavitated"
 *  enum — SP6 Task 3: the most-severe value, so simple-mode "present" renders
 *  at full opacity); severity -> the full rootCaries enum. Pure. */
export declare function rootCariesOptions(mode?: RootCariesMode): {
    value: string;
    label: string;
}[];
/** The rootCaries option value to SHOW for a stored value at a given mode
 *  (display-only collapse; never mutates state). simple buckets every non-none
 *  severity into the single "present" (=active-cavitated) option — matching the
 *  canonical value rootCariesOptions("simple") now writes (SP6 Task 3) — so the
 *  select's selected option always matches one of its own values; severity
 *  shows it verbatim. Mirrors pulpDisplayValue. */
export declare function rootCariesDisplayValue(mode: RootCariesMode, stored: string): string;
/** Radiographic-depth options at a given mode (defaults to the module setting).
 *  off -> [] (the control is hidden); threeLevel -> none + superficial/middle/
 *  deep buckets (writing the representative E1/D1/D3 codes); detailed -> the
 *  full none/E1/E2/D1/D2/D3 scale. "none" clears the surface. Pure. */
export declare function radiographicDepthOptions(mode?: RadiographicDepthMode): {
    value: string;
    label: string;
}[];
/** Set/clear a per-surface CARS secondary-caries score on `map` (score 0
 *  clears). Extracted so the surface-write path is unit-testable without the
 *  DOM. */
export declare function applySecondaryCariesScore(map: Map<string, number>, surface: string, score: number): void;
/** SP6 Task 2: the recurrent (secondary) caries transition on a FILLED surface.
 *  The CARS group of the contextual popup drives the caries state-machine on a
 *  surface that carries a filling:
 *   - score 0 (Sound)  → remove the caries from the surface (revert to a plain
 *     filling) and clear its severity;
 *   - score > 0        → add the caries to the surface (becomes recurrent /
 *     `subcaries-{surface}`) and store the CARS value as its severity.
 *  Guarded on the filling actually being present, so a CARS score never lands
 *  on a surface without a filling (that would be primary caries, authored via
 *  the depth group instead). Mutates `state.caries` (Set of `caries-{surface}`)
 *  and `state.cariesSeverity` (Map surface→0..6). Extracted so the two
 *  transitions are unit-testable without the DOM. */
export declare function applyRecurrentCariesScore(state: {
    caries: Set<string>;
    cariesSeverity: Map<string, number>;
    fillingSurfaceMaterials: Map<string, string>;
}, surface: string, score: number): void;
/** Set/clear a per-surface radiographic-depth value on `map` ("none"/empty
 *  clears). Extracted for unit-testing the surface-write path. */
export declare function applyRadiographicDepth(map: Map<string, string>, surface: string, value: string): void;
/** Set/clear a per-surface filling-defect value on `map` ("none"/empty clears).
 *  Extracted for unit-testing the surface-write path. */
export declare function applyFillingDefect(map: Map<string, string>, surface: string, value: string): void;
export type PulpDetailLevel = "simple" | "aae" | "latin";
export declare const PULP_LATIN_PARENT: Record<string, string>;
/** Option {value,labelKey} list for the pulp control at a given detail level.
 *  simple -> 2 (healthy / pulpitis); aae -> the 4 pulpDx values; latin -> the 9
 *  pulpLatin subtypes. The "latin" branch consults `ClinicalAxis.flag`
 *  (`isAxisFlagSatisfied` — the first consumer of the registry feature-flag
 *  gate). Pure; reads no module state. */
export declare function pulpSelectOptionValues(level: PulpDetailLevel): {
    value: string;
    labelKey: string;
}[];
/** Maps a pulp-control selection to the {pulpDx,pulpLatin} it writes. At "latin"
 *  the selected Latin value sets `pulpLatin` and its parent `pulpDx`; at
 *  "simple"/"aae" the value is a `pulpDx` and `pulpLatin` is cleared to "none". */
/** SP7: the periapical lesion subtype (granuloma / cyst) is a refinement of
 *  apical periodontitis, so its row (#periapicalTypeRow) shows only when the
 *  apical diagnosis is symptomatic or asymptomatic apical periodontitis. Other
 *  apicalDx values (abscess forms, condensing osteitis, normal) carry no
 *  granuloma/cyst refinement. Non-present teeth keep apicalDx="normal" (their
 *  glyph is driven by mods.inflammation in the render, unchanged) so the row is
 *  hidden for them — subtype authoring on implant/missing is deferred to the
 *  peri-implantitis sub-project. */
export declare function periapicalRowVisible(state: Any): boolean;
export declare function pulpSelectionToState(level: PulpDetailLevel, value: string): {
    pulpDx: string;
    pulpLatin: string;
};
/** The option value to SHOW for a stored state at a given level (display-only
 *  collapse; never mutates state). latin -> stored pulpLatin (or a representative
 *  for pulpDx when only pulpDx is set); aae -> pulpDx; simple -> healthy vs. the
 *  single pulpitis bucket. */
export declare function pulpDisplayValue(level: PulpDetailLevel, state: {
    pulpDx?: string;
    pulpLatin?: string;
}): string;
export declare function isEndoValue(value: string): boolean;
export declare function pulpEndoDisplayValue(state: Any): string;
export declare function buildPulpEndoSelect(sel: Any, isMilktooth: boolean, selected: string): void;
export declare function pulpEndoOnSelect(s: Any, value: string): void;
export declare function __wearRowAllowedForTest(s: Record<string, unknown>): boolean;
export declare function __discolorationAllowedForTest(s: Record<string, unknown>): boolean;
export declare function __discolorationRowAllowedForTest(s: Record<string, unknown>): boolean;
export declare function __orthoAllowedForTest(s: Record<string, unknown>): boolean;
export declare function __orthoCardAllowedForTest(s: Record<string, unknown>): boolean;
/** TEST-ONLY: apply a #periImplantSelect value to a state object, exactly as
 *  the change handler does. Not part of the public API. */
export declare function __applyPeriImplantSelectionForTest(s: Record<string, unknown>, value: string): void;
/** TEST-ONLY: render `serialized` state onto a fresh copy of `rawSvgText` and return the
 *  in-document-order active-layer fingerprint (id + opacity + class per element). Used by
 *  the SP2 parity harness; not part of the public API. */
export declare function __renderActiveLayers(rawSvgText: string, toothNo: number, serialized: Record<string, unknown>): {
    id: string;
    opacity: string;
    cls: string;
}[];
/** TEST-ONLY: parse `rawSvgText` once (same prep `__renderActiveLayers` does —
 *  strip display:none to data-active, seed missing data-active defaults) and
 *  return the live parsed element. Pair with `__renderActiveLayersOnNode` to
 *  render multiple states onto the SAME node, reproducing how the live app
 *  reuses one persistent SVG DOM node per tooth across renders (unlike
 *  `__renderActiveLayers`, which re-parses a fresh node every call and so
 *  cannot catch a render that fails to reset state a prior render left
 *  behind). Not part of the public API. */
export declare function __parseSvgForTest(rawSvgText: string): Any;
/** TEST-ONLY: hydrate `serialized` and render it onto an already-parsed `svg`
 *  node (as returned by `__parseSvgForTest`), reusing that SAME node — see
 *  `__parseSvgForTest` for why this matters. Returns the in-document-order
 *  active-layer fingerprint, same shape as `__renderActiveLayers`. Not part
 *  of the public API. */
export declare function __renderActiveLayersOnNode(svg: Any, toothNo: number, serialized: Record<string, unknown>): {
    id: string;
    opacity: string;
    cls: string;
}[];
/** TEST-ONLY: hydrate `raw` and store it as `toothNo`'s state directly in the
 *  module-level state map, bypassing all DOM/UI wiring (no initOdontogram()
 *  required). Lets summary/warning getters be exercised without a live SVG grid.
 *  Not part of the public API. */
export declare function __setToothStateForTest(toothNo: number, raw: Record<string, unknown>, version?: string): void;
/** TEST-ONLY: read back a tooth's current state as a plain object (Sets/Maps
 *  converted to arrays/objects for easy assertions). Not part of the public API. */
export declare function __getToothStateForTest(toothNo: number): Record<string, unknown> | undefined;
/** TEST-ONLY: set the module-level `showHealthyPulp` flag directly, without the
 *  DOM/all-teeth side effects `setHealthyPulpVisible` performs (button toggle
 *  state, re-rendering every tooth in `ALL_TEETH`) — needed so `__renderActiveLayers`
 *  callers can exercise both the "healthy pulp shown" and "hidden" render paths
 *  in isolation. Not part of the public API. */
export declare function __setShowHealthyPulpForTest(on: boolean): void;
/** TEST-ONLY: run the clinical-consistency warning checks against a plain state
 *  object (no DOM/SVG involved). Not part of the public API. */
export declare function __getStateWarnings(state: Any): string[];
/** TEST-ONLY: apply `syncSurfaceDepthIndicator`'s per-surface indicator-attribute
 *  logic (ICDAS `data-depth`/`data-icdas` badge + SP5 Task 4 `data-radio`) to a
 *  single hand-built `.surface-cell` element, without requiring a live grid /
 *  `initOdontogram()` (which needs real SVG-asset fetches). Not part of the
 *  public API. */
export declare function __syncSurfaceDepthIndicatorForTest(cell: Element, state: Record<string, unknown>): void;
/** TEST-ONLY sibling of {@link __syncSurfaceDepthIndicatorForTest} for the
 *  filling-surface recurrent-caries indicator. Not part of the public API. */
export declare function __syncFillingSubcariesIndicatorForTest(cell: Element, state: Record<string, unknown>): void;
/** TEST-ONLY sibling of {@link __syncFillingSubcariesIndicatorForTest} for the
 *  filling-defect indicator. Not part of the public API. */
export declare function __syncFillingDefectIndicatorForTest(cell: Element, state: Record<string, unknown>): void;
/** A minimal shape covering what {@link subcariesLettersForTooth} and
 *  {@link computeFillingSubcariesSummaryLine} read from a tooth state. */
type SubcariesStateLike = {
    caries?: Set<string>;
    fillingSurfaceMaterials?: Map<string, string>;
} | undefined | null;
/** SP6 Task 4 (§7): the recurrent ("sub") caries surfaces on ONE tooth — a
 *  surface carries BOTH caries and a filling (`state.caries` has
 *  `caries-{surface}` AND `state.fillingSurfaceMaterials` has `{surface}`).
 *  Returns the surfaces' letters, in the codebase's existing anatomical order
 *  (`SUMMARY_SURFACE_ORDER`: B, M, O, D, L), concatenated with no separator
 *  (e.g. "MOD", "B"); "" when the tooth has no recurrent-caries surface.
 *  On an anterior tooth (§8) the occlusal/incisal surface's letter is "I"
 *  instead of "O" (the stored value is still plain "occlusal"). Pure and
 *  exported for direct unit testing. */
export declare function subcariesLettersForTooth(toothNo: number, state: SubcariesStateLike): string;
/** SP6 Task 4 (§7): the "Fillings and restorative" panel's informational
 *  subcaries-summary line — one entry per SELECTED tooth that has recurrent
 *  caries (see {@link subcariesLettersForTooth}), in `ALL_TEETH` order, styled
 *  "{FDI} ({letters})" and joined with ", ". Uses the singular phrasing
 *  (`filling.subcariesSummarySingle`) for exactly one such tooth, the plural
 *  (`filling.subcariesSummaryMultiple`) for more than one, and returns "" (no
 *  line — purely informational, hidden when empty) when none of the selected
 *  teeth have a recurrent-caries surface.
 *
 *  Pure/testable: takes the selected tooth numbers and a state lookup instead
 *  of reading the module's `selectedTeeth`/`toothState` globals directly. */
export declare function computeFillingSubcariesSummaryLine(selectedToothNos: Iterable<number>, getState: (toothNo: number) => SubcariesStateLike): string;
/** A minimal shape covering what {@link fillingDefectLettersForTooth} and
 *  {@link computeFillingDefectSummaryLine} read from a tooth state. */
type FillingDefectStateLike = {
    fillingDefect?: Map<string, string>;
    fillingSurfaceMaterials?: Map<string, string>;
    restorationType?: string;
} | undefined | null;
/** SP16 Task 1: the filling-defect surfaces on ONE tooth, parallel to
 *  {@link subcariesLettersForTooth} — a surface carries a defect when it is
 *  BOTH present in `fillingSurfaceMaterials` AND has a non-"none"
 *  `fillingDefect` entry, gated the SAME way the existing whole-mouth
 *  filling-defect summary is (`restorationType === "none"`, i.e. defects are
 *  suppressed under a crown/bridge — see the `defects` derivation in
 *  {@link getOdontogramSummary}). Returns the surfaces' letters in
 *  `SUMMARY_SURFACE_ORDER`, concatenated with no separator; "" when the tooth
 *  has no defect surface (or no state). Pure and exported for direct unit
 *  testing. */
export declare function fillingDefectLettersForTooth(toothNo: number, state: FillingDefectStateLike): string;
/** SP16 Task 1: the "Fillings and restorative" panel's informational
 *  filling-defect-summary line, parallel to {@link computeFillingSubcariesSummaryLine}
 *  — one entry per SELECTED tooth that has a filling-defect surface (see
 *  {@link fillingDefectLettersForTooth}), in `ALL_TEETH` order, styled
 *  "{FDI} ({letters})" and joined with ", ". Uses the singular phrasing
 *  (`filling.fillingDefectSummarySingle`) for exactly one such tooth, the
 *  plural (`filling.fillingDefectSummaryMultiple`) for more than one, and
 *  returns "" (no line — purely informational, hidden when empty) when none
 *  of the selected teeth have a defect surface.
 *
 *  Pure/testable: takes the selected tooth numbers and a state lookup instead
 *  of reading the module's `selectedTeeth`/`toothState` globals directly. */
export declare function computeFillingDefectSummaryLine(selectedToothNos: Iterable<number>, getState: (toothNo: number) => FillingDefectStateLike): string;
/** TEST-ONLY: apply {@link syncToothDetailControls} to a hand-built DOM
 *  fragment (the wear/discoloration select+toggle labels and checkboxes),
 *  without requiring a live initOdontogram(). Mirrors
 *  __syncInflammationModVisibilityForTest. Not part of the public API. */
export declare function __syncToothDetailControlsForTest(state: Record<string, unknown>): void;
/** Popup to author a single caries surface on the selected teeth. Beyond the
 *  original visual caries-depth (ICDAS/3-level) picker it now offers, in the
 *  SAME anchored popup (SP5 Task 5): a per-surface secondary-caries CARS-score
 *  picker and — only when `radiographicDepthMode !== "off"` — a per-surface
 *  radiographic-depth picker. Each group's option list follows its granularity
 *  mode; the depth group itself is hidden when `cariesDepthEnabled` is off. */
/** SP16 Task 2: resolves the DISPLAY LETTER for a caries/filling surface,
 *  respecting the `surfaceNotation` setting ("full", default) and — in full
 *  mode — the tooth's arch (upper/lower) and anterior/posterior position.
 *
 *  FULL: occlusal -> "I" (incisal) on an anterior tooth, else "O" (occlusal);
 *  buccal -> "L" (labial) on an anterior tooth, else "B" (buccal); lingual ->
 *  "P" (palatal) on an upper tooth, else "L" (lingual) — on a LOWER ANTERIOR
 *  tooth this means BOTH buccal(labial) and lingual(lingual) letter as "L"
 *  (ratified: position in the surface-cross and the caption disambiguate; a
 *  "(L, L)"-style summary is inherently ambiguous, which is accepted).
 *  mesial -> "M", distal -> "D", subcrown -> "SC" always.
 *
 *  SIMPLE: always the tooth-independent B/M/O/D/L/SC set, regardless of
 *  position. Exported so both {@link summarySurfaceLetter} and the live
 *  surface-cross UI (buildSurfaceCross/refreshCheckLabels) share one source
 *  of truth. */
export declare function surfaceLetter(surface: string, toothNo?: number | null): string;
/** Maps a caries surface identifier to its existing i18n surface-label key,
 *  so the popup header can read e.g. "Caries details – Buccal". Falls back to
 *  the raw surface string for any (unexpected) unmapped value.
 *
 *  SP6 Task 4 (§8): when `toothNo` is given and is an anterior tooth
 *  (incisor/canine), the "occlusal" surface DISPLAYS as "incisal"
 *  (`surface.incisal`) instead of `surface.occlusal` — the stored surface
 *  value is unaffected, this only changes which i18n key the label resolves
 *  to.
 *
 *  SP16 Task 2: extended to be arch/anterior-aware for ALL of
 *  occlusal/buccal/lingual, gated on the `surfaceNotation` setting. In
 *  "full" mode (default): occlusal -> incisal (anterior), buccal -> labial
 *  (anterior), lingual -> palatal (upper) / lingual (lower, a NEW key
 *  separate from the combined `surface.lingualPalatal`). In "simple" mode
 *  the generic, tooth-independent keys are always used
 *  (buccal/occlusal/lingualPalatal). Exported so it can be unit-tested
 *  directly. */
export declare function surfaceLabelKey(surface: string, toothNo?: number | null): string;
/** Toggle visibility of wisdom teeth (18, 28, 38, 48). */
declare function setWisdomVisible(on: Any): void;
/** Toggle visibility of the bone/gum base layer on all teeth. */
declare function setShowBase(on: Any): void;
/** Toggle visibility of occlusal-view tiles (premolars and molars). */
declare function setOcclusalVisible(on: Any): void;
/** Toggle visibility of the healthy-pulp layer on all teeth. */
declare function setHealthyPulpVisible(on: Any): void;
export declare const VALID_TOOTH_SELECTION: Set<string>;
export declare const VALID_ENDO: Set<string>;
export declare const VALID_FILLING_MATERIAL: Set<string>;
export declare const VALID_PROSTHESIS: Set<string>;
export declare const VALID_MOBILITY: Set<string>;
export declare const VALID_TOOTH_SUBSTRATE: Set<string>;
export declare const VALID_RESTORATION_TYPE: Set<string>;
export declare const VALID_RESTORATION_MATERIAL: Set<string>;
export declare const VALID_MODS: Set<string>;
export declare const VALID_PERIAPICAL_TYPE: Set<string>;
export declare const VALID_CARIES: Set<string>;
export declare const VALID_PULP_DX: Set<string>;
export declare const VALID_PULP_LATIN: Set<string>;
export declare const VALID_APICAL_DX: Set<string>;
export declare const VALID_RESORPTION_TYPE: Set<string>;
export declare const VALID_WEAR_EDGE: Set<string>;
export declare const VALID_WEAR_CERVICAL: Set<string>;
export declare const VALID_DISCOLORATION: Set<string>;
export declare const VALID_ORTHO_APPLIANCE: Set<string>;
export declare const VALID_ORTHO_DRIFT: Set<string>;
export declare const VALID_ORTHO_VERTICAL: Set<string>;
export declare const VALID_FILLING_SURFACES: Set<string>;
export declare const VALID_ROOT_CARIES: Set<string>;
export declare const VALID_PERI_IMPLANT: Set<string>;
export declare const VALID_CARS: Set<number>;
export declare const VALID_CARIES_SEVERITY: Set<number>;
export declare const VALID_RADIOGRAPHIC_DEPTH: Set<string>;
export declare const VALID_FILLING_DEFECT: Set<string>;
export declare const VALID_FILLING_DEFECT_SET: Set<string>;
/** TEST-ONLY: collect the full export payload ({version, globals, teeth}) exactly
 *  as exportStatus()/exportFhir() would serialize it. Not part of the public API. */
export declare function __collectExportPayloadForTest(): Any;
/**
 * Prune a cloned SVG subtree to match what is actually visible on screen.
 * Walks the live `original` and its `clone` in parallel and drops clone nodes
 * whose original element is hidden (display:none / visibility:hidden / opacity 0),
 * so the exported SVG reflects the current layer state without needing the
 * engine's CSS rules embedded.
 */
export declare function pruneHiddenClone(original: Element, clone: Element): void;
/**
 * Prefix every id and id-reference inside a cloned subtree so that combining
 * many tiles (cloned from a few shared templates) into one SVG document does
 * not cause id collisions (gradients, clipPaths, etc.).
 */
export declare function namespaceIds(root: Element, prefix: string): void;
/**
 * Serialize the on-screen odontogram tooth grid into a single, self-contained
 * SVG string (vector, no rasterization). Each tooth SVG is placed as a nested
 * `<svg>` at its laid-out position; tooth number labels are emitted as `<text>`.
 * Returns null if the grid is not present.
 */
export declare function buildOdontogramSvg(): {
    xml: string;
    width: number;
    height: number;
} | null;
/** Export the odontogram as a downloadable, scalable SVG file. */
export declare function exportSvg(): Promise<void>;
/**
 * Export the odontogram as PNG or JPG. Renders the serialized SVG via the
 * browser's native rasterizer (Image → canvas) — much faster than the previous
 * html2canvas DOM rasterization, and sharper.
 */
export declare function exportImage(format?: "png" | "jpg"): Promise<void>;
/**
 * Export the current odontogram as an HL7 FHIR R4 collection Bundle (JSON).
 * @param options - Optional subject reference (e.g. "Patient/123"); when
 *   omitted a placeholder Patient is embedded.
 */
export declare function exportFhir(options?: FhirExportOptions): void;
/** Import a FHIR R4 Bundle (object or JSON string) produced by this module. */
export declare function importFhirBundle(input: Any): void;
/** TEST-ONLY: apply a clinical status-extra preset (span/arch-bridge/removable/
 *  bar-denture) directly against the module-level state map. Not part of the
 *  public API. */
export declare function __applyStatusExtraForTest(option: Any): void;
/** Set which parser the next file import uses. Defaults back to "status" after each import. */
export declare function setImportFormat(format: "status" | "fhir"): void;
/**
 * Switch the displayed tooth numbering system and re-render all tooth labels.
 * @param system - The target {@link NumberingSystem}.
 */
export declare function setNumberingSystem(system: NumberingSystem): void;
/**
 * Initialise the odontogram engine: wire up DOM controls, build the SVG tooth
 * grid, and start listening for i18n changes. Safe to call multiple times
 * (subsequent calls are no-ops).
 */
export declare function initOdontogram(): Promise<void>;
/**
 * Tear down the odontogram engine: clear all DOM elements built by the engine,
 * unsubscribe from i18n changes, and reset internal state. After this call,
 * {@link initOdontogram} may be called again to re-initialise.
 */
export declare function destroyOdontogram(): void;
/**
 * Clear the current tooth selection and reset the active tooth. Useful when
 * switching to view or quote-builder mode from the host application.
 */
export declare function clearSelection(): void;
/**
 * Register one or more custom SVG plugins. Plugins can inject visual overlays
 * into the tooth SVG and maintain per-tooth custom state included in export/import.
 *
 * @param plugins - Array of {@link OdontogramPlugin} definitions.
 */
export declare function registerPlugins(plugins: OdontogramPlugin[]): void;
/**
 * Set a plugin's custom state for a specific tooth. Triggers SVG re-render
 * for that tooth and updates the tooltip.
 *
 * @param toothNo - The FDI tooth number (11–48).
 * @param pluginId - The plugin's unique identifier.
 * @param value - The custom state value (any JSON-serializable value, or `undefined` to clear).
 */
export declare function setPluginState(toothNo: number, pluginId: string, value: unknown): void;
/**
 * Get a plugin's custom state for a specific tooth.
 *
 * @param toothNo - The FDI tooth number (11–48).
 * @param pluginId - The plugin's unique identifier.
 * @returns The custom state value, or `undefined` if not set.
 */
export declare function getPluginState(toothNo: number, pluginId: string): unknown;
/**
 * Get a human-readable summary of all active states for a tooth.
 * Useful for building custom tooltip or info-panel UIs.
 *
 * @param toothNo - The FDI tooth number (11–48).
 * @returns Array of localized state description strings.
 */
export declare function getToothStateSummary(toothNo: number): string[];
/** One heading + its per-tooth entries in the tooth-information summary. */
export type OdontogramSummarySection = {
    key: "caries" | "fillings" | "endo" | "diagnoses" | "wear" | "discoloration" | "orthodontics" | "prosthetics";
    heading: string;
    items: string[];
    /** Localized "no such tooth" sentence, shown when `items` is empty. */
    emptyText: string;
};
/** Structured, already-localized textual summary of the whole odontogram. */
export type OdontogramSummary = {
    overview: string;
    permanentList: string | null;
    missingList: string | null;
    sections: OdontogramSummarySection[];
    /** Implants heading + list — only present when at least one implant exists. */
    implants: {
        heading: string;
        text: string;
    } | null;
    periodontalTitle: string;
    periodontalText: string;
};
/**
 * Build a human-readable, localized summary of the current odontogram state:
 * tooth counts, present/missing lists, and caries / fillings / endo /
 * prosthetics / periodontal sections. Numbers respect the active numbering
 * system. Intended for the optional "tooth information" panel; call
 * {@link onStateChange} to refresh it on edits.
 */
export declare function getOdontogramSummary(): OdontogramSummary;
/**
 * Enable or disable read-only mode. When read-only, all click, touch, and
 * keyboard interactions are disabled. The control panel is dimmed and
 * non-interactive. Useful for print/report views.
 *
 * @param value - `true` to enable read-only mode, `false` to disable.
 */
export declare function setReadOnly(value: boolean): void;
/**
 * Get the current read-only mode state.
 */
export declare function getReadOnly(): boolean;
/**
 * Enable or disable per-tooth notes. When enabled, double-clicking a tooth
 * opens a note editor popover, and notes are shown in hover tooltips with
 * a badge indicator.
 *
 * @param value - `true` to enable notes, `false` to disable.
 */
export declare function setNotesEnabled(value: boolean): void;
/**
 * Get the current notes-enabled state.
 */
export declare function getNotesEnabled(): boolean;
export { setOcclusalVisible, setWisdomVisible, setShowBase, setHealthyPulpVisible };
