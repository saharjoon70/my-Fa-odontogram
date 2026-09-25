import { Category } from './categories';
export interface TreatmentItem {
    id: string;
    label: string;
    category: Category;
    icon: string;
    /** لایه‌های SVG که باید فعال شوند (اختیاری — در applyTreatment استفاده می‌شود) */
    layers?: string[];
    needsSurface?: boolean;
    needsMaterial?: boolean;
    defaultPrice?: number;
}
export declare const TREATMENTS: TreatmentItem[];
export declare const MATERIALS: {
    id: string;
    label: string;
}[];
export declare const SURFACES: {
    id: string;
    label: string;
}[];
export declare function getTreatmentsByCategory(category: Category): TreatmentItem[];
export declare function getTreatmentById(id: string): TreatmentItem | undefined;
export declare function getMaterialLabel(id: string): string;
export declare function getSurfaceLabel(id: string): string;
