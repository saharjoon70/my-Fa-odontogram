export type RestorationType = "none" | "crown" | "inlay" | "onlay" | "veneer" | "bridge";
export type RestorationMaterial = "none" | "emax" | "gold" | "gradia" | "zircon" | "metal" | "metal-ceramic" | "telescope" | "temporary";
export type ToothView = "front" | "occlusal";
export declare const RESTORATION_MATRIX: Record<Exclude<RestorationType, "none">, {
    materials: RestorationMaterial[];
    occlusalOnly?: boolean;
}>;
export declare function isValidRestoration(type: RestorationType, material: RestorationMaterial, view: ToothView): boolean;
export declare function composeRestorationLayers(type: RestorationType, material: RestorationMaterial, view: ToothView): string[];
export declare function allRestorationLayers(): string[];
export interface RestorationOption {
    restorationType: RestorationType;
    restorationMaterial: RestorationMaterial;
    labelKey: string;
    typeLabelKey?: string;
    materialLabelKey?: string;
    prefixKey?: string;
    prosthesis?: ProsthesisValue;
}
export type ProsthesisValue = "healing-abutment" | "locator" | "locator-denture" | "bar" | "bar-denture" | "removable-partial" | "removable-full";
export interface RestorationOptionsCtx {
    isImplant?: boolean;
    view?: ToothView;
    toothSelection?: string;
}
export declare function restorationOptions(view: ToothView, ctx?: RestorationOptionsCtx): RestorationOption[];
