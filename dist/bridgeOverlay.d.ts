/**
 * Multi-tooth bridge-span OVERLAY subsystem.
 *
 * Bridges are rendered PER-TOOTH by the core engine: each bridge tooth draws its
 * own `{material}-bridge-connector` saddle inside its own tile SVG. Because the
 * tiles sit in a CSS grid with a real, variable gap between them, a bridge that
 * spans several teeth shows visible breaks in the saddle at every inter-tile gap.
 *
 * This module derives the multi-tooth spans from tooth state and draws a single
 * engine-owned overlay `<svg>` over `#toothGrid` that fills those gaps with a
 * gum-line saddle bar, so a run of bridge teeth reads as one continuous bridge.
 *
 * The overlay is purely presentational: it reads DOM geometry + tooth state and
 * introduces no new tooth-state field. The same bar geometry is reused by the
 * SVG/PNG/JPG export path so the exported image includes the span bars too.
 *
 * Standalone-library rule: no DentalQuoteCreator-specific dependencies.
 */
/** Minimal shape of tooth state this module reads. */
export interface BridgeToothState {
    restorationType?: string;
    restorationMaterial?: string;
    bridgePillar?: boolean;
}
/** Reads a tooth's current state by FDI tooth number. May return undefined. */
export type GetToothState = (toothNo: number) => BridgeToothState | undefined | null;
/** Maps a restoration material key to a solid CSS color for the saddle bar. */
export type MaterialColor = (material: string) => string;
/** Vertical center of the saddle bar, as a fraction of tile height (gum line),
 *  for an UPPER-arch tile. */
export declare const SADDLE_Y_FRACTION = 0.72;
/**
 * Vertical center of the saddle bar for a LOWER-arch tile. Lower-arch tiles
 * are rendered rotated 180°, so the naive mirror (`1 - SADDLE_Y_FRACTION` =
 * 0.28) did not match the connector artwork. Recon measured the connector art
 * at ~0.81 from the tile top in the un-rotated template, which lands at
 * ~0.19 after the 180° lower-arch rotation. This is a visual estimate and may
 * need one more nudge.
 */
export declare const SADDLE_Y_FRACTION_LOWER = 0.19;
/** Thickness of the saddle bar, as a fraction of tile height. */
export declare const SADDLE_THICKNESS = 0.09;
/** How far the bar overlaps into each adjacent tile, as a fraction of tile width. */
export declare const SADDLE_OVERLAP = 0.12;
/** Default color resolver used when no `materialColor` dependency is provided. */
export declare function defaultMaterialColor(material: string): string;
/**
 * Derive multi-tooth bridge spans from tooth state.
 *
 * A span is a maximal run of consecutive teeth WITHIN a single arch where each
 * tooth is a bridge tooth (`restorationType === "bridge"` OR `bridgePillar`).
 * Only runs of length >= 2 are returned (an isolated bridge tooth is not a span).
 *
 * Documented limitation: two distinct bridges that happen to sit on adjacent
 * teeth (e.g. 13-14 and 15-16 with a shared-looking gum line) are merged into a
 * single run, because state carries no per-bridge grouping id. This matches the
 * per-tooth rendering, which likewise cannot tell them apart.
 *
 * @param getState - Reads a tooth's state by FDI number.
 * @returns Arrays of consecutive tooth numbers, each of length >= 2.
 */
export declare function detectBridgeSpans(getState: GetToothState): number[][];
/** A tile's box in grid-relative coordinates (x = left - gridLeft, etc.). */
export interface GridRelativeRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
/** Resolves a tooth's tile box in grid-relative coordinates, or null if hidden. */
export type RectFor = (toothNo: number) => GridRelativeRect | null;
/** A single saddle bar to draw, in grid-relative coordinates. */
export interface BridgeBar {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
}
/**
 * Compute the saddle bars that fill the inter-tile gaps of every span. This is
 * the single source of truth for bar geometry, shared by the live overlay and
 * the export pass.
 *
 * Guards: any pair whose tile rect is missing or zero-sized (occlusal view,
 * collapsed arch) is skipped rather than throwing. A pair whose computed width
 * is non-positive (overlapping tiles) is also skipped.
 *
 * @param spans - Output of {@link detectBridgeSpans}.
 * @param getState - Reads a tooth's state by FDI number (for material color).
 * @param rectFor - Resolves each tooth's grid-relative tile box.
 * @param materialColor - Resolves a material key to a solid color.
 */
export declare function computeBridgeBars(spans: number[][], getState: GetToothState, rectFor: RectFor, materialColor: MaterialColor): BridgeBar[];
/** Dependencies for {@link renderBridgeOverlay}. */
export interface RenderBridgeOverlayDeps {
    /** The `#toothGrid` element (host of the overlay). */
    grid: HTMLElement | null;
    /** Reads a tooth's state by FDI number. */
    getState: GetToothState;
    /** Optional material -> color resolver; defaults to {@link defaultMaterialColor}. */
    materialColor?: MaterialColor;
}
/** The class marking the single engine-owned overlay SVG. */
export declare const BRIDGE_OVERLAY_CLASS = "bridge-overlay";
/** The class marking each saddle bar rect (live + export). */
export declare const BRIDGE_BAR_CLASS = "bridge-overlay-bar";
/**
 * Resolve a tooth's side-view tile box in grid-relative coordinates, or null if
 * the tile is absent or hidden (zero-sized). Shared by the live overlay and the
 * export pass so both read geometry identically.
 *
 * @param grid - The `#toothGrid` element.
 * @param gridRect - The grid's own `getBoundingClientRect()` (origin).
 * @param toothNo - FDI tooth number.
 */
export declare function tileRectFor(grid: HTMLElement, gridRect: {
    left: number;
    top: number;
}, toothNo: number): GridRelativeRect | null;
/**
 * Ensure a single `<svg class="bridge-overlay">` child of the grid and (re)draw
 * the bridge-span saddle bars into it. Idempotent: clears and redraws on every
 * call. No-op (never throws) when the grid is absent or there are no spans.
 *
 * The overlay is positioned by CSS (`position:absolute; inset:0`); its intrinsic
 * size/viewBox is synced to the grid box so bar coordinates map 1:1 to pixels.
 */
export declare function renderBridgeOverlay(deps: RenderBridgeOverlayDeps): void;
/**
 * Build a saddle-bar `<rect>` SVG element in the current document. Shared by the
 * live overlay and the export path so the two draw identical geometry.
 */
export declare function barRect(bar: BridgeBar): SVGRectElement;
