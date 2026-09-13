/**
 * Pre-configured dental status presets for quick application of common
 * restorative scenarios (bridges, full-arch, partial/full removable, bar dentures).
 *
 * `arches` defines the FDI tooth layout; `options` is the array of presets
 * selectable from the "Extras" dropdown in the UI.
 */
export declare const STATUS_EXTRAS: {
    arches: {
        upper: number[];
        lower: number[];
        wisdom: {
            upper: number[];
            lower: number[];
        };
    };
    options: ({
        id: string;
        labelKey: string;
        type: string;
        teeth: number[];
        material: string;
        arch?: undefined;
        missingMaterial?: undefined;
        implants?: undefined;
        missing?: undefined;
    } | {
        id: string;
        labelKey: string;
        type: string;
        arch: string;
        material: string;
        missingMaterial: string;
        teeth?: undefined;
        implants?: undefined;
        missing?: undefined;
    } | {
        id: string;
        labelKey: string;
        type: string;
        arch: string;
        teeth?: undefined;
        material?: undefined;
        missingMaterial?: undefined;
        implants?: undefined;
        missing?: undefined;
    } | {
        id: string;
        labelKey: string;
        type: string;
        arch: string;
        implants: number[];
        missing: number[];
        teeth?: undefined;
        material?: undefined;
        missingMaterial?: undefined;
    })[];
};
