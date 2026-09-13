/**
 * Declarative description of how each serialized tooth field becomes one or
 * more FHIR Observations. The generic emitter in toFhir.ts reads this table,
 * so adding coverage means adding a row here.
 */
export type FieldKind = "enum" | "boolean" | "set" | "restoration";
interface BaseMapping {
    /** Key in the ToothRecord. */
    field: string;
    /** Local code for the finding TYPE (Observation.code). */
    findingCode: string;
    findingDisplay: string;
}
/**
 * Discriminated by `kind`. enum/set/restoration require a `valueGroup`, so the
 * emitter in toFhir.ts never needs a non-null assertion. `restoration` also
 * requires `surfacesField`; `boolean` carries no value decoding.
 */
export type FieldMapping = (BaseMapping & {
    kind: "enum";
    valueGroup: string;
    skipValue?: string;
}) | (BaseMapping & {
    kind: "set";
    valueGroup: string;
}) | (BaseMapping & {
    kind: "restoration";
    valueGroup: string;
    surfacesField: string;
    skipValue?: string;
}) | (BaseMapping & {
    kind: "boolean";
});
export declare const FIELD_MAPPINGS: FieldMapping[];
export {};
