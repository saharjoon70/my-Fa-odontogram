import { OdontogramExportPayload } from './types';
/**
 * Invert buildFhirBundle: parse a FHIR R4 collection Bundle produced by this
 * module back into the {version, globals, teeth} payload importStatus expects.
 * Only LOCAL_SYSTEM codings are trusted (round-trip). Tolerant of bad input.
 */
export declare function parseFhirBundle(bundle: unknown): OdontogramExportPayload;
