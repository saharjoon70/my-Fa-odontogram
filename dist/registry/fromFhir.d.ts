import { OdontogramExportPayload } from '../fhir/types';
/** Registry-driven inverse of buildFhirBundle. Byte-identical to the legacy parseFhirBundle. */
export declare function parseFhirBundleFromRegistry(bundle: unknown): OdontogramExportPayload;
