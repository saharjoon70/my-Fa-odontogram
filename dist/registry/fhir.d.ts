import { Bundle, OdontogramExportPayload, FhirExportOptions } from '../fhir/types';
/** Registry-driven FHIR bundle build. Byte-identical to the legacy buildFhirBundle. */
export declare function buildFhirBundleFromRegistry(payload: OdontogramExportPayload, options?: FhirExportOptions): Bundle;
