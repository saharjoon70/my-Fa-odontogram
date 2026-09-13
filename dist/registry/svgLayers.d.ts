/** Non-axis layers the render clears (base/pulp/milktooth/bruxism/crown-branch intermediates/etc.).
 *  Transcribed verbatim from odontogram.ts applyStateToSvgSingle's clear block (:742-787).
 *  Also includes "implant" and "milktooth": those two ids are NOT cleared by the :742-787
 *  block itself (they are activation-toggled right after it, at :763-764 via
 *  setActive("implant", isImplant) / setActive("milktooth", isMilktooth)), but
 *  axisClearLayers() below derives them from AXES (toothSelection.svgLayer) since they
 *  are legitimate switchable SVG layers. Clearing them here is byte-identical to today's
 *  render because :763-764 immediately re-sets them to the correct value right after —
 *  setActive() is a pure, idempotent attribute write. They are listed explicitly here so
 *  allClearLayers() equals this list as a set (see the set-equality test). */
export declare const FIXED_CLEAR_LAYERS: string[];
export declare function axisClearLayers(): string[];
/** The full set of layers the render turns off before applying active state. */
export declare function allClearLayers(): string[];
