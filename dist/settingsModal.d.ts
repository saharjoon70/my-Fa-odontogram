import { Language } from './i18n/translations';
import { NumberingSystem } from './utils/numbering';
import { PulpDetailLevel, SecondaryCariesMode, RootCariesMode, RadiographicDepthMode, ToothDetailLevel, SurfaceNotation } from './odontogram';
/** Translation function signature (subset of `useI18n`'s `t`). */
export type TFn = (key: string, params?: Record<string, string | number>) => string;
/**
 * The full set of live setting values + change handlers the modal drives.
 */
export type SettingsState = {
    numbering: NumberingSystem;
    onNumbering: (value: NumberingSystem) => void;
    language: Language;
    onLanguage: (value: Language) => void;
    isDark: boolean;
    onToggleDark: () => void;
    toothInfo: boolean;
    onToothInfo: (value: boolean) => void;
    secondaryCariesMode: SecondaryCariesMode;
    onSecondaryCariesMode: (value: SecondaryCariesMode) => void;
    icdas: boolean;
    onIcdas: (value: boolean) => void;
    cariesDepth: boolean;
    onCariesDepth: (value: boolean) => void;
    rootCariesMode: RootCariesMode;
    onRootCariesMode: (value: RootCariesMode) => void;
    radiographicDepthMode: RadiographicDepthMode;
    onRadiographicDepthMode: (value: RadiographicDepthMode) => void;
    pulpLevel: PulpDetailLevel;
    onPulpLevel: (value: PulpDetailLevel) => void;
    wearDetailLevel: ToothDetailLevel;
    onWearDetailLevel: (value: ToothDetailLevel) => void;
    discolorationDetailLevel: ToothDetailLevel;
    onDiscolorationDetailLevel: (value: ToothDetailLevel) => void;
    surfaceNotation: SurfaceNotation;
    onSurfaceNotation: (value: SurfaceNotation) => void;
    notes: boolean;
    onNotes: (value: boolean) => void;
    showStatusCard: boolean;
    onShowStatusCard: (value: boolean) => void;
    showOrthoCard: boolean;
    onShowOrthoCard: (value: boolean) => void;
};
/** Declarative tab registry metadata (content lives in SettingsModal.vue). */
export type SettingsTabMeta = {
    id: string;
    titleKey: string;
};
export declare const SETTINGS_TABS: SettingsTabMeta[];
export declare const NUMBERING_OPTIONS: {
    value: NumberingSystem;
    labelKey: string;
}[];
export declare const LANGUAGE_OPTIONS: {
    value: Language;
    labelKey: string;
}[];
export declare const SECONDARY_OPTIONS: {
    value: SecondaryCariesMode;
    labelKey: string;
}[];
export declare const ROOT_OPTIONS: {
    value: RootCariesMode;
    labelKey: string;
}[];
export declare const RADIOGRAPHIC_OPTIONS: {
    value: RadiographicDepthMode;
    labelKey: string;
}[];
export declare const PULP_OPTIONS: {
    value: PulpDetailLevel;
    labelKey: string;
}[];
export declare const TOOTH_DETAIL_OPTIONS: {
    value: ToothDetailLevel;
    labelKey: string;
}[];
export declare const SURFACE_NOTATION_OPTIONS: {
    value: SurfaceNotation;
    labelKey: string;
}[];
