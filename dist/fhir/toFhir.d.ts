import { Bundle, OdontogramExportPayload, FhirExportOptions } from './types';
/**
 * Convert a serialized odontogram payload into a FHIR R4 collection Bundle.
 * Pure: no DOM, no network. Tolerant of malformed input (never throws).
 */
export declare function buildFhirBundle(payload: OdontogramExportPayload, options?: FhirExportOptions): Bundle;
