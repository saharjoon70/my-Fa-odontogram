/**
 * Supported tooth numbering systems.
 * - **FDI** – ISO 3950 two-digit notation (default in most countries).
 * - **UNIVERSAL** – ADA numbering (1-32 adult, A-T primary).
 * - **PALMER** – Quadrant-based notation (UR/UL/LL/LR + position).
 */
export type NumberingSystem = "FDI" | "UNIVERSAL" | "PALMER";
/**
 * Convert an FDI tooth number to the label for the requested numbering system.
 *
 * @param fdiTooth - Tooth number in FDI notation (e.g. `14`, `55`). Accepts a string that can be parsed as a number.
 * @param system - The target numbering system (`"FDI"`, `"UNIVERSAL"`, or `"PALMER"`).
 * @returns The formatted label (e.g. `"5"` for Universal, `"UR-4"` for Palmer). Returns the input as-is when it cannot be mapped.
 *
 * @example
 * ```ts
 * toLabel(14, "FDI");       // "14"
 * toLabel(14, "UNIVERSAL"); // "5"
 * toLabel(14, "PALMER");    // "UR-4"
 * toLabel(55, "UNIVERSAL"); // "A"
 * ```
 */
export declare function toLabel(fdiTooth: number | string, system: NumberingSystem): string;
