/**
 * Canonical system URLs and coding maps for the FHIR export.
 *
 * - Local codes mirror the engine's own enum values and are ALWAYS emitted,
 *   guaranteeing round-trip fidelity even where no standard code exists. The
 *   local system is currently the ONLY coding emitted for clinical states.
 * - SNOMED CT is not yet active: `SNOMED_CODES` is currently empty and no
 *   `CodeEntry` sets `snomed`, so no SNOMED coding is emitted. When populated
 *   (with codes verified against the official SNOMED CT browser), entries are
 *   emitted as additional codings in the export; they are additive, never required.
 */
/** Local CodeSystem canonical URL (engine-owned codes). */
export declare const LOCAL_SYSTEM = "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram";
/** ISO 3950 / FDI tooth designation system. */
export declare const FDI_SYSTEM = "urn:iso:std:iso:3950";
/** SNOMED CT system URL. */
export declare const SNOMED_SYSTEM = "http://snomed.info/sct";
/**
 * ICDAS II (International Caries Detection and Assessment System) reference URL.
 * Documentation constant: per-surface caries codes (1–6) are emitted as the
 * caries component's `valueInteger`; this URL identifies the scoring system.
 */
export declare const ICDAS_SYSTEM = "https://www.icdas.org";
/** A single coded value: required local code, optional verified SNOMED code. */
export interface CodeEntry {
    code: string;
    display: string;
    snomed?: string;
}
/**
 * Local value maps, keyed by enum group then by enum value.
 * `display` strings are English (the export is language-neutral data).
 */
export declare const LOCAL_VALUE_MAPS: Record<string, Record<string, CodeEntry>>;
/**
 * Verified SNOMED CT codes, keyed by "<group>:<value>".
 * CURRENTLY EMPTY — so no SNOMED coding is emitted by the export; the local
 * system is the only coding produced for clinical states. When entries are
 * added here (codes verified against the official SNOMED CT browser), they are
 * emitted as additional codings in the export. The mapper works with or without
 * entries — they are purely additive.
 */
export declare const SNOMED_CODES: Record<string, string>;
