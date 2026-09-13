import { CodeableConcept, Observation, ToothRecord } from './types';
import { CodeEntry } from './codesystems';
export declare const PLACEHOLDER_PATIENT_ID = "odontogram-subject";
export declare const PLACEHOLDER_PATIENT_FULLURL = "urn:uuid:odontogram-subject";
/** Build a CodeableConcept: always a local coding, plus SNOMED when verified. */
export declare function concept(system: string, entry: CodeEntry, snomedKey?: string): CodeableConcept;
/** Decode an enum value via a value-map group, tolerating unknown values. */
export declare function valueConcept(group: string, value: string): CodeableConcept;
/** The Observation.code identifying a finding TYPE (engine-local). */
export declare function findingConcept(code: string, display: string): CodeableConcept;
/** FDI/ISO 3950 tooth bodySite. The internal key is already an FDI number. */
export declare function toothBodySite(fdi: string): CodeableConcept;
export declare const EXAM_CATEGORY: CodeableConcept[];
export declare const baseObservation: (subjectRef: string, tooth: string, code: CodeableConcept) => Observation;
export declare function localCode(cc: unknown): string | undefined;
export declare function ensureTooth(teeth: Record<string, ToothRecord>, id: string): ToothRecord;
