import { Bundle, Observation, Patient, CodeableConcept, Coding } from 'fhir/r4';
export type { Bundle, Observation, Patient, CodeableConcept, Coding };
/** Per-tooth record as produced by the engine's serializeState(). */
export interface ToothRecord {
    toothSelection?: string;
    endoResection?: boolean;
    mods?: string[];
    periapicalType?: string;
    endo?: string;
    caries?: string[];
    cariesActiveDepth?: number;
    cariesSeverity?: Record<string, number>;
    cariesDepths?: Record<string, number>;
    calculus?: boolean;
    fillingMaterial?: string;
    fillingSurfaces?: string[];
    fillingSurfaceMaterials?: Record<string, string>;
    fissureSealing?: boolean;
    contactMesial?: boolean;
    contactDistal?: boolean;
    wearEdge?: string;
    wearCervical?: string;
    discoloration?: string;
    periImplant?: string;
    orthoAppliance?: string;
    orthoDrift?: string;
    orthoVertical?: string;
    orthoRotation?: boolean;
    brokenMesial?: boolean;
    brokenIncisal?: boolean;
    brokenDistal?: boolean;
    extractionWound?: boolean;
    extractionPlan?: boolean;
    parapulpalPin?: boolean;
    crownReplace?: boolean;
    crownNeeded?: boolean;
    missingClosed?: boolean;
    bridgePillar?: boolean;
    prosthesis?: string;
    mobility?: string;
    toothSubstrate?: string;
    restorationType?: string;
    restorationMaterial?: string;
    crownLeakage?: boolean;
    pulpDx?: string;
    pulpLatin?: string;
    apicalDx?: string;
    resorptionType?: string;
    rootCaries?: string;
    secondaryCaries?: Record<string, number>;
    radiographicDepth?: Record<string, string>;
    fillingDefect?: Record<string, string>;
    customStates?: Record<string, unknown>;
    note?: string;
}
/** The serialized odontogram export payload (matches exportStatus()'s object). */
export interface OdontogramExportPayload {
    version: string;
    globals?: Record<string, boolean>;
    teeth: Record<string, ToothRecord>;
}
/** Options for buildFhirBundle / exportFhir. */
export interface FhirExportOptions {
    /**
     * FHIR reference string for the subject, e.g. "Patient/123".
     * When omitted, a placeholder Patient resource is added to the Bundle and
     * referenced by every Observation.
     */
    subject?: string;
}
