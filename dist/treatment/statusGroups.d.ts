import { ToothStateField } from './statusToState';
export type StatusGroup = "presence" | "crown" | "caries" | "filling" | "pulp" | "apical" | "perio" | "wear" | "color" | "alignment" | "appliance" | "other";
export type StatusKind = "checkbox" | "radio";
export interface StatusRadioOption {
    value: string;
    label: string;
}
export interface StatusItem {
    id: string;
    label: string;
    field?: ToothStateField;
    /** مقدار — برای checkbox معمولاً true، برای enum رشته، برای compound object */
    value?: unknown;
    clearOnUncheck?: boolean;
}
export interface StatusRadio {
    /** فیلد engine */
    field: ToothStateField;
    label: string;
    options: StatusRadioOption[];
}
export interface StatusGroupMeta {
    id: StatusGroup;
    label: string;
    icon: string;
    items: StatusItem[];
    radios?: StatusRadio[];
}
export declare const STATUS_GROUPS: StatusGroupMeta[];
export declare function getStatusGroup(id: StatusGroup): StatusGroupMeta | undefined;
